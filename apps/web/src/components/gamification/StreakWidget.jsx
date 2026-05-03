import React, { useRef, useEffect, useCallback } from 'react';
import { useGamification } from '@/contexts/GamificationContext.jsx';
import LottieAnimation from '@/components/ui/LottieAnimation.jsx';
import { gsap } from 'gsap';
import { Flame, Snowflake } from 'lucide-react';

/* ─── Streak dot row ────────────────────────────────────────────────── */
const StreakDots = ({ streak }) => {
  const flameColor = '#e8372a';
  const filled = Math.min(streak, 7);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 480;

  return (
    <div style={{ display: 'flex', gap: isMobile ? 4 : 6, marginTop: isMobile ? 4 : 8 }}>
      {Array.from({ length: 7 }, (_, i) => {
        const active = i < filled;
        return (
          <div
            key={i}
            style={{
              width: isMobile ? 8 : 10,
              height: isMobile ? 8 : 10,
              borderRadius: '50%',
              background: active ? flameColor : '#d8dade',
              animation: active ? 'dotPulse 1.5s ease-in-out infinite' : 'none',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        );
      })}
    </div>
  );
};

/* ─── Main StreakWidget ─────────────────────────────────────────────── */
const StreakWidget = () => {
  const { currentStreak, longestStreak, streakFreezes, useStreakFreeze } = useGamification();

  const fireRef = useRef(null);
  const fireGsapRef = useRef(null); // store tween to kill on cleanup
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 480;

  /* Determine fire size and play state */
  const fireSize = isMobile ? 48 : (currentStreak >= 7 ? 72 : 56);
  const fireActive = currentStreak > 0;

  /* GSAP: pulse scale on fireRef if streak >= 7 */
  useEffect(() => {
    if (!fireRef.current) return;
    // Kill previous tween
    if (fireGsapRef.current) fireGsapRef.current.kill();

    if (currentStreak >= 7) {
      fireGsapRef.current = gsap.to(fireRef.current, {
        scale: 1.15,
        repeat: -1,
        yoyo: true,
        duration: isMobile ? 1.2 : 0.6,
        ease: 'power1.inOut',
      });
    } else {
      gsap.set(fireRef.current, { scale: 1 });
    }
    return () => fireGsapRef.current?.kill();
  }, [currentStreak]);

  const streakColor = fireActive ? '#e8372a' : '#888c96';
  const streakFontSize = isMobile ? 36 : (currentStreak >= 7 ? 28 : 22);

  const STYLES = `
    .streak-card {
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
      .streak-card {
        padding: 14px;
        gap: 12px;
      }
      .streak-stat-label { font-size: 10px !important; }
      .streak-stat-value { font-size: 13px !important; }
      .streak-main-label { font-size: 10px !important; }
    }
  `;

  return (
    <div className="streak-card">
      <style>{STYLES}</style>
      {/* Fire + streak number */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 }}>
        <div ref={fireRef}>
          <LottieAnimation
            src="/lottie/Fire.json"
            autoplay={fireActive}
            loop={fireActive}
            style={{
              width: fireSize,
              height: fireSize,
              filter: fireActive ? 'none' : 'grayscale(100%) opacity(0.4)',
              transition: 'width 0.3s, height 0.3s, filter 0.3s',
            }}
            fallback={
              <Flame
                style={{
                  width: fireSize,
                  height: fireSize,
                  color: streakColor,
                }}
              />
            }
          />
        </div>
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 900,
          fontSize: streakFontSize,
          lineHeight: 1,
          color: streakColor,
          transition: 'color 0.3s, font-size 0.3s',
        }}>
          {currentStreak}
        </span>
        <span className="streak-main-label" style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Day Streak
        </span>
        <StreakDots streak={currentStreak} />
      </div>

      {/* Divider */}
      <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--border)' }} />

      {/* Stats */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
          <span className="streak-stat-label" style={{ color: 'var(--text-muted)' }}>Best streak</span>
          <span className="streak-stat-value" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{longestStreak} days</span>
        </div>

        {/* Streak freeze row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Snowflake size={14} color="#3a7bd5" />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Freezes: <strong style={{ color: '#3a7bd5' }}>{streakFreezes}</strong>
            </span>
          </div>
          {streakFreezes > 0 && (
            <button
              onClick={useStreakFreeze}
              style={{
                fontSize: 10,
                padding: '2px 10px',
                borderRadius: 999,
                border: '1px solid rgba(58,123,213,0.4)',
                color: '#3a7bd5',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              Use freeze
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StreakWidget;
