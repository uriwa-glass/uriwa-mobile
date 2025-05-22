import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../api/supabaseClient";
import Layout from "../../components/Layout";
import Button from "../../components/Button";
import { FormField } from "@/types/models/form";

// 타입 정의
interface FormDataState {
  title: string;
  description: string;
  fields: FormField[]; // 초기에는 빈 배열
  is_active: boolean;
  // version, created_at, updated_at 등은 서버에서 자동 생성 또는 제출 시 추가
}

interface FormErrors {
  title?: string;
  description?: string; // description 에러 타입 추가
  // 필요에 따라 다른 필드 에러 타입 추가
}

const FormCreate = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormDataState>({
    title: "",
    description: "",
    fields: [],
    is_active: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth/login");
          return;
        }
        const { data: profileData } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("user_id", user.id)
          .single();
        if (!profileData || profileData.role !== "admin") {
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        navigate("/");
      }
    };
    checkAdmin();
  }, [navigate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked; // type="radio" 용

    setFormData((prev) => ({
      ...prev,
      [name]: type === "radio" ? value === "true" : value, // is_active 처리
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    }
  };

  const handleIsActiveChange = (value: boolean) => {
    setFormData((prev) => ({ ...prev, is_active: value }));
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "템플릿 제목을 입력해주세요.";
    }
    // description은 필수가 아니므로 유효성 검사 생략 (필요시 추가)
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("form_templates")
        .insert([
          {
            title: formData.title,
            description: formData.description,
            fields: formData.fields, // 초기에는 빈 배열
            is_active: formData.is_active,
            version: 1, // 초기 버전
            created_at: now,
            updated_at: now,
            // notification_emails 등 필요한 기본값 추가 가능
          },
        ])
        .select("id") // id만 선택하여 반환
        .single(); // 단일 객체 반환 보장

      if (error) throw error;

      if (data && data.id) {
        navigate(`/admin/form-edit/${data.id}`);
      } else {
        throw new Error("템플릿 생성 후 ID를 받지 못했습니다.");
      }
    } catch (error) {
      console.error("Error creating template:", error);
      alert("템플릿 생성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (
    fieldName: keyof FormErrors,
    baseClass = "w-full p-3 border rounded-sm text-md bg-background-light text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-main"
  ) => `${baseClass} ${errors[fieldName] ? "border-error-main" : "border-border-medium"}`;

  return (
    <Layout title="폼 템플릿 생성">
      <div className="p-4">
        <h1 className="text-xl text-text-primary mb-5">새 폼 템플릿 생성</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-6 bg-background-paper rounded-md p-5">
            <h2 className="text-lg text-text-primary mb-4 pb-2 border-b border-border-light">
              기본 정보
            </h2>

            <div className="mb-4">
              <label htmlFor="title" className="block text-md font-bold text-text-primary mb-2">
                템플릿 제목 *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="예: 문의 양식, 수업 신청서 등"
                className={inputClass("title")}
              />
              {errors.title && <p className="text-error-main text-sm mt-1">{errors.title}</p>}
            </div>

            <div className="mb-4">
              <label
                htmlFor="description"
                className="block text-md font-bold text-text-primary mb-2"
              >
                템플릿 설명
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="이 폼의 용도나 작성 방법에 대한 설명을 입력하세요."
                className={`${inputClass(
                  "description",
                  "min-h-[100px] resize-y w-full p-3 border rounded-sm text-md bg-background-light text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-main"
                )}`}
                rows={3}
              />
            </div>

            <div className="mb-4">
              <label className="block text-md font-bold text-text-primary mb-2">상태</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="is_active"
                    value="true"
                    checked={formData.is_active === true}
                    onChange={() => handleIsActiveChange(true)}
                    className="form-radio h-4 w-4 text-primary-main focus:ring-primary-light border-gray-300"
                  />
                  <span className="ml-2 text-md text-text-primary">활성</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="is_active"
                    value="false"
                    checked={formData.is_active === false}
                    onChange={() => handleIsActiveChange(false)}
                    className="form-radio h-4 w-4 text-primary-main focus:ring-primary-light border-gray-300"
                  />
                  <span className="ml-2 text-md text-text-primary">비활성</span>
                </label>
              </div>
            </div>
          </div>

          {/* 필드 추가/편집 UI는 form-edit 페이지에서 처리 */}
          <p className="text-sm text-text-secondary mb-6">
            템플릿의 상세 필드는 생성 후 "필드 편집" 화면에서 구성할 수 있습니다.
          </p>

          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/form-templates")}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="inline-block w-4 h-4 border-2 border-gray-200 border-t-primary-contrast rounded-full animate-spin mr-2"></div>
                  생성 중...
                </div>
              ) : (
                "템플릿 생성 및 필드 편집"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default FormCreate;
