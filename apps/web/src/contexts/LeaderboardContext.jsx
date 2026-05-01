import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import supabase from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useGamification } from '@/contexts/GamificationContext.jsx';

const LeaderboardContext = createContext(null);
export const useLeaderboard = () => {
  const context = useContext(LeaderboardContext);
  if (context === null) {
    console.error('❌ LeaderboardContext is null! useLeaderboard must be used within a LeaderboardProvider.');
    // Return a fallback to prevent destructuring crash
    return {
      members: [],
      loading: false,
      daysLeft: 0,
      cohort: null,
      leagueResult: null,
      markResultSeen: () => {},
      refetch: () => {}
    };
  }
  return context;
};

export function LeaderboardProvider({ children }) {
  const { currentUser } = useAuth();
  const { league, weeklyXP } = useGamification();
  const [cohort, setCohort] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [daysLeft, setDaysLeft] = useState(0);

  const uid = currentUser?.id;

  // Calculate Monday 00:00 UTC of current week
  const getWeekStartDate = () => {
    const now = new Date();
    const day = now.getUTCDay();
    const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff, 0, 0, 0));
    return monday.toISOString().split('T')[0];
  };

  const calculateDaysLeft = useCallback(() => {
    const now = new Date();
    const nextMonday = new Date(getWeekStartDate());
    nextMonday.setUTCDate(nextMonday.getUTCDate() + 7);
    const diff = nextMonday - now;
    setDaysLeft(Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, []);

  useEffect(() => {
    calculateDaysLeft();
    const timer = setInterval(calculateDaysLeft, 1000 * 60 * 60); // Refresh every hour
    return () => clearInterval(timer);
  }, [calculateDaysLeft]);

  // Fetch or join cohort
  const fetchCohort = useCallback(async () => {
    if (!uid || !league) return;
    setLoading(true);
    const weekStart = getWeekStartDate();

    try {
      // 1. Check if user already has a cohort for this week
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_cohort_id')
        .eq('id', uid)
        .single();

      let cohortId = profile?.current_cohort_id;

      if (cohortId) {
        const { data: cohortData } = await supabase
          .from('leaderboard_cohorts')
          .select('*')
          .eq('cohort_id', cohortId)
          .eq('week_start_date', weekStart)
          .maybeSingle();
        
        if (!cohortData) cohortId = null; // Stale cohort
        else setCohort(cohortData);
      }

      // 2. If no valid cohort, find or create one
      if (!cohortId) {
        const { data: openCohorts } = await supabase
          .from('leaderboard_cohorts')
          .select('cohort_id, cohort_members(count)')
          .eq('week_start_date', weekStart)
          .eq('league_tier', league.label)
          .order('created_at', { ascending: false });

        const openCohort = openCohorts?.find(c => c.cohort_members[0].count < 30);

        if (openCohort) {
          cohortId = openCohort.cohort_id;
        } else {
          // Create new cohort
          const { data: newCohort, error } = await supabase
            .from('leaderboard_cohorts')
            .insert({ week_start_date: weekStart, league_tier: league.label })
            .select()
            .single();
          
          if (error) throw error;
          cohortId = newCohort.cohort_id;

          // Seed bots for new cohort
          const { data: bots } = await supabase
            .from('bots')
            .select('*')
            .eq('league_tier', league.label)
            .limit(29);
          
          if (bots?.length) {
            const botMembers = bots.map(b => ({
              cohort_id: cohortId,
              member_id: b.bot_id,
              member_type: 'bot',
              weekly_xp: Math.floor(Math.random() * 50) // Small starting XP
            }));
            await supabase.from('cohort_members').insert(botMembers);
          }
        }

        // Add user to cohort
        await supabase.from('cohort_members').insert({
          cohort_id: cohortId,
          member_id: uid,
          member_type: 'user',
          weekly_xp: weeklyXP
        });

        await supabase.from('profiles').update({ current_cohort_id: cohortId }).eq('id', uid);
        
        const { data: finalCohort } = await supabase
          .from('leaderboard_cohorts')
          .select('*')
          .eq('cohort_id', cohortId)
          .single();
        setCohort(finalCohort);
      }

      // 3. Fetch all members
      await fetchMembers(cohortId);

    } catch (e) {
      console.error('[Leaderboard] Error:', e);
    } finally {
      setLoading(false);
    }
  }, [uid, league, weeklyXP]);

  const fetchMembers = async (cohortId) => {
    const { data: memberRows } = await supabase
      .from('cohort_members')
      .select('*')
      .eq('cohort_id', cohortId);
    
    if (!memberRows) return;

    // Fetch user/bot details
    const userIds = memberRows.filter(m => m.member_type === 'user').map(m => m.member_id);
    const botIds = memberRows.filter(m => m.member_type === 'bot').map(m => m.member_id);

    const [usersRes, botsRes] = await Promise.all([
      supabase.from('profiles').select('id, full_name, avatar_url, total_xp, level, current_streak').in('id', userIds),
      supabase.from('bots').select('*').in('bot_id', botIds)
    ]);

    const usersMap = Object.fromEntries(usersRes.data?.map(u => [u.id, u]) || []);
    const botsMap = Object.fromEntries(botsRes.data?.map(b => [b.bot_id, b]) || []);

    const enrichedMembers = memberRows.map(m => {
      const details = m.member_type === 'user' ? usersMap[m.member_id] : botsMap[m.member_id];
      return {
        ...m,
        display_name: details?.full_name || details?.display_name || 'Anonymous',
        avatar: details?.avatar_url || details?.avatar_seed,
        total_xp: details?.total_xp || 0,
        level: details?.level || 1,
        streak: details?.current_streak || 0,
        personality: details?.personality
      };
    }).sort((a, b) => b.weekly_xp - a.weekly_xp);

    setMembers(enrichedMembers);
  };

  // Real-time subscription
  useEffect(() => {
    if (!cohort?.cohort_id) return;

    const sub = supabase
      .channel(`cohort-${cohort.cohort_id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'cohort_members',
        filter: `cohort_id=eq.${cohort.cohort_id}` 
      }, () => {
        fetchMembers(cohort.cohort_id);
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [cohort?.cohort_id]);

  // Update user's weekly XP in cohort
  useEffect(() => {
    if (!uid || !cohort?.cohort_id) return;
    
    const updateXP = async () => {
      await supabase
        .from('cohort_members')
        .update({ weekly_xp: weeklyXP })
        .eq('cohort_id', cohort.cohort_id)
        .eq('member_id', uid);
    };

    updateXP();
  }, [weeklyXP, uid, cohort?.cohort_id]);

  useEffect(() => { fetchCohort(); }, [fetchCohort]);

  const [leagueResult, setLeagueResult] = useState(null); // { status: 'promoted' | 'stayed' | 'demoted', league: string }

  // Check for previous week's results
  const checkResults = useCallback(async () => {
    if (!uid) return;
    const { data: profile } = await supabase
      .from('profiles')
      .select('league_result_seen, current_league, current_cohort_id')
      .eq('id', uid)
      .single();
    
    if (profile && !profile.league_result_seen && profile.current_cohort_id) {
      // Fetch user's rank in that specific cohort
      const { data: cohortMembers } = await supabase
        .from('cohort_members')
        .select('member_id, weekly_xp')
        .eq('cohort_id', profile.current_cohort_id)
        .order('weekly_xp', { ascending: false });
      
      if (cohortMembers) {
        const rank = cohortMembers.findIndex(m => m.member_id === uid) + 1;
        let status = 'stayed';
        if (rank > 0 && rank <= 10) status = 'promoted';
        else if (rank > 25) status = 'demoted';

        setLeagueResult({ status, league: profile.current_league });
      }
    }
  }, [uid]);

  const markResultSeen = async () => {
    if (!uid) return;
    await supabase.from('profiles').update({ league_result_seen: true }).eq('id', uid);
    setLeagueResult(null);
  };

  useEffect(() => {
    if (uid) checkResults();
  }, [uid, checkResults]);

  const value = {
    cohort,
    members,
    loading,
    daysLeft,
    leagueResult,
    markResultSeen,
    refetch: fetchCohort
  };

  return (
    <LeaderboardContext.Provider value={value}>
      {children}
    </LeaderboardContext.Provider>
  );
}
