import React, { useState } from "react";
import UserProfileDisplay from "../../components/mypage/UserProfileDisplay";
import UserProfileEditForm from "../../components/mypage/UserProfileEditForm";
import { useUserStore } from "../../stores/userStore";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const ProfilePage = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const { currentUser, userProfile, loading, error } = useUserStore((state) => state);

  // 로딩 중이면 로딩 UI 표시
  if (loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 text-lg">프로필 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  // 오류가 있으면 오류 메시지 표시
  if (error) {
    return (
      <div className="p-10 text-center">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">오류 발생!</strong>
          <span className="block sm:inline"> 프로필 정보를 불러오는 중 문제가 발생했습니다.</span>
          <p className="text-sm mt-2">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  // 사용자 정보가 없으면 메시지 표시
  if (!currentUser || !userProfile) {
    return (
      <div className="p-10 text-center">
        <p className="text-gray-600 text-lg mb-4">사용자 정보를 찾을 수 없습니다.</p>
        <p className="text-gray-500">
          로그인이 필요하거나 사용자 프로필이 생성되지 않았을 수 있습니다.
        </p>
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
                        bg-pink-500 text-white hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 self-end sm:self-auto"
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
