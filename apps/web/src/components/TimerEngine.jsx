
import React from 'react';
import { Play, Pause, SkipForward } from 'lucide-react';
import { formatTime } from '@/utils/formatTime';

const TimerEngine = ({ 
  mode, 
  timeLeft, 
  isRunning, 
  progress, 
  onStart, 
  onPause, 
  onSkip, 
  onModeChange 
}) => {
  const modes = [
    { id: 'pomodoro', label: 'Pomodoro' },
    { id: 'shortBreak', label: 'Short Break' },
    { id: 'longBreak', label: 'Long Break' }
  ];

  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <div className="flex gap-2 mb-10 p-1 rounded-pill bg-card shadow-neumorphic">
        {modes.map(m => (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            className={`px-5 py-2 rounded-pill text-body transition-all duration-250 ${
              mode === m.id
                ? 'shadow-neumorphic-pressed text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="relative w-64 h-64 rounded-full shadow-neumorphic flex flex-col items-center justify-center bg-card mb-12">
        <div className="absolute top-[25%] w-2.5 h-2.5 bg-[#E53935] rounded-full shadow-[0_0_8px_rgba(229,57,53,0.6)]"></div>
        
        <div className="text-[22px] font-bold mt-4 tracking-wide text-foreground">
          {mode === 'pomodoro' ? 'Focus' : 'Break'} {formatTime(timeLeft)}
        </div>

        <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none">
          <circle
            cx="128"
            cy="128"
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-muted opacity-30"
          />
          <circle
            cx="128"
            cy="128"
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-muted transition-all duration-1000 ease-linear"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={isRunning ? onPause : onStart}
          className="flex items-center justify-center w-32 h-10 rounded-20 bg-[#111111] text-white shadow-floating hover:opacity-90 transition-all duration-250 active:scale-95"
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              <span className="font-medium text-body">Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              <span className="font-medium text-body">Start</span>
            </>
          )}
        </button>
        
        <button
          onClick={onSkip}
          className="flex items-center justify-center px-6 h-10 rounded-20 text-muted-foreground hover:text-foreground transition-all duration-250 active:scale-95"
        >
          <SkipForward className="w-4 h-4 mr-2" />
          <span className="font-medium text-body">Skip</span>
        </button>
      </div>
    </div>
  );
};

export default TimerEngine;
