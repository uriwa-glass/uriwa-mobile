import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../../../shared/api/supabaseClient";
import { useAuth } from "../../../../shared/contexts/AuthContext";
import theme from "../../../../shared/styles/theme";
import Button from "../../../../shared/components/Button";

// 타입 정의
interface InquiryForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export default function InquiryScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();

  // 상태 관리
  const [form, setForm] = useState<InquiryForm>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 사용자 정보가 있으면 자동으로 채우기
  useEffect(() => {
    if (user && profile) {
      setForm((prev) => ({
        ...prev,
        name: profile.display_name || "",
        email: user.email || "",
        phone: (profile as any).phone || "",
      }));
    }
  }, [user, profile]);

  // 입력값 변경 처리
  const handleChange = (name: keyof InquiryForm, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));

    // 에러 초기화
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // 폼 유효성 검사
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = "이름을 입력해주세요.";
    }

    if (!form.email.trim()) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "유효한 이메일 주소를 입력해주세요.";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "연락처를 입력해주세요.";
    }

    if (!form.subject.trim()) {
      newErrors.subject = "문의 제목을 입력해주세요.";
    }

    if (!form.message.trim()) {
      newErrors.message = "문의 내용을 입력해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 문의 제출 처리
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const { data, error } = await supabase
        .from("inquiries")
        .insert([
          {
            name: form.name,
            email: form.email,
            phone: form.phone,
            subject: form.subject,
            message: form.message,
            user_id: user?.id,
          },
        ])
        .select();

      if (error) throw error;

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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.title}>문의하기</Text>
          <TouchableOpacity
            style={styles.formSwitch}
            onPress={() => router.push("/inquiry/dynamic-inquiry")}
          >
            <Text style={styles.formSwitchText}>동적 폼 사용</Text>
          </TouchableOpacity>
        </View>

        {/* 안내 메시지 */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>궁금하신 점이 있으신가요?</Text>
          <Text style={styles.infoDescription}>
            수업 관련 문의나 기타 궁금하신 사항을 작성해 주시면 빠른 시일 내에 답변 드리겠습니다.
          </Text>
        </View>

        {/* 문의 폼 */}
        <View style={styles.formSection}>
          {/* 이름 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>이름 *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={form.name}
              onChangeText={(value) => handleChange("name", value)}
              placeholder="이름을 입력해주세요"
              placeholderTextColor={theme.colors.text.disabled}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* 이메일 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>이메일 *</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={form.email}
              onChangeText={(value) => handleChange("email", value)}
              placeholder="이메일을 입력해주세요"
              placeholderTextColor={theme.colors.text.disabled}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* 연락처 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>연락처 *</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              value={form.phone}
              onChangeText={(value) => handleChange("phone", value)}
              placeholder="연락처를 입력해주세요"
              placeholderTextColor={theme.colors.text.disabled}
              keyboardType="phone-pad"
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>

          {/* 문의 제목 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>문의 제목 *</Text>
            <TextInput
              style={[styles.input, errors.subject && styles.inputError]}
              value={form.subject}
              onChangeText={(value) => handleChange("subject", value)}
              placeholder="문의 제목을 입력해주세요"
              placeholderTextColor={theme.colors.text.disabled}
            />
            {errors.subject && <Text style={styles.errorText}>{errors.subject}</Text>}
          </View>

          {/* 문의 내용 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>문의 내용 *</Text>
            <TextInput
              style={[styles.textarea, errors.message && styles.inputError]}
              value={form.message}
              onChangeText={(value) => handleChange("message", value)}
              placeholder="문의 내용을 자세히 입력해주세요"
              placeholderTextColor={theme.colors.text.disabled}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            {errors.message && <Text style={styles.errorText}>{errors.message}</Text>}
          </View>

          {/* 제출 버튼 */}
          <Button
            title={isSubmitting ? "제출 중..." : "문의 제출하기"}
            variant="primary"
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={styles.submitButton}
          />
          {isSubmitting && (
            <ActivityIndicator
              size="small"
              color={theme.colors.primary.main}
              style={styles.loader}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
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
    flex: 1,
  },
  formSwitch: {
    backgroundColor: theme.colors.primary.light,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
  },
  formSwitchText: {
    fontSize: 12,
    color: theme.colors.primary.dark,
    fontWeight: "bold",
  },
  infoSection: {
    padding: 20,
    backgroundColor: theme.colors.background.paper,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.text.secondary,
  },
  formSection: {
    padding: 20,
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borderRadius.sm,
    padding: 12,
    fontSize: 16,
    backgroundColor: theme.colors.background.light,
    color: theme.colors.text.primary,
  },
  inputError: {
    borderColor: theme.colors.error.main,
  },
  textarea: {
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borderRadius.sm,
    padding: 12,
    fontSize: 16,
    backgroundColor: theme.colors.background.light,
    color: theme.colors.text.primary,
    minHeight: 120,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error.main,
    marginTop: 4,
  },
  submitButton: {
    marginTop: 16,
  },
  loader: {
    marginTop: 16,
  },
});
