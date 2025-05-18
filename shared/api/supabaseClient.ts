/**
 * Supabase 클라이언트 설정
 *
 * 이 파일은 웹과 모바일 앱에서 공통으로 사용하는 Supabase 클라이언트를 설정합니다.
 */

import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Provider 타입 정의 (Supabase에서 지원하는 OAuth 제공자)
export type OAuthProvider =
  | "google"
  | "apple"
  | "facebook"
  | "github"
  | "gitlab"
  | "twitter"
  | "discord"
  | "twitch"
  | "slack"
  | "spotify"
  | "azure"
  | "bitbucket"
  | "keycloak"
  | "linkedin"
  | "notion"
  | "workos";

// Expo 환경에서 보안 스토리지 어댑터 설정
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

// 네이티브 환경에서 사용할 스토리지 결정
const getStorageAdapter = () => {
  if (Platform.OS === "web") {
    return undefined; // 웹에서는 기본 localStorage 사용
  }

  // iOS 또는 Android의 경우 SecureStore 사용
  return ExpoSecureStoreAdapter;
};

// 환경 변수에서 Supabase URL과 Anon Key를 가져옵니다.
const getSupabaseUrl = (): string => {
  // 웹 환경
  if (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return process.env.NEXT_PUBLIC_SUPABASE_URL;
  }

  // Expo 환경
  if (Constants.expoConfig?.extra?.supabaseUrl) {
    return Constants.expoConfig.extra.supabaseUrl;
  }

  // 기본값 (개발 환경용)
  return "your-supabase-project-url";
};

const getSupabaseAnonKey = (): string => {
  // 웹 환경
  if (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }

  // Expo 환경
  if (Constants.expoConfig?.extra?.supabaseAnonKey) {
    return Constants.expoConfig.extra.supabaseAnonKey;
  }

  // 기본값 (개발 환경용)
  return "your-supabase-anon-key";
};

// Supabase URL과 Anon Key 가져오기
const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

// 유효한 URL과 Key가 없는 경우 오류 메시지 출력
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL과 Anon Key가 설정되지 않았습니다. 환경 변수 또는 app.config.js를 확인하세요."
  );
}

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === "web" ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web",
  },
});

// 타입 및 인터페이스 정의
export interface AuthResponse {
  user: any;
  session: any;
  error: Error | null;
}

// 인증 관련 함수
export const auth = {
  // 이메일/비밀번호 로그인
  signInWithEmail: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  // 로그아웃
  signOut: async () => {
    return await supabase.auth.signOut();
  },

  // 현재 사용자 정보 가져오기
  getCurrentUser: async () => {
    return await supabase.auth.getUser();
  },

  // 세션 정보 가져오기
  getSession: async () => {
    return await supabase.auth.getSession();
  },

  // 회원가입
  signUp: async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password });
  },

  // 비밀번호 재설정
  resetPassword: async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email);
  },

  // OAuth 로그인 (OAuth 제공자와 함께 사용)
  signInWithOAuth: async (provider: OAuthProvider) => {
    const redirectUri =
      Constants.expoConfig?.extra?.oauthRedirectUri || "http://localhost:3000/auth-callback";

    return await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUri,
      },
    });
  },

  // 커스텀 OAuth 제공자 로그인 (예: 카카오, 네이버)
  signInWithCustomOAuth: async (provider: string, providerUrl: string) => {
    const redirectUri =
      Constants.expoConfig?.extra?.oauthRedirectUri || "http://localhost:3000/auth-callback";

    // 이 부분은 커스텀 OAuth 제공자를 위한 것으로,
    // 실제 구현 시에는 Supabase 대시보드에서 커스텀 OAuth 제공자를 설정해야 합니다.
    return await supabase.auth.signInWithOAuth({
      provider: provider as OAuthProvider,
      options: {
        redirectTo: redirectUri,
        skipBrowserRedirect: Platform.OS !== "web",
      },
    });
  },
};

// 데이터베이스 관련 함수
export const database = {
  // 사용자 프로필 가져오기
  getUserProfile: async (userId: string) => {
    return await supabase.from("user_profiles").select("*").eq("id", userId).single();
  },

  // 사용자 프로필 업데이트
  updateUserProfile: async (userId: string, data: any) => {
    return await supabase.from("user_profiles").update(data).eq("id", userId);
  },

  // 클래스 목록 가져오기
  getClasses: async () => {
    return await supabase.from("classes").select("*").order("created_at", { ascending: false });
  },

  // 클래스 일정 가져오기
  getClassSchedules: async (classId: string) => {
    return await supabase
      .from("class_schedules")
      .select("*")
      .eq("class_id", classId)
      .order("start_time", { ascending: true });
  },

  // 예약 생성하기
  createReservation: async (data: {
    schedule_id: string;
    user_id: string;
    session_id?: string;
  }) => {
    return await supabase.from("class_reservations").insert([data]);
  },
};

// 스토리지 관련 함수
export const storage = {
  // 갤러리 이미지 업로드
  uploadGalleryImage: async (file: File, path: string) => {
    return await supabase.storage.from("gallery").upload(path, file);
  },

  // 프로필 이미지 업로드
  uploadAvatar: async (file: any, userId: string) => {
    const filePath = `${userId}/avatar`;
    return await supabase.storage.from("avatars").upload(filePath, file, {
      upsert: true,
    });
  },

  // 이미지 URL 가져오기
  getImageUrl: (bucket: string, path: string) => {
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  },
};

export default supabase;
