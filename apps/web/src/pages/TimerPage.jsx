
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Play, Pause, SkipForward, History, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import NeuomorphicTimerRing from '@/components/NeuomorphicTimerRing.jsx';
import { formatTime } from '@/utils/formatTime';
import { useTimerContext } from '@/contexts/TimerContext.jsx';

const TimerPage = () => {
  const { mode, setMode, timeLeft, isRunning, setIsRunning, duration, modes, skipSession } = useTimerContext();

  const toggleTimer = useCallback(() => {
    setIsRunning(prev => !prev);
  }, [setIsRunning]);

  const skipTimer = useCallback(() => {
    skipSession();
  }, [skipSession]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        toggleTimer();
      } else if (e.key === 's' || e.key === 'S') {
        skipTimer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTimer, skipTimer]);

  const progress = ((duration - timeLeft) / duration) * 100;

  return (
    <>
      <Helmet>
        <title>Timer - FocusFlow</title>
      </Helmet>
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
        
        <div className="flex gap-2 md:gap-4 mb-12 p-1.5 bg-[var(--card)] rounded-[var(--radius-pill)] shadow-neu-sm">
          {modes.map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-4 md:px-6 py-2 rounded-[var(--radius-pill)] text-sm md:text-base font-medium transition-all duration-200 ${
                mode === m.id 
                  ? 'bg-[var(--text-primary)] text-[var(--bg)] shadow-md' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="mb-16">
          <NeuomorphicTimerRing 
            progress={progress} 
            time={formatTime(timeLeft)} 
            mode={mode} 
            isRunning={isRunning} 
          />
        </div>

        <div className="flex flex-col items-center gap-6 w-full max-w-xs">
          <button
            onClick={toggleTimer}
            className="w-full h-[56px] rounded-[var(--radius-pill)] bg-[var(--text-primary)] text-[var(--bg)] text-lg font-medium shadow-neu hover:-translate-y-1 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isRunning ? 'Pause Session' : 'Start Session'}
          </button>
          
          <button
            onClick={skipTimer}
            className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium transition-colors duration-200 px-6 py-2"
          >
            Skip <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-4 mt-8 items-center justify-center">
             <Link to="/history" className="flex items-center gap-2 px-4 py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm font-medium transition-colors"><History className="w-4 h-4" /> History</Link>
             <Link to="/analytics" className="flex items-center gap-2 px-4 py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm font-medium transition-colors"><BarChart2 className="w-4 h-4" /> Analytics</Link>
        </div>

        <div className="mt-12 text-center text-[var(--text-muted)] text-sm">
          <p>Press <kbd className="px-2 py-1 bg-[var(--card)] rounded border border-[var(--border)] shadow-sm mx-1">Space</kbd> to pause</p>
          <p className="mt-2">Press <kbd className="px-2 py-1 bg-[var(--card)] rounded border border-[var(--border)] shadow-sm mx-1">S</kbd> to skip</p>
        </div>

      </div>
    </>
  );
};

export default TimerPage;
