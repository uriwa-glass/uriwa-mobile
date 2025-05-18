import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  ScheduleState,
  Schedule,
  ClassInfo,
  ScheduleFilters,
  AvailabilityStatus,
} from "../types/stores";
import {
  getSchedulesAvailability as apiGetSchedules,
  checkScheduleAvailability as apiGetScheduleDetails,
} from "../api/availabilityService"; // API 함수 임포트
import { supabase } from "../api/supabaseClient"; // Import for Supabase client

// API 함수 정의
const apiGetClasses = async () => {
  return await supabase.from("classes").select("*");
};

// import { ClassSchedule } from "../types/models/class"; // Not strictly needed if API services return mapped types or basic types

interface ScheduleActions {
  fetchSchedules: (startDate: Date, endDate: Date, classId?: string | null) => Promise<void>;
  fetchScheduleDetails: (scheduleId: string) => Promise<void>; // Changed return type to Promise<void>
  fetchClasses: () => Promise<void>;
  setFilters: (filters: Partial<ScheduleFilters>) => void;
  setSelectedDate: (date: string) => void;
  setSelectedView: (view: "day" | "week" | "month") => void;
  // TODO: fetchClasses 액션 (ClassInfo 목록을 가져오는 API가 있다면)
}

// Helper function to map string to AvailabilityStatus
const mapToAvailabilityStatus = (statusStr: string | undefined | null): AvailabilityStatus => {
  if (!statusStr) return "available"; // Handle null or undefined
  const lowerStatus = statusStr.toLowerCase();
  if (["available", "low", "full", "cancelled"].includes(lowerStatus)) {
    return lowerStatus as AvailabilityStatus;
  }
  console.warn(`Unknown availability status string: ${statusStr}`);
  return "available"; // Default or throw error
};

export const useScheduleStore = create<ScheduleState & ScheduleActions>()(
  devtools(
    (set, get) => ({
      schedules: [],
      classes: [],
      filters: {
        // 기본 필터 값 설정
        // category: undefined,
        // minPrice: undefined,
        // maxPrice: undefined,
        // dateRange: undefined,
        // instructorId: undefined,
        // availabilityStatus: undefined,
        // searchTerm: undefined,
      },
      selectedDate: new Date().toISOString().split("T")[0], // 오늘 날짜 기본값
      selectedView: "week", // 기본 뷰
      loading: false,
      error: null,

      // Actions
      fetchSchedules: async (startDate, endDate, classId) => {
        set({ loading: true, error: null });
        try {
          const schedulesData = await apiGetSchedules(startDate, endDate, classId);
          const mappedSchedules = schedulesData.map((schedule: any) => ({
            // Use any for schedule if type is complex from API
            ...schedule,
            availabilityStatus: mapToAvailabilityStatus(schedule.availabilityStatus),
          }));
          set({ schedules: mappedSchedules, loading: false });
        } catch (error: any) {
          set({ error: error.message || "Failed to fetch schedules", loading: false });
        }
      },

      fetchScheduleDetails: async (scheduleId: string) => {
        // Now returns Promise<void>
        set({ loading: true, error: null });
        try {
          const scheduleDetails = await apiGetScheduleDetails(scheduleId);
          if (scheduleDetails) {
            const mappedScheduleDetails = {
              ...scheduleDetails,
              availabilityStatus: mapToAvailabilityStatus(
                scheduleDetails.availabilityStatus as string
              ),
            };
            // Update the specific schedule in the schedules array or a selectedScheduleDetail state
            set((state) => ({
              schedules: state.schedules.map((s) =>
                s.id === scheduleId ? { ...s, ...mappedScheduleDetails } : s
              ),
              loading: false,
            }));
            // Optionally, if you have a state for a single selected schedule detail:
            // set({ selectedScheduleDetail: mappedScheduleDetails, loading: false });
          } else {
            throw new Error("Schedule details not found");
          }
        } catch (error: any) {
          set({ error: error.message || "Failed to fetch schedule details", loading: false });
        }
      },

      fetchClasses: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await apiGetClasses();
          if (error) throw error;
          // Assuming data is ClassInfo[] or needs mapping
          // Ensure the ClassInfo type in types/stores.ts matches the structure from apiGetClasses
          set({ classes: data as ClassInfo[], loading: false });
        } catch (error: any) {
          set({ error: error.message || "Failed to fetch classes", loading: false });
        }
      },

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      setSelectedDate: (date) => set({ selectedDate: date }),

      setSelectedView: (view) => set({ selectedView: view }),
    }),
    { name: "ScheduleStore" }
  )
);
