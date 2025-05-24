import React, { useState } from "react";
import UserProfileDisplay from "../../components/mypage/UserProfileDisplay";
import UserProfileEditForm from "../../components/mypage/UserProfileEditForm";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const ProfilePage = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const { user, profile, loading } = useAuth();

  // 로딩 중이면 로딩 UI 표시
  if (loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 text-lg">프로필 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  // 사용자 정보가 없으면 메시지 표시
  if (!user || !profile) {
    return (
      <div className="p-10 text-center">
        <p className="text-gray-600 text-lg mb-4">사용자 정보를 찾을 수 없습니다.</p>
        <p className="text-gray-500">
          로그인이 필요하거나 사용자 프로필이 생성되지 않았을 수 있습니다.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-[#FF7648] text-white rounded hover:bg-[#E5673F] transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-xl p-6 md:p-10">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            {isEditMode ? "프로필 수정" : "내 프로필"}
          </h1>
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className="px-4 py-2 text-sm font-medium rounded-lg shadow-sm transition-colors duration-150 ease-in-out 
                        bg-[#FF7648] text-white hover:bg-[#E5673F] focus:outline-none focus:ring-2 focus:ring-[#FF7648] focus:ring-offset-2 self-end sm:self-auto"
          >
            {isEditMode ? "취소" : "프로필 수정"}
          </button>
        </div>

        {isEditMode ? <UserProfileEditForm /> : <UserProfileDisplay />}
      </div>
    </div>
  );
};

export default ProfilePage;
