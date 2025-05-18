import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../../shared/api/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    // URL에서 액세스 토큰과 리프레시 토큰 추출
    async function handleAuthCallback() {
      try {
        // URL 매개변수 확인
        console.log("Auth callback params:", params);

        // 토큰이 포함된 URL 처리
        if (params.access_token && params.refresh_token) {
          // Supabase 세션 설정
          await supabase.auth.setSession({
            access_token: params.access_token as string,
            refresh_token: params.refresh_token as string,
          });

          console.log("Auth session set successfully");

          // 홈 화면으로 리디렉션
          router.replace("/");
        } else {
          console.error("Missing tokens in callback URL");
          router.replace("/auth/signin");
        }
      } catch (error) {
        console.error("Error handling auth callback:", error);
        router.replace("/auth/signin");
      }
    }

    handleAuthCallback();
  }, [params, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={styles.text}>로그인 처리 중...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  text: {
    marginTop: 20,
    fontSize: 16,
  },
});
