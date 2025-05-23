-- Reset RLS policies completely for user_profiles table

-- Step 1: Drop ALL existing policies on user_profiles
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'user_profiles'
    LOOP
        EXECUTE format('DROP POLICY %I ON %I.%I', 
                       policy_record.policyname, 
                       policy_record.schemaname, 
                       policy_record.tablename);
    END LOOP;
END $$;

-- Step 2: Completely disable RLS
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Step 3: Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create one simple policy that allows everything
CREATE POLICY "allow_all_operations" ON user_profiles 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Verify no other policies exist
-- (This query will help us check in the logs)
SELECT 'Current policies on user_profiles:' as info;
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'user_profiles';
