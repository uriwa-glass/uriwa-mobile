import React, { useEffect, useState, useRef } from "react";
import { NavigationContainer, NavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import MainTabNavigator from "./MainTabNavigator";
import WebDetailScreen from "../screens/WebDetailScreen";
import NotFoundScreen from "../screens/NotFoundScreen";
import LoginScreen from "../screens/LoginScreen";
import { View, ActivityIndicator, StyleSheet, Linking } from "react-native";
import { useAuth } from "../api";
import deepLinkHandler from "../utils/deepLinkHandler";

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * 루트 네비게이션
 * 앱의 최상위 네비게이션 구조를 정의합니다.
 */
const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  // 딥링크 핸들러 설정
  useEffect(() => {
    if (navigationRef.current) {
      // 앱이 닫혀 있을 때 딥링크로 열린 경우 처리
      const getInitialURL = async () => {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl && navigationRef.current) {
          deepLinkHandler.handleDeepLink(initialUrl, navigationRef.current);
        }
      };

      // 앱이 이미 실행 중일 때 딥링크 처리
      const subscription = Linking.addEventListener("url", ({ url }) => {
        if (navigationRef.current) {
          deepLinkHandler.handleDeepLink(url, navigationRef.current);
        }
      });

      getInitialURL();

      return () => {
        subscription.remove();
      };
    }
  }, [navigationRef.current]);

  // 로딩 중이면 로딩 인디케이터 표시
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? "MainTab" : "Login"}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#FFFFFF" },
        }}
      >
        {isAuthenticated ? (
          // 인증된 사용자용 화면
          <>
            <Stack.Screen name="MainTab" component={MainTabNavigator} />
            <Stack.Screen
              name="WebDetail"
              component={WebDetailScreen}
              options={({ route }) => ({
                title: route.params?.title || "상세 보기",
                headerShown: true,
              })}
            />
          </>
        ) : (
          // 인증되지 않은 사용자용 화면
          <Stack.Screen name="Login" component={LoginScreen} />
        )}

        {/* 공통 화면 */}
        <Stack.Screen
          name="NotFound"
          component={NotFoundScreen}
          options={{ title: "페이지를 찾을 수 없습니다" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
});

export default RootNavigator;
