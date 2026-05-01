import React, { useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useGamification, ACHIEVEMENTS, LEAGUES } from '@/contexts/GamificationContext.jsx';
import XPBar from '@/components/gamification/XPBar.jsx';
import StreakWidget from '@/components/gamification/StreakWidget.jsx';
import HeatmapCalendar from '@/components/gamification/HeatmapCalendar.jsx';
import { AchievementsGrid } from '@/components/gamification/AchievementCard.jsx';
import LottieAnimation from '@/components/ui/LottieAnimation.jsx';
import { gsap } from 'gsap';
import { toast } from 'sonner';

const RESPONSIVE_STYLES = `
  .progress-page-wrapper {
    max-width: 900px;
    margin: 0 auto;
    padding: 32px;
    animation: fade-in 0.3s ease;
  }

  .progress-header h1 { font-size: 36px; margin-bottom: 4px; }
  .progress-header p { font-size: 16px; margin-bottom: 32px; }

  .stat-cards-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 32px;
  }

  @media (max-width: 768px) {
    .progress-page-wrapper { padding: 24px; }
    .stat-cards-grid { padding: 0; gap: 14px; }
  }

  @media (max-width: 480px) {
    .progress-page-wrapper {
      padding: 16px 16px 80px 16px;
      max-width: 100%;
      overflow-x: hidden;
    }
    .progress-header h1 { font-size: 26px; }
    .progress-header p { font-size: 13px; margin-bottom: 16px; }
    
    .stat-cards-grid {
      grid-template-columns: 1fr;
      gap: 12px;
      margin-bottom: 20px;
    }
    
    section {
      padding: 16px !important;
      border-radius: 16px !important;
      margin-bottom: 20px !important;
    }
    
    section h2 { font-size: 18px !important; }
  }
`;

