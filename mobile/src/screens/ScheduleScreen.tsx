import React from "react";
import { StatusBar } from "expo-status-bar";
import WebViewContainer from "../components/WebViewContainer";

/**
 * 수업 일정 화면
 * 웹사이트의 수업 일정 페이지를 WebView로 표시합니다.
 */
const ScheduleScreen: React.FC = () => {
  return (
    <>
      <StatusBar style="dark" />
      <WebViewContainer path="/class-schedule" />
    </>
  );
};

export default ScheduleScreen;
