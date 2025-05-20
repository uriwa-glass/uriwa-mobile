import { Linking } from "react-native";
import { useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import { NavigationContainerRef } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import authHelper from "./authHelper";

/**
 * 딥링크 URL 처리 함수
 * @param url 처리할 URL
 * @param navigation 네비게이션 컨테이너 참조
 * @returns 처리 성공 여부
 */
export const handleDeepLink = async (
  url: string | null,
  navigation: NavigationContainerRef<RootStackParamList>
): Promise<boolean> => {
  if (!url) return false;

  console.log("Handling deep link:", url);

  try {
    // URL 파싱
    const parsedUrl = new URL(url);
    const path = parsedUrl.pathname;
    const searchParams = parsedUrl.searchParams;

    // 특수 경로 처리
    if (url.includes("login-callback")) {
      // OAuth 로그인 콜백 처리
      return handleLoginCallback(url, navigation);
    } else if (url.includes("reset-password-callback")) {
      // 비밀번호 재설정 콜백 처리
      return handlePasswordResetCallback(url, navigation);
    } else if (path.startsWith("/auth/")) {
      return handleAuthDeepLink(path, searchParams, navigation);
    } else if (path.startsWith("/class/")) {
      // 수업 상세 페이지로 이동
      const classId = path.replace("/class/", "");
      const classUrl = `/class/${classId}`;
      navigation.navigate("WebDetail", { url: classUrl, title: "수업 정보" });
      return true;
    } else if (path.startsWith("/gallery/")) {
      // 갤러리 상세 페이지로 이동
      const galleryId = path.replace("/gallery/", "");
      const galleryUrl = `/gallery/${galleryId}`;
      navigation.navigate("WebDetail", { url: galleryUrl, title: "갤러리" });
      return true;
    }

    // 기본 동작: 웹뷰로 경로 전달
    navigation.navigate("WebDetail", { url: path });
    return true;
  } catch (error) {
    console.error("Deep link handling error:", error);
    return false;
  }
};

/**
 * OAuth 로그인 콜백 처리 함수
 * @param url 콜백 URL
 * @param navigation 네비게이션 컨테이너 참조
 * @returns 처리 성공 여부
 */
const handleLoginCallback = async (
  url: string,
  navigation: NavigationContainerRef<RootStackParamList>
): Promise<boolean> => {
  try {
    // 로그인 성공 후 처리
    const token = url.includes("access_token=")
      ? new URL(url).searchParams.get("access_token")
      : null;

    if (token) {
      await authHelper.setAuthToken(token);

      // 사용자 인증 성공 후 메인 화면으로 이동
      navigation.reset({
        index: 0,
        routes: [{ name: "MainTab" }],
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error("OAuth login callback error:", error);
    return false;
  }
};

/**
 * 비밀번호 재설정 콜백 처리 함수
 * @param url 콜백 URL
 * @param navigation 네비게이션 컨테이너 참조
 * @returns 처리 성공 여부
 */
const handlePasswordResetCallback = async (
  url: string,
  navigation: NavigationContainerRef<RootStackParamList>
): Promise<boolean> => {
  try {
    // 비밀번호 재설정 토큰 파싱
    const parsedUrl = new URL(url);
    const token = parsedUrl.searchParams.get("token");

    if (token) {
      // 여기서 추가 처리가 필요하다면 추가

      // 로그인 화면으로 돌아가기
      navigation.navigate("Login");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Password reset callback error:", error);
    return false;
  }
};

/**
 * 인증 관련 딥링크 처리 함수
 * @param path URL 경로
 * @param searchParams URL 검색 파라미터
 * @param navigation 네비게이션 컨테이너 참조
 * @returns 처리 성공 여부
 */
const handleAuthDeepLink = async (
  path: string,
  searchParams: URLSearchParams,
  navigation: NavigationContainerRef<RootStackParamList>
): Promise<boolean> => {
  // 로그인 콜백 처리
  if (path.includes("/auth/callback")) {
    const token = searchParams.get("access_token");

    if (token) {
      await authHelper.setAuthToken(token);

      // 사용자 인증 성공 후 메인 화면으로 이동
      navigation.reset({
        index: 0,
        routes: [{ name: "MainTab" }],
      });
      return true;
    }
  }

  // 로그아웃 처리
  if (path.includes("/auth/logout")) {
    await authHelper.logout();

    // 로그아웃 후 로그인 화면으로 이동
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
    return true;
  }

  return false;
};

/**
 * 초기 URL과 수신 URL 이벤트를 처리하는 훅
 * @param navigation 네비게이션 컨테이너 참조
 */
export const useDeepLinks = (navigation: NavigationContainerRef<RootStackParamList>) => {
  useEffect(() => {
    // 앱이 닫혀 있을 때 딥링크로 열린 경우 처리
    const getInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink(initialUrl, navigation);
      }
    };

    // 앱이 이미 실행 중일 때 딥링크 처리
    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url, navigation);
    });

    getInitialURL();

    return () => {
      subscription.remove();
    };
  }, [navigation]);
};

/**
 * 외부 URL을 열기 위한 함수
 * 가능한 경우 앱 내에서 처리하고, 아니면 외부 브라우저 사용
 * @param url 열 URL
 */
export const openURL = async (url: string): Promise<void> => {
  try {
    // 앱에서 처리 가능한 내부 URL 확인
    const canHandleInternally = url.includes("uriwa.com") || url.startsWith("/");

    if (canHandleInternally) {
      // 내부 처리
      await Linking.openURL(url);
    } else {
      // 외부 브라우저로 열기
      await WebBrowser.openBrowserAsync(url);
    }
  } catch (error) {
    console.error("URL 열기 오류:", error);
  }
};

export default {
  handleDeepLink,
  useDeepLinks,
  openURL,
};
