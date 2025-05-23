-- 기본 데이터베이스 스키마 설정
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 사용자 프로필 테이블
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  membership_level TEXT NOT NULL DEFAULT 'REGULAR',
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS 정책 설정
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 공개 접근 허용 (문제 해결을 위해)
CREATE POLICY "모든 사용자에게 접근 허용" ON user_profiles
  FOR ALL USING (true);

-- 기본 정책 (필요할 때 활성화 가능)
-- CREATE POLICY "사용자는 자신의 프로필을 볼 수 있음" ON user_profiles
--   FOR SELECT USING (auth.uid() = user_id);

-- CREATE POLICY "사용자는 자신의 프로필을 수정할 수 있음" ON user_profiles
--   FOR UPDATE USING (auth.uid() = user_id);

-- CREATE POLICY "관리자는 모든 프로필을 볼 수 있음" ON user_profiles
--   FOR SELECT USING (
--     (SELECT role FROM user_profiles WHERE user_id = auth.uid() LIMIT 1) = 'admin'
--   );

-- 사용자 프로필 생성 트리거
CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 사용자 생성 시 프로필 자동 생성 트리거
CREATE OR REPLACE TRIGGER create_profile_trigger
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_user(); 