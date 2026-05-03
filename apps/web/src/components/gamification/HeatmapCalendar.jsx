import React, { useMemo } from 'react';
import { useGamification } from '@/contexts/GamificationContext.jsx';

const WEEKS = 53;
const DAYS = 7;

const LEVELS = [
  { min: 0, color: 'transparent', border: 'var(--border)' },
  { min: 1, color: '#4c1d95' },
  { min: 25, color: '#6d28d9' },
  { min: 60, color: '#7c3aed' },
  { min: 120, color: '#8b5cf6' },
  { min: 180, color: '#a78bfa' },
];

const getColor = (minutes) => {
  if (!minutes) return LEVELS[0];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (minutes >= LEVELS[i].min) return LEVELS[i];
  }
  return LEVELS[0];
};

const HeatmapCalendar = () => {
  const { sessions } = useGamification();

  // Build a map: "YYYY-MM-DD" -> total focus minutes
  const dayMap = useMemo(() => {
    const map = {};
    (sessions ?? []).forEach(s => {
      if (s.type !== 'pomodoro') return;
      const date = s.started_at?.slice(0, 10);
      if (!date) return;
      map[date] = (map[date] ?? 0) + Math.floor((s.duration ?? 0) / 60);
    });
    return map;
  }, [sessions]);

  // Build a 53×7 grid ending today
  const grid = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // end of grid = today, start = 52 weeks + today's weekday offset back
    const startOffset = today.getDay(); // 0=Sun
    const totalDays = WEEKS * DAYS;
    const start = new Date(today);
    start.setDate(start.getDate() - (totalDays - 1));

    const weeks = [];
    let week = [];
    for (let d = 0; d < totalDays; d++) {
      const cur = new Date(start);
      cur.setDate(start.getDate() + d);
      const key = cur.toISOString().slice(0, 10);
      week.push({ date: key, minutes: dayMap[key] ?? 0, future: cur > today });
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    if (week.length) weeks.push(week);
    return weeks;
  }, [dayMap]);

  const months = useMemo(() => {
    // label first week of each month
    const labels = [];
    let lastMonth = -1;
    grid.forEach((week, wi) => {
      const first = week.find(d => d.date);
      if (!first) return;
      const m = new Date(first.date).getMonth();
      if (m !== lastMonth) {
        labels.push({ wi, label: new Date(first.date).toLocaleString('default', { month: 'short' }) });
        lastMonth = m;
      }
    });
    return labels;
  }, [grid]);

  const totalMinutes = useMemo(() => Object.values(dayMap).reduce((a, b) => a + b, 0), [dayMap]);
  const activeDays = useMemo(() => Object.keys(dayMap).length, [dayMap]);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[660px]">
        {/* Month labels */}
        <div className="relative h-5 mb-1">
          {months.map(({ wi, label }) => (
            <span
              key={wi}
              className="absolute text-[10px] text-[var(--text-muted)]"
              style={{ left: `${(wi / WEEKS) * 100}%` }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-[3px]">
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => {
                const lvl = getColor(day.minutes);
                const hrs = Math.floor(day.minutes / 60);
                const mins = day.minutes % 60;
                const label = day.minutes
                  ? `${day.date}: ${hrs > 0 ? hrs + 'h ' : ''}${mins}m`
                  : day.date;
                return (
                  <div
                    key={di}
                    title={label}
                    className="w-[11px] h-[11px] rounded-[2px] cursor-default transition-transform hover:scale-125"
                    style={{
                      background: day.future ? 'transparent' : (lvl.color ?? 'var(--border)'),
                      border: day.future ? 'none' : (day.minutes ? 'none' : '1px solid var(--border)'),
                      opacity: day.future ? 0.15 : 1,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-[10px] text-[var(--text-muted)]">
            {activeDays} active days · {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m total
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[var(--text-muted)]">Less</span>
            {LEVELS.map((l, i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-[2px]"
                style={{
                  background: l.color === 'transparent' ? 'var(--bg)' : l.color,
                  border: i === 0 ? '1px solid var(--border)' : 'none',
                }}
              />
            ))}
            <span className="text-[10px] text-[var(--text-muted)]">More</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapCalendar;
