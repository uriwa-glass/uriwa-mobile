-- Add address and phone columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;
