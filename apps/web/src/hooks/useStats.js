
import { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';
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
      
      const records = await pb.collection('sessions').getFullList({
        filter: `userId = "${userId}" && date >= "${dateFilter}"`,
        sort: '-date',
        $autoCancel: false
      });
      
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
      
      const session = await pb.collection('sessions').create({
        userId,
        type,
        duration,
        date: today
      }, { $autoCancel: false });

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
