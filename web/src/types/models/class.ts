// 수업 기본 타입
export interface Class {
  id: string;
  title: string;
  description: string;
  price: number;
  capacity: number;
  duration: number;
  category: string;
  type: ClassType;
  image_url?: string;
  instructor_id?: string;
  location?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 수업 유형
export type ClassType = "REGULAR" | "SPECIAL" | "WORKSHOP" | "EVENT";

// 수업 카테고리
export type ClassCategory = "YOGA" | "PILATES" | "FITNESS" | "DANCE" | "MEDITATION" | "OTHER";

// 수업 난이도
export type ClassLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL";

// 수업 일정
export interface ClassSchedule {
  id: string;
  class_id: string;
  date: string;
  duration: number;
  capacity: number;
  remaining_seats: number;
  is_cancelled: boolean;
  cancellation_reason?: string;
  instructor_id?: string;
  location?: string;
  classes?: Class;
  created_at: string;
  updated_at: string;
}

// 수업 가능 여부 응답
export interface AvailabilityResponse {
  available: boolean;
  remaining_seats: number;
  total_capacity: number;
  class_id: string;
  schedule_id: string;
  message?: string;
}

// 수업 필터 옵션
export interface ClassFilterOptions {
  category?: ClassCategory;
  type?: ClassType;
  level?: ClassLevel;
  startDate?: string;
  endDate?: string;
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
  instructorId?: string;
  hasAvailability?: boolean;
}

// 수업 정렬 옵션
export type ClassSortOption = "date-asc" | "date-desc" | "price-asc" | "price-desc" | "popularity";

// 수업 일정 그룹 (날짜별)
export interface ScheduleGroup {
  date: string;
  schedules: ClassSchedule[];
}

// 인기 수업
export interface PopularClass {
  id: string;
  title: string;
  bookings_count: number;
  average_rating: number;
  image_url?: string;
}
