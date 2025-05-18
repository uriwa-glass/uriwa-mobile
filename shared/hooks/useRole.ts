import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../api/supabaseClient";

/**
 * 사용자 역할 관리를 위한 커스텀 훅
 * @returns 역할 관련 함수와 상태
 */
export const useRole = () => {
  const { user, profile, isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * 사용자 역할 변경 함수
   * @param userId 역할을 변경할 사용자 ID
   * @param role 새 역할 ('user' | 'admin')
   */
  const changeUserRole = async (userId: string, role: "user" | "admin") => {
    if (!user || !isAdmin) {
      setError(new Error("권한이 없습니다. 관리자만 역할을 변경할 수 있습니다."));
      return { error: new Error("권한이 없습니다. 관리자만 역할을 변경할 수 있습니다.") };
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ role, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) throw error;

      return { error: null };
    } catch (err) {
      const error = err as Error;
      setError(error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 역할로 사용자 목록 조회
   * @param role 조회할 역할 ('user' | 'admin')
   */
  const getUsersByRole = async (role?: "user" | "admin") => {
    if (!user || !isAdmin) {
      setError(new Error("권한이 없습니다. 관리자만 사용자 목록을 조회할 수 있습니다."));
      return {
        data: null,
        error: new Error("권한이 없습니다. 관리자만 사용자 목록을 조회할 수 있습니다."),
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      // 역할이 지정된 경우 해당 역할로 필터링
      if (role) {
        query = query.eq("role", role);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (err) {
      const error = err as Error;
      setError(error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 현재 사용자가 특정 역할을 가지고 있는지 확인
   * @param requiredRole 확인할 역할 ('user' | 'admin')
   * @returns 해당 역할을 가지고 있는지 여부
   */
  const hasRole = (requiredRole: "user" | "admin"): boolean => {
    if (!user || !profile) return false;

    if (requiredRole === "admin") {
      return isAdmin;
    }

    return true; // 로그인한 모든 사용자는 기본적으로 'user' 역할을 가짐
  };

  return {
    changeUserRole,
    getUsersByRole,
    hasRole,
    isLoading,
    error,
    isAdmin,
  };
};

export default useRole;
