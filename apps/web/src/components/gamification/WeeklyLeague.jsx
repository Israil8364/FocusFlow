import React from 'react';
import { useGamification, LEAGUES } from '@/contexts/GamificationContext.jsx';
import { motion } from 'framer-motion';

const WeeklyLeague = () => {
  const { weeklyXP, league } = useGamification();

  // Calculate overall progress percentage (linear between nodes)
  const getProgress = (xp) => {
    if (xp <= 0) return 0;
    if (xp >= 3500) return 100;

    // Nodes at 0% (Bronze), 33.3% (Silver), 66.6% (Gold), 100% (Platinum)
    if (xp < 500) return (xp / 500) * 33.3;
    if (xp < 1500) return 33.3 + ((xp - 500) / 1000) * 33.3;
    return 66.6 + ((xp - 1500) / 2000) * 33.4;
  };

  const progress = getProgress(weeklyXP);

  return (
    <div className="bg-[var(--card)] p-4 sm:p-6 md:p-8 rounded-[var(--radius-lg)] border border-[var(--border)] shadow-sm overflow-x-auto">
      <div className="min-w-[280px]">
      <div className="flex items-center justify-between mb-12">
        <h3 className="text-xl font-bold text-[var(--text-primary)]">Weekly League</h3>
        <span className="text-sm font-medium text-[var(--text-muted)]">
          {weeklyXP.toLocaleString()} XP this week
        </span>
      </div>

      <div className="relative px-8">
        {/* Background Track */}
        <div className="absolute top-1/2 left-8 right-8 h-1.5 bg-gray-100 -translate-y-1/2 rounded-full" />

        {/* Progress Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-1/2 left-8 h-1.5 bg-[#22c55e] -translate-y-1/2 rounded-full z-10"
          style={{ maxWidth: 'calc(100% - 64px)' }}
        />

        {/* Nodes */}
        <div className="relative flex justify-between items-center z-20">
          {LEAGUES.map((l, index) => {
            const isReached = weeklyXP >= l.minXP;
            const isCurrent = league?.id === l.id;

            return (
              <div key={l.id} className="flex flex-col items-center">
                {/* Circle Container */}
                <div className="relative group">
                  {/* Current League Outer Ring */}
                  {isCurrent && (
                    <motion.div
                      layoutId="currentRing"
                      className="absolute -inset-2 rounded-full border-[3px] border-[#22c55e] z-0"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      style={{ boxShadow: '0 0 15px rgba(34, 197, 94, 0.4)' }}
                    />
                  )}

                  {/* Circle */}
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 border-4 z-10 relative ${isReached ? 'bg-white border-[#22c55e] shadow-sm' : 'bg-gray-50 border-gray-100'
                    }`}>
                    <img
                      src={l.svg}
                      alt={l.label}
                      className={`w-8 h-8 transition-all duration-500 ${isReached ? 'grayscale-0 opacity-100' : 'grayscale opacity-30'}`}
                      style={l.id === 'platinum' ? { filter: isReached ? 'hue-rotate(180deg) brightness(1.2)' : 'grayscale(1) opacity(0.3)' } : {}}
                    />
                  </div>
                </div>

                {/* Labels */}
                <div className="mt-4 text-center">
                  <p className={`text-sm font-bold transition-colors duration-500 ${isReached ? 'text-[#22c55e]' : 'text-gray-400'}`}>
                    {l.label}
                  </p>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                    {l.minXP} XP
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-xs text-[var(--text-muted)] font-medium">
          Earn XP from focus sessions to climb leagues. Resets every Monday.
        </p>
      </div>
      </div>
    </div>
  );
};

export default WeeklyLeague;
