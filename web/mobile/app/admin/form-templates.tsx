import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../../../shared/api/supabaseClient";
import { useAuth } from "../../../../shared/contexts/AuthContext";
import theme from "../../../../shared/styles/theme";
import Button from "../../../../shared/components/Button";
import ProtectedRoute from "../../../../shared/components/ProtectedRoute";
import { FormTemplate } from "../../../../shared/types/forms";

export default function FormTemplatesScreen() {
  const router = useRouter();
  const { isAdmin } = useAuth();

  // 상태 관리
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 템플릿 로드
  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("form_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTemplates(
        data.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description || "",
          isActive: item.is_active,
          fields: item.fields,
          version: item.version,
          notificationEmails: item.notification_emails || [],
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }))
      );
    } catch (error) {
      console.error("Error loading form templates:", error);
      setError("폼 템플릿을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    loadTemplates();
  }, []);

  // 템플릿 활성화/비활성화 토글
  const toggleTemplateStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("form_templates")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      // 목록 업데이트
      setTemplates(
        templates.map((template) =>
          template.id === id ? { ...template, isActive: !currentStatus } : template
        )
      );

      Alert.alert(
        "상태 변경 완료",
        `템플릿이 ${!currentStatus ? "활성화" : "비활성화"}되었습니다.`
      );
    } catch (error) {
      console.error("Error toggling template status:", error);
      Alert.alert("오류", "템플릿 상태 변경에 실패했습니다.");
    }
  };

  // 템플릿 삭제
  const handleDeleteTemplate = (id: string, title: string) => {
    Alert.alert(
      "템플릿 삭제",
      `"${title}" 템플릿을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase.from("form_templates").delete().eq("id", id);

              if (error) throw error;

              // 목록 업데이트
              setTemplates(templates.filter((template) => template.id !== id));
              Alert.alert("삭제 완료", "템플릿이 삭제되었습니다.");
            } catch (error) {
              console.error("Error deleting template:", error);
              Alert.alert("오류", "템플릿 삭제에 실패했습니다.");
            }
          },
        },
      ]
    );
  };

  // 템플릿 아이템 렌더링
  const renderTemplateItem = ({ item }: { item: FormTemplate }) => (
    <View style={styles.templateItem}>
      <View style={styles.templateHeader}>
        <Text style={styles.templateTitle}>{item.title}</Text>
        <View
          style={[styles.statusBadge, item.isActive ? styles.activeBadge : styles.inactiveBadge]}
        >
          <Text
            style={[styles.statusText, item.isActive ? styles.activeText : styles.inactiveText]}
          >
            {item.isActive ? "활성" : "비활성"}
          </Text>
        </View>
      </View>

      {item.description && <Text style={styles.templateDescription}>{item.description}</Text>}

      <View style={styles.templateMeta}>
        <Text style={styles.templateInfo}>필드 수: {item.fields.length}</Text>
        <Text style={styles.templateInfo}>버전: {item.version}</Text>
      </View>

      <View style={styles.templateActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/admin/form-edit/${item.id}` as any)}
        >
          <Text style={styles.actionText}>수정</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleTemplateStatus(item.id, item.isActive)}
        >
          <Text style={styles.actionText}>{item.isActive ? "비활성화" : "활성화"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteTemplate(item.id, item.title)}
        >
          <Text style={[styles.actionText, styles.deleteText]}>삭제</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ProtectedRoute requiredRole="admin">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.title}>폼 템플릿 관리</Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="새 템플릿 생성"
            variant="primary"
            onPress={() => router.push("/admin/form-create" as any)}
          />
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.primary.main} style={styles.loader} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button
              title="다시 시도"
              variant="outline"
              onPress={loadTemplates}
              style={styles.retryButton}
            />
          </View>
        ) : templates.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>등록된 폼 템플릿이 없습니다.</Text>
            <Text style={styles.emptySubtext}>
              사용자 문의, 수업 신청 등을 위한 커스텀 폼 템플릿을 생성해보세요.
            </Text>
            <Button
              title="템플릿 생성하기"
              variant="primary"
              onPress={() => router.push("/admin/form-create" as any)}
              style={styles.emptyButton}
            />
          </View>
        ) : (
          <FlatList
            data={templates}
            renderItem={renderTemplateItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        )}
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
  actions: {
    padding: 16,
    backgroundColor: theme.colors.background.paper,
    marginBottom: 16,
  },
  loader: {
    marginTop: 50,
  },
  templateItem: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    ...theme.shadows.sm,
  },
  templateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  templateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  activeBadge: {
    backgroundColor: theme.colors.success.light,
  },
  inactiveBadge: {
    backgroundColor: theme.colors.neutral.light,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  activeText: {
    color: theme.colors.success.dark,
  },
  inactiveText: {
    color: theme.colors.neutral.dark,
  },
  templateDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 12,
  },
  templateMeta: {
    flexDirection: "row",
    marginBottom: 16,
  },
  templateInfo: {
    fontSize: 12,
    color: theme.colors.text.disabled,
    marginRight: 16,
  },
  templateActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    paddingTop: 12,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
  },
  actionText: {
    fontSize: 14,
    color: theme.colors.primary.main,
  },
  deleteButton: {
    backgroundColor: theme.colors.error.light + "20",
    borderRadius: 4,
  },
  deleteText: {
    color: theme.colors.error.main,
  },
  listContent: {
    padding: 16,
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
    minWidth: 120,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 24,
    textAlign: "center",
    maxWidth: "80%",
  },
  emptyButton: {
    minWidth: 180,
  },
});
