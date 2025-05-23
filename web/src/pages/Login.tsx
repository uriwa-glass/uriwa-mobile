import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Button from "../components/Button";
import ResponsiveContainer from "../styles/ResponsiveContainer";
import { useResponsive } from "../hooks/useResponsive";
import { useAuth } from "../contexts/AuthContext";

// SNS 로그인 아이콘 컴포넌트
const GoogleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z"
      fill="#FFC107"
    />
    <path
      d="M3.15302 7.3455L6.43852 9.755C7.32752 7.554 9.48052 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15902 2 4.82802 4.1685 3.15302 7.3455Z"
      fill="#FF3D00"
    />
    <path
      d="M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.5718 17.5742 13.3038 18.001 12 18C9.39903 18 7.19053 16.3415 6.35853 14.027L3.09753 16.5395C4.75253 19.778 8.11353 22 12 22Z"
      fill="#4CAF50"
    />
    <path
      d="M21.8055 10.0415H21V10H12V14H17.6515C17.2571 15.1082 16.5467 16.0766 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z"
      fill="#1976D2"
    />
  </svg>
);

const KakaoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 3C6.477 3 2 6.477 2 11C2 14.991 5.57 18.128 10 18.859V22.893L11.833 21.246L13.666 22.893V18.859C18.429 18.129 22 14.99 22 11C22 6.477 17.523 3 12 3Z"
      fill="#FFE812"
    />
    <path d="M14.599 8.157H13.744V11.978H14.599V8.157Z" fill="#3B1E1E" />
    <path d="M10.256 8.157H9.401V11.978H10.256V8.157Z" fill="#3B1E1E" />
    <path
      d="M16.569 11.235L15.348 8.156H14.433L15.654 11.235V11.978H16.569V11.235Z"
      fill="#3B1E1E"
    />
    <path d="M7.431 11.235L8.652 8.156H9.567L8.346 11.235V11.978H7.431V11.235Z" fill="#3B1E1E" />
  </svg>
);

const NaverIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" fill="#03C75A" />
    <path
      d="M13.392 12.0214L10.0845 7.214H7V16.786H10.608V11.9786L13.9155 16.786H17V7.214H13.392V12.0214Z"
      fill="white"
    />
  </svg>
);

const AppleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16.2053 4C14.0553 4 13.3053 5.124 11.9553 5.124C10.5803 5.124 9.35532 4 7.70532 4C6.02532 4 4.15532 5.304 3.05532 7.309C1.45532 10.211 1.75532 15.678 4.65532 19.909C5.65532 21.409 6.95532 23.144 8.75532 23.144C10.4053 23.144 10.9053 22 12.7053 22C14.5053 22 14.9553 23.144 16.6553 23.144C18.4553 23.144 19.7553 21.542 20.7553 20.042C21.4553 19.009 21.7053 18.477 22.2553 17.412C18.0553 15.75 17.5053 9.678 22.2553 8.549C21.0053 6.517 18.7053 4 16.2053 4Z"
      fill="black"
    />
    <path
      d="M15.3945 2C15.6695 3.286 14.9445 4.581 14.1195 5.437C13.2945 6.292 11.9695 7 10.8945 7C10.6195 5.715 11.3445 4.419 12.1695 3.563C12.9945 2.707 14.3195 2 15.3945 2Z"
      fill="black"
    />
  </svg>
);

