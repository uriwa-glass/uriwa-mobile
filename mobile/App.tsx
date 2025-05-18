import "react-native-url-polyfill/auto";
// 폴리필 추가
if (typeof global.Buffer === "undefined") {
  global.Buffer = require("buffer").Buffer;
}
if (typeof global.process === "undefined") {
  global.process = require("process/browser");
}
// 버전 정보는 설정하지 않음 (읽기 전용 속성)

import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import RootNavigator from "./src/navigation/RootNavigator";
import { QueryProvider } from "./src/api";

/**
 * 앱의 진입점
 */
export default function App() {
  return (
    <QueryProvider>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <RootNavigator />
      </SafeAreaProvider>
    </QueryProvider>
  );
}
