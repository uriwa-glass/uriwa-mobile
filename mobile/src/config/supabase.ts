import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

/**
 * Supabase 클라이언트 생성
 * 애플리케이션에서 사용할 Supabase 인스턴스를 설정합니다.
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

const supabaseUrl = getEnvVar("SUPABASE_URL") || "https://uspesxpwtedjzmffimyc.supabase.co";
const supabaseAnonKey = getEnvVar("SUPABASE_ANON_KEY") || "";

// 키가 설정되지 않았을 때 콘솔 경고
if (!supabaseAnonKey) {
  console.warn(
    "Supabase Anon Key가 설정되지 않았습니다. " +
      "app.config.js 또는 .env 파일에 SUPABASE_ANON_KEY를 설정해 주세요."
  );
}

// Supabase 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
