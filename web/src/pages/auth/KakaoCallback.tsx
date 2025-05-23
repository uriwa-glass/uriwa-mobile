import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { handleKakaoCallback } from "../../utils/kakaoAuth";

const KakaoCallback: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithKakaoUser } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("카카오 로그인 처리 중...");

  useEffect(() => {
    const processKakaoCallback = async () => {
      try {
        console.log("🔵 카카오 콜백 페이지에서 처리 시작");

        // 카카오 콜백 처리
        const kakaoUserInfo = await handleKakaoCallback();
        console.log("🟢 카카오 사용자 정보 받음:", kakaoUserInfo);

        // AuthContext를 통해 Supabase에 사용자 생성/로그인
        if (signInWithKakaoUser) {
          await signInWithKakaoUser(kakaoUserInfo);
          setStatus("success");
          setMessage("로그인 성공! 잠시 후 이동합니다...");

          // 이전 페이지로 돌아가기 (또는 기본 페이지로)
          const returnUrl = sessionStorage.getItem("kakao_login_return_url") || "/";
          sessionStorage.removeItem("kakao_login_return_url");

          setTimeout(() => {
            navigate(returnUrl, { replace: true });
          }, 1500);
        } else {
          throw new Error("signInWithKakaoUser 함수가 없습니다.");
        }
      } catch (error) {
        console.error("🔴 카카오 콜백 처리 실패:", error);
        setStatus("error");
        setMessage("카카오 로그인에 실패했습니다. 다시 시도해주세요.");

        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 3000);
      }
    };

    processKakaoCallback();
  }, [navigate, signInWithKakaoUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="mb-4">
          {status === "loading" && (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          )}
          {status === "success" && (
            <div className="text-green-600">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
          )}
          {status === "error" && (
            <div className="text-red-600">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </div>
          )}
        </div>

        <h2 className="text-lg font-semibold mb-2">
          {status === "loading" && "카카오 로그인 처리 중"}
          {status === "success" && "로그인 성공"}
          {status === "error" && "로그인 실패"}
        </h2>

        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default KakaoCallback;
