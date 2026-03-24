
import React from 'react';
import NeuomorphicTimerRing from './NeuomorphicTimerRing.jsx';
import { formatTime } from '@/utils/formatTime';

const TimerSection = ({ mode, timeLeft, isRunning, progress, onStart, onPause, onSkip, onModeChange }) => {
  const modes = [
    { id: 'pomodoro', label: 'Pomodoro' },
    { id: 'shortBreak', label: 'Short Break' },
    { id: 'longBreak', label: 'Long Break' }
  ];

  return (
    <div className="w-full max-w-[600px] mx-auto flex flex-col items-center p-4 md:p-6 lg:p-8">
      <div className="flex gap-4 md:gap-8 mb-10 md:mb-14">
        {modes.map(m => (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            className={`text-body font-medium pb-1.5 border-b-2 transition-colors duration-200 ${
              mode === m.id 
                ? 'border-[var(--text-primary)] text-[var(--text-primary)]' 
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <NeuomorphicTimerRing 
        progress={progress} 
        time={formatTime(timeLeft)} 
        mode={mode} 
        isRunning={isRunning} 
      />

      <div className="mt-12 md:mt-16 flex flex-col items-center gap-4 w-full">
        <button
          onClick={isRunning ? onPause : onStart}
          className="w-full max-w-[260px] h-[52px] rounded-[var(--radius-pill)] bg-[var(--text-primary)] text-[var(--card)] text-body font-medium shadow-level-2 hover:-translate-y-[1px] hover:shadow-level-3 transition-all duration-150 ease-out active:scale-95"
        >
          {isRunning ? 'Pause Session' : 'Start Session'}
        </button>
        <button
          onClick={onSkip}
          className="text-body font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-200 px-6 py-2"
        >
          Skip &rarr;
        </button>
      </div>
    </div>
  );
};

export default TimerSection;
