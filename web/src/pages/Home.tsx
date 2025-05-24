import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Button from "../components/Button";
import ResponsiveContainer from "../styles/ResponsiveContainer";
import { useResponsive } from "../hooks/useResponsive";
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const { user, profile, loading, initialized, isLoggedIn } = useAuth();

  // 디버깅을 위한 콘솔 로그 추가
  console.log("Auth state:", { user, profile, loading, initialized, isLoggedIn });

  // isLoggedIn은 이제 AuthContext에서 가져옴
  console.log(`@@@ isLoggedIn : `, isLoggedIn);

  // 초기화가 완료되지 않았을 때만 로딩 화면 표시 (loading은 다른 작업 중에도 true가 될 수 있음)
  if (!initialized) {
    return (
      <Layout title="URIWA 모바일" showBackButton={false} noPadding={true}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-[#FF7648] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>화면을 불러오는 중입니다...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="URIWA 모바일" showBackButton={false} noPadding={true}>
      <ResponsiveContainer fluid={isMobile} padding="0" center className="bg-white">
        {/* 헤더 섹션 */}
        <div className="px-5 pt-6 pb-4">
          <h1 className={`text-[#3F414E] font-bold mb-2 ${isMobile ? "text-2xl" : "text-3xl"}`}>
            {isLoggedIn && profile?.full_name
              ? `환영합니다, ${profile.full_name}님!`
              : "환영합니다, URIWA"}
          </h1>
        </div>

        {/* 주요 기능 섹션 */}
        <div className="px-5 mb-6">
          <h2 className="text-[#3F414E] font-bold text-xl mb-4">주요 기능</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 문의 카드 */}
            <div
              className="rounded-[10px] overflow-hidden shadow-md cursor-pointer transition-transform hover:scale-[1.02]"
              onClick={() => navigate("/inquiry")}
            >
              <div className="h-[100px] bg-[#8E97FD] relative">
                <div className="absolute top-4 left-4">
                  <h3 className="text-white font-bold text-lg">문의하기</h3>
                  <p className="text-[#EBEAEC] text-xs">종합 상담 서비스</p>
                </div>
              </div>
              <div className="p-4 bg-white">
                <p className="text-[#3F414E] mb-2">
                  통합 문의 양식을 통해 다양한 문의를 접수하세요
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#A1A4B2]">3-10분 소요</span>
                  <Button
                    variant="outline"
                    size="small"
                    className="text-[#8E97FD] border-[#8E97FD]"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      navigate("/inquiry");
                    }}
                  >
                    바로가기
                  </Button>
                </div>
              </div>
            </div>

            {/* 예약 서비스 카드 */}
            <div
              className="rounded-[10px] overflow-hidden shadow-md cursor-pointer transition-transform hover:scale-[1.02]"
              onClick={() => navigate("/reservation/1")}
            >
              <div className="h-[100px] bg-[#333242] relative">
                <div className="absolute top-4 left-4">
                  <h3 className="text-white font-bold text-lg">예약 서비스</h3>
                  <p className="text-[#EBEAEC] text-xs">일정 예약</p>
                </div>
              </div>
              <div className="p-4 bg-white">
                <p className="text-[#3F414E] mb-2">원하는 날짜와 시간에 예약을 진행하세요</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#A1A4B2]">3-5분 소요</span>
                  <Button
                    variant="outline"
                    size="small"
                    className="text-[#333242] border-[#333242]"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      navigate("/reservation/1");
                    }}
                  >
                    바로가기
                  </Button>
                </div>
              </div>
            </div>

            {/* 내 정보 카드 */}
            <div
              className="rounded-[10px] overflow-hidden shadow-md cursor-pointer transition-transform hover:scale-[1.02]"
              onClick={() => navigate("/mypage")}
            >
              <div className="h-[100px] bg-[#FF7648] relative">
                <div className="absolute top-4 left-4">
                  <h3 className="text-white font-bold text-lg">내 정보</h3>
                  <p className="text-[#EBEAEC] text-xs">정보 관리</p>
                </div>
              </div>
              <div className="p-4 bg-white">
                <p className="text-[#3F414E] mb-2">내 계정 정보 및 활동 내역을 확인하세요</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#A1A4B2]">1-3분 소요</span>
                  <Button
                    variant="outline"
                    size="small"
                    className="text-[#FF7648] border-[#FF7648]"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      navigate("/mypage");
                    }}
                  >
                    바로가기
                  </Button>
                </div>
              </div>
            </div>

            {/* 창업과정 카드 */}
            <div
              className="rounded-[10px] overflow-hidden shadow-md cursor-pointer transition-transform hover:scale-[1.02]"
              onClick={() => navigate("/entrepreneurship")}
            >
              <div className="h-[100px] bg-[#FFC97E] relative">
                <div className="absolute top-4 left-4">
                  <h3 className="text-[#3F414E] font-bold text-lg">창업과정</h3>
                  <p className="text-[#524F53] text-xs">스테인드글라스 교육</p>
                </div>
              </div>
              <div className="p-4 bg-white">
                <p className="text-[#3F414E] mb-2">전문 스테인드글라스 창업과정을 확인하세요</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#A1A4B2]">상시 모집</span>
                  <Button
                    variant="outline"
                    size="small"
                    className="text-[#FFC97E] border-[#FFC97E]"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      navigate("/entrepreneurship");
                    }}
                  >
                    바로가기
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 빠른 시작 버튼 */}
        <div className="px-5 py-4 mb-6 bg-[#F5F6FA] rounded-lg mx-5">
          <h2 className="text-[#3F414E] font-bold text-lg mb-4">빠른 시작</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button className="bg-[#8E97FD] text-white w-full" onClick={() => navigate("/inquiry")}>
              문의하기
            </Button>
            <Button
              className="bg-[#FF7648] text-white w-full"
              onClick={() => navigate("/reservation/1")}
            >
              예약하기
            </Button>
          </div>
        </div>

        {/* 도움말 및 정보 */}
        <div className="px-5 mb-20">
          <h2 className="text-[#3F414E] font-bold text-xl mb-4">도움말 및 정보</h2>
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h3 className="text-[#3F414E] font-bold text-lg mb-2">이용 가이드</h3>
            <p className="text-[#3F414E] mb-3">URIWA 서비스 이용 방법을 확인하세요</p>
            <Button
              variant="outline"
              className="text-[#8E97FD] border-[#8E97FD] w-full"
              onClick={() => navigate("/guide")}
            >
              가이드 보기
            </Button>
          </div>
        </div>
      </ResponsiveContainer>
    </Layout>
  );
};

export default Home;
