-- course_applications 테이블의 course_type CHECK 제약 조건 업데이트

-- 기존 제약 조건 삭제
ALTER TABLE course_applications DROP CONSTRAINT IF EXISTS course_applications_course_type_check;

-- 새로운 제약 조건 추가 (한국어 카테고리명 포함)
ALTER TABLE course_applications ADD CONSTRAINT course_applications_course_type_check 
CHECK (course_type IN (
  'stained-glass', 
  'glass-kiln', 
  '스테인드글라스', 
  '유리가마', 
  '창업과정', 
  '체험과정', 
  '키즈클래스', 
  '특별과정', 
  '워크샵'
)); 