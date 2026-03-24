import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { SettingsProvider } from '@/contexts/SettingsContext.jsx';
import { TimerProvider } from '@/contexts/TimerContext.jsx';
import { Toaster } from 'sonner';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import LenisScroll from '@/components/LenisScroll.jsx';
import HomePage from '@/pages/HomePage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import SignupPage from '@/pages/SignupPage.jsx';
import VerificationPendingPage from '@/pages/VerificationPendingPage.jsx';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from '@/pages/ResetPasswordPage.jsx';
import TimerPage from '@/pages/TimerPage.jsx';
import HistoryPage from '@/pages/HistoryPage.jsx';
import SettingsPage from '@/pages/SettingsPage.jsx';
import ProfilePage from '@/pages/ProfilePage.jsx';
import AnalyticsPage from '@/pages/AnalyticsPage.jsx';
import UpgradePage from '@/pages/UpgradePage.jsx';
import AddTaskPage from '@/pages/AddTaskPage.jsx';
import Navbar from '@/components/Navbar.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import BottomTabBar from '@/components/BottomTabBar.jsx';
import GuestBanner from '@/components/GuestBanner.jsx';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)] text-[var(--text-primary)] font-sans">
      <GuestBanner />
      <Navbar />
      <div className="flex flex-1 relative">
        <Sidebar className="sticky top-[64px] h-[calc(100vh-64px)]" />
        <main className="flex-1 pb-[64px] md:pb-0">
          {children}
        </main>
      </div>
      <BottomTabBar />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <TimerProvider>
            <LenisScroll>
              <ScrollToTop />
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
              <Route path="/settings" element={<ProtectedRoute><DashboardLayout><SettingsPage /></DashboardLayout></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><DashboardLayout><ProfilePage /></DashboardLayout></ProtectedRoute>} />
              <Route path="/upgrade" element={<ProtectedRoute><DashboardLayout><UpgradePage /></DashboardLayout></ProtectedRoute>} />
              <Route path="/add-task" element={<ProtectedRoute><DashboardLayout><AddTaskPage /></DashboardLayout></ProtectedRoute>} />
            </Routes>
          </LenisScroll>
          <Toaster 
            toastOptions={{
                className: 'bg-[var(--card)] text-[var(--text-primary)] border border-[var(--border)] shadow-neu-sm rounded-[var(--radius-md)] font-sans',
              }}
            />
          </TimerProvider>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;