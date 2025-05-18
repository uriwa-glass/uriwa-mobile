-- 폼 템플릿 테이블 생성
CREATE TABLE public.form_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  fields JSONB NOT NULL,
  version INTEGER DEFAULT 1 NOT NULL,
  notification_emails TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 폼 제출 테이블 생성
CREATE TABLE public.form_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  template_id UUID REFERENCES public.form_templates(id),
  user_id UUID REFERENCES auth.users(id),
  data JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'submitted' NOT NULL,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 파일 첨부 테이블 생성
CREATE TABLE public.file_attachments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  submission_id UUID REFERENCES public.form_submissions(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 인덱스 생성
CREATE INDEX idx_form_templates_created_by ON public.form_templates(created_by);
CREATE INDEX idx_form_templates_is_active ON public.form_templates(is_active);
CREATE INDEX idx_form_submissions_template_id ON public.form_submissions(template_id);
CREATE INDEX idx_form_submissions_user_id ON public.form_submissions(user_id);
CREATE INDEX idx_form_submissions_status ON public.form_submissions(status);
CREATE INDEX idx_file_attachments_submission_id ON public.file_attachments(submission_id);

-- RLS 정책 설정
ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_attachments ENABLE ROW LEVEL SECURITY;

-- 폼 템플릿 정책
-- 모든 사용자가 활성화된 템플릿을 볼 수 있음
CREATE POLICY "Anyone can view active form templates" 
ON public.form_templates
FOR SELECT
USING (is_active = TRUE);

-- 관리자는 모든 템플릿을 볼 수 있음
CREATE POLICY "Admins can view all form templates" 
ON public.form_templates
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 관리자만 템플릿을 생성/수정/삭제할 수 있음
CREATE POLICY "Only admins can insert form templates" 
ON public.form_templates
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can update form templates" 
ON public.form_templates
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can delete form templates" 
ON public.form_templates
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 폼 제출 정책
-- 인증된 사용자는 폼을 제출할 수 있음
CREATE POLICY "Authenticated users can insert submissions"
ON public.form_submissions
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 사용자는 자신의 제출만 볼 수 있음
CREATE POLICY "Users can view their own submissions"
ON public.form_submissions
FOR SELECT
USING (user_id = auth.uid());

-- 관리자는 모든 제출을 볼 수 있음
CREATE POLICY "Admins can view all submissions"
ON public.form_submissions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 관리자만 제출을 업데이트할 수 있음
CREATE POLICY "Only admins can update submissions"
ON public.form_submissions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 파일 첨부 정책
-- 인증된 사용자는 파일을 첨부할 수 있음
CREATE POLICY "Authenticated users can insert attachments"
ON public.file_attachments
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM form_submissions
    WHERE id = submission_id AND user_id = auth.uid()
  )
);

-- 사용자는 자신이 업로드한 파일만 볼 수 있음
CREATE POLICY "Users can view their own attachments"
ON public.file_attachments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM form_submissions
    WHERE id = submission_id AND user_id = auth.uid()
  )
);

-- 관리자는 모든 파일을 볼 수 있음
CREATE POLICY "Admins can view all attachments"
ON public.file_attachments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 트리거 설정
CREATE TRIGGER update_form_templates_updated_at
BEFORE UPDATE ON public.form_templates
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_form_submissions_updated_at
BEFORE UPDATE ON public.form_submissions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at(); 