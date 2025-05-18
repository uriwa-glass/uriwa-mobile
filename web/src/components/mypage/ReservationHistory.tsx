// @ts-ignore
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { getUserReservations } from "../../api/reservationService";
import { useUserStore } from "../../stores/userStore";
import type { ReservationWithSchedule } from "../../api/reservationService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

interface ReservationHistoryProps {
  limit?: number;
}

const ReservationHistory = ({ limit = 5 }: ReservationHistoryProps) => {
  const navigate = useNavigate();
  const { currentUser, userProfile, loading: userLoading } = useUserStore();

  // 상태 관리
  const [reservations, setReservations] = useState<ReservationWithSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const pageSize = limit;

  // 예약 내역 가져오기
  useEffect(() => {
    const fetchReservations = async () => {
      if (!currentUser?.id) return;

      try {
        setLoading(true);
        const reservationData = await getUserReservations(currentUser.id, statusFilter as any);
        setReservations(reservationData);
      } catch (err) {
        console.error("예약 내역을 불러오는 중 오류가 발생했습니다:", err);
        setError("예약 내역을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [currentUser?.id, statusFilter]);

  // 정렬된 예약 목록
  const sortedReservations = useMemo(() => {
    if (!reservations.length) return [];

    return [...reservations].sort((a, b) => {
      const dateA = new Date(a.class_schedules.date).getTime();
      const dateB = new Date(b.class_schedules.date).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [reservations, sortOrder]);

  // 페이지네이션 처리
  const paginatedReservations = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedReservations.slice(startIndex, startIndex + pageSize);
  }, [sortedReservations, currentPage, pageSize]);

  // 총 페이지 수
  const totalPages = Math.ceil(sortedReservations.length / pageSize);

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "yyyy년 M월 d일 (E) HH:mm", { locale: ko });
  };

  // 가격 포맷 함수
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
  };

  // 상태에 따른 배지 스타일
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="bg-success-main bg-opacity-10 text-success-main px-2 py-1 rounded-sm text-xs">
            예약 확정
          </span>
        );
      case "cancelled":
        return (
          <span className="bg-error-main bg-opacity-10 text-error-main px-2 py-1 rounded-sm text-xs">
            취소됨
          </span>
        );
      case "attended":
        return (
          <span className="bg-primary-main bg-opacity-10 text-primary-main px-2 py-1 rounded-sm text-xs">
            수업 완료
          </span>
        );
      case "no-show":
        return (
          <span className="bg-warning-main bg-opacity-10 text-warning-main px-2 py-1 rounded-sm text-xs">
            노쇼
          </span>
        );
      default:
        return (
          <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-sm text-xs">{status}</span>
        );
    }
  };

  // 예약 취소 페이지로 이동
  const handleCancelReservation = (reservationId: string) => {
    navigate(`/reservation-cancel/${reservationId}`);
  };

  // 예약 상세 모달 열기
  const handleViewDetails = (reservation: ReservationWithSchedule) => {
    // 여기서는 간단히 새 페이지로 이동하지만, 모달로 구현할 수도 있음
    navigate(`/reservation-detail/${reservation.id}`);
  };

  if (loading || userLoading) {
    return (
      <div className="text-center p-10">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-text-secondary">예약 내역을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-main bg-opacity-10 text-error-main p-4 rounded-md">{error}</div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center p-8 bg-background-paper rounded-md shadow-soft">
        <p className="text-text-secondary mb-4">예약 내역이 없습니다.</p>
        <button
          onClick={() => navigate("/classes")}
          className="text-primary-main hover:text-primary-dark transition-colors"
        >
          수업 보러가기
        </button>
      </div>
    );
  }

  return (
    <div className="bg-background-paper rounded-md shadow-soft overflow-hidden">
      <div className="p-4 border-b border-border-light">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-text-primary">예약 내역</h2>

          <div className="flex items-center gap-2">
            {/* 필터링 */}
            <select
              value={statusFilter || ""}
              onChange={(e) => setStatusFilter(e.target.value || null)}
              className="px-3 py-2 border border-border-main rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-main"
            >
              <option value="">모든 상태</option>
              <option value="confirmed">예약 확정</option>
              <option value="cancelled">취소됨</option>
              <option value="attended">수업 완료</option>
              <option value="no-show">노쇼</option>
            </select>

            {/* 정렬 */}
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-2 text-text-secondary hover:text-primary-main transition-colors"
            >
              {sortOrder === "asc" ? (
                <span className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  오래된순
                </span>
              ) : (
                <span className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  최신순
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 예약 목록 */}
      <div className="divide-y divide-border-light">
        {paginatedReservations.map((reservation: ReservationWithSchedule) => (
          <div key={reservation.id} className="p-4 hover:bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between mb-2">
              <h3 className="text-md font-medium text-text-primary">
                {reservation.class_schedules.classes.title}
              </h3>
              <div className="mt-1 sm:mt-0">{getStatusBadge(reservation.status)}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mb-3 text-sm">
              <div className="flex justify-between md:block">
                <span className="text-text-secondary">일정</span>
                <span className="text-text-primary md:block md:mt-1">
                  {formatDate(reservation.class_schedules.date)}
                </span>
              </div>

              <div className="flex justify-between md:block">
                <span className="text-text-secondary">인원</span>
                <span className="text-text-primary md:block md:mt-1">
                  {reservation.student_count}명
                </span>
              </div>

              <div className="flex justify-between md:block">
                <span className="text-text-secondary">금액</span>
                <span className="text-text-primary md:block md:mt-1">
                  {formatPrice(reservation.total_price)}
                </span>
              </div>

              <div className="flex justify-between md:block">
                <span className="text-text-secondary">예약일</span>
                <span className="text-text-primary md:block md:mt-1">
                  {formatDate(reservation.created_at)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={() => handleViewDetails(reservation)}
                className="px-3 py-1.5 text-sm border border-primary-main text-primary-main rounded-md hover:bg-primary-main hover:text-white transition-colors"
              >
                상세보기
              </button>

              {reservation.status === "confirmed" && (
                <button
                  onClick={() => handleCancelReservation(reservation.id)}
                  className="px-3 py-1.5 text-sm border border-error-main text-error-main rounded-md hover:bg-error-main hover:text-white transition-colors"
                >
                  예약취소
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center p-4 border-t border-border-light">
          <nav className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-md ${
                currentPage === 1
                  ? "text-text-disabled cursor-not-allowed"
                  : "text-text-primary hover:bg-gray-100"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-md ${
                  currentPage === page
                    ? "bg-primary-main text-white"
                    : "text-text-primary hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-md ${
                currentPage === totalPages
                  ? "text-text-disabled cursor-not-allowed"
                  : "text-text-primary hover:bg-gray-100"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ReservationHistory;
