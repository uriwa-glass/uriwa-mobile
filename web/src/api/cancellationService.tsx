import { supabase } from "./supabaseClient";
import { invalidateScheduleCache } from "./availabilityService";
import {
  Cancellation,
  CancellationCheck,
  CancellationPolicies,
  Reservation,
  TimeCancellationPolicy,
} from "@/types/models/reservation";
import { ClassSchedule } from "@/types/models/class";
import { UserProfile } from "@/types/models/user";

/**
 * 취소 정책 관리 및 예약 취소를 위한 서비스
 * 시간 기반, 회원 등급별, 수업 유형별 취소 정책 적용
 */

// 취소 정책 설정
const CANCELLATION_POLICIES: CancellationPolicies = {
  // 시간 기반 취소 정책
  TIME_BASED: {
    // 수업 시작 48시간 이상 전 (100% 환불)
    EARLY: {
      hours: 48,
      refundRate: 1.0,
      description: "수업 시작 48시간 이전 취소",
      message: "전액 환불",
    },
    // 수업 시작 24-48시간 전 (80% 환불)
    STANDARD: {
      hours: 24,
      refundRate: 0.8,
      description: "수업 시작 24-48시간 이내 취소",
      message: "80% 환불",
    },
    // 수업 시작 24시간 이내 (50% 환불)
    LATE: {
      hours: 0,
      refundRate: 0.5,
      description: "수업 시작 24시간 이내 취소",
      message: "50% 환불",
    },
    // 수업 시작 이후 (환불 불가)
    AFTER_START: {
      hours: -1,
      refundRate: 0,
      description: "수업 시작 이후 취소",
      message: "환불 불가",
    },
  },

  // 회원 등급별 취소 정책
  MEMBERSHIP_LEVEL: {
    REGULAR: {
      description: "일반 회원",
      lateRefundRate: 0.5, // 지각 취소 환불율
      graceMinutes: 0, // 추가 유예 시간 (분)
    },
    SILVER: {
      description: "실버 회원",
      lateRefundRate: 0.6,
      graceMinutes: 30,
    },
    GOLD: {
      description: "골드 회원",
      lateRefundRate: 0.7,
      graceMinutes: 60,
    },
    VIP: {
      description: "VIP 회원",
      lateRefundRate: 0.8,
      graceMinutes: 120,
    },
  },

  // 수업 유형별 취소 정책
  CLASS_TYPE: {
    REGULAR: {
      description: "일반 수업",
      modifier: 1.0, // 기본 환불률 수정자
    },
    SPECIAL: {
      description: "특별 수업",
      modifier: 0.8, // 특별 수업은 환불률 20% 감소
    },
    WORKSHOP: {
      description: "워크샵",
      modifier: 0.7, // 워크샵은 환불률 30% 감소
    },
    EVENT: {
      description: "이벤트",
      modifier: 0.5, // 이벤트는 환불률 50% 감소
    },
  },
};

interface ReservationWithDetails extends Reservation {
  class_schedules: ClassSchedule & {
    classes: {
      id: string;
      title: string;
      type: string;
      category: string;
    };
  };
  users: UserProfile;
}

interface CancellationResult {
  success: boolean;
  message: string;
  cancellation?: Cancellation;
  refundAmount?: number;
  error?: any;
}

/**
 * 취소 가능 여부 및 환불 정책을 확인합니다.
 * @param {Reservation} reservation - 예약 정보
 * @param {ClassSchedule} schedule - 수업 일정 정보
 * @param {UserProfile} user - 사용자 정보 (회원 등급 등)
 * @returns {CancellationCheck} - 취소 가능 여부 및 환불 정보
 */
