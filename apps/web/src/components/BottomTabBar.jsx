import React, { useState, useEffect, useRef } from 'react';
import { LayoutGrid, Clock, History, Settings, BarChart2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { timerState } from '@/utils/timerState';
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const BottomTabBar = () => {
  const location = useLocation();
  const [sessionActive, setSessionActive] = useState(timerState.isRunning);
  const containerRef = useRef(null);

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

  useGSAP(() => {
    gsap.from(containerRef.current, {
      y: 40,
      opacity: 0,
      duration: 1,
      ease: "power4.out",
      delay: 0.5
    });
  }, []);

  return (
    <div className="sm:hidden fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav 
        ref={containerRef}
        className="flex items-center gap-1 p-2 bg-[rgba(245,246,248,0.85)] backdrop-blur-xl border border-[rgba(216,218,222,0.5)] rounded-[32px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] pointer-events-auto"
        style={{ maxWidth: 'min(420px, 95vw)' }}
      >
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          const isTimer = item.label === 'Timer';
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className="relative flex items-center justify-center rounded-[var(--radius-pill)] transition-all duration-300 overflow-hidden"
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                padding: isActive ? '10px 20px' : '10px 14px',
                background: isActive ? 'var(--text-primary)' : 'transparent',
                boxShadow: isActive ? '0 8px 16px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center">
                  <item.icon 
                    size={20} 
                    strokeWidth={isActive ? 2.2 : 1.8} 
                    color={isActive ? 'var(--bg)' : 'var(--text-muted)'} 
                    style={{ transition: 'all 300ms cubic-bezier(0.16,1,0.3,1)' }}
                  />
                  {isTimer && sessionActive && (
                    <span 
                      className="absolute bg-[var(--accent)] rounded-full animate-pulse"
                      style={{ width: '6px', height: '6px', top: '-1px', right: '-1px', boxShadow: '0 0 8px var(--accent)' }}
                    />
                  )}
                </div>
                {isActive && (
                  <span 
                    className="font-bold text-[var(--bg)]"
                    style={{
                      fontSize: '12px',
                      fontFamily: 'Inter, sans-serif',
                      letterSpacing: '-0.01em',
                      animation: 'fadeIn 0.3s ease-out'
                    }}
                  >
                    {item.label}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-4px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default BottomTabBar;