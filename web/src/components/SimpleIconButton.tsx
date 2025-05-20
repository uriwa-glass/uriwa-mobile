import React, { ReactNode } from "react";

interface SimpleIconButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * 단순화된 아이콘 버튼 컴포넌트
 * Material Tailwind의 타입 문제를 우회하기 위한 대체 컴포넌트
 */
const SimpleIconButton: React.FC<SimpleIconButtonProps> = ({
  children,
  className = "",
  onClick,
}) => {
  return (
    <button
      className={`flex items-center justify-center rounded-full w-10 h-10 ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default SimpleIconButton;
