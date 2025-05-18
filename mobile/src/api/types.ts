/**
 * 데이터베이스 테이블 타입 정의
 */

// 사용자 테이블
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// 프로필 테이블
export interface Profile {
  id: string;
  user_id: string;
  nickname?: string;
  bio?: string;
  phone?: string;
  birth_date?: string;
  created_at: string;
  updated_at: string;
}

// 수업 테이블
export interface Class {
  id: string;
  title: string;
  description?: string;
  instructor_id: string;
  capacity: number;
  start_time: string;
  end_time: string;
  location?: string;
  is_online: boolean;
  price?: number;
  created_at: string;
  updated_at: string;
}

// 예약 테이블
export interface Reservation {
  id: string;
  user_id: string;
  class_id: string;
  status: "pending" | "confirmed" | "cancelled";
  payment_status?: "unpaid" | "paid" | "refunded";
  created_at: string;
  updated_at: string;
}

// 알림 테이블
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  type: "system" | "class" | "payment";
  reference_id?: string;
  created_at: string;
}

// 데이터베이스 테이블 이름
export enum Tables {
  Users = "users",
  Profiles = "profiles",
  Classes = "classes",
  Reservations = "reservations",
  Notifications = "notifications",
}
