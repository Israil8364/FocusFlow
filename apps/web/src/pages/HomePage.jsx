import React, { useState, useEffect, useRef } from 'react';
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Helmet } from 'react-helmet';
import { Plus } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import supabase from '@/lib/supabaseClient';
import NeuomorphicTimerRing from '@/components/NeuomorphicTimerRing.jsx';
import CategoryRow from '@/components/CategoryRow.jsx';
import StatChip from '@/components/StatChip.jsx';
import { formatTime } from '@/utils/formatTime';
import { toast } from 'sonner';
import AddTaskModal from '@/components/AddTaskModal.jsx';
import { useSettings } from '@/contexts/SettingsContext.jsx';
import { useTimerContext } from '@/contexts/TimerContext.jsx';

const HomePage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [stats, setStats] = useState({ pomodorosToday: 0, focusTimeToday: 0, dailyGoal: 60 });
  
  const { settings } = useSettings();
  const { mode, setMode, timeLeft, isRunning, setIsRunning, duration, sessionCompletedSignal, modes, skipSession } = useTimerContext();
  const masterRef = useRef(null);
  const timerRingRef = useRef(null);
  const plusIconRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from(".gsap-header", { y: -20, opacity: 0, duration: 0.8, ease: "power3.out" })
      .from(".gsap-timer", { scale: 0.95, opacity: 0, duration: 1, ease: "elastic.out(1, 0.75)" }, "-=0.4")
      .from(".gsap-tasks", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
      .from(".gsap-stats > div", { y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }, "-=0.6");
  }, { scope: masterRef });

  useGSAP(() => {
    if (!loadingTasks && tasks.length > 0) {
      gsap.from(".gsap-task-item", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
        clearProps: "all"
      });
    }
  }, [loadingTasks, tasks.length]);

  useGSAP(() => {
    if (isRunning) {
      gsap.to(timerRingRef.current, {
        scale: 1.02,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    } else {
      gsap.to(timerRingRef.current, { scale: 1, duration: 0.5 });
    }
  }, [isRunning]);

  useEffect(() => {
    const fetchTasksAndStats = async () => {
      try {
        const [taskResponse, sessionResponse] = await Promise.all([
          supabase
            .from('tasks')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('is_completed', false)
            .order('created_at', { ascending: false }),
          supabase
            .from('sessions')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('type', 'pomodoro')
        ]);
        
        if (taskResponse.error) throw taskResponse.error;
        if (sessionResponse.error) throw sessionResponse.error;

        // Map tasks to camelCase
        const mappedTasks = taskResponse.data.map(t => ({
          id: t.id,
          title: t.title,
          estimatedPomodoros: t.estimated_pomodoros,
          completedPomodoros: t.completed_pomodoros,
          isCompleted: t.is_completed,
          category: t.category,
          note: t.note
        }));
        
        setTasks(mappedTasks);

        // Calculate today's stats
        const todayStr = new Date().toLocaleDateString('en-CA');
        let pomos = 0;
        let focusTime = 0;
        sessionResponse.data.forEach(r => {
          if (r.date === todayStr) {
            pomos++;
            focusTime += r.duration;
          }
        });
        setStats({ pomodorosToday: pomos, focusTimeToday: focusTime, dailyGoal: 60 });

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingTasks(false);
      }
    };
    if (currentUser) {
      fetchTasksAndStats();
    } else {
      setLoadingTasks(false);
    }
  }, [currentUser, sessionCompletedSignal]);

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: !task.isCompleted })
        .eq('id', id);

      if (error) throw error;
      setTasks(tasks.filter(t => t.id !== id));
      toast.success('Task completed!');
    } catch (error) {
      console.error(error);
    }
  };

  const deleteTask = async (id) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - FocusFlow</title>
      </Helmet>

      <div ref={masterRef} className="max-w-5xl mx-auto p-4 md:p-8 lg:p-12 space-y-12 animate-in fade-in duration-300">
        
        <header className="gsap-header">
          <h1 className="text-display text-[var(--text-primary)]">Welcome, {currentUser?.name || 'User'}</h1>
          <p className="text-body text-[var(--text-muted)] mt-2">Ready for a productive session?</p>
        </header>

        <section className="gsap-timer flex flex-col items-center bg-[var(--card)] p-8 rounded-[var(--radius-lg)] shadow-neu-sm border border-[var(--border)]">
          <div className="flex gap-4 mb-8">
            {modes.map(m => (
              <button
                key={m.id}
                onClick={() => { setMode(m.id); setIsRunning(false); }}
                className={`text-sm font-medium pb-1 border-b-2 transition-colors capitalize ${mode === m.id ? 'border-[var(--text-primary)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div ref={timerRingRef}>
            <NeuomorphicTimerRing 
              progress={((duration - timeLeft) / duration) * 100} 
              time={formatTime(timeLeft)} 
              mode={mode} 
              isRunning={isRunning} 
            />
          </div>

          <div className="mt-10 flex gap-4">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="px-8 py-3 rounded-[var(--radius-pill)] bg-[var(--text-primary)] text-[var(--bg)] font-medium shadow-neu hover:-translate-y-0.5 transition-all active:scale-95"
            >
              {isRunning ? 'Pause Session' : 'Start Session'}
            </button>
            <button
              onClick={skipSession}
              className="px-6 py-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium transition-colors"
            >
              Skip &rarr;
            </button>
          </div>
        </section>

        <section className="gsap-tasks">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-heading">Today's Tasks</h2>
            <button 
              onClick={() => setShowAddModal(true)} 
              onMouseEnter={() => gsap.to(plusIconRef.current, { rotation: 90, duration: 0.3, ease: "power2.out" })}
              onMouseLeave={() => gsap.to(plusIconRef.current, { rotation: 0, duration: 0.3, ease: "power2.in" })}
              className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-pill)] bg-[var(--bg)] border border-[var(--border)] text-sm font-medium shadow-sm hover:shadow-neu-sm transition-all active:scale-95"
            >
              <div ref={plusIconRef}>
                <Plus className="w-4 h-4" />
              </div> 
              Add Task
            </button>
          </div>
          
          <div className="space-y-3">
            {loadingTasks ? (
              [1,2].map(i => <div key={i} className="h-16 bg-[var(--card)] rounded-[var(--radius-md)] animate-pulse border border-[var(--border)]"></div>)
            ) : tasks.length === 0 ? (
              <div className="text-center py-10 text-[var(--text-muted)] bg-[var(--card)] rounded-[var(--radius-md)] border border-[var(--border)] border-dashed">
                No tasks for today. Enjoy your free time!
              </div>
            ) : (
              tasks.map(task => (
                <div key={task.id} className="gsap-task-item">
                  <CategoryRow 
                    task={task} 
                    onToggle={toggleTask} 
                    onDelete={deleteTask} 
                  />
                </div>
              ))
            )}
          </div>
        </section>

        <section className="gsap-stats grid grid-cols-1 md:grid-cols-3 gap-4 pb-8">
          <Link to="/history" className="block focus:outline-none focus-visible:ring-2 ring-[var(--text-primary)] rounded-[var(--radius-md)]">
            <StatChip label="Pomodoros Today" value={stats.pomodorosToday.toString()} />
          </Link>
          <Link to="/analytics" className="block focus:outline-none focus-visible:ring-2 ring-[var(--text-primary)] rounded-[var(--radius-md)]">
            <StatChip label="Focus Time" value={`${stats.focusTimeToday}m`} />
          </Link>
          <Link to="/timer" className="block focus:outline-none focus-visible:ring-2 ring-[var(--text-primary)] rounded-[var(--radius-md)]">
            <StatChip 
              label="Daily Goal" 
              value={`${Math.min(Math.round((stats.focusTimeToday / stats.dailyGoal) * 100), 100)}%`} 
              subLabel={stats.focusTimeToday >= stats.dailyGoal ? 'Goal reached!' : 'Almost there!'} 
            />
          </Link>
        </section>

      </div>

      <AddTaskModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={async ({ title, note, estimatedPomodoros, category }) => {
          try {
            const { data, error } = await supabase
              .from('tasks')
              .insert({
                user_id: currentUser.id,
                title,
                note: note || '',
                estimated_pomodoros: estimatedPomodoros || 1,
                completed_pomodoros: 0,
                category: category || 'sage',
                is_completed: false,
              })
              .select()
              .single();

            if (error) throw error;
            
            const record = {
              id: data.id,
              title: data.title,
              note: data.note,
              estimatedPomodoros: data.estimated_pomodoros,
              completedPomodoros: data.completed_pomodoros,
              category: data.category,
              isCompleted: data.is_completed
            };

            setTasks(prev => [record, ...prev]);
            toast.success('Task added!');
          } catch (err) {
            console.error('Add task error:', err);
            toast.error('Failed to add task');
            throw err;
          }
        }}
      />
    </>
  );
};

export default HomePage;