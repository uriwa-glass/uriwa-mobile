import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../../../shared/api/supabaseClient";
import { useAuth } from "../../../../shared/contexts/AuthContext";
import theme from "../../../../shared/styles/theme";
import DynamicForm from "../../../../shared/components/DynamicForm";
import { FormField, FormTemplate, FormSubmission } from "../../../../shared/types/forms";

export default function DynamicInquiryScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();

  // 상태 관리
  const [inquiryTemplate, setInquiryTemplate] = useState<FormTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 초기값 설정
  const initialValues = {
    name: profile?.display_name || "",
    email: user?.email || "",
    phone: (profile as any)?.phone || "",
  };

  // 문의 폼 템플릿 로드
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 문의 템플릿 로드 (is_active=true, title='문의 양식' 으로 필터링)
        const { data, error } = await supabase
          .from("form_templates")
          .select("*")
          .eq("is_active", true)
          .ilike("title", "%문의%")
          .limit(1)
          .single();

        if (error) {
          // 템플릿이 없으면 기본 템플릿 생성
          createDefaultTemplate();
          return;
        }

        // 템플릿 데이터 변환
        setInquiryTemplate({
          id: data.id,
          title: data.title,
          description: data.description || "",
          isActive: data.is_active,
          fields: data.fields,
          version: data.version,
          notificationEmails: data.notification_emails || [],
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        });
      } catch (error) {
        console.error("Error loading inquiry template:", error);
        setError("문의 양식을 불러오는 중 오류가 발생했습니다.");
        // 템플릿이 없으면 기본 템플릿 생성
        createDefaultTemplate();
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, []);

  // 기본 문의 템플릿 생성
  const createDefaultTemplate = () => {
    const defaultFields: FormField[] = [
      {
        id: "name",
        type: "text",
        label: "이름",
        placeholder: "이름을 입력해주세요",
        validation: {
          required: true,
        },
      },
      {
        id: "email",
        type: "email",
        label: "이메일",
        placeholder: "이메일을 입력해주세요",
        validation: {
          required: true,
          pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
          customMessage: "유효한 이메일 주소를 입력해주세요.",
        },
      },
      {
        id: "phone",
        type: "tel",
        label: "연락처",
        placeholder: "연락처를 입력해주세요",
        validation: {
          required: true,
        },
      },
      {
        id: "subject",
        type: "text",
        label: "문의 제목",
        placeholder: "문의 제목을 입력해주세요",
        validation: {
          required: true,
          maxLength: 100,
        },
      },
      {
        id: "category",
        type: "select",
        label: "문의 유형",
        placeholder: "문의 유형을 선택해주세요",
        options: [
          { label: "수업 관련 문의", value: "class" },
          { label: "결제 관련 문의", value: "payment" },
          { label: "일정 관련 문의", value: "schedule" },
          { label: "기타 문의", value: "other" },
        ],
        validation: {
          required: true,
        },
      },
      {
        id: "message",
        type: "textarea",
        label: "문의 내용",
        placeholder: "문의 내용을 자세히 입력해주세요",
        validation: {
          required: true,
          minLength: 10,
        },
      },
      {
        id: "contact_preference",
        type: "radio",
        label: "선호하는 연락 방법",
        options: [
          { label: "이메일", value: "email" },
          { label: "전화", value: "phone" },
        ],
        defaultValue: "email",
      },
    ];

    setInquiryTemplate({
      id: "default",
      title: "문의하기",
      description:
        "수업 관련 문의나 기타 궁금하신 사항을 작성해 주시면 빠른 시일 내에 답변 드리겠습니다.",
      isActive: true,
      fields: defaultFields,
      version: 1,
      notificationEmails: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  // 폼 제출 처리
  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      setIsSubmitting(true);

      // Supabase에 데이터 저장
      const { error } = await supabase.from("inquiries").insert([
        {
          user_id: user?.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          // 추가 데이터가 있으면 JSON으로 저장
          additional_data: JSON.stringify({
            category: formData.category,
            contact_preference: formData.contact_preference,
          }),
        },
      ]);

      if (error) throw error;

      // 폼 템플릿이 있을 경우 form_submissions 테이블에도 저장
      if (inquiryTemplate && inquiryTemplate.id !== "default") {
        const submission: FormSubmission = {
          templateId: inquiryTemplate.id,
          userId: user?.id,
          data: formData,
          status: "submitted",
        };

        await supabase.from("form_submissions").insert([
          {
            template_id: submission.templateId,
            user_id: submission.userId,
            data: submission.data,
            status: submission.status,
          },
        ]);
      }

      Alert.alert("문의가 접수되었습니다", "빠른 시일 내에 답변드리겠습니다.", [
        {
          text: "확인",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      Alert.alert("문의 접수 실패", "문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 84 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>문의하기</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={styles.loadingText}>양식을 불러오는 중...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.push("/inquiry")}>
            <Text style={styles.retryText}>일반 문의 폼으로 이동</Text>
          </TouchableOpacity>
        </View>
      ) : inquiryTemplate ? (
        <ScrollView style={styles.formContainer}>
          <DynamicForm
            template={inquiryTemplate}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
            isLoading={isSubmitting}
          />
        </ScrollView>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.paper,
  },
  backButton: {
    marginRight: 16,
  },
  backText: {
    fontSize: 16,
    color: theme.colors.primary.main,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error.main,
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
  },
  retryText: {
    color: theme.colors.primary.contrast,
    fontSize: 16,
    fontWeight: "bold",
  },
  formContainer: {
    flex: 1,
  },
});
