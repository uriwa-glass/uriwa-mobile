import { supabase } from "./supabaseClient";
import {
  ClassSchedule,
  AvailabilityResponse,
  ScheduleWithAvailability,
  ReservationStatus,
} from "../types";

/**
 * 수업 가용성 체크를 위한 서비스
 * 캐싱, 동시성 제어, 가용성 확인 등의 기능을 제공합니다.
 */

interface AvailabilityCache {
  schedules: Record<string, any>;
  timestamp: number | null;
  expiryTime: number;
}

// 메모리 캐시 (서버 사이드 캐싱이 구현되기 전까지 사용)
let availabilityCache: AvailabilityCache = {
  schedules: {},
  timestamp: null,
  expiryTime: 30000, // 30초 캐시 만료
};

/**
 * 특정 일정의 가용성 상태를 확인합니다.
 * @param {string} scheduleId - 확인할 일정 ID
 * @return {Promise<ScheduleWithAvailability>} - 가용성 정보와 일정 상세 정보
 */
export const checkScheduleAvailability = async (
  scheduleId: string
): Promise<ScheduleWithAvailability> => {
  try {
    // 캐시 확인
    if (
      availabilityCache.schedules[scheduleId] &&
      availabilityCache.timestamp &&
      Date.now() - availabilityCache.timestamp < availabilityCache.expiryTime
    ) {
      console.log("스케줄 가용성 캐시에서 반환:", scheduleId);
      return availabilityCache.schedules[scheduleId];
    }

    // 캐시가 없거나 만료된 경우 직접 조회
    const { data, error } = await supabase
      .from("class_schedules")
      .select(
        `
        id,
        class_id,
        date,
        duration,
        capacity,
        remaining_seats,
        is_cancelled,
        created_at,
        updated_at,
        classes (
          id,
          title,
          category,
          description,
          price,
          capacity,
          duration,
          type,
          image_url,
          created_at,
          updated_at,
          instructor_id,
          instructors (
            id,
            name
          )
        )
      `
      )
      .eq("id", scheduleId)
      .single();

    if (error) throw error;

    if (!data) {
      throw new Error("Schedule not found");
    }

    // 가용성 상태 계산
    const availabilityStatus = getAvailabilityStatus(data as unknown as ClassSchedule);
    const result: ScheduleWithAvailability = {
      ...data,
      availabilityStatus,
    };

    // 캐시 업데이트
    if (!availabilityCache.timestamp) {
      availabilityCache.timestamp = Date.now();
    }
    availabilityCache.schedules[scheduleId] = result;

    return result;
  } catch (error) {
    console.error("Error checking schedule availability:", error);
    throw error;
  }
};

/**
 * 특정 날짜 범위의 모든 일정 가용성을 가져옵니다.
 * @param {Date} startDate - 조회 시작 날짜
 * @param {Date} endDate - 조회 종료 날짜
 * @param {string} classId - (선택사항) 특정 클래스 ID로 필터링
 * @returns {Promise<ScheduleWithAvailability[]>} - 가용성 정보가 포함된 일정 목록
 */
