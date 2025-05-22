import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

/**
 * Supabase 클라이언트 생성
 * 하이브리드 접근 방식:
 * 1. 인증은 클라우드 Supabase 사용 (Google 로그인 등 OAuth 제공)
 * 2. 데이터 작업은 개발 환경에서 로컬 Supabase 사용
 */

// Supabase URL과 API 키를 환경 변수에서 가져옴
// Extra App Config, .env 파일 또는 프로세스 환경 변수에서 불러옴
const getEnvVar = (name: string): string => {
  // Expo의 Constants.expoConfig.extra에서 환경 변수 검색
  if (
    Constants.expoConfig?.extra &&
    typeof Constants.expoConfig.extra === "object" &&
    Constants.expoConfig.extra !== null &&
    name in Constants.expoConfig.extra
  ) {
    return (Constants.expoConfig.extra as Record<string, string>)[name];
  }

  // process.env에서 환경 변수 검색
  return process.env[name] || "";
};

// 개발 환경 확인
const isDev =
  process.env.NODE_ENV === "development" || Constants.expoConfig?.extra?.APP_ENV === "development";

// 데이터 작업용 Supabase URL (로컬 또는 프로덕션)
const dataUrl = isDev
  ? getEnvVar("SUPABASE_URL") || "http://127.0.0.1:54321"
  : getEnvVar("SUPABASE_URL") || "https://uspesxpwtedjzmffimyc.supabase.co";

// 인증용 Supabase URL (항상 클라우드)
const authUrl = "https://uspesxpwtedjzmffimyc.supabase.co";

// Anon Key 설정
const supabaseAnonKey =
  getEnvVar("SUPABASE_ANON_KEY") ||
  (isDev
    ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
    : "");

// 프로덕션 Anon Key
const prodAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzcGVzeHB3dGVkanptZmZpbXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NzUyODUsImV4cCI6MjA2MzE1MTI4NX0.1H4wPP3CpFhJHbdb18gtqbOeG41zc0ZncG-QCqufPEI";

// 키가 설정되지 않았을 때 콘솔 경고
if (!supabaseAnonKey) {
  console.warn(
    "Supabase Anon Key가 설정되지 않았습니다. " +
      "app.config.js 또는 .env 파일에 SUPABASE_ANON_KEY를 설정해 주세요."
  );
}

// 환경 정보 로깅
console.log(`[데이터] Supabase 연결 URL: ${dataUrl}`);
console.log(`[인증] Supabase 연결 URL: ${authUrl}`);
console.log(`Supabase Anon Key 설정됨: ${!!supabaseAnonKey}`);
console.log(`환경: ${isDev ? "개발(로컬)" : "프로덕션"}`);

// 인증용 Supabase 클라이언트 (항상 클라우드)
export const authClient = createClient(authUrl, prodAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// 데이터 작업용 Supabase 클라이언트 (개발 환경에서는 로컬, 프로덕션에서는 클라우드)
const supabase = createClient(dataUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
