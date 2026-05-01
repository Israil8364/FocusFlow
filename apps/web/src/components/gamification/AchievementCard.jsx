import React, { useRef, useEffect, useState } from 'react';
import { ACHIEVEMENTS, useGamification } from '@/contexts/GamificationContext.jsx';
import { Lock } from 'lucide-react';
import { gsap } from 'gsap';
import { toast } from 'sonner';
import LottieAnimation from '@/components/ui/LottieAnimation.jsx';

/* ─── CSS keyframes injected once ─────────────────────────────────── */
const STYLES = `
  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
    50%       { box-shadow: 0 0 16px rgba(232,55,42,0.35); }
  }
  @keyframes dotPulse {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(1.35); }
  }
  .achievement-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 150px;
    height: 200px;
    padding: 20px;
    border-radius: 20px;
    background: var(--card);
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    cursor: default;
    overflow: hidden;
    -webkit-tap-highlight-color: transparent;
  }
  .achievement-card:active {
    transform: scale(0.97) !important;
  }
  .achievements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
    padding: 8px 0;
  }
  @media (max-width: 768px) {
    .achievements-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; }
    .achievement-card { height: 180px; padding: 16px; }
  }
  @media (max-width: 480px) {
    .achievements-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .achievement-card { height: 160px; padding: 14px; border-radius: 16px; min-width: auto; }
    .achievement-title { font-size: 12px !important; }
    .achievement-desc { font-size: 10px !important; }
  }
`;

/* ─── Single card ──────────────────────────────────────────────────── */
const AchievementCard = ({ achievement, unlocked, unlockedAt, isNewlyUnlocked }) => {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 480;

  useEffect(() => {
    if (!cardRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold: isMobile ? 0.1 : 0.5 });

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [isMobile]);

  /* Animate in if newly unlocked */
  useEffect(() => {
    if (!isNewlyUnlocked || !cardRef.current) return;
    gsap.fromTo(
      cardRef.current,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
    );
    if (window.confetti) {
      window.confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
    toast.success(`🏆 Achievement Unlocked: ${achievement.title}`);
  }, [isNewlyUnlocked, achievement.title]);

  const handleTap = () => {
    if (!unlocked && isMobile) {
      setPreviewing(true);
      setTimeout(() => setPreviewing(false), 1500);
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={handleTap}
      className="achievement-card"
      style={{
        border: `1px solid ${unlocked ? 'rgba(232,55,42,0.4)' : 'var(--border)'}`,
        animation: unlocked && isVisible ? 'glowPulse 2s ease-in-out infinite' : 'none',
        opacity: unlocked ? 1 : 0.65,
      }}
    >
      <style>{STYLES}</style>
      {/* Lock badge — top-right corner */}
      {!unlocked && (
        <div style={{ position: 'absolute', top: isMobile ? 8 : 10, right: isMobile ? 8 : 10 }}>
          <Lock size={isMobile ? 14 : 16} color="#888c96" />
        </div>
      )}

      {/* Lottie icon — 80×80 */}
      <LottieAnimation
        src={achievement.lottie}
        autoplay={unlocked || previewing}
        loop={unlocked}
        style={{
          width: isMobile ? 56 : 80,
          height: isMobile ? 56 : 80,
          filter: unlocked ? 'none' : 'grayscale(100%) opacity(0.45)',
          flexShrink: 0,
        }}
        fallback={
          <span style={{ fontSize: 40, filter: unlocked ? 'none' : 'grayscale(100%) opacity(0.45)' }}>
            {achievement.emoji}
          </span>
        }
      />

      {/* Achievement name */}
      <p className="achievement-title" style={{
        marginTop: isMobile ? 8 : 12,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
        fontSize: 14,
        color: '#1a1815',
        textAlign: 'center',
        lineHeight: 1.3,
      }}>
        {achievement.title}
      </p>

      {/* Description */}
      <p className="achievement-desc" style={{
        marginTop: 4,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 400,
        fontSize: 11,
        color: '#888c96',
        textAlign: 'center',
        lineHeight: 1.4,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {achievement.desc}
      </p>

      {/* Unlocked-at date */}
      {unlocked && unlockedAt && (
        <p style={{
          marginTop: 'auto',
          fontSize: 9,
          color: '#e8372a',
          fontWeight: 500,
          paddingTop: 6,
        }}>
          {new Date(unlockedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </p>
      )}
    </div>
  );
};

export default AchievementCard;

/* ─── Grid of all achievements ─────────────────────────────────────── */
export function AchievementsGrid({ unlockedMap = {} }) {
  const ctx = useGamification();
  const resolvedIds = ctx?.unlockedIds ?? [];
  const newlyUnlocked = ctx?.newlyUnlocked ?? [];

  return (
    <div className="achievements-grid">
      {ACHIEVEMENTS.map(a => (
        <AchievementCard
          key={a.id}
          achievement={a}
          unlocked={resolvedIds.includes(a.id)}
          unlockedAt={unlockedMap[a.id]}
          isNewlyUnlocked={newlyUnlocked.includes(a.id)}
        />
      ))}
    </div>
  );
}
