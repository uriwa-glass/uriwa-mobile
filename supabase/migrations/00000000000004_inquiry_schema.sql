-- 문의 관련 테이블 스키마

-- inquiry_templates 테이블 생성
CREATE TABLE IF NOT EXISTS public.inquiry_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  fields JSONB NOT NULL, -- 템플릿에 필요한 필드 정의
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- updated_at 자동 갱신을 위한 트리거 생성
CREATE TRIGGER set_timestamp_inquiry_templates
BEFORE UPDATE ON public.inquiry_templates
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- inquiries 테이블 생성
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  template_id UUID REFERENCES public.inquiry_templates(id) ON DELETE SET NULL,
  content JSONB NOT NULL, -- 사용자가 제출한 데이터
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'answered', 'closed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- updated_at 자동 갱신을 위한 트리거 생성
CREATE TRIGGER set_timestamp_inquiries
BEFORE UPDATE ON public.inquiries
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- inquiry_attachments 테이블 생성
CREATE TABLE IF NOT EXISTS public.inquiry_attachments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  inquiry_id UUID REFERENCES public.inquiries(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- inquiry_responses 테이블 생성
CREATE TABLE IF NOT EXISTS public.inquiry_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  inquiry_id UUID REFERENCES public.inquiries(id) ON DELETE CASCADE NOT NULL,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- 응답한 관리자
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE, -- 내부용 메모인지 여부
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
); 