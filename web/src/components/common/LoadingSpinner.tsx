import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "pink" | "gray" | "white";
  className?: string;
}

const LoadingSpinner = ({ size = "md", color = "pink", className = "" }: LoadingSpinnerProps) => {
  // 크기에 따른 클래스 결정
  const sizeClass = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }[size];

  // 색상에 따른 클래스 결정
  const colorClass = {
    pink: "text-pink-600",
    gray: "text-gray-600",
    white: "text-white",
  }[color];

  return (
    <div className={`inline-block ${className}`} role="status" aria-label="로딩 중">
      <svg
        className={`animate-spin ${sizeClass} ${colorClass}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <span className="sr-only">로딩 중...</span>
    </div>
  );
};

export default LoadingSpinner;
