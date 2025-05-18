import React from "react";
import { StatusBar } from "expo-status-bar";
import { ScrollView, View } from "react-native";
import WebViewContainer from "../components/WebViewContainer";
import UserAuthStatus from "../components/UserAuthStatus";

/**
 * 홈 화면
 * 웹사이트의 메인 페이지를 WebView로 표시합니다.
 * 상단에 사용자 인증 상태도 표시합니다.
 */
const HomeScreen: React.FC = () => {
  return (
    <>
      <StatusBar style="dark" />
      <ScrollView>
        <UserAuthStatus />
        <View style={{ flex: 1, height: 500 }}>
          <WebViewContainer path="/" />
        </View>
      </ScrollView>
    </>
  );
};

export default HomeScreen;
