// src/utils/progressCalculations.js

/**
 * Calculates current streak and longest streak based on sessions array.
 * A session is considered valid if type === 'pomodoro' (or if we count all completed sessions).
 */
export function calculateStreaks(sessions) {
  if (!sessions || sessions.length === 0) {
    return { currentStreak: 0, longestStreak: 0, streakDays: new Set() };
  }

  // We only care about unique days where a pomodoro was completed
  const activeDaysSet = new Set();
  sessions.forEach(s => {
    if (s.type === 'pomodoro') {
      const d = new Date(s.created_at || s.date);
      // Adjust to local date string format 'YYYY-MM-DD'
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      activeDaysSet.add(dateStr);
    }
  });

  const activeDays = Array.from(activeDaysSet).sort((a, b) => b.localeCompare(a)); // Descending

  if (activeDays.length === 0) {
    return { currentStreak: 0, longestStreak: 0, streakDays: new Set() };
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Calculate longest streak
  const ascendingDays = [...activeDays].reverse();
  for (let i = 0; i < ascendingDays.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = new Date(ascendingDays[i - 1]);
      const currDate = new Date(ascendingDays[i]);
      const diffTime = Math.abs(currDate - prevDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  // Calculate current streak
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  if (activeDays[0] !== todayStr && activeDays[0] !== yesterdayStr) {
    currentStreak = 0;
  } else {
    currentStreak = 1;
    for (let i = 0; i < activeDays.length - 1; i++) {
      const currDate = new Date(activeDays[i]);
      const nextDate = new Date(activeDays[i + 1]); // which is earlier in time
      const diffTime = Math.abs(currDate - nextDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak, streakDays: activeDaysSet };
}

/**
 * Calculates total XP, current Level, and Level Progress based on sessions
 */
export function calculateXPAndLevel(sessions) {
  // Sort sessions ascending to simulate history for streaks during that specific session
  const sorted = [...(sessions || [])]
    .filter(s => s.type === 'pomodoro')
    .sort((a, b) => new Date(a.started_at || a.date) - new Date(b.started_at || b.date));

  let totalXP = 0;

  // Re-simulate the timeline to know what the streak was AT THAT TIME
  const activeDaysSet = new Set();
  let currentSimulatedStreak = 0;
  let lastDateStr = null;

  const LEVEL_THRESHOLDS = [0, 500, 2000, 6000, 15000, 40000, 100000, 250000, 600000, 1500000];

  sorted.forEach(s => {
    const d = new Date(s.created_at || s.date);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    if (dateStr !== lastDateStr) {
      if (lastDateStr) {
        const prev = new Date(lastDateStr);
        const diffTime = Math.abs(d - prev);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentSimulatedStreak++;
        } else if (diffDays > 1) {
          currentSimulatedStreak = 1;
        }
      } else {
        currentSimulatedStreak = 1;
      }
      lastDateStr = dateStr;
      activeDaysSet.add(dateStr);
    }

    // XP Logic: 10 XP for sessions >= 20 minutes
    let earnedXP = (s.duration >= 20) ? 10 : 0;
    totalXP += earnedXP;
  });

  // Calculate Level from Elite Thresholds
  let level = 1;
  let levelMin = 0;
  let levelMax = LEVEL_THRESHOLDS[1];

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      levelMin = LEVEL_THRESHOLDS[i];
      levelMax = LEVEL_THRESHOLDS[i + 1] || levelMin + 1000000; // Infinity level logic
      break;
    }
  }

  const levelProgress = {
    cur: levelMin,
    nxt: levelMax,
    pct: Math.min(100, Math.max(0, ((totalXP - levelMin) / (levelMax - levelMin)) * 100)),
    lvl: level
  };

  return { totalXP, level, levelProgress };
}

/**
 * Calculates weekly XP (resets on Monday) to determine the League
 */
export function calculateWeeklyXPAndLeague(sessions) {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday

  // Calculate the most recent Monday at 00:00:00
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() + diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const weeklySessions = (sessions || []).filter(s => {
    if (s.type !== 'pomodoro') return false;
    const d = new Date(s.created_at || s.date);
    return d >= startOfWeek;
  });

  // Re-simulate just to get XP for these sessions? Or just 10 XP flat? 
  // The user prompt says "Each completed session = 10 XP, Streak bonus..."
  // For simplicity we will recalculate using the same timeline logic but just sum up the week's portion
  // Actually, we can just run the calculateXPAndLevel on the full dataset, then do the same up to startOfWeek, 
  // and subtract.
  const { totalXP: allTimeXP } = calculateXPAndLevel(sessions);
  const { totalXP: xpUntilThisWeek } = calculateXPAndLevel(
    (sessions || []).filter(s => new Date(s.created_at || s.date) < startOfWeek)
  );

  const weeklyXP = Math.max(0, allTimeXP - xpUntilThisWeek);

  // Determine League
  // Bronze: 0–499 XP/week
  // Silver: 500–1499 XP/week
  // Gold: 1500–3499 XP/week
  // Platinum: 3500+ XP/week

  const leagues = [
    { id: 'bronze', label: 'Bronze', emoji: '🥉', lottie: '/lottie/Level_bronze.json', minXP: 0, color: '#cd7f32' },
    { id: 'silver', label: 'Silver', emoji: '🥈', lottie: '/lottie/Level_Silver.json', minXP: 500, color: '#c0c0c0' },
    { id: 'gold', label: 'Gold', emoji: '🥇', lottie: '/lottie/Level_gold.json', minXP: 1500, color: '#ffd700' },
    { id: 'platinum', label: 'Platinum', emoji: '💎', lottie: '/lottie/Level_Platinum.json', minXP: 3500, color: '#a78bfa' },
  ];

  let currentLeague = leagues[0];
  for (let i = leagues.length - 1; i >= 0; i--) {
    if (weeklyXP >= leagues[i].minXP) {
      currentLeague = leagues[i];
      break;
    }
  }

  return { weeklyXP, league: currentLeague, leagues };
}

/**
 * Evaluates achievements based on sessions and streaks
 */
export function evaluateAchievements(sessions) {
  const unlocked = [];
  const pomodoros = (sessions || []).filter(s => s.type === 'pomodoro');
  const { currentStreak, longestStreak } = calculateStreaks(sessions);

  // 1. First Step
  if (pomodoros.length >= 10) unlocked.push('first_step');

  // 2. Getting Hot
  if (pomodoros.length >= 100) unlocked.push('getting_hot');

  // 3. Diamond Mind
  if (pomodoros.length >= 1000) unlocked.push('diamond_mind');

  // 4. The Monk
  if (pomodoros.length >= 2500) unlocked.push('the_monk');

  // 5. Night Owl (Sessions after 10 PM)
  const nightCount = pomodoros.filter(s => {
    const hour = new Date(s.created_at || s.date).getHours();
    return hour >= 22;
  }).length;
  if (nightCount >= 100) unlocked.push('night_owl');

  // 6. Early Bird (Sessions before 7 AM)
  const earlyCount = pomodoros.filter(s => {
    const hour = new Date(s.created_at || s.date).getHours();
    return hour < 7;
  }).length;
  if (earlyCount >= 100) unlocked.push('early_bird');

  // 7. Week Warrior
  if (longestStreak >= 30) unlocked.push('week_warrior');

  // 8. Inferno
  if (longestStreak >= 100) unlocked.push('inferno');

  // 9. Weekend Grind (Sessions on Sat/Sun)
  const weekendCount = pomodoros.filter(s => {
    const day = new Date(s.created_at || s.date).getDay();
    return day === 0 || day === 6;
  }).length;
  if (weekendCount >= 50) unlocked.push('weekend_grind');

  // 10. Perfectionist (70 hours of focus in a single week)
  const durationByWeek = {};
  pomodoros.forEach(s => {
    const d = new Date(s.created_at || s.date);
    // Find Monday of that week
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    const weekKey = monday.toISOString().slice(0, 10); // Monday's date string

    durationByWeek[weekKey] = (durationByWeek[weekKey] || 0) + (s.duration || 0);
  });
  // 70 hours = 4200 minutes
  if (Object.values(durationByWeek).some(dur => dur >= 4200)) {
    unlocked.push('perfectionist');
  }

  return unlocked;
}
