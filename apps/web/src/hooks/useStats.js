
import { useState, useEffect, useCallback } from 'react';
import supabase from '@/lib/supabaseClient';
import {
  calculateDailyStats,
  calculateWeeklyStats,
  calculateMonthlyStats,
  getWeeklyChartData,
  getMonthlyHeatmapData
} from '@/utils/calculateStats';

export const useStats = (userId) => {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSessions = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const dateFilter = thirtyDaysAgo.toISOString().split('T')[0];
      
      const { data, error: err } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', dateFilter)
        .order('date', { ascending: false });

      if (err) throw err;
      
      const records = data.map(s => ({
        id: s.id,
        userId: s.user_id,
        type: s.type,
        duration: s.duration,
        date: s.date,
        createdAt: s.created_at
      }));
      
      setSessions(records);
      
      const today = new Date();
      const dailyStats = calculateDailyStats(records, today);
      const weeklyStats = calculateWeeklyStats(records);
      const monthlyStats = calculateMonthlyStats(records);
      const weeklyChart = getWeeklyChartData(records);
      const monthlyHeatmap = getMonthlyHeatmapData(records);
      
      setStats({
        daily: dailyStats,
        weekly: weeklyStats,
        monthly: monthlyStats,
        weeklyChart,
        monthlyHeatmap
      });
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const logSession = async (type, duration) => {
    if (!userId) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error: err } = await supabase
        .from('sessions')
        .insert({
          user_id: userId,
          type,
          duration,
          date: today
        })
        .select()
        .single();

      if (err) throw err;

      const session = {
        id: data.id,
        userId: data.user_id,
        type: data.type,
        duration: data.duration,
        date: data.date,
        createdAt: data.created_at
      };

      await fetchSessions();
      
      return session;
    } catch (err) {
      console.error('Failed to log session:', err);
      setError(err.message);
      throw err;
    }
  };

  return {
    sessions,
    stats,
    loading,
    error,
    logSession,
    refetch: fetchSessions
  };
};
