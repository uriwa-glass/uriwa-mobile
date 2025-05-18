import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Query 클라이언트 설정
 */
const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5분
        gcTime: 1000 * 60 * 30, // 30분 (이전의 cacheTime)
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

/**
 * React Query Provider
 * 애플리케이션 전체에서 React Query를 사용할 수 있도록 제공합니다.
 */
interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  // 클라이언트 인스턴스 생성
  const [queryClient] = React.useState(() => createQueryClient());

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
