import React, { useState, useEffect } from "react";
import { supabase } from "../../api/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import IconWrapper from "../../components/IconWrapper";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaUsers,
  FaClock,
  FaDollarSign,
  FaSearch,
  FaBook,
} from "react-icons/fa";

interface Class {
  id: string;
  title: string;
  description: string;
  instructor_id?: string;
  max_participants: number;
  price: number;
  duration: number;
  category?: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  instructor_name?: string;
}

interface ClassFormData {
  title: string;
  description: string;
  max_participants: number;
  price: number;
  duration: number;
  category: string;
  thumbnail_url: string;
}

const ClassManagement: React.FC = () => {
  const { profile } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState<ClassFormData>({
    title: "",
    description: "",
    max_participants: 10,
    price: 0,
    duration: 60,
    category: "",
    thumbnail_url: "",
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
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
        .order("created_at", { ascending: false });

      if (error) throw error;

      const classesWithInstructor =
        data?.map((classItem) => ({
          ...classItem,
          instructor_name: classItem.instructor?.display_name || "미지정",
        })) || [];

      setClasses(classesWithInstructor);
    } catch (error) {
      console.error("수업 목록 로드 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingClass) {
        // 수업 수정
        const { error } = await supabase
          .from("classes")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingClass.id);

        if (error) throw error;
        alert("수업이 성공적으로 수정되었습니다.");
      } else {
        // 새 수업 생성
        const { error } = await supabase.from("classes").insert([
          {
            ...formData,
            instructor_id: profile?.user_id,
          },
        ]);

        if (error) throw error;
        alert("새 수업이 성공적으로 생성되었습니다.");
      }

      // 폼 초기화 및 목록 새로고침
      setFormData({
        title: "",
        description: "",
        max_participants: 10,
        price: 0,
        duration: 60,
        category: "",
        thumbnail_url: "",
      });
      setShowForm(false);
      setEditingClass(null);
      fetchClasses();
    } catch (error) {
      console.error("수업 저장 오류:", error);
      alert("수업 저장 중 오류가 발생했습니다.");
    }
  };

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem);
    setFormData({
      title: classItem.title,
      description: classItem.description || "",
      max_participants: classItem.max_participants,
      price: classItem.price,
      duration: classItem.duration,
      category: classItem.category || "",
      thumbnail_url: classItem.thumbnail_url || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("정말로 이 수업을 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase.from("classes").delete().eq("id", id);

      if (error) throw error;

      setClasses((prev) => prev.filter((c) => c.id !== id));
      alert("수업이 성공적으로 삭제되었습니다.");
    } catch (error) {
      console.error("수업 삭제 오류:", error);
      alert("수업 삭제 중 오류가 발생했습니다.");
    }
  };

  const filteredClasses = classes.filter(
    (classItem) =>
      classItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (profile?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8 lg:pl-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600">관리자 권한이 필요합니다.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8 lg:pl-16">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">수업 관리</h1>
            <p className="text-gray-600">수업을 생성하고 관리합니다.</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingClass(null);
              setFormData({
                title: "",
                description: "",
                max_participants: 10,
                price: 0,
                duration: 60,
                category: "",
                thumbnail_url: "",
              });
            }}
            className="bg-[#FF7648] text-white px-6 py-3 rounded-lg hover:bg-[#E85A2A] transition-colors flex items-center"
          >
            <IconWrapper icon={FaPlus} className="mr-2" />새 수업 추가
          </button>
        </div>

        {/* 검색 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="relative max-w-md">
            <IconWrapper
              icon={FaSearch}
              className="absolute left-3 top-3 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="수업명, 카테고리로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
            />
          </div>
        </div>

        {/* 수업 목록 */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF7648] mx-auto"></div>
              <p className="mt-4 text-gray-600">수업 목록을 불러오는 중...</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {filteredClasses.map((classItem) => (
                  <div
                    key={classItem.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    {/* 썸네일 */}
                    <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                      {classItem.thumbnail_url ? (
                        <img
                          src={classItem.thumbnail_url}
                          alt={classItem.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <IconWrapper icon={FaBook} className="text-gray-400 text-3xl" />
                      )}
                    </div>

                    {/* 수업 정보 */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{classItem.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {classItem.description}
                      </p>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-700">
                          <IconWrapper icon={FaUsers} className="mr-2 text-[#FF7648]" size={16} />
                          <span>최대 {classItem.max_participants}명</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <IconWrapper icon={FaClock} className="mr-2 text-[#FF7648]" size={16} />
                          <span>{classItem.duration}분</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <IconWrapper
                            icon={FaDollarSign}
                            className="mr-2 text-[#FF7648]"
                            size={16}
                          />
                          <span>{classItem.price.toLocaleString()}원</span>
                        </div>
                        {classItem.category && (
                          <div className="flex items-center text-gray-700">
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                              {classItem.category}
                            </span>
                          </div>
                        )}
                        <div className="text-gray-500 text-xs">
                          강사: {classItem.instructor_name}
                        </div>
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(classItem)}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        <IconWrapper icon={FaEdit} className="mr-2" size={16} />
                        편집
                      </button>
                      <button
                        onClick={() => handleDelete(classItem.id)}
                        className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <IconWrapper icon={FaTrash} size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredClasses.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <p>검색 조건에 맞는 수업이 없습니다.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* 통계 */}
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <IconWrapper icon={FaBook} className="text-blue-600 mr-3" size={24} />
              <div>
                <p className="text-sm text-blue-600">전체 수업</p>
                <p className="text-2xl font-bold text-blue-800">{classes.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <IconWrapper icon={FaUsers} className="text-green-600 mr-3" size={24} />
              <div>
                <p className="text-sm text-green-600">총 수용 인원</p>
                <p className="text-2xl font-bold text-green-800">
                  {classes.reduce((sum, c) => sum + c.max_participants, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <IconWrapper icon={FaDollarSign} className="text-purple-600 mr-3" size={24} />
              <div>
                <p className="text-sm text-purple-600">평균 가격</p>
                <p className="text-2xl font-bold text-purple-800">
                  {classes.length > 0
                    ? Math.round(
                        classes.reduce((sum, c) => sum + c.price, 0) / classes.length
                      ).toLocaleString()
                    : 0}
                  원
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 수업 생성/편집 모달 */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  {editingClass ? "수업 편집" : "새 수업 추가"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">수업명</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                      required
                    />
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

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        최대 참가자 수
                      </label>
                      <input
                        type="number"
                        value={formData.max_participants}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            max_participants: parseInt(e.target.value),
                          }))
                        }
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        수업 시간 (분)
                      </label>
                      <input
                        type="number"
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, duration: parseInt(e.target.value) }))
                        }
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        가격 (원)
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, price: parseInt(e.target.value) }))
                        }
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                        required
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      썸네일 URL
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

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingClass(null);
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-[#FF7648] text-white rounded-lg hover:bg-[#E85A2A] transition-colors"
                    >
                      {editingClass ? "수정" : "생성"}
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

export default ClassManagement;
