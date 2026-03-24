
import React from 'react';

const NeuomorphicTimerRing = ({ progress, time, mode, isRunning }) => {
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const dotColor = mode === 'pomodoro'
    ? '#f07832'
    : mode === 'shortBreak' || mode === 'longBreak'
      ? '#39ff14'
      : 'var(--text-muted)';

  return (
    <div 
      className="relative flex items-center justify-center w-[200px] h-[200px] md:w-[240px] md:h-[240px] lg:w-[280px] lg:h-[280px] rounded-[var(--radius-circle)] shadow-neu bg-[var(--bg)] mx-auto" 
      role="timer" 
      aria-live="polite" 
      aria-label={`Session timer: ${time}`}
    >
      <div className="absolute inset-4 md:inset-5 lg:inset-6 rounded-[var(--radius-circle)] shadow-neu-pressed bg-[var(--bg)]"></div>

      <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none" viewBox="0 0 280 280">
        {/* Ticks */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 360) / 24;
          return (
            <line
              key={i}
              x1="140"
              y1="12"
              x2="140"
              y2="20"
              stroke="var(--border)"
              strokeWidth="2"
              strokeLinecap="round"
              transform={`rotate(${angle} 140 140)`}
            />
          );
        })}
        {/* Progress Ring */}
        <circle
          cx="140"
          cy="140"
          r={radius}
          stroke={dotColor}
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-linear"
          strokeLinecap="round"
        />
      </svg>

      <div className="relative z-10 flex flex-col items-center">
        <div
          className={`w-2.5 h-2.5 rounded-[var(--radius-circle)] mb-3 transition-colors duration-300 ${isRunning ? 'animate-pulse' : ''}`}
          style={{ 
            backgroundColor: dotColor, 
            boxShadow: isRunning ? `0 0 12px ${dotColor}` : 'none' 
          }}
        ></div>
        <div className="text-stat text-[var(--text-primary)]">{time}</div>
      </div>
    </div>
  );
};

export default NeuomorphicTimerRing;
