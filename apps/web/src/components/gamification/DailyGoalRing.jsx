import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Target } from 'lucide-react';
import Lottie from 'lottie-react';
import achievementData from '@/assets/1st_achievment.json';

/* Circular progress ring for daily focus goal */
const DailyGoalRing = ({ todayMinutes = 0, goalMinutes = 120 }) => {
  const ringRef = useRef(null);
  const containerRef = useRef(null);
  const pct = Math.min(100, goalMinutes > 0 ? (todayMinutes / goalMinutes) * 100 : 0);
  const radius = 42;
  const circ = 2 * Math.PI * radius;
  const completed = pct >= 100;

  const prevCompletedRef = useRef(false);

  // Animate the ring stroke on progress change
  useEffect(() => {
    if (!ringRef.current) return;
    const target = circ - (pct / 100) * circ;
    gsap.to(ringRef.current, {
      strokeDashoffset: target,
      duration: 1.2,
      ease: 'power3.out',
    });
  }, [pct, circ]);

  // Pulse + scale burst when goal first hits 100%
  useEffect(() => {
    if (completed && !prevCompletedRef.current && containerRef.current) {
      prevCompletedRef.current = true;
      gsap.fromTo(
        containerRef.current,
        { scale: 1 },
        {
          scale: 1.08,
          duration: 0.35,
          ease: 'power2.out',
          yoyo: true,
          repeat: 3,
          onComplete: () => gsap.to(containerRef.current, { scale: 1, duration: 0.3 }),
        }
      );
    }
    if (!completed) prevCompletedRef.current = false;
  }, [completed]);

  const hrs = Math.floor(todayMinutes / 60);
  const mins = todayMinutes % 60;
  const timeStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

  const goalHrs = Math.floor(goalMinutes / 60);
  const goalMins = goalMinutes % 60;
  const goalStr = goalHrs > 0 ? `${goalHrs}h` : `${goalMins}m`;

  const ringColor = completed ? '#22c55e' : '#8b5cf6';

  return (
    <div
      ref={containerRef}
      className="flex items-center gap-4 p-4 rounded-[var(--radius-lg)] border border-[var(--border)]"
      style={{ background: 'var(--card)' }}
    >
      {/* Ring SVG */}
      <div className="relative shrink-0 w-[100px] h-[100px]">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Track */}
          <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--border)" strokeWidth="7" />
          {/* Progress */}
          <circle
            ref={ringRef}
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ}
            style={{
              filter: `drop-shadow(0 0 ${completed ? '10px' : '6px'} ${ringColor}${completed ? 'bb' : '88'})`,
              transition: 'filter 0.5s ease',
            }}
          />
          {/* Glowing pulse ring when completed */}
          {completed && (
            <circle
              cx="50" cy="50" r={radius}
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
              opacity="0.4"
              style={{ animation: 'ring-pulse 2s ease-in-out infinite' }}
            />
          )}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-full">
          {completed ? (
            <Lottie
              animationData={achievementData}
              loop={true}
              autoplay={true}
              style={{ width: 58, height: 58 }}
            />
          ) : (
            <Target className="w-5 h-5 text-[var(--text-muted)]" />
          )}
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">Daily Goal</p>
        <p className={`text-2xl font-black leading-none transition-colors duration-500 ${completed ? 'text-green-500' : 'text-[var(--text-primary)]'}`}>
          {timeStr}
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-1">of {goalStr} target</p>
        {/* Progress bar */}
        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg)' }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${ringColor}cc, ${ringColor})`,
              boxShadow: completed ? `0 0 8px ${ringColor}88` : 'none',
            }}
          />
        </div>
        <p className={`text-[10px] mt-1 font-semibold transition-colors duration-500 ${completed ? 'text-green-500' : 'text-[var(--text-muted)]'}`}>
          {completed ? '🎉 Goal crushed!' : `${Math.round(pct)}% complete`}
        </p>
      </div>

      <style>{`
        @keyframes ring-pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.1; }
        }
      `}</style>
    </div>
  );
};

export default DailyGoalRing;
