import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  FiUser,
  FiSettings,
  FiClipboard,
  FiMessageSquare,
  FiBarChart2,
  FiChevronLeft,
} from "react-icons/fi";
import { IconType } from "react-icons";
import { useUserStore } from "../../stores/userStore";
import LoadingSpinner from "../common/LoadingSpinner";
import Icon from "../common/Icon";

interface NavItem {
  path: string;
  name: string;
  icon: IconType;
}

const MyPageLayout = () => {
  const location = useLocation();
  const { userProfile, loading } = useUserStore((state) => state);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // 스크롤 감지 효과
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 페이지 네비게이션 시 모바일 메뉴 닫기
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems: NavItem[] = [
    { path: "/mypage/profile", name: "프로필 관리", icon: FiUser },
    { path: "/mypage/reservations", name: "예약 내역", icon: FiClipboard },
    { path: "/mypage/sessions", name: "세션 정보", icon: FiBarChart2 },
    { path: "/mypage/inquiries", name: "문의 내역", icon: FiMessageSquare },
    { path: "/mypage/settings", name: "계정 설정", icon: FiSettings },
  ];

  // 현재 페이지 이름
  const getCurrentPageName = () => {
    const currentItem = navItems.find((item) => location.pathname.startsWith(item.path));
    return currentItem ? currentItem.name : "마이페이지";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">정보를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div
        className={`bg-white md:hidden p-4 flex justify-between items-center sticky top-0 z-30 shadow-sm transition-shadow ${
          isScrolled ? "shadow-md" : ""
        }`}
      >
        <div className="flex items-center">
          <Link to="/" className="mr-3">
            <Icon icon={FiChevronLeft} className="w-5 h-5 text-gray-700" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-800">{getCurrentPageName()}</h1>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-gray-600 focus:outline-none"
          aria-label={isMobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={isMobileMenuOpen}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-25 z-10"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`transform ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out w-72 bg-white shadow-lg md:shadow-none fixed md:relative h-full md:h-auto z-20 md:z-auto`}
      >
        <div className="p-6 h-full overflow-y-auto">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 hidden md:block mb-8">마이페이지</h2>
            {userProfile && (
              <div className="flex items-center space-x-4 mb-8 px-2">
                <img
                  src={userProfile.avatar_url || "https://via.placeholder.com/42?text=User"}
                  alt="프로필"
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <p className="font-medium text-gray-800">{userProfile.full_name}</p>
                  <p className="text-sm text-gray-500">
                    {userProfile.membership_level === "REGULAR" && "일반회원"}
                    {userProfile.membership_level === "SILVER" && "실버회원"}
                    {userProfile.membership_level === "GOLD" && "골드회원"}
                    {userProfile.membership_level === "VIP" && "VIP회원"}
                  </p>
                </div>
              </div>
            )}
          </div>

          <nav>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ease-in-out
                                      ${
                                        location.pathname === item.path
                                          ? "bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-md"
                                          : "text-gray-700 hover:bg-pink-50 hover:text-pink-600"
                                      }`}
                  >
                    <Icon icon={item.icon} className="w-5 h-5 mr-3" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto md:ml-0 pt-4">
        <Outlet /> {/* Nested routes will render here */}
      </main>
    </div>
  );
};

export default MyPageLayout;
