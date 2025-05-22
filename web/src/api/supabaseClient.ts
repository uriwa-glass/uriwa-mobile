import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { UserInquiry } from "../types/models/inquiry";
import { FormTemplate, FormSubmission } from "../types/models/form";
import { UserProfile, CreateUserProfile } from "../types/models/user";

/**
 * Supabase 클라이언트 및 관련 API 함수
 * 
 * ⚠️ 현재 알려진 이슈:
 * 1. user_profiles 테이블의 RLS 정책에서 무한 재귀 문제 발생
 *    - 오류 메시지: "infinite recursion detected in policy for relation "user_profiles""
 *    - 임시 조치: 오류 발생 시 메모리 내 임시 프로필 생성하여 UI 표시
 * 
 * 🔧 향후 수정 방안:
 * 1. Supabase Studio에서 user_profiles 테이블의 RLS 정책 수정
 *    - 현재 중복되거나 순환 참조하는 정책 제거
 *    - 다음과 같은 단순화된 정책 추가:
 *      a. 인증된 사용자는 자신의 프로필 조회/수정 가능
 *      b. 서비스 롤은 모든 프로필 접근 가능
 *      c. 관리자는 모든 프로필 접근 가능
 * 
 * 📝 참고: 
 * - 현재 구현은 임시 조치로, 서버 측 RLS 정책이 수정되면 제거 필요
 * - RLS 정책 수정 후에도 fallback 로직은 안정성을 위해 유지 권장
 */

// 환경 변수 확인 및 로깅
const isDev = process.env.NODE_ENV === "development";

// 로컬 개발용 URL
const localUrl = process.env.REACT_APP_SUPABASE_URL || "http://127.0.0.1:54321";

// 클라우드 URL
const cloudUrl = process.env.REACT_APP_SUPABASE_CLOUD_URL || "https://uspesxpwtedjzmffimyc.supabase.co";

// 각 환경별 URL 설정
const supabaseUrl = isDev ? localUrl : cloudUrl;

// API 키 설정 - 환경 변수에서 가져옵니다
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 
  (isDev 
    ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" 
    : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzcGVzeHB3dGVkanptZmZpbXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NzUyODUsImV4cCI6MjA2MzE1MTI4NX0.1H4wPP3CpFhJHbdb18gtqbOeG41zc0ZncG-QCqufPEI");

// 로컬 개발 환경에서 콜백 URL 설정
const authCallbackURL = isDev 
  ? `${window.location.origin}/auth/callback` 
  : window.location.origin;

// 무시해도 되는 Supabase 오류 목록
const IGNORABLE_ERROR_MESSAGES = [
  "infinite recursion detected in policy",
  "foreign key constraint",
  "JWSError JWSInvalidSignature",
  "JWT expired",
  "No API key found",
  "Network request failed",
  "Failed to fetch",
  "AbortError",
  "The user aborted a request",
];

// 오류 로깅 관리 함수
const logSupabaseError = (context: string, error: any, level: 'error' | 'warn' | 'info' = 'error', force: boolean = false) => {
  // 오류가 문자열인 경우
  const errorMessage = typeof error === 'string' 
    ? error 
    : error?.message || error?.error_description || JSON.stringify(error);
  
  // 무시 가능한 오류인지 확인
  const isIgnorable = IGNORABLE_ERROR_MESSAGES.some(msg => errorMessage.includes(msg));
  
  // 개발 환경이거나 무시할 수 없는 오류인 경우, 또는 강제 로깅인 경우에만 로깅
  if (!isIgnorable || force || (isDev && level === 'error')) {
    if (level === 'error') {
      console.error(`[Supabase] ${context}:`, error);
    } else if (level === 'warn') {
      console.warn(`[Supabase] ${context}:`, error);
    } else {
      console.info(`[Supabase] ${context}:`, error);
    }
  }
  
  // 개발 환경에서는 무시할 수 있는 오류도 디버그 정보로 표시
  if (isIgnorable && isDev && level === 'error' && !force) {
    console.debug(`[Supabase] 무시된 오류 (${context}):`, errorMessage);
  }
  
  return { isIgnorable, errorMessage };
};

// 콘솔에 Supabase 연결 정보 로깅 (민감 정보는 제외)
console.log(`[Supabase] URL: ${supabaseUrl}`);
console.log(`[Supabase] Anon key available: ${!!supabaseAnonKey}`);
console.log(`[Supabase] Environment: ${isDev ? "DEVELOPMENT (local)" : "PRODUCTION (cloud)"}`);
console.log(`[Supabase] Auth callback URL: ${authCallbackURL}`);
console.log(`[Supabase] Window location: ${window.location.origin}`);
console.log(`[Supabase] Running on: ${window.location.hostname}`);

// 클라이언트 초기화 설정
const clientOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'supabase_auth_token',
  },
  global: {
    // Supabase API 요청 타임아웃 설정 (밀리초)
    fetch: (input: RequestInfo | URL, init?: RequestInit) => {
      const controller = new AbortController();
      const { signal } = controller;

      // 8초 후 요청 취소
      const timeoutId = setTimeout(() => {
        controller.abort();
        logSupabaseError("요청 타임아웃", `${typeof input === 'string' ? input : 'request'}`, 'warn');
      }, 8000);

      return fetch(input, { ...init, signal })
        .then((response) => {
          clearTimeout(timeoutId);
          return response;
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          // 무시해도 되는 오류인지 확인
          const { isIgnorable } = logSupabaseError("요청 실패", error, 'warn');
          throw error;
        });
    },
  },
};

