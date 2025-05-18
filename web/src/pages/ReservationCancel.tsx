import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { format, differenceInHours } from "date-fns";
import { ko } from "date-fns/locale";
import Layout from "../components/Layout";
import Button from "../components/Button";
import { supabase } from "../api/supabaseClient";
import { checkCancellationPolicy, cancelReservation } from "../api/cancellationService";
import type { Reservation as ReservationType } from "../types/stores";

// 동적 Tailwind 클래스 유틸리티 함수 추가
function statusClass(type: string) {
  if (type === "success")
    return "p-4 rounded-md text-md my-4 text-center bg-success-main bg-opacity-10 text-success-main";
  if (type === "error")
    return "p-4 rounded-md text-md my-4 text-center bg-error-main bg-opacity-10 text-error-main";
  return "p-4 rounded-md text-md my-4 text-center bg-info-main bg-opacity-10 text-info-main";
}
function refundRateClass(refundRate: number) {
  if (refundRate >= 0.8)
    return "p-3 rounded-md my-4 font-bold bg-success-main bg-opacity-10 text-success-main";
  if (refundRate >= 0.5)
    return "p-3 rounded-md my-4 font-bold bg-warning-main bg-opacity-10 text-warning-main";
  return "p-3 rounded-md my-4 font-bold bg-error-main bg-opacity-10 text-error-main";
}

// 타입 명확화
interface CancellationPolicy {
  canCancel: boolean;
  message?: string;
  refundAmount: number;
  refundRate: number;
  timeToClass?: number;
}

