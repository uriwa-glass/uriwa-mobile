import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

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

// MyPage components
import MySessions from "./components/mypage/MySessions";

interface AppProps {}

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/class-intro/:id" element={<ClassIntro />} />
          <Route path="/inquiry" element={<Inquiry />} />
          <Route path="/inquiry/dynamic" element={<DynamicInquiry />} />
          <Route path="/inquiry-detail/:id" element={<InquiryDetail />} />
          <Route path="/reservation/:id" element={<Reservation />} />
          <Route path="/reservation-confirmation" element={<ReservationConfirmation />} />
          <Route path="/reservation-cancel/:id" element={<ReservationCancel />} />
          <Route path="/cancellation-history" element={<CancellationHistory />} />
          <Route path="/reservation-detail/:id" element={<ReservationDetail />} />

          {/* MyPage Routes */}
          <Route path="/mypage" element={<MyPageLayout />}>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="reservations" element={<ReservationsPage />} />
            <Route path="sessions" element={<SessionsPage />} />
            <Route path="inquiries" element={<InquiriesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/form-templates" element={<FormTemplates />} />
          <Route path="/admin/form-create" element={<FormCreate />} />
          <Route path="/admin/cancellation-manager" element={<CancellationManager />} />
          <Route path="/admin/cancellation-analytics" element={<CancellationAnalytics />} />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
