import * as React from "react";

export interface ButtonProps {
  variant?: "primary" | "outline" | "text" | "success" | "warning" | "danger";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: any;
  className?: string;
  children?: any;
  type?: "button" | "submit" | "reset";
  [key: string]: any; // 추가 속성을 위한 인덱스 시그니처
}

const Button = ({
  variant = "primary",
  size = "medium",
  fullWidth = false,
  disabled = false,
  onClick,
  children,
  className = "",
  type = "button",
  ...props
}: ButtonProps) => {
  // 기본 클래스
  let baseClasses =
    "flex justify-center items-center font-medium transition-all duration-300 outline-none";

  // 너비 클래스
  const widthClass = fullWidth ? "w-full" : "w-auto";

  // 버튼 타입에 따른 클래스
  let variantClasses = "";
  switch (variant) {
    case "primary":
      variantClasses = `bg-primary-main text-primary-contrast hover:bg-primary-dark
        disabled:bg-neutral-main disabled:text-text-disabled disabled:cursor-not-allowed`;
      break;
    case "outline":
      variantClasses = `bg-transparent text-primary-main border border-primary-main
        hover:bg-primary-light hover:text-primary-dark
        disabled:border-text-disabled disabled:text-text-disabled disabled:cursor-not-allowed`;
      break;
    case "text":
      variantClasses = `bg-transparent text-primary-main hover:bg-opacity-5 hover:bg-primary-main
        disabled:text-text-disabled disabled:cursor-not-allowed`;
      break;
    case "success":
      variantClasses = `bg-success-main text-primary-contrast hover:bg-success-dark
        disabled:bg-neutral-main disabled:text-text-disabled disabled:cursor-not-allowed`;
      break;
    case "warning":
      variantClasses = `bg-warning-main text-primary-contrast hover:bg-warning-dark
        disabled:bg-neutral-main disabled:text-text-disabled disabled:cursor-not-allowed`;
      break;
    case "danger":
      variantClasses = `bg-error-main text-primary-contrast hover:bg-error-dark
        disabled:bg-neutral-main disabled:text-text-disabled disabled:cursor-not-allowed`;
      break;
    default:
      variantClasses = "bg-primary-main text-primary-contrast";
  }

  // 버튼 크기에 따른 클래스
  let sizeClasses = "";
  switch (size) {
    case "small":
      sizeClasses = "py-1.5 px-3 text-sm rounded-sm";
      break;
    case "large":
      sizeClasses = "py-3 px-5 text-lg rounded-lg";
      break;
    default:
      sizeClasses = "py-2.5 px-4 text-md rounded-md";
  }

  // 최종 클래스 조합
  const buttonClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${widthClass} ${className}`;

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={buttonClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;
