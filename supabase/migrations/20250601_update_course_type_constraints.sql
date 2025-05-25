-- Update course_type constraint to include all supported course types

-- Drop existing constraint
ALTER TABLE course_applications DROP CONSTRAINT IF EXISTS course_applications_course_type_check;

-- Add updated constraint with all supported course types
ALTER TABLE course_applications ADD CONSTRAINT course_applications_course_type_check 
CHECK (course_type IN (
  'stained-glass', 
  'glass-kiln', 
  'glass-craft', 
  'ceramics', 
  'art-therapy', 
  'workshop',
  'entrepreneurship',
  'experience', 
  'kids-class',
  'special-course'
)); 