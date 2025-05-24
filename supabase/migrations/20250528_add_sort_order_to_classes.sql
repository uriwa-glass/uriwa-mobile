-- classes 테이블에 sort_order 필드 추가
ALTER TABLE classes ADD COLUMN sort_order INTEGER DEFAULT 0;

-- 기존 데이터에 순서 설정 (CTE를 사용해서 순서 부여)
WITH ordered_classes AS (
  SELECT id, row_number() OVER (PARTITION BY category ORDER BY created_at) as new_order
  FROM classes
)
UPDATE classes 
SET sort_order = ordered_classes.new_order
FROM ordered_classes
WHERE classes.id = ordered_classes.id;

-- 인덱스 생성 (카테고리별 정렬 성능 향상)
CREATE INDEX IF NOT EXISTS idx_classes_category_sort_order ON classes(category, sort_order); 