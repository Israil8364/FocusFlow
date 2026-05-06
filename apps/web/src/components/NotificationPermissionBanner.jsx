
import React, { useState, useEffect } from 'react';
import { Bell, Sparkles, X } from 'lucide-react';
import { requestTaskNotificationPermission } from '@/utils/taskNotificationScheduler';

const STORAGE_KEY = 'focusflow_notif_banner_dismissed_v2';

const NotificationPermissionBanner = () => {
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    const alreadyDismissed = localStorage.getItem(STORAGE_KEY);
    const supported = 'Notification' in window;
    const pending = supported && Notification.permission === 'default';

    if (supported && pending && !alreadyDismissed) {
      const timer = setTimeout(() => {
        setVisible(true);
        requestAnimationFrame(() => setAnimateIn(true));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnable = async () => {
    const granted = await requestTaskNotificationPermission();
    dismiss();
  };

  const dismiss = () => {
    setAnimateIn(false);
    localStorage.setItem(STORAGE_KEY, '1');
    setTimeout(() => setVisible(false), 500);
  };

  if (!visible) return null;

  return (
    <div
      role="banner"
      className="fixed z-[9999] top-4 left-1/2 -translate-x-1/2 w-[min(400px,calc(100vw-32px))]"
      style={{
        transform: animateIn ? 'translateY(0) translateX(-50%)' : 'translateY(-120%) translateX(-50%)',
        transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[24px] shadow-neu p-5 relative overflow-hidden group">
        {/* Decorative background element */}
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[var(--accent)] opacity-[0.03] rounded-full blur-2xl group-hover:opacity-[0.06] transition-opacity" />
        
        <div className="flex gap-4">
          {/* Icon with Gen-Z glow */}
          <div className="shrink-0 w-12 h-12 rounded-2xl bg-[var(--text-primary)] flex items-center justify-center relative">
            <Bell className="w-6 h-6 text-[var(--bg)]" />
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-[var(--accent)] animate-pulse" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-bold text-[var(--text-primary)] leading-tight">
              don't miss the vibe check ⏰
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
              get lowkey alerts 5 mins before your tasks start. no cap, it helps u lock in.
            </p>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleEnable}
                className="px-4 py-2 rounded-xl bg-[var(--text-primary)] text-[var(--bg)] text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm"
              >
                bet, enable
              </button>
              <button
                onClick={dismiss}
                className="px-4 py-2 rounded-xl border border-[var(--border)] text-[var(--text-muted)] text-xs font-bold hover:text-[var(--text-primary)] hover:bg-[var(--bg)] active:scale-95 transition-all"
              >
                maybe later
              </button>
            </div>
          </div>

          <button
            onClick={dismiss}
            className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermissionBanner;
