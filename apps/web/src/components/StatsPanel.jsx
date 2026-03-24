
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const StatsPanel = ({ stats, loading }) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-card shadow-neumorphic rounded-16 animate-pulse" />
        ))}
      </div>
    );
  }

  const chartData = stats.weeklyChart || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-5 md:p-6 rounded-16 bg-card shadow-neumorphic hover:shadow-floating transition-all duration-250 flex flex-col justify-center">
        <div className="text-small text-muted-foreground mb-2 uppercase tracking-wider">Total Pomodoros</div>
        <div className="text-stats text-foreground">
          {stats.monthly?.completedPomodoros || 0}
        </div>
      </div>

      <div className="p-5 md:p-6 rounded-16 bg-card shadow-neumorphic hover:shadow-floating transition-all duration-250 flex flex-col justify-center">
        <div className="text-small text-muted-foreground mb-2 uppercase tracking-wider">Total Focus Time</div>
        <div className="text-stats text-foreground">
          {stats.monthly?.focusTimeMinutes || 0} <span className="text-body font-normal text-muted-foreground">min</span>
        </div>
      </div>

      <div className="p-5 md:p-6 rounded-16 bg-card shadow-neumorphic hover:shadow-floating transition-all duration-250 flex flex-col">
        <div className="text-small text-muted-foreground mb-4 uppercase tracking-wider">Focus Trends</div>
        <div className="flex-1 min-h-[60px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  fontSize: '12px'
                }}
                formatter={(value) => [`${value} min`, 'Focus']}
              />
              <Bar dataKey="minutes" radius={[4, 4, 4, 4]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="var(--text-muted)" className="opacity-50 hover:opacity-100 transition-opacity duration-250" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
