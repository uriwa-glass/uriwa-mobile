import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Layout from "../components/Layout";
import Button, { ButtonProps } from "../components/Button"; // ButtonProps import 추가

// 필요한 타입 정의 (실제 프로젝트의 타입 정의에 맞게 수정 필요)
interface Reservation {
  id: string;
  status: "confirmed" | "pending" | "cancelled" | string; // 좀 더 구체적인 상태 타입
  student_count: number;
  payment_method: "card" | "virtualAccount" | "bankTransfer" | string; // 결제 수단 타입
  total_price: number;
  // ... 기타 예약 관련 필드
}

interface ClassInfo {
  title?: string;
  category?: string;
  // ... 기타 수업 정보 관련 필드
}

interface ScheduleInfo {
  date: string; // 또는 Date 타입
  duration?: number;
  // ... 기타 스케줄 관련 필드
}

interface LocationState {
  reservation?: Reservation;
  classInfo?: ClassInfo;
  scheduleInfo?: ScheduleInfo;
}

// 스타일 유틸리티 함수
const getStatusBadgeClasses = (status: Reservation["status"]): string => {
  switch (status) {
    case "confirmed":
      return "bg-success-light text-success-main";
    case "pending":
      return "bg-warning-light text-warning-main";
    case "cancelled":
      return "bg-error-light text-error-main";
    default:
      return "bg-neutral-light text-neutral-main";
  }
};

const ReservationConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 페이지 상태 (타입 적용)
  const { reservation, classInfo, scheduleInfo } = (location.state as LocationState) || {};

  // 예약 정보가 없는 경우 처리
  if (!reservation) {
    return (
      <Layout title="예약 정보 없음">
        <div className="p-4">
          {" "}
          {/* Container */}
          <h1 className="text-xl text-text-primary mb-6 text-center">
            {" "}
            {/* Title */}
            예약 정보를 찾을 수 없습니다
          </h1>
          <div className="bg-background-light rounded-sm p-4 mb-6 text-md text-text-secondary">
            {" "}
            {/* Instructions */}
            예약 정보를 찾을 수 없거나, 페이지를 직접 접근하셨습니다. 마이페이지에서 예약 내역을
            확인해 주세요.
          </div>
          <Button variant="primary" fullWidth onClick={() => navigate("/my-page")}>
            {" "}
            {/* fullWidth prop 사용 */}
            예약 내역 확인하기
          </Button>
        </div>
      </Layout>
    );
  }

  // 날짜 및 시간 서식 변환
  const formatScheduleTime = (dateString: string | undefined): string => {
    if (!dateString) return "정보 없음";
    try {
      const date = new Date(dateString);
      return format(date, "yyyy년 M월 d일 (E) HH:mm", { locale: ko });
    } catch (e) {
      console.error("Invalid date format:", e);
      return "날짜 형식 오류";
    }
  };

  // 가격 서식 변환
  const formatPrice = (price: number | undefined): string => {
    if (price === undefined) return "가격 정보 없음";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "원";
  };

  // 상태 텍스트 변환
  const getStatusText = (status: Reservation["status"]): string => {
    switch (status) {
      case "confirmed":
        return "예약 확정";
      case "pending":
        return "결제 대기중";
      case "cancelled":
        return "예약 취소됨";
      default:
        return status || "알 수 없음";
    }
  };

  return (
    <Layout title="예약 확인">
      <div className="p-4">
        {" "}
        {/* Container */}
        <h1 className="text-xl text-text-primary mb-6 text-center">
          {" "}
          {/* Title */}
          예약이 완료되었습니다
        </h1>
        <div className="bg-background-paper rounded-md p-5 mb-6 shadow-md">
          {" "}
          {/* ConfirmationCard */}
          <div className="text-center">
            <div
              className={`inline-block px-3 py-1.5 rounded-sm text-sm font-bold mb-5 ${getStatusBadgeClasses(
                reservation.status
              )}`} // StatusBadge
            >
              {getStatusText(reservation.status)}
            </div>
          </div>
          <div className="mb-5">
            {" "}
            {/* InfoSection */}
            <h2 className="text-md text-text-primary pb-2 border-b border-border-light mb-4">
              {" "}
              {/* SectionTitle */}
              수업 정보
            </h2>
            <div className="flex justify-between mb-3 text-md">
              {" "}
              {/* InfoRow */}
              <span className="text-text-secondary font-normal">수업명</span> {/* InfoLabel */}
              <span className="text-text-primary font-normal">
                {classInfo?.title || "수업 정보 없음"}
              </span>{" "}
              {/* InfoValue */}
            </div>
            <div className="flex justify-between mb-3 text-md">
              {" "}
              {/* InfoRow */}
              <span className="text-text-secondary font-normal">수업 일시</span> {/* InfoLabel */}
              <span className="text-text-primary font-normal">
                {formatScheduleTime(scheduleInfo?.date)}
              </span>{" "}
              {/* InfoValue */}
            </div>
            <div className="flex justify-between mb-3 text-md">
              {" "}
              {/* InfoRow */}
              <span className="text-text-secondary font-normal">소요 시간</span> {/* InfoLabel */}
              <span className="text-text-primary font-normal">
                {scheduleInfo?.duration || 0}분
              </span>{" "}
              {/* InfoValue */}
            </div>
            <div className="flex justify-between text-md">
              {" "}
              {/* InfoRow (last-child margin removed by default) */}
              <span className="text-text-secondary font-normal">카테고리</span> {/* InfoLabel */}
              <span className="text-text-primary font-normal">
                {classInfo?.category || "기타"}
              </span>{" "}
              {/* InfoValue */}
            </div>
          </div>
          <div className="mb-5">
            {" "}
            {/* InfoSection */}
            <h2 className="text-md text-text-primary pb-2 border-b border-border-light mb-4">
              {" "}
              {/* SectionTitle */}
              예약 정보
            </h2>
            <div className="flex justify-between mb-3 text-md">
              {" "}
              {/* InfoRow */}
              <span className="text-text-secondary font-normal">예약 번호</span> {/* InfoLabel */}
              <span className="text-text-primary font-normal">{reservation.id}</span>{" "}
              {/* InfoValue */}
            </div>
            <div className="flex justify-between mb-3 text-md">
              {" "}
              {/* InfoRow */}
              <span className="text-text-secondary font-normal">예약 인원</span> {/* InfoLabel */}
              <span className="text-text-primary font-normal">
                {reservation.student_count}명
              </span>{" "}
              {/* InfoValue */}
            </div>
            <div className="flex justify-between mb-3 text-md">
              {" "}
              {/* InfoRow */}
              <span className="text-text-secondary font-normal">결제 방법</span> {/* InfoLabel */}
              <span className="text-text-primary font-normal">
                {" "}
                {/* InfoValue */}
                {reservation.payment_method === "card"
                  ? "신용/체크카드"
                  : reservation.payment_method === "virtualAccount"
                  ? "가상계좌 입금"
                  : reservation.payment_method === "bankTransfer"
                  ? "무통장 입금"
                  : "기타"}
              </span>
            </div>
            <div className="flex justify-between text-md">
              {" "}
              {/* InfoRow (last-child margin removed by default) */}
              <span className="text-text-secondary font-normal">결제 금액</span> {/* InfoLabel */}
              <span className="text-text-primary font-bold">
                {formatPrice(reservation.total_price)}
              </span>{" "}
              {/* InfoValue with bold */}
            </div>
          </div>
          {/* 대기 중인 경우에만 무통장 입금 안내 보여줌 */}
          {reservation.status === "pending" && (
            <div className="bg-background-light rounded-sm p-4 mb-6 text-md text-text-secondary">
              {" "}
              {/* Instructions */}
              <p className="font-bold mb-2">무통장 입금 안내</p>
              <p>
                아래 계좌로 입금해주시면 확인 후 예약이 확정됩니다. <br />
                <strong>[은행명] [계좌번호] [예금주]</strong>
              </p>
              <p className="mt-2">입금 기한: {formatScheduleTime(scheduleInfo?.date)} 전까지</p>
            </div>
          )}
          {/* QR 코드 섹션 (구현되어 있다면 유지, 아니면 제거 또는 플레이스홀더로) */}
          <div className="bg-background-light p-5 rounded-sm my-5 text-center">
            {" "}
            {/* QRCodeContainer */}
            <div className="w-[180px] h-[180px] mx-auto bg-background-default border border-dashed border-border-medium flex items-center justify-center text-sm text-text-secondary">
              {" "}
              {/* QRPlaceholder */}
              {/* QR 코드 라이브러리 연동 시 여기에 QR 코드 컴포넌트 삽입 */}
              QR 코드 (예시)
            </div>
            <p className="text-sm text-text-secondary mt-3">
              {" "}
              {/* QRInstructions */}
              현장에서 위 QR코드를 제시해주세요.
            </p>
          </div>
          <div className="flex gap-3 mt-5">
            {" "}
            {/* ButtonContainer */}
            <Button variant="outline" onClick={() => navigate("/my-page")} fullWidth>
              예약 내역 보기
            </Button>
            <Button variant="primary" onClick={() => navigate("/")} fullWidth>
              홈으로 이동
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReservationConfirmation;
