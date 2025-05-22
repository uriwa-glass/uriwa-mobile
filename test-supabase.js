// Supabase 로컬 인스턴스 연결 테스트 스크립트
const { createClient } = require("@supabase/supabase-js");

// 로컬 Supabase URL 및 키 설정
const SUPABASE_URL = "http://127.0.0.1:54321";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

// Supabase 클라이언트 생성
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testSupabase() {
  try {
    console.log("로컬 Supabase 연결 테스트 중...");

    // 1. 기본 연결 테스트
    const { data: healthCheck, error: healthError } = await supabase.from("_health").select("*");
    if (healthError) {
      console.error("Supabase 연결 오류:", healthError);
    } else {
      console.log("Supabase 연결 성공!");
    }

    // 2. user_profiles 테이블 테스트
    const { data: profiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("*")
      .limit(5);

    if (profilesError) {
      console.error("user_profiles 조회 오류:", profilesError);
    } else {
      console.log("user_profiles 조회 성공, 결과:", profiles);
    }

    // 3. form_templates 테이블 테스트
    const { data: templates, error: templatesError } = await supabase
      .from("form_templates")
      .select("*")
      .limit(2);

    if (templatesError) {
      console.error("form_templates 조회 오류:", templatesError);
    } else {
      console.log("form_templates 조회 성공, 결과:", templates);
    }

    console.log("모든 테스트 완료.");
  } catch (error) {
    console.error("예상치 못한 오류 발생:", error);
  }
}

// 테스트 실행
testSupabase();
