-- Storage 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('class-thumbnails', 'class-thumbnails', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('exhibition-images', 'exhibition-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('portfolio-images', 'portfolio-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

-- Storage 정책 설정 (개발 중에는 모든 접근 허용)
-- 1. 클래스 썸네일
CREATE POLICY "클래스 썸네일 모든 접근 허용" 
ON storage.objects FOR ALL 
USING (bucket_id = 'class-thumbnails')
WITH CHECK (bucket_id = 'class-thumbnails');

-- 2. 전시작품 이미지
CREATE POLICY "전시작품 이미지 모든 접근 허용" 
ON storage.objects FOR ALL 
USING (bucket_id = 'exhibition-images')
WITH CHECK (bucket_id = 'exhibition-images');

-- 3. 포트폴리오 이미지
CREATE POLICY "포트폴리오 이미지 모든 접근 허용" 
ON storage.objects FOR ALL 
USING (bucket_id = 'portfolio-images')
WITH CHECK (bucket_id = 'portfolio-images'); 