export const checkCancellationPolicy = async (
  reservation: Reservation,
  schedule: ClassSchedule & { classes?: { type: string } },
  user: { membership_level?: string }
): Promise<CancellationCheck> => {
  try {
    // 수업 시작 시간
    const classTime = new Date(schedule.date);
    // 현재 시간
    const now = new Date();

    // 수업이 이미 시작된 경우
    if (now >= classTime) {
      return {
        canCancel: false,
        policy: CANCELLATION_POLICIES.TIME_BASED.AFTER_START,
        refundAmount: 0,
        refundRate: 0,
        message: "수업이 이미 시작되어 취소할 수 없습니다.",
      };
    }

    // 회원 등급 확인 (없으면 일반 회원으로 처리)
    const membershipLevel = user?.membership_level || "REGULAR";
    const membershipPolicy =
      CANCELLATION_POLICIES.MEMBERSHIP_LEVEL[
        membershipLevel as keyof typeof CANCELLATION_POLICIES.MEMBERSHIP_LEVEL
      ] || CANCELLATION_POLICIES.MEMBERSHIP_LEVEL.REGULAR;

    // 수업 유형 확인 (없으면 일반 수업으로 처리)
    const classType = schedule.classes?.type || "REGULAR";
    const classPolicy =
      CANCELLATION_POLICIES.CLASS_TYPE[
        classType as keyof typeof CANCELLATION_POLICIES.CLASS_TYPE
      ] || CANCELLATION_POLICIES.CLASS_TYPE.REGULAR;

    // 수업 시작까지 남은 시간 (밀리초)
    const timeToClass = classTime.getTime() - now.getTime();

    // 회원 등급에 따른 유예 시간 적용 (밀리초로 변환)
    const graceTimeMs = membershipPolicy.graceMinutes * 60 * 1000;
    const adjustedTimeToClass = timeToClass + graceTimeMs;

    // 시간 기반 정책 결정
    let timePolicy: TimeCancellationPolicy;
    if (adjustedTimeToClass >= CANCELLATION_POLICIES.TIME_BASED.EARLY.hours * 3600 * 1000) {
      timePolicy = CANCELLATION_POLICIES.TIME_BASED.EARLY;
    } else if (
      adjustedTimeToClass >=
      CANCELLATION_POLICIES.TIME_BASED.STANDARD.hours * 3600 * 1000
    ) {
      timePolicy = CANCELLATION_POLICIES.TIME_BASED.STANDARD;
    } else {
      timePolicy = CANCELLATION_POLICIES.TIME_BASED.LATE;
    }

    // 환불 비율 계산 (시간 정책 + 회원 등급 수정자 + 수업 유형 수정자)
    let refundRate = timePolicy.refundRate;

    // 지각 취소 시 회원 등급에 따른 추가 보정
    if (timePolicy === CANCELLATION_POLICIES.TIME_BASED.LATE) {
      refundRate = membershipPolicy.lateRefundRate;
    }

    // 수업 유형에 따른 보정
    refundRate = refundRate * classPolicy.modifier;

    // 최종 환불 금액 계산
    const refundAmount = Math.round(reservation.total_price * refundRate);

    // 취소 가능 여부 및 환불 정보 반환
    return {
      canCancel: true,
      policy: timePolicy,
      membershipLevel,
      classType,
      refundRate,
      refundAmount,
      timeToClass: Math.floor(timeToClass / (1000 * 60 * 60)), // 시간 단위
      message: `취소 시 ${refundRate * 100}% 환불 가능 (${refundAmount.toLocaleString()}원)`,
    };
  } catch (error) {
    console.error("Error checking cancellation policy:", error);
    throw error;
  }
};

/**
 * 예약을 취소하고 환불 처리합니다.
 * @param {string} reservationId - 취소할 예약 ID
 * @param {string} userId - 사용자 ID (권한 확인용)
 * @param {string} reason - 취소 사유
 * @returns {Promise<CancellationResult>} - 취소 결과
 */
