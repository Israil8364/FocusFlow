import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Target } from 'lucide-react';

/* Circular progress ring for daily focus goal */
const DailyGoalRing = ({ todayMinutes = 0, goalMinutes = 120 }) => {
  const ringRef = useRef(null);
  const pct = Math.min(100, goalMinutes > 0 ? (todayMinutes / goalMinutes) * 100 : 0);
  const radius = 42;
  const circ = 2 * Math.PI * radius;
  const completed = pct >= 100;

  useEffect(() => {
    if (!ringRef.current) return;
    const target = circ - (pct / 100) * circ;
    gsap.to(ringRef.current, {
      strokeDashoffset: target,
      duration: 1.2,
      ease: 'power3.out',
    });
  }, [pct, circ]);

  const hrs = Math.floor(todayMinutes / 60);
  const mins = todayMinutes % 60;
  const timeStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

  const goalHrs = Math.floor(goalMinutes / 60);
  const goalMins = goalMinutes % 60;
  const goalStr = goalHrs > 0 ? `${goalHrs}h` : `${goalMins}m`;

  const ringColor = completed ? '#22c55e' : '#8b5cf6';

  return (
    <div
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
            style={{ filter: `drop-shadow(0 0 6px ${ringColor}88)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {completed
            ? <span className="text-2xl">✅</span>
            : <Target className="w-5 h-5 text-[var(--text-muted)]" />
          }
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">Daily Goal</p>
        <p className="text-2xl font-black text-[var(--text-primary)] leading-none">{timeStr}</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">of {goalStr} target</p>
        {/* Progress bar text */}
        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg)' }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${ringColor}cc, ${ringColor})`,
            }}
          />
        </div>
        <p className="text-[10px] text-[var(--text-muted)] mt-1">{Math.round(pct)}% complete</p>
      </div>
    </div>
  );
};

export default DailyGoalRing;