// 환경 변수가 제대로 설정되었는지 확인
if (!supabaseAnonKey) {
  console.error("REACT_APP_SUPABASE_ANON_KEY is missing. Authentication will not work properly.");
}

// Supabase 클라이언트
export const supabase = createClient(supabaseUrl, supabaseAnonKey, clientOptions);

// 인증용 클라이언트도 동일하게 설정 (환경에 따라 다르게)
export const authClient = supabase;

// 초기화 시도 실행
(async () => {
  try {
    console.log("Supabase 초기화 시작...");

    // getUser() 함수로 변경
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      logSupabaseError("초기화 오류", userError, 'warn');
    } else {
      const isUserLoggedIn = !!userData?.user;
      console.log("Supabase 초기화 성공. 사용자 로그인 상태:", isUserLoggedIn);

      // 사용자가 로그인되어 있으면 추가 정보 확인
      if (isUserLoggedIn) {
        console.log("현재 사용자 ID:", userData.user?.id);

        // 세션 정보도 가져옴
        const { data: sessionData } = await supabase.auth.getSession();
        const hasValidSession = !!sessionData?.session;

        // 브라우저 콘솔에서 쉽게 확인할 수 있도록 전역 변수에 상태 저장
        // (디버깅 목적으로만 사용)
        if (typeof window !== "undefined") {
          (window as any).__SUPABASE_AUTH_CHECK = {
            userLoggedIn: isUserLoggedIn,
            userId: userData.user?.id,
            hasSession: hasValidSession,
            timestamp: new Date().toISOString(),
          };
        }
      }
    }
  } catch (err) {
    logSupabaseError("초기화 중 예외 발생", err);
  }
})();

// 로그인 상태 확인 - getUser() 사용
export const checkAuth = async (): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      logSupabaseError("인증 상태 확인 중 오류", error, 'warn');
      return null;
    }
    return data.user;
  } catch (err) {
    logSupabaseError("checkAuth 함수 내 예외", err, 'warn');
    return null;
  }
};

// 프로필 정보 가져오기
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    if (!userId) {
      logSupabaseError("getUserProfile 호출 오류", "빈 userId로 호출됨", 'warn');
      return null;
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      logSupabaseError("프로필 조회 중 오류", error, 'warn');
      return null;
    }

    return data as UserProfile;
  } catch (err) {
    logSupabaseError("getUserProfile 함수 내 예외", err, 'warn');
    return null;
  }
};

// 사용자 프로필 생성하기
export const createUserProfile = async (
  defaultProfile: CreateUserProfile
): Promise<UserProfile> => {
  const { data: newProfile, error: insertError } = await supabase
    .from("user_profiles")
    .insert(defaultProfile)
    .select()
    .single();

  if (insertError) {
    logSupabaseError("프로필 생성 중 오류", insertError);
    throw insertError;
  }

  return newProfile;
};

// 프로필 생성 시도 캐시 - 중복 시도 방지
const profileCreationAttempts = new Map<string, boolean>();
// 프로필 캐시 - 동일 세션 내 중복 요청 방지
const profileCache = new Map<string, UserProfile>();

