-- 먼저 user_profiles 테이블의 user_id에 unique constraint 추가
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);

-- 수업 테이블
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES user_profiles(user_id),
  max_participants INTEGER NOT NULL DEFAULT 10,
  price INTEGER NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL, -- 분 단위
  category TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 예약 테이블
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, cancelled, completed
  payment_status TEXT NOT NULL DEFAULT 'unpaid', -- unpaid, paid, refunded
  reserved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 취소 내역 테이블
CREATE TABLE IF NOT EXISTS cancellations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason TEXT,
  refund_amount INTEGER,
  refund_status TEXT NOT NULL DEFAULT 'pending', -- pending, processed, rejected
  cancelled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 문의 테이블
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, answered, closed
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 문의 답변 테이블
CREATE TABLE IF NOT EXISTS inquiry_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE CASCADE NOT NULL,
  responder_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 수업 일정 테이블
CREATE TABLE IF NOT EXISTS class_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 10,
  current_participants INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, cancelled, completed
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 폼 템플릿 테이블
CREATE TABLE IF NOT EXISTS form_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  schema JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 폼 응답 테이블
CREATE TABLE IF NOT EXISTS form_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES form_templates(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  responses JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 테이블에 대한 RLS 정책 설정
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cancellations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiry_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;

-- 개발 중 모든 테이블에 대해 임시로 모든 접근 허용
CREATE POLICY "개발 중 모든 접근 허용" ON classes FOR ALL USING (true);
CREATE POLICY "개발 중 모든 접근 허용" ON reservations FOR ALL USING (true);
CREATE POLICY "개발 중 모든 접근 허용" ON cancellations FOR ALL USING (true);
CREATE POLICY "개발 중 모든 접근 허용" ON inquiries FOR ALL USING (true);
CREATE POLICY "개발 중 모든 접근 허용" ON inquiry_responses FOR ALL USING (true);
CREATE POLICY "개발 중 모든 접근 허용" ON class_schedules FOR ALL USING (true);
CREATE POLICY "개발 중 모든 접근 허용" ON form_templates FOR ALL USING (true);
CREATE POLICY "개발 중 모든 접근 허용" ON form_responses FOR ALL USING (true);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_class_id ON reservations(class_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_user_id ON inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_class_schedules_class_id ON class_schedules(class_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_template_id ON form_responses(template_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_user_id ON form_responses(user_id);

-- 샘플 데이터 추가 (개발 테스트용)
INSERT INTO classes (title, description, max_participants, price, duration, category, thumbnail_url)
VALUES 
('요가 클래스', '초보자를 위한 요가 클래스입니다', 8, 50000, 60, '웰빙', 'https://example.com/yoga.jpg'),
('필라테스 기초', '코어 강화를 위한 필라테스 클래스', 10, 60000, 90, '웰빙', 'https://example.com/pilates.jpg'),
('명상 워크샵', '스트레스 해소를 위한 명상 기법', 15, 40000, 45, '정신건강', 'https://example.com/meditation.jpg'); 