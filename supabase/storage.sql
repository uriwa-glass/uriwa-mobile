-- 미디어 버킷 생성
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- 갤러리 유형에 대한 MIME 타입 체크 함수
CREATE OR REPLACE FUNCTION public.is_valid_image_type(content_type text)
RETURNS boolean AS $$
BEGIN
  RETURN content_type IN ('image/jpeg', 'image/png', 'image/gif', 'image/webp');
END
$$ LANGUAGE plpgsql;

-- 미디어 버킷의 접근 정책 설정
-- 익명 사용자는 읽기만 가능
CREATE POLICY "Media items are publicly accessible" 
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- 인증된 사용자만 미디어 업로드 가능
CREATE POLICY "Authenticated users can upload media" 
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media' AND 
  auth.role() = 'authenticated' AND
  public.is_valid_image_type(content_type)
);

-- 자신이 업로드한 미디어만 업데이트 가능
CREATE POLICY "Users can update their own media" 
ON storage.objects FOR UPDATE
USING (bucket_id = 'media' AND auth.uid() = owner)
WITH CHECK (bucket_id = 'media' AND auth.uid() = owner);

-- 관리자는 모든 미디어 업데이트 가능
CREATE POLICY "Admins can update all media" 
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'media' AND 
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 자신이 업로드한 미디어만 삭제 가능
CREATE POLICY "Users can delete their own media" 
ON storage.objects FOR DELETE
USING (bucket_id = 'media' AND auth.uid() = owner);

-- 관리자는 모든 미디어 삭제 가능
CREATE POLICY "Admins can delete all media" 
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media' AND 
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
); 