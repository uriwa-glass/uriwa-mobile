import React, { useState, useEffect } from "react";
import { supabase } from "../../api/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import IconWrapper from "../../components/IconWrapper";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaTimes,
  FaStar,
  FaImage,
  FaSearch,
  FaFilter,
} from "react-icons/fa";

interface PortfolioCase {
  id: number;
  title: string;
  description: string;
  category: string;
  image_url?: string;
  thumbnail_url?: string;
  client_name?: string;
  project_duration?: number;
  difficulty_level: "easy" | "medium" | "hard";
  materials?: string[];
  techniques?: string[];
  price_range?: string;
  is_featured: boolean;
  display_order: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

const PortfolioManagement: React.FC = () => {
  const { profile } = useAuth();
  const [portfolios, setPortfolios] = useState<PortfolioCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<PortfolioCase | null>(null);
  const [viewingPortfolio, setViewingPortfolio] = useState<PortfolioCase | null>(null);

  // 초기 폼 데이터
  const initialFormData = {
    title: "",
    description: "",
    category: "",
    image_url: "",
    thumbnail_url: "",
    client_name: "",
    project_duration: 0,
    difficulty_level: "medium" as "easy" | "medium" | "hard",
    materials: [] as string[],
    techniques: [] as string[],
    price_range: "",
    is_featured: false,
    display_order: 0,
    status: "active" as "active" | "inactive",
  };

  const [formData, setFormData] = useState(initialFormData);

  // 관리자 권한 확인
  useEffect(() => {
    if (profile?.role !== "admin") {
      alert("관리자 권한이 필요합니다.");
      window.history.back();
    }
  }, [profile]);

  // 포트폴리오 목록 조회
  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("portfolio_cases")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setPortfolios(data || []);
    } catch (error) {
      console.error("포트폴리오 조회 오류:", error);
      alert("포트폴리오 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  // 포트폴리오 생성/수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const portfolioData = {
        ...formData,
        materials: formData.materials.length > 0 ? formData.materials : null,
        techniques: formData.techniques.length > 0 ? formData.techniques : null,
        updated_at: new Date().toISOString(),
      };

      if (editingPortfolio) {
        // 수정
        const { error } = await supabase
          .from("portfolio_cases")
          .update(portfolioData)
          .eq("id", editingPortfolio.id);

        if (error) throw error;
        alert("포트폴리오가 성공적으로 수정되었습니다.");
      } else {
        // 생성
        const { error } = await supabase.from("portfolio_cases").insert({
          ...portfolioData,
          created_at: new Date().toISOString(),
        });

        if (error) throw error;
        alert("새 포트폴리오가 성공적으로 생성되었습니다.");
      }

      setShowModal(false);
      setEditingPortfolio(null);
      setFormData(initialFormData);
      fetchPortfolios();
    } catch (error) {
      console.error("포트폴리오 저장 오류:", error);
      alert("포트폴리오 저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 포트폴리오 삭제
  const handleDelete = async (id: number) => {
    if (!window.confirm("정말로 이 포트폴리오를 삭제하시겠습니까?")) return;

    try {
      setLoading(true);
      const { error } = await supabase.from("portfolio_cases").delete().eq("id", id);

      if (error) throw error;
      alert("포트폴리오가 성공적으로 삭제되었습니다.");
      fetchPortfolios();
    } catch (error) {
      console.error("포트폴리오 삭제 오류:", error);
      alert("포트폴리오 삭제에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 추천 상태 토글
  const toggleFeatured = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("portfolio_cases")
        .update({ is_featured: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      fetchPortfolios();
    } catch (error) {
      console.error("추천 상태 변경 오류:", error);
      alert("추천 상태 변경에 실패했습니다.");
    }
  };

  // 편집 모드 시작
  const startEdit = (portfolio: PortfolioCase) => {
    setEditingPortfolio(portfolio);
    setFormData({
      title: portfolio.title,
      description: portfolio.description || "",
      category: portfolio.category || "",
      image_url: portfolio.image_url || "",
      thumbnail_url: portfolio.thumbnail_url || "",
      client_name: portfolio.client_name || "",
      project_duration: portfolio.project_duration || 0,
      difficulty_level: portfolio.difficulty_level,
      materials: portfolio.materials || [],
      techniques: portfolio.techniques || [],
      price_range: portfolio.price_range || "",
      is_featured: portfolio.is_featured,
      display_order: portfolio.display_order,
      status: portfolio.status,
    });
    setShowModal(true);
  };

  // 새 포트폴리오 생성 시작
  const startCreate = () => {
    setEditingPortfolio(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  // 배열 필드 업데이트 헬퍼
  const updateArrayField = (field: "materials" | "techniques", value: string) => {
    const items = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);
    setFormData((prev) => ({ ...prev, [field]: items }));
  };

  // 필터링된 포트폴리오
  const filteredPortfolios = portfolios.filter((portfolio) => {
    const matchesSearch =
      portfolio.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      portfolio.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      portfolio.client_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || portfolio.category === categoryFilter;
    const matchesStatus = !statusFilter || portfolio.status === statusFilter;
    const matchesDifficulty = !difficultyFilter || portfolio.difficulty_level === difficultyFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesDifficulty;
  });

  // 카테고리 목록 생성
  const categories = Array.from(new Set(portfolios.map((p) => p.category).filter(Boolean)));

  // 난이도 표시 헬퍼
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "easy":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "hard":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getDifficultyText = (level: string) => {
    switch (level) {
      case "easy":
        return "쉬움";
      case "medium":
        return "보통";
      case "hard":
        return "어려움";
      default:
        return level;
    }
  };

  // 통계 계산
  const stats = {
    total: portfolios.length,
    active: portfolios.filter((p) => p.status === "active").length,
    featured: portfolios.filter((p) => p.is_featured).length,
    categories: categories.length,
  };

  if (loading && portfolios.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7648] mx-auto mb-4"></div>
          <p className="text-gray-600">포트폴리오 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8 lg:pl-16">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">포트폴리오 관리</h1>
            <p className="text-gray-600">제작 사례를 등록하고 관리합니다</p>
          </div>
          <button
            onClick={startCreate}
            className="mt-4 sm:mt-0 bg-[#FF7648] text-white px-6 py-3 rounded-lg hover:bg-[#E85A2A] transition-colors flex items-center gap-2"
          >
            <IconWrapper icon={FaPlus} />새 포트폴리오 추가
          </button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">전체 포트폴리오</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <IconWrapper icon={FaImage} className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">활성 포트폴리오</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <IconWrapper icon={FaEye} className="text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">추천 포트폴리오</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.featured}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <IconWrapper icon={FaStar} className="text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">카테고리 수</p>
                <p className="text-2xl font-bold text-purple-600">{stats.categories}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <IconWrapper icon={FaFilter} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
              <div className="relative">
                <IconWrapper
                  icon={FaSearch}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="제목, 설명, 고객명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
              >
                <option value="">전체 카테고리</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
              >
                <option value="">전체 상태</option>
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">난이도</label>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
              >
                <option value="">전체 난이도</option>
                <option value="easy">쉬움</option>
                <option value="medium">보통</option>
                <option value="hard">어려움</option>
              </select>
            </div>
          </div>
        </div>

        {/* 포트폴리오 목록 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    포트폴리오
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    난이도
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    기간
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPortfolios.map((portfolio) => (
                  <tr key={portfolio.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4 flex-shrink-0">
                          {portfolio.thumbnail_url ? (
                            <img
                              src={portfolio.thumbnail_url}
                              alt={portfolio.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <IconWrapper icon={FaImage} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{portfolio.title}</p>
                            {portfolio.is_featured && (
                              <IconWrapper icon={FaStar} className="text-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{portfolio.client_name}</p>
                          <p className="text-sm text-gray-400 line-clamp-1">
                            {portfolio.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {portfolio.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(
                          portfolio.difficulty_level
                        )}`}
                      >
                        {getDifficultyText(portfolio.difficulty_level)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {portfolio.project_duration ? `${portfolio.project_duration}일` : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          portfolio.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {portfolio.status === "active" ? "활성" : "비활성"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setViewingPortfolio(portfolio)}
                          className="text-blue-600 hover:text-blue-900"
                          title="자세히 보기"
                        >
                          <IconWrapper icon={FaEye} />
                        </button>
                        <button
                          onClick={() => startEdit(portfolio)}
                          className="text-green-600 hover:text-green-900"
                          title="수정"
                        >
                          <IconWrapper icon={FaEdit} />
                        </button>
                        <button
                          onClick={() => toggleFeatured(portfolio.id, portfolio.is_featured)}
                          className={`${
                            portfolio.is_featured
                              ? "text-yellow-600 hover:text-yellow-900"
                              : "text-gray-400 hover:text-yellow-600"
                          }`}
                          title="추천 토글"
                        >
                          <IconWrapper icon={FaStar} />
                        </button>
                        <button
                          onClick={() => handleDelete(portfolio.id)}
                          className="text-red-600 hover:text-red-900"
                          title="삭제"
                        >
                          <IconWrapper icon={FaTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPortfolios.length === 0 && (
            <div className="text-center py-12">
              <IconWrapper icon={FaImage} className="text-gray-400 text-4xl mx-auto mb-4" />
              <p className="text-gray-500">검색 결과가 없습니다.</p>
            </div>
          )}
        </div>

        {/* 포트폴리오 생성/수정 모달 */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    {editingPortfolio ? "포트폴리오 수정" : "새 포트폴리오 추가"}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <IconWrapper icon={FaTimes} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">제목 *</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, title: e.target.value }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        카테고리
                      </label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, category: e.target.value }))
                        }
                        placeholder="예: 가구, 인테리어, 예술품"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, description: e.target.value }))
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        메인 이미지 URL
                      </label>
                      <input
                        type="url"
                        value={formData.image_url}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, image_url: e.target.value }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        썸네일 이미지 URL
                      </label>
                      <input
                        type="url"
                        value={formData.thumbnail_url}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, thumbnail_url: e.target.value }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">고객명</label>
                      <input
                        type="text"
                        value={formData.client_name}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, client_name: e.target.value }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        제작 기간 (일)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.project_duration}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            project_duration: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">난이도</label>
                      <select
                        value={formData.difficulty_level}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            difficulty_level: e.target.value as "easy" | "medium" | "hard",
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                      >
                        <option value="easy">쉬움</option>
                        <option value="medium">보통</option>
                        <option value="hard">어려움</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        사용 재료 (쉼표로 구분)
                      </label>
                      <input
                        type="text"
                        value={formData.materials.join(", ")}
                        onChange={(e) => updateArrayField("materials", e.target.value)}
                        placeholder="예: 원목, 스테인리스스틸, 아크릴"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        사용 기법 (쉼표로 구분)
                      </label>
                      <input
                        type="text"
                        value={formData.techniques.join(", ")}
                        onChange={(e) => updateArrayField("techniques", e.target.value)}
                        placeholder="예: 목공, 용접, 레이저컷팅"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        가격 범위
                      </label>
                      <input
                        type="text"
                        value={formData.price_range}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, price_range: e.target.value }))
                        }
                        placeholder="예: 100만원-200만원"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        노출 순서
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.display_order}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            display_order: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            status: e.target.value as "active" | "inactive",
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                      >
                        <option value="active">활성</option>
                        <option value="inactive">비활성</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_featured"
                      checked={formData.is_featured}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, is_featured: e.target.checked }))
                      }
                      className="w-4 h-4 text-[#FF7648] border-gray-300 rounded focus:ring-[#FF7648]"
                    />
                    <label htmlFor="is_featured" className="ml-2 text-sm text-gray-700">
                      메인 페이지에 추천 표시
                    </label>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-[#FF7648] text-white px-4 py-2 rounded-lg hover:bg-[#E85A2A] transition-colors disabled:opacity-50"
                    >
                      {loading ? "저장 중..." : editingPortfolio ? "수정하기" : "생성하기"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* 포트폴리오 상세 보기 모달 */}
        {viewingPortfolio && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">포트폴리오 상세</h2>
                  <button
                    onClick={() => setViewingPortfolio(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <IconWrapper icon={FaTimes} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* 메인 이미지 */}
                  {viewingPortfolio.image_url && (
                    <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={viewingPortfolio.image_url}
                        alt={viewingPortfolio.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* 기본 정보 */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-2xl font-bold text-gray-800">{viewingPortfolio.title}</h3>
                      {viewingPortfolio.is_featured && (
                        <IconWrapper icon={FaStar} className="text-yellow-500" />
                      )}
                    </div>
                    <p className="text-gray-600 mb-4">{viewingPortfolio.description}</p>
                  </div>

                  {/* 상세 정보 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">카테고리</p>
                      <p className="text-gray-600">{viewingPortfolio.category || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">고객명</p>
                      <p className="text-gray-600">{viewingPortfolio.client_name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">제작 기간</p>
                      <p className="text-gray-600">
                        {viewingPortfolio.project_duration
                          ? `${viewingPortfolio.project_duration}일`
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">난이도</p>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(
                          viewingPortfolio.difficulty_level
                        )}`}
                      >
                        {getDifficultyText(viewingPortfolio.difficulty_level)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">가격 범위</p>
                      <p className="text-gray-600">{viewingPortfolio.price_range || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">상태</p>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          viewingPortfolio.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {viewingPortfolio.status === "active" ? "활성" : "비활성"}
                      </span>
                    </div>
                  </div>

                  {/* 재료 및 기법 */}
                  {(viewingPortfolio.materials?.length || viewingPortfolio.techniques?.length) && (
                    <div>
                      {viewingPortfolio.materials?.length && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">사용 재료</p>
                          <div className="flex flex-wrap gap-2">
                            {viewingPortfolio.materials.map((material, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {material}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {viewingPortfolio.techniques?.length && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">사용 기법</p>
                          <div className="flex flex-wrap gap-2">
                            {viewingPortfolio.techniques.map((technique, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                              >
                                {technique}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 등록일 */}
                  <div className="text-sm text-gray-500 border-t pt-4">
                    <p>
                      등록일: {new Date(viewingPortfolio.created_at).toLocaleDateString("ko-KR")}
                    </p>
                    <p>
                      수정일: {new Date(viewingPortfolio.updated_at).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioManagement;