export const cancelReservation = async (
  reservationId: string,
  userId: string,
  reason: string = ""
): Promise<CancellationResult> => {
  try {
    // 1. 예약 정보 가져오기
    const { data: reservation, error: fetchError } = await supabase
      .from("reservations")
      .select(
        `
        *,
        class_schedules!inner(
          id,
          class_id,
          date,
          duration,
          capacity,
          remaining_seats,
          is_cancelled,
          classes(
            id,
            title,
            type,
            category
          )
        ),
        users!inner(
          id,
          email,
          membership_level
        )
      `
      )
      .eq("id", reservationId)
      .eq("user_id", userId) // 본인 예약만 취소 가능
      .single();

    if (fetchError) throw fetchError;

    if (!reservation) {
      return {
        success: false,
        message: "예약을 찾을 수 없거나 취소 권한이 없습니다.",
      };
    }

    // 이미 취소된 예약인지 확인
    if (reservation.status === "cancelled") {
      return {
        success: false,
        message: "이미 취소된 예약입니다.",
      };
    }

    // 2. 취소 정책 확인
    const schedule = reservation.class_schedules;
    const user = reservation.users;

    const cancellationCheck = await checkCancellationPolicy(
      reservation as Reservation,
      schedule as ClassSchedule & { classes?: { type: string } },
      user
    );

    if (!cancellationCheck.canCancel) {
      return {
        success: false,
        message: cancellationCheck.message,
      };
    }

    // 3. 취소 이력 저장
    const { data: cancellationData, error: cancellationError } = await supabase
      .from("cancellations")
      .insert([
        {
          reservation_id: reservationId,
          cancelled_by_id: userId,
          reason: reason || "사용자 요청에 의한 취소",
          refund_amount: cancellationCheck.refundAmount,
          refund_rate: cancellationCheck.refundRate,
          refund_status: cancellationCheck.refundAmount > 0 ? "pending" : "completed",
        },
      ])
      .select()
      .single();

    if (cancellationError) throw cancellationError;

    // 4. 예약 상태 업데이트
    const { error: updateError } = await supabase
      .from("reservations")
      .update({ status: "cancelled" })
      .eq("id", reservationId);

    if (updateError) throw updateError;

    // 5. 수업 잔여석 업데이트
    const { error: scheduleError } = await supabase
      .from("class_schedules")
      .update({
        remaining_seats: schedule.remaining_seats + reservation.student_count,
      })
      .eq("id", schedule.id);

    if (scheduleError) throw scheduleError;

    // 6. 캐시 무효화
    invalidateScheduleCache(schedule.id);

    // 7. 환불 처리 (모의 구현)
    // 실제 환불은 결제 서비스와 연동 필요
    if (cancellationCheck.refundAmount > 0) {
      // 환불 로직 구현 (실제로는 결제 서비스 API 호출)
      console.log(
        `환불 처리: ${reservationId}, ${cancellationCheck.refundAmount}원, 방식: ${reservation.payment_method}`
      );

      // 환불 상태 업데이트 (실제로는 결제 서비스 응답에 따라 처리)
      await supabase
        .from("cancellations")
        .update({ refund_status: "completed" })
        .eq("id", cancellationData.id);
    }

    return {
      success: true,
      message: `예약이 취소되었습니다. ${
        cancellationCheck.refundAmount > 0
          ? `환불 금액: ${cancellationCheck.refundAmount.toLocaleString()}원`
          : "환불 금액이 없습니다."
      }`,
      cancellation: cancellationData,
      refundAmount: cancellationCheck.refundAmount,
    };
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    return {
      success: false,
      message: "예약 취소 중 오류가 발생했습니다.",
      error,
    };
  }
};

/**
 * 관리자가 예약을 취소합니다.
 * @param {string} reservationId - 취소할 예약 ID
 * @param {string} adminId - 관리자 ID
 * @param {string} reason - 취소 사유
 * @param {boolean} notifyUser - 사용자에게 알림 발송 여부
 * @returns {Promise<CancellationResult>} - 취소 결과
 */
