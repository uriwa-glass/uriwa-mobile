import React from "react";
import { Link } from "react-router-dom";
import { FaHammer, FaLightbulb, FaTools, FaEnvelope } from "react-icons/fa";
import IconWrapper from "../components/IconWrapper";

const CustomOrder: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8 lg:pl-16">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 헤더 섹션 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FF7648] rounded-full mb-4">
            <IconWrapper icon={FaHammer} className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">주문제작</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            커뮤니케이션을 통해 고객님만의 특별한 작품을 제작해드립니다. 기획부터 완성까지 함께하는
            맞춤 제작 서비스입니다.
          </p>
        </div>

        {/* 서비스 유형 */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* 기획 디자인 */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <IconWrapper icon={FaLightbulb} className="text-blue-600 text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">기획 디자인</h2>
            </div>
            <p className="text-gray-600 mb-6">
              고객님의 아이디어와 요구사항을 바탕으로 처음부터 기획하여 완전히 새로운 디자인의
              작품을 제작합니다.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-[#FF7648] rounded-full mr-3"></span>
                개념 설계부터 최종 완성까지
              </li>
              <li className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-[#FF7648] rounded-full mr-3"></span>
                고객 맞춤형 디자인 컨설팅
              </li>
              <li className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-[#FF7648] rounded-full mr-3"></span>
                3D 모델링 및 도면 제공
              </li>
              <li className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-[#FF7648] rounded-full mr-3"></span>
                단계별 제작 과정 공유
              </li>
            </ul>
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
              기획 디자인 문의하기
            </button>
          </div>

          {/* 단순 디자인 */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <IconWrapper icon={FaTools} className="text-green-600 text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">단순 디자인</h2>
            </div>
            <p className="text-gray-600 mb-6">
              기존 디자인을 기반으로 하거나 간단한 수정을 통해 빠르고 효율적으로 작품을 제작합니다.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-[#FF7648] rounded-full mr-3"></span>
                기존 템플릿 활용 제작
              </li>
              <li className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-[#FF7648] rounded-full mr-3"></span>
                간단한 색상/패턴 변경
              </li>
              <li className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-[#FF7648] rounded-full mr-3"></span>
                빠른 제작 및 납기
              </li>
              <li className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-[#FF7648] rounded-full mr-3"></span>
                합리적인 가격
              </li>
            </ul>
            <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors">
              단순 디자인 문의하기
            </button>
          </div>
        </div>

        {/* 제작 과정 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">제작 과정</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FF7648] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">상담 및 기획</h3>
              <p className="text-gray-600 text-sm">고객 요구사항 파악 및 디자인 기획</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FF7648] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">디자인 확정</h3>
              <p className="text-gray-600 text-sm">도면 제작 및 최종 디자인 승인</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FF7648] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">제작 진행</h3>
              <p className="text-gray-600 text-sm">전문 장인의 세심한 수작업 제작</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FF7648] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">4</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">완성 및 전달</h3>
              <p className="text-gray-600 text-sm">품질 검수 후 안전한 포장 배송</p>
            </div>
          </div>
        </div>

        {/* 포트폴리오 섹션 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">제작 사례</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div key={index} className="relative group overflow-hidden rounded-lg">
                <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-gray-500">사례 {index}</span>
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                  <button className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 px-4 py-2 rounded-lg transition-opacity">
                    자세히 보기
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 문의하기 섹션 */}
        <div className="bg-gradient-to-r from-[#FF7648] to-[#E85A2A] rounded-lg p-8 text-center text-white">
          <IconWrapper icon={FaEnvelope} className="text-4xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">주문제작 문의하기</h2>
          <p className="mb-6 opacity-90">
            고객님의 특별한 작품을 함께 만들어가겠습니다. 언제든 편하게 문의해주세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link
              to="/inquiry"
              className="bg-white text-[#FF7648] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              온라인 문의
            </Link>
            <a
              href="tel:010-2282-3007"
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#FF7648] transition-colors"
            >
              전화 문의
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomOrder;
