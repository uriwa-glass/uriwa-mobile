import React, { useState, useEffect } from "react";
import { supabase } from "../../api/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import IconWrapper from "../../components/IconWrapper";
import ImageUpload from "../../components/ImageUpload";
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
  FaTimes,
  FaArrowUp,
  FaArrowDown,
  FaUserGraduate,
  FaSortNumericUp,
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
  image_urls?: string[];
  curriculum?: string[];
  sort_order?: number;
  created_at: string;
  updated_at: string;
  instructor_name?: string;
  completion_works?: string;
  course_focus?: string;
  learning_objectives?: string;
  post_completion_path?: string;
  detailed_curriculum?: any;
}

interface Instructor {
  user_id: string;
  display_name: string;
  full_name?: string;
  role: string;
}

interface ClassFormData {
  title: string;
  description: string;
  instructor_id: string;
  max_participants: number;
  price: number;
  duration: number;
  category: string;
  image_urls: string[];
  curriculum: string[];
  sort_order: number;
  completion_works: string;
  course_focus: string;
  learning_objectives: string;
  post_completion_path: string;
  detailed_curriculum: string;
}

const ClassManagement: React.FC = () => {
  const { profile } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState<ClassFormData>({
    title: "",
    description: "",
    instructor_id: "",
    max_participants: 10,
    price: 0,
    duration: 60,
    category: "",
    image_urls: [""],
    curriculum: [""],
    sort_order: 0,
    completion_works: "",
    course_focus: "",
    learning_objectives: "",
    post_completion_path: "",
    detailed_curriculum: "",
  });

  useEffect(() => {
    fetchClasses();
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("user_id, display_name, full_name, role")
        .in("role", ["admin", "instructor"])
        .order("display_name");

      if (error) throw error;

      setInstructors(data || []);
    } catch (error) {
      console.error("강사 목록 로드 오류:", error);
    }
  };

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
        .order("category", { ascending: true })
        .order("sort_order", { ascending: true })
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

  // 순서 변경 함수
  const updateSortOrder = async (classId: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from("classes")
        .update({ sort_order: newOrder, updated_at: new Date().toISOString() })
        .eq("id", classId);

      if (error) throw error;

      fetchClasses(); // 목록 새로고침
    } catch (error) {
      console.error("순서 변경 오류:", error);
      alert("순서 변경 중 오류가 발생했습니다.");
    }
  };

  // 카테고리 내에서 순서 이동
  const moveClass = async (classItem: Class, direction: "up" | "down") => {
    const sameCategory = classes.filter((c) => c.category === classItem.category);
    const currentIndex = sameCategory.findIndex((c) => c.id === classItem.id);

    if (direction === "up" && currentIndex > 0) {
      const targetClass = sameCategory[currentIndex - 1];
      await updateSortOrder(classItem.id, targetClass.sort_order || 0);
      await updateSortOrder(targetClass.id, classItem.sort_order || 0);
    } else if (direction === "down" && currentIndex < sameCategory.length - 1) {
      const targetClass = sameCategory[currentIndex + 1];
      await updateSortOrder(classItem.id, targetClass.sort_order || 0);
      await updateSortOrder(targetClass.id, classItem.sort_order || 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // detailed_curriculum JSON 파싱
      let parsedDetailedCurriculum = null;
      if (formData.detailed_curriculum.trim()) {
        try {
          parsedDetailedCurriculum = JSON.parse(formData.detailed_curriculum);
        } catch (jsonError) {
          alert("상세 커리큘럼 JSON 형식이 올바르지 않습니다.");
          return;
        }
      }

      // 빈 값 제거
      const cleanedData = {
        ...formData,
        image_urls: formData.image_urls.filter((url) => url.trim() !== ""),
        curriculum: formData.curriculum.filter((item) => item.trim() !== ""),
        instructor_id: formData.instructor_id || null, // 빈 문자열 대신 null
        detailed_curriculum: parsedDetailedCurriculum,
      };

      if (editingClass) {
        // 수업 수정
        const { error } = await supabase
          .from("classes")
          .update({
            ...cleanedData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingClass.id);

        if (error) throw error;
        alert("수업이 성공적으로 수정되었습니다.");
      } else {
        // 새 수업 생성 시 해당 카테고리의 최대 순서 + 1로 설정
        const { data: maxOrderData } = await supabase
          .from("classes")
          .select("sort_order")
          .eq("category", cleanedData.category)
          .order("sort_order", { ascending: false })
          .limit(1);

        const maxOrder = maxOrderData?.[0]?.sort_order || 0;

        const { error } = await supabase.from("classes").insert([
          {
            ...cleanedData,
            instructor_id: cleanedData.instructor_id || profile?.user_id,
            sort_order: maxOrder + 1,
          },
        ]);

        if (error) throw error;
        alert("새 수업이 성공적으로 생성되었습니다.");
      }

      // 폼 초기화 및 목록 새로고침
      setFormData({
        title: "",
        description: "",
        instructor_id: "",
        max_participants: 10,
        price: 0,
        duration: 60,
        category: "",
        image_urls: [""],
        curriculum: [""],
        sort_order: 0,
        completion_works: "",
        course_focus: "",
        learning_objectives: "",
        post_completion_path: "",
        detailed_curriculum: "",
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
      instructor_id: classItem.instructor_id || "",
      max_participants: classItem.max_participants,
      price: classItem.price,
      duration: classItem.duration,
      category: classItem.category || "",
      image_urls:
        classItem.image_urls && classItem.image_urls.length > 0 ? classItem.image_urls : [""],
      curriculum:
        classItem.curriculum && classItem.curriculum.length > 0 ? classItem.curriculum : [""],
      sort_order: classItem.sort_order || 0,
      completion_works: classItem.completion_works || "",
      course_focus: classItem.course_focus || "",
      learning_objectives: classItem.learning_objectives || "",
      post_completion_path: classItem.post_completion_path || "",
      detailed_curriculum: classItem.detailed_curriculum
        ? JSON.stringify(classItem.detailed_curriculum, null, 2)
        : "",
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

  // 배열 필드 핸들러
  const handleArrayFieldChange = (
    field: "image_urls" | "curriculum",
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayField = (field: "image_urls" | "curriculum") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayField = (field: "image_urls" | "curriculum", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
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
                instructor_id: "",
                max_participants: 10,
                price: 0,
                duration: 60,
                category: "",
                image_urls: [""],
                curriculum: [""],
                sort_order: 0,
                completion_works: "",
                course_focus: "",
                learning_objectives: "",
                post_completion_path: "",
                detailed_curriculum: "",
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
                      {classItem.image_urls &&
                      classItem.image_urls.length > 0 &&
                      classItem.image_urls[0] ? (
                        <div className="relative w-full h-full">
                          <img
                            src={classItem.image_urls[0]}
                            alt={classItem.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          {classItem.image_urls.length > 1 && (
                            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                              +{classItem.image_urls.length - 1}
                            </div>
                          )}
                        </div>
                      ) : classItem.thumbnail_url ? (
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
                        <div className="flex items-center text-gray-700">
                          <IconWrapper
                            icon={FaSortNumericUp}
                            className="mr-2 text-[#FF7648]"
                            size={16}
                          />
                          <span>순서: {classItem.sort_order || 0}</span>
                        </div>
                        {classItem.category && (
                          <div className="flex items-center text-gray-700">
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                              {classItem.category}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center text-gray-700">
                          <IconWrapper
                            icon={FaUserGraduate}
                            className="mr-2 text-[#FF7648]"
                            size={16}
                          />
                          <span>강사: {classItem.instructor_name}</span>
                        </div>
                      </div>
                    </div>

                    {/* 순서 변경 버튼 */}
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500">순서 변경</span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => moveClass(classItem, "up")}
                          className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="위로 이동"
                        >
                          <IconWrapper icon={FaArrowUp} size={14} />
                        </button>
                        <button
                          onClick={() => moveClass(classItem, "down")}
                          className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="아래로 이동"
                        >
                          <IconWrapper icon={FaArrowDown} size={14} />
                        </button>
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
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, category: e.target.value }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                      >
                        <option value="">카테고리 선택</option>
                        <option value="스테인드글라스">스테인드글라스</option>
                        <option value="유리가마">유리가마</option>
                        <option value="창업과정">창업과정</option>
                        <option value="체험과정">체험과정</option>
                        <option value="키즈클래스">키즈클래스</option>
                        <option value="특별과정">특별과정</option>
                        <option value="워크샵">워크샵</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      담당 강사
                    </label>
                    <select
                      value={formData.instructor_id}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, instructor_id: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                    >
                      <option value="">강사 선택 (미지정)</option>
                      {instructors.map((instructor) => (
                        <option key={instructor.user_id} value={instructor.user_id}>
                          {instructor.display_name} (
                          {instructor.role === "admin" ? "관리자" : "강사"})
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-500 mt-1">
                      강사를 지정하지 않으면 수업 생성자가 기본 강사가 됩니다.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      수업 이미지
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
                          bucketName="class-thumbnails"
                          currentImageUrl={url || undefined}
                          onImageUploaded={(newUrl: string) =>
                            handleArrayFieldChange("image_urls", index, newUrl)
                          }
                          onImageRemoved={() => handleArrayFieldChange("image_urls", index, "")}
                          maxWidth={600}
                          maxHeight={400}
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

                  {/* 커리큘럼 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">커리큘럼</label>
                    <p className="text-sm text-gray-500 mb-3">각 주차별 수업 내용을 입력하세요</p>
                    {formData.curriculum.map((item, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <div className="flex-shrink-0 w-12 text-center">
                          <span className="text-sm text-gray-500">{index + 1}주</span>
                        </div>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) =>
                            handleArrayFieldChange("curriculum", index, e.target.value)
                          }
                          placeholder={`${index + 1}주차 수업 내용을 입력하세요`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                        />
                        {formData.curriculum.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayField("curriculum", index)}
                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            <IconWrapper icon={FaTimes} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayField("curriculum")}
                      className="text-[#FF7648] hover:text-[#E85A2A] text-sm font-medium"
                    >
                      + 주차 추가
                    </button>
                  </div>

                  {/* 상세 정보 섹션 */}
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">상세 정보</h3>

                    {/* 완성 작품 */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        완성 작품 · 수강 포커스
                      </label>
                      <textarea
                        value={formData.completion_works}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, completion_works: e.target.value }))
                        }
                        rows={4}
                        placeholder="완성할 작품과 수강 포커스를 입력하세요"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                      />
                    </div>

                    {/* 수업목표 */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        수업목표
                      </label>
                      <textarea
                        value={formData.learning_objectives}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, learning_objectives: e.target.value }))
                        }
                        rows={4}
                        placeholder="수업을 통해 달성할 목표를 입력하세요"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                      />
                    </div>

                    {/* 이수 후 방향 */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        이수 후 방향
                      </label>
                      <textarea
                        value={formData.post_completion_path}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, post_completion_path: e.target.value }))
                        }
                        rows={3}
                        placeholder="수업 이수 후 진로나 다음 단계를 입력하세요"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                      />
                    </div>

                    {/* 상세 커리큘럼 (JSON) */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        상세 혜택 (JSON 형식)
                      </label>
                      <p className="text-sm text-gray-500 mb-2">
                        JSON 형식으로 상세 혜택 정보를 입력하세요. 예:{" "}
                        {`{"헤택": ["항목1", "항목2"]}`}
                      </p>
                      <textarea
                        value={formData.detailed_curriculum}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, detailed_curriculum: e.target.value }))
                        }
                        rows={8}
                        placeholder={`{
  "헤택": [
    "URiWa 전체 혜택",
    "수강 당일 오전 9시 ~ 오후 7시"
  ],
  "중급 수강생 개별 클래스 진행": [
    "원데이클래스, 취미 클래스 운영 가능",
    "클래스 운영 방식 지도"
  ]
}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent font-mono text-sm"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        올바른 JSON 형식인지 확인하세요. 잘못된 형식일 경우 저장이 되지 않습니다.
                      </p>
                    </div>
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
