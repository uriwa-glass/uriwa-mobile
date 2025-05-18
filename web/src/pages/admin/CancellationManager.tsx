import React, { useState, useEffect, FormEvent } from "react";
import { format, differenceInDays, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import Layout from "../../components/Layout";
import Button, { ButtonProps } from "../../components/Button";
import { supabase } from "../../api/supabaseClient";
import { adminCancelReservation, cancelClassSchedule } from "../../api/cancellationService";

// 타입 정의
interface User {
  id: string;
  email?: string;
  // ... 기타 사용자 정보
}

interface ClassInfo {
  id: string;
  title?: string;
  // ... 기타 수업 정보
}

interface ClassSchedule {
  id: string;
  date: string; // ISO 문자열
  start_time: string;
  end_time: string;
  current_participants: number;
  max_participants: number;
  classes?: ClassInfo;
  // ... 기타 스케줄 정보
}

interface Reservation {
  id: string;
  created_at: string;
  user_id: string;
  class_schedule_id: string;
  student_count: number;
  total_price: number;
  status: "confirmed" | "pending" | "cancelled" | string;
  users?: { email?: string; user_metadata?: { name?: string } }; // users.email, users.user_metadata.name
  class_schedules?: ClassSchedule;
  // ... 기타 예약 정보
}

interface Cancellation {
  id: string;
  created_at: string;
  reason?: string;
  amount_refunded?: number;
  is_penalty: boolean;
  penalty_amount?: number;
  reservation_id: string;
  reservations?: Reservation;
  cancelled_by_user_id?: string; // 관리자 ID
  users?: { email?: string; user_metadata?: { name?: string } }; // 관리자 정보
  // ... 기타 취소 정보
}

interface ModalState {
  isOpen: boolean;
  type: "cancelReservation" | "cancelClass" | "";
  item: Reservation | ClassSchedule | null;
  reason: string;
  notifyUsers: boolean;
}

const getStatusBadgeClasses = (status: Reservation["status"] | string | undefined): string => {
  switch (status) {
    case "confirmed":
    case "completed": // API 응답에 따라 completed도 처리
      return "bg-success-light text-success-dark";
    case "pending":
      return "bg-warning-light text-warning-dark";
    case "cancelled":
    case "failed": // API 응답에 따라 failed도 처리
      return "bg-error-light text-error-dark";
    default:
      return "bg-neutral-light text-neutral-dark";
  }
};

const getStatusText = (status: Reservation["status"] | string | undefined): string => {
  switch (status) {
    case "confirmed":
      return "확정";
    case "pending":
      return "대기중";
    case "cancelled":
      return "취소됨";
    case "completed":
      return "완료";
    case "failed":
      return "실패";
    default:
      return typeof status === "string" ? status : "알 수 없음";
  }
};

const CancellationManager = () => {
  const [activeTab, setActiveTab] = useState<"cancellations" | "upcomingClasses">("cancellations");
  const [cancellations, setCancellations] = useState<Cancellation[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<ClassSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    type: "",
    item: null,
    reason: "",
    notifyUsers: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentUser(data.user as User);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (activeTab === "cancellations") {
          let query = supabase.from("cancellations").select(
            `
            *,
            reservations (*, users(email, user_metadata), class_schedules (*, classes(title))),
            users (email, user_metadata)
            `
          );
          if (statusFilter !== "all") {
            // 실제 취소 상태 필터링 로직은 API 스키마에 따라 달라질 수 있음
            // 예시: query = query.eq('status', statusFilter);
          }
          if (searchQuery) {
            // 예시: query = query.or(`reservations.users.email.ilike.%${searchQuery}%,reservations.class_schedules.classes.title.ilike.%${searchQuery}%`);
          }
          const { data, error } = await query.order("created_at", { ascending: false });
          if (error) throw error;
          setCancellations((data as Cancellation[]) || []);
        } else if (activeTab === "upcomingClasses") {
          let query = supabase
            .from("class_schedules")
            .select("*, classes(title)")
            .gte("date", format(new Date(), "yyyy-MM-dd")) // 오늘 이후 수업
            .order("date", { ascending: true })
            .order("start_time", { ascending: true });

          if (searchQuery) {
            query = query.ilike("classes.title", `%${searchQuery}%`);
          }
          const { data, error } = await query;
          if (error) throw error;
          setUpcomingClasses((data as ClassSchedule[]) || []);
        }
      } catch (error: any) {
        console.error("Error loading data:", error);
        // 사용자에게 오류 메시지 표시
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [activeTab, statusFilter, searchQuery]);

  const openModal = (
    type: "cancelReservation" | "cancelClass",
    item: Reservation | ClassSchedule
  ) => {
    setModalState({ isOpen: true, type, item, reason: "", notifyUsers: true });
  };

  const closeModal = () => {
    if (submitting) return;
    setModalState({ isOpen: false, type: "", item: null, reason: "", notifyUsers: true });
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!modalState.item || !modalState.type || !currentUser) return;

    setSubmitting(true);
    try {
      if (
        modalState.type === "cancelReservation" &&
        modalState.item &&
        "user_id" in modalState.item
      ) {
        // modalState.item이 Reservation 타입임을 확인
        const reservation = modalState.item as Reservation;
        await adminCancelReservation(
          reservation.id,
          currentUser.id,
          modalState.reason,
          modalState.notifyUsers
        );
        // Optimistic update or re-fetch
        setCancellations((prev) => prev.filter((c) => c.reservation_id !== reservation.id));
        setUpcomingClasses((prev) =>
          prev.map((cs) =>
            cs.id === reservation.class_schedule_id
              ? {
                  ...cs,
                  current_participants: Math.max(
                    0,
                    cs.current_participants - reservation.student_count
                  ),
                }
              : cs
          )
        );
      } else if (
        modalState.type === "cancelClass" &&
        modalState.item &&
        "start_time" in modalState.item
      ) {
        // modalState.item이 ClassSchedule 타입임을 확인
        const classSchedule = modalState.item as ClassSchedule;
        await cancelClassSchedule(
          classSchedule.id,
          currentUser.id, // 관리자 ID
          modalState.reason
        );
        // Optimistic update or re-fetch
        setUpcomingClasses((prev) => prev.filter((cs) => cs.id !== classSchedule.id));
      }
      alert("작업이 성공적으로 완료되었습니다.");
      closeModal();
      // 데이터 재로딩
      const currentActiveTab = activeTab;
      // 현재 탭과 다른 유효한 탭 값으로 임시 변경하여 useEffect 트리거
      const tempActiveTab =
        currentActiveTab === "cancellations" ? "upcomingClasses" : "cancellations";
      setActiveTab(tempActiveTab);
      // 다시 원래 탭으로 설정하여 UI는 유지하고 데이터는 리프레시
      setTimeout(() => setActiveTab(currentActiveTab), 0);
    } catch (error: any) {
      console.error("Error submitting cancellation:", error);
      alert(`오류 발생: ${error.message || "알 수 없는 오류"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string | undefined, fmt = "yyyy.MM.dd HH:mm") => {
    if (!dateString) return "-";
    try {
      return format(parseISO(dateString), fmt, { locale: ko });
    } catch {
      return dateString; // 파싱 실패 시 원본 반환
    }
  };

  const formatPrice = (price: number | undefined) => {
    if (price === undefined) return "-";
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
  };

  const renderCancellationsTable = () => (
    <div className="overflow-x-auto">
      {" "}
      {/* TableContainer */}
      <table className="w-full border-collapse text-sm">
        {" "}
        {/* Table */}
        <thead>
          <tr className="border-b border-gray-200">
            <th className="p-3 text-left text-gray-600 font-normal">취소일</th>
            <th className="p-3 text-left text-gray-600 font-normal">예약자(이메일)</th>
            <th className="p-3 text-left text-gray-600 font-normal">수업명</th>
            <th className="p-3 text-left text-gray-600 font-normal">환불액</th>
            <th className="p-3 text-left text-gray-600 font-normal">취소 사유</th>
            <th className="p-3 text-left text-gray-600 font-normal">관리자 처리</th>
          </tr>
        </thead>
        <tbody>
          {cancellations.map((c) => (
            <tr key={c.id} className="border-b border-gray-200 hover:bg-gray-50">
              {" "}
              {/* TableRow */}
              <td className="p-3 align-middle whitespace-nowrap">
                {formatDate(c.created_at)}
              </td>{" "}
              {/* TableCell */}
              <td
                className="p-3 align-middle truncate max-w-xs"
                title={c.reservations?.users?.email || c.reservations?.user_id}
              >
                {c.reservations?.users?.user_metadata?.name ||
                  c.reservations?.users?.email ||
                  c.reservations?.user_id ||
                  "-"}
              </td>
              <td
                className="p-3 align-middle truncate max-w-xs"
                title={c.reservations?.class_schedules?.classes?.title}
              >
                {c.reservations?.class_schedules?.classes?.title || "정보 없음"}
              </td>
              <td className="p-3 align-middle text-right whitespace-nowrap">
                {formatPrice(c.amount_refunded)}
              </td>
              <td className="p-3 align-middle">{c.reason || "-"}</td>
              <td
                className="p-3 align-middle truncate max-w-[150px]"
                title={c.users?.email || c.cancelled_by_user_id}
              >
                {c.users?.user_metadata?.name || c.users?.email || c.cancelled_by_user_id || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {cancellations.length === 0 && !loading && (
        <div className="p-8 text-center text-gray-500">취소 내역이 없습니다.</div>
      )}
    </div>
  );

  const renderUpcomingClassesTable = () => (
    <div className="overflow-x-auto">
      {" "}
      {/* TableContainer */}
      <table className="w-full border-collapse text-sm">
        {" "}
        {/* Table */}
        <thead>
          <tr className="border-b border-gray-200">
            <th className="p-3 text-left text-gray-600 font-normal">수업일시</th>
            <th className="p-3 text-left text-gray-600 font-normal">수업명</th>
            <th className="p-3 text-left text-gray-600 font-normal">참여/정원</th>
            <th className="p-3 text-left text-gray-600 font-normal">남은 일수</th>
            <th className="p-3 text-left text-gray-600 font-normal">작업</th>
          </tr>
        </thead>
        <tbody>
          {upcomingClasses.map((cs) => {
            const daysRemaining = differenceInDays(parseISO(cs.date), new Date());
            return (
              <tr key={cs.id} className="border-b border-gray-200 hover:bg-gray-50">
                {" "}
                {/* TableRow */}
                <td className="p-3 align-middle whitespace-nowrap">
                  {formatDate(cs.date, "yyyy.MM.dd")} {cs.start_time.substring(0, 5)}-
                  {cs.end_time.substring(0, 5)}
                </td>{" "}
                {/* TableCell */}
                <td className="p-3 align-middle truncate max-w-xs" title={cs.classes?.title}>
                  {cs.classes?.title || "정보 없음"}
                </td>
                <td className="p-3 align-middle whitespace-nowrap">
                  {cs.current_participants} / {cs.max_participants}
                </td>
                <td className="p-3 align-middle whitespace-nowrap">
                  {daysRemaining < 0 ? (
                    <span className="text-red-500">종료</span>
                  ) : (
                    `${daysRemaining}일 남음`
                  )}
                </td>
                <td className="p-3 align-middle">
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => openModal("cancelClass", cs)}
                    disabled={daysRemaining < 0}
                  >
                    수업 취소
                  </Button>
                  {/* 개별 예약 취소 버튼 (필요시 추가) */}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {upcomingClasses.length === 0 && !loading && (
        <div className="p-8 text-center text-gray-500">예정된 수업이 없습니다.</div>
      )}
    </div>
  );

  return (
    <Layout title="취소 관리">
      <div className="p-4">
        {" "}
        {/* Container */}
        <h1 className="text-2xl text-text-primary mb-4">취소 관리</h1> {/* Title */}
        <div className="bg-background-paper rounded-md p-4 mb-5 shadow">
          {" "}
          {/* Card */}
          <div className="flex border-b border-gray-200 mb-5">
            {" "}
            {/* Tabs */}
            {(["cancellations", "upcomingClasses"] as const).map((tab) => (
              <div
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-4 cursor-pointer text-sm font-medium 
                  ${
                    activeTab === tab
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
                  }`}
              >
                {tab === "cancellations" ? "취소 내역 관리" : "수업 일정 관리 (취소용)"}
              </div>
            ))}
          </div>
          <div className="flex gap-4 mb-4 flex-wrap items-center">
            {" "}
            {/* FilterContainer */}
            {activeTab === "cancellations" && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 min-w-[150px]" // FilterSelect
              >
                <option value="all">전체 상태</option>
                <option value="pending_refund">환불 대기</option>{" "}
                {/* 실제 API 상태값에 맞게 수정 */}
                <option value="completed_refund">환불 완료</option>
                <option value="no_refund">환불 없음</option>
              </select>
            )}
            <input
              type="search"
              placeholder={
                activeTab === "cancellations"
                  ? "예약자명, 이메일, 수업명 검색..."
                  : "수업명 검색..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 border border-gray-300 rounded-md text-sm flex-grow focus:ring-blue-500 focus:border-blue-500 min-w-[250px]" // SearchInput
            />
            {loading && (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            )}
          </div>
          {activeTab === "cancellations"
            ? renderCancellationsTable()
            : renderUpcomingClassesTable()}
        </div>
        {/* Modal */}
        {modalState.isOpen && modalState.item && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[1000] p-4 backdrop-blur-sm">
            {" "}
            {/* Modal */}
            <div className="bg-white p-6 rounded-md shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              {" "}
              {/* ModalContent */}
              <form onSubmit={handleFormSubmit}>
                <h3 className="text-lg font-semibold mb-4">
                  {" "}
                  {/* ModalTitle */}
                  {modalState.type === "cancelReservation" ? "예약 취소 처리" : "수업 전체 취소"}
                </h3>

                <div className="mb-4 text-sm">
                  {" "}
                  {/* FormGroup */}
                  {modalState.type === "cancelReservation" && "user_id" in modalState.item && (
                    <>
                      <p>
                        <strong>예약자:</strong>{" "}
                        {(modalState.item as Reservation).users?.user_metadata?.name ||
                          (modalState.item as Reservation).users?.email}
                      </p>
                      <p>
                        <strong>수업명:</strong>{" "}
                        {(modalState.item as Reservation).class_schedules?.classes?.title}
                      </p>
                      <p>
                        <strong>예약일시:</strong>{" "}
                        {formatDate(
                          (modalState.item as Reservation).class_schedules?.date,
                          "yyyy.MM.dd"
                        )}{" "}
                        {(modalState.item as Reservation).class_schedules?.start_time.substring(
                          0,
                          5
                        )}
                      </p>
                      <p>
                        <strong>결제금액:</strong>{" "}
                        {formatPrice((modalState.item as Reservation).total_price)}
                      </p>
                    </>
                  )}
                  {modalState.type === "cancelClass" && "start_time" in modalState.item && (
                    <>
                      <p>
                        <strong>수업명:</strong> {(modalState.item as ClassSchedule).classes?.title}
                      </p>
                      <p>
                        <strong>수업일시:</strong>{" "}
                        {formatDate((modalState.item as ClassSchedule).date, "yyyy.MM.dd")}{" "}
                        {(modalState.item as ClassSchedule).start_time.substring(0, 5)}
                      </p>
                      <p>
                        <strong>현재 참여인원:</strong>{" "}
                        {(modalState.item as ClassSchedule).current_participants} /{" "}
                        {(modalState.item as ClassSchedule).max_participants}
                      </p>
                    </>
                  )}
                </div>

                <div className="mb-4">
                  {" "}
                  {/* FormGroup */}
                  <label htmlFor="reason" className="block mb-1 text-sm font-medium text-gray-700">
                    취소 사유 (필수)
                  </label>{" "}
                  {/* Label */}
                  <textarea
                    id="reason"
                    value={modalState.reason}
                    onChange={(e) => setModalState((prev) => ({ ...prev, reason: e.target.value }))}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md text-sm min-h-[100px] focus:ring-blue-500 focus:border-blue-500" // TextArea
                    placeholder={
                      modalState.type === "cancelClass"
                        ? "수강생들에게 보여질 수 있습니다."
                        : "내부 기록용입니다."
                    }
                  />
                </div>

                {modalState.type === "cancelClass" && (
                  <div className="mb-4">
                    {" "}
                    {/* FormGroup */}
                    <label className="flex items-center text-sm text-gray-700">
                      {" "}
                      {/* Label */}
                      <input
                        type="checkbox" // Checkbox
                        checked={modalState.notifyUsers}
                        onChange={(e) =>
                          setModalState((prev) => ({ ...prev, notifyUsers: e.target.checked }))
                        }
                        className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      수강생에게 취소 알림 보내기 (구현 필요)
                    </label>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                  {" "}
                  {/* ButtonGroup */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                    disabled={submitting}
                  >
                    닫기
                  </Button>
                  <Button
                    type="submit"
                    variant="danger"
                    disabled={submitting || !modalState.reason.trim()}
                  >
                    {submitting ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        처리 중...
                      </div>
                    ) : modalState.type === "cancelReservation" ? (
                      "예약 취소 확정"
                    ) : (
                      "수업 전체 취소 확정"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CancellationManager;
