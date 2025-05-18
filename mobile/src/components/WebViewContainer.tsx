import React, { useRef, useState, useEffect } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  BackHandler,
  Platform,
  Alert,
  Text,
} from "react-native";
import { WebView } from "react-native-webview";
import { WebViewNavigation, WebViewErrorEvent } from "react-native-webview/lib/WebViewTypes";
import { useFocusEffect } from "@react-navigation/native";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import webViewMessaging, { WebViewMessageHandler } from "../utils/webViewMessaging";
import authHelper from "../utils/authHelper";
import nativeFeatures, { NativeFeatureMessage } from "../utils/nativeFeatures";
import env from "../config/env";
import { useNavigation } from "@react-navigation/native";

interface WebViewContainerProps {
  uri?: string;
  path?: string;
  injectedJavaScript?: string;
  onNavigationStateChange?: (event: WebViewNavigation) => void;
  onMessage?: (event: any) => void;
  cacheEnabled?: boolean;
  offlineHTMLContent?: string;
}

/**
 * WebView 컨테이너 컴포넌트
 * 웹 콘텐츠를 표시하고 관리하는 컴포넌트입니다.
 */
const WebViewContainer: React.FC<WebViewContainerProps> = ({
  uri,
  path = "",
  injectedJavaScript: customInjectedJS,
  onNavigationStateChange,
  onMessage: customOnMessage,
  cacheEnabled = true,
  offlineHTMLContent,
}) => {
  const webViewRef = useRef<WebView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [cachedContent, setCachedContent] = useState<string | null>(null);
  const navigation = useNavigation();

  // 전체 URL 구성
  const url = uri || `${env.WEB_URL}${path}`;
  const cacheKey = `webview_cache_${url}`;

  // 네트워크 상태 모니터링
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsOffline(!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  // 캐시된 콘텐츠 로드
  useEffect(() => {
    if (cacheEnabled) {
      AsyncStorage.getItem(cacheKey)
        .then((content) => {
          if (content) {
            setCachedContent(content);
          }
        })
        .catch((error) => {
          console.error("Failed to load cached content:", error);
        });
    }
  }, [cacheKey, cacheEnabled]);

  // 웹뷰 로드 완료 시 앱 준비 상태 알림 및 인증 토큰 전송
  useEffect(() => {
    if (!isLoading && webViewRef.current) {
      const webViewRefCurrent = webViewRef as React.RefObject<WebView>;
      webViewMessaging.notifyAppReady(webViewRefCurrent);

      // 인증 토큰 전송
      authHelper
        .sendAuthTokenToWebView(webViewRefCurrent)
        .then((success) => {
          if (success) {
            console.log("Auth token sent to WebView");
          }
        })
        .catch((error) => {
          console.error("Failed to send auth token to WebView:", error);
        });
    }
  }, [isLoading]);

  // WebView와 네이티브 앱 간 통신을 위한 JS 코드
  const communicationScript = `
    // 네이티브 앱과 웹 사이의 통신 브릿지 설정
    window.ReactNativeWebView.postMessage = function(data) {
      window.ReactNativeWebView.postMessage(JSON.stringify(data));
    };

    // Supabase 인증 토큰 처리
    const handleAuthToken = (token) => {
      // Session Storage에 토큰 저장
      if (token) {
        sessionStorage.setItem('supabase.auth.token', token);
        console.log('Auth token received from native app');
        
        // 페이지 새로고침으로 인증 상태 적용
        if (window.location.href.includes('/auth/') || window.location.href.includes('/login')) {
          window.location.href = '/';
        }
      }
    };

    // 네이티브 앱에서 받은 메시지 처리
    window.addEventListener('message', function(event) {
      try {
        const message = JSON.parse(event.data);
        console.log('Message from React Native:', message);
        
        // 인증 토큰 메시지 처리
        if (message.type === 'AUTH_TOKEN' && message.payload && message.payload.token) {
          handleAuthToken(message.payload.token);
        }
      } catch (error) {
        console.error('Failed to parse message from React Native:', error);
      }
    });

    // 앱 환경 정보 설정
    window.isNativeApp = true;
    window.nativeAppPlatform = '${Platform.OS}';
    window.nativeAppVersion = '${env.APP_VERSION}';

    true; // 주의: 이 값은 반드시 반환해야 합니다
  `;

  // 네이티브 브릿지 스크립트 추가
  const nativeBridgeScript = nativeFeatures.getNativeBridgeScript();

  // 사용자 정의 JS와 통신 JS 합치기
  const injectedJavaScript = `
    ${communicationScript}
    ${nativeBridgeScript}
    ${customInjectedJS || ""}
    true; // 주의: 이 값은 반드시 반환해야 합니다
  `;

  // 메시지 핸들러 정의
  const messageHandlers: Record<string, WebViewMessageHandler> = {
    CACHE_PAGE: (message) => {
      // 현재 페이지 캐싱
      if (message.payload?.content) {
        AsyncStorage.setItem(cacheKey, message.payload.content)
          .then(() => console.log("Page cached successfully"))
          .catch((error) => console.error("Failed to cache page:", error));
      }
    },
    OPEN_EXTERNAL: (message) => {
      // 외부 링크 열기 처리
      if (message.payload?.url) {
        // 여기서 외부 링크 처리 추가 가능
        console.log("Opening external URL:", message.payload.url);
      }
    },
    SHARE: (message) => {
      // 공유 기능 처리
      console.log("Share content:", message.payload);
    },
    AUTH_REQUEST: (message) => {
      // 웹에서 네이티브 앱의 인증 토큰 요청 처리
      authHelper.getAuthToken().then((token) => {
        if (token && webViewRef.current) {
          webViewMessaging.sendAuthTokenToWebView(webViewRef as React.RefObject<WebView>, token);
        } else {
          // 인증 토큰이 없는 경우 로그인 화면으로 이동
          navigation.navigate("Login" as never);
        }
      });
    },
    AUTH_SUCCESS: (message) => {
      // 웹에서 인증 성공 알림 처리
      if (message.payload?.token) {
        authHelper
          .setAuthToken(message.payload.token)
          .then(() => console.log("Auth token saved from web"))
          .catch((error) => console.error("Failed to save auth token from web:", error));
      }
    },
    AUTH_LOGOUT: () => {
      // 웹에서 로그아웃 요청 처리
      authHelper
        .logout()
        .then(() => {
          console.log("Logged out from web request");
          navigation.navigate("Login" as never);
        })
        .catch((error) => console.error("Failed to logout:", error));
    },
    CUSTOM: (message) => {
      console.log("Custom message received:", message);
    },
  };

  // 네이티브 기능 메시지 처리
  const handleNativeFeatureRequest = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      // 네이티브 기능 요청 처리
      if (
        data &&
        ["CAMERA", "LOCATION", "FILE_SYSTEM", "IMAGE_PICKER", "NOTIFICATIONS", "SHARING"].includes(
          data.type
        )
      ) {
        // 네이티브 기능 요청으로 인식하고 처리
        nativeFeatures.handleNativeFeatureMessage(
          data as NativeFeatureMessage,
          webViewRef as React.RefObject<WebView>
        );
        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to parse native feature request:", error);
      return false;
    }
  };

  // 메시지 처리 핸들러
  const handleMessage = (event: any) => {
    // 네이티브 기능 요청 처리 시도
    const isNativeFeatureRequest = handleNativeFeatureRequest(event);

    // 네이티브 기능 요청이 아닌 경우 기본 메시지 처리
    if (!isNativeFeatureRequest) {
      // 기본 메시지 처리
      const message = webViewMessaging.parseWebViewMessage(event);

      if (message && messageHandlers[message.type]) {
        messageHandlers[message.type](message);
      }
    }

    // 사용자 정의 핸들러 호출
    if (customOnMessage) {
      customOnMessage(event);
    }
  };

  // 페이지 로드 완료 핸들러
  const handleLoadEnd = () => {
    setIsLoading(false);

    // 페이지 캐싱 (연결된 상태에서만)
    if (cacheEnabled && !isOffline && webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        (function() {
          // 페이지 HTML 캐싱
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'CACHE_PAGE',
            payload: {
              content: document.documentElement.outerHTML
            }
          }));
          return true;
        })();
      `);
    }
  };

  // Android 백 버튼 처리
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (webViewRef.current) {
          webViewRef.current.goBack();
          return true; // 이벤트 처리 완료
        }
        return false; // 기본 뒤로가기 동작 수행
      };

      if (Platform.OS === "android") {
        BackHandler.addEventListener("hardwareBackPress", onBackPress);
        return () => {
          BackHandler.addEventListener("hardwareBackPress", () => false);
        };
      }
      return undefined;
    }, [])
  );

  // 에러 핸들러
  const handleError = (event: WebViewErrorEvent) => {
    console.error("WebView error:", event.nativeEvent);
    setIsLoading(false);

    // 에러 메시지 표시 - Alert 대신 화면에 직접 표시
    Alert.alert(
      "페이지 로딩 오류",
      "페이지를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.",
      [{ text: "확인", onPress: () => webViewRef.current?.reload() }]
    );
  };

  // 사용자 에이전트 설정
  const userAgent = Platform.select({
    ios: "UriwaAppIOS",
    android: "UriwaAppAndroid",
    default: "UriwaApp",
  });

  // 오프라인 상태 처리
  if (isOffline) {
    if (cachedContent) {
      return (
        <View style={styles.container}>
          <WebView
            originWhitelist={["*"]}
            source={{ html: cachedContent }}
            style={styles.webView}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            )}
          />
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>오프라인 모드</Text>
          </View>
        </View>
      );
    } else if (offlineHTMLContent) {
      return (
        <View style={styles.container}>
          <WebView
            originWhitelist={["*"]}
            source={{ html: offlineHTMLContent }}
            style={styles.webView}
          />
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>오프라인 모드</Text>
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.offlineContainer}>
          <Text style={styles.offlineTitle}>인터넷 연결 없음</Text>
          <Text style={styles.offlineMessage}>인터넷 연결을 확인하고 다시 시도해 주세요.</Text>
        </View>
      );
    }
  }

  // 오류 발생 시 보여줄 오류 페이지 HTML
  const getErrorHTML = (message: string) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            padding: 20px;
            text-align: center;
            background-color: #f9f9f9;
          }
          .error-icon {
            font-size: 48px;
            margin-bottom: 20px;
            color: #e74c3c;
          }
          h1 {
            color: #333;
            font-size: 24px;
            margin-bottom: 10px;
          }
          p {
            color: #666;
            margin-bottom: 20px;
          }
          button {
            background-color: #3498db;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <div class="error-icon">⚠️</div>
        <h1>오류가 발생했습니다</h1>
        <p>${message}</p>
        <button onclick="window.location.reload()">다시 시도</button>
      </body>
    </html>
  `;

  // HTTP 상태 변경 핸들러
  const handleHTTPError = (navState: WebViewNavigation) => {
    if (
      navState.title === "Error" ||
      navState.title?.includes("error") ||
      navState.url?.includes("auth%20session%20missing")
    ) {
      // 인증 오류가 발생한 경우 사용자 친화적인 화면 표시
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          document.body.innerHTML = \`${getErrorHTML(
            "인증 세션이 없거나 만료되었습니다. 다시 로그인해 주세요."
          )}\`;
          true;
        `);

        // 인증 오류 발생 시 3초 후 로그인 화면으로 이동
        setTimeout(() => {
          authHelper.clearAuthToken().then(() => {
            navigation.navigate("Login" as never);
          });
        }, 3000);
      }
    }

    // JSON 텍스트가 그대로 표시되는 경우 처리
    if (
      navState.title?.includes("{") &&
      navState.title?.includes("}") &&
      (navState.title?.includes("error") || navState.title?.includes("message"))
    ) {
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          document.body.innerHTML = \`${getErrorHTML(
            "데이터 형식 오류가 발생했습니다. 다시 시도해 주세요."
          )}\`;
          true;
        `);
      }
    }

    // 기존 콜백 함수 호출
    if (onNavigationStateChange) {
      onNavigationStateChange(navState);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={styles.webView}
        userAgent={userAgent}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        injectedJavaScript={injectedJavaScript}
        onNavigationStateChange={handleHTTPError}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        startInLoadingState={true}
        allowsBackForwardNavigationGestures={true} // iOS에서 스와이프 뒤로가기 활성화
        pullToRefreshEnabled={true} // 당겨서 새로고침 활성화
        cacheEnabled={cacheEnabled} // 캐싱 설정
        cacheMode="LOAD_CACHE_ELSE_NETWORK" // 안드로이드 캐시 모드
        incognito={false} // 쿠키 및 로컬 스토리지 유지
        mediaPlaybackRequiresUserAction={false} // 미디어 자동 재생 허용
        allowsInlineMediaPlayback={true} // 인라인 미디어 재생 허용
        geolocationEnabled={true} // 지리적 위치 허용
        allowFileAccess={true} // 파일 접근 허용
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
      />
      {isLoading && (
        <View style={styles.overlayLoading}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  webView: {
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
    backgroundColor: "#f5f5f5",
  },
  overlayLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  offlineContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  offlineTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  offlineMessage: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
  offlineBanner: {
    backgroundColor: "#f8d7da",
    padding: 5,
    alignItems: "center",
  },
  offlineText: {
    color: "#721c24",
    fontWeight: "bold",
  },
});

export default WebViewContainer;
