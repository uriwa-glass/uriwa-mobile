import { ClassSchedule } from "./class";
import { UserProfile } from "./user";

// 예약 상태
export type ReservationStatus = "confirmed" | "cancelled" | "attended" | "no-show";

// 결제 방법
export type PaymentMethod = "card" | "cash" | "transfer" | "session" | "free";

// 예약 정보
export interface Reservation {
  id: string;
  user_id: string;
  class_schedule_id: string;
  status: ReservationStatus;
  student_count: number;
  total_price: number;
  payment_method?: PaymentMethod;
  payment_id?: string;
  special_requests?: string;
  class_schedules?: ClassSchedule;
  users?: UserProfile;
  created_at: string;
  updated_at: string;
}

// 예약 요청
export interface ReservationRequest {
  class_schedule_id: string;
  student_count: number;
  payment_method: PaymentMethod;
  special_requests?: string;
}

// 예약 응답
export interface ReservationResponse {
  success: boolean;
  reservation?: Reservation;
  message?: string;
  error?: string;
}

// 취소 상태
export type CancellationRefundStatus = "pending" | "completed" | "failed";

// 취소 정보
export interface Cancellation {
  id: string;
  reservation_id: string;
  cancelled_by_id: string;
  reason?: string;
  refund_amount: number;
  refund_rate: number;
  refund_status: CancellationRefundStatus;
  reservations?: Reservation;
  is_admin_cancellation?: boolean;
  notification_sent?: boolean;
  created_at: string;
  updated_at: string;
}

// 취소 정책 시간 기반
export interface TimeCancellationPolicy {
  hours: number;
  refundRate: number;
  description: string;
  message: string;
}

// 회원 등급별 취소 정책
export interface MembershipCancellationPolicy {
  description: string;
  lateRefundRate: number;
  graceMinutes: number;
}

// 수업 유형별 취소 정책
export interface ClassTypeCancellationPolicy {
  description: string;
  modifier: number;
}

// 취소 정책 전체
export interface CancellationPolicies {
  TIME_BASED: {
    EARLY: TimeCancellationPolicy;
    STANDARD: TimeCancellationPolicy;
    LATE: TimeCancellationPolicy;
    AFTER_START: TimeCancellationPolicy;
  };
  MEMBERSHIP_LEVEL: {
    REGULAR: MembershipCancellationPolicy;
    SILVER: MembershipCancellationPolicy;
    GOLD: MembershipCancellationPolicy;
    VIP: MembershipCancellationPolicy;
  };
  CLASS_TYPE: {
    REGULAR: ClassTypeCancellationPolicy;
    SPECIAL: ClassTypeCancellationPolicy;
    WORKSHOP: ClassTypeCancellationPolicy;
    EVENT: ClassTypeCancellationPolicy;
  };
}

// 취소 가능 여부 및 환불 정보
export interface CancellationCheck {
  canCancel: boolean;
  policy?: TimeCancellationPolicy;
  membershipLevel?: string;
  classType?: string;
  refundRate: number;
  refundAmount: number;
  timeToClass?: number;
  message: string;
}

// 취소 요청
export interface CancellationRequest {
  reservation_id: string;
  reason?: string;
}

// 취소 응답
export interface CancellationResponse {
  success: boolean;
  cancellation?: Cancellation;
  message?: string;
  error?: string;
}

// 취소 통계
export interface CancellationStats {
  totalCancellations: number;
  totalRefundAmount: number;
  cancellationRate: number;
  byCancellationReason: Array<{ reason: string; count: number }>;
  byClassType: Array<{ type: string; count: number }>;
  byTimeToClass: Array<{ hours: number; count: number }>;
  byMonth: Array<{ month: string; count: number; amount: number }>;
}

// 취소 분석 필터
export interface CancellationAnalyticsFilter {
  startDate?: string;
  endDate?: string;
  classType?: string;
  userId?: string;
  timeRange?: string;
}
