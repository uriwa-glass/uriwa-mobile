import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../api/supabaseClient";
import LoadingScreen from "../components/LoadingScreen";

/**
 * 인증 콜백 처리 페이지
 *
 * 이 페이지는 OAuth 로그인 후 리디렉션되어 세션을 처리합니다.
 * 주로 개발 환경에서 Google OAuth 로그인을 위해 필요합니다.
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // URL 해시와 쿼리 파라미터에서 세션 정보 확인
    const handleAuthCallback = async () => {
      try {
        console.log("인증 콜백 처리 시작");
        console.log("현재 URL:", window.location.href);
        console.log("URL 해시:", location.hash);
        console.log("URL 쿼리:", location.search);

        // 오류 파라미터 확인
        const urlParams = new URLSearchParams(location.search);
        const error = urlParams.get("error");
        const errorDescription = urlParams.get("error_description");

        if (error) {
          console.error(`인증 오류: ${error} - ${errorDescription}`);
          navigate(
            `/login?error=${error}&description=${encodeURIComponent(errorDescription || "")}`
          );
          return;
        }

        // 해시에 액세스 토큰이 있는지 확인
        // #access_token=xxx&expires_at=xxx 형식
        if (location.hash && location.hash.includes("access_token")) {
          console.log("URL 해시에서 액세스 토큰 발견");

          // Supabase에게 현재 세션 상태 확인 요청
          const { data, error } = await supabase.auth.getSession();

          if (error) {
            console.error("세션 조회 오류:", error);
            navigate("/login?error=session-retrieval-failed");
            return;
          }

          if (data?.session) {
            console.log("유효한 세션 발견:", data.session.user.id);
            // 로그인 성공 시 홈으로 리디렉션
            navigate("/", { replace: true });
          } else {
            console.log("액세스 토큰이 있지만 세션이 없음, 세션 설정 시도");

            // 추가 세션 설정 시도
            try {
              // 페이지 새로고침하여 Supabase가 토큰을 자동으로 처리하도록 함
              window.location.href = "/";
            } catch (setSessionErr) {
              console.error("세션 설정 오류:", setSessionErr);
              navigate("/login?error=session-setup-failed");
            }
          }
        } else {
          // 일반적인 세션 확인
          const { data, error } = await supabase.auth.getSession();

          if (error) {
            console.error("인증 콜백 처리 중 오류:", error);
            navigate("/login?error=auth-callback-failed");
            return;
          }

          if (data?.session) {
            console.log("인증 성공, 세션 설정됨");
            // 로그인 성공 시 홈으로 리디렉션
            navigate("/", { replace: true });
          } else {
            console.log("세션 정보 없음, 로그인 페이지로 이동");
            navigate("/login", { replace: true });
          }
        }
      } catch (err) {
        console.error("인증 콜백 처리 중 예외 발생:", err);
        navigate("/login?error=unexpected");
      }
    };

    // 페이지 로드 시 인증 콜백 처리
    handleAuthCallback();
  }, [navigate, location]);

  // 처리 중에는 로딩 화면 표시
  return <LoadingScreen message="로그인 처리 중..." />;
};

export default AuthCallback;
