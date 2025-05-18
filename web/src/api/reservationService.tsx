import { supabase } from "./supabaseClient";
import { invalidateScheduleCache, checkReservationAvailability } from "./availabilityService";
import { Reservation, ClassSchedule, ReservationStatus, ApiResponse } from "../types";
import { API_BASE_URL } from "../config";

/**
 * 예약 관리를 위한 서비스
 * 예약 생성, 취소, 관리를 위한 기능들을 제공합니다.
 */

export interface ReservationData {
  user_id: string;
  class_id: string;
  schedule_id: string;
  student_count: number;
  total_price: number;
  payment_method: string;
  notes?: string;
  sessions_required?: number;
}

export interface ReservationResult {
  success: boolean;
  message?: string;
  reason?: string;
  schedule?: ClassSchedule;
  reservation?: Reservation;
  error?: any;
}

/**
 * 새로운 예약을 생성합니다.
 * @param {ReservationData} reservationData - 예약 데이터
 * @returns {Promise<ReservationResult>} - 생성된 예약 정보
 */
export const createReservation = async (
  reservationData: ReservationData
): Promise<ReservationResult> => {
  const sessionsRequired = reservationData.sessions_required || 1;

  try {
    // 가용성 확인 (동시 예약 방지 및 세션 확인)
    const availabilityResult = await checkReservationAvailability(
      reservationData.schedule_id,
      reservationData.student_count,
      reservationData.user_id,
      sessionsRequired
    );

    if (!availabilityResult.canReserve || !availabilityResult.schedule) {
      return {
        success: false,
        message: availabilityResult.message,
        reason: availabilityResult.reason,
        schedule: availabilityResult.schedule,
      };
    }

    // 1. 예약 생성
    let createdReservationId: string | null = null;
    let userSessionToUpdateId: string | null = availabilityResult.userSession?.id || null;

    const { data: reservation, error: reservationError } = await supabase
      .from("class_reservations")
      .insert([
        {
          user_id: reservationData.user_id,
          schedule_id: reservationData.schedule_id,
          status: reservationData.payment_method === "card" ? "confirmed" : "pending",
        },
      ])
      .select("id")
      .single();

    if (reservationError) throw reservationError;
    if (!reservation || !reservation.id)
      throw new Error("Failed to create reservation record or retrieve ID.");

    createdReservationId = reservation.id;

    // 2. 세션 차감 (userSessionToUpdateId가 있는 경우에만)
    if (userSessionToUpdateId) {
      // 먼저 현재 세션 수를 가져옴
      const { data: currentSessionData, error: getCurrentSessionError } = await supabase
        .from("user_sessions")
        .select("session_count")
        .eq("id", userSessionToUpdateId)
        .single();

      if (getCurrentSessionError) {
        if (createdReservationId) {
          await supabase.from("class_reservations").delete().eq("id", createdReservationId);
        }
        throw getCurrentSessionError;
      }

      if (!currentSessionData || currentSessionData.session_count < sessionsRequired) {
        // 이 시점에서 세션이 부족하면 뭔가 잘못된 것 (availabilityCheck에서 걸렀어야 함)
        // 하지만 방어적으로 처리
        if (createdReservationId) {
          await supabase.from("class_reservations").delete().eq("id", createdReservationId);
        }
        throw new Error("Insufficient sessions after availability check.");
      }

      const newSessionCount = currentSessionData.session_count - sessionsRequired;

      const { error: sessionDeductionError } = await supabase
        .from("user_sessions")
        .update({
          session_count: newSessionCount,
        })
        .eq("id", userSessionToUpdateId);

      if (sessionDeductionError) {
        if (createdReservationId) {
          await supabase.from("class_reservations").delete().eq("id", createdReservationId);
        }
        throw sessionDeductionError;
      }

      // 3. 세션 트랜잭션 기록
      const { error: transactionError } = await supabase.from("session_transactions").insert({
        user_session_id: userSessionToUpdateId,
        user_id: reservationData.user_id,
        transaction_type: "deduction",
        amount_changed: -sessionsRequired,
        reason: `클래스 예약 (ID: ${reservationData.schedule_id})`,
        related_reservation_id: createdReservationId,
      });

      if (transactionError) {
        // 트랜잭션 기록 실패 시 생성된 예약 롤백 및 차감된 세션 복구
        if (createdReservationId) {
          await supabase.from("class_reservations").delete().eq("id", createdReservationId);
        }
        // 세션 복구 로직
        const { data: sessionToRestore, error: getSessionToRestoreError } = await supabase
          .from("user_sessions")
          .select("session_count")
          .eq("id", userSessionToUpdateId)
          .single();

        if (getSessionToRestoreError) {
          console.error(
            "Failed to get session count for rollback (transactionError):",
            getSessionToRestoreError
          );
        } else if (sessionToRestore) {
          await supabase
            .from("user_sessions")
            .update({ session_count: sessionToRestore.session_count + sessionsRequired })
            .eq("id", userSessionToUpdateId);
        }
        throw transactionError;
      }

      // 4. 예약 레코드에 session_id 업데이트
      const { error: updateReservationError } = await supabase
        .from("class_reservations")
        .update({ session_id: userSessionToUpdateId })
        .eq("id", createdReservationId);

      if (updateReservationError) {
        console.error("Failed to link session to reservation:", updateReservationError);
        throw updateReservationError;
      }
    }

    // 5. 수업 잔여석 업데이트
    const { error: updateSeatsError } = await supabase
      .from("class_schedules")
      .update({
        remaining_seats:
          availabilityResult.schedule.remaining_seats - reservationData.student_count,
      })
      .eq("id", reservationData.schedule_id);

    if (updateSeatsError) {
      // 좌석 업데이트 실패 시 생성된 예약 롤백, (필요시) 세션 복구 및 트랜잭션 기록 롤백
      if (createdReservationId) {
        await supabase.from("class_reservations").delete().eq("id", createdReservationId);
      }
      if (userSessionToUpdateId) {
        // 세션 복구
        const { data: sessionToRestoreOnSeatsError, error: getRestoreSeatsError } = await supabase
          .from("user_sessions")
          .select("session_count")
          .eq("id", userSessionToUpdateId)
          .single();

        if (getRestoreSeatsError) {
          console.error(
            "Failed to get session count for rollback (updateSeatsError):",
            getRestoreSeatsError
          );
        } else if (sessionToRestoreOnSeatsError) {
          await supabase
            .from("user_sessions")
            .update({
              session_count: sessionToRestoreOnSeatsError.session_count + sessionsRequired,
            })
            .eq("id", userSessionToUpdateId);
        }

        // 트랜잭션 테이블에 보정 기록 추가 (예: 'deduction_rollback_seats_update_failed')
        await supabase.from("session_transactions").insert({
          user_session_id: userSessionToUpdateId,
          user_id: reservationData.user_id,
          transaction_type: "deduction_rollback_seats_update_failed",
          amount_changed: sessionsRequired,
          reason: `좌석 업데이트 실패로 인한 예약 취소 및 세션 복구 (예약 ID: ${createdReservationId})`,
          related_reservation_id: createdReservationId,
        });
      }
      throw updateSeatsError;
    }

    // 6. 캐시 무효화
    invalidateScheduleCache(reservationData.schedule_id);

    // 생성된 전체 예약 정보 다시 조회 (session_id 포함)
    const { data: finalReservation, error: finalReservationError } = await supabase
      .from("class_reservations")
      .select("*")
      .eq("id", createdReservationId)
      .single();

    if (finalReservationError) throw finalReservationError;

    return {
      success: true,
      reservation: finalReservation as Reservation,
    };
  } catch (error: any) {
    console.error("Error creating reservation:", error);
    return {
      success: false,
      message: "예약 생성 중 오류가 발생했습니다.",
      error,
    };
  }
};

