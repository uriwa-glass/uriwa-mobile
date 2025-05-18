import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../../../shared/api/supabaseClient";
import { useAuth } from "../../../../shared/contexts/AuthContext";
import theme from "../../../../shared/styles/theme";
import Button from "../../../../shared/components/Button";
import ProtectedRoute from "../../../../shared/components/ProtectedRoute";
import { FormField } from "../../../../shared/types/forms";

export default function FormCreateScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // 상태 관리
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // 폼 템플릿 저장
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("오류", "템플릿 제목을 입력해주세요.");
      return;
    }

    try {
      setIsSaving(true);

      // 샘플 필드 생성
      const sampleFields: FormField[] = [
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
          id: "message",
          type: "textarea",
          label: "메시지",
          placeholder: "메시지를 입력해주세요",
          validation: {
            required: true,
            minLength: 10,
          },
        },
      ];

      // Supabase에 저장
      const { data, error } = await supabase
        .from("form_templates")
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          is_active: true,
          created_by: user?.id,
          fields: sampleFields,
          version: 1,
        })
        .select();

      if (error) throw error;

      Alert.alert("성공", "폼 템플릿이 생성되었습니다.", [
        {
          text: "확인",
          onPress: () => router.replace("/admin/form-templates"),
        },
      ]);
    } catch (error) {
      console.error("Error creating form template:", error);
      Alert.alert("오류", "템플릿 생성 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.title}>새 폼 템플릿 생성</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>기본 정보</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>템플릿 제목 *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="템플릿 제목 입력"
                placeholderTextColor={theme.colors.text.disabled}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>설명</Text>
              <TextInput
                style={styles.textarea}
                value={description}
                onChangeText={setDescription}
                placeholder="템플릿 설명 입력 (선택사항)"
                placeholderTextColor={theme.colors.text.disabled}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>샘플 필드로 시작하기</Text>
            <Text style={styles.infoText}>
              이 버전에서는 기본 샘플 필드로 템플릿이 생성됩니다. 향후 버전에서는 필드를 직접 편집할
              수 있습니다.
            </Text>
            <Text style={styles.infoFields}>기본 포함 필드: 이름, 이메일, 메시지</Text>
          </View>

          <View style={styles.actions}>
            <Button
              title="취소"
              variant="outline"
              onPress={() => router.back()}
              style={styles.cancelButton}
              disabled={isSaving}
            />
            <Button
              title={isSaving ? "저장 중..." : "템플릿 저장"}
              variant="primary"
              onPress={handleSave}
              style={styles.saveButton}
              disabled={isSaving || !title.trim()}
            />
          </View>

          {isSaving && (
            <ActivityIndicator
              size="large"
              color={theme.colors.primary.main}
              style={styles.loader}
            />
          )}
        </ScrollView>
      </View>
    </ProtectedRoute>
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
    backgroundColor: theme.colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  backButton: {
    marginRight: 16,
  },
  backText: {
    fontSize: 16,
    color: theme.colors.primary.main,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text.primary,
  },
  content: {
    flex: 1,
  },
  formSection: {
    backgroundColor: theme.colors.background.paper,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
    color: theme.colors.text.primary,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: theme.colors.text.primary,
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
  textarea: {
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borderRadius.sm,
    padding: 12,
    fontSize: 16,
    backgroundColor: theme.colors.background.light,
    color: theme.colors.text.primary,
    minHeight: 100,
  },
  infoBox: {
    backgroundColor: theme.colors.info.light,
    borderRadius: theme.borderRadius.md,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.info.dark,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.info.dark,
    marginBottom: 12,
    lineHeight: 20,
  },
  infoFields: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.info.dark,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 2,
  },
  loader: {
    marginTop: 20,
    marginBottom: 40,
  },
});
