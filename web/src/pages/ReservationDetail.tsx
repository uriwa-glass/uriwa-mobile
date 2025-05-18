// @ts-ignore
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { getUserReservations } from "../api/reservationService";
import type { ReservationWithSchedule } from "../api/reservationService";
import LoadingSpinner from "../components/common/LoadingSpinner";

const ReservationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<ReservationWithSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 예약 상세 정보 가져오기
  useEffect(() => {
    if (!id) {
      setError("예약 ID가 유효하지 않습니다.");
      setLoading(false);
      return;
    }

    const fetchReservationDetails = async () => {
      try {
        setLoading(true);
        // 한 사용자의 모든 예약을 가져온 다음 원하는 ID에 해당하는 예약만 필터링
        const reservations = await getUserReservations("current", null);
        const targetReservation = reservations.find((res) => res.id === id);

        if (!targetReservation) {
          throw new Error("예약 정보를 찾을 수 없습니다.");
        }

        setReservation(targetReservation);
      } catch (err) {
        console.error("예약 상세 정보를 불러오는 중 오류가 발생했습니다:", err);
        setError("예약 상세 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservationDetails();
  }, [id]);

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "yyyy년 M월 d일 (E) HH:mm", { locale: ko });
  };

  // 가격 포맷 함수
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
  };

  // 예약 취소 페이지로 이동
  const handleCancelReservation = () => {
    if (reservation) {
      navigate(`/reservation-cancel/${reservation.id}`);
    }
  };

  // 예약 목록으로 돌아가기
  const handleBackToList = () => {
    navigate("/mypage/reservations");
  };

  // 상태에 따른 배지 스타일
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="bg-success-main bg-opacity-10 text-success-main px-2 py-1 rounded-sm">
            예약 확정
          </span>
        );
      case "cancelled":
        return (
          <span className="bg-error-main bg-opacity-10 text-error-main px-2 py-1 rounded-sm">
            취소됨
          </span>
        );
      case "attended":
        return (
          <span className="bg-primary-main bg-opacity-10 text-primary-main px-2 py-1 rounded-sm">
            수업 완료
          </span>
        );
      case "no-show":
        return (
          <span className="bg-warning-main bg-opacity-10 text-warning-main px-2 py-1 rounded-sm">
            노쇼
          </span>
        );
      default:
        return <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-sm">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-text-secondary">예약 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="bg-error-main bg-opacity-10 text-error-main p-6 rounded-md max-w-md w-full text-center mb-4">
          <p className="font-medium mb-2">오류가 발생했습니다</p>
          <p className="text-sm">{error || "예약 정보를 찾을 수 없습니다."}</p>
        </div>
        <button
          onClick={handleBackToList}
          className="px-4 py-2 bg-primary-main text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          예약 목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center">
          <button
            onClick={handleBackToList}
            className="flex items-center text-text-secondary hover:text-text-primary transition-colors mr-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            예약 목록으로
          </button>
          <h1 className="text-2xl font-semibold text-text-primary flex-1 text-center">예약 상세</h1>
          <div className="w-24"></div> {/* 좌우 균형을 위한 빈 공간 */}
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* 헤더 */}
          <div className="bg-background-light p-6 border-b border-border-light">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-semibold text-text-primary mb-1">
                  {reservation.class_schedules.classes.title}
                </h2>
                <p className="text-text-secondary">
                  <span>{formatDate(reservation.class_schedules.date)}</span>
                </p>
              </div>
              <div>{getStatusBadge(reservation.status)}</div>
            </div>
          </div>

          {/* 상세 정보 */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-1">강사</h3>
                <p className="text-text-primary">
                  {reservation.class_schedules.classes.instructor_name}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-1">장소</h3>
                <p className="text-text-primary">{reservation.class_schedules.classes.location}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-1">예약 인원</h3>
                <p className="text-text-primary">{reservation.student_count}명</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-1">예약자명</h3>
                <p className="text-text-primary">{reservation.user_name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-1">연락처</h3>
                <p className="text-text-primary">{reservation.contact_phone}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-1">예약일시</h3>
                <p className="text-text-primary">{formatDate(reservation.created_at)}</p>
              </div>
            </div>

            {/* 금액 정보 */}
            <div className="bg-background-paper p-4 rounded-lg mb-8">
              <h3 className="text-md font-semibold text-text-primary mb-4">결제 정보</h3>
              <div className="flex justify-between py-2">
                <span className="text-text-secondary">수업 가격</span>
                <span className="text-text-primary">
                  {formatPrice(reservation.class_schedules.classes.price)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-text-secondary">인원</span>
                <span className="text-text-primary">{reservation.student_count}명</span>
              </div>
              {reservation.discount_amount > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-text-secondary">할인금액</span>
                  <span className="text-error-main">
                    -{formatPrice(reservation.discount_amount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-2 border-t border-border-light mt-2 pt-3">
                <span className="font-medium">최종 결제금액</span>
                <span className="font-semibold text-lg">
                  {formatPrice(reservation.total_price)}
                </span>
              </div>
            </div>

            {/* 취소 조건 안내 (확정 상태일 경우에만 표시) */}
            {reservation.status === "confirmed" && (
              <div className="bg-background-light p-4 rounded-lg mb-8">
                <h3 className="text-md font-semibold text-text-primary mb-2">취소 정책</h3>
                <p className="text-sm text-text-secondary mb-1">
                  • 수업 시작 24시간 이전: 전액 환불
                </p>
                <p className="text-sm text-text-secondary mb-1">
                  • 수업 시작 12시간 이전: 결제금액의 70% 환불
                </p>
                <p className="text-sm text-text-secondary">• 수업 시작 12시간 이내: 환불 불가</p>
              </div>
            )}

            {/* 예약 취소 버튼 (확정 상태일 경우에만 표시) */}
            {reservation.status === "confirmed" && (
              <div className="flex justify-center">
                <button
                  onClick={handleCancelReservation}
                  className="px-6 py-3 bg-error-main text-white rounded-lg hover:bg-error-dark transition-colors"
                >
                  예약 취소하기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetail;
