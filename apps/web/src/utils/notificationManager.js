
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
  if (Notification.permission !== 'granted') return;

  const options = typeof bodyOrOptions === 'string' 
    ? { body: bodyOrOptions } 
    : bodyOrOptions;

  const finalOptions = {
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'focusflow-timer',
    renotify: true,
    vibrate: [200, 100, 200],
    ...options
  };

  try {
    // 1. Always try Service Worker first — mandatory for mobile stability
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.showNotification) {
          await reg.showNotification(title, finalOptions);
          return;
        }
      } catch (swErr) {
        console.warn('SW notification failed, falling back:', swErr);
      }
    }

    // 2. Fallback to regular constructor for Desktop browsers
    // Note: This will fail on most mobile browsers, hence the SW priority above
    if (typeof Notification !== 'undefined') {
      new Notification(title, finalOptions);
    }
  } catch (e) {
    console.warn('❌ Could not show notification:', e);
  }
};

export const notifyTimerComplete = (mode, soundEnabled, soundType = 'bell', notificationsEnabled = true) => {
  const messages = {
    pomodoro: {
      title: '🍅 Focus session complete!',
      body: 'Great work! Time for a well-earned break.',
    },
    shortBreak: {
      title: `⚡ Break's over — let's go!`,
      body: 'Your short break ended. Ready to crush it?',
    },
    longBreak: {
      title: '🔋 Long break complete!',
      body: `Fully recharged. Let's get back to it!`,
    },
  };

  const message = messages[mode] || messages.pomodoro;

  if (soundEnabled) {
    playNotificationSound(true, soundType);
  }
  
  if (notificationsEnabled) {
    showNotification(message.title, message.body);
  }
};
