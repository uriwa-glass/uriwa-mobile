-- 초기 데이터베이스 스키마 마이그레이션
-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set up audit fields function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 초기 스키마 설정은 다음 마이그레이션 파일에서 진행됩니다.
-- 00000000000001_users_schema.sql
-- 00000000000002_classes_schema.sql
-- 00000000000003_gallery_schema.sql
-- 00000000000004_inquiry_schema.sql
-- 00000000000005_rls_policies.sql 