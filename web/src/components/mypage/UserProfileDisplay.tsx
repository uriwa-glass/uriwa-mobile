import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";

const UserProfileDisplay = () => {
  const { user, profile, loading } = useAuth();

  // 멤버십 레벨에 따른 배지 색상
  const membershipBadgeColor = () => {
    switch (profile?.membership_level) {
      case "VIP":
        return "bg-gradient-to-r from-purple-500 to-indigo-600";
      case "GOLD":
        return "bg-gradient-to-r from-yellow-500 to-amber-600";
      case "SILVER":
        return "bg-gradient-to-r from-gray-400 to-gray-500";
      default:
        return "bg-gradient-to-r from-green-500 to-emerald-600";
    }
  };

  // 멤버십 레벨 한글화
  const membershipName = () => {
    switch (profile?.membership_level) {
      case "VIP":
        return "VIP 회원";
      case "GOLD":
        return "골드 회원";
      case "SILVER":
        return "실버 회원";
      default:
        return "일반 회원";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center p-6">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">프로필 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (!profile || !user) {
    return (
      <div className="bg-white shadow-xl rounded-lg p-6 md:p-8 text-center">
        <p className="text-gray-600">사용자 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden">
      {/* 헤더 섹션 - 아바타와 기본 정보 */}
      <div className="bg-gradient-to-r from-pink-400 to-rose-500 p-6 pb-12 md:p-8 md:pb-16 relative">
        <div className="flex flex-col md:flex-row md:items-center">
          <img
            src={profile.avatar_url || "https://via.placeholder.com/150?text=User"}
            alt={profile.full_name || "프로필 이미지"}
            className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-lg"
          />

          <div className="mt-4 md:mt-0 md:ml-6 text-white">
            <h2 className="text-2xl md:text-3xl font-bold">{profile.full_name}</h2>
            <p className="text-pink-100 mt-1">{user.email}</p>
            <div className="mt-2">
              <span
                className={`${membershipBadgeColor()} text-white text-sm rounded-full px-3 py-1 inline-block`}
              >
                {membershipName()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 정보 카드 섹션 */}
      <div className="p-6 md:p-8 -mt-8 md:-mt-12 grid grid-cols-1 gap-6">
        {/* 개인 정보 카드 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">개인 정보</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">이름</p>
              <p className="text-gray-800">{profile.full_name || "-"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">이메일</p>
              <p className="text-gray-800">{user.email || "-"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">전화번호</p>
              <p className="text-gray-800">{profile.phone || "-"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">주소</p>
              <p className="text-gray-800">{profile.address || "-"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">회원 등급</p>
              <span
                className={`${membershipBadgeColor()} text-white text-sm rounded-full px-3 py-1 inline-block`}
              >
                {membershipName()}
              </span>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">가입일</p>
              <p className="text-gray-800">
                {new Date(profile.created_at).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileDisplay;
