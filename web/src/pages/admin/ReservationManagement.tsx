import React, { useState, useEffect } from "react";
import { supabase } from "../../api/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import IconWrapper from "../../components/IconWrapper";
import {
  FaCalendarAlt,
  FaUser,
  FaClock,
  FaCheck,
  FaTimes,
  FaSearch,
  FaFilter,
  FaEdit,
  FaTrash,
  FaEye,
  FaUserClock,
} from "react-icons/fa";

interface Reservation {
  id: string;
  user_id: string;
  class_schedule_id: string;
  status: "confirmed" | "cancelled" | "pending" | "completed";
  session_used?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  user_profile?: {
    display_name: string;
    avatar_url?: string;
    phone?: string;
    email?: string;
  };
  class_schedule?: {
    id: string;
    start_time: string;
    end_time: string;
    max_participants: number;
    class: {
      title: string;
      description?: string;
      instructor: {
        display_name: string;
      };
    };
  };
  reservation_count?: number;
}

const ReservationManagement: React.FC = () => {
  const { profile } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    let filtered = reservations;

    if (searchTerm) {
      filtered = filtered.filter(
        (reservation) =>
          reservation.user_profile?.display_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          reservation.user_profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reservation.class_schedule?.class?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((reservation) => reservation.status === statusFilter);
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter((reservation) => {
        const reservationDate = new Date(reservation.class_schedule?.start_time || "");
        return reservationDate.toDateString() === filterDate.toDateString();
      });
    }

    setFilteredReservations(filtered);
  }, [reservations, searchTerm, statusFilter, dateFilter]);

  const fetchReservations = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("reservations")
        .select(
          `
          *,
          user_profile:user_profiles!reservations_user_id_fkey(
            display_name, 
            avatar_url, 
            phone,
            email
          ),
          class_schedule:class_schedules!reservations_class_schedule_id_fkey(
            id,
            start_time,
            end_time,
            max_participants,
            class:classes!class_schedules_class_id_fkey(
              title,
              description,
              instructor:user_profiles!classes_instructor_id_fkey(display_name)
            )
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // 각 스케줄의 예약 수 계산
      const reservationsWithCount = await Promise.all(
        (data || []).map(async (reservation) => {
          const { count } = await supabase
            .from("reservations")
            .select("*", { count: "exact", head: true })
            .eq("class_schedule_id", reservation.class_schedule_id)
            .eq("status", "confirmed");

          return {
            ...reservation,
            reservation_count: count || 0,
          };
        })
      );

      setReservations(reservationsWithCount);
    } catch (error) {
      console.error("예약 목록 로드 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateReservationStatus = async (id: string, status: Reservation["status"]) => {
    try {
      const { error } = await supabase
        .from("reservations")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === id ? { ...reservation, status } : reservation
        )
      );

      alert("예약 상태가 성공적으로 변경되었습니다.");
    } catch (error) {
      console.error("상태 변경 오류:", error);
      alert("상태 변경 중 오류가 발생했습니다.");
    }
  };

  const deleteReservation = async (id: string) => {
    if (!window.confirm("정말로 이 예약을 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase.from("reservations").delete().eq("id", id);

      if (error) throw error;

      setReservations((prev) => prev.filter((r) => r.id !== id));
      alert("예약이 성공적으로 삭제되었습니다.");
    } catch (error) {
      console.error("예약 삭제 오류:", error);
      alert("예약 삭제 중 오류가 발생했습니다.");
    }
  };

  const getStatusColor = (status: Reservation["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: Reservation["status"]) => {
    switch (status) {
      case "pending":
        return "대기중";
      case "confirmed":
        return "확정";
      case "cancelled":
        return "취소됨";
      case "completed":
        return "완료";
      default:
        return "알 수 없음";
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("ko-KR"),
      time: date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  if (profile?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8 lg:pl-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600">관리자 권한이 필요합니다.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8 lg:pl-16">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">예약 관리</h1>
          <p className="text-gray-600">사용자 예약을 확인하고 관리합니다.</p>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <IconWrapper
                icon={FaSearch}
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="사용자명, 이메일, 수업명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
              />
            </div>
            <div className="relative">
              <IconWrapper
                icon={FaFilter}
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
              >
                <option value="all">모든 상태</option>
                <option value="pending">대기중</option>
                <option value="confirmed">확정</option>
                <option value="completed">완료</option>
                <option value="cancelled">취소됨</option>
              </select>
            </div>
            <div className="relative">
              <IconWrapper
                icon={FaCalendarAlt}
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* 예약 목록 */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF7648] mx-auto"></div>
              <p className="mt-4 text-gray-600">예약 목록을 불러오는 중...</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 p-6">
                {filteredReservations.map((reservation) => {
                  const { date, time } = formatDateTime(
                    reservation.class_schedule?.start_time || ""
                  );
                  const endTime = formatDateTime(reservation.class_schedule?.end_time || "").time;

                  return (
                    <div
                      key={reservation.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        {/* 예약 정보 */}
                        <div className="flex items-center space-x-4">
                          {reservation.user_profile?.avatar_url ? (
                            <img
                              src={reservation.user_profile.avatar_url}
                              alt="profile"
                              className="w-12 h-12 rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                              <IconWrapper icon={FaUser} className="text-gray-500" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                              {reservation.class_schedule?.class?.title}
                            </h3>
                            <div className="flex items-center text-sm text-gray-600 space-x-4">
                              <span className="flex items-center">
                                <IconWrapper icon={FaUser} className="mr-1" size={14} />
                                {reservation.user_profile?.display_name}
                              </span>
                              <span className="flex items-center">
                                <IconWrapper icon={FaCalendarAlt} className="mr-1" size={14} />
                                {date}
                              </span>
                              <span className="flex items-center">
                                <IconWrapper icon={FaClock} className="mr-1" size={14} />
                                {time} - {endTime}
                              </span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <span>
                                강사: {reservation.class_schedule?.class?.instructor?.display_name}
                              </span>
                              <span className="mx-2">•</span>
                              <span>
                                예약: {reservation.reservation_count}/
                                {reservation.class_schedule?.max_participants}
                              </span>
                              {reservation.session_used && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>세션 사용: {reservation.session_used}회</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 상태 및 액션 */}
                        <div className="flex items-center space-x-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                              reservation.status
                            )}`}
                          >
                            {getStatusText(reservation.status)}
                          </span>

                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedReservation(reservation);
                                setShowDetailModal(true);
                              }}
                              className="p-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg hover:bg-blue-50"
                              title="상세보기"
                            >
                              <IconWrapper icon={FaEye} size={16} />
                            </button>

                            {reservation.status === "pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    updateReservationStatus(reservation.id, "confirmed")
                                  }
                                  className="p-2 text-green-600 hover:text-green-800 border border-green-300 rounded-lg hover:bg-green-50"
                                  title="예약 확정"
                                >
                                  <IconWrapper icon={FaCheck} size={16} />
                                </button>
                                <button
                                  onClick={() =>
                                    updateReservationStatus(reservation.id, "cancelled")
                                  }
                                  className="p-2 text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50"
                                  title="예약 취소"
                                >
                                  <IconWrapper icon={FaTimes} size={16} />
                                </button>
                              </>
                            )}

                            {reservation.status === "confirmed" && (
                              <button
                                onClick={() => updateReservationStatus(reservation.id, "completed")}
                                className="p-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg hover:bg-blue-50"
                                title="수업 완료"
                              >
                                <IconWrapper icon={FaUserClock} size={16} />
                              </button>
                            )}

                            <button
                              onClick={() => deleteReservation(reservation.id)}
                              className="p-2 text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50"
                              title="예약 삭제"
                            >
                              <IconWrapper icon={FaTrash} size={16} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 추가 정보 */}
                      {reservation.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>메모:</strong> {reservation.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {filteredReservations.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <IconWrapper icon={FaCalendarAlt} className="mx-auto mb-4 text-4xl" />
                  <p>검색 조건에 맞는 예약이 없습니다.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* 통계 */}
        <div className="mt-6 grid md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <IconWrapper icon={FaCalendarAlt} className="text-blue-600 mr-3" size={24} />
              <div>
                <p className="text-sm text-blue-600">전체 예약</p>
                <p className="text-2xl font-bold text-blue-800">{reservations.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <IconWrapper icon={FaClock} className="text-yellow-600 mr-3" size={24} />
              <div>
                <p className="text-sm text-yellow-600">대기중</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {reservations.filter((r) => r.status === "pending").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <IconWrapper icon={FaCheck} className="text-green-600 mr-3" size={24} />
              <div>
                <p className="text-sm text-green-600">확정</p>
                <p className="text-2xl font-bold text-green-800">
                  {reservations.filter((r) => r.status === "confirmed").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <IconWrapper icon={FaUserClock} className="text-purple-600 mr-3" size={24} />
              <div>
                <p className="text-sm text-purple-600">완료</p>
                <p className="text-2xl font-bold text-purple-800">
                  {reservations.filter((r) => r.status === "completed").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 상세보기 모달 */}
        {showDetailModal && selectedReservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">예약 상세 정보</h2>

                <div className="space-y-6">
                  {/* 사용자 정보 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">사용자 정보</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-3">
                        {selectedReservation.user_profile?.avatar_url ? (
                          <img
                            src={selectedReservation.user_profile.avatar_url}
                            alt="profile"
                            className="w-12 h-12 rounded-full mr-3"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                            <IconWrapper icon={FaUser} className="text-gray-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold">
                            {selectedReservation.user_profile?.display_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {selectedReservation.user_profile?.email}
                          </p>
                        </div>
                      </div>
                      {selectedReservation.user_profile?.phone && (
                        <p className="text-sm text-gray-600">
                          전화번호: {selectedReservation.user_profile.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 수업 정보 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">수업 정보</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-semibold mb-2">
                        {selectedReservation.class_schedule?.class?.title}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        {selectedReservation.class_schedule?.class?.description}
                      </p>
                      <p className="text-sm text-gray-600">
                        강사: {selectedReservation.class_schedule?.class?.instructor?.display_name}
                      </p>
                      <div className="mt-3 space-y-1">
                        <p className="text-sm">
                          <strong>일시:</strong>{" "}
                          {
                            formatDateTime(selectedReservation.class_schedule?.start_time || "")
                              .date
                          }
                        </p>
                        <p className="text-sm">
                          <strong>시간:</strong>{" "}
                          {
                            formatDateTime(selectedReservation.class_schedule?.start_time || "")
                              .time
                          }{" "}
                          -{formatDateTime(selectedReservation.class_schedule?.end_time || "").time}
                        </p>
                        <p className="text-sm">
                          <strong>예약 현황:</strong> {selectedReservation.reservation_count}/
                          {selectedReservation.class_schedule?.max_participants}명
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 예약 정보 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">예약 정보</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm">
                            <strong>상태:</strong>
                          </p>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                              selectedReservation.status
                            )}`}
                          >
                            {getStatusText(selectedReservation.status)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm">
                            <strong>예약일:</strong>
                          </p>
                          <p className="text-sm">
                            {new Date(selectedReservation.created_at).toLocaleString("ko-KR")}
                          </p>
                        </div>
                        {selectedReservation.session_used && (
                          <div>
                            <p className="text-sm">
                              <strong>사용 세션:</strong>
                            </p>
                            <p className="text-sm">{selectedReservation.session_used}회</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm">
                            <strong>최종 수정:</strong>
                          </p>
                          <p className="text-sm">
                            {new Date(selectedReservation.updated_at).toLocaleString("ko-KR")}
                          </p>
                        </div>
                      </div>
                      {selectedReservation.notes && (
                        <div className="mt-4">
                          <p className="text-sm">
                            <strong>메모:</strong>
                          </p>
                          <p className="text-sm text-gray-700">{selectedReservation.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setSelectedReservation(null);
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationManagement;
