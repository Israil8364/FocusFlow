import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import supabase from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useTimerContext } from '@/contexts/TimerContext.jsx';

import { calculateStreaks, calculateXPAndLevel, calculateWeeklyXPAndLeague, evaluateAchievements } from '@/utils/progressCalculations.js';

/* ─── XP / Level constants ─────────────────────────────────────── */
export const XP_PER_POMODORO = 25;
export const LEVEL_THRESHOLDS = [
  0,          // Level 1
  500,        // Level 2 (20 Pomodoros)
  2000,       // Level 3 (80 Pomodoros)
  6000,       // Level 4
  15000,      // Level 5
  40000,      // Level 6
  100000,     // Level 7
  250000,     // Level 8
  600000,     // Level 9
  1500000     // Level 10
];
export const LEAGUES = [
  { id: 'bronze', label: 'Bronze', emoji: '🥉', svg: '/lottie_animation/bronze.svg', lottie: '/lottie/Level_bronze.json', minXP: 0, color: '#cd7f32' },
  { id: 'silver', label: 'Silver', emoji: '🥈', svg: '/lottie_animation/silver.svg', lottie: '/lottie/Level_Silver.json', minXP: 500, color: '#c0c0c0' },
  { id: 'gold', label: 'Gold', emoji: '🥇', svg: '/lottie_animation/golden.svg', lottie: '/lottie/Level_gold.json', minXP: 1500, color: '#ffd700' },
  { id: 'platinum', label: 'Platinum', emoji: '💎', svg: '/lottie_animation/golden.svg', lottie: '/lottie/Level_Platinum.json', minXP: 3500, color: '#10b981' },
];

export const getLevel = (xp = 0) => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
};

export const getLevelProgress = (xp = 0) => {
  const lvl = getLevel(xp);
  const cur = LEVEL_THRESHOLDS[lvl - 1] ?? 0;
  const nxt = LEVEL_THRESHOLDS[lvl] ?? cur + 1000;
  return { pct: Math.min(100, ((xp - cur) / (nxt - cur)) * 100), cur, nxt, lvl };
};

export const getLeague = (weeklyXP = 0) =>
  [...LEAGUES].reverse().find(l => weeklyXP >= l.minXP) ?? LEAGUES[0];

/* ─── Achievements definition ───────────────────────────────────── */
export const ACHIEVEMENTS = [
  { id: 'first_step', emoji: '🌱', lottie: '/lottie/1st_achievment.json', title: 'First Step', desc: 'Complete 10 pomodoros' },
  { id: 'getting_hot', emoji: '🔥', lottie: '/lottie/2nd_achievement.json', title: 'Getting Hot', desc: 'Complete 100 pomodoros' },
  { id: 'diamond_mind', emoji: '💎', lottie: '/lottie/3rd_achievement.json', title: 'Diamond Mind', desc: 'Complete 1000 pomodoros' },
  { id: 'the_monk', emoji: '🧘', lottie: '/lottie/4th_achievement.json', title: 'The Monk', desc: 'Complete 2500 pomodoros' },
  { id: 'night_owl', emoji: '🦉', lottie: '/lottie/5th_achievement.json', title: 'Night Owl', desc: 'Complete 100 sessions after 10 PM' },
  { id: 'early_bird', emoji: '🌅', lottie: '/lottie/6th_achievement.json', title: 'Early Bird', desc: 'Complete 100 sessions before 7 AM' },
  { id: 'week_warrior', emoji: '⚔️', lottie: '/lottie/7th_achievment.json', title: 'Week Warrior', desc: 'Reach a 30-day streak' },
  { id: 'inferno', emoji: '🌋', lottie: '/lottie/8th_achievment.json', title: 'Inferno', desc: 'Reach a 100-day streak' },
  { id: 'weekend_grind', emoji: '🎮', lottie: '/lottie/9th_achievement.json', title: 'Weekend Grind', desc: 'Focus for 50 weekend sessions' },
  { id: 'perfectionist', emoji: '🎯', lottie: '/lottie/10th_achievment.json', title: 'Perfectionist', desc: '70 hours of focus in a single week' },
];

/* ─── Context ───────────────────────────────────────────────────── */
const GamificationContext = createContext(null);
export const useGamification = () => useContext(GamificationContext);

