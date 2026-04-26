
import { useState, useEffect, useCallback } from 'react';
import supabase from '@/lib/supabaseClient';
import { applyTheme } from '@/utils/themeManager';

const defaultSettings = {
  pomodoroMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  autoStartBreak: false,
  autoStartPomodoro: false,
  soundEnabled: true,
  themeColor: 'red',
  darkMode: false,
  notificationsEnabled: true
};

export const useSettings = (userId) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    if (!userId) {
      setSettings(defaultSettings);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (err) throw err;

      if (data) {
        const userSettings = {
          ...defaultSettings,
          id: data.id,
          pomodoroMinutes: data.pomodoro_minutes,
          shortBreakMinutes: data.short_break_minutes,
          longBreakMinutes: data.long_break_minutes,
          autoStartBreak: data.auto_start_break,
          autoStartPomodoro: data.auto_start_pomodoro,
          soundEnabled: data.sound_enabled,
          themeColor: data.theme_color,
          darkMode: data.dark_mode,
          notificationsEnabled: data.notifications_enabled,
        };
        setSettings(userSettings);
        applyTheme(userSettings.themeColor, userSettings.darkMode);
      } else {
        setSettings(defaultSettings);
        applyTheme(defaultSettings.themeColor, defaultSettings.darkMode);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setError(err.message);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = async (newSettings) => {
    if (!userId) return;

    try {
      setError(null);
      
      // Map camelCase to snake_case
      const dbSettings = {
        user_id: userId,
        pomodoro_minutes: newSettings.pomodoroMinutes,
        short_break_minutes: newSettings.shortBreakMinutes,
        long_break_minutes: newSettings.longBreakMinutes,
        auto_start_break: newSettings.autoStartBreak,
        auto_start_pomodoro: newSettings.autoStartPomodoro,
        sound_enabled: newSettings.soundEnabled,
        theme_color: newSettings.themeColor,
        dark_mode: newSettings.darkMode,
        notifications_enabled: newSettings.notificationsEnabled,
      };

      // Clean undefined values
      Object.keys(dbSettings).forEach(key => dbSettings[key] === undefined && delete dbSettings[key]);

      const { data, error: err } = await supabase
        .from('settings')
        .upsert(dbSettings, { onConflict: 'user_id' })
        .select()
        .single();

      if (err) throw err;

      const updatedSettings = {
        ...defaultSettings,
        id: data.id,
        pomodoroMinutes: data.pomodoro_minutes,
        shortBreakMinutes: data.short_break_minutes,
        longBreakMinutes: data.long_break_minutes,
        autoStartBreak: data.auto_start_break,
        autoStartPomodoro: data.auto_start_pomodoro,
        sound_enabled: data.sound_enabled,
        theme_color: data.theme_color,
        darkMode: data.dark_mode,
        notifications_enabled: data.notifications_enabled,
      };

      setSettings(updatedSettings);
      applyTheme(updatedSettings.themeColor, updatedSettings.darkMode);
      
      return data;
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError(err.message);
      throw err;
    }
  };

  return {
    settings,
    loading,
    error,
    saveSettings,
    refetch: fetchSettings
  };
};
