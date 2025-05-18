import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "../../../../shared/api/supabaseClient";
import { useAuth } from "../../../../shared/contexts/AuthContext";
import theme from "../../../../shared/styles/theme";
import DynamicForm from "../../../../shared/components/DynamicForm";
import { FormField, FormTemplate } from "../../../../shared/types/forms";

export default function ReservationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user, profile, isLoading: authLoading } = useAuth();

  // 상태 관리
  const [classData, setClassData] = useState<any>(null);
  const [reservationTemplate, setReservationTemplate] = useState<FormTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 초기값 설정
  const initialValues = {
    name: profile?.display_name || "",
    email: user?.email || "",
    phone: (profile as any)?.phone || "",
  };

  // 수업 데이터 및 폼 템플릿 로드
  useEffect(() => {
    const loadData = async () => {
      if (authLoading) return;
      if (!user) {
        Alert.alert("로그인 필요", "수업 신청을 위해 로그인해주세요.", [
          { text: "확인", onPress: () => router.push("/auth/signin") },
        ]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // 1. 수업 정보 로드
        const { data: classData, error: classError } = await supabase
          .from("classes")
          .select("*, class_introductions(*)")
          .eq("id", id)
          .single();

        if (classError) throw classError;
        setClassData(classData);

        // 2. 예약 폼 템플릿 로드
        const { data: templateData, error: templateError } = await supabase
          .from("form_templates")
          .select("*")
          .eq("is_active", true)
          .ilike("title", "%예약%")
          .limit(1)
          .single();

        if (templateError) {
          // 템플릿이 없으면 기본 템플릿 생성
          createDefaultTemplate(classData);
          return;
        }

        // 템플릿 데이터 변환
        setReservationTemplate({
          id: templateData.id,
          title: templateData.title,
          description: templateData.description || "",
          isActive: templateData.is_active,
          fields: templateData.fields,
          version: templateData.version,
          notificationEmails: templateData.notification_emails || [],
          createdAt: templateData.created_at,
          updatedAt: templateData.updated_at,
        });
      } catch (error) {
        console.error("Error loading data:", error);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, user, profile, authLoading]);

  // 기본 예약 템플릿 생성
  const createDefaultTemplate = (classData: any) => {
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
        id: "preferred_schedule",
        type: "select",
        label: "선호 일정",
        placeholder: "선호하는 일정을 선택해주세요",
        options: [
          { label: "평일 오전", value: "weekday_morning" },
          { label: "평일 오후", value: "weekday_afternoon" },
          { label: "평일 저녁", value: "weekday_evening" },
          { label: "주말 오전", value: "weekend_morning" },
          { label: "주말 오후", value: "weekend_afternoon" },
        ],
        validation: {
          required: true,
        },
      },
      {
        id: "experience_level",
        type: "radio",
        label: "경험 수준",
        options: [
          { label: "입문자", value: "beginner" },
          { label: "초급", value: "intermediate" },
          { label: "중급", value: "advanced" },
        ],
        defaultValue: "beginner",
      },
      {
        id: "special_requests",
        type: "textarea",
        label: "특별 요청사항",
        placeholder: "특별히 요청하실 사항이 있으면 입력해주세요",
      },
    ];

    setReservationTemplate({
      id: "default",
      title: `${classData.name || "수업"} 신청하기`,
      description: `${
        classData.class_introductions?.[0]?.title || classData.name || "수업"
      }에 대한 신청서입니다. 아래 양식을 작성해 주세요.`,
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
    if (!user || !classData) return;

    try {
      setIsSubmitting(true);

      // 예약 정보 저장
      const { error } = await supabase.from("class_reservations").insert([
        {
          class_id: classData.id,
          user_id: user.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          preferred_schedule: formData.preferred_schedule,
          experience_level: formData.experience_level,
          special_requests: formData.special_requests,
          status: "pending",
        },
      ]);

      if (error) throw error;

      // 폼 템플릿이 있을 경우 form_submissions 테이블에도 저장
      if (reservationTemplate && reservationTemplate.id !== "default") {
        await supabase.from("form_submissions").insert([
          {
            template_id: reservationTemplate.id,
            user_id: user.id,
            data: formData,
            status: "submitted",
          },
        ]);
      }

      Alert.alert("신청 완료", "수업 신청이 접수되었습니다. 확인 후 연락드리겠습니다.", [
        {
          text: "확인",
          onPress: () => router.replace("/(tabs)/classes"),
        },
      ]);
    } catch (error) {
      console.error("Error submitting reservation:", error);
      Alert.alert("신청 실패", "수업 신청 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
        <Text style={styles.loadingText}>정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (error || !classData) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error || "수업 정보를 찾을 수 없습니다."}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryText}>뒤로 가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        <Text style={styles.title}>수업 신청</Text>
      </View>

      <View style={styles.classInfo}>
        <Text style={styles.className}>{classData.name}</Text>
        {classData.class_introductions && classData.class_introductions[0] && (
          <Text style={styles.classSubtitle}>{classData.class_introductions[0].title}</Text>
        )}
      </View>

      {reservationTemplate ? (
        <ScrollView style={styles.formContainer}>
          <DynamicForm
            template={reservationTemplate}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
            isLoading={isSubmitting}
          />
        </ScrollView>
      ) : (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={styles.loadingText}>신청 양식을 준비하는 중...</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
  classInfo: {
    padding: 16,
    backgroundColor: theme.colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  className: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  classSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text.secondary,
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
