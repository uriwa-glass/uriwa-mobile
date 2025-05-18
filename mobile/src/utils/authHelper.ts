import AsyncStorage from "@react-native-async-storage/async-storage";
import { WebView } from "react-native-webview";
import { RefObject } from "react";
import webViewMessaging from "./webViewMessaging";

// 스토리지 키
const AUTH_TOKEN_KEY = "auth_token";
const USER_DATA_KEY = "user_data";

/**
 * 저장된 인증 토큰을 가져오는 함수
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error("Failed to get auth token:", error);
    return null;
  }
};

/**
 * 인증 토큰을 저장하는 함수
 */
export const setAuthToken = async (token: string): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error("Failed to set auth token:", error);
    return false;
  }
};

/**
 * 인증 토큰을 삭제하는 함수
 */
export const clearAuthToken = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    return true;
  } catch (error) {
    console.error("Failed to clear auth token:", error);
    return false;
  }
};

/**
 * 사용자 데이터를 저장하는 함수
 */
export const setUserData = async (userData: any): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error("Failed to set user data:", error);
    return false;
  }
};

/**
 * 저장된 사용자 데이터를 가져오는 함수
 */
export const getUserData = async (): Promise<any | null> => {
  try {
    const data = await AsyncStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to get user data:", error);
    return null;
  }
};

/**
 * 사용자 데이터를 삭제하는 함수
 */
export const clearUserData = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(USER_DATA_KEY);
    return true;
  } catch (error) {
    console.error("Failed to clear user data:", error);
    return false;
  }
};

/**
 * 로그아웃 함수 (모든 인증 정보 삭제)
 */
export const logout = async (): Promise<boolean> => {
  try {
    await Promise.all([clearAuthToken(), clearUserData()]);
    return true;
  } catch (error) {
    console.error("Failed to logout:", error);
    return false;
  }
};

/**
 * WebView에 인증 토큰을 전송하는 함수
 */
export const sendAuthTokenToWebView = async (webViewRef: RefObject<WebView>): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    if (token && webViewRef.current) {
      return webViewMessaging.sendAuthTokenToWebView(webViewRef, token);
    }
    return false;
  } catch (error) {
    console.error("Failed to send auth token to WebView:", error);
    return false;
  }
};

/**
 * 사용자 인증 상태 확인 함수
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getAuthToken();
  return !!token;
};

export default {
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  setUserData,
  getUserData,
  clearUserData,
  logout,
  sendAuthTokenToWebView,
  isAuthenticated,
};
