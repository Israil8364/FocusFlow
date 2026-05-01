import React, { useState, useEffect } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import { requestNotificationPermission } from '@/utils/notificationManager';

const STORAGE_KEY = 'focusflow_notif_banner_dismissed';

const NotificationPermissionBanner = () => {
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    // Only show if:
    // 1. Browser supports notifications
    // 2. Permission is not yet granted or denied
    // 3. User hasn't dismissed before
    const alreadyDismissed = localStorage.getItem(STORAGE_KEY);
    const supported = 'Notification' in window;
    const pending = supported && Notification.permission === 'default';

    if (supported && pending && !alreadyDismissed) {
      // Delay slightly so it doesn't flash immediately on load
      const timer = setTimeout(() => {
        setVisible(true);
        requestAnimationFrame(() => setAnimateIn(true));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnable = async () => {
    const granted = await requestNotificationPermission();
    dismiss();
    if (granted) {
      // Small test notification so the user sees it worked
      new Notification('FocusFlow notifications enabled ✅', {
        body: "You'll be alerted when your timer ends, even in another tab.",
        icon: '/favicon.ico',
        tag: 'focusflow-welcome',
      });
    }
  };

  const dismiss = () => {
    setAnimateIn(false);
    localStorage.setItem(STORAGE_KEY, '1');
    setTimeout(() => setVisible(false), 400);
  };

  if (!visible) return null;

  return (
    <div
      role="banner"
      aria-label="Enable notifications banner"
      style={{
        transform: animateIn ? 'translateY(0)' : 'translateY(-110%)',
        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        position: 'fixed',
        top: '72px',
        left: '50%',
        transform: animateIn
          ? 'translateX(-50%) translateY(0)'
          : 'translateX(-50%) translateY(-120%)',
        zIndex: 9999,
        width: 'min(420px, calc(100vw - 32px))',
      }}
    >
      <div
        className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-neu-sm p-4 flex items-start gap-3"
        style={{ backdropFilter: 'blur(12px)' }}
      >
        {/* Icon */}
        <div
          className="shrink-0 w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center"
          style={{ background: 'var(--accent)', opacity: 0.9 }}
        >
          <Bell className="w-5 h-5 text-white" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            Get notified when your session ends
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
            FocusFlow can alert you even when you're in another tab.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              id="notif-enable-btn"
              onClick={handleEnable}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--text-primary)] text-[var(--bg)] text-xs font-medium hover:opacity-90 transition-opacity active:scale-95"
            >
              <Bell className="w-3 h-3" />
              Enable
            </button>
            <button
              id="notif-dismiss-btn"
              onClick={dismiss}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--border)] text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors active:scale-95"
            >
              <BellOff className="w-3 h-3" />
              Not now
            </button>
          </div>
        </div>

        {/* Close */}
        <button
          id="notif-close-btn"
          onClick={dismiss}
          className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1 -mt-1 -mr-1 rounded"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationPermissionBanner;
