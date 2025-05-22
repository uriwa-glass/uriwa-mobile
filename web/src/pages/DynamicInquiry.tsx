import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../api/supabaseClient";
import Layout from "../components/Layout";
import DynamicForm from "../components/DynamicForm";
import { FormFieldExtended, FormTemplateExtended } from "@/types/models/form";

// 타입 정의
interface InquiryTemplate {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  fields: FormFieldExtended[];
  version: number;
  notification_emails: string[];
  created_at: string;
  updated_at: string;
}

const DynamicInquiry = () => {
  const navigate = useNavigate();

  const [inquiryTemplate, setInquiryTemplate] = useState<InquiryTemplate | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  const loadTemplateData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) {
        setUser(authUser);
        const { data: profileData } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", authUser.id)
          .single();
        if (profileData) {
          setProfile(profileData);
        }
      }

      const { data, error: templateError } = await supabase
        .from("form_templates")
        .select("*")
        .eq("is_active", true)
        .ilike("title", "%문의%")
        .limit(1)
        .single();

      if (templateError || !data) {
        createDefaultTemplate();
        return;
      }

      setInquiryTemplate({
        id: data.id,
        title: data.title,
        description: data.description || "",
        is_active: data.is_active,
        fields: data.fields as FormFieldExtended[],
        version: data.version,
        notification_emails: data.notification_emails || [],
        created_at: data.created_at,
        updated_at: data.updated_at,
      });
    } catch (err: any) {
      console.error("Error loading inquiry template:", err);
      setError("문의 양식을 불러오는 중 오류가 발생했습니다.");
      createDefaultTemplate();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplateData();
  }, []);

  const createDefaultTemplate = () => {
    const defaultFields: FormFieldExtended[] = [
      {
        id: "name",
        type: "text",
        label: "이름",
        placeholder: "이름을 입력해주세요",
        required: true,
        validation: [{ type: "required", message: "이름을 입력해주세요." }],
        style: {},
      },
      {
        id: "email",
        type: "email",
        label: "이메일",
        placeholder: "이메일을 입력해주세요",
        required: true,
        validation: [
          { type: "required", message: "이메일을 입력해주세요." },
          {
            type: "pattern",
            value: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
            message: "유효한 이메일 주소를 입력해주세요.",
          },
        ],
        style: {},
      },
      {
        id: "phone",
        type: "phone",
        label: "연락처",
        placeholder: "연락처를 입력해주세요 (010-1234-5678)",
        required: true,
        validation: [
          { type: "required", message: "연락처를 입력해주세요." },
          { type: "phone", message: "유효한 휴대폰 번호 형식이 아닙니다." },
        ],
        style: {},
      },
      {
        id: "subject",
        type: "text",
        label: "문의 제목",
        placeholder: "문의 제목을 입력해주세요",
        required: true,
        validation: [
          { type: "required", message: "문의 제목을 입력해주세요." },
          { type: "maxLength", value: 100, message: "문의 제목은 100자 이내로 입력해주세요." },
        ],
        style: {},
      },
      {
        id: "category",
        type: "select",
        label: "문의 유형",
        placeholder: "문의 유형을 선택해주세요",
        required: true,
        options: [
          { value: "class", label: "수업 관련 문의" },
          { value: "payment", label: "결제 관련 문의" },
          { value: "schedule", label: "일정 관련 문의" },
          { value: "other", label: "기타 문의" },
        ],
        validation: [{ type: "required", message: "문의 유형을 선택해주세요." }],
        style: {},
      },
      {
        id: "message",
        type: "textarea",
        label: "문의 내용",
        placeholder: "문의 내용을 자세히 입력해주세요",
        required: true,
        validation: [
          { type: "required", message: "문의 내용을 입력해주세요." },
          { type: "minLength", value: 10, message: "문의 내용은 최소 10자 이상 입력해주세요." },
        ],
        style: {},
      },
      {
        id: "contact_preference",
        type: "radio",
        label: "선호하는 연락 방법",
        required: false,
        options: [
          { value: "email", label: "이메일" },
          { value: "phone", label: "전화" },
        ],
        defaultValue: "email",
        style: {},
      },
    ];
    setInquiryTemplate({
      id: "default-inquiry-form",
      title: "기본 문의 양식",
      description: "서비스 관련 궁금한 점이나 불편한 점을 알려주세요.",
      is_active: true,
      fields: defaultFields,
      version: 1,
      notification_emails: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  };

  const getInitialValues = (): Record<string, any> => {
    const initial: Record<string, any> = {};
    if (profile) {
      initial.name = profile.display_name || "";
      initial.phone = profile.phone || "";
    }
    if (user) {
      initial.email = user.email || "";
    }
    return initial;
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      setIsSubmitting(true);
      const submissionData = {
        form_template_id: inquiryTemplate?.id,
        user_id: user?.id,
        form_data: formData,
        submitted_at: new Date().toISOString(),
      };
      const { error: submissionError } = await supabase
        .from("form_submissions")
        .insert([submissionData]);
      if (submissionError) throw submissionError;
      alert("문의가 성공적으로 접수되었습니다.");
      navigate(-1);
    } catch (err: any) {
      console.error("Error submitting inquiry:", err);
      setError("문의 제출 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleGoToBasicForm = () => {
    navigate("/inquiry");
  };

  if (isLoading) {
    return (
      <Layout title={inquiryTemplate?.title || "문의하기"}>
        <div className="flex flex-col items-center justify-center p-10 text-center">
          <div className="inline-block w-10 h-10 border-4 border-gray-200 border-t-primary-main rounded-full animate-spin mb-5"></div>
          <p className="text-md text-text-secondary">문의 양식을 불러오는 중...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="오류">
        <div className="flex flex-col items-center justify-center p-10 text-center">
          <p className="text-md text-error-main mb-5">{error}</p>
          <button
            onClick={loadTemplateData}
            className="px-4 py-2 bg-primary-main text-primary-contrast rounded-md hover:bg-primary-dark transition-colors"
          >
            다시 시도
          </button>
        </div>
      </Layout>
    );
  }

  if (!inquiryTemplate) {
    return (
      <Layout title="문의 양식 없음">
        <div className="flex flex-col items-center justify-center p-10 text-center">
          <p className="text-md text-text-secondary mb-5">
            사용 가능한 문의 양식이 없습니다. 잠시 후 다시 시도해주세요.
          </p>
        </div>
      </Layout>
    );
  }

  // FormTemplate 타입으로 변환하기 위한 필드 매핑
  const convertToFormTemplateExtended = (): FormTemplateExtended => {
    return {
      id: inquiryTemplate.id,
      title: inquiryTemplate.title,
      description: inquiryTemplate.description,
      fields: inquiryTemplate.fields,
      is_active: inquiryTemplate.is_active,
      created_at: inquiryTemplate.created_at,
      updated_at: inquiryTemplate.updated_at,
      submitButtonText: "문의 제출하기",
      cancelButtonText: "취소",
    };
  };

  return (
    <Layout title={inquiryTemplate.title}>
      <div className="p-4 md:p-6">
        {inquiryTemplate.description && (
          <p className="text-md text-text-secondary mb-6 leading-relaxed">
            {inquiryTemplate.description}
          </p>
        )}
        <DynamicForm
          template={convertToFormTemplateExtended()}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
          initialValues={getInitialValues()}
        />
        <div className="mt-6 text-center">
          <button
            onClick={handleGoToBasicForm}
            className="text-sm text-primary-main hover:underline"
          >
            기본 문의 양식으로 돌아가기
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default DynamicInquiry;
