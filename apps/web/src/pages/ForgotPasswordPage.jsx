
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';
import AuthLeftPanel from '@/components/AuthLeftPanel.jsx';
import { LogoMark } from '@/components/Logo.jsx';
import LoadingAnimation from '@/components/LoadingAnimation.jsx';
import pb from '@/lib/pocketbaseClient';

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

const Input = ({ type = 'text', placeholder, value, onChange, required, disabled, error }) => {
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
          borderRadius: 8, padding: '0 16px',
          color: C.primary, fontSize: 14,
          fontFamily: 'Inter, sans-serif', outline: 'none',
          boxSizing: 'border-box', transition: 'border-color 0.18s',
        }}
        className="auth-input"
      />
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

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Step 1: Check if user exists
      // Using pb directly to check for existence
      const result = await pb.collection('users').getList(1, 1, {
        filter: `email = "${email}"`,
        base : 'users'
      });

      if (result.totalItems === 0) {
        setError('Account with this email not found');
        setLoading(false);
        return;
      }

      // Step 2: Send reset link
      await requestPasswordReset(email);
      setSubmitted(true);
      toast.success('Reset link sent to your email!');
    } catch (err) {
      console.error('Password reset error:', err);
      const msg = err.message?.toLowerCase() || '';
      
      // Secondary check in case getList is restricted but we still want to handle the error
      if (msg.includes('not found') || msg.includes('email')) {
          setError('Account with this email not found');
      } else if (msg.includes('forbidden') || msg.includes('authorize')) {
          // Fallback if List permission is restricted: just try to send and show error if it fails
          try {
             await requestPasswordReset(email);
             setSubmitted(true);
             toast.success('Reset link sent to your email!');
          } catch (resetErr) {
             setError('Account with this email not found');
          }
      } else {
          toast.error(err.message || 'Failed to send reset link');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingAnimation />}
      <Helmet>
        <title>Forgot Password - FocusFlow</title>
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

            {!submitted ? (
              <>
                <h1 style={{ fontWeight: 700, fontSize: 36, color: C.primary, letterSpacing: '-0.02em', margin: '0 0 10px' }}>
                  Reset password
                </h1>
                <p style={{ fontSize: 14, color: C.muted, margin: '0 0 32px', lineHeight: '1.5' }}>
                  Enter the email address associated with your account and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Input
                      type="email" placeholder="Email"
                      value={email} onChange={e => setEmail(e.target.value)}
                      required disabled={loading}
                      error={error}
                    />
                  </div>

                  <button type="submit" disabled={loading} className="cta-btn" style={{
                    width: '100%', height: 52, marginTop: 24,
                    background: C.cta, border: 'none', borderRadius: 8,
                    color: '#fff', fontWeight: 600, fontSize: 15,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background 0.18s, transform 0.12s',
                    opacity: loading ? 0.7 : 1,
                  }}>
                    {loading ? 'Sending link…' : 'Send reset link'}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                 <div style={{ 
                    width: 72, height: 72, borderRadius: '50%', background: 'rgba(232,55,42,0.1)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
                  }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H17.5C20 5 22 7 22 9.5V17z" />
                      <path d="M2 9.5l10 6 10-6" />
                    </svg>
                  </div>
                <h1 style={{ fontWeight: 700, fontSize: 32, color: C.primary, letterSpacing: '-0.02em', margin: '0 0 12px' }}>
                  Check your mail
                </h1>
                <p style={{ fontSize: 14, color: C.muted, margin: '0 0 32px', lineHeight: '1.5' }}>
                  We have sent a password recover instruction to your email.
                </p>
                <button 
                  onClick={() => navigate('/login')}
                  className="cta-btn" 
                  style={{
                    width: '100%', height: 52,
                    background: C.cta, border: 'none', borderRadius: 8,
                    color: '#fff', fontWeight: 600, fontSize: 15,
                    cursor: 'pointer', transition: 'background 0.18s',
                  }}
                >
                  Back to Login
                </button>
              </div>
            )}

            {!submitted && (
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <Link to="/login" style={{ fontSize: 14, color: C.muted, textDecoration: 'none', fontWeight: 500 }}>
                  ← Back to Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
