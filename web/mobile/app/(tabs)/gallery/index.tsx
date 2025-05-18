import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../../../../shared/api/supabaseClient";
import { useAuth } from "../../../../../shared/contexts/AuthContext";
import theme from "../../../../../shared/styles/theme";
import Button from "../../../../../shared/components/Button";

// 화면 너비 구하기
const { width } = Dimensions.get("window");
const numColumns = 2;
const itemWidth = (width - 48) / numColumns;

// 타입 정의
interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  category_id: string;
  created_at: string;
  category_name?: string;
}

interface Category {
  id: string;
  name: string;
}

export default function GalleryScreen() {
  const router = useRouter();
  const { isAdmin } = useAuth();

  // 상태 관리
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 갤러리 아이템 로드
  const loadGalleryItems = async (categoryId?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from("gallery_items")
        .select(
          `
          *,
          gallery_categories (
            name
          )
        `
        )
        .order("created_at", { ascending: false });

      // 카테고리로 필터링
      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // 데이터 변환
      const formattedItems: GalleryItem[] = data.map((item) => ({
        id: item.id,
        title: item.title,
        image_url: item.image_url,
        category_id: item.category_id,
        created_at: item.created_at,
        category_name: item.gallery_categories?.name,
      }));

      setGalleryItems(formattedItems);
    } catch (error) {
      console.error("Error loading gallery items:", error);
      setError("갤러리 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // 카테고리 로드
  const loadCategories = async () => {
    try {
      const { data, error } = await supabase.from("gallery_categories").select("*").order("name");

      if (error) throw error;

      setCategories(data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    loadCategories();
    loadGalleryItems();
  }, []);

  // 카테고리 선택 시
  useEffect(() => {
    loadGalleryItems(selectedCategory || undefined);
  }, [selectedCategory]);

  // 새로고침 처리
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadGalleryItems(selectedCategory || undefined);
  };

  // 카테고리 선택 처리
  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  // 뷰 모드 변경 처리
  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "grid" ? "list" : "grid"));
  };

  // 그리드 아이템 렌더링
  const renderGridItem = ({ item }: { item: GalleryItem }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => router.push(`/gallery-detail/${item.id}`)}
    >
      <Image source={{ uri: item.image_url }} style={styles.gridImage} />
      <Text style={styles.gridTitle} numberOfLines={1}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  // 리스트 아이템 렌더링
  const renderListItem = ({ item }: { item: GalleryItem }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => router.push(`/gallery-detail/${item.id}`)}
    >
      <Image source={{ uri: item.image_url }} style={styles.listImage} />
      <View style={styles.listContent}>
        <Text style={styles.listTitle}>{item.title}</Text>
        {item.category_name && <Text style={styles.listCategory}>{item.category_name}</Text>}
        <Text style={styles.listDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>갤러리</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.viewModeButton} onPress={toggleViewMode}>
            <Text style={styles.viewModeText}>
              {viewMode === "grid" ? "리스트 보기" : "그리드 보기"}
            </Text>
          </TouchableOpacity>

          {isAdmin && (
            <Button
              title="추가"
              variant="primary"
              size="small"
              onPress={() => router.push("/gallery-edit")}
              style={styles.addButton}
            />
          )}
        </View>
      </View>

      {/* 카테고리 필터 */}
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContent}
        >
          <TouchableOpacity
            style={[styles.categoryChip, selectedCategory === null && styles.selectedCategoryChip]}
            onPress={() => handleCategorySelect(null)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === null && styles.selectedCategoryText,
              ]}
            >
              전체
            </Text>
          </TouchableOpacity>

          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.selectedCategoryChip,
              ]}
              onPress={() => handleCategorySelect(category.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.selectedCategoryText,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 갤러리 목록 */}
      {isLoading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="다시 시도"
            variant="outline"
            onPress={() => loadGalleryItems(selectedCategory || undefined)}
            style={styles.retryButton}
          />
        </View>
      ) : galleryItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>갤러리 항목이 없습니다.</Text>
          {isAdmin && (
            <Button
              title="항목 추가하기"
              variant="primary"
              onPress={() => router.push("/gallery-edit")}
              style={styles.emptyButton}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={galleryItems}
          renderItem={viewMode === "grid" ? renderGridItem : renderListItem}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === "grid" ? numColumns : 1}
          key={viewMode} // 뷰 모드가 변경될 때 FlatList 재생성
          contentContainerStyle={styles.galleryContent}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text.primary,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewModeButton: {
    marginRight: 12,
  },
  viewModeText: {
    fontSize: 14,
    color: theme.colors.primary.main,
  },
  addButton: {
    height: 36,
    paddingHorizontal: 12,
  },
  categoryContainer: {
    backgroundColor: theme.colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  categoryContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.background.light,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  selectedCategoryChip: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  categoryText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  selectedCategoryText: {
    color: theme.colors.primary.contrast,
  },
  galleryContent: {
    padding: 16,
  },
  gridItem: {
    width: itemWidth,
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: theme.colors.background.paper,
    ...theme.shadows.sm,
    margin: 8,
  },
  gridImage: {
    width: "100%",
    height: itemWidth,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  gridTitle: {
    padding: 8,
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.text.primary,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: theme.colors.background.paper,
    ...theme.shadows.sm,
  },
  listImage: {
    width: 100,
    height: 100,
  },
  listContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  listCategory: {
    fontSize: 14,
    color: theme.colors.primary.main,
    marginBottom: 4,
  },
  listDate: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
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
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginBottom: 16,
    textAlign: "center",
  },
  emptyButton: {
    minWidth: 160,
  },
});
