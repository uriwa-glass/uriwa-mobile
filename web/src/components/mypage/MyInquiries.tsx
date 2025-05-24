import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../api/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";

interface FormSubmission {
  id: string;
  template_id: string;
  user_id: string;
  data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    category: string;
    message: string;
    contact_preference: string;
    reference_images?: string[];
    admin_response?: string;
  };
  status: "submitted" | "in_progress" | "completed";
  created_at: string;
  updated_at: string;
}

interface MyInquiriesProps {
  limit?: number;
}

const MyInquiries = ({ limit = 10 }: MyInquiriesProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 상태 관리
  const [inquiries, setInquiries] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const pageSize = limit;

  // 모달 상태 추가
  const [selectedInquiry, setSelectedInquiry] = useState<FormSubmission | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);

  // 문의 내역 가져오기
  useEffect(() => {
    const fetchInquiries = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);

        console.log("🔍 사용자 문의 내역 조회 시작 - 사용자 ID:", user.id);

        // form_submissions에서 사용자의 문의 내역 조회
        let query = supabase
          .from("form_submissions")
          .select("*", { count: "exact" })
          .eq("template_id", "unified-inquiry")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        // 상태 필터링
        if (statusFilter !== "all") {
          query = query.eq("status", statusFilter);
        }

        // 카테고리 필터링 (JSONB 필드 조회)
        if (categoryFilter !== "all") {
          query = query.eq("data->>category", categoryFilter);
        }

        // 페이지네이션
        const startIndex = (currentPage - 1) * pageSize;
        query = query.range(startIndex, startIndex + pageSize - 1);

        const { data, error, count } = await query;

        console.log("🔍 문의 내역 조회 결과:", { data, error, count });

        if (error) throw error;

        setInquiries(data || []);
        setTotalItems(count || 0);
      } catch (err) {
        console.error("문의 내역을 불러오는 중 오류가 발생했습니다:", err);
        setError("문의 내역을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, [user?.id, currentPage, statusFilter, categoryFilter, pageSize]);

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "yyyy년 M월 d일", { locale: ko });
  };

  // 상태에 따른 배지 스타일
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-sm text-xs">접수됨</span>
        );
      case "in_progress":
        return (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-sm text-xs">처리중</span>
        );
      case "completed":
        return (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-sm text-xs">완료</span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-sm text-xs">{status}</span>
        );
    }
  };

  // 카테고리 표시 함수
  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      general: "일반",
      reservation: "예약",
      payment: "결제",
      class: "수업",
      technical: "기술 문제",
      other: "기타",
    };

    return categoryMap[category] || category;
  };

  // 문의 상세 모달 열기
  const handleViewInquiry = (inquiry: FormSubmission) => {
    setSelectedInquiry(inquiry);
    setShowDetailModal(true);
  };

  // 이미지 모달 열기
  const handleImageClick = (imageIndex: number) => {
    setSelectedImageIndex(imageIndex);
    setShowImageModal(true);
  };

  // 모달 닫기
  const closeModals = () => {
    setShowDetailModal(false);
    setShowImageModal(false);
    setSelectedInquiry(null);
    setSelectedImageIndex(0);
  };

  // 새 문의 작성 페이지로 이동
  const handleCreateInquiry = () => {
    navigate("/inquiry");
  };

  // 총 페이지 수 계산
  const totalPages = Math.ceil(totalItems / pageSize);

  if (loading) {
    return (
      <div className="text-center p-10">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-gray-600">문의 내역을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-50 text-red-800 p-4 rounded-md">{error}</div>;
  }

  return (
    <>
      <div className="bg-white rounded-md shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-800">문의 내역</h2>

            <div className="flex items-center gap-2">
              {/* 상태 필터링 */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7648]"
              >
                <option value="all">모든 상태</option>
                <option value="submitted">접수됨</option>
                <option value="in_progress">처리중</option>
                <option value="completed">완료</option>
              </select>

              {/* 카테고리 필터링 */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7648]"
              >
                <option value="all">모든 카테고리</option>
                <option value="general">일반</option>
                <option value="reservation">예약</option>
                <option value="payment">결제</option>
                <option value="class">수업</option>
                <option value="technical">기술 문제</option>
                <option value="other">기타</option>
              </select>

              <button
                onClick={handleCreateInquiry}
                className="px-4 py-2 bg-[#FF7648] text-white rounded-md hover:bg-[#E6653F] transition-colors"
              >
                새 문의
              </button>
            </div>
          </div>
        </div>

        {/* 문의 목록 */}
        {inquiries.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-gray-600 mb-4">문의 내역이 없습니다.</p>
            <button
              onClick={handleCreateInquiry}
              className="text-[#FF7648] hover:text-[#E6653F] transition-colors"
            >
              문의하기
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {inquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleViewInquiry(inquiry)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 mb-1">{inquiry.data.subject}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {getCategoryLabel(inquiry.data.category)}
                      </span>
                      {getStatusBadge(inquiry.status)}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{inquiry.data.message}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs text-gray-500">{formatDate(inquiry.created_at)}</p>
                  </div>
                </div>

                {/* 관리자 답변이 있는 경우 */}
                {inquiry.data.admin_response && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium mb-1">관리자 답변</p>
                    <p className="text-sm text-blue-800 line-clamp-2">
                      {inquiry.data.admin_response}
                    </p>
                  </div>
                )}

                {/* 첨부 이미지가 있는 경우 */}
                {inquiry.data.reference_images && inquiry.data.reference_images.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">
                      첨부 이미지 {inquiry.data.reference_images.length}개
                    </p>
                    <div className="flex gap-1">
                      {inquiry.data.reference_images.slice(0, 3).map((imageUrl, index) => (
                        <img
                          key={index}
                          src={imageUrl}
                          alt={`첨부 이미지 ${index + 1}`}
                          className="w-12 h-12 object-cover rounded border"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageClick(index);
                          }}
                        />
                      ))}
                      {inquiry.data.reference_images.length > 3 && (
                        <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
                          <span className="text-xs text-gray-500">
                            +{inquiry.data.reference_images.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              <span className="text-sm text-gray-600">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 문의 상세 모달 */}
      {showDetailModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* 모달 헤더 */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">문의 상세</h2>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* 문의 정보 */}
              <div className="mb-6">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">제목</p>
                    <p className="font-medium text-gray-800">{selectedInquiry.data.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">카테고리</p>
                    <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                      {getCategoryLabel(selectedInquiry.data.category)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">연락 방법</p>
                    <p className="text-gray-800">{selectedInquiry.data.contact_preference}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">상태</p>
                    {getStatusBadge(selectedInquiry.status)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">작성일</p>
                    <p className="text-gray-800">{formatDate(selectedInquiry.created_at)}</p>
                  </div>
                  {selectedInquiry.data.phone && (
                    <div>
                      <p className="text-sm text-gray-600">연락처</p>
                      <p className="text-gray-800">{selectedInquiry.data.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 문의 내용 */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">문의 내용</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {selectedInquiry.data.message}
                  </p>
                </div>
              </div>

              {/* 첨부 이미지 */}
              {selectedInquiry.data.reference_images &&
                selectedInquiry.data.reference_images.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">
                      첨부 이미지 ({selectedInquiry.data.reference_images.length}개)
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedInquiry.data.reference_images.map((imageUrl, index) => (
                        <div key={index} className="relative">
                          <img
                            src={imageUrl}
                            alt={`첨부 이미지 ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleImageClick(index)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* 관리자 답변 */}
              {selectedInquiry.data.admin_response && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">관리자 답변</p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-800 whitespace-pre-wrap">
                      {selectedInquiry.data.admin_response}
                    </p>
                  </div>
                </div>
              )}

              {/* 액션 버튼 */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModals}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  닫기
                </button>
                <button
                  onClick={handleCreateInquiry}
                  className="px-4 py-2 bg-[#FF7648] text-white rounded-lg hover:bg-[#E6653F] transition-colors"
                >
                  새 문의 작성
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 이미지 확대 모달 */}
      {showImageModal && selectedInquiry && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeModals}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={selectedInquiry.data.reference_images?.[selectedImageIndex] || ""}
              alt="첨부 이미지 확대"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={closeModals}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 transition-colors"
            >
              ✕
            </button>
            {selectedInquiry.data.reference_images &&
              selectedInquiry.data.reference_images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {selectedInquiry.data.reference_images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex(index);
                      }}
                      className={`w-3 h-3 rounded-full ${
                        index === selectedImageIndex ? "bg-white" : "bg-white bg-opacity-50"
                      }`}
                    />
                  ))}
                </div>
              )}
          </div>
        </div>
      )}
    </>
  );
};

export default MyInquiries;
