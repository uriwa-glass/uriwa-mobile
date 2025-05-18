-- 사용자 알림을 위한 테이블 생성

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('low_session_balance', 'session_expiry_reminder', 'new_class_announcement', 'reservation_confirmed', 'reservation_cancelled', 'general_info')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- 알림과 관련된 추가 데이터 (예: 클래스 ID, 세션 만료일 등)
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- RLS 정책 활성화
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 정책 설정: 사용자는 자신의 알림만 볼 수 있고, 자신의 알림만 읽음 처리할 수 있음
CREATE POLICY "사용자는 자신의 알림만 조회 가능"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "사용자는 자신의 알림만 읽음 처리 가능"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND is_read = TRUE AND read_at IS NOT NULL);
  -- 참고: is_read를 FALSE로 되돌리는 것은 현재 정책상 불가능. 필요시 별도 정책 또는 관리자 기능.

-- 시스템 또는 관리자가 알림을 생성할 수 있도록 하는 정책 (서비스 역할 사용 등 고려)
-- 우선은 비워두고, Edge Function 등에서 서비스 키를 사용할 경우 RLS를 우회하거나 별도 정책 필요.
-- CREATE POLICY "관리자 또는 시스템이 알림 생성 가능" ... 