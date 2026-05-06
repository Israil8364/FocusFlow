
let audioContext = null;

export const initializeAudio = () => {
  if (typeof window === 'undefined') return;
  try {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    console.warn('Web Audio API not supported:', e);
  }
};

export const playNotificationSound = async (soundEnabled = true, soundType = 'bell') => {
  if (!soundEnabled) return;
  
  initializeAudio();
  if (!audioContext) return;
  
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
  
  try {
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
      // bell
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
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

export const showNotification = async (title, bodyOrOptions) => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  
  // If permission is not granted, we can't show it, but we can't request here (must be user action)
  if (Notification.permission !== 'granted') {
    console.warn('⚠️ Notifications not granted. Bestie, check your settings.');
    return;
  }

  const options = typeof bodyOrOptions === 'string' 
    ? { body: bodyOrOptions } 
    : bodyOrOptions;

  const finalOptions = {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'focusflow-timer',
    renotify: true,
    vibrate: [200, 100, 200],
    ...options
  };

  try {
    // 1. Try Service Worker first (best for background/mobile)
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, finalOptions);
        return;
      }
    }

    // 2. Fallback to Standard Notification constructor
    new Notification(title, finalOptions);
  } catch (e) {
    console.warn('❌ Notification failed:', e);
    // Last resort fallback
    try {
      new Notification(title, finalOptions);
    } catch (innerE) {}
  }
};

const GENZ_TIMER_MESSAGES = {
  pomodoro: [
    { title: "🍅 session complete fr", body: "u actually locked in. time for a break bestie, no cap." },
    { title: "✨ main character energy", body: "that focus session was a vibe. go grab a snack." },
    { title: "🎯 target locked", body: "session done. u left no crumbs. take a break." },
    { title: "🔥 u're on fire", body: "that's a whole session. don't burnout, chill for a bit." }
  ],
  shortBreak: [
    { title: "⚡ break's over bestie", body: "recharged and ready to crush it. let's go!" },
    { title: "📍 back to the grind", body: "break time is up. time to get that bread 🥖" },
    { title: "🔔 buzz buzz", body: "ur short break is done. lock back in!" }
  ],
  longBreak: [
    { title: "🔋 fully recharged", body: "that long break was much needed. session time?" },
    { title: "🌟 energy peaking", body: "u're ready to slay another session. let's get it." }
  ]
};

export const notifyTimerComplete = (mode, soundEnabled, soundType = 'bell', notificationsEnabled = true) => {
  const modeKey = GENZ_TIMER_MESSAGES[mode] ? mode : 'pomodoro';
  const variants = GENZ_TIMER_MESSAGES[modeKey];
  const variant = variants[Math.floor(Math.random() * variants.length)];

  if (soundEnabled) {
    playNotificationSound(true, soundType);
  }
  
  if (notificationsEnabled) {
    showNotification(variant.title, variant.body);
  }
};
