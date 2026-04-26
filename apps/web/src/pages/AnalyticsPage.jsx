
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import supabase from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Link } from 'react-router-dom';
import { Play, History } from 'lucide-react';

const AnalyticsPage = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('Week');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: allRecords, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('type', 'pomodoro')
          .order('date', { ascending: false });

        if (error) throw error;

        const now = new Date();
        const cutoffDate = new Date();
        if (timeRange === 'Week') cutoffDate.setDate(now.getDate() - 7);
        else if (timeRange === 'Month') cutoffDate.setDate(now.getDate() - 30);
        else if (timeRange === 'Year') cutoffDate.setFullYear(now.getFullYear() - 1);

        const records = allRecords.filter(r => new Date(r.date) >= cutoffDate);

        const totalPomodoros = records.length;
        const totalFocusTime = records.reduce((acc, curr) => acc + curr.duration, 0);
        const avgSessionLength = totalPomodoros ? Math.round(totalFocusTime / totalPomodoros) : 0;
        
        // Compute streak (all-time)
        const activeDates = new Set(allRecords.map(r => r.date));
        let currentStreak = 0;
        let d = new Date();
        while (true) {
          const dateStr = d.toISOString().split('T')[0];
          if (activeDates.has(dateStr)) {
            currentStreak++;
            d.setDate(d.getDate() - 1);
          } else if (currentStreak === 0 && dateStr === new Date().toISOString().split('T')[0]) {
            d.setDate(d.getDate() - 1);
            if (!activeDates.has(d.toISOString().split('T')[0])) break;
          } else {
            break;
          }
        }

        let barChartData = [];
        let trendData = [];
        let chartTitle = '';
        let trendTitle = '';

        if (timeRange === 'Week') {
          chartTitle = 'Weekly Focus Time';
          trendTitle = '7-Day Trend';
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const weeklyDataMap = { 'Mon':0, 'Tue':0, 'Wed':0, 'Thu':0, 'Fri':0, 'Sat':0, 'Sun':0 };
          records.forEach(r => {
             weeklyDataMap[days[new Date(r.date).getDay()]] += r.duration;
          });
          barChartData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
             name: day, minutes: weeklyDataMap[day]
          }));

          for (let i = 6; i >= 0; i--) {
             const dt = new Date();
             dt.setDate(dt.getDate() - i);
             const dtStr = dt.toISOString().split('T')[0];
             const mins = records.filter(r => r.date === dtStr).reduce((a, c) => a + c.duration, 0);
             trendData.push({ name: days[dt.getDay()], minutes: mins });
          }
        } else if (timeRange === 'Month') {
          chartTitle = 'Monthly Focus Time';
          trendTitle = '30-Day Trend';
          
          const map = { 'Week 1':0, 'Week 2':0, 'Week 3':0, 'Week 4':0 };
          records.forEach(r => {
             const daysAgo = Math.floor((now - new Date(r.date))/(1000*60*60*24));
             if (daysAgo < 7) map['Week 4'] += r.duration;
             else if (daysAgo < 14) map['Week 3'] += r.duration;
             else if (daysAgo < 21) map['Week 2'] += r.duration;
             else if (daysAgo < 28) map['Week 1'] += r.duration;
          });
          barChartData = ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map(w => ({ name: w, minutes: map[w] }));

          for (let i = 29; i >= 0; i--) {
             const dt = new Date();
             dt.setDate(dt.getDate() - i);
             const dtStr = dt.toISOString().split('T')[0];
             const mins = records.filter(r => r.date === dtStr).reduce((a, c) => a + c.duration, 0);
             trendData.push({ name: dt.getDate(), minutes: mins });
          }
        } else if (timeRange === 'Year') {
          chartTitle = 'Yearly Focus Time';
          trendTitle = '12-Month Trend';

          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const map = {};
          months.forEach(m => map[m] = 0);
          records.forEach(r => { map[months[new Date(r.date).getMonth()]] += r.duration; });
          
          const curMonth = now.getMonth();
          for(let i=11; i>=0; i--) {
             let mIndex = curMonth - i;
             if(mIndex < 0) mIndex += 12;
             barChartData.push({ name: months[mIndex], minutes: map[months[mIndex]] });
          }
          trendData = [...barChartData];
        }

        // Category breakdown (using a default for now since sessions don't have categories)
        const categoryData = [
          { name: 'Focus', value: totalFocusTime, color: 'var(--cobalt)' }
        ];

        if (totalFocusTime === 0) {
          categoryData[0].value = 1;
          categoryData[0].color = 'var(--border)';
          categoryData[0].name = 'No Data';
        }

        setStats({
          totalPomodoros,
          totalFocusTime,
          currentStreak,
          avgSessionLength,
          barChartData,
          categoryData,
          trendData,
          chartTitle,
          trendTitle
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchStats();
    } else {
      setStats({
        totalPomodoros: 0,
        totalFocusTime: 0,
        currentStreak: 0,
        avgSessionLength: 0,
        barChartData: [],
        categoryData: [{ name: 'No Data', value: 1, color: 'var(--border)' }],
        trendData: [],
        chartTitle: 'No Data',
        trendTitle: 'No Trend'
      });
      setLoading(false);
    }
  }, [currentUser, timeRange]);

  if (loading) {
    return <div className="p-8 text-center text-[var(--text-muted)]">Loading analytics...</div>;
  }

  if (!stats) {
    return (
      <div className="max-w-6xl mx-auto p-8 text-center">
        <h1 className="text-heading mb-4">No Data Available</h1>
        <p className="text-body text-[var(--text-muted)] mb-8">Start your first focus session to see your analytics!</p>
        <Link to="/timer" className="btn-primary inline-flex items-center gap-2">Go to Timer</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Analytics - FocusFlow</title>
      </Helmet>
      <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-300">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-heading mb-2">Analytics</h1>
            <p className="text-body text-[var(--text-muted)]">Deep dive into your productivity patterns.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="flex gap-3">
               <Link to="/timer" className="flex items-center gap-2 px-4 py-1.5 rounded-[var(--radius-pill)] border border-[var(--border)] text-sm font-medium bg-[var(--card)] hover:bg-[var(--bg)] transition-colors shadow-sm"><Play className="w-4 h-4" /> Timer</Link>
               <Link to="/history" className="flex items-center gap-2 px-4 py-1.5 rounded-[var(--radius-pill)] border border-[var(--border)] text-sm font-medium bg-[var(--card)] hover:bg-[var(--bg)] transition-colors shadow-sm"><History className="w-4 h-4" /> History</Link>
            </div>
            <div className="flex bg-[var(--card)] p-1 rounded-[var(--radius-pill)] border border-[var(--border)]">
              {['Week', 'Month', 'Year'].map(t => (
                <button 
                  key={t} 
                  onClick={() => setTimeRange(t)}
                  className={`px-4 py-1.5 rounded-[var(--radius-pill)] text-sm font-medium transition-colors outline-none focus-visible:ring-2 ring-[var(--text-primary)] ${t === timeRange ? 'bg-[var(--text-primary)] text-[var(--bg)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Pomodoros', value: stats.totalPomodoros },
            { label: 'Focus Time (min)', value: stats.totalFocusTime },
            { label: 'Current Streak', value: `${stats.currentStreak} days` },
            { label: 'Avg Session', value: `${stats.avgSessionLength}m` },
          ].map((stat, i) => (
            <div key={i} className="bg-[var(--card)] p-5 rounded-[var(--radius-md)] shadow-neu-sm border border-[var(--border)]">
              <div className="text-eyebrow text-[var(--text-muted)] mb-2">{stat.label}</div>
              <div className="text-2xl md:text-stat text-[var(--text-primary)]">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-[var(--card)] p-6 rounded-[var(--radius-lg)] shadow-neu-sm border border-[var(--border)]">
            <h3 className="text-subheading mb-6">{stats.chartTitle}</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.barChartData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--text-muted))', fontSize: 12}} />
                  <Tooltip cursor={{fill: 'hsl(var(--bg))'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-neu-sm)'}} />
                  <Bar dataKey="minutes" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[var(--card)] p-6 rounded-[var(--radius-lg)] shadow-neu-sm border border-[var(--border)]">
            <h3 className="text-subheading mb-6">Category Breakdown</h3>
            <div className="h-[250px] w-full flex items-center">
              <ResponsiveContainer width="60%" height="100%">
                <PieChart>
                  <Pie data={stats.categoryData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {stats.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-neu-sm)'}} />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-[40%] pl-4 space-y-3">
                {stats.categoryData.map((cat, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: cat.color}}></div>
                    <span className="text-[var(--text-primary)]">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card)] p-6 rounded-[var(--radius-lg)] shadow-neu-sm border border-[var(--border)]">
          <h3 className="text-subheading mb-6">{stats.trendTitle}</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.trendData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--text-muted))', fontSize: 12}} />
                <Tooltip cursor={{fill: 'hsl(var(--bg))'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-neu-sm)'}} />
                <Line type="monotone" dataKey="minutes" stroke="var(--accent)" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </>
  );
};

export default AnalyticsPage;
