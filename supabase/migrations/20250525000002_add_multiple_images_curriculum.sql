-- classes 테이블에 이미지 배열과 커리큘럼 배열 추가
ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS curriculum TEXT[] DEFAULT '{}';

-- 기존 thumbnail_url 데이터를 image_urls로 마이그레이션
UPDATE classes 
SET image_urls = ARRAY[thumbnail_url] 
WHERE thumbnail_url IS NOT NULL AND thumbnail_url != '';

-- 기존 thumbnail_url 컬럼은 유지 (호환성을 위해)
-- 향후 완전히 제거할 예정이면 주석 해제
-- ALTER TABLE classes DROP COLUMN IF EXISTS thumbnail_url; 