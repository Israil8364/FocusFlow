import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }) {
  const [settings, setSettingsState] = useState(() => {
    try {
      const saved = localStorage.getItem('focusflow_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing settings:', e);
    }
    return {
      pomodoroMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      autoStartBreak: false,
      autoStartPomodoro: false,
      soundEnabled: true,
      soundType: 'bell',
      themeColor: 'theme-default',
      notificationsEnabled: false,
      hourFormat: '24h'
    };
  });

  useEffect(() => {
    localStorage.setItem('focusflow_settings', JSON.stringify(settings));
    document.documentElement.className = settings.themeColor || 'theme-default';
  }, [settings]);

  const updateSettings = (newSettings) => {
    setSettingsState(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, setSettings: setSettingsState }}>
      {children}
    </SettingsContext.Provider>
  );
}
