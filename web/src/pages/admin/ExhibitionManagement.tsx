import React, { useState, useEffect } from "react";
import {
  FaPalette,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaImage,
  FaCrown,
  FaCheck,
  FaTimes,
  FaSearch,
  FaFilter,
  FaDollarSign,
  FaCalendar,
  FaRuler,
  FaGem,
} from "react-icons/fa";
import IconWrapper from "../../components/IconWrapper";
import ImageUpload from "../../components/ImageUpload";
import { supabase } from "../../api/supabaseClient";

interface Exhibition {
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
  created_at: string;
  updated_at: string;
}

interface FormData {
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

const ExhibitionManagement: React.FC = () => {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingExhibition, setEditingExhibition] = useState<Exhibition | null>(null);
  const [viewingExhibition, setViewingExhibition] = useState<Exhibition | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "available" | "sold">("all");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    artist: "",
    description: "",
    story: "",
    image_urls: [""],
    price: 0,
    dimensions: "",
    medium: "",
    year: new Date().getFullYear(),
    edition: "",
    is_available: true,
    features: [""],
  });

  // 전시작품 목록 조회
  const fetchExhibitions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("exhibitions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setExhibitions(data || []);
    } catch (error) {
      console.error("전시작품 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExhibitions();
  }, []);

  // 통계 계산
  const stats = {
    total: exhibitions.length,
    available: exhibitions.filter((e) => e.is_available).length,
    sold: exhibitions.filter((e) => !e.is_available).length,
    totalValue: exhibitions.reduce((sum, e) => sum + e.price, 0),
  };

  // 필터링된 전시작품
  const filteredExhibitions = exhibitions.filter((exhibition) => {
    const matchesSearch =
      exhibition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exhibition.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exhibition.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "available" && exhibition.is_available) ||
      (filterStatus === "sold" && !exhibition.is_available);

    return matchesSearch && matchesFilter;
  });

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      title: "",
      artist: "",
      description: "",
      story: "",
      image_urls: [""],
      price: 0,
      dimensions: "",
      medium: "",
      year: new Date().getFullYear(),
      edition: "",
      is_available: true,
      features: [""],
    });
    setEditingExhibition(null);
  };

  // 새 전시작품 추가/수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      // 빈 값 제거
      const cleanedData = {
        ...formData,
        image_urls: formData.image_urls.filter((url) => url.trim() !== ""),
        features: formData.features.filter((feature) => feature.trim() !== ""),
      };

      if (editingExhibition) {
        // 수정
        const { error } = await supabase
          .from("exhibitions")
          .update(cleanedData)
          .eq("id", editingExhibition.id);

        if (error) throw error;
        alert("전시작품이 수정되었습니다.");
      } else {
        // 추가
        const { error } = await supabase.from("exhibitions").insert([cleanedData]);

        if (error) throw error;
        alert("새 전시작품이 추가되었습니다.");
      }

      setShowModal(false);
      resetForm();
      fetchExhibitions();
    } catch (error) {
      console.error("전시작품 저장 실패:", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  // 전시작품 삭제
  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`"${title}" 전시작품을 삭제하시겠습니까?`)) return;

    try {
      const { error } = await supabase.from("exhibitions").delete().eq("id", id);

      if (error) throw error;

      alert("전시작품이 삭제되었습니다.");
      fetchExhibitions();
    } catch (error) {
      console.error("전시작품 삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // 판매 상태 토글
  const toggleAvailability = async (exhibition: Exhibition) => {
    try {
      const { error } = await supabase
        .from("exhibitions")
        .update({ is_available: !exhibition.is_available })
        .eq("id", exhibition.id);

      if (error) throw error;

      fetchExhibitions();
    } catch (error) {
      console.error("상태 변경 실패:", error);
      alert("상태 변경 중 오류가 발생했습니다.");
    }
  };

  // 수정 모달 열기
  const openEditModal = (exhibition: Exhibition) => {
    setEditingExhibition(exhibition);
    setFormData({
      title: exhibition.title,
      artist: exhibition.artist,
      description: exhibition.description,
      story: exhibition.story,
      image_urls: exhibition.image_urls.length > 0 ? exhibition.image_urls : [""],
      price: exhibition.price,
      dimensions: exhibition.dimensions,
      medium: exhibition.medium,
      year: exhibition.year,
      edition: exhibition.edition,
      is_available: exhibition.is_available,
      features: exhibition.features.length > 0 ? exhibition.features : [""],
    });
    setShowModal(true);
  };

  // 배열 필드 핸들러
  const handleArrayFieldChange = (
    field: "image_urls" | "features",
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayField = (field: "image_urls" | "features") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayField = (field: "image_urls" | "features", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">전시작품 관리</h1>
          <p className="text-gray-600">한정판 전시작품을 관리하고 판매 상태를 추적하세요</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-[#FF7648] hover:bg-[#E85A2A] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          <IconWrapper icon={FaPlus} className="mr-2" />새 전시작품 추가
        </button>
      </div>

      {/* 통계 대시보드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 작품 수</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <IconWrapper icon={FaPalette} className="text-3xl text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">판매 가능</p>
              <p className="text-2xl font-bold text-green-600">{stats.available}</p>
            </div>
            <IconWrapper icon={FaCheck} className="text-3xl text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">판매 완료</p>
              <p className="text-2xl font-bold text-red-600">{stats.sold}</p>
            </div>
            <IconWrapper icon={FaCrown} className="text-3xl text-red-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 작품 가치</p>
              <p className="text-2xl font-bold text-[#FF7648]">
                {stats.totalValue.toLocaleString()}원
              </p>
            </div>
            <IconWrapper icon={FaDollarSign} className="text-3xl text-[#FF7648]" />
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <IconWrapper icon={FaSearch} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="작품명, 작가명, 설명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "all" | "available" | "sold")}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
          >
            <option value="all">모든 작품</option>
            <option value="available">판매 가능</option>
            <option value="sold">판매 완료</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            <IconWrapper icon={FaFilter} className="mr-2" />
            {filteredExhibitions.length}개 작품 표시 중
          </div>
        </div>
      </div>

      {/* 전시작품 목록 */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7648] mx-auto"></div>
            <p className="mt-4 text-gray-600">전시작품을 불러오는 중...</p>
          </div>
        ) : filteredExhibitions.length === 0 ? (
          <div className="text-center py-12">
            <IconWrapper icon={FaPalette} className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm || filterStatus !== "all"
                ? "검색 결과가 없습니다"
                : "등록된 전시작품이 없습니다"}
            </h3>
            <p className="text-gray-500">첫 번째 전시작품을 추가해보세요.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작품 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작가/연도
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가격
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExhibitions.map((exhibition) => (
                  <tr key={exhibition.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-16">
                          {exhibition.image_urls[0] ? (
                            <img
                              className="h-16 w-16 rounded-lg object-cover"
                              src={exhibition.image_urls[0]}
                              alt={exhibition.title}
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                              <IconWrapper icon={FaImage} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {exhibition.title}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {exhibition.description}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {exhibition.dimensions} | {exhibition.medium}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{exhibition.artist}</div>
                      <div className="text-sm text-gray-500">{exhibition.year}년</div>
                      <div className="text-xs text-gray-400">{exhibition.edition}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-[#FF7648]">
                        {exhibition.price.toLocaleString()}원
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleAvailability(exhibition)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          exhibition.is_available
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {exhibition.is_available ? (
                          <>
                            <IconWrapper icon={FaCheck} className="mr-1" />
                            판매 중
                          </>
                        ) : (
                          <>
                            <IconWrapper icon={FaTimes} className="mr-1" />
                            판매 완료
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setViewingExhibition(exhibition);
                          setShowDetailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="상세보기"
                      >
                        <IconWrapper icon={FaEye} />
                      </button>
                      <button
                        onClick={() => openEditModal(exhibition)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        title="수정"
                      >
                        <IconWrapper icon={FaEdit} />
                      </button>
                      <button
                        onClick={() => handleDelete(exhibition.id, exhibition.title)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="삭제"
                      >
                        <IconWrapper icon={FaTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 추가/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingExhibition ? "전시작품 수정" : "새 전시작품 추가"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <IconWrapper icon={FaTimes} className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 기본 정보 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">작품명 *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">작가명 *</label>
                    <input
                      type="text"
                      required
                      value={formData.artist}
                      onChange={(e) => setFormData((prev) => ({ ...prev, artist: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      가격 (원) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      제작연도 *
                    </label>
                    <input
                      type="number"
                      required
                      min="1900"
                      max={new Date().getFullYear()}
                      value={formData.year}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, year: Number(e.target.value) }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">크기 *</label>
                    <input
                      type="text"
                      required
                      value={formData.dimensions}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, dimensions: e.target.value }))
                      }
                      placeholder="예: 80cm x 120cm"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">재료 *</label>
                    <input
                      type="text"
                      required
                      value={formData.medium}
                      onChange={(e) => setFormData((prev) => ({ ...prev, medium: e.target.value }))}
                      placeholder="예: 스테인드글라스, 납, 구리 호일"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">에디션 *</label>
                    <input
                      type="text"
                      required
                      value={formData.edition}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, edition: e.target.value }))
                      }
                      placeholder="예: 단 1점 한정"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      판매 상태
                    </label>
                    <select
                      value={formData.is_available ? "true" : "false"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_available: e.target.value === "true",
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                    >
                      <option value="true">판매 중</option>
                      <option value="false">판매 완료</option>
                    </select>
                  </div>
                </div>

                {/* 설명 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    작품 설명 *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                    placeholder="작품에 대한 간단한 설명을 입력하세요"
                  />
                </div>

                {/* 작가의 말 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    작가의 말 *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.story}
                    onChange={(e) => setFormData((prev) => ({ ...prev, story: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                    placeholder="작품에 대한 작가의 생각이나 제작 배경을 입력하세요"
                  />
                </div>

                {/* 작품 이미지들 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    작품 이미지
                  </label>
                  {formData.image_urls.map((url, index) => (
                    <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          이미지 {index + 1}
                        </span>
                        {formData.image_urls.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayField("image_urls", index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <IconWrapper icon={FaTimes} />
                          </button>
                        )}
                      </div>
                      <ImageUpload
                        bucketName="exhibition-images"
                        currentImageUrl={url || undefined}
                        onImageUploaded={(newUrl: string) =>
                          handleArrayFieldChange("image_urls", index, newUrl)
                        }
                        onImageRemoved={() => handleArrayFieldChange("image_urls", index, "")}
                        maxWidth={1200}
                        maxHeight={800}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField("image_urls")}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-[#FF7648] hover:text-[#E85A2A] hover:border-[#FF7648] transition-colors"
                  >
                    + 이미지 추가
                  </button>
                </div>

                {/* 구매 특전 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">구매 특전</label>
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleArrayFieldChange("features", index, e.target.value)}
                        placeholder="예: 완전한 소유권 이전"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                      />
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField("features", index)}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          <IconWrapper icon={FaTimes} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField("features")}
                    className="text-[#FF7648] hover:text-[#E85A2A] text-sm"
                  >
                    + 특전 추가
                  </button>
                </div>

                {/* 버튼 */}
                <div className="flex gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-[#FF7648] text-white px-4 py-2 rounded-lg hover:bg-[#E85A2A] transition-colors disabled:opacity-50"
                  >
                    {submitting ? "저장 중..." : editingExhibition ? "수정하기" : "추가하기"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 상세보기 모달 */}
      {showDetailModal && viewingExhibition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{viewingExhibition.title}</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <IconWrapper icon={FaTimes} className="text-xl" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  {viewingExhibition.image_urls[0] ? (
                    <img
                      src={viewingExhibition.image_urls[0]}
                      alt={viewingExhibition.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                      <IconWrapper icon={FaImage} className="text-4xl text-gray-400" />
                    </div>
                  )}

                  {viewingExhibition.image_urls.length > 1 && (
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {viewingExhibition.image_urls.slice(1).map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`${viewingExhibition.title} ${index + 2}`}
                          className="w-full h-20 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">작가</h3>
                    <p className="text-gray-600">{viewingExhibition.artist}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800">가격</h3>
                    <p className="text-2xl font-bold text-[#FF7648]">
                      {viewingExhibition.price.toLocaleString()}원
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-800">크기</h3>
                      <p className="text-gray-600">{viewingExhibition.dimensions}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">제작연도</h3>
                      <p className="text-gray-600">{viewingExhibition.year}년</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800">재료</h3>
                    <p className="text-gray-600">{viewingExhibition.medium}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800">에디션</h3>
                    <p className="text-red-600 font-semibold">{viewingExhibition.edition}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800">판매 상태</h3>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        viewingExhibition.is_available
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {viewingExhibition.is_available ? "판매 중" : "판매 완료"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">작품 설명</h3>
                  <p className="text-gray-600 leading-relaxed">{viewingExhibition.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">작가의 말</h3>
                  <blockquote className="text-gray-600 italic leading-relaxed">
                    "{viewingExhibition.story}"
                  </blockquote>
                </div>

                {viewingExhibition.features.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">구매 특전</h3>
                    <ul className="space-y-2">
                      {viewingExhibition.features.map((feature, index) => (
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
                  onClick={() => {
                    setShowDetailModal(false);
                    openEditModal(viewingExhibition);
                  }}
                  className="flex-1 bg-[#FF7648] text-white px-4 py-2 rounded-lg hover:bg-[#E85A2A] transition-colors"
                >
                  수정하기
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExhibitionManagement;
