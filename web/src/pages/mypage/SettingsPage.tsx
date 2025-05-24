import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationSettings from "../../components/mypage/NotificationSettings";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/Button";
import IconWrapper from "../../components/IconWrapper";
import {
  FaBell,
  FaLock,
  FaUser,
  FaSignOutAlt,
  FaUserCog,
  FaCalendarAlt,
  FaEnvelope,
  FaIdCard,
} from "react-icons/fa";

// 설정 메뉴 탭 타입
type SettingsTab = "notifications" | "security" | "account";

// 로그아웃 버튼 컴포넌트
const LogoutButton = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <IconWrapper icon={FaSignOutAlt} className="text-red-500" size={20} />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">세션 종료</p>
        <p className="text-xs text-gray-500">현재 세션에서 로그아웃합니다</p>
      </div>
      <Button
        onClick={handleLogout}
        disabled={isLoading}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm"
      >
        {isLoading ? "로그아웃 중..." : "로그아웃"}
      </Button>
    </div>
  );
};

const SettingsPage = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7648]"></div>
        <p className="mt-4 text-gray-600">설정 정보를 불러오는 중...</p>
      </div>
    );
  }

  const tabsConfig = [
    { id: "account", name: "계정 정보", icon: FaUser },
    { id: "notifications", name: "알림 설정", icon: FaBell },
    { id: "security", name: "보안", icon: FaLock },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">계정 설정</h1>
        <p className="text-gray-600">
          계정 및 알림 설정을 관리하세요. 변경사항은 자동으로 저장됩니다.
        </p>
      </div>

      {/* 설정 탭 네비게이션 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <nav className="flex space-x-1 p-1">
          {tabsConfig.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`flex items-center px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "bg-[#FF7648] text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <IconWrapper icon={tab.icon} className="mr-2" size={16} />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* 설정 내용 */}
      <div>
        {activeTab === "account" && (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <IconWrapper icon={FaUserCog} className="mr-2 text-[#FF7648]" size={20} />
                계정 정보
              </h2>

              <div className="space-y-6">
                {/* 기본 정보 */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-md font-medium text-gray-800 mb-4 flex items-center">
                    <IconWrapper icon={FaIdCard} className="mr-2 text-gray-500" size={16} />
                    기본 정보
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <IconWrapper icon={FaUser} className="mr-2" size={14} />
                        이름
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {profile.full_name || "설정되지 않음"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <IconWrapper icon={FaUser} className="mr-2" size={14} />
                        표시 이름
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {profile.display_name || "설정되지 않음"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <IconWrapper icon={FaEnvelope} className="mr-2" size={14} />
                        이메일
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{user?.email}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <IconWrapper icon={FaCalendarAlt} className="mr-2" size={14} />
                        가입일
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {new Date(profile.created_at).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 멤버십 정보 */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-md font-medium text-gray-800 mb-4">멤버십 정보</h3>
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">현재 멤버십 등급</p>
                        <p className="text-lg font-bold text-[#FF7648]">
                          {profile.membership_level === "REGULAR" && "일반회원"}
                          {profile.membership_level === "SILVER" && "실버회원"}
                          {profile.membership_level === "GOLD" && "골드회원"}
                          {profile.membership_level === "VIP" && "VIP회원"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">역할</p>
                        <p className="text-sm font-medium text-gray-900">
                          {profile.role === "admin"
                            ? "관리자"
                            : profile.role === "instructor"
                            ? "강사"
                            : "학생"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 계정 관리 */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-md font-medium text-gray-800 mb-4">계정 관리</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium">프로필 수정</p>
                      <p className="text-xs text-blue-600 mt-1">
                        이름, 아바타 등 기본 정보는 프로필 관리 페이지에서 수정할 수 있습니다.
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-800 font-medium">이메일 변경</p>
                      <p className="text-xs text-yellow-600 mt-1">
                        이메일 변경 기능은 현재 구현 중입니다.
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-800 font-medium">계정 삭제</p>
                      <p className="text-xs text-red-600 mt-1">
                        계정 삭제 기능은 현재 구현 중입니다.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 로그아웃 */}
                <div>
                  <h3 className="text-md font-medium text-gray-800 mb-4">세션 관리</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <LogoutButton />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <IconWrapper icon={FaBell} className="mr-2 text-[#FF7648]" size={20} />
                알림 설정
              </h2>
              <NotificationSettings />
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <IconWrapper icon={FaLock} className="mr-2 text-[#FF7648]" size={20} />
                보안 설정
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">비밀번호 변경</p>
                  <p className="text-xs text-blue-600 mt-1">
                    비밀번호 변경 기능은 현재 구현 중입니다.
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">2단계 인증 (2FA)</p>
                  <p className="text-xs text-blue-600 mt-1">
                    2단계 인증 기능은 현재 구현 중입니다.
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">로그인 기록</p>
                  <p className="text-xs text-blue-600 mt-1">
                    로그인 기록 조회 기능은 현재 구현 중입니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
