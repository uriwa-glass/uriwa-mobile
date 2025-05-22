-- 저장 프로시저: create_user_profile
-- 개발 환경에서 RLS 정책을 우회하고 user_profiles 테이블에 데이터를 직접 삽입하는 함수
CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_id UUID,
  p_user_id UUID,
  p_display_name TEXT,
  p_full_name TEXT DEFAULT '',
  p_avatar_url TEXT DEFAULT '',
  p_membership_level TEXT DEFAULT 'REGULAR',
  p_role TEXT DEFAULT 'user'
) RETURNS VOID AS $$
BEGIN
  -- 중복 체크
  IF EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = p_user_id) THEN
    RETURN;
  END IF;

  -- service role을 사용하여 RLS 우회하고 데이터 삽입
  INSERT INTO public.user_profiles (
    id,
    user_id,
    display_name,
    full_name,
    avatar_url,
    membership_level,
    role,
    created_at,
    updated_at
  ) VALUES (
    p_id,
    p_user_id,
    p_display_name,
    p_full_name,
    p_avatar_url,
    p_membership_level,
    p_role,
    NOW(),
    NOW()
  );

  -- 결과 로깅
  RAISE NOTICE 'Profile created for user: %', p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 함수에 대한 주석 추가
COMMENT ON FUNCTION public.create_user_profile(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT) IS
'개발 환경에서 RLS 정책을 우회하고 user_profiles 테이블에 데이터를 직접 삽입하는 함수.
SECURITY DEFINER를 사용하여 슈퍼유저 권한으로 실행됩니다.';

-- 함수에 실행 권한 부여
GRANT EXECUTE ON FUNCTION public.create_user_profile TO anon, authenticated, service_role;
