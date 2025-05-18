import { supabase } from "./supabaseClient";
import {
  UserInquiry,
  UserInquiryMessage,
  UserInquiryFilter,
  UserInquiryCreateData,
} from "../types";
import { API_BASE_URL } from "../config";

/**
 * 사용자 문의를 관리하는 서비스
 * 문의 조회, 생성, 답변, 상태 업데이트 기능을 제공합니다.
 */

export interface InquiryResult {
  success: boolean;
  message?: string;
  inquiry?: UserInquiry;
  inquiries?: UserInquiry[];
  count?: number;
  error?: any;
}

export interface InquiryMessageResult {
  success: boolean;
  message?: string;
  inquiryMessage?: UserInquiryMessage;
  error?: any;
}

/**
 * 사용자의 모든 문의 내역을 가져옵니다.
 * @param {string} userId - 사용자 ID
 * @param {UserInquiryFilter} filter - 필터링 옵션
 * @param {number} page - 페이지 번호 (기본값: 1)
 * @param {number} limit - 페이지당 항목 수 (기본값: 10)
 * @returns {Promise<InquiryResult>} - 문의 목록 결과
 */
export const getUserInquiries = async (
  userId: string,
  filter?: UserInquiryFilter,
  page: number = 1,
  limit: number = 10
): Promise<InquiryResult> => {
  try {
    // API 엔드포인트 구성
    let url = `${API_BASE_URL}/inquiries/user/${userId}?page=${page}&limit=${limit}`;

    // 필터 추가
    if (filter) {
      if (filter.status) url += `&status=${filter.status}`;
      if (filter.category) url += `&category=${filter.category}`;
      if (filter.startDate) url += `&startDate=${filter.startDate}`;
      if (filter.endDate) url += `&endDate=${filter.endDate}`;
      if (filter.searchQuery) url += `&search=${filter.searchQuery}`;
      if (filter.isRead !== undefined) url += `&isRead=${filter.isRead}`;
    }

    // API 호출
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const result = await response.json();

    return {
      success: true,
      inquiries: result.data,
      count: result.count,
    };
  } catch (error) {
    console.error("문의 내역을 가져오는 중 오류가 발생했습니다:", error);
    return {
      success: false,
      message: "문의 내역을 불러올 수 없습니다.",
      error,
    };
  }
};

/**
 * 문의 내역 상세 정보를 가져옵니다.
 * @param {string} inquiryId - 문의 ID
 * @returns {Promise<InquiryResult>} - 문의 상세 정보
 */
export const getInquiryDetail = async (inquiryId: string): Promise<InquiryResult> => {
  try {
    // API 호출
    const response = await fetch(`${API_BASE_URL}/inquiries/${inquiryId}`);

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const inquiry = await response.json();

    // 문의를 읽음으로 표시
    await markInquiryAsRead(inquiryId);

    return {
      success: true,
      inquiry,
    };
  } catch (error) {
    console.error("문의 상세 정보를 가져오는 중 오류가 발생했습니다:", error);
    return {
      success: false,
      message: "문의 상세 정보를 불러올 수 없습니다.",
      error,
    };
  }
};

/**
 * 새로운 문의를 생성합니다.
 * @param {string} userId - 사용자 ID
 * @param {UserInquiryCreateData} inquiryData - 문의 데이터
 * @returns {Promise<InquiryResult>} - 생성된 문의 정보
 */
export const createInquiry = async (
  userId: string,
  inquiryData: UserInquiryCreateData
): Promise<InquiryResult> => {
  try {
    // API 호출
    const response = await fetch(`${API_BASE_URL}/inquiries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        ...inquiryData,
      }),
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const createdInquiry = await response.json();

    return {
      success: true,
      message: "문의가 성공적으로 등록되었습니다.",
      inquiry: createdInquiry,
    };
  } catch (error) {
    console.error("문의 등록 중 오류가 발생했습니다:", error);
    return {
      success: false,
      message: "문의를 등록할 수 없습니다.",
      error,
    };
  }
};

/**
 * 문의에 메시지를 추가합니다.
 * @param {string} inquiryId - 문의 ID
 * @param {string} userId - 사용자 ID
 * @param {string} content - 메시지 내용
 * @param {string[]} attachmentUrls - 첨부 파일 URL 목록
 * @returns {Promise<InquiryMessageResult>} - 생성된 메시지 정보
 */
export const addInquiryMessage = async (
  inquiryId: string,
  userId: string,
  content: string,
  attachmentUrls: string[] = []
): Promise<InquiryMessageResult> => {
  try {
    // API 호출
    const response = await fetch(`${API_BASE_URL}/inquiries/${inquiryId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender_id: userId,
        content,
        attachment_urls: attachmentUrls,
        is_admin: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const createdMessage = await response.json();

    return {
      success: true,
      message: "메시지가 성공적으로 전송되었습니다.",
      inquiryMessage: createdMessage,
    };
  } catch (error) {
    console.error("메시지 전송 중 오류가 발생했습니다:", error);
    return {
      success: false,
      message: "메시지를 전송할 수 없습니다.",
      error,
    };
  }
};

/**
 * 문의를 읽음으로 표시합니다.
 * @param {string} inquiryId - 문의 ID
 * @returns {Promise<boolean>} - 성공 여부
 */
export const markInquiryAsRead = async (inquiryId: string): Promise<boolean> => {
  try {
    // API 호출
    const response = await fetch(`${API_BASE_URL}/inquiries/${inquiryId}/read`, {
      method: "PUT",
    });

    return response.ok;
  } catch (error) {
    console.error("문의 읽음 표시 중 오류가 발생했습니다:", error);
    return false;
  }
};

/**
 * 문의 상태를 업데이트합니다.
 * @param {string} inquiryId - 문의 ID
 * @param {InquiryStatus} status - 새로운 상태
 * @returns {Promise<InquiryResult>} - 업데이트된 문의 정보
 */
export const updateInquiryStatus = async (
  inquiryId: string,
  status: string
): Promise<InquiryResult> => {
  try {
    // API 호출
    const response = await fetch(`${API_BASE_URL}/inquiries/${inquiryId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const updatedInquiry = await response.json();

    return {
      success: true,
      message: "문의 상태가 성공적으로 변경되었습니다.",
      inquiry: updatedInquiry,
    };
  } catch (error) {
    console.error("문의 상태 업데이트 중 오류가 발생했습니다:", error);
    return {
      success: false,
      message: "문의 상태를 변경할 수 없습니다.",
      error,
    };
  }
};

/**
 * 읽지 않은 문의 개수를 가져옵니다.
 * @param {string} userId - 사용자 ID
 * @returns {Promise<number>} - 읽지 않은 문의 개수
 */
export const getUnreadInquiriesCount = async (userId: string): Promise<number> => {
  try {
    // API 호출
    const response = await fetch(`${API_BASE_URL}/inquiries/user/${userId}/unread/count`);

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const result = await response.json();

    return result.count || 0;
  } catch (error) {
    console.error("읽지 않은 문의 개수를 가져오는 중 오류가 발생했습니다:", error);
    return 0;
  }
};
