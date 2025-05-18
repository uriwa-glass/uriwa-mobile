import React from "react";
import { StatusBar } from "expo-status-bar";
import WebViewContainer from "../components/WebViewContainer";

/**
 * 더보기 화면
 * 웹사이트의 추가 메뉴를 WebView로 표시합니다.
 */
const MoreScreen: React.FC = () => {
  return (
    <>
      <StatusBar style="dark" />
      <WebViewContainer path="/more" />
    </>
  );
};

export default MoreScreen;
