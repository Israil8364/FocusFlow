import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import supabase from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useSettings } from '@/contexts/SettingsContext.jsx';
import { toast } from 'sonner';
import { Save, Bell, Monitor, Shield, Clock, Check, Sparkles, ChevronRight, Play } from 'lucide-react';
import { playNotificationSound } from '@/utils/notificationManager.js';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '@/components/ConfirmationModal.jsx';

const THEMES = [
  { id: 'theme-default', label: 'Default', bg: '#e9eaec', accent: '#e8372a', textPrimary: '#1a1815', textMuted: '#888c96' },
  { id: 'theme-dark', label: 'Dark', bg: '#1a1815', accent: '#f04a3c', textPrimary: '#f0ede8', textMuted: '#6b6560' },
  { id: 'theme-ocean', label: 'Ocean', bg: '#e8f0f7', accent: '#3a7bd5', textPrimary: '#1a3a5c', textMuted: '#5a8ab0' },
];

const SettingsPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [showClearHistoryModal, setShowClearHistoryModal] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (field, value) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
    // Instantly apply theme if themeColor is changed
    if (field === 'themeColor') {
       document.documentElement.className = value;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      updateSettings(localSettings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleClearHistory = async () => {
    setShowClearHistoryModal(false);
    setSaving(true);
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('user_id', currentUser.id);

      if (error) throw error;
      toast.success('History cleared successfully');
    } catch (error) {
      console.error('Error clearing history:', error);
      toast.error('Failed to clear history');
    } finally {
      setSaving(false);
    }
  };

  const Section = ({ title, icon: Icon, children }) => (
    <div className="bg-[var(--card)] rounded-[var(--radius-lg)] shadow-neu-sm border border-[var(--border)] p-6 mb-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border)]">
        <div className="p-2 bg-[var(--bg)] rounded-md text-[var(--text-primary)]">
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-subheading">{title}</h2>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Settings - FocusFlow</title>
      </Helmet>

      <ConfirmationModal 
        isOpen={showClearHistoryModal}
        onClose={() => setShowClearHistoryModal(false)}
        onConfirm={handleClearHistory}
        title="Clear your history?"
        message="This will permanently delete all your past focus sessions. This action cannot be undone."
        confirmText="Clear History"
      />
      <div className="max-w-3xl mx-auto p-4 md:p-8 animate-in fade-in duration-300">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-heading mb-2">Settings</h1>
            <p className="text-body text-[var(--text-muted)]">Customize your FocusFlow experience.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--text-primary)] text-[var(--bg)] rounded-[var(--radius-pill)] font-medium shadow-neu hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Upgrade Banner */}
        <button
          onClick={() => navigate('/upgrade')}
          className="w-full mb-8 flex items-center justify-between p-5 rounded-[var(--radius-lg)] text-left transition-all active:scale-[0.99] hover:-translate-y-0.5 group"
          style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, #c02010 100%)',
            boxShadow: '0 8px 24px rgba(232,55,42,0.3)'
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white text-[15px] leading-tight">Upgrade to Premium</p>
              <p className="text-white/70 text-xs mt-0.5">Unlock projects, reports &amp; more</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/70 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
        </button>

        <Section title="Timer Settings" icon={Clock}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Pomodoro (min)</label>
              <input 
                type="number" 
                value={localSettings.pomodoroMinutes} 
                onChange={(e) => handleChange('pomodoroMinutes', parseInt(e.target.value) || 0)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-muted)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Short Break (min)</label>
              <input 
                type="number" 
                value={localSettings.shortBreakMinutes} 
                onChange={(e) => handleChange('shortBreakMinutes', parseInt(e.target.value) || 0)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-muted)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Long Break (min)</label>
              <input 
                type="number" 
                value={localSettings.longBreakMinutes} 
                onChange={(e) => handleChange('longBreakMinutes', parseInt(e.target.value) || 0)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-muted)]"
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-4">
            <div>
              <div className="font-medium">Auto-start Breaks</div>
              <div className="text-sm text-[var(--text-muted)]">Automatically start break timer when pomodoro ends</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={localSettings.autoStartBreak} onChange={(e) => handleChange('autoStartBreak', e.target.checked)} />
              <div className="w-11 h-6 bg-[var(--border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--text-primary)]"></div>
            </label>
          </div>
        </Section>

        <div className="mb-4 text-xs font-bold text-[var(--text-muted)] tracking-wider mt-10">APPEARANCE</div>
        <div className="bg-[var(--card)] rounded-[var(--radius-lg)] shadow-neu-sm border border-[var(--border)] p-6 mb-8 flex flex-col items-center">
          <div className="flex justify-center gap-6 w-full max-w-sm mb-4">
            {THEMES.map(t => {
              const isSelected = (localSettings.themeColor || 'theme-default') === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    handleChange('themeColor', t.id);
                  }}
                  className="relative flex flex-col items-center gap-2 group outline-none"
                >
                  <div 
                    className={`w-[72px] h-[72px] rounded-[16px] flex flex-col p-3 gap-2 relative transition-all duration-200 ${
                      isSelected ? 'ring-2 ring-offset-4 ring-offset-[var(--card)] ring-[var(--accent)] border-transparent scale-105' : 'border-2 border-[var(--border)] hover:border-[var(--text-muted)]'
                    }`}
                    style={{ backgroundColor: t.bg }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full mt-1" style={{ backgroundColor: t.accent }} />
                    <div className="w-8 h-1 rounded-full mt-2" style={{ backgroundColor: t.textPrimary }} />
                    <div className="w-10 h-1 rounded-full" style={{ backgroundColor: t.textMuted }} />
                    
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center border-[3px] border-[var(--card)] z-10 transition-transform">
                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <span className={`text-xs font-medium transition-colors mt-1 ${isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'}`}>
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => {
              handleChange('themeColor', 'theme-default');
            }}
            className="w-full max-w-sm py-3 mt-2 rounded-[var(--radius-md)] border border-[var(--border)] text-[var(--text-primary)] text-sm font-medium hover:bg-[var(--bg)] transition-colors"
          >
            Reset to default
          </button>
        </div>

        <div className="mb-4 text-xs font-bold text-[var(--text-muted)] tracking-wider mt-10">GENERAL</div>
        <div className="bg-[var(--card)] rounded-[var(--radius-lg)] shadow-neu-sm border border-[var(--border)] p-2 mb-8 flex flex-col">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-[var(--bg)] rounded-md text-[var(--text-primary)]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-sm text-[var(--text-primary)]">Hour format</div>
                <div className="text-xs text-[var(--text-muted)]">Currently {localSettings.hourFormat || '24h'}</div>
              </div>
            </div>
            <select 
              value={localSettings.hourFormat || '24h'}
              onChange={(e) => handleChange('hourFormat', e.target.value)}
              className="bg-transparent text-sm text-[var(--text-muted)] font-medium outline-none cursor-pointer"
            >
              <option value="12h">12h</option>
              <option value="24h">24h</option>
            </select>
          </div>
        </div>

        <Section title="Sound & Notifications" icon={Bell}>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Sound Enabled</div>
              <div className="text-sm text-[var(--text-muted)]">Play sound when timer completes</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={localSettings.soundEnabled} onChange={(e) => handleChange('soundEnabled', e.target.checked)} />
              <div className="w-11 h-6 bg-[var(--border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--text-primary)]"></div>
            </label>
          </div>
          <div className="pt-4">
            <label className="block text-sm font-medium mb-2">Sound Type</label>
            <div className="flex items-center gap-3">
              <select 
                value={localSettings.soundType}
                onChange={(e) => {
                  handleChange('soundType', e.target.value);
                  if (localSettings.soundEnabled) playNotificationSound(true, e.target.value);
                }}
                className="w-full md:w-1/2 bg-[var(--bg)] border border-[var(--border)] rounded-md px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-muted)]"
              >
                <option value="bell">Bell</option>
                <option value="chime">Chime</option>
                <option value="beep">Beep</option>
              </select>
              <button
                type="button"
                onClick={() => playNotificationSound(true, localSettings.soundType)}
                disabled={!localSettings.soundEnabled}
                className="p-2 border border-[var(--border)] rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg)] transition-colors disabled:opacity-50"
                title="Preview Sound"
              >
                <Play className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Section>

        <Section title="Privacy & Data" icon={Shield}>
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => setShowClearHistoryModal(true)}
              disabled={saving}
              className="w-full md:w-auto px-4 py-2 bg-red-50 text-tomato border border-red-100 rounded-md font-medium hover:bg-red-100 transition-colors text-left dark:bg-red-950/30 dark:border-red-900 disabled:opacity-50"
            >
              {saving ? 'Clearing...' : 'Clear History'}
            </button>
          </div>
        </Section>

      </div>
    </>
  );
};

export default SettingsPage;