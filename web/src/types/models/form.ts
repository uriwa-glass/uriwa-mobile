// 문의 관련 타입
export interface Inquiry {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status?: "new" | "in-progress" | "resolved";
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

// 폼 필드 타입
export interface FormField {
  id: string;
  type: "text" | "textarea" | "select" | "checkbox" | "radio" | "date" | "file" | "email" | "tel";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: string;
  order: number;
}

// 폼 템플릿 타입
export interface FormTemplate {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// 폼 제출 타입
export interface FormSubmission {
  id?: string;
  template_id: string;
  user_id?: string;
  data: Record<string, any>;
  status: "submitted" | "reviewed" | "processed";
  created_at?: string;
  updated_at?: string;
}
