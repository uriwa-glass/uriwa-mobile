import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../api/supabaseClient";
import { checkReservationAvailability, getAvailabilityStatus } from "../api/availabilityService";
import { createReservation } from "../api/reservationService";
import Layout from "../components/Layout";
import Button from "../components/Button";
import Card from "../components/Card";

// 타입 정의
interface ClassInfo {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  capacity: number;
  duration: number;
  image_url: string;
  instructor_id: string;
  instructors: {
    id: string;
    name: string;
  }[];
}

interface Schedule {
  id: string;
  date: string;
  remaining_seats: number;
  capacity: number;
  is_cancelled: boolean;
  availabilityStatus: string;
}

interface FormErrorsType {
  schedule?: string;
  studentCount?: string;
  paymentMethod?: string;
  auth?: string;
}

interface UserProfile {
  id: string;
  full_name?: string;
  phone?: string;
}

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    phone?: string;
  };
}

// 결제 방법 옵션
const paymentMethods = [
  { id: "card", label: "신용/체크카드" },
  { id: "virtualAccount", label: "가상계좌 입금" },
  { id: "directDeposit", label: "무통장 입금" },
];

const Reservation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 상태 관리
  const [classData, setClassData] = useState<ClassInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableSchedules, setAvailableSchedules] = useState<Schedule[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // 폼 상태
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const [studentCount, setStudentCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [formErrors, setFormErrors] = useState<FormErrorsType>({});

  // 데이터 로드
  useEffect(() => {
    // 사용자 확인
    const getCurrentUser = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();

        if (userData?.user) {
          setUser(userData.user as User);

          // 사용자 프로필 조회
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userData.user.id)
            .single();

          if (profileData) {
            setProfile(profileData as UserProfile);
          }
        } else {
          // 로그인이 필요한 경우 로그인 페이지로 리디렉션
          navigate("/login?redirect=" + encodeURIComponent(`/reservation/${id}`));
        }
      } catch (error) {
        console.error("사용자 정보 확인 오류:", error);
      }
    };

    // 클래스 정보 로드
    const loadClassData = async () => {
      try {
        setIsLoading(true);

        // 클래스 기본 정보 조회
        const { data: classInfo, error: classError } = await supabase
          .from("classes")
          .select(
            `
            id, title, description, category, price, 
            capacity, duration, image_url, instructor_id,
            instructors (id, name)
          `
          )
          .eq("id", id)
          .single();

        if (classError) {
          throw classError;
        }

        if (!classInfo) {
          throw new Error("클래스를 찾을 수 없습니다.");
        }

        setClassData(classInfo as ClassInfo);

        // 예약 가능한 일정 조회
        const { data: schedulesData, error: schedulesError } = await supabase
          .from("class_schedules")
          .select("*")
          .eq("class_id", id)
          .eq("is_cancelled", false)
          .gt("date", new Date().toISOString())
          .order("date", { ascending: true });

        if (schedulesError) {
          throw schedulesError;
        }

        // 가용성 상태 확인 및 필터링
        const availableData = schedulesData
          .map((schedule) => ({
            ...schedule,
            availabilityStatus: getAvailabilityStatus({
              is_cancelled: schedule.is_cancelled,
              remaining_seats: schedule.remaining_seats,
              capacity: schedule.capacity,
            }),
          }))
          .filter((schedule) => schedule.availabilityStatus !== "FULL");

        setAvailableSchedules(availableData as Schedule[]);
      } catch (error: any) {
        console.error("데이터 로드 오류:", error);
        setError(error.message || "데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    getCurrentUser();
    loadClassData();
  }, [id, navigate]);

  // 폼 유효성 검사
  const validateForm = () => {
    const errors: FormErrorsType = {};

    if (!selectedSchedule) {
      errors.schedule = "수업 일정을 선택해주세요.";
    }

    if (!studentCount || studentCount < 1) {
      errors.studentCount = "올바른 인원 수를 입력해주세요.";
    } else if (studentCount > 5) {
      errors.studentCount = "최대 5명까지 예약 가능합니다.";
    }

    if (!paymentMethod) {
      errors.paymentMethod = "결제 방법을 선택해주세요.";
    }

    if (!user) {
      errors.auth = "예약하려면 로그인이 필요합니다.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 예약 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      // 선택한 스케줄 정보
      const selectedScheduleData = availableSchedules.find(
        (s) => s.id.toString() === selectedSchedule
      );

      if (!selectedScheduleData || !user || !classData) {
        throw new Error("필수 정보가 없습니다.");
      }

      // 예약 생성
      const reservationResult = await createReservation({
        user_id: user.id,
        class_id: classData.id,
        schedule_id: selectedScheduleData.id,
        student_count: studentCount,
        total_price: classData.price * studentCount,
        payment_method: paymentMethod,
        notes: `Web에서 예약 - ${new Date().toISOString()}`,
      });

      if (!reservationResult.success) {
        alert(reservationResult.message || "예약할 수 없습니다. 다시 시도해주세요.");

        // 가용성 변경되었으면 페이지 새로고침
        if (reservationResult.reason === "FULL") {
          window.location.reload();
        }
        return;
      }

      // 성공 메시지 표시
      alert("예약이 완료되었습니다.");

      // 예약 확인 페이지로 이동 (또는 마이페이지)
      navigate("/reservation-confirmation", {
        state: {
          reservation: reservationResult.reservation,
          classInfo: classData,
          scheduleInfo: selectedScheduleData,
        },
      });
    } catch (error) {
      console.error("Error creating reservation:", error);
      alert("예약 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 가격 포맷팅
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
  };

  if (isLoading) {
    return (
      <Layout title="수업 예약" showBackButton={false}>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="inline-block w-10 h-10 border-3 border-gray-200 border-t-primary-main rounded-full animate-spin mb-5"></div>
          <p className="text-text-secondary text-md">수업 정보를 불러오는 중...</p>
        </div>
      </Layout>
    );
  }

  if (error || !classData) {
    return (
      <Layout title="수업 예약" showBackButton={false}>
        <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
          <h3 className="text-lg text-error-main mb-2">예약 불가</h3>
          <p className="text-md text-text-secondary mb-5 text-center">
            {error || "수업 정보를 찾을 수 없습니다."}
          </p>
          <Button onClick={() => navigate(-1)} variant="primary">
            이전 페이지로 돌아가기
          </Button>
        </div>
      </Layout>
    );
  }

  // 예약 불가능한 경우
  if (availableSchedules.length === 0) {
    return (
      <Layout title="수업 예약" showBackButton={false}>
        <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
          <h3 className="text-lg text-error-main mb-2">예약 불가</h3>
          <p className="text-md text-text-secondary mb-5 text-center">
            현재 예약 가능한 일정이 없습니다. 나중에 다시 확인해주세요.
          </p>
          <Button onClick={() => navigate(-1)} variant="primary">
            이전 페이지로 돌아가기
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="예약하기" showBackButton={false}>
      <div className="p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="inline-block w-10 h-10 border-3 border-gray-200 border-t-primary-main rounded-full animate-spin mb-5"></div>
            <p className="text-text-secondary text-md">불러오는 중입니다...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
            <h3 className="text-lg text-error-main mb-2">오류가 발생했습니다</h3>
            <p className="text-md text-text-secondary mb-5 text-center">{error}</p>
            <Button variant="outline" onClick={() => navigate(-1)}>
              돌아가기
            </Button>
          </div>
        ) : (
          <>
            <h1 className="text-xl text-text-primary mb-4">{classData?.title}</h1>

            <Card variant="filled" className="mb-4">
              <div className="flex mb-4">
                <img
                  src={classData?.image_url || "/placeholder.jpg"}
                  alt={classData?.title}
                  className="w-20 h-20 object-cover rounded-sm mr-4"
                />
                <div className="flex-1">
                  <span className="inline-block text-xs bg-primary-main text-primary-contrast px-1.5 py-0.5 rounded-sm mb-1">
                    {classData?.category}
                  </span>
                  <h3 className="text-md text-text-primary mb-1">{classData?.title}</h3>
                  <p className="text-md font-bold text-text-primary">
                    {classData?.price.toLocaleString()}원
                  </p>
                </div>
              </div>
            </Card>

            <Card title="예약 정보" className="mb-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-md font-bold text-text-primary mb-2">
                    일정 선택
                  </label>
                  <select
                    value={selectedSchedule}
                    onChange={(e) => setSelectedSchedule(e.target.value)}
                    className={`w-full p-3 border ${
                      formErrors.schedule ? "border-error-main" : "border-border-medium"
                    } rounded-sm text-md bg-background-light text-text-primary focus:outline-none focus:border-primary-main`}
                  >
                    <option value="">일정을 선택하세요</option>
                    {availableSchedules.map((schedule) => (
                      <option key={schedule.id} value={schedule.id}>
                        {formatDate(schedule.date)} ({schedule.remaining_seats}석 남음)
                      </option>
                    ))}
                  </select>
                  {formErrors.schedule && (
                    <p className="text-error-main text-sm mt-1">{formErrors.schedule}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-md font-bold text-text-primary mb-2">
                    예약 인원
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={studentCount}
                    onChange={(e) => setStudentCount(parseInt(e.target.value, 10))}
                    className={`w-full p-3 border ${
                      formErrors.studentCount ? "border-error-main" : "border-border-medium"
                    } rounded-sm text-md bg-background-light text-text-primary focus:outline-none focus:border-primary-main`}
                  />
                  {formErrors.studentCount && (
                    <p className="text-error-main text-sm mt-1">{formErrors.studentCount}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-md font-bold text-text-primary mb-2">
                    결제 방법
                  </label>
                  <div className="flex flex-col">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center mb-2">
                        <input
                          type="radio"
                          id={method.id}
                          name="paymentMethod"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-2"
                        />
                        <label htmlFor={method.id} className="text-md text-text-primary">
                          {method.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  {formErrors.paymentMethod && (
                    <p className="text-error-main text-sm mt-1">{formErrors.paymentMethod}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-md font-bold text-text-primary mb-2">
                    예약자 정보
                  </label>
                  <div className="p-2 bg-background-light rounded-sm mb-2">
                    <p>이름: {profile?.full_name || user?.user_metadata?.full_name}</p>
                    <p>이메일: {user?.email}</p>
                    <p>전화번호: {profile?.phone || user?.user_metadata?.phone}</p>
                  </div>
                  <p className="text-sm text-info-main mt-2 p-2 bg-info-light bg-opacity-10 rounded-sm">
                    예약자 정보는 회원 정보에서 가져왔습니다. 정보 수정이 필요하시면 내 정보에서
                    변경해주세요.
                  </p>
                </div>

                <Card title="결제 정보" variant="outlined" className="mb-4">
                  <div>
                    <div className="flex justify-between mb-2 text-md">
                      <span>수업 가격</span>
                      <span>{formatPrice(classData?.price)}</span>
                    </div>
                    <div className="flex justify-between mb-2 text-md">
                      <span>인원</span>
                      <span>{studentCount}명</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border-light font-bold text-md">
                      <span>총 결제 금액</span>
                      <span>{formatPrice(classData?.price * studentCount)}</span>
                    </div>
                  </div>
                </Card>

                {formErrors.auth && (
                  <p className="text-error-main text-sm mt-1 mb-4">{formErrors.auth}</p>
                )}

                <div className={submitting ? "opacity-60 pointer-events-none" : ""}>
                  <Button type="submit" variant="primary" fullWidth disabled={submitting}>
                    {submitting ? "처리 중..." : "예약하기"}
                  </Button>
                </div>
              </form>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Reservation;
