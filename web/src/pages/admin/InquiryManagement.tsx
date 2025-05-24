import React, { useState, useEffect } from "react";
import { supabase } from "../../api/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import IconWrapper from "../../components/IconWrapper";
import {
  FaQuestionCircle,
  FaReply,
  FaCheck,
  FaClock,
  FaEnvelope,
  FaEnvelopeOpen,
  FaSearch,
  FaFilter,
  FaUser,
  FaCalendarAlt,
} from "react-icons/fa";

interface Inquiry {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "pending" | "in_progress" | "completed";
  admin_response?: string;
  created_at: string;
  updated_at: string;
  user_profile?: {
    display_name: string;
    avatar_url?: string;
  };
}

const InquiryManagement: React.FC = () => {
  const { profile } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showReplyModal, setShowReplyModal] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, []);

  useEffect(() => {
    let filtered = inquiries;

    if (searchTerm) {
      filtered = filtered.filter(
        (inquiry) =>
          inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inquiry.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((inquiry) => inquiry.status === statusFilter);
    }

    setFilteredInquiries(filtered);
  }, [inquiries, searchTerm, statusFilter]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("inquiries")
        .select(
          `
          *,
          user_profile:user_profiles!inquiries_user_id_fkey(display_name, avatar_url)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      setInquiries(data || []);
    } catch (error) {
      console.error("문의 목록 로드 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateInquiryStatus = async (id: string, status: Inquiry["status"]) => {
    try {
      const { error } = await supabase
        .from("inquiries")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      setInquiries((prev) =>
        prev.map((inquiry) => (inquiry.id === id ? { ...inquiry, status } : inquiry))
      );

      alert("문의 상태가 성공적으로 변경되었습니다.");
    } catch (error) {
      console.error("상태 변경 오류:", error);
      alert("상태 변경 중 오류가 발생했습니다.");
    }
  };

  const submitReply = async () => {
    if (!selectedInquiry || !replyText.trim()) return;

    try {
      const { error } = await supabase
        .from("inquiries")
        .update({
          admin_response: replyText,
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedInquiry.id);

      if (error) throw error;

      setInquiries((prev) =>
        prev.map((inquiry) =>
          inquiry.id === selectedInquiry.id
            ? { ...inquiry, admin_response: replyText, status: "completed" as const }
            : inquiry
        )
      );

      setShowReplyModal(false);
      setReplyText("");
      setSelectedInquiry(null);
      alert("답변이 성공적으로 등록되었습니다.");
    } catch (error) {
      console.error("답변 등록 오류:", error);
      alert("답변 등록 중 오류가 발생했습니다.");
    }
  };

  const handleReply = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setReplyText(inquiry.admin_response || "");
    setShowReplyModal(true);
  };

  const getStatusColor = (status: Inquiry["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: Inquiry["status"]) => {
    switch (status) {
      case "pending":
        return "대기중";
      case "in_progress":
        return "처리중";
      case "completed":
        return "완료";
      default:
        return "알 수 없음";
    }
  };

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">문의 관리</h1>
          <p className="text-gray-600">사용자 문의를 확인하고 답변합니다.</p>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
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
                <option value="pending">대기중</option>
                <option value="in_progress">처리중</option>
                <option value="completed">완료</option>
              </select>
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
                {filteredInquiries.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    {/* 문의 헤더 */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        {inquiry.user_profile?.avatar_url ? (
                          <img
                            src={inquiry.user_profile.avatar_url}
                            alt="profile"
                            className="w-10 h-10 rounded-full mr-3"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                            <IconWrapper icon={FaUser} className="text-gray-500" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{inquiry.subject}</h3>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <span>{inquiry.name}</span>
                            <span className="mx-2">•</span>
                            <span>{inquiry.email}</span>
                            {inquiry.phone && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{inquiry.phone}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            inquiry.status
                          )}`}
                        >
                          {getStatusText(inquiry.status)}
                        </span>
                        <div className="text-sm text-gray-500">
                          <IconWrapper icon={FaCalendarAlt} className="inline mr-1" size={12} />
                          {new Date(inquiry.created_at).toLocaleDateString("ko-KR")}
                        </div>
                      </div>
                    </div>

                    {/* 문의 내용 */}
                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed">{inquiry.message}</p>
                    </div>

                    {/* 관리자 답변 */}
                    {inquiry.admin_response && (
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                        <h4 className="font-medium text-blue-800 mb-2">관리자 답변</h4>
                        <p className="text-blue-700">{inquiry.admin_response}</p>
                      </div>
                    )}

                    {/* 액션 버튼 */}
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {inquiry.status !== "completed" && (
                          <>
                            <button
                              onClick={() => updateInquiryStatus(inquiry.id, "in_progress")}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center"
                            >
                              <IconWrapper icon={FaClock} className="mr-2" size={16} />
                              처리중으로 변경
                            </button>
                            <button
                              onClick={() => handleReply(inquiry)}
                              className="px-4 py-2 bg-[#FF7648] text-white rounded-lg hover:bg-[#E85A2A] transition-colors text-sm flex items-center"
                            >
                              <IconWrapper icon={FaReply} className="mr-2" size={16} />
                              답변하기
                            </button>
                          </>
                        )}
                        {inquiry.status === "completed" && (
                          <button
                            onClick={() => handleReply(inquiry)}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center"
                          >
                            <IconWrapper icon={FaReply} className="mr-2" size={16} />
                            답변 수정
                          </button>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        수정됨: {new Date(inquiry.updated_at).toLocaleDateString("ko-KR")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredInquiries.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <IconWrapper icon={FaQuestionCircle} className="mx-auto mb-4 text-4xl" />
                  <p>검색 조건에 맞는 문의가 없습니다.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* 통계 */}
        <div className="mt-6 grid md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <IconWrapper icon={FaEnvelope} className="text-blue-600 mr-3" size={24} />
              <div>
                <p className="text-sm text-blue-600">전체 문의</p>
                <p className="text-2xl font-bold text-blue-800">{inquiries.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <IconWrapper icon={FaClock} className="text-yellow-600 mr-3" size={24} />
              <div>
                <p className="text-sm text-yellow-600">대기중</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {inquiries.filter((i) => i.status === "pending").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <IconWrapper icon={FaEnvelopeOpen} className="text-blue-600 mr-3" size={24} />
              <div>
                <p className="text-sm text-blue-600">처리중</p>
                <p className="text-2xl font-bold text-blue-800">
                  {inquiries.filter((i) => i.status === "in_progress").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <IconWrapper icon={FaCheck} className="text-green-600 mr-3" size={24} />
              <div>
                <p className="text-sm text-green-600">완료</p>
                <p className="text-2xl font-bold text-green-800">
                  {inquiries.filter((i) => i.status === "completed").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 답변 모달 */}
        {showReplyModal && selectedInquiry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  문의 답변 {selectedInquiry.admin_response ? "수정" : "작성"}
                </h2>

                {/* 원래 문의 내용 */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2">문의 내용</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {selectedInquiry.name} ({selectedInquiry.email})
                  </p>
                  <p className="text-lg font-medium text-gray-800 mb-2">
                    {selectedInquiry.subject}
                  </p>
                  <p className="text-gray-700">{selectedInquiry.message}</p>
                </div>

                {/* 답변 작성 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">답변 내용</label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={6}
                    placeholder="답변을 작성해주세요..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setShowReplyModal(false);
                      setReplyText("");
                      setSelectedInquiry(null);
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={submitReply}
                    disabled={!replyText.trim()}
                    className="px-6 py-3 bg-[#FF7648] text-white rounded-lg hover:bg-[#E85A2A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    답변 {selectedInquiry.admin_response ? "수정" : "등록"}
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
