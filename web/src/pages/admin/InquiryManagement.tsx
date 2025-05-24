import React, { useState, useEffect } from "react";
import { supabase } from "../../api/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import IconWrapper from "../../components/IconWrapper";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaReply,
  FaSearch,
  FaFilter,
  FaEye,
  FaCheckCircle,
  FaClock,
  FaSpinner,
} from "react-icons/fa";

// 타입 정의 - form_submissions 테이블에 맞게 수정
interface FormSubmission {
  id: string;
  template_id: string;
  user_id: string;
  data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    category: string;
    message: string;
    contact_preference: string;
    reference_images?: string[];
    admin_response?: string;
  };
  status: "submitted" | "in_progress" | "completed";
  created_at: string;
  updated_at: string;
  user_profile?: {
    display_name: string;
    avatar_url?: string;
  };
}

const InquiryManagement: React.FC = () => {
  const { profile } = useAuth();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [showReplyModal, setShowReplyModal] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>("");

  // 숨기기 기능을 위한 상태 추가
  const [showCompleted, setShowCompleted] = useState<boolean>(false);

  // 디버깅 로그 추가
  console.log("🔍 InquiryManagement - profile 상태:", profile);
  console.log("🔍 InquiryManagement - profile.role:", profile?.role);

  useEffect(() => {
    console.log("🔍 InquiryManagement - useEffect 실행됨");
    fetchSubmissions();
  }, []);

  useEffect(() => {
    let filtered = submissions;

    // 완료된 문의 숨기기 (기본적으로 숨김)
    if (!showCompleted) {
      filtered = filtered.filter((submission) => submission.status !== "completed");
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (submission) =>
          submission.data.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          submission.data.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          submission.data.subject?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((submission) => submission.status === statusFilter);
    }

    setFilteredSubmissions(filtered);
  }, [submissions, searchTerm, statusFilter, showCompleted]);

  const fetchSubmissions = async () => {
    console.log("🔍 fetchSubmissions 함수 시작");
    try {
      setLoading(true);
      console.log("🔍 로딩 상태 설정 완료");

      // 1. form_submissions 데이터 가져오기
      console.log("🔍 form_submissions 데이터 요청 시작");
      const { data: submissionsData, error: submissionsError } = await supabase
        .from("form_submissions")
        .select("*")
        .eq("template_id", "unified-inquiry")
        .order("created_at", { ascending: false });

      console.log("🔍 form_submissions 응답:", { submissionsData, submissionsError });

      if (submissionsError) throw submissionsError;

      if (!submissionsData || submissionsData.length === 0) {
        console.log("🔍 submissions 데이터가 없음");
        setSubmissions([]);
        return;
      }

      // 2. 사용자 ID 목록 추출
      const userIds = Array.from(new Set(submissionsData.map((submission) => submission.user_id)));
      console.log("🔍 추출된 사용자 ID들:", userIds);

      // 3. 사용자 프로필 데이터 가져오기
      console.log("🔍 사용자 프로필 데이터 요청 시작");
      const { data: profilesData, error: profilesError } = await supabase
        .from("user_profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      console.log("🔍 사용자 프로필 응답:", { profilesData, profilesError });

      if (profilesError) {
        console.warn("사용자 프로필 로드 오류:", profilesError);
      }

      // 4. 프로필 데이터를 Map으로 변환
      const profilesMap = new Map();
      if (profilesData) {
        profilesData.forEach((profile) => {
          profilesMap.set(profile.user_id, profile);
        });
      }

      // 5. submissions와 profiles 매핑
      const submissionsWithProfiles = submissionsData.map((submission) => ({
        ...submission,
        user_profile: profilesMap.get(submission.user_id) || null,
      }));

      console.log("🔍 최종 submissions 데이터:", submissionsWithProfiles);
      setSubmissions(submissionsWithProfiles);
    } catch (error) {
      console.error("❌ 문의 목록 로드 오류:", error);
    } finally {
      setLoading(false);
      console.log("🔍 로딩 완료");
    }
  };

  const updateSubmissionStatus = async (id: string, status: FormSubmission["status"]) => {
    try {
      const { error } = await supabase
        .from("form_submissions")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      setSubmissions((prev) =>
        prev.map((submission) => (submission.id === id ? { ...submission, status } : submission))
      );

      alert("문의 상태가 성공적으로 변경되었습니다.");
    } catch (error) {
      console.error("상태 변경 오류:", error);
      alert("상태 변경 중 오류가 발생했습니다.");
    }
  };

  const submitReply = async () => {
    if (!selectedSubmission || !replyText.trim()) return;

    try {
      // 답변을 data 필드에 추가
      const updatedData = {
        ...selectedSubmission.data,
        admin_response: replyText,
      };

      const { error } = await supabase
        .from("form_submissions")
        .update({
          data: updatedData,
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedSubmission.id);

      if (error) throw error;

      setSubmissions((prev) =>
        prev.map((submission) =>
          submission.id === selectedSubmission.id
            ? {
                ...submission,
                data: updatedData,
                status: "completed" as const,
              }
            : submission
        )
      );

      setShowReplyModal(false);
      setReplyText("");
      setSelectedSubmission(null);
      alert("답변이 성공적으로 등록되었습니다.");
    } catch (error) {
      console.error("답변 등록 오류:", error);
      alert("답변 등록 중 오류가 발생했습니다.");
    }
  };

  const handleReply = (submission: FormSubmission) => {
    setSelectedSubmission(submission);
    setReplyText(submission.data.admin_response || "");
    setShowReplyModal(true);
  };

  const getStatusColor = (status: FormSubmission["status"]) => {
    switch (status) {
      case "submitted":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: FormSubmission["status"]) => {
    switch (status) {
      case "submitted":
        return "접수됨";
      case "in_progress":
        return "처리중";
      case "completed":
        return "완료";
      default:
        return "알 수 없음";
    }
  };

  // 권한 체크 로그 추가
  if (profile?.role !== "admin") {
    console.log("❌ 관리자 권한 없음 - profile:", profile);
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

  console.log("✅ 관리자 권한 확인 완료 - 컴포넌트 렌더링 진행");

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8 lg:pl-16">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">문의 관리</h1>
          <p className="text-gray-600">사용자 문의를 확인하고 답변합니다.</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <IconWrapper icon={FaEnvelope} size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">전체 문의</p>
                <p className="text-2xl font-bold text-blue-800">{submissions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <IconWrapper icon={FaClock} size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">접수됨</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {submissions.filter((s) => s.status === "submitted").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <IconWrapper icon={FaSpinner} size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">처리중</p>
                <p className="text-2xl font-bold text-blue-800">
                  {submissions.filter((s) => s.status === "in_progress").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <IconWrapper icon={FaCheckCircle} size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">완료</p>
                <p className="text-2xl font-bold text-green-800">
                  {submissions.filter((s) => s.status === "completed").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <IconWrapper
                icon={FaSearch}
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="이름, 이메일, 제목으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
              />
            </div>
            <div className="relative">
              <IconWrapper
                icon={FaFilter}
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
              >
                <option value="all">모든 상태</option>
                <option value="submitted">접수됨</option>
                <option value="in_progress">처리중</option>
                <option value="completed">완료</option>
              </select>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  showCompleted
                    ? "bg-[#FF7648] text-white border-[#FF7648]"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <IconWrapper icon={FaEye} size={16} />
                <span>{showCompleted ? "완료된 문의 숨기기" : "완료된 문의 보기"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 문의 목록 */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF7648] mx-auto"></div>
              <p className="mt-4 text-gray-600">문의 목록을 불러오는 중...</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 p-6">
                {filteredSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    {/* 문의 헤더 */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        {submission.user_profile?.avatar_url ? (
                          <img
                            src={submission.user_profile.avatar_url}
                            alt="profile"
                            className="w-10 h-10 rounded-full mr-3"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                            <IconWrapper icon={FaUser} className="text-gray-500" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {submission.data.name ||
                              submission.user_profile?.display_name ||
                              "익명"}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {new Date(submission.created_at).toLocaleDateString("ko-KR")}
                          </span>
                          <p className="text-sm text-gray-600">{submission.data.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            submission.status
                          )}`}
                        >
                          {getStatusText(submission.status)}
                        </span>
                      </div>
                    </div>

                    {/* 문의 내용 */}
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <IconWrapper icon={FaEnvelope} className="text-gray-400 mr-2" size={16} />
                        <h4 className="font-medium text-gray-800">{submission.data.subject}</h4>
                      </div>
                      <div className="flex items-center mb-2">
                        <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded mr-2">
                          {submission.data.category}
                        </span>
                        {submission.data.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <IconWrapper icon={FaPhone} className="mr-1" size={12} />
                            {submission.data.phone}
                          </div>
                        )}
                      </div>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {submission.data.message}
                      </p>

                      {/* 참고 이미지 */}
                      {submission.data.reference_images &&
                        submission.data.reference_images.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-2">참고 이미지:</p>
                            <div className="flex flex-wrap gap-2">
                              {submission.data.reference_images.map((imageUrl, index) => (
                                <img
                                  key={index}
                                  src={imageUrl}
                                  alt={`참고 이미지 ${index + 1}`}
                                  className="w-20 h-20 object-cover rounded-lg border"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                    </div>

                    {/* 관리자 답변 */}
                    {submission.data.admin_response && (
                      <div className="mb-4 bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <IconWrapper icon={FaReply} className="text-blue-600 mr-2" size={16} />
                          <span className="font-medium text-blue-800">관리자 답변</span>
                        </div>
                        <p className="text-blue-700">{submission.data.admin_response}</p>
                      </div>
                    )}

                    {/* 액션 버튼 */}
                    <div className="flex justify-end space-x-2">
                      {submission.status !== "completed" && (
                        <>
                          <button
                            onClick={() => updateSubmissionStatus(submission.id, "in_progress")}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            disabled={submission.status === "in_progress"}
                          >
                            처리중으로 변경
                          </button>
                          <button
                            onClick={() => handleReply(submission)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            답변하기
                          </button>
                        </>
                      )}
                      {submission.status === "completed" && (
                        <button
                          onClick={() => handleReply(submission)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        >
                          답변 수정
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {filteredSubmissions.length === 0 && (
                  <div className="text-center py-12">
                    <IconWrapper icon={FaEnvelope} className="text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500 text-lg">
                      {searchTerm || statusFilter !== "all"
                        ? "검색 조건에 맞는 문의가 없습니다."
                        : "아직 문의가 없습니다."}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* 답변 모달 */}
        {showReplyModal && selectedSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">문의 답변</h3>

                {/* 원본 문의 내용 */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">
                    {selectedSubmission.data.subject}
                  </h4>
                  <p className="text-gray-700 text-sm">{selectedSubmission.data.message}</p>
                </div>

                {/* 답변 입력 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">답변 내용</label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={6}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                    placeholder="답변을 입력하세요..."
                  />
                </div>

                {/* 버튼 */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowReplyModal(false);
                      setReplyText("");
                      setSelectedSubmission(null);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={submitReply}
                    className="px-4 py-2 bg-[#FF7648] text-white rounded-lg hover:bg-[#E6653F] transition-colors"
                    disabled={!replyText.trim()}
                  >
                    답변 등록
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

export default InquiryManagement;
