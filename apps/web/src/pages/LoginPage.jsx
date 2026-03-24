
import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
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

const Input = ({ type = 'text', placeholder, value, onChange, required, disabled, rightElement }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', height: 48,
          background: C.card,
          border: `1px solid ${focused ? C.borderFocus : C.border}`,
          borderRadius: 8, padding: '0 44px 0 16px',
          color: C.primary, fontSize: 14,
          fontFamily: 'Inter, sans-serif', outline: 'none',
          boxSizing: 'border-box', transition: 'border-color 0.18s',
        }}
        className="auth-input"
      />
      {rightElement && (
        <span style={{
          position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
          color: C.placeholder, cursor: 'pointer', display: 'flex', alignItems: 'center',
        }}>
          {rightElement}
        </span>
      )}
    </div>
  );
};

const EyeIcon = ({ show, onClick }) => (
  <span onClick={onClick} style={{ cursor: 'pointer', color: C.placeholder }}>
    {show ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
    )}
  </span>
);

const GoogleG = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{
        background: '#fff', borderRadius: 24, padding: '40px 32px',
        width: '100%', maxWidth: 400, textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', background: '#ecfdf5',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Email Verified!</h2>
        <p style={{ fontSize: 15, color: '#6b7280', margin: '0 0 32px', lineHeight: '1.5' }}>
          Your account is now fully active.<br/>You can proceed to sign in.
        </p>
        <button 
          onClick={onClose}
          style={{
            width: '100%', height: 52, background: '#111827', color: '#fff',
            border: 'none', borderRadius: 12, fontWeight: 600, fontSize: 16,
            cursor: 'pointer', transition: 'transform 0.2s'
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Got it
        </button>
      </div>
      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, continueAsGuest, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const containerRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from(".animate-item", {
      y: 20,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "expo.out",
      delay: 0.2
    });
  }, { scope: containerRef });

  // Handle verification token from URL
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (token) {
      const verifyToken = async () => {
        setLoading(true);
        try {
          await pb.collection('users').confirmVerification(token);
          setShowSuccessModal(true);
          // Remove token from URL without refreshing
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          toast.error('Verification failed or link expired.');
        } finally {
          setLoading(false);
        }
      };
      verifyToken();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const authData = await login(email, password);
      
      if (!authData.record.verified) {
        // Option 1: Logout and tell them to verify
        // logout(); // We might need to import logout
        // navigate('/verification-pending', { state: { email } });
        
        // Option 2: Just show a message but stay logged in? Pocketbase usually requires verification for some rules.
        // Let's go with redirecting them to pending page
        navigate('/verification-pending', { state: { email } });
        return;
      }
      
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      if (err.isAbort) return; // Simple abort (popup closed)
      toast.error(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
      <Helmet>
        <title>Sign In - FocusFlow</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          .auth-input::placeholder { color: ${C.placeholder}; }
          .auth-input { caret-color: ${C.borderFocus}; }
          .cta-btn:hover { background: ${C.ctaHover} !important; }
          .cta-btn:active { transform: scale(0.98); }
          .sso-btn { background: ${C.card}; border: 1px solid ${C.border}; }
          .sso-btn:hover { background: #e2e3e6 !important; }
          .guest-btn:hover { background: rgba(232,55,42,0.07) !important; border-color: ${C.accent} !important; color: ${C.accent} !important; }
          .guest-btn:active { transform: scale(0.98); }
          @media (max-width: 640px) {
            .auth-right-panel { padding: 32px 24px !important; }
          }
        `}</style>
      </Helmet>

      <div style={{ height: '100vh', display: 'flex', background: C.bg, fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
        <AuthLeftPanel />

        {/* Right form panel */}
        <div className="auth-right-panel" style={{
          flex: 1, background: C.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '48px 64px', position: 'relative'
        }}>

          <div ref={containerRef} style={{ width: '100%', maxWidth: 420 }}>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }} className="sm:hidden animate-item">
              <LogoMark size={48} className="text-black" />
            </div>

            <h1 className="animate-item" style={{ fontWeight: 700, fontSize: 36, color: C.primary, letterSpacing: '-0.02em', margin: '0 0 10px' }}>
              Welcome back
            </h1>
            <p className="animate-item" style={{ fontSize: 14, color: C.muted, margin: '0 0 32px' }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: C.muted, textDecoration: 'underline' }}>Sign up</Link>
            </p>

            <form onSubmit={handleSubmit}>
              <div className="animate-item" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Input
                  type="email" placeholder="Email"
                  value={email} onChange={e => setEmail(e.target.value)}
                  required disabled={loading}
                />
                <Input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  required disabled={loading}
                  rightElement={<EyeIcon show={showPw} onClick={() => setShowPw(p => !p)} />}
                />
              </div>

              <div className="animate-item" style={{ textAlign: 'right', marginTop: 10 }}>
                <Link to="/forgot-password" style={{ fontSize: 13, color: C.muted, textDecoration: 'underline' }}>
                  Forgot password?
                </Link>
              </div>

              <div className="animate-item">
                <button type="submit" disabled={loading} className="cta-btn" style={{
                  width: '100%', height: 52, marginTop: 24,
                  background: C.cta, border: 'none', borderRadius: 8,
                  color: '#fff', fontWeight: 600, fontSize: 15,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.18s, transform 0.12s',
                  opacity: loading ? 0.7 : 1,
                }}>
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
              </div>
            </form>

            <div className="animate-item" style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <span style={{ fontSize: 12, color: C.muted, whiteSpace: 'nowrap' }}>Or sign in with</span>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>

            <div className="animate-item">
              <button 
                className="sso-btn" 
                onClick={handleGoogleLogin}
                disabled={loading}
                style={{
                width: '100%', height: 48,
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 8, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 10,
                color: C.primary, fontWeight: 600, fontSize: 14,
                cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.18s',
              }}>
                <GoogleG />
                Continue with Google
              </button>
            </div>

            {/* Guest mode separator */}
            <div className="animate-item" style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0 0' }}>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <span style={{ fontSize: 12, color: C.muted, whiteSpace: 'nowrap' }}>or</span>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>

            <div className="animate-item">
              <button
                className="guest-btn"
                onClick={() => { continueAsGuest(); navigate('/'); }}
                style={{
                  width: '100%', height: 48, marginTop: 12,
                  background: 'transparent',
                  border: `1.5px dashed ${C.border}`,
                  borderRadius: 8, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 10,
                  color: C.muted, fontWeight: 600, fontSize: 14,
                  cursor: 'pointer', transition: 'background 0.18s, border-color 0.18s, color 0.18s',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Continue as Guest
              </button>
            </div>
            <p className="animate-item" style={{ textAlign: 'center', fontSize: 11, color: C.placeholder, marginTop: 8 }}>
              Guest data is saved in this browser only
            </p>

          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
