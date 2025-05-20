import { useEffect } from "react";

// 이 컴포넌트는 환경 변수가 올바르게 로드되었는지 확인하고 콘솔에 로깅합니다.
// 실제 UI를 렌더링하지 않습니다.

const EnvChecker = () => {
  useEffect(() => {
    // 로드된 환경 변수 확인
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
      REACT_APP_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY ? "있음" : "없음",
    };

    console.group("환경 변수 확인");
    console.log("환경 변수:", envVars);

    // 환경 변수가 없을 경우 경고
    if (!process.env.REACT_APP_SUPABASE_URL) {
      console.error("REACT_APP_SUPABASE_URL이 설정되지 않았습니다!");
    }

    if (!process.env.REACT_APP_SUPABASE_ANON_KEY) {
      console.error("REACT_APP_SUPABASE_ANON_KEY가 설정되지 않았습니다!");
    }

    console.groupEnd();
  }, []);

  // UI를 렌더링하지 않음
  return null;
};

export default EnvChecker;
