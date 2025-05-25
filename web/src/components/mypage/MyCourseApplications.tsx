import React, { useState, useEffect } from "react";
import { supabase } from "../../api/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import IconWrapper from "../IconWrapper";
import {
  FaBook,
  FaCalendarAlt,
  FaClock,
  FaDollarSign,
  FaUser,
  FaSearch,
  FaFilter,
  FaEye,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock as FaClockSolid,
  FaTimesCircle,
} from "react-icons/fa";

interface CourseApplication {
  id: string;
  course_id: string;
  course_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  special_requests?: string;
  classes?: {
    id: string;
    title: string;
    description: string;
    price: number;
    duration: number;
    thumbnail_url?: string;
    instructor: { display_name: string } | null;
  };
}

const MyCourseApplications: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<CourseApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // 영어 course_type을 한국어로 매핑
  const getCourseTypeName = (courseType: string): string => {
    const typeMapping: { [key: string]: string } = {
      "stained-glass": "스테인드글라스",
      "glass-kiln": "유리가마",
      entrepreneurship: "창업과정",
      experience: "체험과정",
      "kids-class": "키즈클래스",
      "special-course": "특별과정",
      workshop: "워크샵",
    };
    return typeMapping[courseType] || courseType;
  };

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("course_applications")
        .select(
          `
          *,
          classes (
            id,
            title,
            description,
            price,
            duration,
            thumbnail_url,
            instructor:user_profiles!classes_instructor_id_fkey(display_name)
          )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setApplications(data || []);
    } catch (err: any) {
      console.error("수강신청 내역 조회 오류:", err);
      setError(err.message || "수강신청 내역을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "승인 대기",
          color: "text-yellow-600",
          bgColor: "bg-yellow-100",
          icon: FaClockSolid,
        };
      case "approved":
        return {
          label: "승인됨",
          color: "text-green-600",
          bgColor: "bg-green-100",
          icon: FaCheckCircle,
        };
      case "rejected":
        return {
          label: "거절됨",
          color: "text-red-600",
          bgColor: "bg-red-100",
          icon: FaTimesCircle,
        };
      case "completed":
        return {
          label: "수강 완료",
          color: "text-blue-600",
          bgColor: "bg-blue-100",
          icon: FaCheckCircle,
        };
      default:
        return {
          label: status,
          color: "text-gray-600",
          bgColor: "bg-gray-100",
          icon: FaExclamationTriangle,
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("ko-KR") + "원";
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.classes?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.course_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStats = () => {
    const total = applications.length;
    const pending = applications.filter((app) => app.status === "pending").length;
    const approved = applications.filter((app) => app.status === "approved").length;
    const completed = applications.filter((app) => app.status === "completed").length;

    return { total, pending, approved, completed };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7648]"></div>
        <p className="mt-4 text-gray-600">수강신청 내역을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <IconWrapper icon={FaExclamationTriangle} className="text-red-500 text-4xl mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">오류가 발생했습니다</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchApplications}
          className="px-4 py-2 bg-[#FF7648] text-white rounded-lg hover:bg-[#E5673F] transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">수강신청 내역</h1>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <IconWrapper icon={FaBook} className="text-[#FF7648] text-2xl mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">총 신청</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <IconWrapper icon={FaClockSolid} className="text-yellow-500 text-2xl mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-600">승인 대기</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <IconWrapper icon={FaCheckCircle} className="text-green-500 text-2xl mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              <p className="text-sm text-gray-600">승인됨</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <IconWrapper icon={FaCheckCircle} className="text-blue-500 text-2xl mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              <p className="text-sm text-gray-600">수강 완료</p>
            </div>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <IconWrapper
            icon={FaSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="수업명으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
          />
        </div>
        <div className="relative">
          <IconWrapper
            icon={FaFilter}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent bg-white"
          >
            <option value="all">전체 상태</option>
            <option value="pending">승인 대기</option>
            <option value="approved">승인됨</option>
            <option value="rejected">거절됨</option>
            <option value="completed">수강 완료</option>
          </select>
        </div>
      </div>

      {/* 수강신청 목록 */}
      {filteredApplications.length === 0 ? (
        <div className="text-center p-12">
          <IconWrapper icon={FaBook} className="text-gray-300 text-5xl mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm || statusFilter !== "all"
              ? "검색 결과가 없습니다"
              : "수강신청 내역이 없습니다"}
          </h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== "all"
              ? "다른 검색어나 필터를 사용해보세요."
              : "관심있는 수업에 수강신청을 해보세요!"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredApplications.map((application) => {
            const statusInfo = getStatusInfo(application.status);
            return (
              <div
                key={application.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* 수업 이미지 */}
                    <div className="flex-shrink-0">
                      <img
                        src={application.classes?.thumbnail_url || "/images/default-class.jpg"}
                        alt={application.classes?.title || "수업 이미지"}
                        className="w-full lg:w-32 h-32 object-cover rounded-lg"
                      />
                    </div>

                    {/* 수업 정보 */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {application.classes?.title || "수업 정보 없음"}
                          </h3>

                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <IconWrapper
                                icon={FaBook}
                                className="mr-2 text-[#FF7648]"
                                size={14}
                              />
                              <span>카테고리: {getCourseTypeName(application.course_type)}</span>
                            </div>
                            {application.classes?.instructor && (
                              <div className="flex items-center">
                                <IconWrapper
                                  icon={FaUser}
                                  className="mr-2 text-[#FF7648]"
                                  size={14}
                                />
                                <span>강사: {application.classes.instructor.display_name}</span>
                              </div>
                            )}
                            <div className="flex items-center">
                              <IconWrapper
                                icon={FaClock}
                                className="mr-2 text-[#FF7648]"
                                size={14}
                              />
                              <span>수업 시간: {application.classes?.duration || 0}분</span>
                            </div>
                            <div className="flex items-center">
                              <IconWrapper
                                icon={FaDollarSign}
                                className="mr-2 text-[#FF7648]"
                                size={14}
                              />
                              <span>수강료: {formatPrice(application.classes?.price || 0)}</span>
                            </div>
                            <div className="flex items-center">
                              <IconWrapper
                                icon={FaCalendarAlt}
                                className="mr-2 text-[#FF7648]"
                                size={14}
                              />
                              <span>신청일: {formatDate(application.created_at)}</span>
                            </div>
                          </div>

                          {application.special_requests && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <strong>특별 요청사항:</strong> {application.special_requests}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* 상태 배지 */}
                        <div className="flex-shrink-0">
                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                          >
                            <IconWrapper icon={statusInfo.icon} className="mr-1" size={12} />
                            {statusInfo.label}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyCourseApplications;