export interface ReservationWithSchedule extends Reservation {
  class_schedules: ClassSchedule & {
    classes: {
      id: string;
      title: string;
      category: string;
      instructor_id?: string;
      instructors?: {
        id: string;
        name: string;
      }[];
    };
  };
}

/**
 * 사용자의 예약 목록을 가져옵니다.
 * @param {string} userId - 사용자 ID
 * @param {string} status - (선택) 특정 상태의 예약만 필터링
 * @returns {Promise<ReservationWithSchedule[]>} - 예약 목록
 */
export const getUserReservations = async (
  userId: string,
  status: ReservationStatus | null = null
): Promise<ReservationWithSchedule[]> => {
  try {
    let query = supabase
      .from("reservations")
      .select(
        `
        *,
        class_schedules (
          id,
          class_id,
          date,
          duration,
          capacity,
          remaining_seats,
          is_cancelled,
          classes (
            id,
            title,
            category,
            instructor_id,
            instructors (
              id,
              name
            )
          )
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // 특정 상태로 필터링
    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching user reservations:", error);
    throw error;
  }
};

/**
 * 예약을 취소합니다.
 * @param {string} reservationId - 취소할 예약 ID
 * @param {string} userId - 사용자 ID (권한 확인용)
 * @returns {Promise<ReservationResult>} - 취소 결과
 */
export const cancelReservation = async (
  reservationId: string,
  userId: string
): Promise<ReservationResult> => {
  try {
    // 1. 예약 정보 가져오기
    const { data: reservation, error: fetchError } = await supabase
      .from("reservations")
      .select("*")
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

    // 2. 예약 상태 업데이트
    const { error: updateError } = await supabase
      .from("reservations")
      .update({ status: "cancelled" })
      .eq("id", reservationId);

    if (updateError) throw updateError;

    // 3. 수업 잔여석 업데이트
    const { error: scheduleError } = await supabase
      .from("class_schedules")
      .select("remaining_seats")
      .eq("id", reservation.schedule_id)
      .single();

    if (scheduleError) throw scheduleError;

    const { error: updateScheduleError } = await supabase
      .from("class_schedules")
      .update({
        remaining_seats: supabase.rpc("increment", {
          row_id: reservation.schedule_id,
          table: "class_schedules",
          column: "remaining_seats",
          value: reservation.student_count,
        }),
      })
      .eq("id", reservation.schedule_id);

    if (updateScheduleError) throw updateScheduleError;

    // 4. 캐시 무효화
    invalidateScheduleCache(reservation.schedule_id);

    return {
      success: true,
      message: "예약이 취소되었습니다.",
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
 * 예약 확인 이메일을 발송합니다. (추후 구현)
 * @param {Reservation} reservation - 예약 정보
 */
export const sendConfirmationEmail = async (reservation: Reservation): Promise<void> => {
  // 이메일 서비스 연동 (예: SendGrid, AWS SES 등)
  // 현재는 mock 구현
  console.log("예약 확인 이메일 발송:", reservation);
};

/**
 * 예약 상태를 업데이트합니다.
 * @param {string} reservationId - 업데이트할 예약 ID
 * @param {ReservationStatus} status - 새로운 상태
 * @param {string} adminId - 관리자 ID (선택적)
 * @returns {Promise<ReservationResult>} - 업데이트 결과
 */
export const updateReservationStatus = async (
  reservationId: string,
  status: ReservationStatus,
  adminId: string | null = null
): Promise<ReservationResult> => {
  try {
    const updates: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    };

    // 관리자 ID가 제공된 경우
    if (adminId) {
      updates.updated_by = adminId;
    }

    const { data, error } = await supabase
      .from("reservations")
      .update(updates)
      .eq("id", reservationId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: `예약 상태가 '${status}'로 업데이트되었습니다.`,
      reservation: data,
    };
  } catch (error) {
    console.error("Error updating reservation status:", error);
    return {
      success: false,
      message: "예약 상태 업데이트 중 오류가 발생했습니다.",
      error,
    };
  }
};

/**
 * 만료된 임시 예약을 정리합니다.
 * @returns {Promise<number>} - 정리된 예약 수
 */
export const cleanupExpiredReservations = async (): Promise<number> => {
  try {
    const now = new Date().toISOString();

    // 1. 만료된 예약 찾기
    const { data: expiredReservations, error: findError } = await supabase
      .from("reservations")
      .select("id, schedule_id, student_count")
      .eq("status", "pending")
      .lt("expiry_date", now);

    if (findError) throw findError;

    if (!expiredReservations || expiredReservations.length === 0) {
      return 0;
    }

    // 2. 상태 업데이트
    const { error: updateError } = await supabase
      .from("reservations")
      .update({ status: "expired" })
      .in(
        "id",
        expiredReservations.map((r) => r.id)
      );

    if (updateError) throw updateError;

    // 3. 각 일정의 잔여석 복구
    for (const reservation of expiredReservations) {
      await supabase
        .from("class_schedules")
        .update({
          remaining_seats: supabase.rpc("increment", {
            row_id: reservation.schedule_id,
            table: "class_schedules",
            column: "remaining_seats",
            value: reservation.student_count,
          }),
        })
        .eq("id", reservation.schedule_id);

      // 캐시 무효화
      invalidateScheduleCache(reservation.schedule_id);
    }

    return expiredReservations.length;
  } catch (error) {
    console.error("Error cleaning up expired reservations:", error);
    return 0;
  }
};

// 중복 타입 정의 제거 - 이미 상단에서 임포트되어 있음

// 중복 함수 정의 제거 - 이미 266번 줄에 정의되어 있음

// 개별 예약 상세 조회
export const getUserReservationById = async (
  reservationId: string
): Promise<ReservationWithSchedule> => {
  try {
    // API 엔드포인트
    const url = `${API_BASE_URL}/reservations/${reservationId}`;

    // API 호출
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("예약 상세 정보를 가져오는 중 오류가 발생했습니다:", error);
    throw error;
  }
};
