import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "../../../../../shared/api/supabaseClient";
import { useAuth } from "../../../../../shared/contexts/AuthContext";
import theme from "../../../../../shared/styles/theme";
import Button from "../../../../../shared/components/Button";

// 요일 정의
const DAYS_OF_WEEK = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

// 타입 정의
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

interface ClassData {
  [day: number]: ClassSchedule[];
}

export default function ClassesScreen() {
  const { user } = useAuth();
  const [classData, setClassData] = useState<ClassData>({});
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDay());
  const [isLoading, setIsLoading] = useState(true);

  // 수업 일정 데이터 가져오기
  useEffect(() => {
    async function fetchClassSchedules() {
      try {
        setIsLoading(true);

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
          .order("start_time");

        if (error) throw error;

        // 클래스 데이터 요일별 그룹화
        const groupedByDay: ClassData = {};

        data?.forEach((item) => {
          const dayOfWeek = item.day_of_week;

          if (!groupedByDay[dayOfWeek]) {
            groupedByDay[dayOfWeek] = [];
          }

          groupedByDay[dayOfWeek].push({
            id: item.id,
            class_id: item.class_id,
            start_time: item.start_time,
            end_time: item.end_time,
            day_of_week: item.day_of_week,
            max_attendees: item.max_attendees,
            current_attendees: item.current_attendees,
            class_name: item.classes?.name || "수업명 없음",
          });
        });

        setClassData(groupedByDay);
      } catch (error) {
        console.error("Error fetching class schedules:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchClassSchedules();
  }, []);

  // 시간 형식화 함수
  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  // 수업 예약 가능 여부 확인
  const isReservationAvailable = (classItem: ClassSchedule) => {
    return classItem.current_attendees < classItem.max_attendees;
  };

  // 수업 예약 처리
  const handleReservation = (scheduleId: string) => {
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    router.push({
      pathname: "/reservation",
      params: { scheduleId },
    });
  };

  return (
    <View style={styles.container}>
      {/* 요일 선택 탭 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.daySelector}
        contentContainerStyle={styles.daySelectorContent}
      >
        {DAYS_OF_WEEK.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.dayTab, selectedDay === index && styles.selectedDayTab]}
            onPress={() => setSelectedDay(index)}
          >
            <Text style={[styles.dayText, selectedDay === index && styles.selectedDayText]}>
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 수업 목록 */}
      <ScrollView style={styles.classesContainer} contentContainerStyle={styles.classesContent}>
        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.primary.main} style={styles.loader} />
        ) : classData[selectedDay]?.length > 0 ? (
          classData[selectedDay].map((classItem) => (
            <View key={classItem.id} style={styles.classCard}>
              <View style={styles.classHeader}>
                <Text style={styles.className}>{classItem.class_name}</Text>
                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>
                    {formatTime(classItem.start_time)} - {formatTime(classItem.end_time)}
                  </Text>
                </View>
              </View>

              <View style={styles.classDetails}>
                <Text style={styles.attendanceText}>
                  참여 인원: {classItem.current_attendees}/{classItem.max_attendees}명
                </Text>

                <View style={styles.statusContainer}>
                  {isReservationAvailable(classItem) ? (
                    <View style={[styles.statusBadge, styles.availableBadge]}>
                      <Text style={styles.statusText}>예약 가능</Text>
                    </View>
                  ) : (
                    <View style={[styles.statusBadge, styles.fullBadge]}>
                      <Text style={styles.statusText}>예약 마감</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.actionContainer}>
                <Button
                  title="상세 보기"
                  variant="outline"
                  size="small"
                  onPress={() =>
                    router.push({
                      pathname: "/class-detail",
                      params: { classId: classItem.class_id },
                    })
                  }
                  style={styles.detailButton}
                />

                <Button
                  title="예약하기"
                  variant="primary"
                  size="small"
                  onPress={() => handleReservation(classItem.id)}
                  disabled={!isReservationAvailable(classItem) || !user}
                  style={styles.reserveButton}
                />
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {DAYS_OF_WEEK[selectedDay]}에 예정된 수업이 없습니다.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  daySelector: {
    backgroundColor: theme.colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  daySelectorContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dayTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.background.light,
  },
  selectedDayTab: {
    backgroundColor: theme.colors.primary.main,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.text.secondary,
  },
  selectedDayText: {
    color: theme.colors.primary.contrast,
  },
  classesContainer: {
    flex: 1,
  },
  classesContent: {
    padding: 16,
  },
  classCard: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    ...theme.shadows.medium,
  },
  classHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  className: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text.primary,
    flex: 1,
  },
  timeContainer: {
    backgroundColor: theme.colors.primary.light + "20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  timeText: {
    fontSize: 14,
    color: theme.colors.primary.dark,
    fontWeight: "500",
  },
  classDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  attendanceText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  statusContainer: {
    flexDirection: "row",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  availableBadge: {
    backgroundColor: theme.colors.success.light,
  },
  fullBadge: {
    backgroundColor: theme.colors.error.light,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  detailButton: {
    marginRight: 8,
  },
  reserveButton: {
    minWidth: 90,
  },
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: "center",
  },
});
