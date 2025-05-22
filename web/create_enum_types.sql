-- membership_level enum 타입 생성
DO $$
BEGIN
    -- membership_level enum 타입이 존재하는지 확인
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_level') THEN
        -- 타입 생성
        CREATE TYPE public.membership_level AS ENUM ('FREE', 'REGULAR', 'PREMIUM', 'ADMIN');
        RAISE NOTICE 'Created membership_level enum type';
    ELSE
        RAISE NOTICE 'membership_level enum type already exists';
    END IF;

    -- user_role enum 타입이 존재하는지 확인
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        -- 타입 생성
        CREATE TYPE public.user_role AS ENUM ('user', 'admin', 'moderator');
        RAISE NOTICE 'Created user_role enum type';
    ELSE
        RAISE NOTICE 'user_role enum type already exists';
    END IF;
END
$$; 