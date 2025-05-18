import React from "react";
import ReservationHistory from "../../components/mypage/ReservationHistory";

const ReservationsPage = () => {
  return (
    <div className="container mx-auto px-0 sm:px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 hidden md:block">예약 내역</h1>
        <p className="text-gray-600 mb-6 hidden md:block">
          나의 모든 예약 정보와 상태를 확인하고 관리할 수 있습니다.
        </p>
      </div>

      <ReservationHistory />
    </div>
  );
};

export default ReservationsPage;
