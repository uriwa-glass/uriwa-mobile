import { supabase } from "./supabaseClient";
import { ReservationStatus, ApiResponse } from "../types";

export interface AttendanceResult {
  success: boolean;
  message?: string;
  reservationId?: string;
  newStatus?: ReservationStatus;
  error?: any;
}

/**
 * 특정 예약의 출석을 기록합니다.
 * @param reservationId - 출석 처리할 예약 ID
 * @param adminId - (선택) 작업을 수행하는 관리자 ID (감사 추적용)
 * @returns {Promise<AttendanceResult>} - 출석 처리 결과
 */
export const markAttendance = async (
  reservationId: string,
  adminId?: string // 추후 감사 로그 등에 활용 가능
): Promise<AttendanceResult> => {
  try {
    // 1. 예약 정보 확인 (존재 여부, 현재 상태 등)
    const { data: reservation, error: fetchError } = await supabase
      .from("class_reservations")
      .select("id, status, user_id, schedule_id, session_id")
      .eq("id", reservationId)
      .single();

    if (fetchError) throw fetchError;

    if (!reservation) {
      return {
        success: false,
        message: "예약을 찾을 수 없습니다.",
        reservationId,
      };
    }

    if (reservation.status === "attended") {
      return {
        success: false,
        message: "이미 출석 처리된 예약입니다.",
        reservationId,
        newStatus: reservation.status as ReservationStatus,
      };
    }

    if (reservation.status === "cancelled") {
      return {
        success: false,
        message: "취소된 예약은 출석 처리할 수 없습니다.",
        reservationId,
        newStatus: reservation.status as ReservationStatus,
      };
    }

    // 2. 예약 상태를 'attended'로 변경
    const { error: updateError } = await supabase
      .from("class_reservations")
      .update({ status: "attended" })
      .eq("id", reservationId);

    if (updateError) throw updateError;

    // 3. (선택 사항) 세션 트랜잭션에 출석 확정 기록 (이미 예약 시 차감했다면 필요 없을 수도 있음)
    // 만약 예약 시 'pending_deduction' 상태로 두고, 출석 시 'confirmed_deduction'으로 변경하는 경우 등
    // 현재는 예약 시점에서 이미 세션이 차감되었으므로, 별도 트랜잭션 기록은 생략 가능.
    // 필요하다면 여기에 session_transactions 테이블에 기록하는 로직 추가
    // 예: transaction_type: 'attendance_confirmed', amount_changed: 0 (이미 차감됨)

    return {
      success: true,
      message: "출석 처리되었습니다.",
      reservationId,
      newStatus: "attended",
    };
  } catch (error) {
    console.error("Error marking attendance:", error);
    return {
      success: false,
      message: "출석 처리 중 오류가 발생했습니다.",
      error,
      reservationId,
    };
  }
};
