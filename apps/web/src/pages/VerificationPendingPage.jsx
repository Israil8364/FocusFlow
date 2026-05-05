
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';
import AuthLeftPanel from '@/components/AuthLeftPanel.jsx';
import { LogoMark } from '@/components/Logo.jsx';

const C = {
  bg: '#e9eaec',
  card: '#f5f6f8',
  border: '#d8dade',
  borderFocus: '#e8372a',
  primary: '#1a1815',
  muted: '#888c96',
  placeholder: '#aeb2bb',
  cta: '#1a1815',
  ctaHover: '#333028',
  accent: '#e8372a',
};

const VerificationPendingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resendVerification, currentUser, refreshAuth } = useAuth();
  const email = location.state?.email || '';
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const timerRef = useRef(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(60);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Auto-redirect if user becomes verified (e.g. after clicking link in another tab)
  useEffect(() => {
    if (currentUser?.verified) {
      navigate('/', { replace: true });
      toast.success('Email verified successfully!');
    }
  }, [currentUser?.verified, navigate]);

  // Auto-refresh status periodically
  useEffect(() => {
    if (currentUser?.verified) return;

    const interval = setInterval(() => {
      refreshAuth();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [currentUser?.verified, refreshAuth]);

  const handleResend = async () => {
    if (!email) {
      toast.error('Email not found. Please try logging in.');
      return;
    }
    setLoading(true);
    try {
      await resendVerification(email);
      toast.success('New verification email sent!');
      startTimer();
    } catch (err) {
      toast.error(err.message || 'Failed to resend email');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsChecking(true);
    try {
      const latestUser = await refreshAuth();
      // If latestUser.verified is true, the useEffect will handle redirect
      if (!latestUser?.verified) {
        toast.info('Status updated. Still waiting for verification...');
      }
    } catch (err) {
      toast.error('Failed to check status');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Verify Email - FocusFlow</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          .cta-btn:hover { background: ${C.ctaHover} !important; }
          .cta-btn:active { transform: scale(0.98); }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @media (max-width: 640px) {
            .auth-content-panel { padding: 32px 24px !important; }
          }
        `}</style>
      </Helmet>

      <div style={{ height: '100vh', display: 'flex', background: C.bg, fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
        <AuthLeftPanel />

        <div className="auth-content-panel" style={{
          flex: 1, background: C.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '48px 64px', position: 'relative'
        }}>

          <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
            <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'center' }}>
              <div style={{ 
                width: 80, height: 80, borderRadius: '50%', background: 'rgba(232,55,42,0.1)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H17.5C20 5 22 7 22 9.5V17z" />
                  <path d="M2 9.5l10 6 10-6" />
                </svg>
              </div>
            </div>

            <h1 style={{ fontWeight: 700, fontSize: 32, color: C.primary, letterSpacing: '-0.02em', margin: '0 0 12px' }}>
              Check your email
            </h1>
            <p style={{ fontSize: 16, color: C.muted, margin: '0 0 32px', lineHeight: '1.5' }}>
              We've sent a verification link to <br/>
              <strong style={{ color: C.primary }}>{email || 'your inbox'}</strong>. 
              Please click the link to verify your account.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <button 
                onClick={handleCheckStatus}
                disabled={isChecking}
                className="cta-btn" 
                style={{
                  width: '100%', height: 52,
                  background: C.cta, border: 'none', borderRadius: 8,
                  color: '#fff', fontWeight: 600, fontSize: 15,
                  cursor: isChecking ? 'not-allowed' : 'pointer', transition: 'background 0.18s, transform 0.12s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                {isChecking ? (
                  <>
                    <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                    Checking...
                  </>
                ) : "I've verified my email"}
              </button>

              <button 
                onClick={() => navigate('/login')}
                style={{
                  width: '100%', height: 44,
                  background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8,
                  color: C.primary, fontWeight: 500, fontSize: 14,
                  cursor: 'pointer', transition: 'all 0.18s',
                }}
              >
                Back to Login
              </button>

              <p style={{ fontSize: 14, color: C.muted }}>
                Didn't receive the email?{' '}
                <button 
                  onClick={handleResend}
                  disabled={loading || countdown > 0}
                  style={{ 
                    background: 'none', border: 'none', color: C.accent, 
                    fontWeight: 600, cursor: (loading || countdown > 0) ? 'not-allowed' : 'pointer', padding: 0,
                    opacity: (loading || countdown > 0) ? 0.5 : 1
                  }}
                >
                  {loading ? 'Resending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend link'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerificationPendingPage;
