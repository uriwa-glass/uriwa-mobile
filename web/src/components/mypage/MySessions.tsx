// @ts-ignore
import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { getUserActiveSession, getUserSessionHistory } from "../../api/sessionService";
import { useUserStore } from "../../stores/userStore";
import type { UserSession, SessionTransaction } from "../../types";
import LoadingSpinner from "../common/LoadingSpinner";

interface MySessionsProps {
  limit?: number;
}

const MySessions = ({ limit = 10 }: MySessionsProps) => {
  const { currentUser, userProfile, loading: userLoading } = useUserStore();

  // 상태 관리
  const [activeSession, setActiveSession] = useState<UserSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<SessionTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = limit;

  // 세션 정보 가져오기
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!currentUser?.id) return;

      try {
        setLoading(true);
        const result = await getUserActiveSession(currentUser.id);

        if (result.success) {
          setActiveSession(result.session);
        } else {
          setError(result.message || "세션 정보를 불러오는 중 오류가 발생했습니다.");
        }
      } catch (err) {
        console.error("세션 정보를 불러오는 중 오류가 발생했습니다:", err);
        setError("세션 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [currentUser?.id]);

  // 세션 이용 내역 가져오기
  useEffect(() => {
    const fetchSessionHistory = async () => {
      if (!currentUser?.id) return;

      try {
        setHistoryLoading(true);
        const offset = (currentPage - 1) * pageSize;
        const result = await getUserSessionHistory(currentUser.id, pageSize, offset);

        if (result.success && result.history) {
          setSessionHistory(result.history);
        } else {
          setHistoryError(result.message || "세션 이용 내역을 불러오는 중 오류가 발생했습니다.");
        }
      } catch (err) {
        console.error("세션 이용 내역을 불러오는 중 오류가 발생했습니다:", err);
        setHistoryError("세션 이용 내역을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchSessionHistory();
  }, [currentUser?.id, currentPage, pageSize]);

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "yyyy년 M월 d일", { locale: ko });
  };

  // 세션 만료까지 남은 일 수 계산
  const getDaysRemaining = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 트랜잭션 타입에 따른 문구 및 스타일
  const getTransactionTypeInfo = (type: string, amount: number) => {
    switch (type) {
      case "deduction":
        return {
          label: "차감",
          class: "text-error-main",
          prefix: "",
        };
      case "addition":
        return {
          label: "추가",
          class: "text-success-main",
          prefix: "+",
        };
      case "initial_grant":
        return {
          label: "초기 부여",
          class: "text-success-main",
          prefix: "+",
        };
      case "refund":
        return {
          label: "환불",
          class: "text-success-main",
          prefix: "+",
        };
      case "admin_adjustment":
        return {
          label: "관리자 조정",
          class: amount >= 0 ? "text-success-main" : "text-error-main",
          prefix: amount >= 0 ? "+" : "",
        };
      default:
        return {
          label: "기타",
          class: amount >= 0 ? "text-success-main" : "text-error-main",
          prefix: amount >= 0 ? "+" : "",
        };
    }
  };

  if (loading || userLoading) {
    return (
      <div className="text-center p-10">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-text-secondary">세션 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-main bg-opacity-10 text-error-main p-4 rounded-md">{error}</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 현재 활성 세션 정보 */}
      <div className="bg-background-paper rounded-md shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border-light">
          <h2 className="text-lg font-semibold text-text-primary">나의 수업권</h2>
        </div>

        <div className="p-6">
          {activeSession ? (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <p className="text-xl font-bold text-primary-main mb-1">
                  남은 수업: <span>{activeSession.session_count}회</span>
                </p>
                <p className="text-sm text-text-secondary">
                  <span>만료일: {formatDate(activeSession.expiry_date)}</span>
                  <span className="ml-2 text-warning-main">
                    ({getDaysRemaining(activeSession.expiry_date)}일 남음)
                  </span>
                </p>
                <p className="text-sm text-text-secondary mt-1">
                  발급일: {formatDate(activeSession.created_at)}
                </p>
              </div>

              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-primary-main text-white rounded-md hover:bg-primary-dark transition-colors">
                  수업권 구매
                </button>
                <button className="px-4 py-2 border border-primary-main text-primary-main rounded-md hover:bg-primary-main hover:text-white transition-colors">
                  사용 내역
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-text-secondary mb-4">현재 사용 가능한 수업권이 없습니다.</p>
              <button className="px-4 py-2 bg-primary-main text-white rounded-md hover:bg-primary-dark transition-colors">
                수업권 구매하기
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 세션 이용 내역 */}
      <div className="bg-background-paper rounded-md shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border-light">
          <h2 className="text-lg font-semibold text-text-primary">세션 이용 내역</h2>
        </div>

        {historyLoading ? (
          <div className="text-center p-6">
            <LoadingSpinner size="md" className="mb-2" />
            <p className="text-text-secondary">세션 이용 내역을 불러오는 중...</p>
          </div>
        ) : historyError ? (
          <div className="p-4">
            <div className="bg-error-main bg-opacity-10 text-error-main p-3 rounded-md">
              {historyError}
            </div>
          </div>
        ) : sessionHistory.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-text-secondary">세션 이용 내역이 없습니다.</p>
          </div>
        ) : (
          <>
            {/* 이용 내역 목록 */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-light">
                <thead className="bg-background-light">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      날짜
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      내용
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      유형
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                      변동
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border-light">
                  {sessionHistory.map((transaction: SessionTransaction) => {
                    const typeInfo = getTransactionTypeInfo(
                      transaction.transaction_type,
                      transaction.amount_changed
                    );

                    return (
                      <tr key={transaction.id} className="hover:bg-background-light">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {formatDate(transaction.created_at)}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-primary">
                          {transaction.reason || "세션 변동"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className="px-2 py-1 rounded-sm bg-opacity-10 text-xs font-medium"
                            style={{
                              backgroundColor: `${typeInfo.class.replace("text-", "bg-")}`,
                              opacity: 0.1,
                            }}
                          >
                            <span className={typeInfo.class}>{typeInfo.label}</span>
                          </span>
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm text-right ${typeInfo.class} font-medium`}
                        >
                          {typeInfo.prefix}
                          {transaction.amount_changed}회
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
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

                <div className="px-2 py-1 text-sm text-text-secondary">{currentPage} 페이지</div>

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={sessionHistory.length < pageSize}
                  className={`p-2 rounded-md ${
                    sessionHistory.length < pageSize
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
          </>
        )}
      </div>
    </div>
  );
};

export default MySessions;
