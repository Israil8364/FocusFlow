
import { useState, useEffect, useRef, useCallback } from 'react';
import { minutesToSeconds } from '@/utils/formatTime';
import { notifyTimerComplete } from '@/utils/notificationManager';

export const useTimer = (settings, onComplete) => {
  const [mode, setMode] = useState('pomodoro');
  const [timeLeft, setTimeLeft] = useState(minutesToSeconds(settings?.pomodoroMinutes || 25));
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  
  const animationFrameRef = useRef(null);
  const lastTickRef = useRef(null);
  const accumulatedTimeRef = useRef(0);

  const durations = {
    pomodoro: minutesToSeconds(settings?.pomodoroMinutes || 25),
    shortBreak: minutesToSeconds(settings?.shortBreakMinutes || 5),
    longBreak: minutesToSeconds(settings?.longBreakMinutes || 15)
  };

  const totalTime = durations[mode];
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const tick = useCallback((timestamp) => {
    if (!lastTickRef.current) {
      lastTickRef.current = timestamp;
    }

    const deltaTime = timestamp - lastTickRef.current;
    lastTickRef.current = timestamp;

    accumulatedTimeRef.current += deltaTime;

    if (accumulatedTimeRef.current >= 1000) {
      const secondsToSubtract = Math.floor(accumulatedTimeRef.current / 1000);
      accumulatedTimeRef.current = accumulatedTimeRef.current % 1000;
      setTimeLeft(prev => {
        const newTime = Math.max(0, prev - secondsToSubtract);
        if (newTime === 0) setIsRunning(false);
        return newTime;
      });
    }

    if (isRunning) {
      animationFrameRef.current = requestAnimationFrame(tick);
    }
  }, [isRunning]);

  // Handle timer completion side effects
  useEffect(() => {
    if (timeLeft === 0 && !isRunning) {
      // Small delay to ensure state has settled
      const timer = setTimeout(() => {
        notifyTimerComplete(
          mode,
          settings?.soundEnabled ?? true,
          settings?.soundType || 'bell',
          settings?.notificationsEnabled ?? true
        );

        if (onComplete) {
          onComplete(mode, durations[mode]);
        }

        if (mode === 'pomodoro') {
          const newCount = pomodoroCount + 1;
          setPomodoroCount(newCount);
          
          if (settings?.autoStartBreak) {
            const nextMode = newCount % 4 === 0 ? 'longBreak' : 'shortBreak';
            setMode(nextMode);
            setTimeLeft(durations[nextMode]);
            setIsRunning(true);
          }
        } else if (settings?.autoStartPomodoro) {
          setMode('pomodoro');
          setTimeLeft(durations.pomodoro);
          setIsRunning(true);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isRunning, mode, settings, onComplete, durations, pomodoroCount]);

  useEffect(() => {
    if (isRunning) {
      lastTickRef.current = null;
      accumulatedTimeRef.current = 0;
      animationFrameRef.current = requestAnimationFrame(tick);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lastTickRef.current = null;
      accumulatedTimeRef.current = 0;
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, tick]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const skip = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(0);
    
    if (mode === 'pomodoro') {
      const newCount = pomodoroCount + 1;
      setPomodoroCount(newCount);
      const nextMode = newCount % 4 === 0 ? 'longBreak' : 'shortBreak';
      setMode(nextMode);
      setTimeLeft(durations[nextMode]);
    } else {
      setMode('pomodoro');
      setTimeLeft(durations.pomodoro);
    }
  }, [mode, pomodoroCount, durations]);

  const switchMode = useCallback((newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(durations[newMode]);
  }, [durations]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(durations[mode]);
  }, [mode, durations]);

  useEffect(() => {
    setTimeLeft(durations[mode]);
  }, [settings?.pomodoroMinutes, settings?.shortBreakMinutes, settings?.longBreakMinutes]);

  return {
    mode,
    timeLeft,
    isRunning,
    progress,
    totalTime,
    pomodoroCount,
    start,
    pause,
    skip,
    switchMode,
    reset
  };
};
