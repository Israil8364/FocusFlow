import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import supabase from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useSettings } from '@/contexts/SettingsContext.jsx';
import { toast } from 'sonner';
import { Save, Bell, BellOff, Monitor, Shield, Clock, Check, Sparkles, ChevronRight, Play, User, Mail, Camera, LogOut, Trash2 } from 'lucide-react';
import { playNotificationSound, requestNotificationPermission, showNotification } from '@/utils/notificationManager.js';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '@/components/ConfirmationModal.jsx';

const THEMES = [
  { id: 'theme-default', label: 'Default', bg: '#e9eaec', accent: '#e8372a', textPrimary: '#1a1815', textMuted: '#888c96' },
  { id: 'theme-dark', label: 'Dark', bg: '#1a1815', accent: '#f04a3c', textPrimary: '#f0ede8', textMuted: '#6b6560' },
  { id: 'theme-ocean', label: 'Ocean', bg: '#e8f0f7', accent: '#3a7bd5', textPrimary: '#1a3a5c', textMuted: '#5a8ab0' },
];

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

const SettingsPage = () => {
  const navigate = useNavigate();
  const { currentUser, logout, updateProfile } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [showClearHistoryModal, setShowClearHistoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Profile state
  const [name, setName] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [dailyGoal, setDailyGoal] = useState(4);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setDailyGoal(currentUser.daily_goal || 4);
      const url = currentUser.avatar 
        ? (currentUser.avatar.startsWith('http') ? currentUser.avatar : supabase.storage.from('avatars').getPublicUrl(currentUser.avatar).data.publicUrl)
        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.id}&backgroundColor=f0ede8`;
      setAvatarPreview(url);
    }
  }, [currentUser]);

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
    if (!currentUser) {
      toast.error('Updates are not available in Guest Mode.');
      return;
    }

    setSaving(true);
    try {
      // 1. Save Settings (Local Storage)
      await updateSettings(localSettings);

      // 2. Save Profile (Supabase)
      let avatarUrl = currentUser.avatar;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${currentUser.id}/avatar.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
        avatarUrl = urlData.publicUrl + '?t=' + Date.now();
      }

      const profileUpdates = {
        full_name: name,
        avatar_url: avatarUrl,
        daily_goal: dailyGoal
      };

      await updateProfile(profileUpdates);
      toast.success('Settings and profile updated');
    } catch (error) {
      toast.error('Failed to save changes');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    setShowDeleteModal(false);
    setSaving(true);
    try {
      await Promise.all([
        supabase.from('profiles').delete().eq('id', currentUser.id),
        supabase.from('tasks').delete().eq('user_id', currentUser.id),
        supabase.from('sessions').delete().eq('user_id', currentUser.id),
        supabase.from('settings').delete().eq('user_id', currentUser.id),
      ]);
      
      toast.success('Account deleted. Logging out...');
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (error) {
      toast.error('Failed to delete account');
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

      <ConfirmationModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Delete account permanently?"
        message="This will delete your entire FocusFlow account and all data. This cannot be undone."
        confirmText="Delete Account"
      />
      <div className="max-w-3xl mx-auto p-4 md:p-8 animate-in fade-in duration-300">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-heading mb-1">Account & Settings</h1>
            <p className="text-sm text-[var(--text-muted)]">Manage your profile and preferences.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--text-primary)] text-[var(--bg)] rounded-[var(--radius-pill)] font-medium shadow-neu hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Profile Section */}
        <Section title="Profile" icon={User}>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-24 h-24 rounded-full border-2 border-[var(--border)] overflow-hidden group">
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-bold">Change Avatar</span>
            </div>

            <div className="flex-1 w-full space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2 text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    placeholder="Enter your name"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input 
                    type="email" 
                    value={currentUser?.email || ''} 
                    disabled
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2 text-[var(--text-muted)] cursor-not-allowed opacity-60"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[var(--border)]">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">Daily Goal</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="12"
                step="1"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(parseInt(e.target.value))}
                className="flex-1 accent-[var(--accent)]"
              />
              <div className="w-24 text-center py-1 bg-[var(--bg)] border border-[var(--border)] rounded-md font-bold text-[var(--text-primary)]">
                {dailyGoal} <span className="text-[10px] font-medium text-[var(--text-muted)]">POMS</span>
              </div>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-2 italic">Target number of focus sessions per day. (1 pomodoro = 25 minutes)</p>
          </div>
        </Section>


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
                    className={`w-[72px] h-[72px] rounded-[16px] flex flex-col p-3 gap-2 relative transition-all duration-200 ${isSelected ? 'ring-2 ring-offset-4 ring-offset-[var(--card)] ring-[var(--accent)] border-transparent scale-105' : 'border-2 border-[var(--border)] hover:border-[var(--text-muted)]'
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
              <div className="font-medium">Timer Notifications</div>
              <div className="text-sm text-[var(--text-muted)]">Get alerts when focus or break sessions end</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={localSettings.notificationsEnabled} 
                onChange={async (e) => {
                  const checked = e.target.checked;
                  if (checked) {
                    const granted = await requestNotificationPermission();
                    if (!granted) {
                      toast.error('Notification permission denied by browser');
                      return;
                    }
                    showNotification('Timer alerts active ⚡', 'We will buzz u when the timer hits zero.');
                  }
                  handleChange('notificationsEnabled', checked);
                }} 
              />
              <div className="w-11 h-6 bg-[var(--border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--text-primary)]"></div>
            </label>
          </div>

          <div className="pt-6 mt-6 border-t border-[var(--border)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-bold text-[15px] flex items-center gap-2">
                  Smart Task Reminders <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                </div>
                <div className="text-sm text-[var(--text-muted)]">Get notified before your scheduled tasks start. no cap.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={localStorage.getItem('focusflow_taskRemindersEnabled') !== 'false'} 
                  onChange={(e) => {
                    localStorage.setItem('focusflow_taskRemindersEnabled', e.target.checked);
                    // Force re-render if needed or just use state, but we'll use a simple state for UI
                    window.dispatchEvent(new Event('storage'));
                    toast.success(e.target.checked ? 'Task reminders enabled fr' : 'Task reminders disabled 💀');
                  }} 
                />
                <div className="w-11 h-6 bg-[var(--border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--text-primary)]"></div>
              </label>
            </div>

            <div className="space-y-4 ml-2">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Lead Time</label>
                <div className="flex gap-2">
                  {[2, 5, 10].map(min => {
                    const currentLead = parseInt(localStorage.getItem('focusflow_taskReminderLeadTime') || '5');
                    const isActive = currentLead === min;
                    return (
                      <button
                        key={min}
                        onClick={() => {
                          localStorage.setItem('focusflow_taskReminderLeadTime', min);
                          window.dispatchEvent(new Event('storage'));
                          toast.success(`We'll buzz u ${min} mins early ⚡`);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          isActive 
                            ? 'bg-[var(--text-primary)] text-[var(--bg)] shadow-md scale-105' 
                            : 'bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-primary)]'
                        }`}
                      >
                        {min} mins before
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => {
                  import('@/utils/taskNotificationScheduler').then(m => {
                    m.triggerTaskNotification({ title: 'Sample Task', id: 'sample', startTime: '12:00' });
                  });
                }}
                className="text-[11px] font-bold text-[var(--accent)] hover:underline flex items-center gap-1 mt-2"
              >
                <Bell className="w-3 h-3" /> Test vibe check notification
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-[var(--border)] mt-6">
            <div>
              <div className="font-medium">Sound Enabled</div>
              <div className="text-sm text-[var(--text-muted)]">Play sound for all alerts</div>
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

        <Section title="Danger Zone" icon={Trash2}>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[var(--text-muted)]">Once you delete your account, there is no going back. Please be certain.</p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={saving}
                className="px-4 py-2 bg-red-50 text-tomato border border-red-100 rounded-md font-medium hover:bg-red-100 transition-colors dark:bg-red-950/30 dark:border-red-900 disabled:opacity-50 text-sm"
              >
                Delete Account
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-[var(--bg)] text-[var(--text-primary)] border border-[var(--border)] rounded-md font-medium hover:bg-[var(--border)] transition-colors flex items-center gap-2 text-sm"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </Section>

      </div>
    </>
  );
};

export default SettingsPage;