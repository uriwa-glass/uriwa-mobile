export interface UserSession {
  id: string;
  user_id: string;
  session_count: number;
  expiry_date: string; // ISO 8601 format string
  created_at: string;
  updated_at: string;
  // 필요시 추가 필드 (예: status: 'active' | 'expired' | 'frozen')
}

export type SessionTransactionType =
  | "deduction" // 일반 차감 (예: 수업 예약)
  | "addition" // 일반 추가 (예: 멤버십 구매, 관리자 부여)
  | "initial_grant" // 초기 부여
  | "refund" // 환불로 인한 세션 복구
  | "expiry_update" // 만료일 변경 (사용되지 않을 수 있음, 직접 업데이트)
  | "admin_adjustment" // 관리자 조정 (증가 또는 감소)
  | "deduction_failed_rollback" // 차감 실패로 인한 롤백
  | "deduction_rollback_seats_update_failed"; // 좌석 업데이트 실패로 인한 차감 롤백

export interface SessionTransaction {
  id: string;
  user_session_id: string | null; // 세션이 삭제된 경우 null이 될 수 있음
  user_id: string;
  transaction_type: SessionTransactionType;
  amount_changed: number; // 변경된 세션 수 (차감 시 음수, 증가 시 양수)
  reason: string | null;
  related_reservation_id: string | null;
  notes: string | null;
  created_at: string;
}
