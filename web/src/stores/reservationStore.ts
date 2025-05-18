import { create } from "zustand";
import { ReservationState, Reservation, Schedule } from "../types/stores";
import {
  createReservation as apiCreateReservation,
  getUserReservations as apiGetUserReservations,
  cancelReservation as apiCancelReservation,
  ReservationData,
  ReservationResult,
} from "../api/reservationService"; // API 함수 임포트

interface ReservationActions {
  fetchReservationHistory: (userId: string) => Promise<void>;
  createReservation: (reservationData: ReservationData) => Promise<ReservationResult>;
  cancelReservation: (reservationId: string, userId: string) => Promise<ReservationResult>;
  setCurrentReservation: (reservation: Reservation | null) => void;
  setSelectedSchedule: (schedule: Schedule | null) => void;
  clearError: () => void;
}

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
      const history = await apiGetUserReservations(userId);
      set({ reservationHistory: history as Reservation[], loading: false });
    } catch (error: any) {
      set({ error: error.message || "Failed to fetch reservation history", loading: false });
    }
  },

  createReservation: async (reservationData) => {
    set({ loading: true, error: null });
    const result = await apiCreateReservation(reservationData);
    if (result.success && result.reservation) {
      set((state) => ({
        currentReservation: result.reservation,
        // 필요시 reservationHistory에도 추가
        // reservationHistory: [...state.reservationHistory, result.reservation],
        loading: false,
      }));
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
        // reservationHistory에서 해당 예약 제거 또는 상태 업데이트
        reservationHistory: state.reservationHistory.map((r) =>
          r.id === reservationId ? { ...r, status: "cancelled" } : r
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