export const adminCancelReservation = async (
  reservationId: string,
  adminId: string,
  reason: string = "",
  notifyUser: boolean = true
): Promise<CancellationResult> => {
  try {
    // 1. 예약 정보 가져오기
    const { data: reservation, error: fetchError } = await supabase
      .from("reservations")
      .select(
        `
        *,
        class_schedules!inner(
          id,
          class_id,
          date,
          duration,
          capacity,
          remaining_seats,
          classes(
            id,
            title,
            type
          )
        ),
        users!inner(
          id,
          email,
          membership_level
        )
      `
      )
      .eq("id", reservationId)
      .single();

    if (fetchError) throw fetchError;

    if (!reservation) {
      return {
        success: false,
        message: "예약을 찾을 수 없습니다.",
      };
    }

    // 이미 취소된 예약인지 확인
    if (reservation.status === "cancelled") {
      return {
        success: false,
        message: "이미 취소된 예약입니다.",
      };
    }

    // 2. 관리자 취소는 전액 환불 정책 적용
    const refundAmount = reservation.total_price;
    const refundRate = 1.0;

    // 3. 취소 이력 저장
    const { data: cancellationData, error: cancellationError } = await supabase
      .from("cancellations")
      .insert([
        {
          reservation_id: reservationId,
          cancelled_by_id: adminId,
          reason: reason || "관리자에 의한 취소",
          refund_amount: refundAmount,
          refund_rate: refundRate,
          refund_status: "pending",
          is_admin_cancellation: true,
        },
      ])
      .select()
      .single();

    if (cancellationError) throw cancellationError;

    // 4. 예약 상태 업데이트
    const { error: updateError } = await supabase
      .from("reservations")
      .update({ status: "cancelled" })
      .eq("id", reservationId);

    if (updateError) throw updateError;

    // 5. 수업 잔여석 업데이트
    const { error: scheduleError } = await supabase
      .from("class_schedules")
      .update({
        remaining_seats: reservation.class_schedules.remaining_seats + reservation.student_count,
      })
      .eq("id", reservation.class_schedules.id);

    if (scheduleError) throw scheduleError;

    // 6. 캐시 무효화
    invalidateScheduleCache(reservation.class_schedules.id);

    // 7. 환불 처리 (모의 구현)
    // 실제 환불은 결제 서비스와 연동 필요
    console.log(
      `관리자 환불 처리: ${reservationId}, ${refundAmount}원, 방식: ${reservation.payment_method}`
    );

    // 환불 상태 업데이트 (실제로는 결제 서비스 응답에 따라 처리)
    await supabase
      .from("cancellations")
      .update({ refund_status: "completed" })
      .eq("id", cancellationData.id);

    // 8. 사용자에게 알림 (선택 사항)
    if (notifyUser) {
      // 알림 로직 구현 (이메일, 푸시 등)
      console.log(
        `취소 알림 발송: ${reservation.users.email}, 예약 ID: ${reservationId}, 환불 금액: ${refundAmount}원`
      );

      // 알림 상태 업데이트
      await supabase
        .from("cancellations")
        .update({ notification_sent: true })
        .eq("id", cancellationData.id);
    }

    return {
      success: true,
      message: `예약이 취소되었습니다. 환불 금액: ${refundAmount.toLocaleString()}원`,
      cancellation: cancellationData,
      refundAmount: refundAmount,
    };
  } catch (error) {
    console.error("Error in admin cancellation:", error);
    return {
      success: false,
      message: "관리자 예약 취소 중 오류가 발생했습니다.",
      error,
    };
  }
};

interface ClassCancellationResult {
  success: boolean;
  message: string;
  cancelledCount?: number;
  error?: any;
}

/**
 * 수업 일정을 취소합니다. (수업 전체 취소)
 * @param {string} scheduleId - 취소할 수업 일정 ID
 * @param {string} adminId - 관리자 ID
 * @param {string} reason - 취소 사유
 * @returns {Promise<ClassCancellationResult>} - 취소 결과
 */
export const cancelClassSchedule = async (
  scheduleId: string,
  adminId: string,
  reason: string = ""
): Promise<ClassCancellationResult> => {
  try {
    // 1. 수업 정보 가져오기
    const { data: schedule, error: scheduleError } = await supabase
      .from("class_schedules")
      .select(
        `
        *,
        classes(
          id,
          title
        )
      `
      )
      .eq("id", scheduleId)
      .single();

    if (scheduleError) throw scheduleError;

    if (!schedule) {
      return {
        success: false,
        message: "수업 일정을 찾을 수 없습니다.",
      };
    }

    // 이미 취소된 수업인지 확인
    if (schedule.is_cancelled) {
      return {
        success: false,
        message: "이미 취소된 수업 일정입니다.",
      };
    }

    // 2. 해당 수업의 모든 예약 목록 가져오기
    const { data: reservations, error: reservationsError } = await supabase
      .from("reservations")
      .select("*")
      .eq("schedule_id", scheduleId)
      .eq("status", "confirmed");

    if (reservationsError) throw reservationsError;

    // 3. 수업 상태 업데이트
    const { error: updateError } = await supabase
      .from("class_schedules")
      .update({
        is_cancelled: true,
        cancellation_reason: reason || "관리자에 의한 수업 취소",
      })
      .eq("id", scheduleId);

    if (updateError) throw updateError;

    // 4. 모든 예약에 대해 취소 처리
    let cancelledCount = 0;
    const cancelPromises = [];

    for (const reservation of reservations || []) {
      const cancelPromise = adminCancelReservation(
        reservation.id,
        adminId,
        `수업 취소: ${reason || "관리자에 의한 수업 취소"}`,
        true
      );
      cancelPromises.push(cancelPromise);
    }

    // 모든 취소 작업이 완료될 때까지 대기
    const results = await Promise.all(cancelPromises);
    cancelledCount = results.filter((result) => result.success).length;

    // 5. 캐시 무효화
    invalidateScheduleCache(scheduleId);

    return {
      success: true,
      message: `수업이 취소되었습니다. ${cancelledCount}개의 예약이 자동으로 취소되었습니다.`,
      cancelledCount,
    };
  } catch (error) {
    console.error("Error cancelling class schedule:", error);
    return {
      success: false,
      message: "수업 취소 중 오류가 발생했습니다.",
      error,
    };
  }
};

