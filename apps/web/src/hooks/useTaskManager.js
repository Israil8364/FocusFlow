
import { useState, useEffect, useCallback } from 'react';
import supabase from '@/lib/supabaseClient';

export const useTaskManager = (userId) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTaskId, setActiveTaskId] = useState(null);

  const fetchTasks = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('order', { ascending: true })
        .order('created_at', { ascending: true });

      if (err) throw err;
      
      // Map snake_case to camelCase
      const mappedTasks = data.map(t => ({
        id: t.id,
        title: t.title,
        estimatedPomodoros: t.estimated_pomodoros,
        completedPomodoros: t.completed_pomodoros,
        userId: t.user_id,
        isCompleted: t.is_completed,
        order: t.order,
        category: t.category,
        note: t.note,
        createdAt: t.created_at
      }));

      setTasks(mappedTasks);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (title, estimatedPomodoros, options = {}) => {
    if (!userId) return;

    try {
      const maxOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.order || 0)) : 0;
      const { data, error: err } = await supabase
        .from('tasks')
        .insert({
          title,
          estimated_pomodoros: estimatedPomodoros,
          completed_pomodoros: 0,
          user_id: userId,
          is_completed: false,
          order: maxOrder + 1,
          category: options.category || 'red',
          note: options.note || ''
        })
        .select()
        .single();
      
      if (err) throw err;

      const newTask = {
        id: data.id,
        title: data.title,
        estimatedPomodoros: data.estimated_pomodoros,
        completedPomodoros: data.completed_pomodoros,
        userId: data.user_id,
        isCompleted: data.is_completed,
        order: data.order,
        category: data.category,
        note: data.note,
        createdAt: data.created_at
      };
      
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      console.error('Failed to add task:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      // Map camelCase to snake_case for updates
      const dbUpdates = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.estimatedPomodoros !== undefined) dbUpdates.estimated_pomodoros = updates.estimatedPomodoros;
      if (updates.completedPomodoros !== undefined) dbUpdates.completed_pomodoros = updates.completedPomodoros;
      if (updates.isCompleted !== undefined) dbUpdates.is_completed = updates.isCompleted;
      if (updates.order !== undefined) dbUpdates.order = updates.order;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.note !== undefined) dbUpdates.note = updates.note;

      const { data, error: err } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', taskId)
        .select()
        .single();

      if (err) throw err;

      const updated = {
        id: data.id,
        title: data.title,
        estimatedPomodoros: data.estimated_pomodoros,
        completedPomodoros: data.completed_pomodoros,
        userId: data.user_id,
        isCompleted: data.is_completed,
        order: data.order,
        category: data.category,
        note: data.note,
        createdAt: data.created_at
      };

      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      return updated;
    } catch (err) {
      console.error('Failed to update task:', err);
      setError(err.message);
      throw err;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const { error: err } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (err) throw err;

      setTasks(prev => prev.filter(t => t.id !== taskId));
      if (activeTaskId === taskId) {
        setActiveTaskId(null);
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError(err.message);
      throw err;
    }
  };

  const toggleComplete = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    await updateTask(taskId, { isCompleted: !task.isCompleted });
  };

  const incrementPomodoro = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newCompleted = (task.completedPomodoros || 0) + 1;
    const isNowComplete = newCompleted >= task.estimatedPomodoros;
    
    await updateTask(taskId, {
      completedPomodoros: newCompleted,
      isCompleted: isNowComplete
    });
  };

  const reorderTasks = async (startIndex, endIndex) => {
    const result = Array.from(tasks);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    // Optimistically update UI
    const previousTasks = [...tasks];
    setTasks(result);

    try {
      // In Supabase, we should ideally use a RPC for bulk update, 
      // but for now we'll do individual updates to keep it simple.
      await Promise.all(
        result.map((task, index) =>
          supabase.from('tasks').update({ order: index }).eq('id', task.id)
        )
      );
    } catch (err) {
      console.error('Failed to reorder tasks:', err);
      setTasks(previousTasks);
    }
  };

  const moveTaskUp = async (taskId) => {
    const index = tasks.findIndex(t => t.id === taskId);
    if (index > 0) {
      await reorderTasks(index, index - 1);
    }
  };

  const moveTaskDown = async (taskId) => {
    const index = tasks.findIndex(t => t.id === taskId);
    if (index < tasks.length - 1) {
      await reorderTasks(index, index + 1);
    }
  };

  return {
    tasks,
    loading,
    error,
    activeTaskId,
    setActiveTaskId,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    incrementPomodoro,
    reorderTasks,
    moveTaskUp,
    moveTaskDown,
    refetch: fetchTasks
  };
};
