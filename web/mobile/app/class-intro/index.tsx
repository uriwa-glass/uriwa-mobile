import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../../../shared/api/supabaseClient";
import theme from "../../../../shared/styles/theme";
import ClassCard from "../../../../shared/components/ClassCard";

// 타입 정의
interface ClassIntroduction {
  id: string;
  class_id: string;
  title: string;
  description: string;
  image_url?: string;
  category?: string;
  instructor_name?: string;
  duration_weeks?: number;
  sessions_per_week?: number;
}

interface ClassCategory {
  category: string;
  count: number;
}

export default function ClassIntroScreen() {
  const router = useRouter();

  // 상태 관리
  const [classes, setClasses] = useState<ClassIntroduction[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<ClassIntroduction[]>([]);
  const [categories, setCategories] = useState<ClassCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // 클래스 데이터 로드
  const loadClasses = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("class_introductions")
        .select(
          `
          *,
          classes (
            name
          ),
          instructor:instructor_id (
            display_name:user_profiles!inner(display_name)
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedClasses: ClassIntroduction[] = (data || []).map((item) => ({
        id: item.id,
        class_id: item.class_id,
        title: item.title,
        description: item.description,
        image_url: item.image_url,
        category: item.category,
        instructor_name: item.instructor?.display_name || "Unknown",
        duration_weeks: item.duration_weeks,
        sessions_per_week: item.sessions_per_week,
      }));

      setClasses(formattedClasses);
      setFilteredClasses(formattedClasses);

      // 카테고리 집계
      const categoryMap = new Map<string, number>();
      formattedClasses.forEach((cls) => {
        if (cls.category) {
          const count = categoryMap.get(cls.category) || 0;
          categoryMap.set(cls.category, count + 1);
        }
      });

      const categoryList: ClassCategory[] = Array.from(categoryMap.entries()).map(
        ([category, count]) => ({ category, count })
      );
      categoryList.sort((a, b) => a.category.localeCompare(b.category));
      setCategories(categoryList);
    } catch (error) {
      console.error("Error loading class introductions:", error);
      setError("수업 소개 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    loadClasses();
  }, []);

  // 필터링 및 검색 적용
  useEffect(() => {
    let result = [...classes];

    // 카테고리 필터링
    if (selectedCategory) {
      result = result.filter((cls) => cls.category === selectedCategory);
    }

    // 검색어 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (cls) =>
          cls.title.toLowerCase().includes(query) ||
          cls.description.toLowerCase().includes(query) ||
          cls.instructor_name?.toLowerCase().includes(query) ||
          cls.category?.toLowerCase().includes(query)
      );
    }

    setFilteredClasses(result);
  }, [selectedCategory, searchQuery, classes]);

  // 새로고침 처리
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadClasses();
  };

  // 카테고리 선택 처리
  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
  };

  // 클래스 카드 렌더링
  const renderClassCard = ({ item }: { item: ClassIntroduction }) => (
    <ClassCard
      id={item.id}
      title={item.title}
      instructor={item.instructor_name || ""}
      category={item.category}
      imageUrl={item.image_url}
      duration={item.duration_weeks ? `${item.duration_weeks}주` : undefined}
      sessions={item.sessions_per_week ? `주 ${item.sessions_per_week}회` : undefined}
      description={item.description}
      onPress={() =>
        router.push({
          pathname: "/class-intro/[id]",
          params: { id: item.id },
        })
      }
      style={styles.classCard}
    />
  );

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>수업 소개</Text>
      </View>

      {/* 검색 바 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="수업명, 강사, 내용 검색"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
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

          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.category}
              style={[
                styles.categoryChip,
                selectedCategory === cat.category && styles.selectedCategoryChip,
              ]}
              onPress={() => handleCategorySelect(cat.category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat.category && styles.selectedCategoryText,
                ]}
              >
                {cat.category} ({cat.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 수업 목록 */}
      {isLoading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadClasses}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : filteredClasses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery || selectedCategory
              ? "검색 결과가 없습니다."
              : "등록된 수업 소개가 없습니다."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredClasses}
          renderItem={renderClassCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.classesContainer}
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
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text.primary,
  },
  searchContainer: {
    backgroundColor: theme.colors.background.paper,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchInput: {
    backgroundColor: theme.colors.background.light,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
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
  classesContainer: {
    padding: 16,
  },
  classCard: {
    marginBottom: 16,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: "center",
  },
});
