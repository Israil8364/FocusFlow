
export const calculateDailyStats = (sessions, date) => {
  const dateStr = date.toISOString().split('T')[0];
  const daySessions = sessions.filter(s => s.date.startsWith(dateStr));
  
  const focusTimeMinutes = daySessions
    .filter(s => s.type === 'pomodoro')
    .reduce((sum, s) => sum + s.duration, 0);
  
  const completedPomodoros = daySessions.filter(s => s.type === 'pomodoro').length;
  
  return { focusTimeMinutes, completedPomodoros };
};

export const calculateWeeklyStats = (sessions) => {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const weekSessions = sessions.filter(s => {
    const sessionDate = new Date(s.date);
    return sessionDate >= weekAgo && sessionDate <= today;
  });
  
  const focusTimeMinutes = weekSessions
    .filter(s => s.type === 'pomodoro')
    .reduce((sum, s) => sum + s.duration, 0);
  
  const completedPomodoros = weekSessions.filter(s => s.type === 'pomodoro').length;
  
  return { focusTimeMinutes, completedPomodoros };
};

export const calculateMonthlyStats = (sessions) => {
  const today = new Date();
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);
  
  const monthSessions = sessions.filter(s => {
    const sessionDate = new Date(s.date);
    return sessionDate >= monthAgo && sessionDate <= today;
  });
  
  const focusTimeMinutes = monthSessions
    .filter(s => s.type === 'pomodoro')
    .reduce((sum, s) => sum + s.duration, 0);
  
  const completedPomodoros = monthSessions.filter(s => s.type === 'pomodoro').length;
  
  return { focusTimeMinutes, completedPomodoros };
};

export const getWeeklyChartData = (sessions) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const chartData = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const daySessions = sessions.filter(s => s.date.startsWith(dateStr) && s.type === 'pomodoro');
    const focusMinutes = daySessions.reduce((sum, s) => sum + s.duration, 0);
    
    chartData.push({
      day: days[date.getDay()],
      minutes: focusMinutes,
      date: dateStr
    });
  }
  
  return chartData;
};

export const getMonthlyHeatmapData = (sessions) => {
  const today = new Date();
  const heatmapData = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const daySessions = sessions.filter(s => s.date.startsWith(dateStr) && s.type === 'pomodoro');
    const count = daySessions.length;
    
    heatmapData.push({
      date: dateStr,
      count,
      intensity: count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : count <= 6 ? 3 : 4
    });
  }
  
  return heatmapData;
};
