import React, { useState } from "react";
import {
  FaPalette,
  FaCrown,
  FaEye,
  FaShoppingCart,
  FaHeart,
  FaShare,
  FaInfoCircle,
} from "react-icons/fa";
import IconWrapper from "../components/IconWrapper";

interface Artwork {
  id: string;
  title: string;
  artist: string;
  description: string;
  imageUrl: string;
  price: string;
  dimensions: string;
  medium: string;
  year: string;
  edition: string;
  isAvailable: boolean;
  features: string[];
  story: string;
}

const Exhibition: React.FC = () => {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "featured">("featured");

  // 더미 데이터 - 실제로는 API에서 가져올 것
  const artworks: Artwork[] = [
    {
      id: "masterpiece-001",
      title: "빛의 향연",
      artist: "URiWa Glass",
      description:
        "황혼의 빛이 스테인드글라스를 통해 만들어내는 환상적인 색채의 향연을 표현한 작품입니다.",
      imageUrl: "",
      price: "2,800,000원",
      dimensions: "80cm x 120cm",
      medium: "스테인드글라스, 납, 구리 호일",
      year: "2024",
      edition: "단 1점 한정",
      isAvailable: true,
      features: [
        "완전한 소유권 이전",
        "저작권 포함 판매",
        "작가 인증서 제공",
        "무료 설치 서비스",
        "평생 A/S 보장",
      ],
      story:
        "이 작품은 하루 중 가장 아름다운 순간인 황혼을 모티브로 제작되었습니다. 각기 다른 색온도의 유리를 통해 자연광이 만들어내는 그라데이션을 재현했으며, 보는 각도와 시간에 따라 다른 느낌을 주는 특별한 작품입니다.",
    },
    // 실제로는 더 많은 작품들이 있을 것
  ];

  const featuredArtwork = artworks[0];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8 lg:pl-16">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 헤더 섹션 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FF7648] rounded-full mb-4">
            <IconWrapper icon={FaPalette} className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">전시작품</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            특별한 가치를 지닌 한정판 작품들을 만나보세요. 각 작품은 단 1점만 제작되어 구매자에게
            완전한 소유권과 저작권을 함께 제공합니다.
          </p>
        </div>

        {/* 특별 안내 */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-6 mb-12">
          <div className="flex items-start">
            <IconWrapper
              icon={FaCrown}
              className="text-amber-500 text-2xl mr-4 mt-1 flex-shrink-0"
            />
            <div>
              <h3 className="text-lg font-bold text-amber-800 mb-2">한정 컬렉션의 특별함</h3>
              <p className="text-amber-700 mb-3">
                URiWa의 전시작품은 수상한 1작품만을 판매하여 구매의 가치를 극대화합니다. 구매자는
                작품의 완전한 소유권과 저작권을 획득하게 됩니다.
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center text-amber-600">
                  <IconWrapper icon={FaInfoCircle} className="mr-2" />
                  <span>전 세계 단 1점</span>
                </div>
                <div className="flex items-center text-amber-600">
                  <IconWrapper icon={FaInfoCircle} className="mr-2" />
                  <span>완전한 소유권 이전</span>
                </div>
                <div className="flex items-center text-amber-600">
                  <IconWrapper icon={FaInfoCircle} className="mr-2" />
                  <span>저작권 포함 판매</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 작품 전시 */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden mb-12">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* 작품 이미지 */}
            <div className="relative aspect-square lg:aspect-auto bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <IconWrapper icon={FaPalette} className="text-6xl text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-semibold">{featuredArtwork.title}</p>
                  <p className="text-gray-400">고화질 이미지 로딩 중...</p>
                </div>
              </div>

              {/* 작품 상태 뱃지 */}
              <div className="absolute top-4 left-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    featuredArtwork.isAvailable
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {featuredArtwork.isAvailable ? "판매 중" : "판매 완료"}
                </span>
              </div>

              {/* 작품 액션 버튼들 */}
              <div className="absolute top-4 right-4 space-y-2">
                <button className="block p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-lg transition-all">
                  <IconWrapper icon={FaEye} className="text-gray-600" />
                </button>
                <button className="block p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-lg transition-all">
                  <IconWrapper icon={FaHeart} className="text-gray-600" />
                </button>
                <button className="block p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-lg transition-all">
                  <IconWrapper icon={FaShare} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* 작품 정보 */}
            <div className="p-8 lg:p-12">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{featuredArtwork.title}</h2>
                <p className="text-lg text-gray-600">by {featuredArtwork.artist}</p>
              </div>

              <p className="text-gray-700 mb-8 leading-relaxed">{featuredArtwork.description}</p>

              {/* 작품 세부 정보 */}
              <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                <div>
                  <span className="text-gray-500">크기</span>
                  <p className="font-semibold text-gray-800">{featuredArtwork.dimensions}</p>
                </div>
                <div>
                  <span className="text-gray-500">재료</span>
                  <p className="font-semibold text-gray-800">{featuredArtwork.medium}</p>
                </div>
                <div>
                  <span className="text-gray-500">제작연도</span>
                  <p className="font-semibold text-gray-800">{featuredArtwork.year}</p>
                </div>
                <div>
                  <span className="text-gray-500">에디션</span>
                  <p className="font-semibold text-red-600">{featuredArtwork.edition}</p>
                </div>
              </div>

              {/* 특별 혜택 */}
              <div className="mb-8">
                <h4 className="font-bold text-gray-800 mb-4">구매 특전</h4>
                <div className="space-y-2">
                  {featuredArtwork.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-[#FF7648] rounded-full mr-3"></div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 가격 및 구매 버튼 */}
              <div className="border-t pt-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">작품 가격</p>
                    <p className="text-3xl font-bold text-[#FF7648]">{featuredArtwork.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">VAT 포함</p>
                    <p className="text-sm text-gray-500">무료 배송</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    className={`w-full py-4 rounded-lg font-bold text-lg transition-colors ${
                      featuredArtwork.isAvailable
                        ? "bg-[#FF7648] text-white hover:bg-[#E85A2A]"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={!featuredArtwork.isAvailable}
                  >
                    <IconWrapper icon={FaShoppingCart} className="inline mr-2" />
                    {featuredArtwork.isAvailable ? "구매 문의하기" : "판매 완료"}
                  </button>
                  <button className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    작품 상세 정보 보기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 작가의 말 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">작가의 말</h3>
          <div className="max-w-3xl mx-auto">
            <blockquote className="text-lg text-gray-700 italic leading-relaxed text-center">
              "{featuredArtwork.story}"
            </blockquote>
            <div className="text-center mt-6">
              <p className="text-gray-600 font-semibold">- {featuredArtwork.artist} -</p>
            </div>
          </div>
        </div>

        {/* 구매 절차 안내 */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">구매 절차</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">1</span>
              </div>
              <h4 className="font-bold text-gray-800 mb-2">작품 감상</h4>
              <p className="text-gray-600 text-sm">온라인 또는 직접 방문하여 작품을 감상합니다.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">2</span>
              </div>
              <h4 className="font-bold text-gray-800 mb-2">구매 상담</h4>
              <p className="text-gray-600 text-sm">
                작품에 대한 상세 설명과 구매 조건을 안내받습니다.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">3</span>
              </div>
              <h4 className="font-bold text-gray-800 mb-2">계약 체결</h4>
              <p className="text-gray-600 text-sm">소유권 및 저작권 이전 계약을 체결합니다.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">4</span>
              </div>
              <h4 className="font-bold text-gray-800 mb-2">작품 인도</h4>
              <p className="text-gray-600 text-sm">
                전문 포장과 안전한 배송으로 작품을 전달합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exhibition;
