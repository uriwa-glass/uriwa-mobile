import { supabase } from "./supabaseClient";
import { UserSession, SessionTransaction } from "../types"; // UserSession, SessionTransaction 타입 정의 필요

export interface UserSessionResult {
  success: boolean;
  message?: string;
  session?: UserSession | null;
  error?: any;
}

export interface SessionHistoryResult {
  success: boolean;
  message?: string;
  history?: SessionTransaction[];
  error?: any;
}

/**
 * 특정 사용자의 현재 유효한 세션 정보를 가져옵니다.
 * 가장 만료일이 늦게 도래하거나, 여러 개일 경우 가장 최근에 생성된 활성 세션 등을 기준으로 가져올 수 있음.
 * 여기서는 가장 만료일이 많이 남은 세션 중 하나를 가져오거나, 혹은 세션 ID를 특정할 수 있는 다른 기준이 필요할 수 있음.
 * 우선은 user_id로 조회되는 첫 번째 유효 세션을 가져오는 것으로 구현.
 * @param userId - 사용자 ID
 * @returns {Promise<UserSessionResult>} - 사용자 세션 정보
 */
export const getUserActiveSession = async (userId: string): Promise<UserSessionResult> => {
  try {
    const { data: session, error } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("user_id", userId)
      .gte("expiry_date", new Date().toISOString()) // 만료되지 않은 세션
      .order("created_at", { ascending: false }) // 가장 최근에 생성된 세션 우선
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!session) {
      return {
        success: true, // 오류는 아니지만 세션이 없는 경우
        message: "활성 세션이 없습니다.",
        session: null,
      };
    }

    return {
      success: true,
      session: session as UserSession, // 타입 단언
    };
  } catch (error) {
    console.error("Error fetching user active session:", error);
    return {
      success: false,
      message: "활성 세션 조회 중 오류가 발생했습니다.",
      error,
    };
  }
};

/**
 * 특정 사용자의 세션 트랜잭션 내역을 가져옵니다.
 * @param userId - 사용자 ID
 * @param limit - 가져올 내역 수 (기본값 20)
 * @param offset - 건너뛸 내역 수 (페이지네이션용)
 * @returns {Promise<SessionHistoryResult>} - 세션 트랜잭션 내역
 */
export const getUserSessionHistory = async (
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<SessionHistoryResult> => {
  try {
    const {
      data: history,
      error,
      count,
    } = await supabase
      .from("session_transactions")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      success: true,
      history: history as SessionTransaction[],
      // count 변수를 사용하여 페이지네이션 정보 구성 가능
    };
  } catch (error) {
    console.error("Error fetching user session history:", error);
    return {
      success: false,
      message: "세션 내역 조회 중 오류가 발생했습니다.",
      error,
    };
  }
};
