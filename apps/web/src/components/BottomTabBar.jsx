import React, { useState, useEffect } from 'react';
import { LayoutGrid, Clock, History, Settings, BarChart2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { timerState } from '@/utils/timerState';

const BottomTabBar = () => {
  const location = useLocation();
  const [sessionActive, setSessionActive] = useState(timerState.isRunning);

  useEffect(() => {
    return timerState.subscribe(setSessionActive);
  }, []);

  const navItems = [
    { icon: LayoutGrid, label: 'Dashboard', path: '/' },
    { icon: Clock, label: 'Timer', path: '/timer' },
    { icon: History, label: 'History', path: '/history' },
    { icon: BarChart2, label: 'Analytics', path: '/analytics' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <nav 
      className="sm:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-2 pb-safe bg-[var(--card)] border-t border-[var(--border)]"
      style={{ height: '64px', boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}
    >
      {navItems.map(item => {
        const isActive = location.pathname === item.path;
        const isTimer = item.label === 'Timer';
        return (
          <Link 
            key={item.path} 
            to={item.path} 
            className="flex-1 flex justify-center items-center h-full"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <div 
              className={`flex flex-col items-center justify-center ${isActive ? 'bg-[var(--text-primary)] rounded-[100px]' : 'bg-transparent'}`}
              style={{
                padding: '6px 16px',
                transition: 'all 200ms cubic-bezier(0.16,1,0.3,1)'
              }}
            >
              <div className="relative mb-1 flex items-center justify-center">
                <item.icon 
                  size={20} 
                  strokeWidth={1.8} 
                  color={isActive ? 'var(--bg)' : 'var(--text-muted)'} 
                  style={{ transition: 'color 200ms cubic-bezier(0.16,1,0.3,1)' }}
                />
                {isTimer && sessionActive && (
                  <span 
                    className="absolute bg-[var(--accent)] rounded-full"
                    style={{ width: '7px', height: '7px', top: '-1px', right: '-3px' }}
                  />
                )}
              </div>
              <span 
                className="font-medium leading-none"
                style={{
                  fontSize: '10px',
                  fontFamily: 'Inter, sans-serif',
                  letterSpacing: '0.02em',
                  color: isActive ? 'var(--bg)' : 'var(--text-muted)',
                  transition: 'color 200ms cubic-bezier(0.16,1,0.3,1)'
                }}
              >
                {item.label}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomTabBar;