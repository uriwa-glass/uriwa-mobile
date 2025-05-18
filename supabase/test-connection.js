/**
 * Supabase 연결 테스트 스크립트
 *
 * 이 스크립트는 Supabase 프로젝트 설정이 올바르게 되었는지 확인합니다.
 * 환경 변수에서 Supabase URL과 Anon Key를 가져와 연결을 테스트합니다.
 */

// dotenv 설정 (환경 변수 로드)
require("dotenv").config();

// Supabase 클라이언트 가져오기
const { createClient } = require("@supabase/supabase-js");

// 환경 변수에서 Supabase URL과 Anon Key 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 환경 변수 확인
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("환경 변수가 설정되지 않았습니다. .env 파일을 확인하세요.");
  console.error("필요한 환경 변수: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

// Supabase 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 연결 테스트 함수
async function testConnection() {
  try {
    console.log("Supabase 연결 테스트 중...");

    // 서버 시간 가져오기 (간단한 쿼리)
    const { data, error } = await supabase.from("classes").select("count", { count: "exact" });

    if (error) {
      throw error;
    }

    console.log("Supabase 연결 성공!");
    console.log("Classes 테이블 레코드 수:", data.count);

    // 사용자 세션 확인
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.warn("세션 확인 중 오류 발생:", sessionError.message);
    } else {
      if (sessionData && sessionData.session) {
        console.log("현재 로그인된 사용자:", sessionData.session.user.email);
      } else {
        console.log("로그인된 사용자 없음");
      }
    }
  } catch (error) {
    console.error("Supabase 연결 실패:", error.message);
    process.exit(1);
  }
}

// 테스트 실행
testConnection();
