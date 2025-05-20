/**
 * API 모듈 인덱스
 * 애플리케이션 전체에서 API 관련 기능을 사용할 수 있도록 내보냅니다.
 */

import { useEffect, useState } from "react";
import authHelper from "../utils/authHelper";

// Supabase API 클라이언트
export { supabaseApi, ApiError } from "./supabaseApi";

// React Query 관련 내보내기
export { queryClient } from "./queryClient";
export { QueryProvider } from "./QueryProvider";

// API 오류 처리 함수
export const handleAPIError = (error: any): string => {
  console.error("API 오류:", error);

  if (error?.message?.includes("auth session missing")) {
    authHelper.clearAuthToken(); // 세션 정리
    return "인증 세션이 만료되었습니다. 다시 로그인해 주세요.";
  }

  return error?.message || "알 수 없는 오류가 발생했습니다.";
};

// 인증 관련 훅
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await authHelper.getAuthToken();
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error("인증 확인 오류:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { isAuthenticated, isLoading };
};

// API 호출 훅
export * from "./hooks";

// Schema 및 타입
export * from "./schema";
