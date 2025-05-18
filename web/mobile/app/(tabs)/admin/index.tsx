import React from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../../../../shared/contexts/AuthContext";
import ProtectedRoute from "../../../../../shared/components/ProtectedRoute";
import theme from "../../../../../shared/styles/theme";

// 관리자 메뉴 아이템 타입
interface AdminMenuItem {
  id: string;
  title: string;
  description: string;
  route: string;
  color: string;
}

export default function AdminScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();

  // 관리자 메뉴 항목
  const adminMenuItems: AdminMenuItem[] = [
    {
      id: "users",
      title: "사용자 관리",
      description: "사용자 계정 정보 조회 및 역할 관리",
      route: "/admin/users",
      color: theme.colors.primary.main,
    },
    {
      id: "classes",
      title: "수업 관리",
      description: "수업 정보 및 일정 관리, 예약 현황 조회",
      route: "/admin/classes",
      color: theme.colors.success.main,
    },
    {
      id: "gallery-category",
      title: "갤러리 카테고리",
      description: "갤러리 카테고리 추가, 수정, 삭제",
      route: "/admin/gallery-category",
      color: theme.colors.secondary.main,
    },
    {
      id: "gallery",
      title: "갤러리 관리",
      description: "갤러리 항목 추가, 수정, 삭제",
      route: "/(tabs)/gallery",
      color: theme.colors.pastel.purple,
    },
    {
      id: "form-templates",
      title: "폼 템플릿 관리",
      description: "문의 및 신청 폼 템플릿 생성 및 관리",
      route: "/admin/form-templates",
      color: theme.colors.pastel.pink,
    },
    {
      id: "notices",
      title: "공지사항 관리",
      description: "공지사항 작성 및 수정",
      route: "/admin/notices",
      color: theme.colors.info.main,
    },
    {
      id: "settings",
      title: "시스템 설정",
      description: "앱 설정 및 환경 설정",
      route: "/admin/settings",
      color: theme.colors.neutral.main,
    },
  ];

  // 메뉴 항목 클릭 시 해당 경로로 이동
  const handleNavigate = (route: string) => {
    router.push(route as any);
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>관리자 페이지</Text>
          {profile && (
            <Text style={styles.subtitle}>{profile.display_name || user?.email} (관리자)</Text>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.menuList}>
          {adminMenuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, { borderLeftColor: item.color }]}
              onPress={() => handleNavigate(item.route)}
            >
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <View style={styles.menuArrow}>
                <Text style={styles.menuArrowText}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
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
    padding: 20,
    backgroundColor: theme.colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  menuList: {
    padding: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background.paper,
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
    borderLeftWidth: 4,
    ...theme.shadows.sm,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  menuArrow: {
    width: 20,
    alignItems: "center",
  },
  menuArrowText: {
    fontSize: 20,
    color: theme.colors.text.secondary,
  },
});
