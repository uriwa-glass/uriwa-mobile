import React, { useState } from "react";
import { StyleSheet, View, Text, Button, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams } from "expo-router";

export default function WebViewTest() {
  const [isLoading, setIsLoading] = useState(true);
  const [url, setUrl] = useState("https://www.google.com");

  const loadLocalWeb = () => {
    // 로컬 개발 서버 주소를 사용합니다 - 실제 IP 주소 사용
    // 실제 앱에서는 localhost가 아닌 실제 IP를 사용해야 합니다
    setUrl("http://192.168.219.103:3000");
  };

  const loadExternalSite = () => {
    setUrl("https://www.google.com");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>WebView 통합 테스트</Text>
        <View style={styles.buttonsContainer}>
          <Button title="로컬 웹 앱 로드" onPress={loadLocalWeb} />
          <View style={styles.buttonSpacer} />
          <Button title="외부 사이트 로드" onPress={loadExternalSite} />
        </View>
      </View>

      <View style={styles.webviewContainer}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>로딩 중...</Text>
          </View>
        )}

        <WebView
          source={{ uri: url }}
          style={styles.webview}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonSpacer: {
    width: 8,
  },
  webviewContainer: {
    flex: 1,
    position: "relative",
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
  },
});
