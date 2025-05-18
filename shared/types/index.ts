/**
 * 공유 타입 정의
 *
 * 웹과 모바일 앱 모두에서 사용되는 공통 타입들을 정의합니다.
 */

// 사용자 타입
export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  createdAt: string;
}

// 클래스 타입
export interface Class {
  id: string;
  title: string;
  description: string;
  instructor: string;
  maxCapacity: number;
  currentRegistered: number;
  date: string;
  startTime: string;
  endTime: string;
  imageUrl?: string;
}

// 예약 타입
export interface Reservation {
  id: string;
  userId: string;
  classId: string;
  status: "confirmed" | "cancelled" | "pending";
  createdAt: string;
}

// 갤러리 항목 타입
export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  category: string;
  createdAt: string;
}

// 문의 타입
export interface Inquiry {
  id: string;
  userId: string;
  title: string;
  content: string;
  status: "pending" | "answered";
  createdAt: string;
  answeredAt?: string;
  attachments?: string[];
}

// 웹뷰와 네이티브 앱 간 메시지 타입
export interface WebViewMessage {
  type: string;
  data: any;
}
