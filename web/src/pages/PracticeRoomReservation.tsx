import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaTools,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import IconWrapper from "../components/IconWrapper";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../api/supabaseClient";

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface PracticeRoom {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  pricePerHour: number;
  description: string;
}

const PracticeRoomReservation: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [duration, setDuration] = useState<number>(2);
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // 연습실 목록
  const practiceRooms: PracticeRoom[] = [
    {
      id: "room-a",
      name: "연습실 A",
      capacity: 4,
      equipment: ["스테인드글라스 작업대", "납땜기", "유리커터", "안전장비"],
      pricePerHour: 15000,
      description: "스테인드글라스 전문 작업실로 초급~중급자에게 적합합니다.",
    },
    {
      id: "room-b",
      name: "연습실 B",
      capacity: 6,
      equipment: ["대형 작업대", "전문 도구 세트", "유리가마", "안전장비"],
      pricePerHour: 20000,
      description: "고급 장비를 갖춘 전문 작업실로 고급과정 수강생에게 적합합니다.",
    },
    {
      id: "room-c",
      name: "연습실 C",
      capacity: 2,
      equipment: ["개인 작업대", "기본 도구", "안전장비"],
      pricePerHour: 10000,
      description: "개인 작업에 최적화된 소규모 연습실입니다.",
    },
  ];

  // 시간대 생성
  const generateTimeSlots = () => {
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour < 19; hour++) {
      slots.push({
        id: `${hour}:00`,
        time: `${hour}:00`,
        available: Math.random() > 0.3, // 임시로 랜덤하게 설정
      });
    }
    setTimeSlots(slots);
  };

  useEffect(() => {
    generateTimeSlots();
  }, [selectedDate, selectedRoom]);

  // 오늘 날짜를 기본값으로 설정
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split("T")[0]);
  }, []);

  // 예약 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    if (!selectedRoom || !selectedDate || !selectedTime) {
      alert("모든 필수 정보를 입력해주세요.");
      return;
    }

    try {
      setLoading(true);

      const room = practiceRooms.find((r) => r.id === selectedRoom);
      const totalPrice = room ? room.pricePerHour * duration : 0;

      // practice_room_reservations 테이블에 예약 정보 저장
      const { error } = await supabase.from("practice_room_reservations").insert([
        {
          user_id: user.id,
          room_id: selectedRoom,
          reservation_date: selectedDate,
          start_time: selectedTime,
          duration_hours: duration,
          total_price: totalPrice,
          status: "confirmed",
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      alert("연습실 예약이 완료되었습니다!");
      navigate("/mypage/reservations");
    } catch (error) {
      console.error("예약 실패:", error);
      alert("예약 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const selectedRoomInfo = practiceRooms.find((room) => room.id === selectedRoom);
  const totalPrice = selectedRoomInfo ? selectedRoomInfo.pricePerHour * duration : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8 lg:pl-16">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <IconWrapper icon={FaCalendarAlt} className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">연습실 예약</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            전문 장비가 구비된 연습실에서 개인 작업을 진행하세요.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 예약 폼 */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">예약 정보</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 날짜 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">예약 날짜 *</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date(Date.now() + 86400000).toISOString().split("T")[0]} // 내일부터
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* 연습실 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  연습실 선택 *
                </label>
                <div className="space-y-3">
                  {practiceRooms.map((room) => (
                    <label
                      key={room.id}
                      className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedRoom === room.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="room"
                        value={room.id}
                        checked={selectedRoom === room.id}
                        onChange={(e) => setSelectedRoom(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800">{room.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{room.description}</p>
                          <div className="flex items-center mt-2 text-sm text-gray-500">
                            <IconWrapper icon={FaUsers} className="mr-1" />
                            <span className="mr-4">최대 {room.capacity}명</span>
                            <IconWrapper icon={FaTools} className="mr-1" />
                            <span>{room.equipment.length}개 장비</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-blue-600">
                            {room.pricePerHour.toLocaleString()}원/시간
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 시간 선택 */}
              {selectedRoom && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시작 시간 *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`p-2 text-sm rounded-lg transition-colors ${
                          selectedTime === slot.time
                            ? "bg-blue-600 text-white"
                            : slot.available
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 이용 시간 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이용 시간 *</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>1시간</option>
                  <option value={2}>2시간</option>
                  <option value={3}>3시간</option>
                  <option value={4}>4시간</option>
                </select>
              </div>

              {/* 총 금액 */}
              {selectedRoomInfo && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">총 결제 금액</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {totalPrice.toLocaleString()}원
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {selectedRoomInfo.pricePerHour.toLocaleString()}원/시간 × {duration}시간
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !selectedRoom || !selectedDate || !selectedTime}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "예약 중..." : "예약하기"}
              </button>
            </form>
          </div>

          {/* 연습실 안내 */}
          <div className="space-y-6">
            {/* 이용 안내 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">이용 안내</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <IconWrapper icon={FaClock} className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <div className="font-semibold text-gray-800">운영 시간</div>
                    <div className="text-gray-600">오전 9시 ~ 저녁 7시 (점심시간 12-1시 제외)</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <IconWrapper icon={FaUsers} className="text-blue-600 mt-1 mr-3" />
                  <div>
                    <div className="font-semibold text-gray-800">이용 대상</div>
                    <div className="text-gray-600">창업과정 수강생 및 수료생</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <IconWrapper icon={FaCheckCircle} className="text-green-600 mt-1 mr-3" />
                  <div>
                    <div className="font-semibold text-gray-800">포함 사항</div>
                    <div className="text-gray-600">기본 도구, 안전장비, 작업대</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <IconWrapper icon={FaTimesCircle} className="text-red-600 mt-1 mr-3" />
                  <div>
                    <div className="font-semibold text-gray-800">별도 준비</div>
                    <div className="text-gray-600">개인 작업 재료</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 가격 안내 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">가격 안내</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">수강 중</span>
                  <span className="font-semibold text-green-600">월 50,000원 무제한</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">휴강 중</span>
                  <span className="font-semibold text-blue-600">월 150,000원 무제한</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">시간제 이용</span>
                  <span className="font-semibold text-gray-800">연습실별 상이</span>
                </div>
              </div>
            </div>

            {/* 주의사항 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-yellow-800 mb-3">주의사항</h3>
              <ul className="text-sm text-yellow-700 space-y-2">
                <li>• 예약 시간 10분 전까지 도착해주세요</li>
                <li>• 무단 불참 시 다음 예약이 제한될 수 있습니다</li>
                <li>• 안전장비 착용은 필수입니다</li>
                <li>• 작업 후 정리정돈을 부탁드립니다</li>
                <li>• 예약 변경은 2시간 전까지 가능합니다</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeRoomReservation;
