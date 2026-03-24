
import { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';

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
      const records = await pb.collection('tasks').getFullList({
        filter: `userId = "${userId}"`,
        sort: 'order,createdAt',
        $autoCancel: false
      });
      setTasks(records);
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
      const newTask = await pb.collection('tasks').create({
        title,
        estimatedPomodoros,
        completedPomodoros: 0,
        userId,
        isCompleted: false,
        order: maxOrder + 1,
        category: options.category || 'red',
        note: options.note || ''
      }, { $autoCancel: false });
      
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
      const updated = await pb.collection('tasks').update(taskId, updates, { $autoCancel: false });
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
      await pb.collection('tasks').delete(taskId, { $autoCancel: false });
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

    const updates = result.map((task, index) => ({
      id: task.id,
      order: index
    }));

    setTasks(result);

    try {
      await Promise.all(
        updates.map(({ id, order }) =>
          pb.collection('tasks').update(id, { order }, { $autoCancel: false })
        )
      );
    } catch (err) {
      console.error('Failed to reorder tasks:', err);
      fetchTasks();
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
