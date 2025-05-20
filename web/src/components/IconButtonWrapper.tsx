import React, { ReactNode } from "react";
import { IconButton as MIconButton } from "@material-tailwind/react";

// IconButton 래퍼 컴포넌트 속성 타입
interface IconButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "filled" | "outlined" | "gradient" | "text";
  size?: "sm" | "md" | "lg";
  color?:
    | "blue"
    | "red"
    | "green"
    | "amber"
    | "orange"
    | "purple"
    | "pink"
    | "indigo"
    | "teal"
    | "cyan"
    | "gray";
  onClick?: () => void;
  fullWidth?: boolean;
}

// Material Tailwind의 IconButton을 래핑하는 컴포넌트
export const IconButton: React.FC<IconButtonProps> = ({
  children,
  className,
  variant = "filled",
  size = "md",
  color = "blue",
  onClick,
  fullWidth,
  ...props
}) => {
  // @ts-ignore - Material Tailwind 컴포넌트의 타입 문제 우회
  const ButtonComponent = MIconButton as any;

  return (
    <ButtonComponent
      className={className}
      variant={variant}
      size={size}
      color={color}
      onClick={onClick}
      fullWidth={fullWidth}
      {...props}
    >
      {children}
    </ButtonComponent>
  );
};
