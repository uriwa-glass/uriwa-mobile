import React from "react";
import MySessions from "../../components/mypage/MySessions";

const SessionsPage = () => {
  return (
    <div className="container mx-auto px-0 sm:px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 hidden md:block">나의 세션 정보</h1>
        <p className="text-gray-600 mb-6 hidden md:block">
          보유 중인 수업권 및 세션 이용 내역을 확인할 수 있습니다.
        </p>
      </div>

      <MySessions />
    </div>
  );
};

export default SessionsPage;
