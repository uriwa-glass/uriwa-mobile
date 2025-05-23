import React, { createContext, useContext, useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase, fetchOrCreateUserProfile } from "../api/supabaseClient";
import { UserProfile } from "../types/models/user";
import { encryptPassword } from "../utils/encryption";
import { initKakaoSDK, loginWithKakao, KakaoUserInfo } from "../utils/kakaoAuth";

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
  signInWithKakao: () => Promise<void>;
  signInWithKakaoUser: (kakaoUserInfo: KakaoUserInfo) => Promise<void>;
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
  signInWithKakao: async () => {},
  signInWithKakaoUser: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // 초기화 시 카카오 SDK 초기화
  useEffect(() => {
    // 카카오 SDK 초기화를 안전하게 처리
    const initializeKakaoSDK = () => {
      console.log("🔵 AuthContext에서 카카오 SDK 초기화 시작");

      if (typeof window !== "undefined" && window.Kakao) {
        const result = initKakaoSDK();
        if (result) {
          console.log("🟢 AuthContext: 카카오 SDK 초기화 성공");
        } else {
          console.error("🔴 AuthContext: 카카오 SDK 초기화 실패");
        }
      } else {
        console.log("🟡 AuthContext: 카카오 SDK가 아직 로드되지 않음, 재시도 예정");
        // 1초 후 재시도
        setTimeout(initializeKakaoSDK, 1000);
      }
    };

    // DOM 로드 완료 후 초기화
    if (document.readyState === "complete") {
      initializeKakaoSDK();
    } else {
      window.addEventListener("load", initializeKakaoSDK);
      return () => window.removeEventListener("load", initializeKakaoSDK);
    }
  }, []);

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

          // 프로필 정보 로드 (비동기적으로 처리, 초기화와 독립적)
          fetchOrCreateUserProfile(sessionData.session.user.id)
            .then((userProfile) => {
              if (userProfile) {
                setProfile(userProfile);
              }
            })
            .catch((profileError) => {
              console.error("프로필 로드 오류:", profileError);
            });
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
        // 세션 로드 실패 시에도 초기화 완료로 처리
        setUser(null);
        setSession(null);
        setProfile(null);
        setIsLoggedIn(false);
      } finally {
        // 항상 초기화 완료로 설정
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

        // 로그인 완료 시 즉시 초기화 완료로 설정 (프로필 로딩과 분리)
        setInitialized(true);

        // 프로필 정보 로드 (비동기적으로 처리, 초기화와 독립적)
        fetchOrCreateUserProfile(newSession.user.id)
          .then((userProfile) => {
            if (userProfile) {
              setProfile(userProfile);
            }
          })
          .catch((profileError) => {
            console.error("프로필 로드 오류:", profileError);
          });
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setSession(null);
        setProfile(null);
        setIsLoggedIn(false);
        setInitialized(true);
      } else if (event === "TOKEN_REFRESHED" && newSession) {
        setSession(newSession);
        setUser(newSession.user);
        setInitialized(true);
      } else if (event === "INITIAL_SESSION") {
        // 초기 세션 로드 시에도 초기화 완료로 설정
        setInitialized(true);
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

      // 비밀번호 암호화
      const encryptedPassword = encryptPassword(password);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: encryptedPassword,
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

      // 비밀번호 암호화
      const encryptedPassword = encryptPassword(password);

      const { data, error } = await supabase.auth.signUp({
        email,
        password: encryptedPassword,
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

  // 카카오 로그인
  const signInWithKakao = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔵 카카오 로그인 시작");

      // 카카오 SDK 초기화 확인
      if (!window.Kakao || !window.Kakao.isInitialized()) {
        console.log("🔴 카카오 SDK 초기화 중...");
        initKakaoSDK();
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 대기
      }

      if (!window.Kakao || !window.Kakao.isInitialized()) {
        throw new Error("카카오 SDK 초기화에 실패했습니다.");
      }

      console.log("🟢 카카오 SDK 초기화 완료");

      // 카카오 사용자 정보 가져오기
      console.log("🔵 카카오 사용자 정보 요청 중...");
      const kakaoUser = await loginWithKakao();
      console.log("🟢 카카오 사용자 정보 수신:", kakaoUser);

      if (!kakaoUser || !kakaoUser.id) {
        throw new Error("카카오 사용자 정보를 가져올 수 없습니다.");
      }

      // 이메일 확인
      const email = kakaoUser.kakao_account?.email;
      if (!email) {
        throw new Error(
          "카카오 계정에서 이메일 정보를 가져올 수 없습니다. 카카오 계정 설정에서 이메일을 공개로 설정해주세요."
        );
      }

      console.log("🟢 카카오 이메일:", email);

      // 카카오 사용자를 위한 임시 비밀번호 생성
      const tempPassword = `kakao_${kakaoUser.id}_temp_password`;
      const encryptedTempPassword = encryptPassword(tempPassword);
      console.log("🟢 임시 비밀번호 생성 완료");

      // 기존 사용자인지 확인 (로그인 시도)
      console.log("🔵 기존 사용자 확인 중...");
      try {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: encryptedTempPassword,
        });

        if (signInData?.user && !signInError) {
          console.log("🟢 기존 카카오 사용자 로그인 성공");
          return;
        }
      } catch (tempError) {
        console.log("🔵 기존 사용자 아님, 신규 가입 진행");
      }

      // 새 사용자라면 회원가입
      console.log("🔵 신규 카카오 사용자 가입 중...");
      const { data, error } = await supabase.auth.signUp({
        email,
        password: encryptedTempPassword,
        options: {
          data: {
            full_name: kakaoUser.kakao_account?.profile?.nickname || `카카오사용자${kakaoUser.id}`,
            avatar_url: kakaoUser.kakao_account?.profile?.profile_image_url,
            auth_provider: "kakao",
            kakao_id: kakaoUser.id.toString(),
          },
        },
      });

      if (error) {
        console.error("🔴 카카오 회원가입 오류:", error);
        throw error;
      }

      console.log("🟢 카카오 회원가입 성공:", data);
    } catch (err) {
      console.error("🔴 카카오 로그인 실패:", err);
      setError(err instanceof Error ? err : new Error("카카오 로그인에 실패했습니다."));
    } finally {
      setLoading(false);
    }
  };

  // 카카오 사용자 정보로 로그인 (콜백에서 사용)
  const signInWithKakaoUser = async (kakaoUser: KakaoUserInfo) => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔵 카카오 사용자 정보로 로그인 시작:", kakaoUser);

      if (!kakaoUser || !kakaoUser.id) {
        throw new Error("카카오 사용자 정보를 가져올 수 없습니다.");
      }

      // 이메일 확인
      const email = kakaoUser.kakao_account?.email;
      if (!email) {
        throw new Error(
          "카카오 계정에서 이메일 정보를 가져올 수 없습니다. 카카오 계정 설정에서 이메일을 공개로 설정해주세요."
        );
      }

      console.log("🟢 카카오 이메일:", email);

      // 카카오 사용자를 위한 임시 비밀번호 생성
      const tempPassword = `kakao_${kakaoUser.id}_temp_password`;
      const encryptedTempPassword = encryptPassword(tempPassword);
      console.log("🟢 임시 비밀번호 생성 완료");

      // 기존 사용자인지 확인 (로그인 시도)
      console.log("🔵 기존 사용자 확인 중...");
      try {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: encryptedTempPassword,
        });

        if (signInData?.user && !signInError) {
          console.log("🟢 기존 카카오 사용자 로그인 성공");
          return;
        }
      } catch (tempError) {
        console.log("🔵 기존 사용자 아님, 신규 가입 진행");
      }

      // 새 사용자라면 회원가입
      console.log("🔵 신규 카카오 사용자 가입 중...");
      const { data, error } = await supabase.auth.signUp({
        email,
        password: encryptedTempPassword,
        options: {
          data: {
            full_name: kakaoUser.kakao_account?.profile?.nickname || `카카오사용자${kakaoUser.id}`,
            avatar_url: kakaoUser.kakao_account?.profile?.profile_image_url,
            auth_provider: "kakao",
            kakao_id: kakaoUser.id.toString(),
          },
        },
      });

      if (error) {
        console.error("🔴 카카오 회원가입 오류:", error);
        throw error;
      }

      console.log("🟢 카카오 회원가입 성공:", data);
    } catch (err) {
      console.error("🔴 카카오 사용자 로그인 실패:", err);
      setError(err instanceof Error ? err : new Error("카카오 로그인에 실패했습니다."));
      throw err; // 콜백 페이지에서 에러를 처리할 수 있도록 다시 throw
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
    signInWithKakao,
    signInWithKakaoUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 인증 컨텍스트 훅
export const useAuth = () => useContext(AuthContext);
