-- Add foreign key relationship between course_applications and classes
-- This runs after classes table is created

-- Drop existing data if any (since this is a structural change)
TRUNCATE course_applications;

-- Change course_id column type to UUID and add foreign key constraint
ALTER TABLE course_applications 
DROP COLUMN course_id CASCADE,
ADD COLUMN course_id UUID REFERENCES classes(id) ON DELETE CASCADE;

-- Update the constraint to allow more course types
ALTER TABLE course_applications DROP CONSTRAINT IF EXISTS course_applications_course_type_check;
ALTER TABLE course_applications ADD CONSTRAINT course_applications_course_type_check 
CHECK (course_type IN ('stained-glass', 'glass-kiln', 'glass-craft', 'ceramics', 'art-therapy', 'workshop'));

-- Recreate the index for course_id
DROP INDEX IF EXISTS idx_course_applications_course_id;
CREATE INDEX idx_course_applications_course_id ON course_applications(course_id);
