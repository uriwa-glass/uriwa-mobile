import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../../../shared/api/supabaseClient";
import { useAuth } from "../../../../shared/contexts/AuthContext";
import theme from "../../../../shared/styles/theme";
import Button from "../../../../shared/components/Button";

// 스크린 너비 구하기
const { width } = Dimensions.get("window");

// 타입 정의
interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  category_id: string;
}

interface Notice {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface ClassSchedule {
  id: string;
  class_id: string;
  start_time: string;
  end_time: string;
  day_of_week: number;
  max_attendees: number;
  current_attendees: number;
  class_name: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // 상태 관리
  const [featuredImages, setFeaturedImages] = useState<GalleryItem[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [todayClasses, setTodayClasses] = useState<ClassSchedule[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>(null);
  const [loading, setLoading] = useState({
    gallery: true,
    notices: true,
    classes: true,
  });

  // 갤러리 이미지 가져오기
  useEffect(() => {
    async function fetchFeaturedGallery() {
      try {
        const { data, error } = await supabase.from("gallery_items").select("*").limit(5);

        if (error) throw error;

        setFeaturedImages(data || []);
      } catch (error) {
        console.error("Error fetching gallery items:", error);
      } finally {
        setLoading((prev) => ({ ...prev, gallery: false }));
      }
    }

    fetchFeaturedGallery();
  }, []);

  // 공지사항 가져오기
  useEffect(() => {
    async function fetchNotices() {
      try {
        const { data, error } = await supabase
          .from("notices")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(3);

        if (error) throw error;

        setNotices(data || []);
      } catch (error) {
        console.error("Error fetching notices:", error);
      } finally {
        setLoading((prev) => ({ ...prev, notices: false }));
      }
    }

    fetchNotices();
  }, []);

  // 오늘의 수업 일정 가져오기
  useEffect(() => {
    async function fetchTodayClasses() {
      try {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = 일요일, 1 = 월요일, ...

        const { data, error } = await supabase
          .from("class_schedules")
          .select(
            `
            id, 
            class_id, 
            start_time, 
            end_time, 
            day_of_week, 
            max_attendees,
            current_attendees,
            classes (
              name
            )
          `
          )
          .eq("day_of_week", dayOfWeek)
          .order("start_time");

        if (error) throw error;

        // 클래스 데이터 변환
        const formattedClasses =
          data?.map((item) => ({
            id: item.id,
            class_id: item.class_id,
            start_time: item.start_time,
            end_time: item.end_time,
            day_of_week: item.day_of_week,
            max_attendees: item.max_attendees,
            current_attendees: item.current_attendees,
            class_name: item.classes?.name || "수업명 없음",
          })) || [];

        setTodayClasses(formattedClasses);
      } catch (error) {
        console.error("Error fetching class schedules:", error);
      } finally {
        setLoading((prev) => ({ ...prev, classes: false }));
      }
    }

    fetchTodayClasses();
  }, []);

  // 공지사항 토글 함수
  const toggleNotice = (id: string) => {
    if (expandedNoticeId === id) {
      setExpandedNoticeId(null);
    } else {
      setExpandedNoticeId(id);
    }
  };

  // 날짜 형식화 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
      date.getDate()
    ).padStart(2, "0")}`;
  };

  // 시간 형식화 함수
  const formatTime = (timeString: string) => {
    // 예: "14:30:00" -> "14:30"
    return timeString.substring(0, 5);
  };

  return (
    <ScrollView style={styles.container}>
      {/* 브랜드 소개 섹션 */}
      <View style={styles.heroSection}>
        <Image
          source={require("../../assets/placeholder-hero.jpg")}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>우리와</Text>
          <Text style={styles.heroSubtitle}>함께하는 건강한 삶</Text>
          <Button
            title="수업 신청하기"
            variant="primary"
            onPress={() => router.push("/(tabs)/classes")}
            style={styles.heroButton}
          />
        </View>
      </View>

      {/* 갤러리 슬라이더 */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>갤러리</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/gallery")}>
            <Text style={styles.seeAllText}>전체보기</Text>
          </TouchableOpacity>
        </View>

        {loading.gallery ? (
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        ) : featuredImages.length > 0 ? (
          <View>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const newIndex = Math.round(e.nativeEvent.contentOffset.x / (width - 40));
                setActiveImageIndex(newIndex);
              }}
            >
              {featuredImages.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.galleryItem}
                  onPress={() => router.push(`/(tabs)/gallery/${item.id}`)}
                >
                  <Image
                    source={{ uri: item.image_url }}
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.galleryTitle}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* 페이지네이션 표시기 */}
            <View style={styles.paginationContainer}>
              {featuredImages.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === activeImageIndex && styles.activePaginationDot,
                  ]}
                />
              ))}
            </View>
          </View>
        ) : (
          <Text style={styles.emptyStateText}>갤러리 이미지가 없습니다</Text>
        )}
      </View>

      {/* 공지사항 섹션 */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>공지사항</Text>
          <TouchableOpacity onPress={() => router.push("/notices")}>
            <Text style={styles.seeAllText}>전체보기</Text>
          </TouchableOpacity>
        </View>

        {loading.notices ? (
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        ) : notices.length > 0 ? (
          notices.map((notice) => (
            <TouchableOpacity
              key={notice.id}
              style={styles.noticeItem}
              onPress={() => toggleNotice(notice.id)}
            >
              <View style={styles.noticeHeader}>
                <Text style={styles.noticeTitle}>{notice.title}</Text>
                <Text style={styles.noticeDate}>{formatDate(notice.created_at)}</Text>
              </View>

              {expandedNoticeId === notice.id && (
                <Text style={styles.noticeContent}>{notice.content}</Text>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyStateText}>공지사항이 없습니다</Text>
        )}
      </View>

      {/* 오늘의 수업 일정 */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>오늘의 수업</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/classes")}>
            <Text style={styles.seeAllText}>전체 일정</Text>
          </TouchableOpacity>
        </View>

        {loading.classes ? (
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        ) : todayClasses.length > 0 ? (
          todayClasses.map((classItem) => (
            <View key={classItem.id} style={styles.classItem}>
              <View style={styles.classTimeContainer}>
                <Text style={styles.classTime}>{formatTime(classItem.start_time)}</Text>
                <Text style={styles.classTimeSeparator}>~</Text>
                <Text style={styles.classTime}>{formatTime(classItem.end_time)}</Text>
              </View>

              <View style={styles.classInfoContainer}>
                <Text style={styles.className}>{classItem.class_name}</Text>
                <Text style={styles.classAttendees}>
                  {classItem.current_attendees}/{classItem.max_attendees}명
                </Text>
              </View>

              {user && (
                <Button
                  title="예약"
                  variant="outline"
                  size="small"
                  onPress={() => router.push(`/reservation/${classItem.id}`)}
                  style={styles.reserveButton}
                  disabled={classItem.current_attendees >= classItem.max_attendees}
                />
              )}
            </View>
          ))
        ) : (
          <Text style={styles.emptyStateText}>오늘 예정된 수업이 없습니다</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  heroSection: {
    height: 300,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 18,
    color: "white",
    marginBottom: 24,
  },
  heroButton: {
    width: 200,
  },
  sectionContainer: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text.primary,
  },
  seeAllText: {
    fontSize: 14,
    color: theme.colors.primary.main,
  },
  galleryItem: {
    width: width - 40,
    marginRight: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  galleryImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  galleryTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 8,
    color: theme.colors.text.primary,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border.medium,
    marginHorizontal: 4,
  },
  activePaginationDot: {
    backgroundColor: theme.colors.primary.main,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  noticeItem: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  noticeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.text.primary,
    flex: 1,
  },
  noticeDate: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginLeft: 8,
  },
  noticeContent: {
    marginTop: 12,
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  classItem: {
    flexDirection: "row",
    backgroundColor: theme.colors.background.paper,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  classTimeContainer: {
    alignItems: "center",
    marginRight: 16,
  },
  classTime: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.primary.main,
  },
  classTimeSeparator: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginVertical: 2,
  },
  classInfoContainer: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  classAttendees: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  reserveButton: {
    marginLeft: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: "center",
    marginVertical: 24,
  },
});
