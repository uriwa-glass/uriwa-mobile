import React, { useState, useEffect } from "react";
import { supabase } from "../../api/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import IconWrapper from "../../components/IconWrapper";
import {
  FaUser,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaCrown,
  FaUserShield,
  FaCalendarAlt,
  FaEnvelope,
  FaPhone,
  FaEye,
  FaTimes,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  membership_level: string;
  created_at: string;
  email?: string;
  last_sign_in?: string;
  phone?: string;
  birth_date?: string;
}

interface UserStats {
  totalUsers: number;
  adminCount: number;
  premiumCount: number;
  vipCount: number;
  newUsersThisMonth: number;
  activeUsersThisWeek: number;
}

const UserManagement: React.FC = () => {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [membershipFilter, setMembershipFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    adminCount: 0,
    premiumCount: 0,
    vipCount: 0,
    newUsersThisMonth: 0,
    activeUsersThisWeek: 0,
  });

  // 사용자 목록 로드
  useEffect(() => {
    fetchUsers();
  }, []);

  // 검색 및 필터링
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone?.includes(searchTerm)
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    if (membershipFilter !== "all") {
      filtered = filtered.filter((user) => user.membership_level === membershipFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, membershipFilter]);

  // 통계 계산
  useEffect(() => {
    if (users.length > 0) {
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const newStats: UserStats = {
        totalUsers: users.length,
        adminCount: users.filter((u) => u.role === "admin").length,
        premiumCount: users.filter((u) => u.membership_level === "PREMIUM").length,
        vipCount: users.filter((u) => u.membership_level === "VIP").length,
        newUsersThisMonth: users.filter((u) => new Date(u.created_at) >= thisMonth).length,
        activeUsersThisWeek: users.filter(
          (u) => u.last_sign_in && new Date(u.last_sign_in) >= thisWeek
        ).length,
      };

      setStats(newStats);
    }
  }, [users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 사용자 목록 조회 시작");

      // 사용자 프로필과 auth 정보 함께 조회
      const { data: profiles, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profileError) throw profileError;

      console.log("🔍 프로필 데이터:", profiles);

      // auth.users 테이블에서 이메일과 로그인 정보 가져오기
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

      if (authError) {
        console.warn("Auth 사용자 정보 조회 실패:", authError);
        // Auth 정보 없이 프로필만 사용
        const usersWithoutAuth =
          profiles?.map((profile) => ({
            ...profile,
            email: profile.email || "알 수 없음",
            last_sign_in: null,
          })) || [];
        setUsers(usersWithoutAuth);
        return;
      }

      console.log("🔍 Auth 데이터:", authData);

      // 프로필과 auth 정보 결합
      const usersWithAuth =
        profiles?.map((profile) => {
          const authUser = authData.users.find((user) => user.id === profile.user_id);
          return {
            ...profile,
            email: authUser?.email || profile.email || "알 수 없음",
            last_sign_in: authUser?.last_sign_in_at,
          };
        }) || [];

      console.log("🔍 최종 사용자 데이터:", usersWithAuth);
      setUsers(usersWithAuth);
    } catch (error) {
      console.error("❌ 사용자 목록 로드 오류:", error);
      setError("사용자 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (
      !window.confirm(
        `정말로 이 사용자의 권한을 ${
          newRole === "admin" ? "관리자" : "일반 사용자"
        }로 변경하시겠습니까?`
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) throw error;

      // 로컬 상태 업데이트
      setUsers((prev) =>
        prev.map((user) => (user.user_id === userId ? { ...user, role: newRole } : user))
      );

      alert("권한이 성공적으로 변경되었습니다.");
    } catch (error) {
      console.error("권한 변경 오류:", error);
      alert("권한 변경 중 오류가 발생했습니다.");
    }
  };

  const handleMembershipChange = async (userId: string, newLevel: string) => {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ membership_level: newLevel })
        .eq("user_id", userId);

      if (error) throw error;

      // 로컬 상태 업데이트
      setUsers((prev) =>
        prev.map((user) =>
          user.user_id === userId ? { ...user, membership_level: newLevel } : user
        )
      );

      alert("멤버십 레벨이 성공적으로 변경되었습니다.");
    } catch (error) {
      console.error("멤버십 변경 오류:", error);
      alert("멤버십 변경 중 오류가 발생했습니다.");
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm("정말로 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."))
      return;

    try {
      // Supabase Auth에서 사용자 삭제 (관리자 권한 필요)
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;

      // 로컬 상태에서 제거
      setUsers((prev) => prev.filter((user) => user.user_id !== userId));

      alert("사용자가 성공적으로 삭제되었습니다.");
    } catch (error) {
      console.error("사용자 삭제 오류:", error);
      alert("사용자 삭제 중 오류가 발생했습니다. 관리자 권한이 필요할 수 있습니다.");
    }
  };

  const handleViewUser = (user: UserProfile) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedUser(null);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "없음";
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMembershipBadge = (level: string) => {
    switch (level) {
      case "PREMIUM":
        return (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
            프리미엄
          </span>
        );
      case "VIP":
        return (
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">VIP</span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">일반</span>
        );
    }
  };

  if (profile?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8 lg:pl-16">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <IconWrapper icon={FaExclamationTriangle} className="text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-semibold text-red-800 mb-2">접근 권한 없음</h2>
            <p className="text-red-600">이 페이지에 접근하려면 관리자 권한이 필요합니다.</p>
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">사용자 관리</h1>
          <p className="text-gray-600">등록된 사용자들의 정보와 권한을 관리합니다.</p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <IconWrapper icon={FaExclamationTriangle} className="text-red-500 mr-3" size={20} />
              <p className="text-red-800">{error}</p>
              <button
                onClick={fetchUsers}
                className="ml-auto px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="text-center">
              <IconWrapper icon={FaUser} className="text-blue-600 mb-2 mx-auto" size={24} />
              <p className="text-2xl font-bold text-blue-800">{stats.totalUsers}</p>
              <p className="text-sm text-blue-600">전체 사용자</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="text-center">
              <IconWrapper icon={FaCrown} className="text-yellow-600 mb-2 mx-auto" size={24} />
              <p className="text-2xl font-bold text-yellow-800">{stats.adminCount}</p>
              <p className="text-sm text-yellow-600">관리자</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="text-center">
              <IconWrapper icon={FaUserShield} className="text-green-600 mb-2 mx-auto" size={24} />
              <p className="text-2xl font-bold text-green-800">{stats.premiumCount}</p>
              <p className="text-sm text-green-600">프리미엄</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="text-center">
              <IconWrapper icon={FaUserShield} className="text-purple-600 mb-2 mx-auto" size={24} />
              <p className="text-2xl font-bold text-purple-800">{stats.vipCount}</p>
              <p className="text-sm text-purple-600">VIP</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="text-center">
              <IconWrapper
                icon={FaCalendarAlt}
                className="text-indigo-600 mb-2 mx-auto"
                size={24}
              />
              <p className="text-2xl font-bold text-indigo-800">{stats.newUsersThisMonth}</p>
              <p className="text-sm text-indigo-600">이달 신규</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="text-center">
              <IconWrapper icon={FaUser} className="text-emerald-600 mb-2 mx-auto" size={24} />
              <p className="text-2xl font-bold text-emerald-800">{stats.activeUsersThisWeek}</p>
              <p className="text-sm text-emerald-600">주간 활성</p>
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
                placeholder="이름, 이메일, 전화번호로 검색..."
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
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
              >
                <option value="all">모든 권한</option>
                <option value="user">일반 사용자</option>
                <option value="admin">관리자</option>
              </select>
            </div>
            <div className="relative">
              <IconWrapper
                icon={FaFilter}
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <select
                value={membershipFilter}
                onChange={(e) => setMembershipFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
              >
                <option value="all">모든 멤버십</option>
                <option value="REGULAR">일반</option>
                <option value="PREMIUM">프리미엄</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
          </div>
        </div>

        {/* 사용자 목록 */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF7648] mx-auto"></div>
              <p className="mt-4 text-gray-600">사용자 목록을 불러오는 중...</p>
            </div>
          ) : (
            <>
              {/* 테이블 헤더 - 모바일에서는 숨김 */}
              <div className="hidden md:block bg-gray-50 px-6 py-4 border-b">
                <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
                  <div className="col-span-3">사용자</div>
                  <div className="col-span-2">이메일</div>
                  <div className="col-span-2">권한</div>
                  <div className="col-span-2">멤버십</div>
                  <div className="col-span-2">가입일</div>
                  <div className="col-span-1">액션</div>
                </div>
              </div>

              {/* 사용자 목록 */}
              <div className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="px-6 py-4 hover:bg-gray-50">
                    {/* 데스크톱 레이아웃 */}
                    <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                      {/* 사용자 정보 */}
                      <div className="col-span-3 flex items-center">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt="profile"
                            className="w-10 h-10 rounded-full mr-3"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                            <IconWrapper icon={FaUser} className="text-gray-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-800">{user.display_name}</p>
                          {user.full_name && (
                            <p className="text-sm text-gray-600">{user.full_name}</p>
                          )}
                        </div>
                      </div>

                      {/* 이메일 */}
                      <div className="col-span-2">
                        <p className="text-sm text-gray-800 truncate">{user.email}</p>
                      </div>

                      {/* 권한 */}
                      <div className="col-span-2">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                          disabled={user.user_id === profile?.user_id} // 자기 자신의 권한은 변경 불가
                        >
                          <option value="user">일반 사용자</option>
                          <option value="admin">관리자</option>
                        </select>
                        {user.role === "admin" && (
                          <IconWrapper
                            icon={FaCrown}
                            className="inline ml-2 text-yellow-500"
                            size={16}
                          />
                        )}
                      </div>

                      {/* 멤버십 */}
                      <div className="col-span-2">
                        <select
                          value={user.membership_level}
                          onChange={(e) => handleMembershipChange(user.user_id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="REGULAR">일반</option>
                          <option value="PREMIUM">프리미엄</option>
                          <option value="VIP">VIP</option>
                        </select>
                      </div>

                      {/* 가입일 */}
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">
                          {new Date(user.created_at).toLocaleDateString("ko-KR")}
                        </p>
                      </div>

                      {/* 액션 */}
                      <div className="col-span-1">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="상세 보기"
                          >
                            <IconWrapper icon={FaEye} size={16} />
                          </button>
                          {user.user_id !== profile?.user_id && ( // 자기 자신은 삭제 불가
                            <button
                              onClick={() => deleteUser(user.user_id)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="삭제"
                            >
                              <IconWrapper icon={FaTrash} size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 모바일 레이아웃 */}
                    <div className="md:hidden">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt="profile"
                              className="w-12 h-12 rounded-full mr-3"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                              <IconWrapper icon={FaUser} className="text-gray-500" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-800">{user.display_name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            {user.full_name && (
                              <p className="text-xs text-gray-500">{user.full_name}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {user.role === "admin" && (
                            <IconWrapper icon={FaCrown} className="text-yellow-500" size={16} />
                          )}
                          {getMembershipBadge(user.membership_level)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          가입: {new Date(user.created_at).toLocaleDateString("ko-KR")}
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                          >
                            상세
                          </button>
                          {user.user_id !== profile?.user_id && (
                            <button
                              onClick={() => deleteUser(user.user_id)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                            >
                              삭제
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredUsers.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <IconWrapper icon={FaInfoCircle} className="mb-4 mx-auto" size={48} />
                  <p className="text-lg mb-2">사용자가 없습니다</p>
                  <p className="text-sm">
                    {searchTerm || roleFilter !== "all" || membershipFilter !== "all"
                      ? "검색 조건에 맞는 사용자가 없습니다."
                      : "아직 등록된 사용자가 없습니다."}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* 사용자 상세 모달 */}
        {showDetailModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* 모달 헤더 */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">사용자 상세 정보</h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    <IconWrapper icon={FaTimes} />
                  </button>
                </div>

                {/* 사용자 기본 정보 */}
                <div className="flex items-center mb-6">
                  {selectedUser.avatar_url ? (
                    <img
                      src={selectedUser.avatar_url}
                      alt="profile"
                      className="w-20 h-20 rounded-full mr-6"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mr-6">
                      <IconWrapper icon={FaUser} className="text-gray-500" size={32} />
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {selectedUser.display_name}
                    </h3>
                    {selectedUser.full_name && (
                      <p className="text-lg text-gray-600">{selectedUser.full_name}</p>
                    )}
                    <div className="flex items-center space-x-3 mt-2">
                      {selectedUser.role === "admin" && (
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                          <IconWrapper icon={FaCrown} className="mr-1" size={12} />
                          관리자
                        </span>
                      )}
                      {getMembershipBadge(selectedUser.membership_level)}
                    </div>
                  </div>
                </div>

                {/* 상세 정보 */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">연락처 정보</h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <IconWrapper icon={FaEnvelope} className="text-gray-400 mr-3" size={16} />
                        <span className="text-gray-800">{selectedUser.email}</span>
                      </div>
                      {selectedUser.phone && (
                        <div className="flex items-center">
                          <IconWrapper icon={FaPhone} className="text-gray-400 mr-3" size={16} />
                          <span className="text-gray-800">{selectedUser.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">계정 정보</h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <IconWrapper
                          icon={FaCalendarAlt}
                          className="text-gray-400 mr-3"
                          size={16}
                        />
                        <div>
                          <p className="text-sm text-gray-600">가입일</p>
                          <p className="text-gray-800">{formatDate(selectedUser.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <IconWrapper icon={FaUser} className="text-gray-400 mr-3" size={16} />
                        <div>
                          <p className="text-sm text-gray-600">마지막 로그인</p>
                          <p className="text-gray-800">{formatDate(selectedUser.last_sign_in)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 권한 및 멤버십 변경 */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-4">권한 관리</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        사용자 권한
                      </label>
                      <select
                        value={selectedUser.role}
                        onChange={(e) => {
                          handleRoleChange(selectedUser.user_id, e.target.value);
                          setSelectedUser({ ...selectedUser, role: e.target.value });
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                        disabled={selectedUser.user_id === profile?.user_id}
                      >
                        <option value="user">일반 사용자</option>
                        <option value="admin">관리자</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        멤버십 레벨
                      </label>
                      <select
                        value={selectedUser.membership_level}
                        onChange={(e) => {
                          handleMembershipChange(selectedUser.user_id, e.target.value);
                          setSelectedUser({ ...selectedUser, membership_level: e.target.value });
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FF7648] focus:border-transparent"
                      >
                        <option value="REGULAR">일반</option>
                        <option value="PREMIUM">프리미엄</option>
                        <option value="VIP">VIP</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    닫기
                  </button>
                  {selectedUser.user_id !== profile?.user_id && (
                    <button
                      onClick={() => {
                        deleteUser(selectedUser.user_id);
                        closeModal();
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      사용자 삭제
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
