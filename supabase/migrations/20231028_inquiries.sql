-- 문의 테이블 생성
CREATE TABLE public.inquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' NOT NULL,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 문의 테이블 인덱스 생성
CREATE INDEX idx_inquiries_user_id ON public.inquiries(user_id);
CREATE INDEX idx_inquiries_status ON public.inquiries(status);
CREATE INDEX idx_inquiries_created_at ON public.inquiries(created_at);

-- 문의 테이블 RLS 설정
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 문의를 생성할 수 있도록 허용
CREATE POLICY "Anyone can create inquiries" 
ON public.inquiries
FOR INSERT
WITH CHECK (true);

-- 관리자는 모든 문의를 볼 수 있음
CREATE POLICY "Admins can view all inquiries" 
ON public.inquiries
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 사용자는 자신의 문의만 볼 수 있음
CREATE POLICY "Users can view their own inquiries" 
ON public.inquiries
FOR SELECT
USING (user_id = auth.uid());

-- 관리자만 문의를 수정할 수 있음
CREATE POLICY "Only admins can update inquiries" 
ON public.inquiries
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 관리자만 문의를 삭제할 수 있음
CREATE POLICY "Only admins can delete inquiries" 
ON public.inquiries
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 업데이트 시간 자동 업데이트를 위한 트리거
CREATE TRIGGER update_inquiries_updated_at
BEFORE UPDATE ON public.inquiries
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at(); 