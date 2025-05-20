import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { Inquiry, FormTemplate, FormSubmission, UserProfile } from "../types";

// 환경 변수 확인 및 로깅
const supabaseUrl =
  process.env.REACT_APP_SUPABASE_URL || "https://uspesxpwtedjzmffimyc.supabase.co";
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || "";

// 콘솔에 Supabase 연결 정보 로깅 (민감 정보는 제외)
console.log(`Initializing Supabase client with URL: ${supabaseUrl}`);
console.log(`Anon key available: ${!!supabaseAnonKey}`);

// 환경 변수가 제대로 설정되었는지 확인
if (!supabaseAnonKey) {
  console.error("REACT_APP_SUPABASE_ANON_KEY is missing. Authentication will not work properly.");
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    // Supabase API 요청 타임아웃 설정 (밀리초)
    fetch: (url, options) => {
      const controller = new AbortController();
      const { signal } = controller;

      // 8초 후 요청 취소
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.error(`Supabase 요청 타임아웃: ${url}`);
      }, 8000);

      return fetch(url, { ...options, signal })
        .then((response) => {
          clearTimeout(timeoutId);
          return response;
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          console.error("Supabase 요청 오류:", error);
          throw error;
        });
    },
  },
});

// 초기화 시도 실행
(async () => {
  try {
    console.log("Supabase 초기화 시작...");

    // getUser() 함수로 변경
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error("Supabase 초기화 오류:", userError);
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
    console.error("Supabase 초기화 오류:", err);
  }
})();

// 로그인 상태 확인 - getUser() 사용
export const checkAuth = async (): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error checking auth:", error);
      return null;
    }
    return data.user;
  } catch (err) {
    console.error("Error in checkAuth:", err);
    return null;
  }
};

// 프로필 정보 가져오기
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    if (!userId) {
      console.error("getUserProfile called with empty userId");
      return null;
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data as UserProfile;
  } catch (err) {
    console.error("Exception in getUserProfile:", err);
    return null;
  }
};

// 문의 등록
export const submitInquiry = async (inquiry: Inquiry): Promise<Inquiry[]> => {
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
