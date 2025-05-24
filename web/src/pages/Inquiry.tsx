import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../api/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import IconWrapper from "../components/IconWrapper";
import ImageUpload from "../components/ImageUpload";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaEdit,
  FaComments,
  FaImage,
  FaPaperPlane,
} from "react-icons/fa";

// 타입 정의
interface InquiryFormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  category: string;
  message: string;
  contact_preference: string;
  reference_images: string[];
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  category?: string;
  message?: string;
}

const initialFormState: InquiryFormState = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  category: "",
  message: "",
  contact_preference: "email",
  reference_images: [],
};

const Inquiry: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [form, setForm] = useState<InquiryFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (user && profile) {
      setForm((prev) => ({
        ...prev,
        name: profile.display_name || "",
        email: user.email || "",
        phone: profile.phone || "",
      }));
    }
  }, [user, profile]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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

  const handleImageUpload = (index: number, url: string) => {
    setForm((prev) => ({
      ...prev,
      reference_images: prev.reference_images.map((img, i) => (i === index ? url : img)),
    }));
  };

  const handleImageRemove = (index: number) => {
    setForm((prev) => ({
      ...prev,
      reference_images: prev.reference_images.filter((_, i) => i !== index),
    }));
  };

  const addImageSlot = () => {
    if (form.reference_images.length < 2) {
      setForm((prev) => ({
        ...prev,
        reference_images: [...prev.reference_images, ""],
      }));
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
    if (!form.category) newErrors.category = "문의 유형을 선택해주세요.";
    if (!form.message.trim()) newErrors.message = "문의 내용을 입력해주세요.";
    if (form.message.trim().length < 10)
      newErrors.message = "문의 내용은 최소 10자 이상 입력해주세요.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      // 빈 이미지 URL 제거
      const cleanedImages = form.reference_images.filter((url) => url.trim() !== "");

      // form_submissions 테이블에 데이터 삽입
      const { error } = await supabase.from("form_submissions").insert([
        {
          template_id: "unified-inquiry",
          user_id: user?.id,
          data: {
            ...form,
            reference_images: cleanedImages,
          },
          status: "submitted",
        },
      ]);

      if (error) {
        console.error("Submission error:", error);
        throw error;
      }

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
    `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent transition-colors ${
      errors[fieldName] ? "border-red-500" : "border-gray-300"
    }`;

  const selectClass = (fieldName: keyof FormErrors) =>
    `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent transition-colors bg-white ${
      errors[fieldName] ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8 lg:pl-16">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FF7648] rounded-full mb-4">
            <IconWrapper icon={FaComments} className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">문의하기</h1>
          <p className="text-lg text-gray-600">
            서비스 이용 중 궁금한 점이나 요청사항이 있으시면 언제든지 문의해주세요.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기본 정보 */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <IconWrapper icon={FaUser} className="mr-2 text-[#FF7648]" />
                  이름 *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={inputClass("name")}
                  placeholder="이름을 입력하세요"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <IconWrapper icon={FaEnvelope} className="mr-2 text-[#FF7648]" />
                  이메일 *
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass("email")}
                  placeholder="이메일 주소를 입력하세요"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <IconWrapper icon={FaPhone} className="mr-2 text-[#FF7648]" />
                연락처 *
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={inputClass("phone")}
                placeholder="연락처를 입력하세요 (010-1234-5678)"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* 문의 정보 */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <IconWrapper icon={FaEdit} className="mr-2 text-[#FF7648]" />
                  문의 유형 *
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={selectClass("category")}
                >
                  <option value="">문의 유형을 선택하세요</option>
                  <option value="class">수업 관련 문의</option>
                  <option value="schedule">일정 관련 문의</option>
                  <option value="payment">결제 관련 문의</option>
                  <option value="facility">시설 이용 문의</option>
                  <option value="reservation">예약 관련 문의</option>
                  <option value="other">기타 문의</option>
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  선호 연락 방법
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="contact_preference"
                      value="email"
                      checked={form.contact_preference === "email"}
                      onChange={handleChange}
                      className="mr-2 text-[#FF7648] focus:ring-[#FF7648]"
                    />
                    이메일
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="contact_preference"
                      value="phone"
                      checked={form.contact_preference === "phone"}
                      onChange={handleChange}
                      className="mr-2 text-[#FF7648] focus:ring-[#FF7648]"
                    />
                    전화
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">문의 제목 *</label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className={inputClass("subject")}
                placeholder="문의 제목을 입력하세요"
              />
              {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">문의 내용 *</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={6}
                className={`${inputClass("message")} resize-y`}
                placeholder="문의 내용을 자세히 입력해주세요 (최소 10자)"
              />
              {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
            </div>

            {/* 참고 이미지 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <IconWrapper icon={FaImage} className="mr-2 text-[#FF7648]" />
                참고 이미지 (선택사항)
              </label>
              <p className="text-sm text-gray-500 mb-4">
                문의 내용과 관련된 이미지가 있다면 첨부해주세요 (최대 2개)
              </p>

              {form.reference_images.map((url, index) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      참고 이미지 {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleImageRemove(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      제거
                    </button>
                  </div>
                  <ImageUpload
                    bucketName="portfolio-images"
                    currentImageUrl={url || undefined}
                    onImageUploaded={(newUrl) => handleImageUpload(index, newUrl)}
                    onImageRemoved={() => handleImageUpload(index, "")}
                    maxWidth={800}
                    maxHeight={600}
                  />
                </div>
              ))}

              {form.reference_images.length < 2 && (
                <button
                  type="button"
                  onClick={addImageSlot}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-[#FF7648] hover:text-[#E85A2A] hover:border-[#FF7648] transition-colors"
                >
                  + 참고 이미지 추가
                </button>
              )}
            </div>

            {/* 제출 버튼 */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#FF7648] text-white py-4 rounded-lg hover:bg-[#E85A2A] transition-colors font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    문의 접수 중...
                  </>
                ) : (
                  <>
                    <IconWrapper icon={FaPaperPlane} className="mr-2" />
                    문의하기
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Inquiry;
