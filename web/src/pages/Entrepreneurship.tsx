import React, { useState } from "react";
import { Link } from "react-router-dom";
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
} from "react-icons/fa";
import IconWrapper from "../components/IconWrapper";

interface Course {
  id: string;
  title: string;
  level: string;
  duration: string;
  sessions: number;
  price: string;
  description: string;
  curriculum: string[];
  prerequisites?: string;
}

const Entrepreneurship: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<string>("stained-glass");

  const stainedGlassCourses: Course[] = [
    {
      id: "beginner",
      title: "초급과정",
      level: "초급",
      duration: "4주",
      sessions: 8,
      price: "280,000원",
      description:
        "스테인드글라스의 기초를 배우는 입문 과정입니다. 유리 커팅부터 기본 기법까지 체계적으로 학습합니다.",
      curriculum: [
        "스테인드글라스 역사 및 이론",
        "유리의 종류와 특성 이해",
        "기본 도구 사용법",
        "유리 커팅 기초 기법",
        "납땜 기초 실습",
        "간단한 패널 제작",
        "마감 및 클리닝",
        "작품 완성 및 평가",
      ],
    },
    {
      id: "intermediate",
      title: "중급과정",
      level: "중급",
      duration: "6주",
      sessions: 12,
      price: "420,000원",
      description:
        "초급 과정을 수료한 학습자를 위한 심화 과정입니다. 복잡한 패턴과 고급 기법을 익힙니다.",
      curriculum: [
        "복잡한 패턴 디자인",
        "고급 커팅 기법",
        "솔더링 심화 과정",
        "리드라인 활용법",
        "색상 조합 이론",
        "중급 작품 제작",
        "문제 해결 및 수정 기법",
        "포트폴리오 구성",
      ],
      prerequisites: "초급과정 수료",
    },
    {
      id: "advanced",
      title: "고급과정",
      level: "고급",
      duration: "8주",
      sessions: 16,
      price: "560,000원",
      description: "전문 작가 수준의 고급 기법과 창작 능력을 기르는 과정입니다.",
      curriculum: [
        "고급 디자인 개발",
        "3D 패널 제작",
        "페인팅 기법",
        "에칭 및 샌드블라스팅",
        "대형 작품 제작 기법",
        "상업적 작품 제작",
        "갤러리 전시 준비",
        "창업 실무 교육",
      ],
      prerequisites: "중급과정 수료",
    },
    {
      id: "selective",
      title: "선택과정",
      level: "선택",
      duration: "유동적",
      sessions: 999,
      price: "별도 상담",
      description: "개인의 관심사와 목표에 따라 맞춤형으로 구성되는 특별 과정입니다.",
      curriculum: [
        "개인 프로젝트 지도",
        "특수 기법 집중 교육",
        "작품 판매 전략",
        "갤러리 운영 실무",
        "해외 기법 도입",
        "협업 프로젝트 참여",
        "마스터클래스 참석",
        "개인 전시회 준비",
      ],
      prerequisites: "고급과정 수료 또는 동등 수준",
    },
  ];

  const glassKilnCourse: Course = {
    id: "glass-kiln",
    title: "유리가마 8주 과정",
    level: "전문",
    duration: "8주",
    sessions: 16,
    price: "650,000원",
    description: "유리가마를 활용한 전문적인 유리공예 기법을 배우는 집중 과정입니다.",
    curriculum: [
      "가마의 종류와 특성",
      "온도 제어 및 스케줄링",
      "슬럼핑 기법",
      "퓨징 기법",
      "캐스팅 기법",
      "몰드 제작 및 활용",
      "색유리 활용법",
      "안전 관리 및 작품 완성",
    ],
  };

  const allCourses = selectedCourse === "stained-glass" ? stainedGlassCourses : [glassKilnCourse];

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
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-lg p-2 shadow-lg">
            <button
              onClick={() => setSelectedCourse("stained-glass")}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                selectedCourse === "stained-glass"
                  ? "bg-[#FF7648] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <IconWrapper icon={FaUserGraduate} className="inline mr-2" />
              스테인드글라스
            </button>
            <button
              onClick={() => setSelectedCourse("glass-kiln")}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                selectedCourse === "glass-kiln"
                  ? "bg-[#FF7648] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <IconWrapper icon={FaFire} className="inline mr-2" />
              유리가마
            </button>
          </div>
        </div>

        {/* 과정 로드맵 (스테인드글라스만) */}
        {selectedCourse === "stained-glass" && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
              스테인드글라스 과정 로드맵
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-between">
              {stainedGlassCourses.map((course, index) => (
                <React.Fragment key={course.id}>
                  <div className="text-center mb-6 md:mb-0">
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                        course.id === "selective" ? "bg-purple-100" : "bg-blue-100"
                      }`}
                    >
                      <span
                        className={`font-bold text-xl ${
                          course.id === "selective" ? "text-purple-600" : "text-blue-600"
                        }`}
                      >
                        {index + 1}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm">{course.duration}</p>
                  </div>
                  {index < stainedGlassCourses.length - 1 && (
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
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {allCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{course.title}</h3>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      course.id === "selective"
                        ? "bg-purple-100 text-purple-600"
                        : course.id === "glass-kiln"
                        ? "bg-red-100 text-red-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {course.level}
                  </span>
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
                  <span className="text-sm">
                    {course.sessions === 999 ? "맞춤형" : `${course.sessions}회`}
                  </span>
                </div>
              </div>

              {course.prerequisites && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                  <span className="text-yellow-800 text-sm font-semibold">선수조건: </span>
                  <span className="text-yellow-700 text-sm">{course.prerequisites}</span>
                </div>
              )}

              <div className="mb-6">
                <h4 className="font-bold text-gray-800 mb-3">커리큘럼</h4>
                <div className="space-y-2">
                  {course.curriculum.slice(0, 4).map((item, index) => (
                    <div key={index} className="flex items-center text-gray-700 text-sm">
                      <IconWrapper
                        icon={FaCheckCircle}
                        className="text-green-500 mr-2 flex-shrink-0"
                      />
                      <span>{item}</span>
                    </div>
                  ))}
                  {course.curriculum.length > 4 && (
                    <div className="text-gray-500 text-sm pl-6">
                      외 {course.curriculum.length - 4}개 과정...
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-[#FF7648] text-white py-3 rounded-lg hover:bg-[#E85A2A] transition-colors font-semibold">
                  수강 신청
                </button>
                <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  자세히 보기
                </button>
              </div>
            </div>
          ))}
        </div>

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
                className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors"
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
      </div>
    </div>
  );
};

export default Entrepreneurship;
