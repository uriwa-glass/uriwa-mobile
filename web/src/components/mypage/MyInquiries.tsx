// @ts-ignore
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { getUserInquiries } from "../../api/inquiryService";
import { useUserStore } from "../../stores/userStore";
import { UserInquiry, InquiryStatus, InquiryCategory } from "../../types";
import LoadingSpinner from "../common/LoadingSpinner";

interface MyInquiriesProps {
  limit?: number;
}

const MyInquiries = ({ limit = 10 }: MyInquiriesProps) => {
  const navigate = useNavigate();
  const { currentUser, loading: userLoading } = useUserStore();

  // 상태 관리
  const [inquiries, setInquiries] = useState<UserInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<InquiryCategory | null>(null);
  const pageSize = limit;

  // 문의 내역 가져오기
  useEffect(() => {
    const fetchInquiries = async () => {
      if (!currentUser?.id) return;

      try {
        setLoading(true);

        const filter = {
          status: statusFilter || undefined,
          category: categoryFilter || undefined,
        };

        const result = await getUserInquiries(currentUser.id, filter, currentPage, pageSize);

        if (result.success && result.inquiries) {
          setInquiries(result.inquiries);
          setTotalItems(result.count || 0);
        } else {
          setError(result.message || "문의 내역을 불러오는 중 오류가 발생했습니다.");
        }
      } catch (err) {
        console.error("문의 내역을 불러오는 중 오류가 발생했습니다:", err);
        setError("문의 내역을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, [currentUser?.id, currentPage, statusFilter, categoryFilter, pageSize]);

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "yyyy년 M월 d일", { locale: ko });
  };

  // 상태에 따른 배지 스타일
  const getStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case "pending":
        return (
          <span className="bg-warning-main bg-opacity-10 text-warning-main px-2 py-1 rounded-sm text-xs">
            답변 대기중
          </span>
        );
      case "in-review":
        return (
          <span className="bg-info-main bg-opacity-10 text-info-main px-2 py-1 rounded-sm text-xs">
            검토중
          </span>
        );
      case "answered":
        return (
          <span className="bg-success-main bg-opacity-10 text-success-main px-2 py-1 rounded-sm text-xs">
            답변 완료
          </span>
        );
      case "closed":
        return (
          <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-sm text-xs">종료됨</span>
        );
      default:
        return null;
    }
  };

  // 카테고리 표시 함수
  const getCategoryLabel = (category: InquiryCategory) => {
    const categoryMap: Record<InquiryCategory, string> = {
      general: "일반",
      reservation: "예약",
      payment: "결제",
      class: "수업",
      technical: "기술 문제",
      other: "기타",
    };

    return categoryMap[category] || category;
  };

  // 문의 상세 페이지로 이동
  const handleViewInquiry = (inquiryId: string) => {
    navigate(`/inquiry-detail/${inquiryId}`);
  };

  // 새 문의 작성 페이지로 이동
  const handleCreateInquiry = () => {
    navigate("/inquiry");
  };

  // 총 페이지 수 계산
  const totalPages = Math.ceil(totalItems / pageSize);

  if (loading || userLoading) {
    return (
      <div className="text-center p-10">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-text-secondary">문의 내역을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-main bg-opacity-10 text-error-main p-4 rounded-md">{error}</div>
    );
  }

  return (
    <div className="bg-background-paper rounded-md shadow-soft overflow-hidden">
      <div className="p-4 border-b border-border-light">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-text-primary">문의 내역</h2>

          <div className="flex items-center gap-2">
            {/* 필터링 */}
            <select
              value={statusFilter || ""}
              onChange={(e) => setStatusFilter((e.target.value as InquiryStatus) || null)}
              className="px-3 py-2 border border-border-main rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-main"
            >
              <option value="">모든 상태</option>
              <option value="pending">답변 대기중</option>
              <option value="in-review">검토중</option>
              <option value="answered">답변 완료</option>
              <option value="closed">종료됨</option>
            </select>

            <select
              value={categoryFilter || ""}
              onChange={(e) => setCategoryFilter((e.target.value as InquiryCategory) || null)}
              className="px-3 py-2 border border-border-main rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-main"
            >
              <option value="">모든 카테고리</option>
              <option value="general">일반</option>
              <option value="reservation">예약</option>
              <option value="payment">결제</option>
              <option value="class">수업</option>
              <option value="technical">기술 문제</option>
              <option value="other">기타</option>
            </select>

            <button
              onClick={handleCreateInquiry}
              className="px-4 py-2 bg-primary-main text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              새 문의
            </button>
          </div>
        </div>
      </div>

      {/* 문의 목록 */}
      {inquiries.length === 0 ? (
        <div className="text-center p-8">
          <p className="text-text-secondary mb-4">문의 내역이 없습니다.</p>
          <button
            onClick={handleCreateInquiry}
            className="text-primary-main hover:text-primary-dark transition-colors"
          >
            문의하기
          </button>
        </div>
      ) : (
        <div className="divide-y divide-border-light">
          {inquiries.map((inquiry: UserInquiry) => (
            <div
              key={inquiry.id}
              className={`p-4 hover:bg-gray-50 cursor-pointer relative ${
                !inquiry.is_read ? "bg-primary-main bg-opacity-5" : ""
              }`}
              onClick={() => handleViewInquiry(inquiry.id)}
            >
              {/* 읽지 않은 문의 표시 */}
              {!inquiry.is_read && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-main"></div>
              )}

              <div className="flex flex-col sm:flex-row justify-between mb-2">
                <h3 className="text-md font-medium text-text-primary flex items-center">
                  <span className="mr-2">{inquiry.title}</span>
                  {!inquiry.is_read && (
                    <span className="bg-primary-main w-2 h-2 rounded-full"></span>
                  )}
                </h3>
                <div className="mt-1 sm:mt-0 flex items-center space-x-2">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-sm text-xs">
                    {getCategoryLabel(inquiry.category)}
                  </span>
                  {getStatusBadge(inquiry.status)}
                </div>
              </div>

              <p className="text-sm text-text-secondary line-clamp-2 mb-3">{inquiry.description}</p>

              <div className="flex justify-between text-xs text-text-secondary">
                <span>작성일: {formatDate(inquiry.created_at)}</span>
                <span>
                  마지막 업데이트: {formatDate(inquiry.last_updated_at || inquiry.updated_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

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

            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              // 현재 페이지를 중심으로 표시할 페이지 범위 계산
              let pageNum = currentPage;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-md ${
                    currentPage === pageNum
                      ? "bg-primary-main text-white"
                      : "text-text-primary hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

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

export default MyInquiries;
