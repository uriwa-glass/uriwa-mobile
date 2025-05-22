import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Button from "../components/Button";
import { useAuth } from "../contexts/AuthContext";

/**
 * 회원가입 페이지 컴포넌트
 */
const Signup = () => {
  const navigate = useNavigate();
  const { user, signUp, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 이미 로그인한 사용자는 홈으로 리디렉션
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // 회원가입 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 입력값 검증
    if (!email || !password) {
      setError("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    try {
      setIsSubmitting(true);
      await signUp(email, password, { full_name: email.split("@")[0] });
      // 회원가입 후 로그인 페이지로 이동
      navigate("/login?registered=true");
    } catch (err) {
      console.error("회원가입 실패:", err);
      setError(err instanceof Error ? err.message : "회원가입 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="회원가입" showBackButton={true}>
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold text-center mb-6">URIWA 회원가입</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="이메일 주소"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="비밀번호 (6자 이상)"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="비밀번호 확인"
              required
              disabled={isSubmitting}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#FF7648] hover:bg-[#FF5A24] text-white py-2 rounded"
            disabled={isSubmitting}
          >
            {isSubmitting ? "처리 중..." : "회원가입"}
          </Button>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-[#FF7648] hover:underline"
                disabled={isSubmitting}
              >
                로그인
              </button>
            </p>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Signup;