export const getSchedulesAvailability = async (
  startDate: Date,
  endDate: Date,
  classId: string | null = null
): Promise<ScheduleWithAvailability[]> => {
  try {
    // 캐시 키 생성
    const cacheKey = `${startDate.toISOString()}-${endDate.toISOString()}-${classId || "all"}`;

    // 캐시 확인
    if (
      availabilityCache.schedules[cacheKey] &&
      availabilityCache.timestamp &&
      Date.now() - availabilityCache.timestamp < availabilityCache.expiryTime
    ) {
      console.log("일정 목록 캐시에서 반환:", cacheKey);
      return availabilityCache.schedules[cacheKey];
    }

    // 캐시가 없거나 만료된 경우 직접 조회
    let query = supabase
      .from("class_schedules")
      .select(
        `
        id,
        class_id,
        date,
        duration,
        capacity,
        remaining_seats,
        is_cancelled,
        created_at,
        updated_at,
        classes (
          id,
          title,
          category,
          description,
          price,
          capacity,
          duration,
          type,
          image_url,
          created_at,
          updated_at,
          instructor_id,
          instructors (
            id,
            name
          )
        )
      `
      )
      .gte("date", startDate.toISOString())
      .lte("date", endDate.toISOString())
      .eq("is_cancelled", false)
      .order("date", { ascending: true });

    // 특정 클래스에 대한 필터 추가
    if (classId) {
      query = query.eq("class_id", classId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // 각 일정의 가용성 상태 계산
    const schedulesWithAvailability: ScheduleWithAvailability[] = data.map((schedule) => ({
      ...schedule,
      availabilityStatus: getAvailabilityStatus(
        schedule as unknown as { is_cancelled: boolean; remaining_seats: number; capacity: number }
      ),
    }));

    // 캐시 업데이트
    if (!availabilityCache.timestamp) {
      availabilityCache.timestamp = Date.now();
    }
    availabilityCache.schedules[cacheKey] = schedulesWithAvailability;

    return schedulesWithAvailability;
  } catch (error) {
    console.error("Error fetching schedules availability:", error);
    throw error;
  }
};

interface ReservationAvailabilityResult {
  canReserve: boolean;
  reason?: string;
  message?: string;
  schedule: ClassSchedule;
  availabilityStatus?: string;
  reservation?: any;
  userSession?: {
    id: string;
    session_count: number;
    expiry_date: string;
  } | null;
}

/**
 * 수업 예약을 위한 가용성을 확인하고 예약 가능성을 체크합니다.
 * @param {string} scheduleId - 예약할 일정 ID
 * @param {number} studentCount - 예약 인원 수
 * @param {string} userId - 사용자 ID
 * @param {number} sessionsRequired - 예약에 필요한 세션 수 (기본값 1)
 * @returns {Promise<ReservationAvailabilityResult>} - 예약 가능 여부와 가용성 정보
 */
export const checkReservationAvailability = async (
  scheduleId: string,
  studentCount: number = 1,
  userId?: string,
  sessionsRequired: number = 1
): Promise<ReservationAvailabilityResult> => {
  try {
    // 1. 동시성 제어를 위해 최신 정보 직접 조회
    const { data: schedule, error } = await supabase
      .from("class_schedules")
      .select("*")
      .eq("id", scheduleId)
      .single();

    if (error) throw error;

    // 2. 가용성 검증
    // 취소된 수업인지 확인
    if (schedule.is_cancelled) {
      return {
        canReserve: false,
        reason: "CANCELLED",
        message: "취소된 수업입니다.",
        schedule: schedule as ClassSchedule,
      };
    }

    // 수업 시간이 지났는지 확인
    const classTime = new Date(schedule.date);
    const now = new Date();
    if (classTime < now) {
      return {
        canReserve: false,
        reason: "PAST_CLASS",
        message: "이미 지난 수업입니다.",
        schedule: schedule as ClassSchedule,
      };
    }

    // 잔여석 확인
    if (schedule.remaining_seats < studentCount) {
      return {
        canReserve: false,
        reason: "NOT_ENOUGH_SEATS",
        message: "정원이 마감되었습니다.",
        schedule: schedule as ClassSchedule,
      };
    }

    // 3. 사용자가 이미 예약했는지 확인
    if (userId) {
      const { data: existingReservation, error: reservationError } = await supabase
        .from("class_reservations")
        .select("*")
        .eq("user_id", userId)
        .eq("schedule_id", scheduleId)
        .eq("status", "confirmed")
        .maybeSingle();

      if (reservationError) throw reservationError;

      if (existingReservation) {
        return {
          canReserve: false,
          reason: "ALREADY_RESERVED",
          message: "이미 예약한 수업입니다.",
          schedule: schedule as ClassSchedule,
          reservation: existingReservation,
        };
      }
    }

    // 4. 사용자 세션 또는 멤버십 상태 확인
    let userSessionInfo: { id: string; session_count: number; expiry_date: string } | null = null;
    if (userId) {
      const { data: userSession, error: sessionError } = await supabase
        .from("user_sessions")
        .select("id, session_count, expiry_date")
        .eq("user_id", userId)
        .gte("expiry_date", new Date().toISOString())
        .order("expiry_date", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (sessionError) {
        console.error("Error fetching user session:", sessionError);
      }

      userSessionInfo = userSession;

      if (!userSession) {
        return {
          canReserve: false,
          reason: "NO_VALID_SESSION",
          message: "사용 가능한 세션이 없습니다. 세션을 구매해주세요.",
          schedule: schedule as ClassSchedule,
          userSession: null,
        };
      }

      if (userSession.session_count < sessionsRequired) {
        return {
          canReserve: false,
          reason: "INSUFFICIENT_SESSIONS",
          message: `세션이 부족합니다. (보유: ${userSession.session_count}, 필요: ${sessionsRequired})`,
          schedule: schedule as ClassSchedule,
          userSession: userSession,
        };
      }
    } else {
      // 비회원 예약 로직 (세션 체크 X) 또는 userId가 없으면 예약 불가 처리
      // 현재는 userId가 없으면 세션 체크를 건너뛰지만, 정책에 따라 변경 가능
    }

    // 모든 검증을 통과하면 예약 가능
    return {
      canReserve: true,
      availabilityStatus: getAvailabilityStatus(schedule as ClassSchedule),
      schedule: schedule as ClassSchedule,
      userSession: userSessionInfo,
    };
  } catch (error) {
    console.error("Error checking reservation availability:", error);
    throw error;
  }
};

/**
 * 일정의 가용성 상태를 계산합니다. (예: AVAILABLE, LIMITED, FULL, CANCELLED)
 * @param {ClassSchedule} schedule - 가용성을 확인할 일정
 * @returns {string} 가용성 상태 코드
 */
export const getAvailabilityStatus = (schedule: {
  is_cancelled: boolean;
  remaining_seats: number;
  capacity: number;
}): string => {
  if (schedule.is_cancelled) {
    return "CANCELLED";
  }

  const remainingSeats = schedule.remaining_seats;
  const capacity = schedule.capacity;

  if (remainingSeats <= 0) {
    return "FULL";
  } else if (remainingSeats <= Math.ceil(capacity * 0.2)) {
    return "LIMITED";
  } else {
    return "AVAILABLE";
  }
};

/**
 * 임시 예약을 생성하여 좌석을 확보합니다. (실제 결제 전 임시 예약용)
 * @param {string} scheduleId - 예약할 일정 ID
 * @param {string} userId - 사용자 ID
 * @param {number} studentCount - 예약 인원 수
 * @returns {Promise<{success: boolean, message: string, reservationId?: string}>} 예약 결과
 */
export const createTempReservation = async (
  scheduleId: string,
  userId: string,
  studentCount: number = 1
): Promise<{ success: boolean; message: string; reservationId?: string }> => {
  try {
    // 1. 가용성 다시 확인 (동시성 제어 필요)
    const availability = await checkReservationAvailability(scheduleId, studentCount, userId);

    if (!availability.canReserve) {
      return {
        success: false,
        message: availability.message || "예약할 수 없는 상태입니다.",
      };
    }

    // 2. 임시 예약 생성 (5분 후 만료)
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 5);

    const { data, error } = await supabase
      .from("reservations")
      .insert([
        {
          user_id: userId,
          schedule_id: scheduleId,
          student_count: studentCount,
          status: "pending" as ReservationStatus,
          expiry_date: expiryDate.toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // 3. 캐시 무효화
    invalidateScheduleCache(scheduleId);

    return {
      success: true,
      message: "임시 예약이 생성되었습니다. 5분 내에 결제를 완료해주세요.",
      reservationId: data.id,
    };
  } catch (error) {
    console.error("Error creating temporary reservation:", error);
    return {
      success: false,
      message: "예약 생성 중 오류가 발생했습니다.",
    };
  }
};

/**
 * 특정 일정의 캐시를 무효화합니다.
 * @param {string} scheduleId - 무효화할 일정 ID
 */
export const invalidateScheduleCache = (scheduleId: string): void => {
  // 특정 일정 캐시 삭제
  if (availabilityCache.schedules[scheduleId]) {
    delete availabilityCache.schedules[scheduleId];
  }

  // 날짜 범위 캐시도 모두 삭제 (정확한 데이터 보장)
  Object.keys(availabilityCache.schedules).forEach((key) => {
    if (key.includes("-")) {
      delete availabilityCache.schedules[key];
    }
  });
};

/**
 * 모든 가용성 캐시를 초기화합니다.
 */
export const clearAvailabilityCache = (): void => {
  availabilityCache = {
    schedules: {},
    timestamp: null,
    expiryTime: 30000,
  };
  console.log("가용성 캐시가 초기화되었습니다.");
};
