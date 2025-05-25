import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaGraduationCap,
  FaUserGraduate,
  FaClock,
  FaUsers,
  FaCheckCircle,
  FaChevronRight,
  FaCalendarAlt,
  FaFire,
  FaCog,
  FaTimes,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import IconWrapper from "../components/IconWrapper";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../api/supabaseClient";

interface Course {
  id: string;
  title: string;
  level?: string;
  duration: string;
  sessions?: number;
  price: string;
  description: string;
  curriculum?: string[];
  prerequisites?: string;
  category?: string;
  max_participants?: number;
  instructor_name?: string;
  thumbnail_url?: string;
  image_urls?: string[];
  completion_works?: string;
  course_focus?: string;
  learning_objectives?: string;
  post_completion_path?: string;
  detailed_curriculum?: any;
}

const Entrepreneurship: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState<string>("스테인드글라스");
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Course | null>(null);
  const [applicationForm, setApplicationForm] = useState({
    name: "",
    email: "",
    phone: "",
    motivation: "",
    experience: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // 한국어 course_type을 영어로 매핑
  const courseTypeMapping: { [key: string]: string } = {
    스테인드글라스: "stained-glass",
    유리가마: "glass-kiln",
    창업과정: "entrepreneurship",
    체험과정: "experience",
    키즈클래스: "kids-class",
    특별과정: "special-course",
    워크샵: "workshop",
  };

  // 수업 데이터 로드
  useEffect(() => {
    fetchCourses();
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("classes")
        .select(
          `
          *,
          instructor:user_profiles!classes_instructor_id_fkey(display_name)
        `
        )
        .eq("category", selectedCourse)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) throw error;

      const coursesWithInstructor =
        data?.map((classItem) => ({
          id: classItem.id,
          title: classItem.title,
          duration: `${Math.floor(classItem.duration / 60)}시간 ${classItem.duration % 60}분`,
          price: `${classItem.price.toLocaleString()}원`,
          description: classItem.description || "",
          category: classItem.category,
          max_participants: classItem.max_participants,
          instructor_name: classItem.instructor?.display_name || "미정",
          curriculum: classItem.curriculum || [],
          level: "일반", // 기본값
          sessions: Math.ceil(classItem.duration / 120), // 2시간당 1세션으로 계산
          thumbnail_url: classItem.thumbnail_url,
          image_urls: classItem.image_urls,
          completion_works: classItem.completion_works,
          course_focus: classItem.course_focus,
          learning_objectives: classItem.learning_objectives,
          post_completion_path: classItem.post_completion_path,
          detailed_curriculum: classItem.detailed_curriculum,
        })) || [];

      setCourses(coursesWithInstructor);
    } catch (error) {
      console.error("수업 목록 로드 오류:", error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // 자세히 보기 모달 열기
  const handleViewDetails = (course: Course) => {
    setViewingCourse(course);
  };

  // 수강 신청 모달 열기
  const handleApplyForCourse = (course: Course) => {
    if (!user) {
      alert("수강 신청을 위해 로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    setSelectedApplication(course);
    setApplicationForm({
      name: profile?.display_name || "",
      email: user?.email || "",
      phone: profile?.phone || "",
      motivation: "",
      experience: "",
    });
    setShowApplicationModal(true);
  };

  // 수강 신청 제출
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedApplication || !user) return;

    try {
      setSubmitting(true);

      // 한국어 course_type을 영어로 매핑
      const mappedCourseType = courseTypeMapping[selectedCourse] || selectedCourse.toLowerCase();

      // course_applications 테이블에 신청 정보 저장
      const { error } = await supabase.from("course_applications").insert([
        {
          user_id: user.id,
          course_id: selectedApplication.id,
          course_title: selectedApplication.title,
          course_type: mappedCourseType,
          applicant_name: applicationForm.name,
          applicant_email: applicationForm.email,
          applicant_phone: applicationForm.phone,
          motivation: applicationForm.motivation,
          experience: applicationForm.experience,
          status: "pending",
        },
      ]);

      if (error) throw error;

      alert("수강 신청이 완료되었습니다!");
      setShowApplicationModal(false);
      setSelectedApplication(null);
      setApplicationForm({
        name: "",
        email: "",
        phone: "",
        motivation: "",
        experience: "",
      });
    } catch (error) {
      console.error("수강 신청 오류:", error);
      alert("수강 신청 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8 lg:pl-16">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 헤더 섹션 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FF7648] rounded-full mb-4">
            <IconWrapper icon={FaGraduationCap} className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">창업과정</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            체계적인 교육 과정을 통해 스테인드글라스 전문가로 성장하고, 나만의 공방을 창업할 수 있는
            실력을 기르세요.
          </p>
        </div>

        {/* 과정 선택 탭 */}
        <div className="mb-12">
          <div className="flex justify-center flex-wrap gap-2">
            <button
              onClick={() => setSelectedCourse("스테인드글라스")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                selectedCourse === "스테인드글라스"
                  ? "bg-[#FF7648] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <IconWrapper icon={FaGraduationCap} className="inline mr-2" />
              스테인드글라스
            </button>
            <button
              onClick={() => setSelectedCourse("유리가마")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                selectedCourse === "유리가마"
                  ? "bg-[#FF7648] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <IconWrapper icon={FaFire} className="inline mr-2" />
              유리가마
            </button>
            <button
              onClick={() => setSelectedCourse("창업과정")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                selectedCourse === "창업과정"
                  ? "bg-[#FF7648] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <IconWrapper icon={FaCog} className="inline mr-2" />
              창업과정
            </button>
            <button
              onClick={() => setSelectedCourse("체험과정")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                selectedCourse === "체험과정"
                  ? "bg-[#FF7648] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <IconWrapper icon={FaCheckCircle} className="inline mr-2" />
              체험과정
            </button>
            <button
              onClick={() => setSelectedCourse("키즈클래스")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                selectedCourse === "키즈클래스"
                  ? "bg-[#FF7648] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <IconWrapper icon={FaUsers} className="inline mr-2" />
              키즈클래스
            </button>
            <button
              onClick={() => setSelectedCourse("특별과정")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                selectedCourse === "특별과정"
                  ? "bg-[#FF7648] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <IconWrapper icon={FaCalendarAlt} className="inline mr-2" />
              특별과정
            </button>
            <button
              onClick={() => setSelectedCourse("워크샵")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                selectedCourse === "워크샵"
                  ? "bg-[#FF7648] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <IconWrapper icon={FaUserGraduate} className="inline mr-2" />
              워크샵
            </button>
          </div>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-[#FF7648] rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">수업 정보를 불러오는 중...</p>
          </div>
        )}

        {/* 빈 상태 */}
        {!loading && courses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">해당 카테고리의 수업이 없습니다.</p>
            <p className="text-gray-500 text-sm mt-2">
              관리자가 수업을 추가하면 여기에 표시됩니다.
            </p>
          </div>
        )}

        {/* 과정 로드맵 (과정이 있을 때만 표시) */}
        {!loading && courses.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
              {selectedCourse} 과정 안내
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-between">
              {courses.map((course, index) => (
                <React.Fragment key={course.id}>
                  <div className="text-center mb-6 md:mb-0">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-blue-100">
                      <span className="font-bold text-xl text-blue-600">{index + 1}</span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm">{course.duration}</p>
                  </div>
                  {index < courses.length - 1 && (
                    <IconWrapper
                      icon={FaChevronRight}
                      className="text-gray-400 text-2xl hidden md:block"
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* 과정 상세 정보 */}
        {!loading && courses.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* 썸네일 이미지 */}
                <div className="h-48 bg-gray-200 relative">
                  {course.image_urls && course.image_urls.length > 0 && course.image_urls[0] ? (
                    <div className="relative w-full h-full">
                      <img
                        src={course.image_urls[0]}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      {course.image_urls.length > 1 && (
                        <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          +{course.image_urls.length - 1}
                        </div>
                      )}
                    </div>
                  ) : course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FF7648] to-[#E85A2A]">
                      <IconWrapper icon={FaGraduationCap} className="text-white text-4xl" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-white bg-opacity-90 text-gray-800">
                      {course.level}
                    </span>
                  </div>
                </div>

                {/* 카드 내용 */}
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">{course.title}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#FF7648]">{course.price}</div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-6">{course.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center text-gray-700">
                      <IconWrapper icon={FaClock} className="text-[#FF7648] mr-2" />
                      <span className="text-sm">{course.duration}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <IconWrapper icon={FaUsers} className="text-[#FF7648] mr-2" />
                      <span className="text-sm">최대 {course.max_participants}명</span>
                    </div>
                  </div>

                  {course.instructor_name && (
                    <div className="mb-6">
                      <div className="flex items-center text-gray-700">
                        <IconWrapper icon={FaUserGraduate} className="text-[#FF7648] mr-2" />
                        <span className="text-sm">강사: {course.instructor_name}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApplyForCourse(course)}
                      className="flex-1 bg-[#FF7648] text-white py-3 rounded-lg hover:bg-[#E85A2A] transition-colors font-semibold"
                    >
                      수강 신청
                    </button>
                    <button
                      onClick={() => handleViewDetails(course)}
                      className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      자세히 보기
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 연습실 안내 */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white mb-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">예약제 연습실</h2>
              <p className="mb-6 opacity-90">
                수강생들을 위한 전용 연습실에서 개인 작업을 계속하세요. 전문 장비와 재료를
                제공합니다.
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <IconWrapper icon={FaClock} className="mr-3" />
                  <span>오전 9시 ~ 저녁 7시</span>
                </div>
                <div className="flex items-center">
                  <IconWrapper icon={FaUsers} className="mr-3" />
                  <span>수강 중: 월 5만원 / 휴강 중: 월 15만원</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <Link
                to="/practice-room-reservation"
                className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors flex-row flex items-center justify-center"
              >
                <IconWrapper icon={FaCalendarAlt} className="mr-2" />
                연습실 예약하기
              </Link>
            </div>
          </div>
        </div>

        {/* 창업 지원 정보 */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">창업 지원 프로그램</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconWrapper icon={FaUserGraduate} className="text-green-600 text-2xl" />
              </div>
              <h3 className="font-bold text-gray-800 mb-3">전문 기술 교육</h3>
              <p className="text-gray-600 text-sm">
                체계적인 커리큘럼을 통해 창업에 필요한 모든 기술을 습득합니다.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconWrapper icon={FaCog} className="text-blue-600 text-2xl" />
              </div>
              <h3 className="font-bold text-gray-800 mb-3">창업 실무 교육</h3>
              <p className="text-gray-600 text-sm">
                공방 운영, 마케팅, 고객 관리 등 창업에 필요한 실무를 배웁니다.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconWrapper icon={FaUsers} className="text-purple-600 text-2xl" />
              </div>
              <h3 className="font-bold text-gray-800 mb-3">네트워킹 지원</h3>
              <p className="text-gray-600 text-sm">
                동문 네트워크와 업계 전문가들과의 연결을 지원합니다.
              </p>
            </div>
          </div>
        </div>

        {/* 자세히 보기 모달 */}
        {viewingCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">{viewingCourse.title}</h2>
                  <button
                    onClick={() => setViewingCourse(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <IconWrapper icon={FaTimes} />
                  </button>
                </div>

                {/* 썸네일 이미지 */}
                <div className="mb-6">
                  <div className="h-64 bg-gray-200 rounded-lg relative overflow-hidden">
                    {viewingCourse.image_urls &&
                    viewingCourse.image_urls.length > 0 &&
                    viewingCourse.image_urls[0] ? (
                      <img
                        src={viewingCourse.image_urls[0]}
                        alt={viewingCourse.title}
                        className="w-full h-full object-cover"
                      />
                    ) : viewingCourse.thumbnail_url ? (
                      <img
                        src={viewingCourse.thumbnail_url}
                        alt={viewingCourse.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FF7648] to-[#E85A2A]">
                        <IconWrapper icon={FaGraduationCap} className="text-white text-5xl" />
                      </div>
                    )}
                  </div>

                  {/* 추가 이미지들 */}
                  {viewingCourse.image_urls && viewingCourse.image_urls.length > 1 && (
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {viewingCourse.image_urls.slice(1).map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`${viewingCourse.title} ${index + 2}`}
                          className="w-full h-20 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        viewingCourse.id === "selective"
                          ? "bg-purple-100 text-purple-600"
                          : viewingCourse.id === "glass-kiln"
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {viewingCourse.level}
                    </span>
                    <div className="text-3xl font-bold text-[#FF7648] mt-2">
                      {viewingCourse.price}
                    </div>
                  </div>

                  <p className="text-gray-600">{viewingCourse.description}</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-gray-700">
                      <IconWrapper icon={FaClock} className="text-[#FF7648] mr-2" />
                      <span>{viewingCourse.duration}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <IconWrapper icon={FaUsers} className="text-[#FF7648] mr-2" />
                      <span>
                        {viewingCourse.sessions === 999 ? "맞춤형" : `${viewingCourse.sessions}회`}
                      </span>
                    </div>
                  </div>

                  {viewingCourse.prerequisites && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <span className="text-yellow-800 text-sm font-semibold">선수조건: </span>
                      <span className="text-yellow-700 text-sm">{viewingCourse.prerequisites}</span>
                    </div>
                  )}

                  {/* 완성 작품 */}
                  {viewingCourse.completion_works && (
                    <div>
                      <h4 className="font-bold text-gray-800 mb-3">완성 작품 · 수강 포커스</h4>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-sm text-gray-700 whitespace-pre-line">
                          {viewingCourse.completion_works}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 수업목표 */}
                  {viewingCourse.learning_objectives && (
                    <div>
                      <h4 className="font-bold text-gray-800 mb-3">수업목표</h4>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="text-sm text-gray-700 whitespace-pre-line">
                          {viewingCourse.learning_objectives}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 이수 후 방향 */}
                  {viewingCourse.post_completion_path && (
                    <div>
                      <h4 className="font-bold text-gray-800 mb-3">이수 후 방향</h4>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="text-sm text-gray-700 whitespace-pre-line">
                          {viewingCourse.post_completion_path}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 상세 커리큘럼 (JSONB 데이터) */}
                  {viewingCourse.detailed_curriculum && (
                    <div>
                      <h4 className="font-bold text-gray-800 mb-3">상세 혜택</h4>
                      <div className="space-y-4">
                        {Object.entries(viewingCourse.detailed_curriculum).map(([key, value]) => (
                          <div key={key} className="bg-gray-50 rounded-lg p-4">
                            <h5 className="font-semibold text-gray-800 mb-2">{key}</h5>
                            {Array.isArray(value) ? (
                              <ul className="space-y-1">
                                {value.map((item, index) => (
                                  <li
                                    key={index}
                                    className="flex items-start text-gray-700 text-sm"
                                  >
                                    <IconWrapper
                                      icon={FaCheckCircle}
                                      className="text-green-500 mr-2 mt-0.5 flex-shrink-0"
                                      size={12}
                                    />
                                    <span>{String(item)}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-gray-700 text-sm">{String(value)}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 기본 커리큘럼 (기존 데이터가 있는 경우에만 표시) */}
                  {viewingCourse.curriculum && viewingCourse.curriculum.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-800 mb-3">기본 커리큘럼</h4>
                      <div className="space-y-3">
                        {viewingCourse.curriculum.map((item, index) => (
                          <div key={index} className="flex items-start text-gray-700">
                            <IconWrapper
                              icon={FaCheckCircle}
                              className="text-green-500 mr-3 mt-0.5 flex-shrink-0"
                            />
                            <div>
                              <span className="font-medium">{index + 1}주차: </span>
                              <span>{item}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setViewingCourse(null);
                        handleApplyForCourse(viewingCourse);
                      }}
                      className="flex-1 bg-[#FF7648] text-white py-3 rounded-lg hover:bg-[#E85A2A] transition-colors font-semibold"
                    >
                      수강 신청하기
                    </button>
                    <button
                      onClick={() => setViewingCourse(null)}
                      className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      닫기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 수강 신청 모달 */}
        {showApplicationModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">수강 신청</h2>
                  <button
                    onClick={() => setShowApplicationModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <IconWrapper icon={FaTimes} />
                  </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-bold text-gray-800">{selectedApplication.title}</h3>
                  <p className="text-gray-600 text-sm">{selectedApplication.description}</p>
                  <div className="text-[#FF7648] font-bold mt-2">{selectedApplication.price}</div>
                </div>

                <form onSubmit={handleSubmitApplication} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
                    <input
                      type="text"
                      required
                      value={applicationForm.name}
                      onChange={(e) =>
                        setApplicationForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">이메일 *</label>
                    <input
                      type="email"
                      required
                      value={applicationForm.email}
                      onChange={(e) =>
                        setApplicationForm((prev) => ({ ...prev, email: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">연락처 *</label>
                    <input
                      type="tel"
                      required
                      value={applicationForm.phone}
                      onChange={(e) =>
                        setApplicationForm((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                      placeholder="010-1234-5678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      수강 동기 *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={applicationForm.motivation}
                      onChange={(e) =>
                        setApplicationForm((prev) => ({ ...prev, motivation: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                      placeholder="수강을 희망하는 이유를 간단히 작성해주세요"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      관련 경험
                    </label>
                    <textarea
                      rows={3}
                      value={applicationForm.experience}
                      onChange={(e) =>
                        setApplicationForm((prev) => ({ ...prev, experience: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                      placeholder="스테인드글라스 또는 관련 분야 경험이 있다면 작성해주세요 (선택사항)"
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-yellow-800 text-sm">
                      <IconWrapper icon={FaPhone} className="inline mr-1" />
                      신청 후 2-3일 내로 연락드려 상세 일정을 안내해드립니다.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowApplicationModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-[#FF7648] text-white px-4 py-2 rounded-lg hover:bg-[#E85A2A] transition-colors disabled:opacity-50"
                    >
                      {submitting ? "신청 중..." : "신청하기"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Entrepreneurship;