/* ─── League Rail component ────────────────────────────────────────── */
const LeagueRail = ({ weeklyXP, league }) => {
  const activeLeagueRef = useRef(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 480;
  const isTablet = typeof window !== 'undefined' && window.innerWidth > 480 && window.innerWidth <= 768;

  useEffect(() => {
    // Animation removed as requested
  }, [league, isMobile]);

  const maxXP = LEAGUES[LEAGUES.length - 1].minXP;
  const progressPct = Math.min(100, (weeklyXP / maxXP) * 100);

  // Responsive sizing (Decreased as requested)
  let activeSize = 64;
  let inactiveSize = 48;
  let railPadding = 40;

  if (isMobile) {
    activeSize = 44;
    inactiveSize = 32;
    railPadding = 20;
    if (window.innerWidth < 360) {
      activeSize = 40;
      inactiveSize = 28;
    }
  } else if (isTablet) {
    activeSize = 54;
    inactiveSize = 40;
    railPadding = 30;
  }

  return (
    <div className="league-rail-container hide-scrollbar" style={{
      position: 'relative',
      height: isMobile ? 110 : 130,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `0 ${railPadding}px`,
      overflowX: 'auto',
      overflowY: 'hidden',
      msOverflowStyle: 'none',
      scrollbarWidth: 'none',
      WebkitTapHighlightColor: 'transparent',
      paddingTop: 20
    }}>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Background Rail */}
      <div style={{
        position: 'absolute',
        left: railPadding,
        right: railPadding,
        top: 20 + (activeSize / 2),
        height: isMobile ? 4 : 6,
        background: 'rgba(216,218,222,0.6)',
        borderRadius: 3,
        zIndex: 0
      }} />

      {/* Progress Rail */}
      <div style={{
        position: 'absolute',
        left: railPadding,
        top: 20 + (activeSize / 2),
        height: isMobile ? 4 : 6,
        width: `calc(${progressPct}% - ${progressPct === 100 ? activeSize / 2 : 0}px)`,
        background: 'linear-gradient(90deg, #22c55e, #10b981)',
        boxShadow: '0 0 12px rgba(34,197,94,0.3)',
        borderRadius: 3,
        zIndex: 1,
        transition: 'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }} />

      {LEAGUES.map((l) => {
        const isActive = l.id === league.id;
        const isUnlocked = weeklyXP >= l.minXP;

        return (
          <div
            key={l.id}
            onClick={() => {
              if (isMobile) {
                toast(l.label, {
                  description: `${l.minXP} XP Required`,
                  duration: 2000,
                  className: 'bg-[#1a1815] text-white rounded-full'
                });
              }
            }}
            style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            {/* Icon Wrapper - Fixed height to ensure centers align with rail */}
            <div style={{
              height: activeSize,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div
                style={{
                  width: isActive ? activeSize : inactiveSize,
                  height: isActive ? activeSize : inactiveSize,
                  background: 'var(--card)',
                  borderRadius: '50%',
                  border: `${isMobile ? 2 : 3}px solid ${isActive ? '#22c55e' : (isUnlocked ? '#10b981' : 'var(--border)')}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isActive ? '0 4px 12px rgba(34,197,94,0.15)' : 'none',
                  transition: 'all 0.3s ease-out',
                  padding: isActive ? (isMobile ? 6 : 8) : 4
                }}
              >
                <LottieAnimation
                  src={l.lottie}
                  autoplay={isActive || isUnlocked}
                  loop={isActive || isUnlocked}
                  style={{
                    width: '100%',
                    height: '100%',
                    filter: isUnlocked ? 'none' : 'grayscale(100%) opacity(0.3)'
                  }}
                  fallback={<span style={{ fontSize: isActive ? (isMobile ? 24 : 32) : (isMobile ? 14 : 20) }}>{l.emoji}</span>}
                />
              </div>
            </div>
            <div style={{
              marginTop: isMobile ? 8 : 12,
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: isMobile ? 10 : 12,
                fontWeight: 700,
                color: isActive ? '#22c55e' : 'var(--text-primary)',
                margin: 0
              }}>{l.label}</p>
              <p style={{
                fontSize: isMobile ? 10 : 10,
                color: 'var(--text-muted)',
                margin: 0
              }}>{l.minXP} XP</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function AchievementsPage() {
  const { weeklyXP, unlockedIds, league, currentStreak } = useGamification();

  const unlockedCount = unlockedIds.length;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <div className="progress-page-wrapper">
      <Helmet>
        <title>Progress — FocusFlow</title>
      </Helmet>

      <style>{RESPONSIVE_STYLES}</style>

      {/* Header */}
      <header className="progress-header">
        <h1 style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Progress</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {unlockedCount} / {totalCount} achievements · {currentStreak} day streak
        </p>
      </header>

      {/* XP + Streak row */}
      <div className="stat-cards-grid">
        <XPBar />
        <StreakWidget />
      </div>

      {/* League rail */}
      <section style={{
        background: 'var(--card)',
        borderRadius: 20,
        padding: 24,
        border: '1px solid var(--border)',
        marginBottom: 32
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Weekly League</h2>
          <span style={{ fontSize: 13, color: '#888c96' }}>{weeklyXP} XP this week</span>
        </div>

        <LeagueRail weeklyXP={weeklyXP} league={league} />

        <p style={{
          fontSize: 11,
          color: '#888c96',
          textAlign: 'center',
          marginTop: 12,
          lineHeight: 1.4
        }}>
          Earn XP from focus sessions to climb leagues. Resets every Monday.
        </p>
      </section>

      {/* Achievements grid */}
      <section style={{
        background: 'var(--card)',
        borderRadius: 20,
        padding: 24,
        border: '1px solid var(--border)',
        marginBottom: 32
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Achievements</h2>
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            padding: '4px 12px',
            borderRadius: 999,
            background: 'rgba(232,55,42,0.1)',
            color: '#e8372a',
            border: '1px solid rgba(232,55,42,0.2)'
          }}>
            {unlockedCount} / {totalCount}
          </span>
        </div>
        <AchievementsGrid />
      </section>

      {/* Heatmap */}
      <section style={{
        background: 'var(--card)',
        borderRadius: 20,
        padding: 24,
        border: '1px solid var(--border)'
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Focus History</h2>
        <HeatmapCalendar />
      </section>
    </div>
  );
}
