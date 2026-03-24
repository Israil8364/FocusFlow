
import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';
import AuthLeftPanel from '@/components/AuthLeftPanel.jsx';
import { LogoMark } from '@/components/Logo.jsx';
import LoadingAnimation from '@/components/LoadingAnimation.jsx';

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

const Input = ({ type = 'text', placeholder, value, onChange, required, disabled, rightElement, error }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative', marginBottom: error ? 20 : 0 }}>
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
          border: `1px solid ${error ? '#ef4444' : (focused ? C.borderFocus : C.border)}`,
          borderRadius: 8, padding: '0 44px 0 16px',
          color: C.primary, fontSize: 14,
          fontFamily: 'Inter, sans-serif', outline: 'none',
          boxSizing: 'border-box', transition: 'border-color 0.18s',
        }}
        className="auth-input"
      />
      {rightElement && (
        <span style={{
          position: 'absolute', right: 14, top: '50%', transform: `translateY(-50%)`,
          color: C.placeholder, cursor: 'pointer', display: 'flex', alignItems: 'center',
        }}>
          {rightElement}
        </span>
      )}
      {error && (
        <p style={{
          position: 'absolute', left: 0, top: 48,
          color: '#ef4444', fontSize: 11, fontWeight: 500,
          margin: 0, marginTop: 4, animation: 'fadeIn 0.2s'
        }}>
          {error}
        </p>
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

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, continueAsGuest, loginWithGoogle } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const containerRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from(".animate-item", {
      y: 20,
      opacity: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: "expo.out",
      delay: 0.2
    });
  }, { scope: containerRef });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({ email: '', password: '', firstName: '', lastName: '' });

    if (!agreed) { toast.error('Please accept the Terms & Conditions'); return; }
    if (password.length < 8) { 
        setFieldErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters' }));
        return; 
    }
    
    setLoading(true);
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      await signup(email, password, password, fullName);
      navigate('/verification-pending', { state: { email } });
    } catch (err) {
      console.error('Signup error:', err);
      const msg = err.message?.toLowerCase() || '';
      
      if (msg.includes('email') || msg.includes('identity')) {
        setFieldErrors(prev => ({ ...prev, email: 'Email already exists or invalid' }));
      } else {
        toast.error(err.message || 'Failed to create account');
      }
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
      if (err.isAbort) return;
      toast.error(err.message || 'Google signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingAnimation />}
      <Helmet>
        <title>Create Account - FocusFlow</title>
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

          <div ref={containerRef} style={{ width: '100%', maxWidth: 440 }}>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }} className="sm:hidden animate-item">
              <LogoMark size={48} className="text-black" />
            </div>

            <h1 className="animate-item" style={{ fontWeight: 700, fontSize: 36, color: C.primary, letterSpacing: '-0.02em', margin: '0 0 10px' }}>
              Create an account
            </h1>
            <p className="animate-item" style={{ fontSize: 14, color: C.muted, margin: '0 0 28px' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: C.muted, textDecoration: 'underline' }}>Log in</Link>
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                <div className="animate-item" style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <Input placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} disabled={loading} error={fieldErrors.firstName} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Input placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} disabled={loading} error={fieldErrors.lastName} />
                  </div>
                </div>

                <div className="animate-item">
                  <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} error={fieldErrors.email} />
                </div>
                
                <div className="animate-item">
                  <Input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password} onChange={e => setPassword(e.target.value)}
                    required disabled={loading}
                    rightElement={<EyeIcon show={showPw} onClick={() => setShowPw(p => !p)} />}
                    error={fieldErrors.password}
                  />
                </div>

                {/* Terms checkbox */}
                <div className="animate-item">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginTop: 2 }}>
                    <div
                      onClick={() => setAgreed(a => !a)}
                      style={{
                        width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                        background: agreed ? C.cta : C.card,
                        border: `1px solid ${agreed ? C.cta : C.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.15s, border-color 0.15s', cursor: 'pointer',
                      }}
                    >
                      {agreed && (
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span style={{ fontSize: 13, color: C.muted }}>
                      I agree to the{' '}
                      <a href="#" style={{ color: C.muted, textDecoration: 'underline' }}>Terms & Conditions</a>
                    </span>
                  </label>
                </div>
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
                  {loading ? 'Creating account…' : 'Create account'}
                </button>
              </div>
            </form>

            <div className="animate-item" style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <span style={{ fontSize: 12, color: C.muted, whiteSpace: 'nowrap' }}>Or register with</span>
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

export default SignupPage;
