import React, { useRef, useEffect } from 'react';
import { useGamification, getLevelProgress, LEAGUES } from '@/contexts/GamificationContext.jsx';
import { gsap } from 'gsap';
import LottieAnimation from '@/components/ui/LottieAnimation.jsx';

/* ─── XP bar with gradient fill, GSAP-animated ─────────────────────── */
export default function XPBar() {
  const { xp, level, levelProgress, league } = useGamification();
  const barRef = useRef(null);
  const prevPct = useRef(0);

  useEffect(() => {
    if (!barRef.current) return;
    gsap.to(barRef.current, {
      width: `${levelProgress.pct}%`,
      duration: window.innerWidth <= 480 ? 0.8 : 1.2,
      ease: 'power2.out',
    });
    prevPct.current = levelProgress.pct;
  }, [levelProgress.pct]);

  const STYLES = `
    .xp-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      background: var(--card);
      width: 100%;
    }

    @media (max-width: 480px) {
      .xp-card {
        padding: 14px;
        gap: 12px;
      }
      .xp-level-badge {
        width: 40px !important;
        height: 40px !important;
      }
      .xp-level-inner {
        width: 30px !important;
        height: 30px !important;
        font-size: 11px !important;
      }
      .xp-text-main { font-size: 14px !important; }
      .xp-text-sub { font-size: 11px !important; }
    }
  `;

  return (
    <div className="xp-card">
      <style>{STYLES}</style>
      {/* Level badge */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div className="xp-level-badge" style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: `conic-gradient(#22c55e ${levelProgress.pct * 3.6}deg, var(--bg) 0deg)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div className="xp-level-inner" style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            fontSize: 13,
            color: 'var(--text-primary)',
          }}>
            {level}
          </div>
        </div>
        {/* Floating decorations removed */}
      </div>

      {/* Bar + info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
          <span className="xp-text-main" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Level {level}</span>
          <span className="xp-text-sub" style={{ color: 'var(--text-muted)' }}>{xp.toLocaleString()} XP</span>
        </div>

        {/* Track */}
        <div style={{
          height: 8,
          borderRadius: 4,
          background: '#e2ddd7',
          overflow: 'hidden',
        }}>
          {/* Filled bar — starts at 0 width, GSAP animates it */}
          <div
            ref={barRef}
            style={{
              height: '100%',
              width: '0%',
              borderRadius: 4,
              background: 'linear-gradient(90deg, #22c55e, #10b981)',
              boxShadow: '0 0 8px rgba(34,197,94,0.4)',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, alignItems: 'center' }}>
          <span className="xp-text-sub" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            {levelProgress.cur} → {levelProgress.nxt} XP
          </span>

          {/* League chip removed as requested */}
        </div>
      </div>
    </div>
  );
}
