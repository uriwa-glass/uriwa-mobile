import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  BackHandler,
  Platform,
  Alert,
  Text,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
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

  // 플랫폼 감지
  const isIOS = Platform.OS === "ios";
  const isAndroid = Platform.OS === "android";

  // 안드로이드 하드웨어 가속 설정
  const androidHardwareAccelerationEnabled = isAndroid;

  // iOS에서 키보드 높이 조정 설정
  const keyboardVerticalOffset = isIOS ? 88 : 0;

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

  // iOS 플랫폼 특화 스크립트
  const iosPlatformScript = isIOS
    ? `
    // iOS에서 키보드 입력 시 스크롤 조정 및 기타 최적화
    (function() {
      // 폼 요소에 포커스가 갔을 때 스크롤 위치 조정
      const adjustScrollForInputs = () => {
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
          input.addEventListener('focus', () => {
            // 입력 요소가 화면 중앙에 오도록 조정
            setTimeout(() => {
              const rect = input.getBoundingClientRect();
              const scrollY = window.scrollY + rect.top - (window.innerHeight / 2);
              window.scrollTo({ top: scrollY, behavior: 'smooth' });
            }, 300);
          });
        });
      };
      
      // 페이지 로드 시 포커스 조정 함수 등록
      document.addEventListener('DOMContentLoaded', adjustScrollForInputs);
      window.addEventListener('load', adjustScrollForInputs);
      
      // Safe Area 조정
      const applySafeArea = () => {
        const safeAreaStyle = document.createElement('style');
        safeAreaStyle.innerHTML = \`
          :root {
            --safe-area-inset-top: env(safe-area-inset-top);
            --safe-area-inset-bottom: env(safe-area-inset-bottom);
            --safe-area-inset-left: env(safe-area-inset-left);
            --safe-area-inset-right: env(safe-area-inset-right);
          }
          body { 
            padding-top: var(--safe-area-inset-top);
            padding-bottom: var(--safe-area-inset-bottom);
            padding-left: var(--safe-area-inset-left);
            padding-right: var(--safe-area-inset-right);
          }
        \`;
        document.head.appendChild(safeAreaStyle);
      };
      
      // Safe Area 적용
      applySafeArea();
    })();
  `
    : "";

  // Android 플랫폼 특화 스크립트
  const androidPlatformScript = isAndroid
    ? `
    // Android에서 최적화 및 뒤로가기 버튼 관리
    (function() {
      // 뒤로가기 버튼 처리를 위한 이벤트
      window.addEventListener('message', function(event) {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'ANDROID_BACK_PRESS') {
            // 현재 페이지에서 뒤로가기가 필요한 경우 true 반환
            // 네이티브 앱에서 처리해야 하는 경우 false 반환
            const canGoBack = window.history.length > 1;
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'ANDROID_BACK_PRESS_RESPONSE',
              payload: { canGoBack: canGoBack }
            }));
            
            if (canGoBack) {
              window.history.back();
            }
          }
        } catch (e) {
          console.error('Android back press handler error:', e);
        }
      });
      
      // 페이지 렌더링 성능 최적화
      document.addEventListener('DOMContentLoaded', () => {
        // 이미지 지연 로딩 설정
        const lazyImages = document.querySelectorAll('img:not([loading])');
        lazyImages.forEach(img => {
          img.setAttribute('loading', 'lazy');
        });
        
        // 불필요한 애니메이션 최소화
        const style = document.createElement('style');
        style.innerHTML = \`
          @media (prefers-reduced-motion) {
            * {
              animation-duration: 0.001s !important;
              transition-duration: 0.001s !important;
            }
          }
        \`;
        document.head.appendChild(style);
      });
    })();
  `
    : "";

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

    // 성능 최적화 및 메모리 관리
    (function() {
      // 이미지 최적화
      const optimizeImages = () => {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
          // 이미지 지연 로딩
          if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
          }
          
          // 스크린 너비에 맞게 이미지 크기 조정 (srcset이 없는 경우)
          if (!img.hasAttribute('srcset') && img.hasAttribute('src')) {
            // viewport 기준으로 적절한 크기 설정
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
          }
        });
      };
      
      // 이벤트 리스너 메모리 누수 방지
      const cleanupBeforeUnload = () => {
        window.addEventListener('beforeunload', () => {
          // 등록된 이벤트 리스너 제거
          const cleanup = () => {
            // 일부 이벤트 리스너가 내부 변수에 저장된 경우 접근 불가하므로
            // 명시적으로 제거 가능한 이벤트만 처리
            document.querySelectorAll('[data-has-listener]').forEach(el => {
              el.removeAttribute('data-has-listener');
              // 특정 이벤트 제거가 필요한 경우 여기 추가
            });
          };
          cleanup();
        });
      };
      
      // DOM 로드 완료 시 최적화 함수 실행
      document.addEventListener('DOMContentLoaded', () => {
        optimizeImages();
        cleanupBeforeUnload();
      });
    })();

    true; // 주의: 이 값은 반드시 반환해야 합니다
  `;

  // 네이티브 브릿지 스크립트 추가
  const nativeBridgeScript = nativeFeatures.getNativeBridgeScript();

  // 사용자 정의 JS와 통신 JS 합치기
  const injectedJavaScript = `
    ${communicationScript}
    ${nativeBridgeScript}
    ${iosPlatformScript}
    ${androidPlatformScript}
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
    // 안드로이드 뒤로가기 응답 처리
    ANDROID_BACK_PRESS_RESPONSE: (message) => {
      // 웹뷰에서 뒤로가기 처리 여부 응답
      console.log("Android back press response:", message.payload);
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

    // 사용자 정의 메시지 핸들러 호출
    if (customOnMessage) {
      customOnMessage(event);
    }
  };

  // 웹뷰 로드 완료 처리
  const handleLoadEnd = () => {
    setIsLoading(false);

    // 웹 페이지 스크롤 위치 저장 기능 (앱 재진입 시 스크롤 위치 복원)
    if (webViewRef.current) {
      const scrollPositionScript = `
        (function() {
          // 스크롤 위치 저장
          const saveScrollPosition = () => {
            const scrollPos = { x: window.scrollX, y: window.scrollY };
            localStorage.setItem('scrollPosition_${url}', JSON.stringify(scrollPos));
          };
          
          // 페이지 이동 시 스크롤 위치 저장
          window.addEventListener('beforeunload', saveScrollPosition);
          
          // 주기적으로 스크롤 위치 저장
          setInterval(saveScrollPosition, 5000);
          
          // 저장된 스크롤 위치 복원
          const restoreScrollPosition = () => {
            try {
              const scrollPos = JSON.parse(localStorage.getItem('scrollPosition_${url}'));
              if (scrollPos) {
                window.scrollTo(scrollPos.x, scrollPos.y);
              }
            } catch (e) {
              console.error('Failed to restore scroll position:', e);
            }
          };
          
          // 페이지 로드 후 스크롤 위치 복원
          setTimeout(restoreScrollPosition, 500);
        })();
        true;
      `;
      webViewRef.current.injectJavaScript(scrollPositionScript);
    }
  };

  // 안드로이드 뒤로가기 버튼 처리
  useFocusEffect(
    useCallback(() => {
      // 안드로이드에서만 적용
      if (Platform.OS === "android") {
        const onBackPress = () => {
          // 웹뷰가 있고 뒤로 갈 수 있는 경우
          if (webViewRef.current) {
            // 웹뷰에 안드로이드 뒤로가기 이벤트 전달
            webViewRef.current.injectJavaScript(`
              window.postMessage(JSON.stringify({ type: 'ANDROID_BACK_PRESS' }), '*');
              true;
            `);
            return true; // 이벤트 처리됨
          }
          return false; // 기본 뒤로가기 동작 허용
        };

        // 뒤로가기 핸들러 등록
        BackHandler.addEventListener("hardwareBackPress", onBackPress);

        return () => {
          // 이벤트 리스너 정리
          BackHandler.removeEventListener("hardwareBackPress", onBackPress);
        };
      }
      return undefined;
    }, [])
  );

  // 웹뷰 오류 처리
  const handleError = (event: WebViewErrorEvent) => {
    console.error("WebView error:", event);

    if (isOffline) {
      // 오프라인 상태에서 캐시된 콘텐츠가 있는 경우
      if (cachedContent) {
        console.log("Using cached content in offline mode");
        // 웹뷰에 캐시된 콘텐츠 표시
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            document.open();
            document.write(\`${cachedContent.replace(/\\/g, "\\\\").replace(/`/g, "\\`")}\`);
            document.close();
            true;
          `);
        }
      } else if (offlineHTMLContent) {
        // 제공된 오프라인 HTML 컨텐츠 표시
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            document.open();
            document.write(\`${offlineHTMLContent.replace(/\\/g, "\\\\").replace(/`/g, "\\`")}\`);
            document.close();
            true;
          `);
        }
      }
    }
  };

  // HTTP 오류 페이지 HTML 생성
  const getErrorHTML = (message: string) => `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
      <title>오류 발생</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          padding: 20px;
          text-align: center;
          color: #333;
          background-color: #f9f9f9;
          margin: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
        .error-container {
          background-color: white;
          border-radius: 8px;
          padding: 30px 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          max-width: 350px;
          width: 100%;
        }
        .error-icon {
          font-size: 50px;
          margin-bottom: 20px;
        }
        h1 {
          font-size: 24px;
          margin-bottom: 15px;
          font-weight: 600;
        }
        p {
          margin-bottom: 25px;
          line-height: 1.5;
          color: #666;
        }
        button {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          font-weight: 500;
          width: 100%;
        }
        button:active {
          background-color: #2980b9;
        }
        .dark-mode {
          background-color: #121212;
          color: #e0e0e0;
        }
        .dark-mode .error-container {
          background-color: #1e1e1e;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }
        .dark-mode p {
          color: #b0b0b0;
        }
        .dark-mode button {
          background-color: #2196f3;
        }
        .dark-mode button:active {
          background-color: #1976d2;
        }
        @media (prefers-color-scheme: dark) {
          body {
            background-color: #121212;
            color: #e0e0e0;
          }
          .error-container {
            background-color: #1e1e1e;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
          }
          p {
            color: #b0b0b0;
          }
          button {
            background-color: #2196f3;
          }
          button:active {
            background-color: #1976d2;
          }
        }
      </style>
    </head>
    <body>
      <div class="error-container">
        <div class="error-icon">⚠️</div>
        <h1>오류가 발생했습니다</h1>
        <p>${message}</p>
        <button onclick="window.location.reload()">다시 시도</button>
      </div>
      <script>
        // 다크 모드 감지
        const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDarkMode) {
          document.body.classList.add('dark-mode');
        }
        
        // 네트워크 상태 확인
        function checkNetwork() {
          if (!navigator.onLine) {
            document.querySelector('p').innerText = '인터넷 연결을 확인해주세요.';
          }
        }
        
        checkNetwork();
        window.addEventListener('online', checkNetwork);
        window.addEventListener('offline', checkNetwork);
      </script>
    </body>
    </html>
  `;

  // HTTP 오류 처리
  const handleHTTPError = (navState: WebViewNavigation) => {
    const { url, title } = navState;

    // HTTP 오류 코드 확인
    if (title && /Error\s+(\d+)/i.test(title)) {
      const errorCode = title.match(/Error\s+(\d+)/i)[1];
      let errorMessage = "페이지를 불러오는 중 오류가 발생했습니다.";

      switch (errorCode) {
        case "404":
          errorMessage = "요청하신 페이지를 찾을 수 없습니다.";
          break;
        case "500":
          errorMessage = "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
          break;
        case "503":
          errorMessage = "서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.";
          break;
        case "403":
          errorMessage = "이 페이지에 접근할 권한이 없습니다.";
          break;
        case "401":
          errorMessage = "인증이 필요합니다. 로그인 후 다시 시도해주세요.";
          break;
        default:
          errorMessage = `오류가 발생했습니다. (${errorCode})`;
      }

      // 오류 페이지 표시
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          document.open();
          document.write(\`${getErrorHTML(errorMessage)
            .replace(/\\/g, "\\\\")
            .replace(/`/g, "\\`")}\`);
          document.close();
          true;
        `);
      }
    }
  };

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    // HTTP 오류 확인
    handleHTTPError(navState);

    // 사용자 정의 네비게이션 이벤트 핸들러 호출
    if (onNavigationStateChange) {
      onNavigationStateChange(navState);
    }
  };

  if (isOffline && !cachedContent && !offlineHTMLContent) {
    // 오프라인 상태에서 캐시된 컨텐츠가 없는 경우 오프라인 화면 표시
    return (
      <View style={styles.offlineContainer}>
        <Text style={styles.offlineTitle}>인터넷 연결 없음</Text>
        <Text style={styles.offlineMessage}>인터넷 연결을 확인한 후 다시 시도해주세요.</Text>
      </View>
    );
  }

  // 플랫폼별 스타일 적용
  const webViewContainerStyle = isIOS
    ? { ...styles.webViewContainer /* iOS 특화 스타일 */ }
    : isAndroid
    ? { ...styles.webViewContainer /* Android 특화 스타일 */ }
    : styles.webViewContainer;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isIOS ? "dark-content" : "light-content"} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={isIOS ? "padding" : undefined}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <View style={webViewContainerStyle}>
          <WebView
            ref={webViewRef}
            source={{ uri: url }}
            originWhitelist={["*"]}
            onLoadEnd={handleLoadEnd}
            onNavigationStateChange={handleNavigationStateChange}
            onMessage={handleMessage}
            onError={handleError}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3498db" />
              </View>
            )}
            startInLoadingState={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            injectedJavaScript={injectedJavaScript}
            cacheEnabled={cacheEnabled}
            sharedCookiesEnabled={true}
            thirdPartyCookiesEnabled={true}
            pullToRefreshEnabled={true}
            allowsBackForwardNavigationGestures={isIOS}
            allowFileAccess={true}
            allowFileAccessFromFileURLs={true}
            allowUniversalAccessFromFileURLs={true}
            allowsFullscreenVideo={true}
            bounces={isIOS}
            overScrollMode={isAndroid ? "never" : undefined}
          />
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#3498db" />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  webViewContainer: {
    flex: 1,
    overflow: "hidden",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
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
    color: "#333",
  },
  offlineMessage: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
});

export default WebViewContainer;
