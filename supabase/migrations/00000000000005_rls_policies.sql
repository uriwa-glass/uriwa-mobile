-- Row Level Security (RLS) 정책 설정

-- RLS 활성화
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_responses ENABLE ROW LEVEL SECURITY;

-- 사용자 프로필 정책 설정
-- 모든 사용자는 자신의 프로필만 볼 수 있고, 관리자는 모든 프로필을 볼 수 있음
CREATE POLICY "사용자는 자신의 프로필만 볼 수 있음" ON public.user_profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "사용자는 자신의 프로필만 업데이트할 수 있음" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 세션 정책 설정
-- 사용자는 자신의 세션만 볼 수 있고, 관리자는 모든 세션을 볼 수 있음
CREATE POLICY "사용자는 자신의 세션만 볼 수 있음" ON public.user_sessions
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "관리자만 세션을 생성할 수 있음" ON public.user_sessions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
  );
  
CREATE POLICY "관리자만 세션을 업데이트할 수 있음" ON public.user_sessions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 클래스 정책 설정
-- 모든 인증된 사용자는 클래스를 볼 수 있지만, 관리자만 생성/수정/삭제할 수 있음
CREATE POLICY "인증된 사용자는 클래스를 볼 수 있음" ON public.classes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "관리자만 클래스를 관리할 수 있음" ON public.classes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 예약 정책 설정
-- 사용자는 자신의 예약만 볼 수 있고, 관리자는 모든 예약을 볼 수 있음
CREATE POLICY "사용자는 자신의 예약만 볼 수 있음" ON public.class_reservations
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "사용자는 자신의 예약만 생성할 수 있음" ON public.class_reservations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "사용자는 자신의 예약만 업데이트할 수 있음" ON public.class_reservations
  FOR UPDATE USING (auth.uid() = user_id);

-- 갤러리 정책 설정
-- 모든 인증된 사용자는 갤러리 항목을 볼 수 있지만, 관리자만 생성/수정/삭제할 수 있음
CREATE POLICY "인증된 사용자는 갤러리 항목을 볼 수 있음" ON public.gallery_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "관리자만 갤러리 항목을 관리할 수 있음" ON public.gallery_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 문의 정책 설정
-- 사용자는 자신의 문의만 볼 수 있고, 관리자는 모든 문의를 볼 수 있음
CREATE POLICY "사용자는 자신의 문의만 볼 수 있음" ON public.inquiries
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "사용자는 자신의 문의만 생성할 수 있음" ON public.inquiries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 다른 테이블에 대한 정책은 유사하게 추가할 수 있음 