const ReservationCancel = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;

  // 상태 관리
  const [reservation, setReservation] = useState<any>(null);
  const [classInfo, setClassInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancellationPolicy, setCancellationPolicy] = useState<CancellationPolicy | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [status, setStatus] = useState<{ type: string; message: string }>({
    type: "",
    message: "",
  });

  // 예약 정보 로드
  useEffect(() => {
    const loadReservation = async () => {
      try {
        setLoading(true);
        let reservationId = id;

        // URL의 ID 파라미터 또는 state에서 전달된 ID로 예약 조회
        if (!reservationId && state?.reservationId) {
          reservationId = state.reservationId;
        }

        if (!reservationId) {
          setStatus({
            type: "error",
            message: "예약 정보를 찾을 수 없습니다.",
          });
          setLoading(false);
          return;
        }

        // 예약 정보 조회
        const { data: reservationData, error: reservationError } = await supabase
          .from("reservations")
          .select(
            `
            *,
            class_schedules!inner(
              id,
              class_id,
              date,
              duration,
              capacity,
              remaining_seats,
              is_cancelled,
              classes(
                id,
                title,
                type,
                category,
                price,
                description,
                instructor_id,
                instructors(
                  id,
                  name
                )
              )
            ),
            users!inner(
              id,
              email,
              membership_level
            )
          `
          )
          .eq("id", reservationId)
          .single();

        if (reservationError) throw reservationError;

        if (!reservationData) {
          setStatus({
            type: "error",
            message: "예약 정보를 찾을 수 없습니다.",
          });
          setLoading(false);
          return;
        }

        // 이미 취소된 예약인지 확인
        if (reservationData.status === "cancelled") {
          setStatus({
            type: "error",
            message: "이미 취소된 예약입니다.",
          });
        }

        setReservation(reservationData);
        setClassInfo(reservationData.class_schedules?.classes);

        // 취소 정책 확인
        const cancellationPolicyResult = await checkCancellationPolicy(
          reservationData,
          reservationData.class_schedules,
          reservationData.users
        );

        setCancellationPolicy(cancellationPolicyResult);
      } catch (error) {
        console.error("Error loading reservation:", error);
        setStatus({
          type: "error",
          message: "예약 정보를 불러오는 중 오류가 발생했습니다.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadReservation();
  }, [id, state]);

  // 취소 처리
  const handleCancelReservation = async () => {
    try {
      setSubmitLoading(true);

      if (!reservation) {
        setStatus({
          type: "error",
          message: "취소할 예약 정보가 없습니다.",
        });
        return;
      }

      // 취소 가능한지 재확인
      if (!cancellationPolicy?.canCancel) {
        setStatus({
          type: "error",
          message: cancellationPolicy?.message || "취소할 수 없는 예약입니다.",
        });
        return;
      }

      // 취소 사유가 없으면 기본값 설정
      const reason = cancellationReason.trim() || "고객 요청으로 취소";

      // 예약 취소 처리
      const result = await cancelReservation(reservation.id, reservation.user_id, reason);

      if (result.success) {
        setStatus({
          type: "success",
          message: result.message,
        });
        // 3초 후 마이페이지로 이동
        setTimeout(() => {
          navigate("/my-page");
        }, 3000);
      } else {
        setStatus({
          type: "error",
          message: result.message,
        });
      }
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      setStatus({
        type: "error",
        message: "예약 취소 중 오류가 발생했습니다.",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "yyyy년 M월 d일 (E) HH:mm", { locale: ko });
  };

  // 가격 포맷팅
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
  };

  if (loading) {
    return (
      <Layout title="예약 취소">
        <div className="p-4">
          <div className="text-center p-10">
            <div className="inline-block w-12 h-12 border-4 border-gray-200 border-t-primary-main rounded-full animate-spin mr-2"></div>
            <p>예약 정보를 불러오는 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!reservation || status.type === "error") {
    return (
      <Layout title="예약 취소">
        <div className="p-4">
          <h1 className="text-xl text-text-primary mb-4">예약 취소</h1>
          <div className={statusClass(status.type)}>
            {status.message || "예약 정보를 찾을 수 없습니다."}
          </div>
          <Button variant="primary" onClick={() => navigate("/my-page")}>
            마이페이지로 이동
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="예약 취소">
      <div className="p-4">
        <h1 className="text-xl text-text-primary mb-4">예약 취소</h1>

        {status.type === "success" && (
          <div className={statusClass(status.type)}>{status.message}</div>
        )}

        {status.type !== "success" && (
          <>
            <div className="bg-background-paper rounded-md p-4 mb-5 shadow-soft">
              <h2 className="text-lg text-text-primary mb-4 pb-2 border-b border-border-light">
                예약 정보
              </h2>
              <div className="flex justify-between mb-3 text-md">
                <div className="text-text-secondary">수업명</div>
                <div className="text-text-primary font-bold">
                  {classInfo?.title || "수업 정보 없음"}
                </div>
              </div>
              <div className="flex justify-between mb-3 text-md">
                <div className="text-text-secondary">예약 번호</div>
                <div className="text-text-primary font-bold">{reservation.id}</div>
              </div>
              <div className="flex justify-between mb-3 text-md">
                <div className="text-text-secondary">수업 일시</div>
                <div className="text-text-primary font-bold">
                  {formatDate(reservation.class_schedules?.date)}
                </div>
              </div>
              <div className="flex justify-between mb-3 text-md">
                <div className="text-text-secondary">예약 인원</div>
                <div className="text-text-primary font-bold">{reservation.student_count}명</div>
              </div>
              <div className="flex justify-between mb-3 text-md">
                <div className="text-text-secondary">결제 금액</div>
                <div className="text-text-primary font-bold">
                  {formatPrice(reservation.total_price)}
                </div>
              </div>
            </div>

            <div className="bg-background-paper rounded-md p-4 mb-5 shadow-soft">
              <h2 className="text-lg text-text-primary mb-4 pb-2 border-b border-border-light">
                취소 정책
              </h2>

              {!cancellationPolicy?.canCancel ? (
                <div className={statusClass(status.type)}>{cancellationPolicy?.message}</div>
              ) : (
                <>
                  <div className={refundRateClass(cancellationPolicy.refundRate)}>
                    취소 시 환불 금액: {formatPrice(cancellationPolicy.refundAmount)} (
                    {Math.round(cancellationPolicy.refundRate * 100)}% 환불)
                  </div>

                  <p>
                    현재 수업 시작까지 {cancellationPolicy.timeToClass}시간 남았습니다. 취소
                    수수료는 남은 시간과 회원 등급에 따라 계산됩니다.
                  </p>

                  <table className="w-full border-collapse my-4 text-sm">
                    <thead>
                      <tr className="border-b border-border-light last:border-b-0">
                        <th className="py-2 px-1 text-left text-text-secondary font-normal">
                          시간대
                        </th>
                        <th className="py-2 px-1 text-left text-text-secondary font-normal">
                          환불 비율
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-2 px-1 text-left">수업 48시간 이전</td>
                        <td className="py-2 px-1 text-left">100%</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-1 text-left">수업 24-48시간 이내</td>
                        <td className="py-2 px-1 text-left">80%</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-1 text-left">수업 24시간 이내</td>
                        <td className="py-2 px-1 text-left">50%</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-1 text-left">수업 시작 이후</td>
                        <td className="py-2 px-1 text-left">환불 불가</td>
                      </tr>
                    </tbody>
                  </table>

                  <p className="text-sm text-text-secondary">
                    * 회원 등급에 따라 추가 혜택이 적용될 수 있습니다.
                    <br />* 특별 수업 및 이벤트는 다른 취소 정책이 적용될 수 있습니다.
                  </p>
                </>
              )}
            </div>

            {cancellationPolicy?.canCancel && (
              <div className="bg-background-paper rounded-md p-4 mb-5 shadow-soft">
                <h2 className="text-lg text-text-primary mb-4 pb-2 border-b border-border-light">
                  취소 사유
                </h2>
                <div className="my-4">
                  <textarea
                    className="w-full p-3 border border-border-medium rounded-md text-md mt-2 resize-y min-h-[80px] bg-background-light text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-main"
                    placeholder="취소 사유를 입력해주세요. (선택사항)"
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    maxLength={200}
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant={"secondary" as any}
                    style={{ flex: 1 }}
                    onClick={() => navigate("/my-page")}
                    disabled={submitLoading}
                  >
                    돌아가기
                  </Button>
                  <Button
                    variant={"error" as any}
                    style={{ flex: 1 }}
                    onClick={handleCancelReservation}
                    disabled={submitLoading}
                  >
                    {submitLoading ? (
                      <>
                        <div className="inline-block w-6 h-6 border-2 border-gray-200 border-t-primary-main rounded-full animate-spin mr-2"></div>{" "}
                        처리 중...
                      </>
                    ) : (
                      "예약 취소하기"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* 취소 완료 후 버튼 */}
        {status.type === "success" && (
          <Button variant="primary" onClick={() => navigate("/my-page")} style={{ width: "100%" }}>
            마이페이지로 이동
          </Button>
        )}
      </div>
    </Layout>
  );
};

export default ReservationCancel;
