import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useResponsive } from "../hooks/useResponsive";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

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
  const location = useLocation();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { user, profile } = useAuth();

  const isLoggedIn = !!user && !!profile;
  const isLoginPage = location.pathname === "/login";

  // 디버깅을 위해 현재 경로 확인
  useEffect(() => {
    console.log("현재 경로:", location.pathname);
  }, [location.pathname]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleProfileClick = () => {
    navigate("/mypage");
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault(); // 기본 동작 방지
    console.log("로그인 버튼 클릭됨, 로그인 페이지로 이동 시도");

    // 직접 URL 변경 시도
    window.location.href = "/login";

    // navigate 함수도 시도
    // navigate("/login", { replace: true });
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

        {/* 프로필 아이콘 또는 로그인 버튼 */}
        {isLoggedIn ? (
          <button
            onClick={handleProfileClick}
            className="ml-auto flex items-center focus:outline-none"
            aria-label="마이페이지"
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="프로필"
                className="w-8 h-8 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <svg
                className="w-8 h-8 text-primary-main"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        ) : (
          !isLoginPage && (
            <Link
              to="/login"
              className="ml-auto py-2 px-4 bg-primary-main text-white font-medium rounded-md hover:bg-primary-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-light no-underline"
              aria-label="로그인"
            >
              로그인
            </Link>
          )
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
