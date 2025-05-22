import React, { createContext, useContext, useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase, fetchOrCreateUserProfile } from "../api/supabaseClient";
import { UserProfile } from "../types/models/user";

// 기본 인증 컨텍스트 타입
export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  isLoggedIn: boolean;
  initialized: boolean;
  signIn: (provider: string) => Promise<void>;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

// 기본 컨텍스트 생성
const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  error: null,
  isLoggedIn: false,
  initialized: false,
  signIn: async () => {},
  signInWithEmailPassword: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  updateProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // 초기 세션 상태 로드 및 세션 변경 감지
  useEffect(() => {
    console.log("AuthContext: 초기 인증 상태 로딩 중");

    // 초기 사용자 및 세션 정보 로드
    const loadInitialAuthState = async () => {
      try {
        setLoading(true);

        // 현재 세션 가져오기
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("세션 로드 오류:", sessionError);
          throw sessionError;
        }

        if (sessionData?.session) {
          console.log("세션 정보 로드됨:", sessionData.session.user.id);
          setSession(sessionData.session);
          setUser(sessionData.session.user);
          setIsLoggedIn(true);

          // 프로필 정보 로드
          try {
            const userProfile = await fetchOrCreateUserProfile(sessionData.session.user.id);
            if (userProfile) {
              setProfile(userProfile);
            }
          } catch (profileError) {
            console.error("프로필 로드 오류:", profileError);
          }
        } else {
          console.log("유효한 세션 없음");
          setUser(null);
          setSession(null);
          setProfile(null);
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error("인증 상태 초기화 중 오류:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    // 인증 상태 변경 감지 리스너
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log(`인증 상태 변경: ${event}`, newSession?.user?.id);

      if (event === "SIGNED_IN" && newSession) {
        setSession(newSession);
        setUser(newSession.user);
        setIsLoggedIn(true);

        // 프로필 정보 로드
        try {
          const userProfile = await fetchOrCreateUserProfile(newSession.user.id);
          if (userProfile) {
            setProfile(userProfile);
          }
        } catch (profileError) {
          console.error("프로필 로드 오류:", profileError);
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setSession(null);
        setProfile(null);
        setIsLoggedIn(false);
      } else if (event === "TOKEN_REFRESHED" && newSession) {
        setSession(newSession);
        setUser(newSession.user);
      }
    });

    // 초기 인증 상태 로드
    loadInitialAuthState();

    // 클린업 함수: 리스너 제거
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 소셜 로그인 (OAuth)
  const signIn = async (provider: string) => {
    try {
      setLoading(true);
      console.log(`${provider} 로그인 시작`);

      // 로컬 개발 환경에서 콜백 URL 설정
      const isDev = process.env.NODE_ENV === "development";
      const isLocalhost =
        window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

      // 고정 리디렉션 URL 사용
      // 중요: 이 URL은 구글 콘솔에 등록된 URI와 정확히 일치해야 함
      // 127.0.0.1:54321/auth/v1/callback은 직접 Supabase로 리디렉션됨
      const redirectTo = "http://127.0.0.1:3000/auth/callback";

      console.log(
        `로그인 환경: ${isDev ? "개발" : "프로덕션"}, 호스트: ${window.location.hostname}`
      );
      console.log(`로그인 리디렉션 URL(하드코딩): ${redirectTo}`);

      // 디버깅 정보 출력
      console.log(`Supabase 인증 시도: ${provider}`);
      console.log(`현재 URL: ${window.location.href}`);
      console.log(`리디렉션 URL: ${redirectTo}`);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: redirectTo,
          skipBrowserRedirect: false,
          // queryParams 추가 (구글 로그인용)
          queryParams:
            provider === "google"
              ? {
                  // 승인된 JavaScript 원본에 등록된 도메인과 일치해야 함
                  prompt: "consent",
                  access_type: "offline",
                }
              : undefined,
        },
      });

      if (error) {
        console.error(`${provider} 로그인 오류:`, error);

        // 오류 메시지 변환
        if (error.message.includes("provider is not enabled")) {
          throw new Error(
            `${provider} 로그인이 현재 시스템에서 활성화되어 있지 않습니다. 개발 환경에서는 이메일 로그인을 이용해주세요.`
          );
        }

        throw error;
      }

      console.log(`${provider} 로그인 프로세스 시작됨`, data);
    } catch (err) {
      console.error("로그인 실패:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  // 이메일/비밀번호 로그인
  const signInWithEmailPassword = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log(`이메일 로그인 시작: ${email}`);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log("이메일 로그인 성공");
    } catch (err) {
      console.error("이메일 로그인 실패:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  // 회원가입
  const signUp = async (email: string, password: string, metadata = {}) => {
    try {
      setLoading(true);
      console.log(`회원가입 시작: ${email}`);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;

      console.log("회원가입 성공");
    } catch (err) {
      console.error("회원가입 실패:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃
  const signOut = async () => {
    try {
      setLoading(true);
      console.log("로그아웃 시작");

      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      // 상태 초기화는 onAuthStateChange 리스너에서 처리됨
      console.log("로그아웃 성공");
    } catch (err) {
      console.error("로그아웃 실패:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  // 프로필 업데이트
  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      setLoading(true);

      if (!user) {
        throw new Error("로그인 상태가 아닐 때 프로필을 업데이트할 수 없습니다");
      }

      console.log(`프로필 업데이트 중: ${user.id}`, data);

      const { data: updatedProfile, error } = await supabase
        .from("user_profiles")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        console.error("프로필 업데이트 오류:", error);
        throw error;
      }

      console.log("프로필 업데이트 성공");
      setProfile(updatedProfile as UserProfile);
    } catch (err) {
      console.error("프로필 업데이트 실패:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  // 컨텍스트 값
  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    error,
    isLoggedIn,
    initialized,
    signIn,
    signInWithEmailPassword,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 인증 컨텍스트 훅
export const useAuth = () => useContext(AuthContext);