// 사용자 프로필 가져오기 또는 생성하기
export const fetchOrCreateUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log(`사용자 ID로 프로필 조회 중: ${userId}`);
    
    // 캐시된 프로필이 있으면 반환
    if (profileCache.has(userId)) {
      console.log("캐시된 프로필 반환");
      return profileCache.get(userId)!;
    }
    
    // 기존 프로필 조회 시도
    const { data: existingProfile, error: fetchError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    
    // 프로필이 이미 존재하면 캐시하고 반환
    if (existingProfile) {
      console.log("기존 프로필 발견:", existingProfile);
      profileCache.set(userId, existingProfile as UserProfile);
      return existingProfile as UserProfile;
    }
    
    // 프로필이 없는 경우, 사용자 정보 가져오기
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      logSupabaseError("사용자 정보 가져오기 실패", userError || "사용자 데이터 없음");
      // 임시 프로필 생성
      const fallbackProfile = await createFallbackProfile(userId);
      profileCache.set(userId, fallbackProfile);
      return fallbackProfile;
    }
    
    const user = userData.user;
    
    // 새 프로필 생성
    const newProfile: Omit<UserProfile, "id" | "created_at" | "updated_at"> = {
      user_id: userId,
      display_name: user.email?.split("@")[0] || "사용자",
      full_name: user.user_metadata?.full_name || "",
      avatar_url: user.user_metadata?.avatar_url || "",
      membership_level: "REGULAR",
      role: "user",
    };
    
    console.log("새 프로필 생성 중:", newProfile);
    
    try {
      // 프로필 DB에 삽입 시도
      const { data: insertedProfile, error: insertError } = await supabase
        .from("user_profiles")
        .insert([newProfile])
        .select()
        .single();
      
      if (insertError) {
        const { isIgnorable } = logSupabaseError("프로필 생성 중 오류", insertError, 'warn');
        
        // RLS 정책 무한 재귀 오류 확인
        if (insertError.message.includes("infinite recursion detected in policy")) {
          console.info("RLS 정책 오류 감지됨. 임시 프로필을 대신 제공합니다.");
          const fallbackProfile = await createFallbackProfile(userId);
          profileCache.set(userId, fallbackProfile);
          return fallbackProfile;
        }
        
        // 외래 키 제약 조건 오류인 경우 retry 로직
        if (insertError.message.includes("foreign key constraint")) {
          console.info("외래 키 제약 조건 오류. 지연 후 재시도...");
          
          // 1초 지연
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // 다시 시도
          try {
            const { data: retryProfile, error: retryError } = await supabase
              .from("user_profiles")
              .insert([newProfile])
              .select()
              .single();
            
            if (retryError) {
              logSupabaseError("프로필 재생성 중 오류", retryError, 'warn');
              // 임시 프로필 생성
              const fallbackProfile = await createFallbackProfile(userId);
              profileCache.set(userId, fallbackProfile);
              return fallbackProfile;
            }
            
            profileCache.set(userId, retryProfile as UserProfile);
            return retryProfile as UserProfile;
          } catch (retryEx) {
            logSupabaseError("프로필 재생성 시도 중 예외", retryEx, 'warn');
            // 임시 프로필 생성
            const fallbackProfile = await createFallbackProfile(userId);
            profileCache.set(userId, fallbackProfile);
            return fallbackProfile;
          }
        }
        
        // 기타 오류 - 임시 프로필 생성
        const fallbackProfile = await createFallbackProfile(userId);
        profileCache.set(userId, fallbackProfile);
        return fallbackProfile;
      }
      
      console.log("새 프로필 생성됨:", insertedProfile);
      profileCache.set(userId, insertedProfile as UserProfile);
      return insertedProfile as UserProfile;
    } catch (insertEx) {
      logSupabaseError("프로필 삽입 중 예외 발생", insertEx, 'warn');
      // 임시 프로필 생성
      const fallbackProfile = await createFallbackProfile(userId);
      profileCache.set(userId, fallbackProfile);
      return fallbackProfile;
    }
    
  } catch (err) {
    logSupabaseError("프로필 가져오기/생성 중 예외 발생", err, 'warn');
    // 임시 프로필 생성
    const fallbackProfile = await createFallbackProfile(userId);
    profileCache.set(userId, fallbackProfile);
    return fallbackProfile;
  }
};

// 임시 프로필 생성 함수
const createFallbackProfile = async (userId: string): Promise<UserProfile> => {
  try {
    // 사용자 정보 가져오기 시도
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    
    return {
      id: userId,
      user_id: userId,
      display_name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "임시 사용자",
      full_name: user?.user_metadata?.full_name || "",
      avatar_url: user?.user_metadata?.avatar_url || "",
      membership_level: "REGULAR" as const,
      role: "user" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as UserProfile;
  } catch (err) {
    logSupabaseError("임시 프로필 생성 중 오류", err, 'warn', true);
    
    // 최소한의 정보로 프로필 생성
    return {
      id: userId,
      user_id: userId,
      display_name: "임시 사용자",
      full_name: "",
      avatar_url: "",
      membership_level: "REGULAR" as const,
      role: "user" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as UserProfile;
  }
};

// 문의 등록
export const submitInquiry = async (inquiry: UserInquiry): Promise<UserInquiry[]> => {
  const { data, error } = await supabase.from("inquiries").insert([inquiry]);

  if (error) {
    throw error;
  }

  return data || [];
};

// 동적 폼 템플릿 가져오기
export const getFormTemplate = async (id: string): Promise<FormTemplate> => {
  const { data, error } = await supabase.from("form_templates").select("*").eq("id", id).single();

  if (error) {
    throw error;
  }

  return data as FormTemplate;
};

// 활성화된 문의 폼 템플릿 가져오기
export const getActiveInquiryTemplate = async (): Promise<FormTemplate> => {
  const { data, error } = await supabase
    .from("form_templates")
    .select("*")
    .eq("is_active", true)
    .ilike("title", "%문의%")
    .limit(1)
    .single();

  if (error) {
    throw error;
  }

  return data as FormTemplate;
};

// 폼 제출 저장
export const submitFormData = async (submission: {
  templateId: string;
  userId?: string;
  data: Record<string, any>;
  status: string;
}): Promise<FormSubmission[]> => {
  const { data, error } = await supabase.from("form_submissions").insert([
    {
      template_id: submission.templateId,
      user_id: submission.userId,
      data: submission.data,
      status: submission.status,
    },
  ]);

  if (error) {
    throw error;
  }

  return (data || []) as FormSubmission[];
};
