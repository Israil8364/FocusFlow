import React, { useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Timer,
  ChevronRight,
  Info,
  Zap,
  ArrowUp,
  Minus,
  MoreVertical,
  Clock,
  History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLeaderboard } from '@/contexts/LeaderboardContext';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification, LEAGUES } from '@/contexts/GamificationContext';
import { gsap } from 'gsap';

// Mock data to match the screenshot's "Anonymous" vibe or real names
const MOCK_USERS = [
  { id: 'm1', username: 'Anonymous #9421', xp: 4250, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=m1', trend: 'up', status: 'Focused for 42h this week' },
  { id: 'm2', username: 'Anonymous #1052', xp: 3800, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=m2', trend: 'down', status: 'Focused for 38h this week' },
  { id: 'm3', username: 'Anonymous #3389', xp: 3550, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=m3', trend: 'stable', status: 'Focused for 35h this week' },
  { id: 'm4', username: 'Anonymous #2904', xp: 2900, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=m4', trend: 'up', status: 'Steady progress' },
  { id: 'm5', username: 'Anonymous #1112', xp: 2450, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=m5', trend: 'up', status: 'Active now' },
  { id: 'm6', username: 'Anonymous #7732', xp: 1800, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=m6', trend: 'down', status: 'Joined 2 days ago' },
  { id: 'm7', username: 'Anonymous #0045', xp: 1200, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=m7', trend: 'stable', status: 'No recent activity' },
  { id: 'm8', username: 'Anonymous #8841', xp: 950, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=m8', trend: 'up', status: 'Working hard' },
  { id: 'm9', username: 'Anonymous #1932', xp: 700, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=m9', trend: 'stable', status: 'Steady progress' },
  { id: 'm10', username: 'Anonymous #5502', xp: 450, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=m10', trend: 'up', status: 'Climbing fast' },
];

const PodiumItem = ({ user, rank, delay }) => {
  const isFirst = rank === 1;
  const pngPath = `/lottie_animation/${rank === 1 ? '1st' : rank === 2 ? '2nd' : '3rd'}-place.png`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8, ease: "backOut" }}
      className={`flex flex-col items-center relative ${isFirst ? 'z-20 -mt-8' : 'z-10'}`}
    >
      <div className="relative mb-4">
        <div className={`rounded-full border-4 border-white shadow-xl overflow-hidden ${isFirst ? 'w-24 h-24 sm:w-28 sm:h-28' : 'w-20 h-20 sm:w-22 sm:h-22'}`}>
          <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
        </div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
          <img src={pngPath} alt={`Rank ${rank}`} className="w-full h-full object-contain drop-shadow-lg" />
        </div>
      </div>
      <div className="text-center mt-4">
        <h4 className={`font-black truncate max-w-[100px] text-sm ${isFirst ? 'text-lg text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
          {user.username.split(' ')[0]}
        </h4>
        <div className="flex items-center justify-center gap-1 text-xs font-bold text-[var(--text-muted)]">
          <Zap size={10} className="text-yellow-500" fill="currentColor" />
          {user.xp} XP
        </div>
      </div>
      {/* Pedestal Shadow/Base */}
      <div className={`mt-2 w-full h-2 rounded-full blur-md opacity-20 bg-black`} />
    </motion.div>
  );
};

const LeaderboardRow = ({ user, rank, isMe, index }) => {
  const navigate = useNavigate();
  const svgPath = rank <= 3 ? `/lottie_animation/${rank === 1 ? '1st' : rank === 2 ? '2nd' : '3rd'}-place.svg` : null;
  const isInPromotionZone = rank <= 10;

  return (
    <motion.div
      className={`leaderboard-row relative flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border transition-all duration-300 hover:shadow-md cursor-pointer mb-2 ${isMe
          ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200 shadow-sm'
          : 'bg-white border-[var(--border)]'
        }`}
      onClick={() => navigate(`/user/${user.id}`)}
      whileHover={{ scale: 1.005, x: 4 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Promotion Zone vertical line */}
      {isInPromotionZone && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/4 bg-blue-400 rounded-r-full" />
      )}

      <div className="w-10 flex justify-center items-center">
        {svgPath ? (
          <img src={svgPath} alt={`Rank ${rank}`} className="w-8 h-8 object-contain" />
        ) : (
          <span className="text-[var(--text-muted)] font-black text-sm">{rank}</span>
        )}
      </div>

      <div className="relative shrink-0">
        <img
          src={user.avatar}
          alt={user.username}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white shadow-sm bg-white"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className={`font-bold truncate text-sm sm:text-base ${isMe ? 'text-red-600' : 'text-[var(--text-primary)]'}`}>
            {user.username}
          </h4>
        </div>
        <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)] font-medium truncate">
          {user.status || 'Steady progress'}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <div className="flex items-center justify-end gap-1 text-xs sm:text-sm font-black text-[var(--text-primary)]">
            <Zap size={12} className="text-yellow-500" fill="currentColor" />
            {user.xp}
          </div>
          <div className="flex items-center justify-end">
            {user.trend === 'up' && <ArrowUp size={12} className="text-green-500" />}
            {user.trend === 'down' && <ArrowUp size={12} className="text-red-400 rotate-180" />}
            {user.trend === 'stable' && <Minus size={12} className="text-gray-300" />}
          </div>
        </div>
        <ChevronRight size={16} className="text-[var(--border)]" />
      </div>
    </motion.div>
  );
};

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const { members, loading: lbLoading } = useLeaderboard();
  const { currentUser } = useAuth();
  const { league: currentLeague } = useGamification();
  const listRef = useRef(null);

  const leaderboardData = useMemo(() => {
    const realOnes = (members || []).map(m => {
      const isMe = m.user_id === currentUser?.id;
      return {
        id: m.user_id,
        username: isMe ? (currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0]) : (m.username || 'Anonymous'),
        xp: m.weekly_xp || 0,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.user_id}`,
        trend: 'up',
        status: isMe ? 'Active now' : 'Steady progress'
      };
    });

    const combined = [...realOnes];
    if (combined.length < 10) {
      MOCK_USERS.forEach(mu => {
        if (!combined.find(c => c.username === mu.username)) {
          combined.push(mu);
        }
      });
    }
    return combined.sort((a, b) => b.xp - a.xp);
  }, [members, currentUser]);

  const top3 = leaderboardData.slice(0, 3);
  const others = leaderboardData.slice(0); // Show full list including top 3 but styled differently

  useEffect(() => {
    if (!lbLoading && listRef.current) {
      gsap.fromTo(".leaderboard-row",
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.04,
          duration: 0.5,
          ease: "power2.out",
          delay: 0.3
        }
      );
    }
  }, [lbLoading, leaderboardData]);

  return (
    <div className="min-h-screen bg-[#f9f9f9] pb-24">
      {/* Premium Header / Podium Section */}
      <div className="bg-white border-b border-[var(--border)] pt-8 pb-12 px-4 shadow-sm relative">
        <div className="max-w-xl mx-auto">
          {/* Header Top */}
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Tier Rankings</h1>
            <div className="bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-yellow-200">
              <Timer size={14} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Ends in 4d 12h</span>
            </div>
          </div>

          {/* Podium */}
          <div className="flex items-end justify-center gap-4 sm:gap-8 pt-8">
            {top3.length >= 2 && <PodiumItem user={top3[1]} rank={2} delay={0.2} />}
            {top3.length >= 1 && <PodiumItem user={top3[0]} rank={1} delay={0.1} />}
            {top3.length >= 3 && <PodiumItem user={top3[2]} rank={3} delay={0.3} />}
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-6 relative z-20">
        {/* Promotion Zone Banner */}
        <div className="bg-[#e0f2fe] rounded-2xl p-4 border border-[#bae6fd] mb-6 flex items-start gap-3 shadow-sm">
          <div className="bg-blue-500 p-2 rounded-xl text-white shrink-0 shadow-md">
            <Info size={18} />
          </div>
          <div>
            <h5 className="text-sm font-bold text-blue-900">Promotion Zone</h5>
            <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
              Top 10 players advance to the next league! Keep focusing to climb higher.
            </p>
          </div>
        </div>

        {/* Leaderboard List */}
        <div ref={listRef} className="space-y-1">
          {lbLoading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-20 bg-white/50 animate-pulse rounded-2xl mb-2 border border-[var(--border)]" />
            ))
          ) : (
            leaderboardData.map((user, idx) => (
              <LeaderboardRow
                key={user.id}
                user={user}
                rank={idx + 1}
                isMe={user.id === currentUser?.id}
                index={idx}
              />
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center pb-10">
          <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] opacity-40">
            Leaderboard resets every Monday at 00:00
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default LeaderboardPage;
