
import { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';
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
      const records = await pb.collection('settings').getFullList({
        filter: `userId = "${userId}"`,
        $autoCancel: false
      });

      if (records.length > 0) {
        const userSettings = {
          ...defaultSettings,
          ...records[0]
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
      const records = await pb.collection('settings').getFullList({
        filter: `userId = "${userId}"`,
        $autoCancel: false
      });

      let saved;
      if (records.length > 0) {
        saved = await pb.collection('settings').update(records[0].id, newSettings, { $autoCancel: false });
      } else {
        saved = await pb.collection('settings').create({
          ...newSettings,
          userId
        }, { $autoCancel: false });
      }

      const updatedSettings = { ...defaultSettings, ...saved };
      setSettings(updatedSettings);
      applyTheme(updatedSettings.themeColor, updatedSettings.darkMode);
      
      return saved;
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
