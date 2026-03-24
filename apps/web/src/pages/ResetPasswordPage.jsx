
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Security Updated!</h2>
        <p style={{ fontSize: 15, color: '#6b7280', margin: '0 0 32px', lineHeight: '1.5' }}>
          Your password has been reset successfully.<br/>You can now log in with your new password.
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
          Proceed to Login
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

const EyeIcon = ({ show, onClick }) => (
  <span onClick={onClick} style={{ cursor: 'pointer', color: C.placeholder }}>
    {show ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
    )}
  </span>
);

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
          borderRadius: 8, padding: rightElement ? '0 44px 0 16px' : '0 16px',
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

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { confirmPasswordReset } = useAuth();
  
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const [token, setToken] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ password: '', passwordConfirm: '' });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get('token');
    if (t) {
      setToken(t);
    } else {
      toast.error('Invalid reset link');
      navigate('/login');
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({ password: '', passwordConfirm: '' });

    if (password !== passwordConfirm) {
      setFieldErrors(prev => ({ ...prev, passwordConfirm: 'Passwords do not match' }));
      return;
    }
    if (password.length < 8) {
      setFieldErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters' }));
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(token, password, passwordConfirm);
      setShowSuccess(true);
    } catch (err) {
      toast.error(err.message || 'Failed to reset password. Link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingAnimation />}
      <SuccessModal isOpen={showSuccess} onClose={() => navigate('/login')} />
      <Helmet>
        <title>New Password - FocusFlow</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          .cta-btn:hover { background: ${C.ctaHover} !important; }
          .cta-btn:active { transform: scale(0.98); }
          @media (max-width: 640px) {
            .auth-right-panel { padding: 32px 24px !important; }
          }
        `}</style>
      </Helmet>

      <div style={{ height: '100vh', display: 'flex', background: C.bg, fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
        <AuthLeftPanel />

        <div className="auth-right-panel" style={{
          flex: 1, background: C.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '48px 64px', position: 'relative'
        }}>

          <div style={{ width: '100%', maxWidth: 420 }}>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }} className="sm:hidden">
              <LogoMark size={48} className="text-black" />
            </div>

            <h1 style={{ fontWeight: 700, fontSize: 36, color: C.primary, letterSpacing: '-0.02em', margin: '0 0 10px' }}>
              Set new password
            </h1>
            <p style={{ fontSize: 14, color: C.muted, margin: '0 0 32px', lineHeight: '1.5' }}>
              Create a new password that is easy to remember but hard to guess.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Input
                  type={showPw ? 'text' : 'password'} placeholder="New Password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  required disabled={loading}
                  rightElement={<EyeIcon show={showPw} onClick={() => setShowPw(p => !p)} />}
                  error={fieldErrors.password}
                />
                 <Input
                  type={showPwConfirm ? 'text' : 'password'} placeholder="Confirm New Password"
                  value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)}
                  required disabled={loading}
                  rightElement={<EyeIcon show={showPwConfirm} onClick={() => setShowPwConfirm(p => !p)} />}
                  error={fieldErrors.passwordConfirm}
                />
              </div>

              <button type="submit" disabled={loading} className="cta-btn" style={{
                width: '100%', height: 52, marginTop: 24,
                background: C.cta, border: 'none', borderRadius: 8,
                color: '#fff', fontWeight: 600, fontSize: 15,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.18s',
                opacity: loading ? 0.7 : 1,
              }}>
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Link to="/login" style={{ fontSize: 14, color: C.muted, textDecoration: 'none', fontWeight: 500 }}>
                Cancel and back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
