import React, { useEffect, useRef, useState } from 'react';
import Lottie from 'lottie-react';

/**
 * DailyGoalCelebration
 * Shown as a full-screen overlay when the daily goal reaches 100%.
 * Auto-dismisses after 4 seconds or on click/tap.
 */
const DailyGoalCelebration = ({ onDismiss }) => {
  const timerRef = useRef(null);
  const [animData, setAnimData] = useState(null);

  useEffect(() => {
    fetch('/lottie/1st_achievment.json')
      .then(r => r.json())
      .then(setAnimData)
      .catch(e => console.warn('Could not load achievement animation:', e));
  }, []);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onDismiss?.();
    }, 4000);
    return () => clearTimeout(timerRef.current);
  }, [onDismiss]);

  return (
    <div
      role="dialog"
      aria-label="Daily goal achieved!"
      onClick={() => { clearTimeout(timerRef.current); onDismiss?.(); }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.88) 100%)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      {/* Glowing ring behind lottie */}
      <div
        className="relative flex flex-col items-center gap-6 select-none"
        style={{ animation: 'celebration-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        <div className="relative">
          {/* Outer glow */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(0,200,75,0.35) 0%, transparent 70%)',
              transform: 'scale(1.6)',
              animation: 'pulse-glow 1.5s ease-in-out infinite',
            }}
          />
          {animData ? (
            <Lottie
              animationData={animData}
              loop={false}
              autoplay
              style={{ width: 160, height: 160 }}
            />
          ) : (
            <div className="w-40 h-40 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-6xl">🎯</span>
            </div>
          )}
        </div>

        <div className="text-center px-6">
          <p className="text-4xl font-black text-white tracking-tight mb-2">
            🎯 Daily Goal Crushed!
          </p>
          <p className="text-lg text-white/70 font-medium">
            you actually did it. no cap, legend behaviour fr 🔥
          </p>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); clearTimeout(timerRef.current); onDismiss?.(); }}
          className="mt-2 px-8 py-3 rounded-full bg-white text-black font-bold text-sm hover:bg-white/90 active:scale-95 transition-all shadow-2xl"
        >
          keep the energy ⚡
        </button>

        <p className="text-xs text-white/30 mt-1">tap anywhere to close</p>
      </div>

      <style>{`
        @keyframes celebration-pop {
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; transform: scale(1.6); }
          50%       { opacity: 1;   transform: scale(1.9); }
        }
      `}</style>
    </div>
  );
};

export default DailyGoalCelebration;
