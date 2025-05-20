/**
 * NavigationBar 컴포넌트
 *
 * 이 파일은 URIWA 모바일 웹의 네비게이션 바를 구현합니다.
 * 반응형 디자인으로 모바일에서는 하단에, 데스크톱에서는 좌측에 표시됩니다.
 * 로그인 상태에 따라 적절한 링크와 기능을 제공합니다.
 */

import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
// import { IconButton } from "@material-tailwind/react";
import SimpleIconButton from "./SimpleIconButton";
import IconWrapper from "./IconWrapper";
import { useResponsive } from "../hooks/useResponsive";
import { useAuth } from "../contexts/AuthContext";
import {
  FaHome,
  FaBook,
  FaCalendarAlt,
  FaQuestionCircle,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserCircle,
} from "react-icons/fa";

// 네비게이션 아이템 타입 정의
interface NavigationItem {
  label: string;
  path: string;
  icon: JSX.Element;
  authRequired?: boolean; // 인증이 필요한지 여부
  adminOnly?: boolean; // 관리자만 접근 가능한지 여부
}

const NavigationBar: React.FC = () => {
  const { isMobile, isDesktop } = useResponsive();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  // 사용자 로그인 여부 확인
  const isAuthenticated = !!user && !!profile;
  // 관리자 권한 확인
  const isAdmin = profile?.role === "admin";

  // 네비게이션 아이템 목록
  const navigationItems: NavigationItem[] = [
    {
      label: "홈",
      path: "/",
      icon: <IconWrapper icon={FaHome} />,
    },
    {
      label: "수업",
      path: "/classes",
      icon: <IconWrapper icon={FaBook} />,
    },
    {
      label: "예약",
      path: "/reservations",
      icon: <IconWrapper icon={FaCalendarAlt} />,
      authRequired: true,
    },
    {
      label: "문의",
      path: "/inquiry",
      icon: <IconWrapper icon={FaQuestionCircle} />,
    },
    {
      label: "마이페이지",
      path: "/mypage",
      icon: <IconWrapper icon={FaUser} />,
      authRequired: true,
    },
    {
      label: "관리자",
      path: "/admin",
      icon: <IconWrapper icon={FaCog} />,
      authRequired: true,
      adminOnly: true,
    },
  ];

  // 필터링된 네비게이션 아이템 목록 (인증 상태에 따라)
  const filteredItems = navigationItems.filter((item) => {
    // 관리자 전용 아이템은 관리자만 볼 수 있음
    if (item.adminOnly && !isAdmin) return false;

    // 인증이 필요한 아이템은 로그인 시에만 표시
    if (item.authRequired && !isAuthenticated) return false;

    return true;
  });

  // 로그아웃 처리 함수
  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
    }
  };

  // 프로필 아이콘 클릭 핸들러
  const handleProfileClick = () => {
    navigate("/mypage");
  };

  // 모바일용 하단 네비게이션 바
  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center py-2">
          {filteredItems.map((item, index) => {
            if (item.path === "/mypage" && isAuthenticated && profile?.avatar_url) {
              return (
                <Link
                  key={index}
                  to={item.path}
                  className={`flex flex-col items-center p-2 ${
                    location.pathname.startsWith(item.path) ? "text-[#FF7648]" : "text-gray-500"
                  }`}
                >
                  <img src={profile.avatar_url} alt="profile" className="w-6 h-6 rounded-full" />
                  <span className="text-xs mt-1">{item.label}</span>
                </Link>
              );
            }
            return (
              <Link
                key={index}
                to={item.path}
                className={`flex flex-col items-center p-2 ${
                  location.pathname.startsWith(item.path) ? "text-[#FF7648]" : "text-gray-500"
                }`}
              >
                <div className="text-xl">{item.icon}</div>
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}

          {isAuthenticated ? (
            <button onClick={handleLogout} className="flex flex-col items-center p-2 text-gray-500">
              <div className="text-xl">
                <IconWrapper icon={FaSignOutAlt} />
              </div>
              <span className="text-xs mt-1">로그아웃</span>
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  // 데스크톱용 사이드 네비게이션 바
  return (
    <div className="fixed left-0 top-0 bottom-0 w-16 bg-white border-r border-gray-200 z-50 flex flex-col items-center pt-4">
      <div className="mb-4">
        <Link to="/">
          <SimpleIconButton className="bg-[#FF7648] hover:bg-[#E85A2A]">
            <IconWrapper icon={FaHome} className="text-white" size={18} />
          </SimpleIconButton>
        </Link>
      </div>

      <div className="flex flex-col space-y-6 mt-6 flex-grow">
        {filteredItems
          .filter((item) => item.path !== "/mypage")
          .map((item, index) => (
            <Link
              key={index}
              to={item.path}
              title={item.label}
              className={`flex flex-col items-center ${
                location.pathname.startsWith(item.path)
                  ? "text-[#FF7648]"
                  : "text-gray-500 hover:text-[#FF7648]"
              }`}
            >
              <div className="text-xl">{item.icon}</div>
            </Link>
          ))}
      </div>

      <div className="mb-6 flex flex-col items-center space-y-4">
        {isAuthenticated && profile ? (
          <button
            onClick={handleProfileClick}
            className="flex flex-col items-center text-gray-500 hover:text-[#FF7648]"
            title="마이페이지"
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="profile" className="w-8 h-8 rounded-full" />
            ) : (
              <IconWrapper icon={FaUserCircle} size={24} />
            )}
          </button>
        ) : null}

        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="flex flex-col items-center text-gray-500 hover:text-[#FF7648]"
            title="로그아웃"
          >
            <IconWrapper icon={FaSignOutAlt} size={22} />
          </button>
        ) : (
          <Link
            to="/login"
            title="로그인"
            className={`flex flex-col items-center ${
              location.pathname === "/login"
                ? "text-[#FF7648]"
                : "text-gray-500 hover:text-[#FF7648]"
            }`}
          >
            <IconWrapper icon={FaSignInAlt} size={22} />
          </Link>
        )}
      </div>
    </div>
  );
};

export default NavigationBar;
