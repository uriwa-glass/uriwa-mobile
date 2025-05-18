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
import Input from "../../../../shared/components/Input";
import ProtectedRoute from "../../../../shared/components/ProtectedRoute";

// 카테고리 타입
interface Category {
  id: string;
  name: string;
  created_at: string;
}

export default function GalleryCategoryScreen() {
  const router = useRouter();
  const { isAdmin } = useAuth();

  // 상태 관리
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 카테고리 목록 로드
  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("gallery_categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;

      setCategories(data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
      setError("카테고리를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    loadCategories();
  }, []);

  // 카테고리 추가
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert("오류", "카테고리 이름을 입력해주세요.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const { data, error } = await supabase
        .from("gallery_categories")
        .insert({ name: newCategoryName.trim() })
        .select();

      if (error) throw error;

      // 목록 업데이트
      setCategories([...categories, data[0]]);
      setNewCategoryName("");
      Alert.alert("성공", "카테고리가 추가되었습니다.");
    } catch (error) {
      console.error("Error adding category:", error);
      Alert.alert("오류", "카테고리 추가에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 카테고리 수정 준비
  const handleEditStart = (category: Category) => {
    setEditingCategory(category);
    setEditName(category.name);
  };

  // 카테고리 수정 취소
  const handleEditCancel = () => {
    setEditingCategory(null);
    setEditName("");
  };

  // 카테고리 수정 완료
  const handleEditSave = async () => {
    if (!editingCategory) return;
    if (!editName.trim()) {
      Alert.alert("오류", "카테고리 이름을 입력해주세요.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const { error } = await supabase
        .from("gallery_categories")
        .update({ name: editName.trim(), updated_at: new Date().toISOString() })
        .eq("id", editingCategory.id);

      if (error) throw error;

      // 목록 업데이트
      const updatedCategories = categories.map((cat) =>
        cat.id === editingCategory.id ? { ...cat, name: editName.trim() } : cat
      );
      setCategories(updatedCategories);
      setEditingCategory(null);
      setEditName("");
      Alert.alert("성공", "카테고리가 수정되었습니다.");
    } catch (error) {
      console.error("Error updating category:", error);
      Alert.alert("오류", "카테고리 수정에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 카테고리 삭제
  const handleDeleteCategory = (category: Category) => {
    Alert.alert(
      "카테고리 삭제",
      `"${category.name}" 카테고리를 삭제하시겠습니까?\n\n이 카테고리에 속한 갤러리 항목은 삭제되지 않지만, 카테고리 없음 상태가 됩니다.`,
      [
        { text: "취소", style: "cancel" },
        { text: "삭제", style: "destructive", onPress: () => confirmDeleteCategory(category.id) },
      ]
    );
  };

  // 카테고리 삭제 확인
  const confirmDeleteCategory = async (categoryId: string) => {
    try {
      setIsSaving(true);
      setError(null);

      const { error } = await supabase.from("gallery_categories").delete().eq("id", categoryId);

      if (error) throw error;

      // 목록 업데이트
      const updatedCategories = categories.filter((cat) => cat.id !== categoryId);
      setCategories(updatedCategories);
      Alert.alert("성공", "카테고리가 삭제되었습니다.");
    } catch (error) {
      console.error("Error deleting category:", error);
      Alert.alert("오류", "카테고리 삭제에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 카테고리 아이템 렌더링
  const renderCategoryItem = ({ item }: { item: Category }) => {
    const isEditing = editingCategory?.id === item.id;

    return (
      <View style={styles.categoryItem}>
        {isEditing ? (
          <View style={styles.editContainer}>
            <Input
              value={editName}
              onChangeText={setEditName}
              placeholder="카테고리 이름"
              containerStyle={styles.editInput}
              autoFocus
            />
            <View style={styles.editActions}>
              <Button
                title="취소"
                variant="outline"
                size="small"
                onPress={handleEditCancel}
                style={styles.editButton}
                disabled={isSaving}
              />
              <Button
                title="저장"
                variant="primary"
                size="small"
                onPress={handleEditSave}
                style={styles.editButton}
                loading={isSaving}
                disabled={isSaving}
              />
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.categoryName}>{item.name}</Text>
            <View style={styles.categoryActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEditStart(item)}
                disabled={isSaving}
              >
                <Text style={styles.actionText}>수정</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteCategory(item)}
                disabled={isSaving}
              >
                <Text style={[styles.actionText, styles.deleteText]}>삭제</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.title}>갤러리 카테고리 관리</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>새 카테고리 추가</Text>
          <View style={styles.addForm}>
            <Input
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="카테고리 이름 입력"
              containerStyle={styles.input}
              disabled={isSaving}
            />
            <Button
              title="추가"
              variant="primary"
              onPress={handleAddCategory}
              loading={isSaving}
              disabled={isSaving || !newCategoryName.trim()}
              style={styles.addButton}
            />
          </View>
        </View>

        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>카테고리 목록</Text>

          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={theme.colors.primary.main}
              style={styles.loader}
            />
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Button
                title="다시 시도"
                variant="outline"
                onPress={loadCategories}
                style={styles.retryButton}
              />
            </View>
          ) : categories.length === 0 ? (
            <Text style={styles.emptyText}>등록된 카테고리가 없습니다.</Text>
          ) : (
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
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
  formContainer: {
    padding: 16,
    backgroundColor: theme.colors.background.paper,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: theme.colors.text.primary,
  },
  addForm: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    marginRight: 12,
    marginBottom: 0,
  },
  addButton: {
    width: 80,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.background.paper,
    borderRadius: 8,
    marginTop: 12,
    ...theme.shadows.sm,
  },
  categoryName: {
    fontSize: 16,
    color: theme.colors.text.primary,
    flex: 1,
  },
  categoryActions: {
    flexDirection: "row",
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
  editContainer: {
    flex: 1,
  },
  editInput: {
    marginBottom: 8,
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  editButton: {
    width: 80,
    marginLeft: 8,
  },
  loader: {
    marginTop: 40,
  },
  errorContainer: {
    alignItems: "center",
    marginTop: 40,
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
  emptyText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: "center",
    marginTop: 40,
  },
});
