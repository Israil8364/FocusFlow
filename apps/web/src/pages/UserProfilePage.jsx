import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Flame, 
  Zap, 
  Target, 
  Calendar, 
  Shield, 
  ChevronLeft,
  Share2,
  Settings,
  Award,
  MoreVertical,
  Users,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification, ACHIEVEMENTS } from '@/contexts/GamificationContext';
import supabase from '@/lib/supabaseClient';
import { 
  calculateStreaks, 
  calculateXPAndLevel, 
  calculateWeeklyXPAndLeague, 
  evaluateAchievements 
} from '@/utils/progressCalculations';
import { gsap } from 'gsap';

const StatCard = ({ icon: Icon, label, value, color, delay, subValue }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white border border-[var(--border)] rounded-2xl p-5 flex flex-col items-start gap-1 shadow-sm hover:shadow-md transition-all group"
  >
    <div className={`p-2.5 rounded-xl bg-gray-50 text-[var(--text-primary)] group-hover:bg-[var(--bg)] transition-colors mb-2`}>
      <Icon size={20} style={{ color }} strokeWidth={2.5} />
    </div>
    <div className="text-2xl font-black text-[var(--text-primary)]">{value}</div>
    <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{label}</div>
    {subValue && <div className="text-[9px] font-bold text-green-500 mt-1">{subValue}</div>}
  </motion.div>
);

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { 
    stats: myStats, 
    sessions: mySessions, 
    xp: myXP,
    level: myLevel,
    levelProgress: myProgress,
    league: myLeague,
    currentStreak: myStreak,
    longestStreak: myLongest,
    unlockedIds: myUnlockedIds
  } = useGamification();

  const isMe = !userId || userId === currentUser?.id;
  
  const [userProfile, setUserProfile] = useState(null);
  const [userSessions, setUserSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isMe) {
        setUserProfile(currentUser);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
        setUserProfile(profile);
        const { data: sessions } = await supabase.from('sessions').select('*').eq('user_id', userId);
        setUserSessions(sessions || []);
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, isMe, currentUser]);

  const externalStats = useMemo(() => {
    if (isMe) return null;
    const { totalXP, level, levelProgress } = calculateXPAndLevel(userSessions);
    const { currentStreak, longestStreak } = calculateStreaks(userSessions);
    const { league } = calculateWeeklyXPAndLeague(userSessions);
    const unlockedIds = evaluateAchievements(userSessions);
    return { xp: totalXP, level, levelProgress, currentStreak, longestStreak, league, unlockedIds };
  }, [userSessions, isMe]);

  const displayData = isMe ? {
    username: currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Focus Warrior',
    handle: `@${currentUser?.email?.split('@')[0] || 'user'}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.id}`,
    xp: myXP,
    level: myLevel,
    progress: myProgress,
    league: myLeague,
    streak: myStreak,
    longestStreak: myLongest,
    unlockedIds: myUnlockedIds
  } : {
    username: userProfile?.full_name || 'Focus Warrior',
    handle: `@${userProfile?.username || 'warrior'}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
    xp: externalStats?.xp || 0,
    level: externalStats?.level || 1,
    progress: externalStats?.levelProgress || { pct: 0, nxt: 1000 },
    league: externalStats?.league || { label: 'Bronze', svg: '/lottie_animation/bronze.svg', color: '#cd7f32' },
    streak: externalStats?.currentStreak || 0,
    longestStreak: externalStats?.longestStreak || 0,
    unlockedIds: externalStats?.unlockedIds || []
  };

  if (loading && !isMe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9]">
        <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[var(--border)] px-4 py-4 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-xl font-black text-[var(--text-primary)]">Profile & Stats</h1>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Hero */}
        <div className="bg-white rounded-[32px] p-8 border border-[var(--border)] shadow-sm mb-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
            <div className="shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100">
                <img src={displayData.avatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="mb-4">
                <h2 className="text-3xl font-black text-[var(--text-primary)] mb-1">{displayData.username}</h2>
                <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">{displayData.handle}</p>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-8 mb-6">
                <div className="text-center md:text-left">
                  <div className="text-xl font-black text-[var(--text-primary)]">1,248</div>
                  <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Following</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-xl font-black text-[var(--text-primary)]">852</div>
                  <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Followers</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <button className="px-8 py-2.5 bg-[var(--text-primary)] text-white rounded-full text-sm font-black shadow-lg shadow-gray-200 hover:scale-105 active:scale-95 transition-all">
                  Edit Profile
                </button>
                <button className="p-2.5 bg-white border border-[var(--border)] text-[var(--text-primary)] rounded-full hover:bg-gray-50 transition-colors">
                  <Share2 size={20} />
                </button>
                <button className="p-2.5 bg-white border border-[var(--border)] text-[var(--text-primary)] rounded-full hover:bg-gray-50 transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            icon={Flame} 
            label="Current Streak" 
            value={displayData.streak} 
            color="#e8372a" 
            delay={0.1}
            subValue="+2 days this week"
          />
          <StatCard 
            icon={Zap} 
            label="Total XP" 
            value={displayData.xp.toLocaleString()} 
            color="#fbbf24" 
            delay={0.2}
            subValue="Top 5% overall"
          />
          <StatCard 
            icon={Shield} 
            label="Current League" 
            value={displayData.league.label} 
            color={displayData.league.color} 
            delay={0.3}
          />
          <StatCard 
            icon={Trophy} 
            label="Top 3 Finishes" 
            value="12" 
            color="#fbbf24" 
            delay={0.4}
          />
        </div>

        {/* Weekly Activity Chart Area */}
        <div className="bg-white rounded-[32px] p-8 border border-[var(--border)] shadow-sm mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-[var(--text-primary)]">Weekly Activity</h3>
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">XP gained per day</p>
            </div>
            <div className="flex items-center gap-2 text-green-500 font-bold text-sm bg-green-50 px-3 py-1 rounded-full">
              <TrendingUp size={14} />
              +15%
            </div>
          </div>
          
          <div className="h-48 relative flex items-end justify-between gap-2">
            {/* Simple CSS Bar Chart to mimic the screenshot's data vibe */}
            {[45, 78, 52, 95, 63, 40, 25].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-3 h-full group">
                <div className="w-full bg-gray-50 rounded-xl relative overflow-hidden h-full">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                    className={`w-full absolute bottom-0 transition-colors ${i === 3 ? 'bg-[var(--accent)] shadow-lg shadow-red-100' : 'bg-gray-200 group-hover:bg-gray-300'}`}
                  />
                </div>
                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements / Levels */}
        <div className="bg-white rounded-[32px] p-8 border border-[var(--border)] shadow-sm mb-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-[var(--text-primary)]">Achievements</h3>
            <span className="text-xs font-black text-[var(--text-muted)] bg-gray-50 px-3 py-1 rounded-full border border-[var(--border)] uppercase tracking-widest">
              {displayData.unlockedIds.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {ACHIEVEMENTS.map((ach, i) => {
              const isUnlocked = displayData.unlockedIds.includes(ach.id);
              return (
                <div key={ach.id} className="flex flex-col items-center text-center group cursor-help">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl mb-3 border-2 transition-all duration-300 ${isUnlocked ? 'bg-white border-yellow-400 shadow-lg scale-105 rotate-3' : 'bg-gray-50 border-gray-100 opacity-40 grayscale'}`}>
                    {ach.emoji}
                  </div>
                  <h4 className={`text-xs font-black mb-1 line-clamp-1 ${isUnlocked ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>{ach.title}</h4>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary / Progress Banner */}
        <div className="bg-white rounded-3xl p-6 border border-[var(--border)] shadow-sm flex flex-col sm:flex-row items-center gap-6">
          <div className="shrink-0 w-16 h-16 bg-[var(--bg)] rounded-2xl flex items-center justify-center text-[var(--accent)] border-2 border-[var(--border)]">
            <Clock size={32} strokeWidth={2.5} />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
              <h4 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">Level {displayData.level} Professional</h4>
              <span className="text-xs font-bold text-[var(--text-muted)]">{displayData.xp} / {displayData.progress.nxt} XP</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-[var(--border)]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${displayData.progress.pct}%` }}
                className="h-full bg-gradient-to-r from-[var(--accent)] to-orange-400"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
