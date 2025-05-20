import React, { createContext, useContext, useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../api/supabaseClient";
import { AuthContextType, UserProfile } from "../types/models/user";

// 기본 컨텍스트 생성
const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  initialized: false,
  error: null,
  signIn: async () => {},
  signInWithEmailPassword: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  refreshSession: async () => {},
  updateProfile: async () => {},
});

// 세션 가져오기에 대한 타임아웃 설정 (밀리초 단위)
const SESSION_FETCH_TIMEOUT = 10000;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 초기 세션 상태 로드 및 세션 변경 감지
  useEffect(() => {
    console.log("AuthContext: Loading initial auth state");
    let isMounted = true; // 컴포넌트 마운트 상태 추적

    // 안전하게 초기화 상태를 완료로 설정하는 함수
    const completeInitialization = () => {
      if (isMounted && !initialized) {
        console.log("AuthContext: Forcing initialization complete");
        setLoading(false);
        setInitialized(true);
      }
    };

    // 로컬 스토리지에서 직접 세션 확인
    // Supabase API가 응답하지 않을 때 대비
    const checkLocalStorageSession = () => {
      try {
        if (typeof window === "undefined") return false;

        // Supabase는 로컬 스토리지에 세션 정보를 저장함
        const supabaseSessionKey = Object.keys(localStorage).find(
          (key) => key.startsWith("sb-") && key.endsWith("-auth-token")
        );

        if (supabaseSessionKey) {
          const sessionStr = localStorage.getItem(supabaseSessionKey);
          if (sessionStr) {
            try {
              const sessionData = JSON.parse(sessionStr);
              console.log("AuthContext: Found session in localStorage", !!sessionData);
              return true;
            } catch (e) {
              console.error("AuthContext: Error parsing localStorage session", e);
            }
          }
        }

        console.log("AuthContext: No session found in localStorage");
        return false;
      } catch (err) {
        console.error("AuthContext: Error checking localStorage session", err);
        return false;
      }
    };

    // 타임아웃 설정 - 인증 정보 가져오기가 지정된 시간 내에 완료되지 않으면 강제로 초기화 완료 처리
    const timeoutId = setTimeout(() => {
      console.log(`AuthContext: Auth fetch timed out after ${SESSION_FETCH_TIMEOUT}ms`);

      // 로컬 스토리지에서 세션 확인 시도
      const hasLocalSession = checkLocalStorageSession();

      // 상태 업데이트
      if (isMounted) {
        if (hasLocalSession) {
          console.log("AuthContext: Using session from localStorage due to timeout");
          // refreshSession()을 호출하여 세션 복구 시도
          refreshSession().catch((e) => {
            console.error("AuthContext: Failed to refresh session after timeout", e);
          });
        }

        // 초기화 강제 완료
        completeInitialization();
      }
    }, SESSION_FETCH_TIMEOUT);

    const loadInitialAuthState = async () => {
      if (!isMounted) return;

      try {
        setLoading(true);
        console.log("AuthContext: Getting user from Supabase - STARTING");

        // getUser()로 변경: 현재 사용자 정보만 가져오기
        const { data: userData, error: userError } = await supabase.auth.getUser();
        console.log("AuthContext: getUser response received");

        if (userError) {
          console.error("AuthContext: User fetch error", userError);
          throw userError;
        }

        console.log("AuthContext: User data", userData?.user);

        if (userData?.user) {
          setUser(userData.user);

          // 사용자가 있으면 세션도 가져옴 (필요한 토큰 정보를 위해)
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session) {
            setSession(sessionData.session);
          }

          // 사용자 프로필 가져오기
          await fetchUserProfile(userData.user.id);
        } else {
          // 사용자가 없으면 로그인되지 않은 상태
          setUser(null);
          setSession(null);
          setProfile(null);
        }

        if (isMounted) {
          clearTimeout(timeoutId); // 성공적으로 완료되면 타임아웃 취소
          setLoading(false);
          setInitialized(true);
          console.log("AuthContext: Initialization complete");
        }
      } catch (err) {
        console.error("AuthContext: Failed to load initial auth state:", err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
          setInitialized(true); // 에러가 발생해도 초기화는 완료로 간주
        }
      }
    };

    // 세션 변경 이벤트 구독
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log(`AuthContext: Auth state changed: ${event}`, newSession);

      if (isMounted) {
        // 이벤트 발생 시 로딩 상태 업데이트
        setLoading(true);

        // 세션 업데이트
        setSession(newSession);

        // 사용자 정보 업데이트
        if (newSession?.user) {
          setUser(newSession.user);
          await fetchUserProfile(newSession.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }

        // 이벤트 처리 완료 후 로딩 상태 업데이트
        setLoading(false);

        // 이 시점에서 초기화되지 않았다면 초기화 완료로 설정
        if (!initialized) {
          setInitialized(true);
          console.log("AuthContext: Initialization complete after auth state change");
        }
      }
    });

    // 초기 인증 상태 로드 시작
    loadInitialAuthState();

    // Clean up the subscription, timeout, and mounted flag
    return () => {
      clearTimeout(timeoutId);
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 사용자 프로필 가져오기
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("AuthContext: Fetching user profile for", userId);

      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("AuthContext: Error fetching profile", error);
        throw error;
      }

      console.log("AuthContext: Profile data", data);
      setProfile(data as UserProfile);
    } catch (err) {
      console.error("AuthContext: Error fetching user profile:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      // 프로필 조회 실패시에도 null로 설정하여 UI에서 처리 가능하게 함
      setProfile(null);
    }
  };

  // OAuth 로그인
  const signIn = async (provider: string) => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (err) {
      console.error(`Error signing in with ${provider}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  // 이메일/비밀번호 로그인
  const signInWithEmailPassword = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (err) {
      console.error("Error signing in with email/password:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  // 회원가입
  const signUp = async (email: string, password: string, metadata = {}) => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;
    } catch (err) {
      console.error("Error signing up:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃
  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error("Error signing out:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  // 세션 새로고침
  const refreshSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.refreshSession();
      if (error) throw error;

      // 최신 사용자 정보 가져오기
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        setUser(userData.user);
        await fetchUserProfile(userData.user.id);
      }

      // 세션 정보 업데이트
      const { data: sessionData } = await supabase.auth.getSession();
      setSession(sessionData.session);
    } catch (err) {
      console.error("Error refreshing session:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  // 프로필 업데이트
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) {
      setError(new Error("No authenticated user"));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.from("user_profiles").update(data).eq("user_id", user.id);

      if (error) throw error;

      // 업데이트된 프로필 다시 가져오기
      await fetchUserProfile(user.id);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    initialized,
    error,
    signIn,
    signInWithEmailPassword,
    signUp,
    signOut,
    refreshSession,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
