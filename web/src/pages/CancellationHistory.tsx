import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Layout from "../components/Layout";
import Button from "../components/Button";
import { getUserCancellationHistory } from "../api/cancellationService";
import { supabase } from "../api/supabaseClient";

// 동적 Tailwind 클래스 유틸리티 함수
function statusBadgeClass(status: string) {
  switch (status) {
    case "completed":
      return "bg-success-main bg-opacity-10 text-success-main px-2 py-1 rounded-sm text-xs";
    case "pending":
      return "bg-warning-main bg-opacity-10 text-warning-main px-2 py-1 rounded-sm text-xs";
    default:
      return "bg-info-main bg-opacity-10 text-info-main px-2 py-1 rounded-sm text-xs";
  }
}

// 타입 정의 (API 응답 구조에 맞게 구체화 필요)
interface Cancellation {
  id: string;
  created_at: string;
  refund_amount: number;
  refund_rate: number;
  refund_status: string;
  reservations: {
    student_count: number;
    total_price: number;
    class_schedules: {
      date: string;
      classes: {
        title: string;
      };
    };
  };
}

const CancellationHistory = () => {
  const navigate = useNavigate();
  const [cancellations, setCancellations] = useState<Cancellation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCancellationHistory = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          navigate("/login");
          return;
        }
        const cancellationHistory = await getUserCancellationHistory(user.id);
        setCancellations(cancellationHistory as Cancellation[]);
      } catch (err: any) {
        console.error("Error loading cancellation history:", err);
        setError("취소 이력을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    loadCancellationHistory();
  }, [navigate]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "yyyy년 M월 d일 (E) HH:mm", { locale: ko });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "환불 완료";
      case "pending":
        return "처리 중";
      case "failed":
        return "환불 실패";
      default:
        return "상태 미정";
    }
  };

  if (loading) {
    return (
      <Layout title="취소 이력">
        <div className="p-4">
          <div className="text-center p-10">
            <div className="inline-block w-10 h-10 border-4 border-gray-200 border-t-primary-main rounded-full animate-spin mb-4"></div>
            <p className="text-text-secondary">취소 이력을 불러오는 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="취소 이력">
      <div className="p-4">
        <h1 className="text-xl text-text-primary mb-4">취소 이력</h1>

        {error && (
          <div className="bg-background-paper rounded-md p-4 mb-5 shadow-soft">
            <div className="text-error-main text-center p-4">{error}</div>
          </div>
        )}

        <div className="bg-background-paper rounded-md p-4 mb-5 shadow-soft">
          <h2 className="text-lg text-text-primary mb-4 pb-2 border-b border-border-light">
            취소한 수업
          </h2>

          {cancellations.length === 0 ? (
            <div className="p-8 text-center text-text-secondary text-md">
              취소한 수업이 없습니다.
            </div>
          ) : (
            cancellations.map((cancellation) => (
              <div
                key={cancellation.id}
                className="border-b border-border-light py-4 last:border-b-0"
              >
                <h3 className="text-md text-text-primary mb-2">
                  {cancellation.reservations.class_schedules.classes.title}
                </h3>

                <div className="flex justify-between mb-2 text-sm">
                  <div className="text-text-secondary">취소 날짜</div>
                  <div className="text-text-primary">{formatDate(cancellation.created_at)}</div>
                </div>

                <div className="flex justify-between mb-2 text-sm">
                  <div className="text-text-secondary">수업 일시</div>
                  <div className="text-text-primary">
                    {formatDate(cancellation.reservations.class_schedules.date)}
                  </div>
                </div>

                <div className="flex justify-between mb-2 text-sm">
                  <div className="text-text-secondary">예약 인원</div>
                  <div className="text-text-primary">
                    {cancellation.reservations.student_count}명
                  </div>
                </div>

                <div className="flex justify-between mb-2 text-sm">
                  <div className="text-text-secondary">결제 금액</div>
                  <div className="text-text-primary">
                    {formatPrice(cancellation.reservations.total_price)}
                  </div>
                </div>

                <div className="flex justify-between mb-2 text-sm">
                  <div className="text-text-secondary">환불 금액</div>
                  <div className="text-text-primary font-bold">
                    {formatPrice(cancellation.refund_amount)}
                    <span className="bg-success-main bg-opacity-10 text-success-main px-2 py-1 rounded-sm text-xs font-bold ml-2">
                      {Math.round(cancellation.refund_rate * 100)}% 환불
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <div className="text-text-secondary">환불 상태</div>
                  <div className={statusBadgeClass(cancellation.refund_status)}>
                    {getStatusText(cancellation.refund_status)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <Button variant="primary" onClick={() => navigate("/my-page")} className="w-full mt-5">
          마이페이지로 돌아가기
        </Button>
      </div>
    </Layout>
  );
};

export default CancellationHistory;