const Login = () => {
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Auth context 사용
  const { user, loading, error, signInWithEmailPassword, signIn, signInWithKakao } = useAuth();

  useEffect(() => {
    // 사용자가 이미 로그인 상태인 경우 홈으로 리디렉션
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // AuthContext의 에러를 감지하여 표시
  useEffect(() => {
    if (error) {
      const errorMsg = error.message;
      if (errorMsg.includes("Invalid login credentials")) {
        setErrorMessage("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else if (errorMsg.includes("Email not confirmed")) {
        setErrorMessage("이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.");
      } else if (errorMsg.includes("Too many requests")) {
        setErrorMessage("로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.");
      } else {
        setErrorMessage(errorMsg);
      }
    }
  }, [error]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      await signInWithEmailPassword(email, password);
      // 로그인 성공 시 AuthContext의 useEffect에서 자동으로 홈으로 리디렉션됩니다.
    } catch (error) {
      console.error("로그인 실패:", error);
      setErrorMessage("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSNSLogin = async (provider: string) => {
    setErrorMessage("");
    setIsLoading(true);

    try {
      if (provider === "kakao") {
        await signInWithKakao();
      } else {
        await signIn(provider);
      }
      // OAuth 리디렉션이 발생하기 때문에 여기서는 추가 처리가 필요 없습니다.
    } catch (error) {
      console.error(`${provider} 로그인 실패:`, error);

      let errorMsg = `${provider} 로그인에 실패했습니다. `;

      // 카카오 로그인 에러 처리
      if (provider === "kakao") {
        errorMsg += error instanceof Error ? error.message : "다시 시도해주세요.";
      } else {
        // 개발 환경에서 소셜 로그인 관련 안내 메시지
        if (
          process.env.NODE_ENV === "development" &&
          error instanceof Error &&
          (error.message.includes("provider is not enabled") ||
            error.message.includes("활성화되어 있지 않습니다"))
        ) {
          errorMsg +=
            "개발 환경에서는 소셜 로그인을 위해 별도 설정이 필요합니다. 이메일 로그인을 이용해주세요.";
        } else {
          errorMsg += error instanceof Error ? error.message : "다시 시도해주세요.";
        }
      }

      setErrorMessage(errorMsg);
      setIsLoading(false);
    }
  };

  // 로딩 중인 경우 로딩 표시
  if (loading) {
    return (
      <Layout title="로그인" showBackButton={true} noPadding={false}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF7648]"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="로그인" showBackButton={true} noPadding={false}>
      <ResponsiveContainer fluid={isMobile} center>
        <div className="w-full max-w-md mx-auto">
          <h1 className="text-[#3F414E] font-bold text-2xl mb-6 text-center">URIWA 로그인</h1>

          {/* 에러 메시지 표시 */}
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errorMessage}
            </div>
          )}

          {/* 이메일 로그인 폼 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-[#3F414E] font-semibold text-lg mb-4">이메일로 로그인</h2>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label htmlFor="email" className="form-label">
                  이메일
                </label>
                <input
                  type="email"
                  id="email"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일 주소를 입력하세요"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="form-label">
                  비밀번호
                </label>
                <input
                  type="password"
                  id="password"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  required
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#FF7648] hover:bg-[#FF5A24] text-white"
                disabled={isLoading}
              >
                {isLoading ? "로그인 중..." : "로그인"}
              </Button>
            </form>

            <div className="flex justify-between mt-4">
              <button className="text-[#A1A4B2] text-sm underline">비밀번호 찾기</button>
              <button
                className="text-[#A1A4B2] text-sm underline"
                onClick={() => navigate("/signup")}
              >
                회원가입
              </button>
            </div>
          </div>

          {/* SNS 로그인 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-[#3F414E] font-semibold text-lg mb-4">SNS 계정으로 로그인</h2>

            <div className="flex flex-col gap-3">
              <button
                className="flex items-center justify-center gap-3 w-full py-3 border border-[#EBEAEC] rounded-md hover:bg-gray-50 transition-colors"
                onClick={() => handleSNSLogin("google")}
                disabled={isLoading}
              >
                <GoogleIcon />
                <span className="text-[#3F414E]">Google로 로그인</span>
              </button>

              <button
                className="flex items-center justify-center gap-3 w-full py-3 border border-[#EBEAEC] rounded-md hover:bg-gray-50 transition-colors"
                onClick={() => handleSNSLogin("kakao")}
                disabled={isLoading}
              >
                <KakaoIcon />
                <span className="text-[#3F414E]">Kakao로 로그인</span>
              </button>

              <button
                className="flex items-center justify-center gap-3 w-full py-3 border border-[#EBEAEC] rounded-md hover:bg-gray-50 transition-colors"
                onClick={() => handleSNSLogin("naver")}
                disabled={isLoading}
              >
                <NaverIcon />
                <span className="text-[#3F414E]">Naver로 로그인</span>
              </button>

              <button
                className="flex items-center justify-center gap-3 w-full py-3 border border-[#EBEAEC] rounded-md hover:bg-gray-50 transition-colors"
                onClick={() => handleSNSLogin("apple")}
                disabled={isLoading}
              >
                <AppleIcon />
                <span className="text-[#3F414E]">Apple로 로그인</span>
              </button>
            </div>

            <p className="text-center text-xs text-[#A1A4B2] mt-4">
              로그인 시 개인정보 처리방침 및 서비스 이용약관에 동의하게 됩니다.
            </p>
          </div>
        </div>
      </ResponsiveContainer>
    </Layout>
  );
};

export default Login;
