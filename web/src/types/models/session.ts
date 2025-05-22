import { z } from "zod";

// 사용자 세션 스키마
export const userSessionSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  session_count: z.number().int(),
  expiry_date: z.string(), // ISO 8601 format string
  created_at: z.string(),
  updated_at: z.string(),
  // 필요시 추가 필드 스키마 (status 등)
});

// 세션 트랜잭션 타입 스키마
export const sessionTransactionTypeSchema = z.enum([
  "deduction", // 일반 차감 (예: 수업 예약)
  "addition", // 일반 추가 (예: 멤버십 구매, 관리자 부여)
  "initial_grant", // 초기 부여
  "refund", // 환불로 인한 세션 복구
  "expiry_update", // 만료일 변경 (사용되지 않을 수 있음, 직접 업데이트)
  "admin_adjustment", // 관리자 조정 (증가 또는 감소)
  "deduction_failed_rollback", // 차감 실패로 인한 롤백
  "deduction_rollback_seats_update_failed", // 좌석 업데이트 실패로 인한 차감 롤백
]);

// 세션 트랜잭션 스키마
export const sessionTransactionSchema = z.object({
  id: z.string(),
  user_session_id: z.string().nullable(), // 세션이 삭제된 경우 null이 될 수 있음
  user_id: z.string(),
  transaction_type: sessionTransactionTypeSchema,
  amount_changed: z.number(), // 변경된 세션 수 (차감 시 음수, 증가 시 양수)
  reason: z.string().nullable(),
  related_reservation_id: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.string(),
});

// 타입 추출
export type UserSession = z.infer<typeof userSessionSchema>;
export type SessionTransactionType = z.infer<typeof sessionTransactionTypeSchema>;
export type SessionTransaction = z.infer<typeof sessionTransactionSchema>;
