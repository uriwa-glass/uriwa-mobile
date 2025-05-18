import React from "react";
import MyInquiries from "../../components/mypage/MyInquiries";

const InquiriesPage = () => {
  return (
    <div className="container mx-auto px-0 sm:px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 hidden md:block">문의 내역</h1>
        <p className="text-gray-600 mb-6 hidden md:block">
          나의 모든 문의 내역과 답변을 확인하고 관리할 수 있습니다.
        </p>
      </div>

      <MyInquiries />
    </div>
  );
};

export default InquiriesPage;
