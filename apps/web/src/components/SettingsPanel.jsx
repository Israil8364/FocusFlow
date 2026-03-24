
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const SettingsPanel = ({ open, onOpenChange, settings, onSave }) => {
  const [formData, setFormData] = useState({
    pomodoroMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    autoStartBreak: false,
    autoStartPomodoro: false,
    soundEnabled: true,
    darkMode: false,
    notificationsEnabled: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        pomodoroMinutes: settings.pomodoroMinutes || 25,
        shortBreakMinutes: settings.shortBreakMinutes || 5,
        longBreakMinutes: settings.longBreakMinutes || 15,
        autoStartBreak: settings.autoStartBreak || false,
        autoStartPomodoro: settings.autoStartPomodoro || false,
        soundEnabled: settings.soundEnabled ?? true,
        darkMode: settings.darkMode || false,
        notificationsEnabled: settings.notificationsEnabled ?? true
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      toast.success('Settings saved');
      onOpenChange(false);
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-none shadow-floating rounded-20 p-6 md:p-8 max-w-md sm:max-w-[425px]">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-section-title text-center">Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-small text-muted-foreground uppercase tracking-wider">Timer Durations</h3>
            
            <div className="flex items-center justify-between">
              <label className="text-body font-medium">Pomodoro (min)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={formData.pomodoroMinutes}
                onChange={(e) => setFormData({ ...formData, pomodoroMinutes: parseInt(e.target.value) || 25 })}
                className="w-20 h-10 px-4 text-center rounded-pill bg-card shadow-neumorphic-pressed outline-none focus:ring-2 ring-primary/20 text-body transition-all duration-250"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-body font-medium">Short Break (min)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.shortBreakMinutes}
                onChange={(e) => setFormData({ ...formData, shortBreakMinutes: parseInt(e.target.value) || 5 })}
                className="w-20 h-10 px-4 text-center rounded-pill bg-card shadow-neumorphic-pressed outline-none focus:ring-2 ring-primary/20 text-body transition-all duration-250"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-body font-medium">Long Break (min)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={formData.longBreakMinutes}
                onChange={(e) => setFormData({ ...formData, longBreakMinutes: parseInt(e.target.value) || 15 })}
                className="w-20 h-10 px-4 text-center rounded-pill bg-card shadow-neumorphic-pressed outline-none focus:ring-2 ring-primary/20 text-body transition-all duration-250"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-small text-muted-foreground uppercase tracking-wider">Preferences</h3>
            
            <div className="flex items-center justify-between">
              <label className="text-body font-medium">Dark Mode</label>
              <Switch
                checked={formData.darkMode}
                onCheckedChange={(checked) => setFormData({ ...formData, darkMode: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-body font-medium">Auto-start Breaks</label>
              <Switch
                checked={formData.autoStartBreak}
                onCheckedChange={(checked) => setFormData({ ...formData, autoStartBreak: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-body font-medium">Auto-start Pomodoros</label>
              <Switch
                checked={formData.autoStartPomodoro}
                onCheckedChange={(checked) => setFormData({ ...formData, autoStartPomodoro: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-body font-medium">Sound Notifications</label>
              <Switch
                checked={formData.soundEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, soundEnabled: checked })}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 h-10 rounded-20 text-muted-foreground hover:text-foreground transition-all duration-250 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-10 rounded-20 bg-[#111111] text-white shadow-floating hover:opacity-90 transition-all duration-250 font-medium active:scale-95"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsPanel;
