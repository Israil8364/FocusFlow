
import { playNotificationSound } from './notificationManager';

/* Store active timers so we can cancel them */
const activeTimers = new Map();
// key: taskId, value: timeoutId

export const requestTaskNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return false;
  }
  
  if (Notification.permission === 'granted') return true;
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

export const scheduleTaskNotification = (task) => {
  /* Read settings */
  const remindersEnabled = localStorage.getItem('focusflow_taskRemindersEnabled') !== 'false';
  const leadMinutes = parseInt(localStorage.getItem('focusflow_taskReminderLeadTime') || '5');
  
  if (!remindersEnabled) return;

  /* Only schedule if task has scheduledFrom time and a date */
  if (!task.startTime || !task.scheduledDate) return;
  
  /* Parse the scheduled datetime */
  const [hours, minutes] = task.startTime.split(':').map(Number);
  const [year, month, day] = task.scheduledDate.split('-').map(Number);
  const scheduledDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
  
  /* Calculate lead time before */
  const notifyAt = new Date(scheduledDate.getTime() - leadMinutes * 60 * 1000);
  const now = new Date();
  const delay = notifyAt.getTime() - now.getTime();
  
  /* Don't schedule if time already passed */
  if (delay <= 0) return;
  
  /* Cancel existing timer for this task if any */
  if (activeTimers.has(task.id)) {
    clearTimeout(activeTimers.get(task.id));
  }
  
  /* Set the timer */
  const timerId = setTimeout(() => {
    triggerTaskNotification(task);
    activeTimers.delete(task.id);
  }, delay);
  
  activeTimers.set(task.id, timerId);
  
  console.log(
    `Notification scheduled for task "${task.title}" ` +
    `at ${notifyAt.toLocaleTimeString()}`
  );
};

export const cancelTaskNotification = (taskId) => {
  if (activeTimers.has(taskId)) {
    clearTimeout(activeTimers.get(taskId));
    activeTimers.delete(taskId);
  }
};

export const cancelAllTaskNotifications = () => {
  activeTimers.forEach(timerId => clearTimeout(timerId));
  activeTimers.clear();
};

/* Schedule all tasks for current user */
export const scheduleDayNotifications = (tasks) => {
  if (!tasks) return;
  tasks.forEach(task => {
    if (!task.isCompleted) {
      scheduleTaskNotification(task);
    }
  });
};

const GENZ_MESSAGES = [
  {
    title: "⏰ task alert bestie",
    body: (task, time) => 
      `"${task.title}" is in a bit (${time}) no cap 🔥 get in the zone`
  },
  {
    title: "🚨 lowkey important rn",
    body: (task, time) => 
      `your task "${task.title}" starts at ${time} fr fr don't ghost it 💀`
  },
  {
    title: "✨ slay check incoming",
    body: (task, time) => 
      `"${task.title}" @ ${time} — time to eat and leave no crumbs 💅`
  },
  {
    title: "📍 task o'clock bestie",
    body: (task, time) => 
      `"${task.title}" in a few. that's your sign to lock in 🎯`
  },
  {
    title: "🔔 not to be that guy but—",
    body: (task, time) => 
      `"${task.title}" is literally at ${time}. you got this tho 💪`
  },
  {
    title: "⚡ main character moment",
    body: (task, time) => 
      `heads up: "${task.title}" @ ${time}. 
       this is ur villain origin story era 🦹`
  },
  {
    title: "🎯 focus szn activated",
    body: (task, time) => 
      `"${task.title}" starts at ${time}. 
       close tiktok, open grindset 💻`
  },
  {
    title: "👀 PSA from FocusFlow",
    body: (task, time) => 
      `"${task.title}" @ ${time} — we're rooting for u bestie 🌟`
  },
];

const getRandomMessage = () => {
  return GENZ_MESSAGES[
    Math.floor(Math.random() * GENZ_MESSAGES.length)
  ];
};

const formatTimeStr = (startTime) => {
  if (!startTime) return 'soon';
  const [h, m] = startTime.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
};

export const triggerTaskNotification = (task) => {
  const msg = getRandomMessage();
  const timeStr = formatTimeStr(task.startTime);
  
  const soundEnabled = localStorage.getItem('focusflow_notificationSound') !== 'false';
  if (soundEnabled) {
    playNotificationSound();
  }

  /* 1. Browser push notification */
  if (Notification.permission === 'granted') {
    const notification = new Notification(msg.title, {
      body: msg.body(task, timeStr),
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `task-${task.id}`,
      requireInteraction: false,
      silent: false,
    });
    
    /* Click notification → open app */
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    
    /* Auto close after 8 seconds */
    setTimeout(() => notification.close(), 8000);
  }
  
  /* 2. In-app toast notification (sonner) */
  window.dispatchEvent(new CustomEvent('taskNotificationDue', {
    detail: { task, timeStr, msg }
  }));
};
