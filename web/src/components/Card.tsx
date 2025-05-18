import React from "react";

export type CardVariant = "elevated" | "outlined" | "filled";

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  className?: string;
  onClick?: () => void;
  title?: string;
  subtitle?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  footer?: React.ReactNode;
}

/**
 * 카드 컴포넌트
 *
 * 컨텐츠를 담는 컨테이너 역할을 하는 카드 컴포넌트입니다.
 */
const Card: React.FC<CardProps> = ({
  children,
  variant = "elevated",
  className = "",
  onClick,
  title,
  subtitle,
  fullWidth = false,
  disabled = false,
  footer,
}) => {
  // 변형에 따른 스타일 클래스
  let variantClasses = "";
  switch (variant) {
    case "elevated":
      variantClasses = "bg-background-paper shadow-md";
      break;
    case "outlined":
      variantClasses = "bg-background-default border border-border-light";
      break;
    case "filled":
      variantClasses = "bg-background-paper";
      break;
    default:
      variantClasses = "bg-background-paper shadow-md";
  }

  // 기본 카드 클래스
  const cardClasses = `
    rounded-md overflow-hidden m-2
    ${variantClasses}
    ${fullWidth ? "w-full mx-0" : ""}
    ${disabled ? "opacity-60" : ""}
    ${onClick ? "cursor-pointer" : ""}
    ${className}
  `;

  // 이벤트 핸들러
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <div className={cardClasses} onClick={onClick ? handleClick : undefined}>
      {(title || subtitle) && (
        <div className="p-4 border-b border-border-light">
          {title && <h3 className="text-lg font-medium text-text-primary mb-1">{title}</h3>}
          {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && <div className="p-4 border-t border-border-light">{footer}</div>}
    </div>
  );
};

export default Card;
