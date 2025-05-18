import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useCurrentUser, useLogout } from "../api";

/**
 * 사용자 인증 상태 컴포넌트
 * 현재 로그인 상태를 표시하고 로그아웃 기능을 제공합니다.
 */
const UserAuthStatus: React.FC = () => {
  const { data: user, isLoading, isError, error } = useCurrentUser();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.statusText}>사용자 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <Text style={[styles.statusText, styles.errorText]}>
          오류 발생: {error instanceof Error ? error.message : "알 수 없는 오류"}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <Text style={styles.titleText}>환영합니다!</Text>
          <Text style={styles.statusText}>이메일: {user.email}</Text>
          <Text style={styles.statusText}>ID: {user.id}</Text>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={logout.isPending}
          >
            {logout.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>로그아웃</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.statusText}>로그인이 필요합니다.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    margin: 16,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    marginVertical: 4,
  },
  errorText: {
    color: "red",
  },
  logoutButton: {
    backgroundColor: "#3B82F6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default UserAuthStatus;
