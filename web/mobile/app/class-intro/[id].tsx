import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../../../shared/api/supabaseClient";
import theme from "../../../../shared/styles/theme";
import Button from "../../../../shared/components/Button";

// 화면 너비 구하기
const { width } = Dimensions.get("window");

// 타입 정의
interface ClassIntroduction {
  id: string;
  class_id: string;
  title: string;
  description: string;
  image_url?: string;
  highlight_points?: { title: string; description: string }[];
  curriculum?: { week: number; title: string; description: string }[];
  benefits?: string;
  target_audience?: string;
  instructor_name?: string;
  category?: string;
  duration_weeks?: number;
  sessions_per_week?: number;
}

export default function ClassDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // 상태 관리
  const [classData, setClassData] = useState<ClassIntroduction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 클래스 데이터 로드
  useEffect(() => {
    async function loadClassDetails() {
      if (!id) return;

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
          .eq("id", id)
          .single();

        if (error) throw error;

        setClassData({
          id: data.id,
          class_id: data.class_id,
          title: data.title,
          description: data.description,
          image_url: data.image_url,
          highlight_points: data.highlight_points,
          curriculum: data.curriculum,
          benefits: data.benefits,
          target_audience: data.target_audience,
          instructor_name: data.instructor?.display_name || "Unknown",
          category: data.category,
          duration_weeks: data.duration_weeks,
          sessions_per_week: data.sessions_per_week,
        });
      } catch (error) {
        console.error("Error loading class details:", error);
        setError("수업 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    loadClassDetails();
  }, [id]);

  // 수업 신청 페이지로 이동
  const handleReservation = () => {
    if (!classData?.class_id) return;

    router.push(`/reservation/${classData.class_id}` as any);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
      </View>
    );
  }

  if (error || !classData) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || "수업 정보를 찾을 수 없습니다."}</Text>
        <Button title="뒤로 가기" variant="outline" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
      </View>

      {/* 이미지 섹션 */}
      {classData.image_url && (
        <Image
          source={{ uri: classData.image_url }}
          style={styles.headerImage}
          resizeMode="cover"
        />
      )}

      {/* 기본 정보 */}
      <View style={styles.section}>
        {classData.category && <Text style={styles.category}>{classData.category}</Text>}
        <Text style={styles.title}>{classData.title}</Text>
        <Text style={styles.instructor}>강사: {classData.instructor_name}</Text>

        {/* 수업 정보 */}
        <View style={styles.infoContainer}>
          {classData.duration_weeks && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>수업 기간</Text>
              <Text style={styles.infoValue}>{classData.duration_weeks}주</Text>
            </View>
          )}
          {classData.sessions_per_week && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>수업 횟수</Text>
              <Text style={styles.infoValue}>주 {classData.sessions_per_week}회</Text>
            </View>
          )}
        </View>
      </View>

      {/* 수업 소개 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>수업 소개</Text>
        <Text style={styles.description}>{classData.description}</Text>
      </View>

      {/* 핵심 포인트 */}
      {classData.highlight_points && classData.highlight_points.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>핵심 포인트</Text>
          {classData.highlight_points.map((point, index) => (
            <View key={index} style={styles.pointItem}>
              <Text style={styles.pointTitle}>{point.title}</Text>
              <Text style={styles.pointDescription}>{point.description}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 커리큘럼 */}
      {classData.curriculum && classData.curriculum.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>커리큘럼</Text>
          {classData.curriculum.map((week, index) => (
            <View key={index} style={styles.curriculumItem}>
              <View style={styles.weekBadge}>
                <Text style={styles.weekText}>{week.week}주차</Text>
              </View>
              <View style={styles.curriculumContent}>
                <Text style={styles.curriculumTitle}>{week.title}</Text>
                <Text style={styles.curriculumDescription}>{week.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 수업 혜택 */}
      {classData.benefits && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>수업 혜택</Text>
          <Text style={styles.description}>{classData.benefits}</Text>
        </View>
      )}

      {/* 대상 */}
      {classData.target_audience && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>이런 분들에게 추천합니다</Text>
          <Text style={styles.description}>{classData.target_audience}</Text>
        </View>
      )}

      {/* 신청 버튼 */}
      <View style={styles.actionContainer}>
        <Button
          title="수업 신청하기"
          variant="primary"
          onPress={handleReservation}
          style={styles.reserveButton}
        />
        <Button
          title="문의하기"
          variant="outline"
          onPress={() =>
            router.push({
              pathname: "/inquiry",
            })
          }
          style={styles.inquiryButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  backText: {
    color: "white",
    fontSize: 18,
  },
  headerImage: {
    width: width,
    height: 250,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  category: {
    fontSize: 14,
    color: theme.colors.primary.main,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  instructor: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginBottom: 16,
  },
  infoContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  infoItem: {
    marginRight: 24,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.text.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text.secondary,
  },
  pointItem: {
    marginBottom: 16,
  },
  pointTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  pointDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.text.secondary,
  },
  curriculumItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  weekBadge: {
    backgroundColor: theme.colors.primary.light,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    alignSelf: "flex-start",
  },
  weekText: {
    fontSize: 12,
    fontWeight: "bold",
    color: theme.colors.primary.dark,
  },
  curriculumContent: {
    flex: 1,
  },
  curriculumTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  curriculumDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.text.secondary,
  },
  actionContainer: {
    padding: 20,
    flexDirection: "row",
  },
  reserveButton: {
    flex: 2,
    marginRight: 8,
  },
  inquiryButton: {
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error.main,
    marginBottom: 20,
    textAlign: "center",
  },
});
