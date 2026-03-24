import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useSettings } from '@/contexts/SettingsContext.jsx';
import { toast } from 'sonner';
import { notifyTimerComplete } from '@/utils/notificationManager';
import { timerState } from '@/utils/timerState';

const TimerContext = createContext();

export function useTimerContext() {
  return useContext(TimerContext);
}

export function TimerProvider({ children }) {
  const { currentUser } = useAuth();
  const { settings } = useSettings();
  
  const modes = [
    { id: 'pomodoro', label: 'Pomodoro', time: (settings?.pomodoroMinutes || 25) * 60 },
    { id: 'shortBreak', label: 'Short Break', time: (settings?.shortBreakMinutes || 5) * 60 },
    { id: 'longBreak', label: 'Long Break', time: (settings?.longBreakMinutes || 15) * 60 }
  ];

  const [mode, setModeState] = useState('pomodoro');
  const [timeLeft, setTimeLeft] = useState(modes[0].time);
  const [isRunning, setIsRunning] = useState(false);
  const [duration, setDuration] = useState(modes[0].time);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);

  // A signal for components to know a session has completed so they can refetch tasks/stats
  const [sessionCompletedSignal, setSessionCompletedSignal] = useState(0);

  const workerRef = useRef(null);
  const expectedEndTimeRef = useRef(null);

  useEffect(() => {
    // Spin up a Web Worker for reliable background interval pacing
    const workerCode = `
      let intervalId = null;
      self.onmessage = function(e) {
        if (e.data === 'start') {
          if (!intervalId) {
            intervalId = setInterval(() => {
              self.postMessage('tick');
            }, 1000);
          }
        } else if (e.data === 'stop') {
          clearInterval(intervalId);
          intervalId = null;
        }
      };
    `;
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    workerRef.current = new Worker(workerUrl);

    workerRef.current.onmessage = (e) => {
      if (e.data === 'tick') {
        tick();
      }
    };

    return () => {
      workerRef.current.terminate();
    };
  }, []);

  const tick = () => {
    setTimeLeft(prev => {
      if (!expectedEndTimeRef.current) return prev - 1;
      const remaining = Math.max(0, Math.round((expectedEndTimeRef.current - Date.now()) / 1000));
      return remaining;
    });
  };

  useEffect(() => {
    if (isRunning) {
      if (!expectedEndTimeRef.current) {
         expectedEndTimeRef.current = Date.now() + timeLeft * 1000;
      }
      workerRef.current.postMessage('start');
      timerState.setIsRunning(true);
    } else {
      expectedEndTimeRef.current = null;
      workerRef.current.postMessage('stop');
      timerState.setIsRunning(false);
    }
  }, [isRunning]);

  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      handleSessionComplete();
    }
  }, [timeLeft, isRunning]);

  // Sync mode updates if settings change while stopped
  useEffect(() => {
    if (!isRunning) {
      const selectedMode = modes.find(m => m.id === mode);
      if (selectedMode) {
        setTimeLeft(selectedMode.time);
        setDuration(selectedMode.time);
      }
    }
  }, [settings?.pomodoroMinutes, settings?.shortBreakMinutes, settings?.longBreakMinutes, mode]);

  const setMode = (newMode) => {
    setIsRunning(false);
    setModeState(newMode);
    const selectedMode = modes.find(m => m.id === newMode);
    if (selectedMode) {
      setTimeLeft(selectedMode.time);
      setDuration(selectedMode.time);
    }
  };

  const handleSessionComplete = async () => {
    setIsRunning(false);
    expectedEndTimeRef.current = null;
    workerRef.current.postMessage('stop');
    timerState.setIsRunning(false);

    let currentCompleted = pomodorosCompleted;

    if (currentUser) {
      try {
        const durMins = Math.floor(duration / 60);
        await pb.collection('sessions').create({
          userId: currentUser.id,
          duration: durMins,
          type: mode,
          date: new Date().toISOString(),
          completed: true,
          category: 'sage'
        }, { $autoCancel: false });
        
        toast.success(`${mode === 'pomodoro' ? 'Focus session' : 'Break'} completed!`);
        notifyTimerComplete(mode, settings?.notificationsEnabled, settings?.soundEnabled, settings?.soundType);
        setSessionCompletedSignal(prev => prev + 1);
        
        if (mode === 'pomodoro') {
          currentCompleted += 1;
          setPomodorosCompleted(currentCompleted);
          
          if (settings?.autoStartBreak) {
            const nextMode = currentCompleted % 4 === 0 ? 'longBreak' : 'shortBreak';
            setTimeout(() => {
              setMode(nextMode);
              setIsRunning(true);
            }, 1000);
          } else {
            const nextMode = currentCompleted % 4 === 0 ? 'longBreak' : 'shortBreak';
            setMode(nextMode);
          }
        } else {
          // It was a break
          if (settings?.autoStartPomodoro) {
            setTimeout(() => {
              setMode('pomodoro');
              setIsRunning(true);
            }, 1000);
          } else {
            setMode('pomodoro');
          }
        }
      } catch (error) {
        console.error('Failed to log session:', error);
      }
    }
  };

  const skipSession = () => {
    setIsRunning(false);
    const durMins = Math.floor(duration / 60);
    // Don't log if skipped, just jump
    let currentCompleted = pomodorosCompleted;
    if (mode === 'pomodoro') {
      currentCompleted += 1;
      setPomodorosCompleted(currentCompleted);
      const nextMode = currentCompleted % 4 === 0 ? 'longBreak' : 'shortBreak';
      setMode(nextMode);
    } else {
      setMode('pomodoro');
    }
  };

  const contextValue = {
    mode,
    setMode,
    timeLeft,
    setTimeLeft,
    isRunning,
    setIsRunning,
    duration,
    sessionCompletedSignal,
    modes,
    skipSession
  };

  return (
    <TimerContext.Provider value={contextValue}>
      {children}
    </TimerContext.Provider>
  );
}
