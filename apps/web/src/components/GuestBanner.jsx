import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { LogoMark } from './Logo.jsx';

const GuestBanner = () => {
  const { isGuest } = useAuth();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (!isGuest || dismissed) return null;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        background: 'linear-gradient(90deg, #1a1815 0%, #2d2820 100%)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: '9px 48px 9px 16px',
        fontSize: 13,
        fontFamily: 'Inter, sans-serif',
        zIndex: 100,
        flexShrink: 0,
        flexWrap: 'wrap',
        lineHeight: 1.5,
      }}
    >
      {/* Brand logo mark */}
      <LogoMark size={20} className="text-[#e8372a]" />

      <span style={{ opacity: 0.85 }}>
        You're in <strong style={{ color: '#e8372a', opacity: 1 }}>Guest Mode</strong> — data is saved
        in this browser only.
      </span>

      <button
        onClick={() => navigate('/signup')}
        style={{
          background: '#e8372a',
          border: 'none',
          borderRadius: 6,
          color: '#fff',
          fontWeight: 600,
          fontSize: 12,
          padding: '5px 14px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'background 0.15s, transform 0.1s',
          flexShrink: 0,
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#c62d22')}
        onMouseLeave={e => (e.currentTarget.style.background = '#e8372a')}
      >
        Sign up to save everywhere →
      </button>

      {/* Dismiss button */}
      <button
        aria-label="Dismiss guest banner"
        onClick={() => setDismissed(true)}
        style={{
          position: 'absolute',
          right: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          color: '#aaa',
          fontSize: 18,
          cursor: 'pointer',
          lineHeight: 1,
          padding: '0 4px',
        }}
      >
        ×
      </button>
    </div>
  );
};

export default GuestBanner;
