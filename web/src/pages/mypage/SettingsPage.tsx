import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationSettings from "../../components/mypage/NotificationSettings";
import { useUserStore } from "../../stores/userStore";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/Button";

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
    <Button
      onClick={handleLogout}
      disabled={isLoading}
      className="bg-red-600 hover:bg-red-700 text-white"
    >
      {isLoading ? "로그아웃 중..." : "로그아웃"}
    </Button>
  );
};

const SettingsPage = () => {
  const { userProfile } = useUserStore((state) => state);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("notifications");

  if (!userProfile) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600 text-lg">설정 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">계정 설정</h1>
        <p className="text-gray-600">
          계정 및 알림 설정을 관리하세요. 변경사항은 자동으로 저장됩니다.
        </p>
      </div>

      {/* 설정 탭 네비게이션 */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {[
            { id: "notifications", name: "알림 설정" },
            { id: "security", name: "보안" },
            { id: "account", name: "계정 정보" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-pink-500 text-pink-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* 설정 내용 */}
      <div>
        {activeTab === "notifications" && <NotificationSettings />}

        {activeTab === "security" && (
          <div className="bg-white shadow-xl rounded-lg p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">보안 설정</h2>
            <p className="text-gray-600">
              보안 설정은 현재 구현 중입니다. 곧 사용 가능해질 예정입니다.
            </p>
            {/* 비밀번호 변경, 2FA 등의 보안 기능이 추가될 예정 */}
          </div>
        )}

        {activeTab === "account" && (
          <div className="bg-white shadow-xl rounded-lg p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">계정 정보</h2>

            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">기본 정보</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">이메일</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">가입일</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(userProfile.created_at).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">계정 관리</h3>
                <p className="text-sm text-gray-600 mb-4">
                  계정 삭제나 이메일 변경 등의 기능은 현재 구현 중입니다.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">로그아웃</h3>
                <p className="text-sm text-gray-600 mb-4">
                  현재 세션에서 로그아웃합니다. 다시 로그인하려면 이메일과 비밀번호가 필요합니다.
                </p>
                <LogoutButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
