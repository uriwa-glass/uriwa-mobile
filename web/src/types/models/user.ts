import { AuthChangeEvent, Session, User as SupabaseUser } from "@supabase/supabase-js";

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

// 사용자 프로필
export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  membership_level: MembershipLevel;
  role: UserRole;
  created_at: string;
  updated_at: string;
  session_count?: number;
  notes?: string;
  email_notifications?: boolean;
  push_notifications?: boolean;
  marketing_notifications?: boolean;
  class_reminders?: boolean;
  community_notifications?: boolean;
}

// 회원 등급
export type MembershipLevel = "REGULAR" | "SILVER" | "GOLD" | "VIP";

// 사용자 역할
export type UserRole = "user" | "admin" | "instructor";

// 인증 상태
export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  error: Error | null;
}

// 인증 컨텍스트
export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  error: Error | null;
  signIn: (provider: string) => Promise<void>;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: UserMetadata) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

// 인증 변경 핸들러
export type AuthChangeHandler = (event: AuthChangeEvent, session: Session | null) => void;
