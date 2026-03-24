import React, { useState, useEffect } from 'react';
import { LogoWordmark } from './Logo.jsx';

const SLIDES = [
  {
    image: '/auth-bg.png',
    quote: 'Deep work, tracked.\nFocus that compounds.',
  },
  {
    image: '/auth-bg2.png',
    quote: 'Hours saved by systems.\nBrain saved for thinking.',
  },
  {
    image: '/auth-bg3.png',
    quote: 'Small sessions, big results.\nConsistency beats intensity.',
  },
];

const AuthLeftPanel = () => {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % SLIDES.length);
        setFading(false);
      }, 400);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  const goTo = (i) => {
    setFading(true);
    setTimeout(() => { setCurrent(i); setFading(false); }, 400);
  };

  return (
    <>
    <style>{`
      @media (max-width: 1024px) {
        .auth-left-panel { display: none !important; }
      }
    `}</style>
    {/* Outer wrapper — page-colour bg + margin all around */}
    <div className="auth-left-panel" style={{
      width: '42%',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'stretch',
      padding: '24px 0 24px 24px',
      boxSizing: 'border-box',
    }}>
      {/* Inner card — rounded corners + overflow clip */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 24,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}>

        {/* Crossfading background images */}
        {SLIDES.map((s, i) => (
          <img
            key={i}
            src={s.image}
            alt=""
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center',
              opacity: i === current ? (fading ? 0 : 1) : 0,
              transition: 'opacity 0.4s ease-in-out',
            }}
          />
        ))}

        {/* Dark gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(to bottom, rgba(18,16,32,0.6) 0%, rgba(18,16,32,0.15) 45%, rgba(18,16,32,0.85) 100%)',
        }} />

        {/* Top: Logo + Back to website button */}
        <div style={{ 
          position: 'relative', 
          zIndex: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '24px 24px 0 24px' 
        }}>
          <LogoWordmark height={26} className="text-white" />
          
          <a href="/" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: 999, padding: '7px 14px',
            fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#fff',
            textDecoration: 'none', whiteSpace: 'nowrap',
          }}>
            Back to website <span style={{ marginLeft: 2 }}>→</span>
          </a>
        </div>

        {/* Bottom-centre: quote + dots */}
        <div style={{
          position: 'absolute', bottom: 32, left: 0, right: 0, zIndex: 2,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '0 40px',
        }}>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 22,
            color: '#fff', lineHeight: 1.45, margin: '0 0 18px',
            textAlign: 'center', whiteSpace: 'pre-line',
            textShadow: '0 2px 14px rgba(0,0,0,0.5)',
            opacity: fading ? 0 : 1,
            transform: fading ? 'translateY(6px)' : 'translateY(0)',
            transition: 'opacity 0.4s ease-in-out, transform 0.4s ease-in-out',
          }}>
            {slide.quote}
          </p>

          {/* Expandable pill dots */}
          <div style={{ display: 'flex', gap: 8 }}>
            {SLIDES.map((_, i) => (
              <div
                key={i}
                onClick={() => goTo(i)}
                style={{
                  width: i === current ? 22 : 8,
                  height: 8,
                  borderRadius: 999,
                  background: i === current ? '#ffffff' : 'rgba(255,255,255,0.35)',
                  transition: 'width 0.3s ease, background 0.3s ease',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
    </>
  );
};

export default AuthLeftPanel;
