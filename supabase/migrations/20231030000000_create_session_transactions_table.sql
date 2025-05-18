-- 세션 트랜잭션 기록을 위한 테이블 생성

CREATE TABLE IF NOT EXISTS public.session_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_session_id UUID REFERENCES public.user_sessions(id) ON DELETE SET NULL, -- 세션이 삭제되어도 기록은 남도록 SET NULL 또는 CASCADE 고민 필요
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deduction', 'addition', 'expiry_update', 'initial_grant', 'refund', 'admin_adjustment')),
  amount_changed INTEGER NOT NULL, -- 변경된 세션 수 (차감 시 음수, 증가 시 양수)
  reason TEXT, -- 예: "클래스 예약 (ID: schedule_id)", "관리자 부여", "멤버십 구매 (ID: purchase_id)", "세션 만료"
  related_reservation_id UUID REFERENCES public.class_reservations(id) ON DELETE SET NULL,
  notes TEXT, -- 관리자 메모 등 추가 정보
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_session_transactions_user_id ON public.session_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_session_transactions_user_session_id ON public.session_transactions(user_session_id);
CREATE INDEX IF NOT EXISTS idx_session_transactions_transaction_type ON public.session_transactions(transaction_type);

-- RLS 정책 활성화
ALTER TABLE public.session_transactions ENABLE ROW LEVEL SECURITY;

-- 정책 설정: 사용자는 자신의 세션 트랜잭션만 볼 수 있고, 관리자는 모든 트랜잭션을 볼 수 있음
CREATE POLICY "사용자는 자신의 세션 트랜잭션만 조회 가능"
  ON public.session_transactions FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "관리자만 세션 트랜잭션 생성 가능"
  ON public.session_transactions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- 참고: 세션 차감/증가 로직은 보통 백엔드 함수(예: Supabase Edge Functions) 또는 트리거 내에서 이 테이블에 기록.
-- 직접적인 INSERT 외에 다른 주체(예: 시스템 프로세스)에 의한 INSERT가 필요하다면 해당 역할에 맞는 정책 추가 필요.
-- 예를 들어, 예약 시스템이 직접 트랜잭션을 기록해야 한다면, 해당 시스템의 서비스 역할에 대한 INSERT 권한을 부여해야 함.
-- 현재는 관리자만 생성 가능하도록 설정함. 실제 서비스 로직에서 이 부분을 어떻게 처리할지 결정 필요. 