import React from "react";
import { StatusBar } from "expo-status-bar";
import { RouteProp, useRoute } from "@react-navigation/native";
import WebViewContainer from "../components/WebViewContainer";
import { RootStackParamList } from "../navigation/types";
import env from "../config/env";

type WebDetailScreenRouteProp = RouteProp<RootStackParamList, "WebDetail">;

/**
 * 웹 상세 화면
 * 특정 URL이나 경로를 WebView로 표시합니다.
 * url 또는 path 파라미터를 통해 콘텐츠를 로드합니다.
 */
const WebDetailScreen: React.FC = () => {
  const route = useRoute<WebDetailScreenRouteProp>();
  const { url, title } = route.params;

  // 전체 URL이 아닌 경로만 전달된 경우 처리
  const isFullUrl = url.startsWith("http");
  const fullUrl = isFullUrl ? url : `${env.WEB_URL}${url.startsWith("/") ? url : `/${url}`}`;

  return (
    <>
      <StatusBar style="dark" />
      <WebViewContainer uri={fullUrl} />
    </>
  );
};

export default WebDetailScreen;
