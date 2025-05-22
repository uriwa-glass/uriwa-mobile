import { create } from "zustand";
import {
  ReservationState,
  StoreReservation,
  Schedule,
  PaymentStatusType,
  scheduleSchema,
  paymentStatusTypeSchema,
} from "../types/models/store";
import {
  createReservation as apiCreateReservation,
  getUserReservations as apiGetUserReservations,
  cancelReservation as apiCancelReservation,
  ReservationData,
  ReservationResult,
  ReservationWithSchedule,
} from "../api/reservationService"; // API 함수 임포트
import { Reservation } from "../types/models/reservation";
import { ClassSchedule } from "../types/models/class";

interface ReservationActions {
  fetchReservationHistory: (userId: string) => Promise<void>;
  createReservation: (reservationData: ReservationData) => Promise<ReservationResult>;
  cancelReservation: (reservationId: string, userId: string) => Promise<ReservationResult>;
  setCurrentReservation: (reservation: StoreReservation | null) => void;
  setSelectedSchedule: (schedule: Schedule | null) => void;
  clearError: () => void;
}

// API 응답을 StoreReservation 형식으로 변환하는 유틸리티 함수
const convertToStoreReservation = (apiReservation: any): StoreReservation => {
  // 결제 상태를 추론하는 함수 (실제 API에 맞게 로직 수정 필요)
  const getPaymentStatus = (status: string): PaymentStatusType => {
    switch (status) {
      case "confirmed":
        return "paid";
      case "cancelled":
        return "cancelled";
      case "attended":
        return "paid";
      case "no-show":
        return "paid";
      default:
        return "pending";
    }
  };

  return {
    id: apiReservation.id,
    user_id: apiReservation.user_id,
    class_schedule_id: apiReservation.class_schedule_id || apiReservation.schedule_id,
    student_count: apiReservation.student_count || 1,
    total_price: apiReservation.total_price || 0,
    status: apiReservation.status,
    created_at: apiReservation.created_at,
    updated_at: apiReservation.updated_at || apiReservation.created_at,
    // 스토어에 필요한 필드들을 API 응답에서 매핑
    payment_method: (apiReservation.payment_method || "card") as any,
    payment_status: getPaymentStatus(apiReservation.status),
    // API 응답에 있는 경우에만 중첩 객체 포함
    class_schedules: apiReservation.class_schedules as any,
    users: apiReservation.users,
    // 스토어 타입에만 필요한 필드들
    class_id: apiReservation.class_schedules?.class_id || "",
    schedule_id: apiReservation.class_schedule_id || apiReservation.schedule_id,
    metadata: {},
  } as StoreReservation;
};

const useReservationStore = create<ReservationState & ReservationActions>((set, get) => ({
  // Initial state from ReservationState
  loading: false,
  error: null,
  currentReservation: null,
  reservationHistory: [],
  selectedSchedule: null,

  // Actions
  fetchReservationHistory: async (userId) => {
    set({ loading: true, error: null });
    try {
      const apiReservations = await apiGetUserReservations(userId);
      // API 응답을 StoreReservation 형식으로 변환
      const storeReservations = apiReservations.map(convertToStoreReservation);
      set({ reservationHistory: storeReservations, loading: false });
    } catch (error: any) {
      set({ error: error.message || "Failed to fetch reservation history", loading: false });
    }
  },

  createReservation: async (reservationData) => {
    set({ loading: true, error: null });
    const result = await apiCreateReservation(reservationData);
    if (result.success && result.reservation) {
      // API 응답을 StoreReservation 형식으로 변환
      const storeReservation = convertToStoreReservation(result.reservation);
      set({
        currentReservation: storeReservation,
        loading: false,
      });
      // 성공 시 사용자 히스토리 다시 로드
      await get().fetchReservationHistory(reservationData.user_id);
    } else {
      set({ error: result.message || "Failed to create reservation", loading: false });
    }
    return result;
  },

  cancelReservation: async (reservationId, userId) => {
    set({ loading: true, error: null });
    const result = await apiCancelReservation(reservationId, userId);
    if (result.success) {
      set((state) => ({
        // currentReservation이 취소된 예약과 같다면 null로 설정
        currentReservation:
          state.currentReservation?.id === reservationId ? null : state.currentReservation,
        // reservationHistory에서 해당 예약 상태 업데이트
        reservationHistory: state.reservationHistory.map((r) =>
          r.id === reservationId ? { ...r, status: "cancelled", payment_status: "cancelled" } : r
        ),
        loading: false,
      }));
      // 성공 시 사용자 히스토리 다시 로드
      await get().fetchReservationHistory(userId);
    } else {
      set({ error: result.message || "Failed to cancel reservation", loading: false });
    }
    return result;
  },

  setCurrentReservation: (reservation) => set({ currentReservation: reservation }),
  setSelectedSchedule: (schedule) => set({ selectedSchedule: schedule }),
  clearError: () => set({ error: null }),
}));

export default useReservationStore;
