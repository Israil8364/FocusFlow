import React, { useState, useEffect, useRef } from 'react';
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Helmet } from 'react-helmet';
import { Plus, Clock, Sparkles, Check } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import supabase from '@/lib/supabaseClient';
import { scheduleDayNotifications } from '@/utils/taskNotificationScheduler.js';
import NeuomorphicTimerRing from '@/components/NeuomorphicTimerRing.jsx';
import CategoryRow from '@/components/CategoryRow.jsx';
import StatChip from '@/components/StatChip.jsx';
import { formatTime } from '@/utils/formatTime';
import { toast } from 'sonner';
import AddTaskModal from '@/components/AddTaskModal.jsx';
import { useSettings } from '@/contexts/SettingsContext.jsx';
import { useTimerContext } from '@/contexts/TimerContext.jsx';
import { useGamification } from '@/contexts/GamificationContext.jsx';
import XPBar from '@/components/gamification/XPBar.jsx';
import StreakWidget from '@/components/gamification/StreakWidget.jsx';
import DailyGoalRing from '@/components/gamification/DailyGoalRing.jsx';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';

import { COLORS } from '@/components/CategoryRow.jsx';

const HomePage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [stats, setStats] = useState({ pomodorosToday: 0, focusTimeToday: 0, dailyGoal: 60 });
  const [activeDragId, setActiveDragId] = useState(null);

  const { settings } = useSettings();
  const { mode, setMode, timeLeft, isRunning, setIsRunning, duration, sessionCompletedSignal, modes, skipSession, activeTask } = useTimerContext();
  const { todayMinutes, currentStreak } = useGamification();
  // daily_goal = number of Pomodoros; each is 25 min. Fall back to settings or 120 min.
  const userDailyGoalPomodoros = currentUser?.daily_goal ?? 4;
  const goalMinutes = userDailyGoalPomodoros * 25;

  const formatGoalTime = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m target`;
    if (h > 0) return `${h}h target`;
    return `${m}m target`;
  };
  const masterRef = useRef(null);
  const timerRingRef = useRef(null);
  const plusIconRef = useRef(null);

  // dnd-kit sensors — pointer (mouse/touch) + keyboard
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }, // 8px drag before activation
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.fromTo(".gsap-header", { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" })
      .fromTo(".gsap-timer", { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: "elastic.out(1, 0.75)" }, "-=0.4")
      .fromTo(".gsap-tasks", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, "-=0.6")
      .fromTo(".gsap-stats > a, .gsap-stats > div",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" },
        "-=0.6"
      );
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
            .order('order', { ascending: true })
            .order('created_at', { ascending: true }),
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
          note: t.note,
          scheduledDate: t.scheduled_date || null,
          scheduledFrom: t.start_time ? t.start_time.slice(0, 5) : null, // HH:MM
          scheduledTo: t.end_time ? t.end_time.slice(0, 5) : null,
          startTime: t.start_time ? t.start_time.slice(0, 5) : null, // Compatibility for scheduler
          endTime: t.end_time ? t.end_time.slice(0, 5) : null,
        }));

        setTasks(mappedTasks);
        // Schedule GenZ notifications based on today's tasks
        scheduleDayNotifications(mappedTasks);

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
        setStats({ pomodorosToday: pomos, focusTimeToday: focusTime, dailyGoal: userDailyGoalPomodoros ?? 4 });

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

  // ─── Drag & Drop handlers ───────────────────────────────────────────────
  const handleDragStart = ({ active }) => {
    setActiveDragId(active.id);
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveDragId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex(t => t.id === active.id);
    const newIndex = tasks.findIndex(t => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    // Optimistically reorder in state
    const reordered = arrayMove(tasks, oldIndex, newIndex);
    setTasks(reordered);

    // Persist new order to Supabase
    try {
      await Promise.all(
        reordered.map((task, index) =>
          supabase.from('tasks').update({ order: index }).eq('id', task.id)
        )
      );
    } catch (err) {
      console.error('Failed to persist task order:', err);
      toast.error('Could not save task order');
      // Revert
      setTasks(tasks);
    }
  };

  const activeDragTask = activeDragId ? tasks.find(t => t.id === activeDragId) : null;

  return (
    <>
      <Helmet>
        <title>Dashboard - FocusFlow</title>
      </Helmet>

      <div ref={masterRef} className="max-w-5xl mx-auto p-4 md:p-8 lg:p-12 space-y-12">

        <header className="gsap-header">
          <div className="flex items-center justify-between">
            <div className="max-w-full overflow-hidden">
              <h1 className="text-display text-[var(--text-primary)] break-words leading-tight">Welcome, {currentUser?.name || 'User'}</h1>
              <p className="text-body text-[var(--text-muted)] mt-1 break-words">Ready for a productive session?</p>
            </div>
          </div>
        </header>

        {/* Gamification widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <XPBar />
          <StreakWidget />
          <DailyGoalRing todayMinutes={todayMinutes} goalMinutes={goalMinutes} />
        </div>

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

          {activeTask && (
            <div className="mb-6 flex items-center gap-2 px-4 py-1.5 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-pill)] animate-in slide-in-from-top-2 duration-300">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: COLORS[activeTask.category] || 'var(--accent)' }} />
              <span className="text-sm font-medium text-[var(--text-primary)]">Focusing on: {activeTask.title}</span>
            </div>
          )}

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
              Skip
            </button>
          </div>
        </section>

        <section className="gsap-tasks">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-heading truncate">Today's Tasks</h2>
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
              [1, 2].map(i => <div key={i} className="h-16 bg-[var(--card)] rounded-[var(--radius-md)] animate-pulse border border-[var(--border)]" />)
            ) : tasks.length === 0 ? (
              <div className="text-center py-10 text-[var(--text-muted)] bg-[var(--card)] rounded-[var(--radius-md)] border border-[var(--border)] border-dashed">
                No tasks for today. Enjoy your free time!
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={tasks.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {tasks.map(task => (
                    <div key={task.id} className="gsap-task-item">
                      <CategoryRow
                        task={task}
                        onToggle={toggleTask}
                        onDelete={deleteTask}
                      />
                    </div>
                  ))}
                </SortableContext>

                {/* Ghost card while dragging */}
                <DragOverlay adjustScale={false}>
                  {activeDragTask ? (
                    <div className="p-4 md:p-5 bg-[var(--card)] rounded-[var(--radius-md)] shadow-neu border border-[var(--accent)] opacity-95 ring-2 ring-[var(--accent)] scale-105">
                      <span className="text-body font-medium text-[var(--text-primary)]">
                        {activeDragTask.title}
                      </span>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </div>
        </section>

        <section className="gsap-stats grid grid-cols-1 md:grid-cols-3 gap-4 pb-8">
          <Link to="/history" className="block focus:outline-none focus-visible:ring-2 ring-[var(--text-primary)] rounded-[var(--radius-md)]">
            <StatChip
              label="Pomodoros Today"
              value={stats.pomodorosToday.toString()}
              icon={Clock}
              color="bg-orange-50 text-orange-600"
              subLabel="Completed sessions"
            />
          </Link>
          <Link to="/analytics" className="block focus:outline-none focus-visible:ring-2 ring-[var(--text-primary)] rounded-[var(--radius-md)]">
            <StatChip
              label="Focus Time"
              value={`${stats.focusTimeToday}m`}
              icon={Sparkles}
              color="bg-blue-50 text-blue-600"
              subLabel="Deep work minutes"
            />
          </Link>
          <Link to="/timer" className="block focus:outline-none focus-visible:ring-2 ring-[var(--text-primary)] rounded-[var(--radius-md)]">
            <StatChip
              label="Daily Goal"
              value={`${Math.min(Math.round((stats.pomodorosToday / (stats.dailyGoal || 1)) * 100), 100)}%`}
              icon={Check}
              color="bg-emerald-50 text-emerald-600"
              subLabel={formatGoalTime(goalMinutes)}
            />
          </Link>
        </section>

      </div>

      <AddTaskModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={async ({ title, note, estimatedPomodoros, category, scheduledDate, startTime, endTime }) => {
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
                scheduled_date: scheduledDate || null,
                start_time: startTime || null,
                end_time: endTime || null,
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
              isCompleted: data.is_completed,
              scheduledDate: data.scheduled_date || null,
              scheduledFrom: data.start_time ? data.start_time.slice(0, 5) : null,
              scheduledTo: data.end_time ? data.end_time.slice(0, 5) : null,
              startTime: data.start_time ? data.start_time.slice(0, 5) : null, // for scheduler
              endTime: data.end_time ? data.end_time.slice(0, 5) : null,
            };

            setTasks(prev => {
              const updated = [record, ...prev];
              scheduleDayNotifications(updated); // re-schedule with new task
              return updated;
            });
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