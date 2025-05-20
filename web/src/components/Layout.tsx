import React from "react";
import { useNavigate } from "react-router-dom";
import { useResponsive } from "../hooks/useResponsive";

interface LayoutProps {
  title?: string;
  showBackButton?: boolean;
  noPadding?: boolean;
  showFooter?: boolean;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"; // 최대 너비 설정
  centerContent?: boolean; // 내용 중앙 정렬 여부
}

const Layout: React.FC<LayoutProps> = ({
  title,
  showBackButton = true,
  noPadding = false,
  showFooter = false,
  children,
  maxWidth = "md",
  centerContent = false,
}) => {
  const navigate = useNavigate();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const handleBack = () => {
    navigate(-1);
  };

  // 최대 너비 클래스
  const maxWidthClass =
    maxWidth === "sm"
      ? "max-w-md"
      : maxWidth === "md"
      ? "max-w-lg"
      : maxWidth === "lg"
      ? "max-w-2xl"
      : maxWidth === "xl"
      ? "max-w-4xl"
      : maxWidth === "2xl"
      ? "max-w-6xl"
      : maxWidth === "full"
      ? "max-w-full"
      : "max-w-md";

  // 반응형 패딩
  const mainPadding = noPadding ? "p-0" : isMobile ? "p-4" : isTablet ? "p-6" : "p-8";

  return (
    <div
      className={`flex flex-col min-h-screen w-full bg-background-default mx-auto ${maxWidthClass} ${
        isDesktop ? "shadow-lg rounded-md mt-4 mb-4" : ""
      }`}
    >
      <header
        className={`flex items-center sticky top-0 z-10 bg-background-paper border-b border-border-light ${
          isMobile ? "p-4" : "p-4 md:p-5"
        }`}
      >
        {showBackButton && (
          <button
            className="bg-transparent border-none cursor-pointer text-lg text-primary-main flex items-center p-2 mr-2"
            onClick={handleBack}
            aria-label="뒤로 가기"
          >
            ←
          </button>
        )}
        {title && (
          <h1
            className={`text-text-primary font-bold m-0 flex-1 ${
              isMobile ? "text-xl" : isTablet ? "text-xl" : "text-2xl"
            }`}
          >
            {title}
          </h1>
        )}
      </header>

      <main
        className={`flex-1 overflow-y-auto ${mainPadding} ${
          centerContent ? "flex flex-col items-center" : ""
        }`}
      >
        {children}
      </main>

      {showFooter && (
        <footer
          className={`bg-background-paper border-t border-border-light text-center text-text-secondary ${
            isMobile ? "p-4 text-sm" : "p-5 text-base"
          }`}
        >
          &copy; {new Date().getFullYear()} URIWA 모바일
        </footer>
      )}
    </div>
  );
};

export default Layout;
