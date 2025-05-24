import React, { useEffect, useState, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@material-tailwind/react";
import "./App.css";
import BreakpointDisplay from "./components/BreakpointDisplay";
import ResponsiveStyles from "./components/ResponsiveStyles";
import NavigationBar from "./components/NavigationBar";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import EnvChecker from "./components/EnvChecker";
import { useMediaQuery } from "react-responsive";

// Pages
import Home from "./pages/Home";
import ClassIntro from "./pages/ClassIntro";
import Inquiry from "./pages/Inquiry";
import DynamicInquiry from "./pages/DynamicInquiry";
import InquiryDetail from "./pages/InquiryDetail";
import Reservation from "./pages/Reservation";
import ReservationConfirmation from "./pages/ReservationConfirmation";
import ReservationCancel from "./pages/ReservationCancel";
import CancellationHistory from "./pages/CancellationHistory";
import ReservationDetail from "./pages/ReservationDetail";
import NotFound from "./pages/NotFound";

// New Pages - URiWa Reference
import CustomOrder from "./pages/CustomOrder";
import Entrepreneurship from "./pages/Entrepreneurship";
import Exhibition from "./pages/Exhibition";

// MyPage Components
import MyPageLayout from "./components/mypage/MyPageLayout";
import ProfilePage from "./pages/mypage/ProfilePage";
import SettingsPage from "./pages/mypage/SettingsPage";
import ReservationsPage from "./pages/mypage/ReservationsPage";
import SessionsPage from "./pages/mypage/SessionsPage";
import InquiriesPage from "./pages/mypage/InquiriesPage";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import FormTemplates from "./pages/admin/FormTemplates";
import FormCreate from "./pages/admin/FormCreate";
import CancellationManager from "./pages/admin/CancellationManager";
import CancellationAnalytics from "./pages/admin/CancellationAnalytics";
import UserManagement from "./pages/admin/UserManagement";
import ClassManagement from "./pages/admin/ClassManagement";
import InquiryManagement from "./pages/admin/InquiryManagement";
import ReservationManagement from "./pages/admin/ReservationManagement";

// MyPage components
import MySessions from "./components/mypage/MySessions";

// 페이지 컴포넌트 - 코드 스플리팅
const Signup = lazy(() => import("./pages/Signup"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const KakaoCallback = lazy(() => import("./pages/auth/KakaoCallback"));

// 로딩 화면 컴포넌트
const LoadingScreen = lazy(() => import("./components/LoadingScreen"));

// 개발 환경에서만 디버깅 도구 활성화
const isDev = process.env.NODE_ENV === "development";

// Material Tailwind 테마 설정
const theme = {
  navbar: {
    styles: {
      base: {
        navbar: {
          initial: {
            display: "flex",
            flexWrap: "nowrap",
            justifyContent: "space-between",
            color: "blue-gray",
          },
        },
      },
    },
  },
};

// 인증이 필요한 라우트를 위한 컴포넌트
interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

// 인증이 필요한 라우트 컴포넌트
const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { user, profile, loading, initialized } = useAuth();
  const location = useLocation();
  const [showFallback, setShowFallback] = useState(false);

  // 타임아웃 설정 - 10초 후에도 초기화가 완료되지 않으면 폴백 UI 표시
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!initialized) {
        console.log("ProtectedRoute: 초기화 타임아웃 발생, 폴백 UI 표시");
        setShowFallback(true);
      }
    }, 10000); // 10초

    return () => clearTimeout(timeoutId);
  }, [initialized]);

  console.log("ProtectedRoute 상태:", { user, profile, loading, initialized });

  // 인증 상태가 초기화되기 전에는 로딩 표시
  if (!initialized) {
    // 폴백 UI가 활성화된 경우 사용자에게 문제 알림
    if (showFallback) {
      return (
        <div className="flex mx-4 justify-center items-center h-screen">
          <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold mb-4">연결 문제가 발생했습니다</h2>
            <p className="mb-4 text-gray-600">
              서버에 연결하는 중 문제가 발생했습니다. 인터넷 연결을 확인한 후 페이지를
              새로고침해주세요.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#FF7648] text-white rounded hover:bg-[#E85A2A] transition-colors"
            >
              새로고침
            </button>
          </div>
        </div>
      );
    }

    // 일반 로딩 UI
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF7648] mx-auto"></div>
          <p className="mt-4">인증 정보를 확인 중입니다...</p>
        </div>
      </div>
    );
  }

  // 로그인 상태가 아니면 로그인 페이지로 리디렉션
  if (!user) {
    console.log("로그인 필요: 리디렉션 중");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 관리자 전용 페이지인 경우, 관리자가 아니면 접근 금지
  if (adminOnly && profile?.role !== "admin") {
    console.log("관리자 권한 필요: 리디렉션 중");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// 인증이 필요없는 공개 라우트 컴포넌트
interface PublicRouteProps {
  children: React.ReactNode;
  restrictIfAuth?: boolean; // 인증된 사용자는 접근 제한 (로그인 페이지 등)
}

// 공개 라우트 컴포넌트
const PublicRoute = ({ children, restrictIfAuth = false }: PublicRouteProps) => {
  const { user, loading, initialized } = useAuth();
  const [showFallback, setShowFallback] = useState(false);

  // 타임아웃 설정 - 10초 후에도 초기화가 완료되지 않으면 폴백 UI 표시
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!initialized) {
        console.log("PublicRoute: 초기화 타임아웃 발생, 폴백 UI 표시");
        setShowFallback(true);
      }
    }, 10000); // 10초

    return () => clearTimeout(timeoutId);
  }, [initialized]);

  console.log("PublicRoute 상태:", { user, loading, initialized });

  console.log(`@@@ initialized : `, initialized);

  // 폴백 UI가 활성화되었거나 초기화가 완료되지 않았을 때
  if (!initialized) {
    // 폴백 UI가 활성화된 경우 사용자에게 문제 알림
    if (showFallback) {
      return (
        <div className="flex mx-4  justify-center items-center h-screen">
          <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold mb-4">연결 문제가 발생했습니다</h2>
            <p className="mb-4 text-gray-600">
              서버에 연결하는 중 문제가 발생했습니다. 인터넷 연결을 확인한 후 페이지를
              새로고침해주세요.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#FF7648] text-white rounded hover:bg-[#E85A2A] transition-colors"
            >
              새로고침
            </button>
          </div>
        </div>
      );
    }

    // 일반 로딩 UI
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF7648] mx-auto"></div>
          <p className="mt-4">사이트를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  // 로그인 페이지 등 인증된 사용자가 접근하면 홈으로 리디렉션
  console.log("@@@ restrictIfAuth : ", restrictIfAuth);
  console.log("@@@ user : ", user);
  if (restrictIfAuth && user) {
    console.log("이미 로그인됨: 홈으로 리디렉션 중");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* 공개 라우트 - 인증 불필요 */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Home />
          </PublicRoute>
        }
      />

      <Route
        path="/login"
        element={
          <PublicRoute restrictIfAuth>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicRoute restrictIfAuth>
            <Suspense
              fallback={<div className="flex justify-center items-center h-screen">로딩 중...</div>}
            >
              <Signup />
            </Suspense>
          </PublicRoute>
        }
      />

      <Route
        path="/auth/callback"
        element={
          <PublicRoute>
            <Suspense
              fallback={<div className="flex justify-center items-center h-screen">로딩 중...</div>}
            >
              <AuthCallback />
            </Suspense>
          </PublicRoute>
        }
      />

      <Route
        path="/kakao/callback"
        element={
          <PublicRoute>
            <Suspense
              fallback={<div className="flex justify-center items-center h-screen">로딩 중...</div>}
            >
              <KakaoCallback />
            </Suspense>
          </PublicRoute>
        }
      />

      <Route
        path="/class-intro/:id"
        element={
          <PublicRoute>
            <ClassIntro />
          </PublicRoute>
        }
      />

      {/* 인증이 필요한 일반 사용자 라우트 */}
      <Route
        path="/inquiry"
        element={
          <ProtectedRoute>
            <Inquiry />
          </ProtectedRoute>
        }
      />

      <Route
        path="/inquiry/dynamic"
        element={
          <ProtectedRoute>
            <DynamicInquiry />
          </ProtectedRoute>
        }
      />

      <Route
        path="/inquiry-detail/:id"
        element={
          <ProtectedRoute>
            <InquiryDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reservation/:id"
        element={
          <ProtectedRoute>
            <Reservation />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reservation-confirmation"
        element={
          <ProtectedRoute>
            <ReservationConfirmation />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reservation-cancel/:id"
        element={
          <ProtectedRoute>
            <ReservationCancel />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cancellation-history"
        element={
          <ProtectedRoute>
            <CancellationHistory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reservation-detail/:id"
        element={
          <ProtectedRoute>
            <ReservationDetail />
          </ProtectedRoute>
        }
      />

      {/* MyPage 라우트 - 모두 인증 필요 */}
      <Route
        path="/mypage"
        element={
          <ProtectedRoute>
            <MyPageLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="reservations" element={<ReservationsPage />} />
        <Route path="sessions" element={<SessionsPage />} />
        <Route path="inquiries" element={<InquiriesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* 관리자 라우트 - 관리자 권한 필요 */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/form-templates"
        element={
          <ProtectedRoute adminOnly>
            <FormTemplates />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/form-create"
        element={
          <ProtectedRoute adminOnly>
            <FormCreate />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/cancellation-manager"
        element={
          <ProtectedRoute adminOnly>
            <CancellationManager />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/cancellation-analytics"
        element={
          <ProtectedRoute adminOnly>
            <CancellationAnalytics />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/user-management"
        element={
          <ProtectedRoute adminOnly>
            <UserManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/class-management"
        element={
          <ProtectedRoute adminOnly>
            <ClassManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/inquiry-management"
        element={
          <ProtectedRoute adminOnly>
            <InquiryManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/reservation-management"
        element={
          <ProtectedRoute adminOnly>
            <ReservationManagement />
          </ProtectedRoute>
        }
      />

      {/* New Pages - URiWa Reference */}
      <Route
        path="/custom-order"
        element={
          <PublicRoute>
            <CustomOrder />
          </PublicRoute>
        }
      />

      <Route
        path="/entrepreneurship"
        element={
          <PublicRoute>
            <Entrepreneurship />
          </PublicRoute>
        }
      />

      <Route
        path="/exhibition"
        element={
          <PublicRoute>
            <Exhibition />
          </PublicRoute>
        }
      />

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  // 반응형 화면 설정
  const isMobile = useMediaQuery({ maxWidth: 767 });

  useEffect(() => {
    // 모바일 환경에서 뷰포트 높이 설정 (iOS Safari 관련 문제 해결)
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setVh();
    window.addEventListener("resize", setVh);
    return () => window.removeEventListener("resize", setVh);
  }, []);

  return (
    <Router>
      <ThemeProvider value={theme}>
        <AuthProvider>
          <Suspense
            fallback={<div className="flex justify-center items-center h-screen">로딩 중...</div>}
          >
            <AppContent />
          </Suspense>

          {/* 환경 변수 확인 컴포넌트 */}
          <EnvChecker />

          {/* 반응형 스타일 적용 */}
          <ResponsiveStyles />

          {/* 개발 환경에서만 브레이크포인트 디버깅 도구 표시 */}
          {isDev && <BreakpointDisplay show={true} position="bottom-right" showDetails={true} />}
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

// 내비게이션 바의 표시 여부를 결정하기 위한 컴포넌트
const AppContent = () => {
  const location = useLocation();

  // 네비게이션 바를 표시하지 않을 페이지 목록
  const hideNavPaths = ["/login", "/signup"];

  // 현재 경로가 네비게이션 바를 숨겨야 하는 경로인지 확인
  const shouldHideNav = hideNavPaths.some((path) => location.pathname === path);

  return (
    <div className="App">
      {/* 네비게이션 바를 조건부로 표시 */}
      {!shouldHideNav && <NavigationBar />}

      {/* 네비게이션 바의 위치에 따라 콘텐츠 패딩 조정 */}
      <div className={!shouldHideNav ? "pb-16 lg:pl-20" : ""}>
        <AppRoutes />
      </div>
    </div>
  );
};

export default App;
