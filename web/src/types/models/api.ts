// API 응답 기본 인터페이스
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

// 페이지네이션 정보
export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// 페이지네이션 포함 응답
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

// 페이지네이션 요청 파라미터
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// 필터 옵션
export interface FilterOptions {
  status?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
  category?: string;
  [key: string]: string | undefined;
}

// API 에러
export interface ApiError {
  statusCode: number;
  message: string;
  details?: any;
}

// API 요청 옵션
export interface ApiRequestOptions {
  headers?: Record<string, string>;
  withCredentials?: boolean;
  timeout?: number;
  signal?: AbortSignal;
}

// API 요청 상태
export interface ApiRequestState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  timestamp: number | null;
}

// 파일 업로드 응답
export interface FileUploadResponse {
  success: boolean;
  file: {
    url: string;
    key: string;
    filename: string;
    size: number;
    mimeType: string;
  };
  error?: string;
}

// API 리소스 경로
export enum ApiResourcePath {
  USERS = "/users",
  CLASSES = "/classes",
  SCHEDULES = "/schedules",
  RESERVATIONS = "/reservations",
  CANCELLATIONS = "/cancellations",
  AUTH = "/auth",
  UPLOADS = "/uploads",
  ANALYTICS = "/analytics",
}
