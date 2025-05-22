import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { LoadingState, userSchema, loadingStateSchema } from "../types/models/store";
import { User, UserProfile } from "../types/models/user";
import { supabase } from "../api/supabaseClient";

// UserStore 인터페이스 정의
interface UserStore extends LoadingState {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  setCurrentUser: (user: User | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  clearUser: () => void;
  getCurrentUser: () => Promise<User | null>;
  fetchUserProfile: (userId: string) => Promise<UserProfile | null>;
  updateUserProfile: (userId: string, profileData: Partial<UserProfile>) => Promise<void>;
  uploadAvatar: (userId: string, file: File) => Promise<string | null>;
  logout: () => Promise<void>;
}

// 초기 상태 정의
const initialState = {
  currentUser: null,
  userProfile: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// userStore 생성
export const useUserStore = create<UserStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // 직접 사용자 설정
      setCurrentUser: (user: User | null) => {
        set({ currentUser: user, isAuthenticated: !!user });
      },

      // 직접 프로필 설정
      setUserProfile: (profile: UserProfile | null) => {
        set({ userProfile: profile });
      },

      // 사용자 정보 초기화
      clearUser: () => {
        set({ currentUser: null, userProfile: null, isAuthenticated: false });
      },

      // 현재 사용자 정보 가져오기
      getCurrentUser: async () => {
        try {
          set({ loading: true, error: null });
          const { data, error: userError } = await supabase.auth.getUser();
          if (userError) throw userError;

          if (data?.user) {
            const user = data.user as User; // Cast to your User type
            set({ currentUser: user, isAuthenticated: true, loading: false });
            // Optionally fetch profile right after getting user
            await get().fetchUserProfile(user.id);
            return user;
          } else {
            set({ currentUser: null, isAuthenticated: false, loading: false });
            return null;
          }
        } catch (error: any) {
          console.error("Error getting current user:", error);
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "사용자 정보를 가져오는 중 오류가 발생했습니다.",
          });
          return null;
        }
      },

      // 사용자 프로필 가져오기
      fetchUserProfile: async (userId: string) => {
        try {
          set({ loading: true, error: null });
          const { data, error } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", userId)
            .single();
          if (error) throw error;
          set({ userProfile: data as UserProfile, loading: false });
          return data as UserProfile;
        } catch (error: any) {
          console.error("Error fetching user profile:", error);
          set({
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "프로필 정보를 가져오는 중 오류가 발생했습니다.",
          });
          return null;
        }
      },

      // 사용자 프로필 업데이트
      updateUserProfile: async (userId: string, profileData: Partial<UserProfile>) => {
        try {
          set({ loading: true, error: null });
          const { data, error } = await supabase
            .from("user_profiles")
            .update(profileData)
            .eq("id", userId)
            .select()
            .single();
          if (error) throw error;
          set({ userProfile: data as UserProfile, loading: false });
          // Optionally update currentUser if parts of it are in userProfile
        } catch (error: any) {
          console.error("Error updating user profile:", error);
          set({
            loading: false,
            error:
              error instanceof Error ? error.message : "프로필 업데이트 중 오류가 발생했습니다.",
          });
          throw error;
        }
      },

      // 아바타 업로드
      uploadAvatar: async (userId: string, file: File) => {
        try {
          set({ loading: true, error: null });
          const fileExt = file.name.split(".").pop();
          const fileName = `${userId}-${Date.now()}.${fileExt}`;
          const filePath = `avatars/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("user-avatars") // Ensure this bucket exists and has RLS policies
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from("user-avatars")
            .getPublicUrl(filePath);

          set({ loading: false });
          return publicUrlData.publicUrl;
        } catch (error: any) {
          console.error("Error uploading avatar:", error);
          set({
            loading: false,
            error: error instanceof Error ? error.message : "아바타 업로드 중 오류가 발생했습니다.",
          });
          return null;
        }
      },

      logout: async () => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          set({ ...initialState }); // Reset to initial state on logout
        } catch (error: any) {
          set({ error: error.message || "Failed to logout", loading: false });
        }
      },
    }),
    { name: "UserStore" }
  )
);
