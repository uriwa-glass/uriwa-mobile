-- 사용자 프로필 생성 트리거 함수 수정 (중복 방지)
CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 이미 프로필이 존재하는지 확인 후 삽입
  INSERT INTO public.user_profiles (user_id, display_name, full_name, avatar_url)
  VALUES (
    NEW.id, 
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'nickname',
      split_part(NEW.email, '@', 1)
    ), 
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name'
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = COALESCE(
      EXCLUDED.display_name,
      user_profiles.display_name
    ),
    full_name = COALESCE(
      EXCLUDED.full_name,
      user_profiles.full_name
    ),
    avatar_url = COALESCE(
      EXCLUDED.avatar_url,
      user_profiles.avatar_url
    ),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 기존 트리거가 있다면 교체
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;

-- 새로운 트리거 생성
CREATE TRIGGER create_profile_trigger
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_user(); 