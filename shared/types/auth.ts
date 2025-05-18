import { Session, User } from "@supabase/supabase-js";

export type UserRole = "user" | "admin" | "instructor";

export interface UserProfile {
  id: string;
  display_name: string;
  avatar_url?: string;
  role: UserRole;
  email_verified: boolean;
  phone?: string;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isInstructor: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any | null }>;
}
