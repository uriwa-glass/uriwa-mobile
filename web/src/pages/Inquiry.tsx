import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../api/supabaseClient";
import Layout from "../components/Layout";
import Button from "../components/Button";

// 타입 정의
interface InquiryFormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

const initialFormState: InquiryFormState = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

const Inquiry = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<InquiryFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
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
          setForm((prev) => ({
            ...prev,
            name: profileData.display_name || "",
            email: authUser.email || "",
            phone: profileData.phone || "",
          }));
        }
      }
    };
    checkAuth();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = "이름을 입력해주세요.";
    if (!form.email.trim()) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "유효한 이메일 주소를 입력해주세요.";
    }
    if (!form.phone.trim()) newErrors.phone = "연락처를 입력해주세요.";
    if (!form.subject.trim()) newErrors.subject = "문의 제목을 입력해주세요.";
    if (!form.message.trim()) newErrors.message = "문의 내용을 입력해주세요.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setIsSubmitting(true);
      const { error } = await supabase.from("inquiries").insert([
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: form.subject,
          message: form.message,
          user_id: user?.id,
        },
      ]);
      if (error) throw error;
      alert("문의가 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.");
      navigate(-1);
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      alert("문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (fieldName: keyof FormErrors) =>
    `w-full p-3 border rounded-md text-md bg-background-light text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-main ${
      errors[fieldName] ? "border-error-main" : "border-border-medium"
    }`;

  return (
    <Layout title="고객 문의">
      <div className="p-5 bg-background-paper mb-4">
        <h2 className="text-lg font-bold text-text-primary mb-2">안내사항</h2>
        <p className="text-md text-text-secondary leading-relaxed">
          서비스 이용 중 불편한 점이나 궁금한 점이 있으시면 언제든지 문의해주세요. 최대한 빠르고
          친절하게 답변드리겠습니다.
        </p>
      </div>

      <div className="p-5 bg-background-paper rounded-md">
        <div className="flex items-center mb-4">
          <h1 className="text-xl font-bold text-text-primary mr-4">문의하기</h1>
          <Link
            to="/dynamic-inquiry"
            className="ml-auto inline-block no-underline bg-primary-light px-3 py-1.5 rounded-sm text-sm font-bold text-primary-dark"
          >
            동적 문의폼 가기
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="name" className="block text-md font-bold text-text-primary mb-2">
              이름
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={inputClass("name")}
              placeholder="이름을 입력하세요"
            />
            {errors.name && <p className="text-error-main text-sm mt-1">{errors.name}</p>}
          </div>

          <div className="mb-5">
            <label htmlFor="email" className="block text-md font-bold text-text-primary mb-2">
              이메일
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={inputClass("email")}
              placeholder="이메일 주소를 입력하세요"
            />
            {errors.email && <p className="text-error-main text-sm mt-1">{errors.email}</p>}
          </div>

          <div className="mb-5">
            <label htmlFor="phone" className="block text-md font-bold text-text-primary mb-2">
              연락처
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className={inputClass("phone")}
              placeholder="연락처를 입력하세요 (예: 010-1234-5678)"
            />
            {errors.phone && <p className="text-error-main text-sm mt-1">{errors.phone}</p>}
          </div>

          <div className="mb-5">
            <label htmlFor="subject" className="block text-md font-bold text-text-primary mb-2">
              문의 제목
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className={inputClass("subject")}
              placeholder="문의 제목을 입력하세요"
            />
            {errors.subject && <p className="text-error-main text-sm mt-1">{errors.subject}</p>}
          </div>

          <div className="mb-5">
            <label htmlFor="message" className="block text-md font-bold text-text-primary mb-2">
              문의 내용
            </label>
            <textarea
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              className={`${inputClass("message")} min-h-[120px] resize-y`}
              placeholder="문의 내용을 자세히 입력해주세요"
              rows={5}
            />
            {errors.message && <p className="text-error-main text-sm mt-1">{errors.message}</p>}
          </div>

          <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="inline-block w-5 h-5 border-2 border-gray-200 border-t-primary-contrast rounded-full animate-spin mr-2"></div>
                문의 접수 중...
              </div>
            ) : (
              "문의하기"
            )}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default Inquiry;
