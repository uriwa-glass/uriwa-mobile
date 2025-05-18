import { z } from "zod";

/**
 * Zod 스키마 정의
 * API 응답 및 요청 데이터 유효성 검사를 위한 스키마 정의
 */

// 사용자 스키마
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().optional(),
  avatar_url: z.string().url().optional().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// 프로필 스키마
export const profileSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  nickname: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  birth_date: z.string().optional().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// 수업 스키마
export const classSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().optional().nullable(),
  instructor_id: z.string().uuid(),
  capacity: z.number().int().positive(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  location: z.string().optional().nullable(),
  is_online: z.boolean(),
  price: z.number().nonnegative().optional().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// 예약 스키마
export const reservationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  class_id: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "cancelled"]),
  payment_status: z.enum(["unpaid", "paid", "refunded"]).optional().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// 알림 스키마
export const notificationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string(),
  message: z.string(),
  is_read: z.boolean(),
  type: z.enum(["system", "class", "payment"]),
  reference_id: z.string().optional().nullable(),
  created_at: z.string().datetime(),
});

// 사용자 로그인 요청 스키마
export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// 사용자 회원가입 요청 스키마
export const signupRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(2),
});

// 해당 스키마를 사용하는 타입 추출
export type User = z.infer<typeof userSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Class = z.infer<typeof classSchema>;
export type Reservation = z.infer<typeof reservationSchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type SignupRequest = z.infer<typeof signupRequestSchema>;
