# URIWA Mobile - 최종 데이터베이스 스키마

이 문서는 URIWA Mobile 애플리케이션의 최종 데이터베이스 스키마 상태를 정리한 것입니다.

## 핵심 테이블

### 1. user_profiles

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  membership_level TEXT NOT NULL DEFAULT 'REGULAR',
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2. classes

```sql
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES user_profiles(user_id),
  max_participants INTEGER DEFAULT 10 NOT NULL,
  price INTEGER DEFAULT 0 NOT NULL,
  duration INTEGER NOT NULL, -- 분 단위
  category TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

### 3. class_introductions

```sql
CREATE TABLE class_introductions (
  id UUID PRIMARY KEY,
  class_id UUID REFERENCES classes(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  highlight_points JSONB,
  curriculum JSONB,
  benefits TEXT,
  target_audience TEXT,
  instructor_id UUID,
  category VARCHAR(100),
  duration_weeks INTEGER,
  sessions_per_week INTEGER,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
```

### 4. class_schedules

```sql
CREATE TABLE class_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  max_participants INTEGER DEFAULT 10 NOT NULL,
  current_participants INTEGER DEFAULT 0 NOT NULL,
  status TEXT DEFAULT 'scheduled' NOT NULL, -- scheduled, cancelled, completed
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

### 5. reservations

```sql
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL, -- pending, confirmed, cancelled, completed
  payment_status TEXT DEFAULT 'unpaid' NOT NULL, -- unpaid, paid, refunded
  reserved_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

### 6. class_reservations

```sql
CREATE TABLE class_reservations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  schedule_id UUID NOT NULL,
  session_id UUID,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

## 부가 기능 테이블

### 7. cancellations

```sql
CREATE TABLE cancellations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason TEXT,
  refund_amount INTEGER,
  refund_status TEXT DEFAULT 'pending' NOT NULL, -- pending, processed, rejected
  cancelled_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

### 8. inquiries

```sql
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL, -- pending, answered, closed
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

### 9. inquiry_responses

```sql
CREATE TABLE inquiry_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE CASCADE NOT NULL,
  responder_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

### 10. inquiry_attachments

```sql
CREATE TABLE inquiry_attachments (
  id UUID PRIMARY KEY,
  inquiry_id UUID REFERENCES inquiries(id),
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);
```

### 11. inquiry_templates

```sql
CREATE TABLE inquiry_templates (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_fields JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
```

## 폼 관리 테이블

### 12. form_templates

```sql
CREATE TABLE form_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  schema JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

### 13. form_responses

```sql
CREATE TABLE form_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES form_templates(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  responses JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

### 14. form_submissions

```sql
CREATE TABLE form_submissions (
  id UUID PRIMARY KEY,
  template_id UUID REFERENCES form_templates(id),
  user_id UUID REFERENCES auth.users(id),
  submission_data JSONB NOT NULL,
  status TEXT DEFAULT 'submitted' NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
```

### 15. file_attachments

```sql
CREATE TABLE file_attachments (
  id UUID PRIMARY KEY,
  submission_id UUID REFERENCES form_submissions(id),
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);
```

## 갤러리 및 미디어 테이블

### 16. gallery_categories

```sql
CREATE TABLE gallery_categories (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
```

### 17. gallery_items

```sql
CREATE TABLE gallery_items (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES gallery_categories(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
```

### 18. testimonials

```sql
CREATE TABLE testimonials (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  class_id UUID REFERENCES classes(id),
  rating INTEGER NOT NULL,
  content TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false NOT NULL,
  is_approved BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
```

## 세션 및 거래 테이블

### 19. user_sessions

```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  class_id UUID REFERENCES classes(id),
  session_date TIMESTAMPTZ NOT NULL,
  attendance_status TEXT DEFAULT 'scheduled' NOT NULL,
  notes TEXT,
  instructor_feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
```

### 20. session_transactions

```sql
CREATE TABLE session_transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id UUID REFERENCES user_sessions(id),
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- payment, refund, credit
  payment_method TEXT,
  transaction_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
```

### 21. notifications

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- info, warning, success, error
  is_read BOOLEAN DEFAULT false NOT NULL,
  action_url TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);
```

## 트리거 및 함수

### create_profile_for_user()

```sql
CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_profile_trigger
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_user();
```

## RLS 정책

현재 개발 환경에서는 모든 테이블에 대해 `FOR ALL USING (true)` 정책이 적용되어 있습니다.

## 인덱스

### 성능 최적화 인덱스

- `idx_reservations_user_id`: reservations 테이블의 user_id
- `idx_reservations_class_id`: reservations 테이블의 class_id
- `idx_inquiries_user_id`: inquiries 테이블의 user_id
- `idx_class_schedules_class_id`: class_schedules 테이블의 class_id
- `idx_form_responses_template_id`: form_responses 테이블의 template_id
- `idx_form_responses_user_id`: form_responses 테이블의 user_id

## 주요 특징

1. **완전한 예약 시스템**: classes, class_schedules, reservations, class_reservations
2. **문의 관리**: inquiries, inquiry_responses, inquiry_attachments, inquiry_templates
3. **동적 폼 시스템**: form_templates, form_responses, form_submissions
4. **파일 관리**: file_attachments, gallery_items
5. **사용자 세션 추적**: user_sessions, session_transactions
6. **알림 시스템**: notifications
7. **후기 시스템**: testimonials
8. **취소 및 환불**: cancellations

이 스키마는 URIWA Mobile의 모든 핵심 기능을 지원하는 완전한 데이터베이스 구조입니다.
