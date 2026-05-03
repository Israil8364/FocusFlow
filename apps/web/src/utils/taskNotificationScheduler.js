// ─── GenZ Notification Messages ──────────────────────────────────────────────

const MORNING_MESSAGES_MANY = [
  "bestie u got a PACKED schedule today, no cap 😤🔥",
  "bro woke up and chose PRODUCTIVITY frfr 💪",
  "ur schedule lookin busier than ur read receipts rn 😭",
  "you got LOTS of tasks cooking today, better not flop 🍳",
  "today's looking unhinged ngl, u got this tho 🫡",
  "bestie that todo list is NOT playing around 😤",
  "main character energy only today, u got loads to do 🎬",
];

const MORNING_MESSAGES_FEW = [
  "small era, big vibes — just a couple tasks today 🌿",
  "light day incoming, don't let the slay slip 😌✨",
  "chill schedule today, still gotta show up tho fr 🫶",
  "just vibing with a few tasks, no pressure bestie 💅",
];

const PRE_TASK_MESSAGES = [
  (task) => `ayo it's almost ${task} o'clock 👀 get up, bestie`,
  (task) => `"${task}" is about to start rn, no ghosting 🏃‍♂️💨`,
  (task) => `respectfully... "${task}" won't do itself 😩`,
  (task) => `bestie "${task}" is on the way, u ready?? 👀`,
  (task) => `the "${task}" era is upon us 🔔`,
  (task) => `"${task}" incoming in 5 🚨`,
  (task) => `ngl "${task}" is bout to slap if u show up fr 🔥`,
];

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Permission Helper ────────────────────────────────────────────────────────

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const perm = await Notification.requestPermission();
  return perm === 'granted';
}

// ─── Fire a single browser notification ──────────────────────────────────────

function fireNotification(title, body, icon = '/favicon.ico') {
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, icon, badge: '/favicon.ico' });
  } catch (e) {
    console.warn('[TaskNotifier] Could not show notification:', e);
  }
}

// ─── Schedule pre-task notifications ─────────────────────────────────────────
// Stores timeout IDs in module-level map so we can clear them on re-schedule

const scheduledTimeouts = new Map();

export function clearScheduledNotifications() {
  scheduledTimeouts.forEach(id => clearTimeout(id));
  scheduledTimeouts.clear();
}

/**
 * Main scheduler — call this whenever today's tasks are fetched.
 * @param {Array} tasks - Array of task objects with scheduled_date, start_time, etc.
 */
export async function scheduleDayNotifications(tasks) {
  const permitted = await requestNotificationPermission();
  if (!permitted) return;

  clearScheduledNotifications();

  const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  const now = new Date();

  // Filter to today's scheduled tasks with a start_time
  const todayTasks = tasks
    .filter(t => t.scheduledDate === todayStr && t.startTime)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (todayTasks.length === 0) return;

  // ── Daily morning summary notification (fires immediately if before earliest task)
  const earliestTask = todayTasks[0];
  const [eHour, eMin] = earliestTask.startTime.split(':').map(Number);
  const earliestStart = new Date();
  earliestStart.setHours(eHour, eMin, 0, 0);

  // If we haven't passed the earliest task yet, fire a morning message
  if (now < earliestStart) {
    // Fire the morning summary right now (or with a tiny delay)
    const morningMsg = todayTasks.length >= 3
      ? randomPick(MORNING_MESSAGES_MANY)
      : randomPick(MORNING_MESSAGES_FEW);

    const morningTimeoutId = setTimeout(() => {
      fireNotification(
        '🗓️ FocusFlow — Today\'s Plan',
        `${morningMsg} (${todayTasks.length} task${todayTasks.length > 1 ? 's' : ''} scheduled)`
      );
    }, 500);
    scheduledTimeouts.set('morning', morningTimeoutId);
  }

  // ── Per-task pre-notifications (5 min before each task start)
  todayTasks.forEach((task, idx) => {
    const [h, m] = task.startTime.split(':').map(Number);
    const taskStart = new Date();
    taskStart.setHours(h, m, 0, 0);

    // Notify 5 minutes before
    const notifyAt = new Date(taskStart.getTime() - 5 * 60 * 1000);
    const delay = notifyAt.getTime() - now.getTime();

    if (delay < 0) return; // Already past

    const msgFn = randomPick(PRE_TASK_MESSAGES);
    const body = msgFn(task.title);

    const id = setTimeout(() => {
      fireNotification(`⏰ Starting soon — ${task.title}`, body);
    }, delay);

    scheduledTimeouts.set(`task-${idx}`, id);
  });
}
