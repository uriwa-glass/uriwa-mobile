-- 수업 소개 테이블 생성
CREATE TABLE public.class_introductions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  highlight_points JSONB,
  curriculum JSONB,
  benefits TEXT,
  target_audience TEXT,
  instructor_id UUID REFERENCES auth.users(id),
  category VARCHAR(100),
  duration_weeks INTEGER,
  sessions_per_week INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 수업 소개에 인덱스 추가
CREATE INDEX idx_class_intros_class_id ON public.class_introductions(class_id);
CREATE INDEX idx_class_intros_instructor_id ON public.class_introductions(instructor_id);
CREATE INDEX idx_class_intros_category ON public.class_introductions(category);

-- 수업 소개 RLS 정책 설정
ALTER TABLE public.class_introductions ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 수업 소개를 볼 수 있도록 허용
CREATE POLICY "Class introductions are viewable by everyone" 
ON public.class_introductions
FOR SELECT
USING (true);

-- 관리자만 수업 소개를 생성/수정/삭제할 수 있도록 허용
CREATE POLICY "Admins can create class introductions" 
ON public.class_introductions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update class introductions" 
ON public.class_introductions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete class introductions" 
ON public.class_introductions
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 트리거 함수: 수업 소개 업데이트 시간 설정
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 수업 소개 업데이트 트리거 설정
CREATE TRIGGER update_class_introductions_updated_at
BEFORE UPDATE ON public.class_introductions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at(); 