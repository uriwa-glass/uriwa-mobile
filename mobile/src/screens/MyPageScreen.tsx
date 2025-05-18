import React from "react";
import { StatusBar } from "expo-status-bar";
import WebViewContainer from "../components/WebViewContainer";

/**
 * 마이페이지 화면
 * 웹사이트의 마이페이지를 WebView로 표시합니다.
 */
const MyPageScreen: React.FC = () => {
  return (
    <>
      <StatusBar style="dark" />
      <WebViewContainer path="/mypage" />
    </>
  );
};

export default MyPageScreen;
