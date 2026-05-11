
let audioContext = null;

// Register the service worker for background notification support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(err => {
    console.warn('SW registration failed:', err);
  });
}

// Must be called on a user gesture to unlock AudioContext
export const initializeAudio = () => {
  if (typeof window === 'undefined') return;
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended (browsers suspend audio until a user gesture)
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }
  } catch (e) {
    console.warn('Web Audio API not supported:', e);
  }
};

export const playNotificationSound = async (soundEnabled = true, soundType = 'bell') => {
  if (!soundEnabled) return;

  try {
    // Always (re)create context if needed
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const playOscillator = (freq, type, duration, vol, startTime) => {
      const osc = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioContext.destination);
      osc.frequency.setValueAtTime(freq, startTime);
      osc.type = type;
      gainNode.gain.setValueAtTime(vol, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = audioContext.currentTime;

    if (soundType === 'chime') {
      playOscillator(523.25, 'sine', 1.5, 0.3, now);
      playOscillator(659.25, 'sine', 1.5, 0.2, now + 0.1);
      playOscillator(783.99, 'sine', 1.5, 0.2, now + 0.2);
    } else if (soundType === 'beep') {
      playOscillator(1200, 'square', 0.15, 0.1, now);
      playOscillator(1200, 'square', 0.15, 0.1, now + 0.25);
    } else {
      // bell (default)
      playOscillator(800, 'sine', 0.8, 0.4, now);
      playOscillator(1600, 'sine', 0.5, 0.1, now);
    }
  } catch (e) {
    console.warn('Failed to play sound:', e);
  }
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return false;
  }
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const showNotification = async (title, bodyOrOptions) => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  // Auto-request permission if default (shouldn't happen often but safety net)
  if (Notification.permission === 'default') {
    const granted = await requestNotificationPermission();
    if (!granted) {
      console.warn('⚠️ Notification permission not granted.');
      return;
    }
  }

  if (Notification.permission !== 'granted') {
    console.warn('⚠️ Notifications blocked by browser.');
    return;
  }

  const options = typeof bodyOrOptions === 'string'
    ? { body: bodyOrOptions }
    : bodyOrOptions;

  const finalOptions = {
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: 'focusflow-timer',
    renotify: true,
    requireInteraction: false,
    silent: false,
    ...options
  };

  try {
    // 1. Try Service Worker (best for background / mobile)
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, finalOptions);
        return;
      }
    }
    // 2. Fallback: Standard Notification API
    new Notification(title, finalOptions);
  } catch (e) {
    console.warn('❌ Notification via SW failed, falling back:', e);
    try {
      new Notification(title, finalOptions);
    } catch (innerE) {
      console.warn('❌ Notification fallback also failed:', innerE);
    }
  }
};

const GENZ_TIMER_MESSAGES = {
  pomodoro: [
    { title: '🍅 session complete fr', body: 'u actually locked in. time for a break bestie, no cap.' },
    { title: '✨ main character energy', body: 'that focus session was a vibe. go grab a snack.' },
    { title: '🎯 target locked', body: 'session done. u left no crumbs. take a break.' },
    { title: '🔥 ur on fire', body: "that's a whole session. don't burnout, chill for a bit." },
  ],
  shortBreak: [
    { title: "⚡ break's over bestie", body: 'recharged and ready to crush it. let\'s go!' },
    { title: '📍 back to the grind', body: 'break time is up. time to get that bread 🥖' },
    { title: '🔔 buzz buzz', body: 'ur short break is done. lock back in!' },
  ],
  longBreak: [
    { title: '🔋 fully recharged', body: 'that long break was much needed. session time?' },
    { title: '🌟 energy peaking', body: "u're ready to slay another session. let's get it." },
  ],
};

export const notifyTimerComplete = (mode, soundEnabled, soundType = 'bell', notificationsEnabled = true) => {
  const modeKey = GENZ_TIMER_MESSAGES[mode] ? mode : 'pomodoro';
  const variants = GENZ_TIMER_MESSAGES[modeKey];
  const variant = variants[Math.floor(Math.random() * variants.length)];

  // Fire sound and notification concurrently, don't await
  if (soundEnabled !== false) {
    playNotificationSound(true, soundType);
  }

  if (notificationsEnabled !== false) {
    showNotification(variant.title, variant.body);
  }
};
