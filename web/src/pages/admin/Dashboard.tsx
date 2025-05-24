import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../api/supabaseClient";
import Layout from "../../components/Layout";
import {
  FaUsers,
  FaChalkboardTeacher,
  FaEnvelope,
  FaCalendarAlt,
  FaImages,
  FaPalette,
} from "react-icons/fa";
import IconWrapper from "../../components/IconWrapper";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        setIsLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth/login");
          return;
        }
        const { data: profileData } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (profileData && profileData.role === "admin") {
          setIsAdmin(true);
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    checkAdmin();
  }, [navigate]);

  if (isLoading) {
    return (
      <Layout title="관리자 대시보드">
        <div className="flex flex-col items-center justify-center p-16 text-center">
          <div className="inline-block w-10 h-10 border-4 border-gray-200 border-t-primary-main rounded-full animate-spin mb-5"></div>
          <p className="text-md text-text-secondary">권한 확인 중...</p>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const menuCardClasses =
    "flex items-center p-4 bg-background-paper rounded-md no-underline text-text-primary shadow-soft transition-all duration-300 ease-in-out hover:translate-y-[-2px] hover:shadow-medium";
  const iconContainerClasses =
    "flex items-center justify-center w-10 h-10 rounded-full bg-primary-light mr-4 text-primary-dark text-lg";

  return (
    <Layout title="관리자 대시보드">
      <div className="p-4">
        <h2 className="text-lg text-text-primary mb-4 pb-2 border-b border-border-light">
          시스템 관리
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/admin/users"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-l-4 border-blue-500"
          >
            <div className="flex items-center mb-4">
              <IconWrapper icon={FaUsers} className="text-2xl text-blue-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">사용자 관리</h3>
            </div>
            <p className="text-gray-600 text-sm">회원 정보, 권한, 멤버십 관리</p>
          </Link>

          <Link
            to="/admin/classes"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-l-4 border-green-500"
          >
            <div className="flex items-center mb-4">
              <IconWrapper icon={FaChalkboardTeacher} className="text-2xl text-green-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">클래스 관리</h3>
            </div>
            <p className="text-gray-600 text-sm">수업 정보, 강사, 일정 관리 (창업교육 포함)</p>
          </Link>

          <Link
            to="/admin/reservations"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-l-4 border-purple-500"
          >
            <div className="flex items-center mb-4">
              <IconWrapper icon={FaCalendarAlt} className="text-2xl text-purple-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">예약 관리</h3>
            </div>
            <p className="text-gray-600 text-sm">클래스 예약 현황 및 관리</p>
          </Link>

          <Link
            to="/admin/portfolio"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-l-4 border-indigo-500"
          >
            <div className="flex items-center mb-4">
              <IconWrapper icon={FaImages} className="text-2xl text-indigo-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">포트폴리오 관리</h3>
            </div>
            <p className="text-gray-600 text-sm">작업 사례 및 포트폴리오 관리</p>
          </Link>

          <Link
            to="/admin/exhibitions"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border-l-4 border-red-500"
          >
            <div className="flex items-center mb-4">
              <IconWrapper icon={FaPalette} className="text-2xl text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">전시작품 관리</h3>
            </div>
            <p className="text-gray-600 text-sm">한정판 전시작품 등록 및 판매 관리</p>
          </Link>
        </div>
        <h2 className="text-lg text-text-primary mt-6 mb-4 pb-2 border-b border-border-light">
          콘텐츠 관리
        </h2>
        <div className="flex flex-col gap-3 mb-6">
          <Link to="/admin/form-templates" className={menuCardClasses}>
            <div className={iconContainerClasses}>📝</div>
            <div className="flex-1">
              <h3 className="text-md mb-1">폼 템플릿 관리</h3>
              <p className="text-sm text-text-secondary">
                문의 폼과 같은 동적 폼 템플릿을 생성하고 관리합니다.
              </p>
            </div>
          </Link>

          <Link to="/admin/inquiries" className={menuCardClasses}>
            <div className={iconContainerClasses}>❓</div>
            <div className="flex-1">
              <h3 className="text-md mb-1">문의 관리</h3>
              <p className="text-sm text-text-secondary">사용자 문의를 확인하고 답변합니다.</p>
            </div>
          </Link>

          <Link to="/admin/reservation-management" className={menuCardClasses}>
            <div className={iconContainerClasses}>📅</div>
            <div className="flex-1">
              <h3 className="text-md mb-1">예약 관리</h3>
              <p className="text-sm text-text-secondary">사용자 예약을 확인하고 관리합니다.</p>
            </div>
          </Link>
        </div>

        <h2 className="text-lg text-text-primary mt-6 mb-4 pb-2 border-b border-border-light">
          취소 및 환불 관리
        </h2>
        <div className="flex flex-col gap-3 mb-6">
          <Link to="/admin/cancellation-manager" className={menuCardClasses}>
            <div className={iconContainerClasses}>❌</div>
            <div className="flex-1">
              <h3 className="text-md mb-1">취소 관리</h3>
              <p className="text-sm text-text-secondary">
                예약 취소 및 수업 취소를 처리하고, 환불 상태를 관리합니다.
              </p>
            </div>
          </Link>

          <Link to="/admin/cancellation-analytics" className={menuCardClasses}>
            <div className={iconContainerClasses}>📊</div>
            <div className="flex-1">
              <h3 className="text-md mb-1">취소 분석</h3>
              <p className="text-sm text-text-secondary">
                취소 패턴을 분석하고 취소율과 환불 금액을 모니터링합니다.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
