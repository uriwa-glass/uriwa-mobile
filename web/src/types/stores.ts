// 공통 상태 타입
// API 서비스에서 정의된 Reservation 타입을 가져오거나, 여기서 유사하게 정의합니다.
// 여기서는 API 서비스의 Reservation (from models/reservation.ts)을 기본으로 하고,
// 스토어에서 추가로 필요한 정보를 포함하도록 확장하거나 API 반환 타입을 직접 사용합니다.
import {
  Reservation as ApiReservation,
  ReservationStatus,
  PaymentMethod,
} from "./models/reservation";
import { ClassSchedule } from "./models/class"; // ClassSchedule 도 API 모델을 따르도록
import { UserProfile } from "./models/user";

export interface LoadingState {
  loading: boolean;
  error: string | null;
}

// UI 상태 타입
export interface UIState extends LoadingState {
  sidebarOpen: boolean;
  modalOpen: boolean;
  modalType: string | null;
  modalData: any;
  theme: "light" | "dark" | "system";
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  timestamp: number;
  read: boolean;
  autoClose?: boolean;
  duration?: number;
}

// 스토어에서 사용할 예약 정보 (API 응답에 class_schedules, users가 포함될 수 있음)
export interface StoreReservation extends ApiReservation {
  class_schedules?: ClassSchedule & {
    // API 서비스의 ReservationWithSchedule과 유사하게
    classes?: {
      id: string;
      title: string;
      category?: string;
      instructor_id?: string;
      instructors?: {
        id: string;
        name: string;
      }[];
    };
  };
  users?: UserProfile;
  payment_status?: PaymentStatusType; // 아래 정의된 PaymentStatusType 사용
}

// 예약 관련 타입
export interface ReservationState extends LoadingState {
  currentReservation: StoreReservation | null;
  reservationHistory: StoreReservation[]; // API의 ReservationWithSchedule 대신 StoreReservation 사용
  selectedSchedule: Schedule | null; // Schedule 타입도 API 모델과 일치하는지 확인 필요
}

// export interface Reservation { // 기존 스토어 Reservation 정의 삭제 또는 StoreReservation으로 대체
//   id: string;
//   user_id: string;
//   class_id: string;
//   schedule_id: string;
//   status: ReservationStatus;
//   student_count: number;
//   payment_method: PaymentMethod;
//   payment_status: PaymentStatus;
//   created_at: string;
//   updated_at: string;
//   total_amount: number;
//   metadata?: Record<string, any>;
//   classInfo?: ClassInfo;
//   scheduleInfo?: Schedule;
// }

// ReservationStatus, PaymentMethod 는 ./models/reservation 에서 import 하므로 여기서 재정의 안 함
// UserProfile 은 ./models/user 에서 import 하므로 여기서 재정의 안 함

// PaymentStatus는 API 모델에 없으므로, 스토어에서만 사용할 타입으로 유지
export type PaymentStatusType = "pending" | "paid" | "refunded" | "failed" | "cancelled";

// 스케줄 관련 타입
export interface ScheduleState extends LoadingState {
  schedules: Schedule[];
  classes: ClassInfo[];
  filters: ScheduleFilters;
  selectedDate: string;
  selectedView: "day" | "week" | "month";
}

export interface Schedule {
  id: string;
  class_id: string;
  date: string;
  duration: number;
  capacity: number;
  remaining_seats: number;
  is_cancelled: boolean;
  instructor_id?: string;
  location?: string;
  metadata?: Record<string, any>;
  availabilityStatus?: AvailabilityStatus;
}

export interface ClassInfo {
  id: string;
  title: string;
  description?: string;
  category?: string;
  price: number;
  original_price?: number;
  capacity: number;
  duration: number;
  image_url?: string;
  instructor_id?: string;
  curriculum?: string[];
  benefits?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ScheduleFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  dateRange?: [string, string];
  instructorId?: string;
  availabilityStatus?: AvailabilityStatus;
  searchTerm?: string;
}

export type AvailabilityStatus = "available" | "low" | "full" | "cancelled";

// 사용자 관련 타입
export interface UserState extends LoadingState {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
}

export interface User {
  id: string;
  email?: string;
  role?: UserRole;
  created_at?: string;
  metadata?: Record<string, any>;
}

export interface UserPreferences {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  theme?: "light" | "dark" | "system";
  language?: string;
  timezone?: string;
}

export type UserRole = "admin" | "instructor" | "student" | "guest";
