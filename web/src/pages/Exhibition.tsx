import React, { useState, useEffect } from "react";
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
import { supabase } from "../api/supabaseClient";

interface Artwork {
  id: string;
  title: string;
  artist: string;
  description: string;
  story: string;
  image_urls: string[];
  price: number;
  dimensions: string;
  medium: string;
  year: number;
  edition: string;
  is_available: boolean;
  features: string[];
}

const Exhibition: React.FC = () => {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "featured">("featured");
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  // 전시작품 데이터 가져오기
  const fetchArtworks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("exhibitions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setArtworks(data || []);
    } catch (error) {
      console.error("전시작품 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks();
  }, []);

  // 대표 작품 (첫 번째 작품 또는 기본값)
  const featuredArtwork =
    artworks.length > 0
      ? artworks[0]
      : {
          id: "placeholder",
          title: "등록된 작품이 없습니다",
          artist: "URiWa Glass",
          description: "관리자 페이지에서 첫 번째 전시작품을 등록해주세요.",
          story: "아직 등록된 전시작품이 없습니다. 관리자 페이지에서 작품을 추가해보세요.",
          image_urls: [],
          price: 0,
          dimensions: "미정",
          medium: "미정",
          year: new Date().getFullYear(),
          edition: "미정",
          is_available: false,
          features: [],
        };

  const formatPrice = (price: number) => {
    return price > 0 ? `${price.toLocaleString()}원` : "문의";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8 lg:pl-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7648] mx-auto mb-4"></div>
          <p className="text-gray-600">전시작품을 불러오는 중...</p>
        </div>
      </div>
    );
  }

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

        {artworks.length === 0 ? (
          // 등록된 작품이 없을 때
          <div className="bg-white rounded-lg shadow-xl p-12 text-center">
            <IconWrapper icon={FaPalette} className="text-6xl text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">등록된 전시작품이 없습니다</h2>
            <p className="text-gray-600 mb-8">관리자 페이지에서 첫 번째 전시작품을 등록해보세요.</p>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-2">전시작품 등록 방법</h3>
              <ol className="text-sm text-gray-600 text-left max-w-md mx-auto space-y-2">
                <li>1. 관리자로 로그인</li>
                <li>2. 관리자 대시보드 접속</li>
                <li>3. "전시작품 관리" 메뉴 클릭</li>
                <li>4. "새 전시작품 추가" 버튼 클릭</li>
                <li>5. 작품 정보 입력 후 저장</li>
              </ol>
            </div>
          </div>
        ) : (
          <>
            {/* 메인 작품 전시 */}
            <div className="bg-white rounded-lg shadow-xl overflow-hidden mb-12">
              <div className="grid lg:grid-cols-2 gap-0">
                {/* 작품 이미지 */}
                <div className="relative aspect-square lg:aspect-auto bg-gradient-to-br from-gray-100 to-gray-200">
                  {featuredArtwork.image_urls.length > 0 && featuredArtwork.image_urls[0] ? (
                    <img
                      src={featuredArtwork.image_urls[0]}
                      alt={featuredArtwork.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-8">
                        <IconWrapper
                          icon={FaPalette}
                          className="text-6xl text-gray-400 mx-auto mb-4"
                        />
                        <p className="text-gray-500 text-lg font-semibold">
                          {featuredArtwork.title}
                        </p>
                        <p className="text-gray-400">이미지가 등록되지 않았습니다</p>
                      </div>
                    </div>
                  )}

                  {/* 작품 상태 뱃지 */}
                  <div className="absolute top-4 left-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        featuredArtwork.is_available
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {featuredArtwork.is_available ? "판매 중" : "판매 완료"}
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
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                      {featuredArtwork.title}
                    </h2>
                    <p className="text-lg text-gray-600">by {featuredArtwork.artist}</p>
                  </div>

                  <p className="text-gray-700 mb-8 leading-relaxed">
                    {featuredArtwork.description}
                  </p>

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
                      <p className="font-semibold text-gray-800">{featuredArtwork.year}년</p>
                    </div>
                    <div>
                      <span className="text-gray-500">에디션</span>
                      <p className="font-semibold text-red-600">{featuredArtwork.edition}</p>
                    </div>
                  </div>

                  {/* 특별 혜택 */}
                  {featuredArtwork.features && featuredArtwork.features.length > 0 && (
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
                  )}

                  {/* 가격 및 구매 버튼 */}
                  <div className="border-t pt-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">작품 가격</p>
                        <p className="text-3xl font-bold text-[#FF7648]">
                          {formatPrice(featuredArtwork.price)}
                        </p>
                      </div>
                      {featuredArtwork.price > 0 && (
                        <div className="text-right">
                          <p className="text-sm text-gray-500">VAT 포함</p>
                          <p className="text-sm text-gray-500">무료 배송</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <button
                        className={`w-full py-4 rounded-lg font-bold text-lg transition-colors ${
                          featuredArtwork.is_available && featuredArtwork.price > 0
                            ? "bg-[#FF7648] text-white hover:bg-[#E85A2A]"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        disabled={!featuredArtwork.is_available || featuredArtwork.price === 0}
                      >
                        <IconWrapper icon={FaShoppingCart} className="inline mr-2" />
                        {featuredArtwork.is_available
                          ? featuredArtwork.price > 0
                            ? "구매 문의하기"
                            : "가격 문의"
                          : "판매 완료"}
                      </button>
                      <button
                        onClick={() => setSelectedArtwork(featuredArtwork)}
                        className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
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

            {/* 다른 작품들 (2개 이상일 때) */}
            {artworks.length > 1 && (
              <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
                <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">다른 전시작품</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {artworks.slice(1).map((artwork) => (
                    <div
                      key={artwork.id}
                      className="group cursor-pointer"
                      onClick={() => setSelectedArtwork(artwork)}
                    >
                      <div className="bg-gray-100 aspect-square rounded-lg overflow-hidden mb-4 group-hover:shadow-lg transition-shadow">
                        {artwork.image_urls.length > 0 && artwork.image_urls[0] ? (
                          <img
                            src={artwork.image_urls[0]}
                            alt={artwork.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <IconWrapper icon={FaPalette} className="text-4xl text-gray-400" />
                          </div>
                        )}
                      </div>
                      <h4 className="font-bold text-gray-800 mb-1">{artwork.title}</h4>
                      <p className="text-gray-600 text-sm mb-2">by {artwork.artist}</p>
                      <p className="font-bold text-[#FF7648]">{formatPrice(artwork.price)}</p>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${
                          artwork.is_available
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {artwork.is_available ? "판매 중" : "판매 완료"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

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

        {/* 작품 상세 모달 */}
        {selectedArtwork && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">{selectedArtwork.title}</h2>
                  <button
                    onClick={() => setSelectedArtwork(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    {selectedArtwork.image_urls.length > 0 && selectedArtwork.image_urls[0] ? (
                      <img
                        src={selectedArtwork.image_urls[0]}
                        alt={selectedArtwork.title}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                        <IconWrapper icon={FaPalette} className="text-4xl text-gray-400" />
                      </div>
                    )}

                    {selectedArtwork.image_urls.length > 1 && (
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        {selectedArtwork.image_urls.slice(1).map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`${selectedArtwork.title} ${index + 2}`}
                            className="w-full h-20 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-800">작가</h3>
                      <p className="text-gray-600">{selectedArtwork.artist}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-800">가격</h3>
                      <p className="text-2xl font-bold text-[#FF7648]">
                        {formatPrice(selectedArtwork.price)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-800">크기</h3>
                        <p className="text-gray-600">{selectedArtwork.dimensions}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">제작연도</h3>
                        <p className="text-gray-600">{selectedArtwork.year}년</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-800">재료</h3>
                      <p className="text-gray-600">{selectedArtwork.medium}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-800">에디션</h3>
                      <p className="text-red-600 font-semibold">{selectedArtwork.edition}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-800">판매 상태</h3>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          selectedArtwork.is_available
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedArtwork.is_available ? "판매 중" : "판매 완료"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">작품 설명</h3>
                    <p className="text-gray-600 leading-relaxed">{selectedArtwork.description}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">작가의 말</h3>
                    <blockquote className="text-gray-600 italic leading-relaxed">
                      "{selectedArtwork.story}"
                    </blockquote>
                  </div>

                  {selectedArtwork.features && selectedArtwork.features.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">구매 특전</h3>
                      <ul className="space-y-2">
                        {selectedArtwork.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-gray-600">
                            <div className="w-2 h-2 bg-[#FF7648] rounded-full mr-3"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-6">
                  <button
                    className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                      selectedArtwork.is_available && selectedArtwork.price > 0
                        ? "bg-[#FF7648] text-white hover:bg-[#E85A2A]"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={!selectedArtwork.is_available || selectedArtwork.price === 0}
                  >
                    {selectedArtwork.is_available
                      ? selectedArtwork.price > 0
                        ? "구매 문의하기"
                        : "가격 문의"
                      : "판매 완료"}
                  </button>
                  <button
                    onClick={() => setSelectedArtwork(null)}
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

export default Exhibition;
