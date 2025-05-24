import React, { useState, useEffect } from "react";
import { supabase } from "../../api/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import IconWrapper from "../../components/IconWrapper";
import { FaUser, FaEdit, FaTrash, FaSearch, FaFilter, FaCrown, FaUserShield } from "react-icons/fa";

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
}

const UserManagement: React.FC = () => {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

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
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // 사용자 프로필과 auth 정보 함께 조회
      const { data: profiles, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profileError) throw profileError;

      // auth.users 테이블에서 이메일과 로그인 정보 가져오기
      const userIds = profiles?.map((p) => p.user_id) || [];
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

      if (authError) throw authError;

      // 프로필과 auth 정보 결합
      const usersWithAuth =
        profiles?.map((profile) => {
          const authUser = authUsers.users.find((user) => user.id === profile.user_id);
          return {
            ...profile,
            email: authUser?.email,
            last_sign_in: authUser?.last_sign_in_at,
          };
        }) || [];

      setUsers(usersWithAuth);
    } catch (error) {
      console.error("사용자 목록 로드 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
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
    if (!window.confirm("정말로 이 사용자를 삭제하시겠습니까?")) return;

    try {
      // Supabase Auth에서 사용자 삭제 (관리자 권한 필요)
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;

      // 로컬 상태에서 제거
      setUsers((prev) => prev.filter((user) => user.user_id !== userId));

      alert("사용자가 성공적으로 삭제되었습니다.");
    } catch (error) {
      console.error("사용자 삭제 오류:", error);
      alert("사용자 삭제 중 오류가 발생했습니다.");
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">사용자 관리</h1>
          <p className="text-gray-600">등록된 사용자들의 정보와 권한을 관리합니다.</p>
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
                placeholder="이름, 이메일로 검색..."
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
              {/* 테이블 헤더 */}
              <div className="bg-gray-50 px-6 py-4 border-b">
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
                    <div className="grid grid-cols-12 gap-4 items-center">
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
                        <p className="text-sm text-gray-800">{user.email}</p>
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
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="편집"
                          >
                            <IconWrapper icon={FaEdit} size={16} />
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
                  </div>
                ))}
              </div>

              {filteredUsers.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <p>검색 조건에 맞는 사용자가 없습니다.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* 통계 */}
        <div className="mt-6 grid md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <IconWrapper icon={FaUser} className="text-blue-600 mr-3" size={24} />
              <div>
                <p className="text-sm text-blue-600">전체 사용자</p>
                <p className="text-2xl font-bold text-blue-800">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <IconWrapper icon={FaCrown} className="text-yellow-600 mr-3" size={24} />
              <div>
                <p className="text-sm text-yellow-600">관리자</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {users.filter((u) => u.role === "admin").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <IconWrapper icon={FaUserShield} className="text-green-600 mr-3" size={24} />
              <div>
                <p className="text-sm text-green-600">프리미엄 회원</p>
                <p className="text-2xl font-bold text-green-800">
                  {users.filter((u) => u.membership_level === "PREMIUM").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <IconWrapper icon={FaUserShield} className="text-purple-600 mr-3" size={24} />
              <div>
                <p className="text-sm text-purple-600">VIP 회원</p>
                <p className="text-2xl font-bold text-purple-800">
                  {users.filter((u) => u.membership_level === "VIP").length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
