import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient";

/**
 * React Query 상태 관리를 위한 Provider 컴포넌트
 * 애플리케이션의 상태 관리를 담당합니다.
 */
export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
