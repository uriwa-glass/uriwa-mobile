import { QueryClient } from "@tanstack/react-query";

/**
 * React Query 클라이언트 설정
 * 전역 상태 관리를 위한 설정입니다.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5분
    },
  },
});
