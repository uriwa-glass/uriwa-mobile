// 모든 타입 정의 내보내기

// 사용자 관련 타입
export * from "./models/user";

// 수업 관련 타입
export * from "./models/class";

// 예약 및 취소 관련 타입
export * from "./models/reservation";

// API 관련 타입
export * from "./models/api";

// 폼 관련 타입
export * from "./models/form";

// 세션 관련 타입 추가
export * from "./models/session";

// 문의 관련 타입 추가
export * from "./models/inquiry";

// 수업 가용성 관련 타입
export interface ScheduleWithAvailability {
  id: string;
  class_id: string;
  date: string;
  duration: number;
  capacity: number;
  remaining_seats: number;
  is_cancelled: boolean;
  created_at: string;
  updated_at: string;
  availabilityStatus: string;
  classes?: any; // 유연성을 위해 any 타입 사용
  cancellation_reason?: string;
  instructor_id?: string;
  location?: string;
}

// 기본 타입 (이전 정의)
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  membership_level: "REGULAR" | "SILVER" | "GOLD" | "VIP";
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: string;
  title: string;
  description: string;
  price: number;
  capacity: number;
  duration: number;
  category: string;
  type: "REGULAR" | "SPECIAL" | "WORKSHOP" | "EVENT";
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ClassSchedule {
  id: string;
  class_id: string;
  date: string;
  duration: number;
  capacity: number;
  remaining_seats: number;
  is_cancelled: boolean;
  classes?: Class;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: string;
  user_id: string;
  class_schedule_id: string;
  status: "confirmed" | "cancelled" | "attended" | "no-show";
  student_count: number;
  total_price: number;
  payment_method?: string;
  payment_id?: string;
  class_schedules?: ClassSchedule;
  users?: UserProfile;
  created_at: string;
  updated_at: string;
}

export interface Cancellation {
  id: string;
  reservation_id: string;
  cancelled_by_id: string;
  reason?: string;
  refund_amount: number;
  refund_rate: number;
  refund_status: "pending" | "completed" | "failed";
  reservations?: Reservation;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FilterOptions {
  status?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
  category?: string;
  [key: string]: string | undefined;
}