export function GamificationProvider({ children }) {
  const { currentUser } = useAuth();
  const { sessionCompletedSignal, mode } = useTimerContext();
  const uid = currentUser?.id;
  const prevSignalRef = useRef(-1);

  const [stats, setStats] = useState(null);          // user_stats row
  const [sessions, setSessions] = useState([]);       // all sessions (for heatmap)
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [loading, setLoading] = useState(true);

  // confetti trigger
  const [confettiTrigger, setConfettiTrigger] = useState(null); // { title, emoji }

  /* ── Fetch everything ─────────────────────────────────────────── */
  const fetchAll = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const [statsRes, achieveRes, sessionsRes] = await Promise.all([
        supabase.from('user_stats').select('*').eq('user_id', uid).maybeSingle(),
        supabase.from('user_achievements').select('achievement_id').eq('user_id', uid),
        supabase.from('sessions').select('created_at, date, duration, type').eq('user_id', uid).order('created_at', { ascending: false }),
      ]);

      const userStats = statsRes.data;
      setStats(userStats);

      const allSessions = sessionsRes.data ?? [];
      setSessions(allSessions);

      // Today's focus minutes (duration is stored in minutes)
      const todayStr = new Date().toISOString().slice(0, 10);
      const todaySess = allSessions.filter(s => {
        const d = s.created_at?.slice(0, 10) || s.date;
        return d === todayStr && s.type === 'pomodoro';
      });
      setTodayMinutes(todaySess.reduce((acc, s) => acc + (s.duration ?? 0), 0));

    } catch (e) {
      console.error('[Gamification] fetch error', e);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Auto-award on pomodoro complete ─────────────────────────── */
  useEffect(() => {
    if (prevSignalRef.current === -1) {
      prevSignalRef.current = sessionCompletedSignal;
      return;
    }
    if (sessionCompletedSignal !== prevSignalRef.current && mode === 'pomodoro') {
      prevSignalRef.current = sessionCompletedSignal;
      awardPomodoro(new Date().toISOString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionCompletedSignal]);

  /* ── Ensure stats row exists ──────────────────────────────────── */
  const ensureStats = useCallback(async () => {
    if (!uid) return null;
    const { data } = await supabase.from('user_stats').select('*').eq('user_id', uid).maybeSingle();
    if (data) return data;
    const { data: created } = await supabase.from('user_stats')
      .insert({ user_id: uid, xp: 0, level: 1, current_streak: 0, longest_streak: 0, streak_freeze_count: 2 })
      .select().single();
    return created;
  }, [uid]);

  /* ── Award XP + update streak after a pomodoro ───────────────── */
  const awardPomodoro = useCallback(async (sessionStartedAt) => {
    if (!uid) return;
    try {
      let row = await ensureStats();
      if (!row) return;

      const today = new Date().toISOString().slice(0, 10);
      const lastDate = row.last_focus_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      let newStreak = row.current_streak;
      let newLongest = row.longest_streak;

      if (lastDate === today) {
        // already focused today — no streak change
      } else if (lastDate === yesterdayStr) {
        newStreak += 1;
        newLongest = Math.max(newLongest, newStreak);
      } else if (lastDate == null) {
        newStreak = 1;
        newLongest = Math.max(newLongest, 1);
      } else {
        // missed a day — use freeze if available
        if (row.streak_freeze_count > 0) {
          newStreak += 1;
          newLongest = Math.max(newLongest, newStreak);
          row.streak_freeze_count -= 1;
        } else {
          newStreak = 1;
        }
      }

      const streakBonus = Math.floor(newStreak / 5) * 5; // +5 XP every 5-day streak milestone
      const xpGain = XP_PER_POMODORO + streakBonus;
      const newXP = row.xp + xpGain;
      const newLevel = getLevel(newXP);
      const oldLevel = getLevel(row.xp);

      const { data: updated } = await supabase.from('user_stats')
        .update({
          xp: newXP,
          level: newLevel,
          current_streak: newStreak,
          longest_streak: newLongest,
          streak_freeze_count: row.streak_freeze_count,
          last_focus_date: today,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', uid)
        .select().single();

      if (updated) setStats(updated);

      // Level-up toast
      if (newLevel > oldLevel) {
        setTimeout(() => {
          setConfettiTrigger({ title: `Level ${newLevel} Unlocked!`, emoji: '⬆️', color: '#ffd700' });
        }, 800);
      }

      // Check achievements
      await checkAndUnlockAchievements(updated, sessionStartedAt);

      // Refresh today's minutes + weekly XP
      fetchAll();
    } catch (e) {
      console.error('[Gamification] awardPomodoro error', e);
    }
  }, [uid, ensureStats, fetchAll]);

  /* ── Check achievements ───────────────────────────────────────── */
  const checkAndUnlockAchievements = useCallback(async (updatedStats, sessionStartedAt) => {
    if (!uid || !updatedStats) return;

    const { data: sessData } = await supabase
      .from('sessions').select('created_at, date, duration, type').eq('user_id', uid);
    const allSess = sessData ?? [];
    const pomodoros = allSess.filter(s => s.type === 'pomodoro');

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayMins = pomodoros
      .filter(s => (s.created_at?.slice(0, 10) || s.date) === todayStr)
      .reduce((a, s) => a + (s.duration ?? 0), 0); // duration stored as minutes

    const sessionHour = sessionStartedAt ? new Date(sessionStartedAt).getHours() : new Date().getHours();
    const sessionDay = sessionStartedAt ? new Date(sessionStartedAt).getDay() : new Date().getDay();

    const nightSessions = pomodoros.filter(s => {
      const h = new Date(s.created_at || s.date).getHours();
      return h >= 22;
    }).length;

    const earlySessions = pomodoros.filter(s => {
      const h = new Date(s.created_at || s.date).getHours();
      return h < 7;
    }).length;

    const checks = {
      first_step: pomodoros.length >= 10,
      getting_hot: pomodoros.length >= 100,
      diamond_mind: pomodoros.length >= 1000,
      the_monk: todayMins >= 600,
      night_owl: nightSessions >= 25,
      early_bird: earlySessions >= 25,
      week_warrior: updatedStats.longest_streak >= 14,
      inferno: updatedStats.longest_streak >= 100,
      weekend_grind: sessionDay === 0 || sessionDay === 6,
    };

    for (const [achId, met] of Object.entries(checks)) {
      if (!met) continue;

      const { data: existing } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', uid)
        .eq('achievement_id', achId)
        .maybeSingle();

      if (!existing) {
        await supabase.from('user_achievements').insert({ user_id: uid, achievement_id: achId });
        const ach = ACHIEVEMENTS.find(a => a.id === achId);
        if (ach) {
          setTimeout(() => {
            setConfettiTrigger({
              title: ach.title,
              emoji: ach.emoji,
              color: '#8b5cf6',
              lottie: ach.lottie
            });
          }, 400);
        }
      }
    }
  }, [uid]);

  /* ── Use streak freeze manually ───────────────────────────────── */
  const useStreakFreeze = useCallback(async () => {
    if (!stats || stats.streak_freeze_count <= 0) return;
    const { data } = await supabase.from('user_stats')
      .update({ streak_freeze_count: stats.streak_freeze_count - 1, last_focus_date: new Date().toISOString().slice(0, 10) })
      .eq('user_id', uid).select().single();
    if (data) setStats(data);
  }, [stats, uid]);

  const clearConfetti = useCallback(() => setConfettiTrigger(null), []);

  /* ─── Compute values client-side ───────────────────────────────── */
  const { currentStreak, longestStreak } = React.useMemo(() => calculateStreaks(sessions), [sessions]);
  const { totalXP, level, levelProgress } = React.useMemo(() => calculateXPAndLevel(sessions), [sessions]);
  const { weeklyXP, league } = React.useMemo(() => calculateWeeklyXPAndLeague(sessions), [sessions]);
  const computedUnlockedIds = React.useMemo(() => evaluateAchievements(sessions), [sessions]);

  // Track newly unlocked
  const [newlyUnlocked, setNewlyUnlocked] = useState([]);
  const prevUnlockedRef = useRef([]);

  useEffect(() => {
    // Only diff if we had some previous data (avoids firing everything on first load)
    if (prevUnlockedRef.current.length > 0) {
      const newIds = computedUnlockedIds.filter(id => !prevUnlockedRef.current.includes(id));
      if (newIds.length > 0) {
        setNewlyUnlocked(prevIds => [...new Set([...prevIds, ...newIds])]);
      }
    }
    prevUnlockedRef.current = computedUnlockedIds;
  }, [computedUnlockedIds]);

  const value = {
    stats,
    unlockedIds: computedUnlockedIds,
    newlyUnlocked,
    sessions,
    weeklyXP,
    todayMinutes,
    loading,
    confettiTrigger,
    clearConfetti,
    awardPomodoro,
    useStreakFreeze,
    refetch: fetchAll,
    // helpers
    level,
    levelProgress,
    league,
    currentStreak,
    longestStreak,
    streakFreezes: stats?.streak_freeze_count ?? 0,
    xp: totalXP,
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
}
