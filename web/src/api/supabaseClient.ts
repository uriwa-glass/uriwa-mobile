import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { Inquiry, FormTemplate, FormSubmission, UserProfile } from "../types";

// 환경 변수가 없는 경우 테스트를 위한 기본값 제공
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || "https://example.supabase.co";
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || "test-anon-key";

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// 로그인 상태 확인
export const checkAuth = async (): Promise<User | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

// 프로필 정보 가져오기
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
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
