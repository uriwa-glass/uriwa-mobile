import { z } from "zod";
import { ClassSchedule, classScheduleSchema } from "./class";
import { UserProfile, userProfileSchema } from "./user";

// 예약 상태 스키마
export const reservationStatusSchema = z.enum(["confirmed", "cancelled", "attended", "no-show"]);
export type ReservationStatus = z.infer<typeof reservationStatusSchema>;

// 결제 방법 스키마
export const paymentMethodSchema = z.enum(["card", "cash", "transfer", "session", "free"]);
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

// 예약 정보 스키마
export const reservationSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  class_schedule_id: z.string(),
  status: reservationStatusSchema,
  student_count: z.number().int().positive(),
  total_price: z.number(),
  payment_method: paymentMethodSchema.optional(),
  payment_id: z.string().optional(),
  special_requests: z.string().optional(),
  class_schedules: z.lazy(() => classScheduleSchema).optional(),
  users: z.lazy(() => userProfileSchema).optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

// 예약 요청 스키마
export const reservationRequestSchema = z.object({
  class_schedule_id: z.string(),
  student_count: z.number().int().positive(),
  payment_method: paymentMethodSchema,
  special_requests: z.string().optional(),
});

// 예약 응답 스키마
export const reservationResponseSchema = z.object({
  success: z.boolean(),
  reservation: reservationSchema.optional(),
  message: z.string().optional(),
  error: z.string().optional(),
});

// 취소 상태 스키마
export const cancellationRefundStatusSchema = z.enum(["pending", "completed", "failed"]);
export type CancellationRefundStatus = z.infer<typeof cancellationRefundStatusSchema>;

// 취소 정보 스키마
export const cancellationSchema = z.object({
  id: z.string(),
  reservation_id: z.string(),
  cancelled_by_id: z.string(),
  reason: z.string().optional(),
  refund_amount: z.number(),
  refund_rate: z.number(),
  refund_status: cancellationRefundStatusSchema,
  reservations: z.lazy(() => reservationSchema).optional(),
  is_admin_cancellation: z.boolean().optional(),
  notification_sent: z.boolean().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

// 취소 정책 시간 기반 스키마
export const timeCancellationPolicySchema = z.object({
  hours: z.number(),
  refundRate: z.number(),
  description: z.string(),
  message: z.string(),
});

// 회원 등급별 취소 정책 스키마
export const membershipCancellationPolicySchema = z.object({
  description: z.string(),
  lateRefundRate: z.number(),
  graceMinutes: z.number(),
});

// 수업 유형별 취소 정책 스키마
export const classTypeCancellationPolicySchema = z.object({
  description: z.string(),
  modifier: z.number(),
});

// 취소 정책 전체 스키마
export const cancellationPoliciesSchema = z.object({
  TIME_BASED: z.object({
    EARLY: timeCancellationPolicySchema,
    STANDARD: timeCancellationPolicySchema,
    LATE: timeCancellationPolicySchema,
    AFTER_START: timeCancellationPolicySchema,
  }),
  MEMBERSHIP_LEVEL: z.object({
    REGULAR: membershipCancellationPolicySchema,
    SILVER: membershipCancellationPolicySchema,
    GOLD: membershipCancellationPolicySchema,
    VIP: membershipCancellationPolicySchema,
  }),
  CLASS_TYPE: z.object({
    REGULAR: classTypeCancellationPolicySchema,
    SPECIAL: classTypeCancellationPolicySchema,
    WORKSHOP: classTypeCancellationPolicySchema,
    EVENT: classTypeCancellationPolicySchema,
  }),
});

// 취소 가능 여부 및 환불 정보 스키마
export const cancellationCheckSchema = z.object({
  canCancel: z.boolean(),
  policy: timeCancellationPolicySchema.optional(),
  membershipLevel: z.string().optional(),
  classType: z.string().optional(),
  refundRate: z.number(),
  refundAmount: z.number(),
  timeToClass: z.number().optional(),
  message: z.string(),
});

// 취소 요청 스키마
export const cancellationRequestSchema = z.object({
  reservation_id: z.string(),
  reason: z.string().optional(),
});

// 취소 응답 스키마
export const cancellationResponseSchema = z.object({
  success: z.boolean(),
  cancellation: cancellationSchema.optional(),
  message: z.string().optional(),
  error: z.string().optional(),
});

// 취소 통계 스키마
export const cancellationStatsSchema = z.object({
  totalCancellations: z.number(),
  totalRefundAmount: z.number(),
  cancellationRate: z.number(),
  byCancellationReason: z.array(z.object({ reason: z.string(), count: z.number() })),
  byClassType: z.array(z.object({ type: z.string(), count: z.number() })),
  byTimeToClass: z.array(z.object({ hours: z.number(), count: z.number() })),
  byMonth: z.array(z.object({ month: z.string(), count: z.number(), amount: z.number() })),
});

// 취소 분석 필터 스키마
export const cancellationAnalyticsFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  classType: z.string().optional(),
  userId: z.string().optional(),
  timeRange: z.string().optional(),
});

// 타입 추출
export type Reservation = z.infer<typeof reservationSchema>;
export type ReservationRequest = z.infer<typeof reservationRequestSchema>;
export type ReservationResponse = z.infer<typeof reservationResponseSchema>;
export type Cancellation = z.infer<typeof cancellationSchema>;
export type TimeCancellationPolicy = z.infer<typeof timeCancellationPolicySchema>;
export type MembershipCancellationPolicy = z.infer<typeof membershipCancellationPolicySchema>;
export type ClassTypeCancellationPolicy = z.infer<typeof classTypeCancellationPolicySchema>;
export type CancellationPolicies = z.infer<typeof cancellationPoliciesSchema>;
export type CancellationCheck = z.infer<typeof cancellationCheckSchema>;
export type CancellationRequest = z.infer<typeof cancellationRequestSchema>;
export type CancellationResponse = z.infer<typeof cancellationResponseSchema>;
export type CancellationStats = z.infer<typeof cancellationStatsSchema>;
export type CancellationAnalyticsFilter = z.infer<typeof cancellationAnalyticsFilterSchema>;
