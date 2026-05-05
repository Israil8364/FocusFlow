import React, { useRef } from 'react';
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from '@/contexts/AuthContext.jsx';
import { SettingsProvider } from '@/contexts/SettingsContext.jsx';
import { TimerProvider } from '@/contexts/TimerContext.jsx';
import { Toaster } from 'sonner';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import LenisScroll from '@/components/LenisScroll.jsx';
import LoadingAnimation from '@/components/LoadingAnimation.jsx';
import Navbar from '@/components/Navbar.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import BottomTabBar from '@/components/BottomTabBar.jsx';
import GuestBanner from '@/components/GuestBanner.jsx';
import NotificationPermissionBanner from '@/components/NotificationPermissionBanner.jsx';
import { GamificationProvider } from '@/contexts/GamificationContext.jsx';
import ConfettiToast from '@/components/gamification/ConfettiToast.jsx';

// Lazy load pages
const HomePage = React.lazy(() => import('@/pages/HomePage.jsx'));
const LoginPage = React.lazy(() => import('@/pages/LoginPage.jsx'));
const SignupPage = React.lazy(() => import('@/pages/SignupPage.jsx'));
const VerificationPendingPage = React.lazy(() => import('@/pages/VerificationPendingPage.jsx'));
const ForgotPasswordPage = React.lazy(() => import('@/pages/ForgotPasswordPage.jsx'));
const ResetPasswordPage = React.lazy(() => import('@/pages/ResetPasswordPage.jsx'));
const TimerPage = React.lazy(() => import('@/pages/TimerPage.jsx'));
const HistoryPage = React.lazy(() => import('@/pages/HistoryPage.jsx'));
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage.jsx'));
const AnalyticsPage = React.lazy(() => import('@/pages/AnalyticsPage.jsx'));
const UpgradePage = React.lazy(() => import('@/pages/UpgradePage.jsx'));
const AddTaskPage = React.lazy(() => import('@/pages/AddTaskPage.jsx'));
const TermsPage = React.lazy(() => import('@/pages/TermsPage.jsx'));
const PrivacyPage = React.lazy(() => import('@/pages/PrivacyPage.jsx'));
const DashboardLayout = ({ children }) => {
  const layoutRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from(".gsap-sidebar", { x: -30, opacity: 0, duration: 0.8, ease: "power3.out" })
      .from(".gsap-main", { opacity: 0, y: 10, duration: 0.6, ease: "power2.out" }, "-=0.6");
  }, { scope: layoutRef });

  return (
    <div ref={layoutRef} className="flex flex-col min-h-screen bg-[var(--bg)] text-[var(--text-primary)] font-sans">
      <GuestBanner />
      <Navbar />
      <div className="flex flex-1 relative">
        <div className="gsap-sidebar hidden md:block sticky top-[64px] h-[calc(100vh-64px)]">
          <Sidebar />
        </div>
        <main className="gsap-main flex-1 pb-[64px] md:pb-0">
          {children}
        </main>
      </div>
      <BottomTabBar />
    </div>
  );
};

const AppRoutes = () => {
  const { loading, isAuthenticated, isGuest } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verification-pending" element={<VerificationPendingPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout><HomePage /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/timer" element={<ProtectedRoute><DashboardLayout><TimerPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><DashboardLayout><HistoryPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><DashboardLayout><AnalyticsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><DashboardLayout><SettingsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/upgrade" element={<ProtectedRoute><DashboardLayout><UpgradePage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/add-task" element={<ProtectedRoute><DashboardLayout><AddTaskPage /></DashboardLayout></ProtectedRoute>} />

      {/* Legal Routes */}
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />

      {/* Catch-all: redirect unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <TimerProvider>
            <GamificationProvider>
              <ScrollToTop />
              <NotificationPermissionBanner />
              <ConfettiToast />
              <React.Suspense fallback={<LoadingAnimation />}>
                <AppRoutes />
              </React.Suspense>
              <Toaster
                toastOptions={{
                  className: 'bg-[var(--card)] text-[var(--text-primary)] border border-[var(--border)] shadow-neu-sm rounded-[var(--radius-md)] font-sans',
                }}
              />
            </GamificationProvider>
          </TimerProvider>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
