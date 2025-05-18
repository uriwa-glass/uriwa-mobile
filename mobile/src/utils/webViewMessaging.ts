import { WebView } from "react-native-webview";
import { RefObject } from "react";

/**
 * WebView와 네이티브 앱 간 통신을 위한 유틸리티 함수
 */

type MessageType =
  | "AUTH_TOKEN"
  | "APP_READY"
  | "NAVIGATION"
  | "SHARE"
  | "OPEN_EXTERNAL"
  | "CACHE_PAGE"
  | "CUSTOM";

interface WebViewMessage {
  type: MessageType;
  payload?: any;
}

/**
 * 웹뷰로 메시지를 보내는 함수
 * @param webViewRef WebView 컴포넌트의 참조
 * @param message 메시지 객체
 * @returns 성공 여부
 */
export const sendMessageToWebView = (
  webViewRef: RefObject<WebView>,
  message: WebViewMessage
): boolean => {
  if (!webViewRef.current) {
    console.error("WebView reference is not available");
    return false;
  }

  try {
    const messageString = JSON.stringify(message);
    const script = `
      (function() {
        window.postMessage(${JSON.stringify(messageString)}, '*');
        return true;
      })();
    `;
    webViewRef.current.injectJavaScript(script);
    return true;
  } catch (error) {
    console.error("Failed to send message to WebView:", error);
    return false;
  }
};

/**
 * 네이티브 앱에서 받은 메시지를 파싱하는 함수
 * @param event WebView의 onMessage 이벤트
 * @returns 파싱된 메시지 객체
 */
export const parseWebViewMessage = (event: any): WebViewMessage | null => {
  try {
    const data = JSON.parse(event.nativeEvent.data);
    return data as WebViewMessage;
  } catch (error) {
    console.error("Failed to parse WebView message:", error);
    return null;
  }
};

/**
 * WebView 메시지 핸들러 타입
 */
export type WebViewMessageHandler = (message: WebViewMessage) => void;

/**
 * 메시지 타입에 따라 핸들러를 등록하는 함수
 * @param messageHandlers 메시지 타입별 핸들러 맵
 * @param event WebView의 onMessage 이벤트
 */
export const handleWebViewMessage = (
  messageHandlers: Record<MessageType, WebViewMessageHandler>,
  event: any
): void => {
  const message = parseWebViewMessage(event);

  if (!message) return;

  const handler = messageHandlers[message.type];
  if (handler) {
    handler(message);
  } else {
    console.warn(`No handler registered for message type: ${message.type}`);
  }
};

/**
 * 웹뷰에 인증 토큰을 전송하는 함수
 * @param webViewRef WebView 컴포넌트의 참조
 * @param token 인증 토큰
 */
export const sendAuthTokenToWebView = (webViewRef: RefObject<WebView>, token: string): boolean => {
  return sendMessageToWebView(webViewRef, {
    type: "AUTH_TOKEN",
    payload: { token },
  });
};

/**
 * 외부 링크 열기 메시지를 처리하는 함수 (웹뷰에서 네이티브 앱으로)
 * @param url 열 URL
 * @param webViewRef WebView 컴포넌트의 참조
 */
export const openExternalLink = (url: string, webViewRef: RefObject<WebView>): boolean => {
  return sendMessageToWebView(webViewRef, {
    type: "OPEN_EXTERNAL",
    payload: { url },
  });
};

/**
 * 앱 준비 상태를 웹뷰에 알리는 함수
 * @param webViewRef WebView 컴포넌트의 참조
 */
export const notifyAppReady = (webViewRef: RefObject<WebView>): boolean => {
  return sendMessageToWebView(webViewRef, {
    type: "APP_READY",
  });
};

export default {
  sendMessageToWebView,
  parseWebViewMessage,
  handleWebViewMessage,
  sendAuthTokenToWebView,
  openExternalLink,
  notifyAppReady,
};
