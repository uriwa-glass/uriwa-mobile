// @ts-ignore
import React, { useState, useEffect, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { getInquiryDetail, addInquiryMessage } from "../api/inquiryService";
import { useUserStore } from "../stores/userStore";
import { UserInquiry, UserInquiryMessage } from "../types";
import LoadingSpinner from "../components/common/LoadingSpinner";

const InquiryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useUserStore();

  // 상태 관리
  const [inquiry, setInquiry] = useState<UserInquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // 문의 상세 정보 가져오기
  useEffect(() => {
    const fetchInquiryDetail = async () => {
      if (!id) {
        setError("문의 ID가 유효하지 않습니다.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await getInquiryDetail(id);

        if (result.success && result.inquiry) {
          setInquiry(result.inquiry);
        } else {
          setError(result.message || "문의 정보를 불러올 수 없습니다.");
        }
      } catch (err) {
        console.error("문의 상세 정보를 불러오는 중 오류가 발생했습니다:", err);
        setError("문의 상세 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchInquiryDetail();
  }, [id]);

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "yyyy년 M월 d일 HH:mm", { locale: ko });
  };

  // 상태에 따른 배지 스타일
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="bg-warning-main bg-opacity-10 text-warning-main px-2 py-1 rounded-sm">
            답변 대기중
          </span>
        );
      case "in-review":
        return (
          <span className="bg-info-main bg-opacity-10 text-info-main px-2 py-1 rounded-sm">
            검토중
          </span>
        );
      case "answered":
        return (
          <span className="bg-success-main bg-opacity-10 text-success-main px-2 py-1 rounded-sm">
            답변 완료
          </span>
        );
      case "closed":
        return <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-sm">종료됨</span>;
      default:
        return <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-sm">{status}</span>;
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

  // 메시지 전송
  const handleSendMessage = async (e: any) => {
    e.preventDefault();

    if (!id || !currentUser?.id || !newMessage.trim()) return;

    try {
      setSendingMessage(true);
      const result = await addInquiryMessage(id, currentUser.id, newMessage);

      if (result.success && result.inquiryMessage) {
        // 새 메시지를 추가
        setInquiry((prev: UserInquiry | null) => {
          if (!prev) return prev;

          const updatedMessages = [...(prev.messages || []), result.inquiryMessage!];

          return {
            ...prev,
            messages: updatedMessages,
            // 메시지를 보냈으니 상태가 in-review로 변경될 수 있음
            status: prev.status === "pending" ? "in-review" : prev.status,
          };
        });

        // 입력 필드 비우기
        setNewMessage("");
      } else {
        alert(result.message || "메시지 전송에 실패했습니다.");
      }
    } catch (err) {
      console.error("메시지 전송 중 오류가 발생했습니다:", err);
      alert("메시지 전송 중 오류가 발생했습니다.");
    } finally {
      setSendingMessage(false);
    }
  };

  // 목록으로 돌아가기
  const handleBackToList = () => {
    navigate("/mypage/inquiries");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-text-secondary">문의 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !inquiry) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="bg-error-main bg-opacity-10 text-error-main p-6 rounded-md max-w-md w-full text-center mb-4">
          <p className="font-medium mb-2">오류가 발생했습니다</p>
          <p className="text-sm">{error || "문의 정보를 찾을 수 없습니다."}</p>
        </div>
        <button
          onClick={handleBackToList}
          className="px-4 py-2 bg-primary-main text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          문의 목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
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
            문의 목록으로
          </button>
          <h1 className="text-2xl font-semibold text-text-primary flex-1 text-center">문의 상세</h1>
          <div className="w-24"></div> {/* 좌우 균형을 위한 빈 공간 */}
        </div>

        {/* 문의 정보 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-background-light p-6 border-b border-border-light">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-semibold text-text-primary mb-1">{inquiry.title}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-sm text-xs">
                    {getCategoryLabel(inquiry.category)}
                  </span>
                  {getStatusBadge(inquiry.status)}
                </div>
              </div>
              <div className="text-text-secondary text-sm">
                <p>문의일: {formatDate(inquiry.created_at)}</p>
                {inquiry.last_updated_at && (
                  <p>마지막 업데이트: {formatDate(inquiry.last_updated_at)}</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="prose max-w-none mb-8">
              <p className="whitespace-pre-wrap">{inquiry.description}</p>
            </div>
          </div>
        </div>

        {/* 대화 내역 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-background-light p-4 border-b border-border-light">
            <h3 className="text-md font-semibold text-text-primary">대화 내역</h3>
          </div>

          <div className="p-4">
            {inquiry.messages && inquiry.messages.length > 0 ? (
              <div className="space-y-4">
                {inquiry.messages.map((message: UserInquiryMessage) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg ${
                      message.is_admin
                        ? "bg-primary-light ml-4 sm:ml-12"
                        : "bg-gray-100 mr-4 sm:mr-12"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{message.is_admin ? "관리자" : "나"}</span>
                      <span className="text-xs text-text-secondary">
                        {formatDate(message.created_at)}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.attachment_urls && message.attachment_urls.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.attachment_urls.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-main hover:text-primary-dark flex items-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                              />
                            </svg>
                            첨부파일 {index + 1}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-text-secondary py-4">아직 대화 내역이 없습니다.</p>
            )}

            {/* 종료된 문의가 아닌 경우만 답변 폼 표시 */}
            {inquiry.status !== "closed" && (
              <form onSubmit={handleSendMessage} className="mt-6">
                <div className="mb-4">
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-text-primary mb-1"
                  >
                    답변 작성
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-border-main rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
                    placeholder="추가 문의 내용이나 답변을 작성해주세요."
                    required
                  />
                </div>
                <div className="text-right">
                  <button
                    type="submit"
                    disabled={sendingMessage || !newMessage.trim()}
                    className="px-4 py-2 bg-primary-main text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingMessage ? "전송 중..." : "답변 보내기"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InquiryDetail;
