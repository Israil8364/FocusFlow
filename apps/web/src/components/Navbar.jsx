import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { User, Settings, LogOut, ChevronRight } from 'lucide-react';
import { LogoMark } from './Logo.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import supabase from '@/lib/supabaseClient';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dropdownMenuRef = useRef(null);

  useGSAP(() => {
    if (isDropdownOpen) {
      gsap.fromTo(dropdownMenuRef.current, 
        { 
          opacity: 0, 
          y: -10,
          scale: 0.95
        }, 
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.3,
          ease: "back.out(1.7)"
        }
      );
    }
  }, [isDropdownOpen]);

  const navbarRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from(".gsap-nav-logo", { x: -20, opacity: 0, duration: 0.8, ease: "power3.out" })
      .from(".gsap-nav-user", { x: 20, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.8");
  }, { scope: navbarRef });

  const avatarUrl = currentUser?.avatar 
    ? currentUser.avatar.startsWith('http') ? currentUser.avatar : supabase.storage.from('avatars').getPublicUrl(currentUser.avatar).data.publicUrl
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.id || 'default'}&backgroundColor=f0ede8`;

  return (
    <header ref={navbarRef} className="sticky top-0 z-40 h-[64px] bg-[var(--bg)] border-b border-[var(--border)] flex items-center justify-between px-4 lg:px-8 transition-colors duration-200">
      <div className="flex items-center gap-4 gsap-nav-logo">
        
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center">
            <LogoMark size={32} className="text-[var(--text-primary)]" />
          </div>
          <span className="font-extrabold text-[18px] text-[var(--text-primary)] tracking-tight">FocusFlow</span>
        </Link>
      </div>
      
      <div className="flex items-center gap-4 gsap-nav-user">
        <div id="navbar-timer-portal-target" className="hidden sm:block"></div>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => {
              if (window.innerWidth < 768) {
                navigate('/profile');
              } else {
                setIsDropdownOpen(!isDropdownOpen);
              }
            }}
            className="w-10 h-10 rounded-[var(--radius-circle)] border-2 border-[var(--border)] overflow-hidden bg-[var(--card)] shrink-0 cursor-pointer hover:border-[var(--text-muted)] transition-colors duration-200"
          >
            <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
          </button>

          {isDropdownOpen && (
            <div ref={dropdownMenuRef} className="absolute right-0 mt-2 w-48 bg-[var(--card)] rounded-[var(--radius-md)] shadow-neu border border-[var(--border)] py-2 z-50 origin-top-right">
              <div className="px-4 py-2 border-b border-[var(--border)] mb-2">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{currentUser?.name || 'User'}</p>
                <p className="text-xs text-[var(--text-muted)] truncate">{currentUser?.email}</p>
              </div>
              <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg)] transition-colors" onClick={() => setIsDropdownOpen(false)}>
                <User className="w-4 h-4" /> Profile
              </Link>
              <Link to="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg)] transition-colors" onClick={() => setIsDropdownOpen(false)}>
                <Settings className="w-4 h-4" /> Settings
              </Link>
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-tomato hover:bg-[var(--bg)] transition-colors text-left font-medium">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>    </header>
  );
};

export default Navbar;
