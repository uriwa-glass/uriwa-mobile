import { AuthChangeEvent, Session, User as SupabaseUser } from "@supabase/supabase-js";
import { z } from "zod";

// 사용자 기본 타입
export interface User extends SupabaseUser {
  // 기존 타입을 Supabase User 타입으로 확장
}

// 사용자 메타데이터
export interface UserMetadata {
  full_name?: string;
  avatar_url?: string;
  provider?: string;
}

// 회원 등급
export type MembershipLevel = "FREE" | "REGULAR" | "PREMIUM" | "VIP";

// 사용자 역할
export type UserRole = "user" | "admin" | "moderator";

// Zod 스키마로 사용자 프로필 정의
export const membershipLevelSchema = z.enum(["REGULAR", "SILVER", "GOLD", "VIP"]);
export const userRoleSchema = z.enum(["user", "admin", "instructor"]);

// 프로필 생성을 위한 스키마 (필수 필드만)
export const createUserProfileSchema = z.object({
  id: z.string(),
  user_id: z.string().optional(),
  display_name: z.string(),
  full_name: z.string().optional(),
  avatar_url: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  membership_level: membershipLevelSchema.default("REGULAR").optional(),
  role: userRoleSchema.default("user"),
  created_at: z.string(),
  updated_at: z.string(),
});

// 전체 사용자 프로필 스키마 (모든 필드 포함)
export const userProfileSchema = createUserProfileSchema.extend({
  session_count: z.number().optional(),
  notes: z.string().optional(),
  email_notifications: z.boolean().optional(),
  push_notifications: z.boolean().optional(),
  marketing_notifications: z.boolean().optional(),
  class_reminders: z.boolean().optional(),
  community_notifications: z.boolean().optional(),
});

// 스키마로부터 타입 추출
export type CreateUserProfile = z.infer<typeof createUserProfileSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;

// 인증 상태
export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  error: Error | null;
  isLoggedIn: boolean;
}

// 인증 변경 핸들러
export type AuthChangeHandler = (event: AuthChangeEvent, session: Session | null) => void;
