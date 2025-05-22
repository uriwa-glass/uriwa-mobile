import React from "react";

interface LoadingScreenProps {
  message?: string;
}

/**
 * 전체 화면 로딩 컴포넌트
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "로딩 중..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#FF7648] mb-4"></div>
      <p className="text-gray-600 text-lg">{message}</p>
    </div>
  );
};

export default LoadingScreen;
