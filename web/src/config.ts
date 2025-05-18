/**
 * 애플리케이션 설정
 */

// API 엔드포인트
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://api.uriwa.com/v1";

// 페이지네이션 기본 설정
export const DEFAULT_PAGE_SIZE = 10;

// 이미지 베이스 URL
export const IMAGE_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL || "https://images.uriwa.com";

// 시간 관련 설정
export const DATE_FORMAT = "yyyy년 M월 d일";
export const DATETIME_FORMAT = "yyyy년 M월 d일 HH:mm";

// 환경 설정
export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
export const IS_PRODUCTION = process.env.NODE_ENV === "production";
