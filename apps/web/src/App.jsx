import React, { useRef } from 'react';
import { LeaderboardProvider } from './contexts/LeaderboardContext';
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext.jsx';
import { SettingsProvider } from '@/contexts/SettingsContext.jsx';
import { TimerProvider } from '@/contexts/TimerContext.jsx';
import { Toaster } from 'sonner';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import LenisScroll from '@/components/LenisScroll.jsx';
import LoadingAnimation from '@/components/LoadingAnimation.jsx';
import HomePage from '@/pages/HomePage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import SignupPage from '@/pages/SignupPage.jsx';
import VerificationPendingPage from '@/pages/VerificationPendingPage.jsx';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from '@/pages/ResetPasswordPage.jsx';
import TimerPage from '@/pages/TimerPage.jsx';
import HistoryPage from '@/pages/HistoryPage.jsx';
import SettingsPage from '@/pages/SettingsPage.jsx';
import AnalyticsPage from '@/pages/AnalyticsPage.jsx';
import UpgradePage from '@/pages/UpgradePage.jsx';
import AddTaskPage from '@/pages/AddTaskPage.jsx';
import TermsPage from '@/pages/TermsPage.jsx';
import PrivacyPage from '@/pages/PrivacyPage.jsx';
import Navbar from '@/components/Navbar.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import BottomTabBar from '@/components/BottomTabBar.jsx';
import GuestBanner from '@/components/GuestBanner.jsx';
import NotificationPermissionBanner from '@/components/NotificationPermissionBanner.jsx';
import { GamificationProvider } from '@/contexts/GamificationContext.jsx';
import AchievementsPage from '@/pages/AchievementsPage.jsx';
import LeaderboardPage from '@/pages/LeaderboardPage.jsx';
import UserProfilePage from '@/pages/UserProfilePage.jsx';
import ConfettiToast from '@/components/gamification/ConfettiToast.jsx';
const DashboardLayout = ({ children }) => {
  const layoutRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from(".gsap-sidebar", { x: -30, opacity: 0, duration: 0.8, ease: "power3.out" })
      .from(".gsap-main", { opacity: 0, y: 10, duration: 0.6, ease: "power2.out" }, "-=0.6");
  }, { scope: layoutRef });

  return (
    <div ref={layoutRef} className="flex min-h-screen bg-[var(--bg)] text-[var(--text-primary)] font-sans">
      <GuestBanner />
      {/* Sidebar - Fixed on the left */}
      <div className="gsap-sidebar hidden md:block">
        <Sidebar />
      </div>
      
      {/* Main Content Area - Fluid on the right */}
      <div className="flex-1 flex flex-col md:ml-[240px]">
        <Navbar />
        <main className="gsap-main flex-1 p-0">
          {children}
        </main>
      </div>
      
      <BottomTabBar />
    </div>
  );
};

const AppRoutes = () => {
  const { loading } = useAuth();
  console.log('🔍 AppRoutes loading state:', loading);

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verification-pending" element={<VerificationPendingPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route path="/" element={<ProtectedRoute><DashboardLayout><HomePage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/timer" element={<ProtectedRoute><DashboardLayout><TimerPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><DashboardLayout><HistoryPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><DashboardLayout><AnalyticsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/achievements" element={<ProtectedRoute><DashboardLayout><AchievementsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><DashboardLayout><LeaderboardPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><DashboardLayout><SettingsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><DashboardLayout><UserProfilePage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/user/:userId" element={<ProtectedRoute><DashboardLayout><UserProfilePage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/upgrade" element={<ProtectedRoute><DashboardLayout><UpgradePage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/add-task" element={<ProtectedRoute><DashboardLayout><AddTaskPage /></DashboardLayout></ProtectedRoute>} />

      {/* Legal Routes */}
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
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
              <LeaderboardProvider>
                <ScrollToTop />
                <NotificationPermissionBanner />
                <ConfettiToast />
                <AppRoutes />
                <Toaster
                  toastOptions={{
                    className: 'bg-[var(--card)] text-[var(--text-primary)] border border-[var(--border)] shadow-neu-sm rounded-[var(--radius-md)] font-sans',
                  }}
                />
              </LeaderboardProvider>
            </GamificationProvider>
          </TimerProvider>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
