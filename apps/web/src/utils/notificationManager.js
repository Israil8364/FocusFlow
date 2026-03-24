
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

export const showNotification = (title, body, notificationsEnabled = true) => {
  if (!notificationsEnabled) return;
  
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'focusflow-timer',
        requireInteraction: false
      });
    } catch (e) {
      console.warn('Failed to show notification:', e);
    }
  }
};

export const notifyTimerComplete = (mode, notificationsEnabled, soundEnabled, soundType = 'bell') => {
  const messages = {
    pomodoro: {
      title: 'Pomodoro complete',
      body: 'Time for a break. Great work!'
    },
    shortBreak: {
      title: 'Break complete',
      body: 'Ready to focus again?'
    },
    longBreak: {
      title: 'Long break complete',
      body: 'Refreshed and ready to go!'
    }
  };
  
  const message = messages[mode] || messages.pomodoro;
  
  playNotificationSound(soundEnabled, soundType);
  showNotification(message.title, message.body, notificationsEnabled);
};
