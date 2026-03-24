import React from 'react';
import { Home, Clock, History, BarChart2, Settings, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Clock, label: 'Timer', path: '/timer' },
    { icon: History, label: 'History', path: '/history' },
    { icon: BarChart2, label: 'Analytics', path: '/analytics' },
  ];

  const bottomItems = [
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const renderLinks = (items) => (
    items.map(item => {
      const isActive = location.pathname === item.path;
      return (
        <Link 
          key={item.path} 
          to={item.path} 
          className={`flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] transition-all duration-200 ${
            isActive 
              ? 'bg-[var(--text-primary)] text-[var(--bg)] shadow-neu-sm' 
              : 'text-[var(--text-muted)] hover:bg-[var(--card)] hover:text-[var(--text-primary)]'
          }`}
          title={item.label}
        >
          <item.icon className="w-5 h-5 shrink-0" />
          <span className="hidden lg:block text-body font-medium">{item.label}</span>
        </Link>
      );
    })
  );

  return (
    <aside className="hidden md:flex flex-col justify-between bg-[var(--bg)] border-r border-[var(--border)] transition-all duration-220 ease-[cubic-bezier(0.4,0,0.2,1)] w-[80px] lg:w-[240px] py-6 sticky top-[64px] h-[calc(100vh-64px)] z-30">
      <nav className="flex flex-col gap-2 px-3 lg:px-4">
        {renderLinks(navItems)}
      </nav>
      
      <div className="flex flex-col gap-2 px-3 lg:px-4">
        {renderLinks(bottomItems)}
      </div>
    </aside>
  );
};

export default Sidebar;