/**
 * 인증 컨텍스트
 *
 * 이 파일은 애플리케이션 전체에서 사용할 인증 상태 관리 컨텍스트를 구현합니다.
 * React Context API를 사용하여 로그인, 로그아웃, 회원가입, 세션 관리 등을 처리합니다.
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase, auth as supabaseAuth, OAuthProvider } from "../api/supabaseClient";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";

// 사용자 프로필 타입 정의
export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

// AuthContext에서 제공할 값의 타입 정의
interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
  signInWithKakao: () => Promise<void>;
  signInWithNaver: () => Promise<void>;
}

// 기본값으로 사용할 컨텍스트 생성
const AuthContext = createContext({} as AuthContextType);

// AuthProvider 컴포넌트를 정의합니다.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // 세션 변경 이벤트 리스너를 설정하고 초기 세션을 가져옵니다.
  useEffect(() => {
    // 초기 상태 로드
    const loadInitialState = async () => {
      try {
        // 현재 세션 가져오기
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);

          // 사용자 프로필 가져오기
          await fetchUserProfile(currentSession.user.id);
        }
      } catch (error) {
        console.error("Failed to load initial auth state:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // 세션 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event);

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        await fetchUserProfile(newSession.user.id);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
    });

    loadInitialState();

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // 사용자 프로필 가져오기
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        throw error;
      }

      setProfile(data as UserProfile);
      setIsAdmin(data?.role === "admin");
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setProfile(null);
      setIsAdmin(false);
    }
  };

  // 이메일/비밀번호 로그인
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabaseAuth.signInWithEmail(email, password);
      return { error };
    } catch (error) {
      console.error("Error signing in:", error);
      return { error: error as Error };
    }
  };

  // 회원가입
  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabaseAuth.signUp(email, password);
      return { error };
    } catch (error) {
      console.error("Error signing up:", error);
      return { error: error as Error };
    }
  };

  // 로그아웃
  const signOut = async () => {
    try {
      await supabaseAuth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // 비밀번호 재설정
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabaseAuth.resetPassword(email);
      return { error };
    } catch (error) {
      console.error("Error resetting password:", error);
      return { error: error as Error };
    }
  };

  // 프로필 업데이트
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error("User not authenticated") };
    }

    try {
      const { error } = await supabase.from("user_profiles").update(data).eq("id", user.id);

      if (!error && profile) {
        setProfile({ ...profile, ...data });
      }

      return { error };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { error: error as Error };
    }
  };

  // OAuth로 로그인
  const signInWithOAuth = async (provider: OAuthProvider) => {
    try {
      if (Platform.OS !== "web") {
        // 모바일 환경에서는 웹뷰 브라우저를 사용하여 OAuth 흐름 처리
        const { data, error } = await supabaseAuth.signInWithOAuth(provider);

        if (error) {
          throw error;
        }

        if (data?.url) {
          const result = await WebBrowser.openAuthSessionAsync(
            data.url,
            "com.uriwa.mobile://auth-callback"
          );

          if (result.type === "success") {
            // URL에서 토큰을 추출하여 세션 설정
            const params = new URLSearchParams(result.url.split("#")[1]);
            const accessToken = params.get("access_token");
            const refreshToken = params.get("refresh_token");

            if (accessToken && refreshToken) {
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
            }
          }
        }
      } else {
        // 웹 환경에서는 기본 리디렉션 흐름 사용
        const { error } = await supabaseAuth.signInWithOAuth(provider);
        if (error) {
          throw error;
        }
      }
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
    }
  };

  // 카카오로 로그인 (커스텀 OAuth)
  const signInWithKakao = async () => {
    try {
      // 카카오 OAuth는 Supabase 대시보드에서 커스텀 OAuth 제공자로 설정해야 합니다.
      // 이 예제에서는 사용자 정의 카카오 OAuth를 가정합니다.
      if (Platform.OS !== "web") {
        const { data, error } = await supabaseAuth.signInWithCustomOAuth(
          "kakao",
          "https://kauth.kakao.com/oauth"
        );

        if (error) {
          throw error;
        }

        if (data?.url) {
          const result = await WebBrowser.openAuthSessionAsync(
            data.url,
            "com.uriwa.mobile://auth-callback"
          );

          if (result.type === "success") {
            // URL에서 토큰을 추출하여 세션 설정
            const params = new URLSearchParams(result.url.split("#")[1]);
            const accessToken = params.get("access_token");
            const refreshToken = params.get("refresh_token");

            if (accessToken && refreshToken) {
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
            }
          }
        }
      } else {
        // 웹 환경에서는 기본 리디렉션 흐름 사용
        const { error } = await supabaseAuth.signInWithCustomOAuth(
          "kakao",
          "https://kauth.kakao.com/oauth"
        );
        if (error) {
          throw error;
        }
      }
    } catch (error) {
      console.error("Error signing in with Kakao:", error);
    }
  };

  // 네이버로 로그인 (커스텀 OAuth)
  const signInWithNaver = async () => {
    try {
      // 네이버 OAuth는 Supabase 대시보드에서 커스텀 OAuth 제공자로 설정해야 합니다.
      // 이 예제에서는 사용자 정의 네이버 OAuth를 가정합니다.
      if (Platform.OS !== "web") {
        const { data, error } = await supabaseAuth.signInWithCustomOAuth(
          "naver",
          "https://nid.naver.com/oauth2.0"
        );

        if (error) {
          throw error;
        }

        if (data?.url) {
          const result = await WebBrowser.openAuthSessionAsync(
            data.url,
            "com.uriwa.mobile://auth-callback"
          );

          if (result.type === "success") {
            // URL에서 토큰을 추출하여 세션 설정
            const params = new URLSearchParams(result.url.split("#")[1]);
            const accessToken = params.get("access_token");
            const refreshToken = params.get("refresh_token");

            if (accessToken && refreshToken) {
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
            }
          }
        }
      } else {
        // 웹 환경에서는 기본 리디렉션 흐름 사용
        const { error } = await supabaseAuth.signInWithCustomOAuth(
          "naver",
          "https://nid.naver.com/oauth2.0"
        );
        if (error) {
          throw error;
        }
      }
    } catch (error) {
      console.error("Error signing in with Naver:", error);
    }
  };

  // 컨텍스트 값 제공
  const value = {
    user,
    session,
    profile,
    isLoading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    signInWithOAuth,
    signInWithKakao,
    signInWithNaver,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 컨텍스트 사용을 위한 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