interface CancellationDeadline {
  fullRefund: Date;
  partialRefund: Date;
  minimalRefund: Date;
  noRefund: Date;
  deadlines: {
    time: Date;
    label: string;
    refundRate: number;
  }[];
}

/**
 * 수업에 대한 환불 가능 기한을 계산합니다.
 * @param {ClassSchedule} classSchedule - 수업 일정 정보
 * @param {string} membershipLevel - 회원 등급
 * @returns {CancellationDeadline} - 취소 가능 기한 정보
 */
export const calculateCancellationDeadlines = (
  classSchedule: ClassSchedule,
  membershipLevel: string = "REGULAR"
): CancellationDeadline => {
  const classTime = new Date(classSchedule.date);

  // 회원 등급별 유예 시간 (밀리초)
  const membershipPolicy =
    CANCELLATION_POLICIES.MEMBERSHIP_LEVEL[
      membershipLevel as keyof typeof CANCELLATION_POLICIES.MEMBERSHIP_LEVEL
    ] || CANCELLATION_POLICIES.MEMBERSHIP_LEVEL.REGULAR;

  const graceTimeMs = membershipPolicy.graceMinutes * 60 * 1000;

  // 각 정책에 대한 기한 계산
  const early = new Date(
    classTime.getTime() - CANCELLATION_POLICIES.TIME_BASED.EARLY.hours * 3600 * 1000 + graceTimeMs
  );
  const standard = new Date(
    classTime.getTime() -
      CANCELLATION_POLICIES.TIME_BASED.STANDARD.hours * 3600 * 1000 +
      graceTimeMs
  );
  const late = new Date(classTime);
  const afterStart = new Date(classTime.getTime() + 1000); // 수업 시작 1초 후

  return {
    fullRefund: early,
    partialRefund: standard,
    minimalRefund: late,
    noRefund: afterStart,
    deadlines: [
      {
        time: early,
        label: `${CANCELLATION_POLICIES.TIME_BASED.EARLY.hours}시간 전 (${
          CANCELLATION_POLICIES.TIME_BASED.EARLY.refundRate * 100
        }% 환불)`,
        refundRate: CANCELLATION_POLICIES.TIME_BASED.EARLY.refundRate,
      },
      {
        time: standard,
        label: `${CANCELLATION_POLICIES.TIME_BASED.STANDARD.hours}시간 전 (${
          CANCELLATION_POLICIES.TIME_BASED.STANDARD.refundRate * 100
        }% 환불)`,
        refundRate: CANCELLATION_POLICIES.TIME_BASED.STANDARD.refundRate,
      },
      {
        time: late,
        label: `수업 시작 전까지 (${membershipPolicy.lateRefundRate * 100}% 환불)`,
        refundRate: membershipPolicy.lateRefundRate,
      },
      {
        time: afterStart,
        label: "수업 시작 후 (환불 불가)",
        refundRate: 0,
      },
    ],
  };
};

/**
 * 사용자의 취소 내역을 조회합니다.
 * @param {string} userId - 사용자 ID
 * @returns {Promise<Cancellation[]>} - 취소 내역 목록
 */
export const getUserCancellationHistory = async (userId: string): Promise<Cancellation[]> => {
  try {
    const { data, error } = await supabase
      .from("cancellations")
      .select(
        `
        *,
        reservations!inner(
          id,
          user_id,
          schedule_id,
          student_count,
          total_price,
          status,
          class_schedules(
            id,
            date,
            classes(
              id,
              title,
              type
            )
          )
        )
      `
      )
      .eq("reservations.user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching cancellation history:", error);
    throw error;
  }
};
