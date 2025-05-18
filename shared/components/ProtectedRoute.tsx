import React, { useEffect } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "user" | "admin";
}

/**
 * 인증이 필요한 경로를 보호하는 컴포넌트
 *
 * @param children 보호할 컴포넌트
 * @param requiredRole 접근에 필요한 역할 (선택 사항)
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isLoading, isAdmin, profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 로딩 중이 아니고 사용자가 로그인하지 않은 경우
    if (!isLoading && !user) {
      // 현재 경로를 저장하여 로그인 후 리디렉션
      router.replace({
        pathname: "/auth/signin",
        params: { returnTo: pathname },
      });
      return;
    }

    // 특정 역할이 필요하고 사용자가 해당 역할이 아닌 경우
    if (!isLoading && user && requiredRole) {
      const hasRequiredRole = requiredRole === "admin" ? isAdmin : !!profile;

      if (!hasRequiredRole) {
        // 권한이 없는 경우 홈으로 리디렉션
        router.replace("/(tabs)");
        return;
      }
    }
  }, [isLoading, user, requiredRole, isAdmin, profile, router, pathname]);

  // 로딩 중인 경우 로딩 표시기 표시
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  // 인증 확인이 완료되면 자식 컴포넌트 렌더링
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
});

export default ProtectedRoute;
