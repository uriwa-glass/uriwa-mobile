-- Fix RLS policies to prevent infinite recursion

-- Drop all existing policies that might cause infinite recursion
DROP POLICY IF EXISTS "관리자는 모든 프로필을 볼 수 있음" ON user_profiles;
DROP POLICY IF EXISTS "사용자는 자신의 프로필을 볼 수 있음" ON user_profiles;
DROP POLICY IF EXISTS "사용자는 자신의 프로필을 업데이트할 수 있음" ON user_profiles;
DROP POLICY IF EXISTS "관리자는 모든 프로필을 관리할 수 있음" ON user_profiles;
DROP POLICY IF EXISTS "사용자는 자신의 프로필을 생성할 수 있음" ON user_profiles;

-- Disable RLS temporarily to clear any cached policies
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies for development
CREATE POLICY "allow_all_select" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "allow_all_insert" ON user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_update" ON user_profiles FOR UPDATE USING (true);
CREATE POLICY "allow_all_delete" ON user_profiles FOR DELETE USING (true);
