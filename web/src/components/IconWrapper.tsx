import React, { ReactNode } from "react";
import { IconType } from "react-icons";

interface IconWrapperProps {
  icon: IconType;
  className?: string;
  size?: number;
}

/**
 * React Icons의 타입 문제를 해결하기 위한 래퍼 컴포넌트
 */
const IconWrapper: React.FC<IconWrapperProps> = ({ icon: Icon, className, size }) => {
  return (
    // @ts-ignore - React Icons의 타입 문제를 우회
    <Icon className={className} size={size} />
  );
};

export default IconWrapper;
