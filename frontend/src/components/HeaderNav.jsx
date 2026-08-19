import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, ShieldCheck, ChevronDown, LayoutDashboard, PlusCircle, Library, LogOut, MessageSquarePlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './SidebarNav.css';

export default function HeaderNav({ activePage, setActivePage, openAuthModal }) {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const isAdmin = user && (user.role === 'Super Admin' || user.role === 'Admin');

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUserInitials = () => {
    if (!user || !user.full_name) return 'AU';
    const parts = user.full_name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return user.full_name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="saas-header-container">
      {/* Brand Header Left */}
      <div className="header-brand-box" onClick={() => setActivePage('landing')}>
        <div className="header-logo-badge">
          <BookOpen size={20} />
        </div>
        <div>
          <div className="header-brand-title">
            PANNA<span className="brand-title-ai">.AI</span>
          </div>
          <div className="header-brand-subtitle">
            BOOK CREATION & PUBLISHING PLATFORM
          </div>
        </div>
      </div>

      {/* Right Header Utilities & Profile */}
      <div className="header-right-group">
        {/* Raise Complaint Header Quick Button */}
        <button 
          onClick={() => setActivePage('complaint')} 
          className={`header-complaint-btn ${activePage === 'complaint' ? 'active' : ''}`}
        >
          <MessageSquarePlus size={16} /> Raise Complaint
        </button>

        {isAdmin && (
          <button 
            onClick={() => setActivePage('admin')}
            className={`header-admin-btn ${activePage === 'admin' ? 'active' : ''}`}
          >
            <ShieldCheck size={16} /> Admin Portal
          </button>
        )}

        {user ? (
          <div className="profile-container" ref={profileRef}>
            <div 
              className={`header-profile-trigger ${isProfileOpen ? 'open' : ''}`}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="header-avatar-badge">
                {getUserInitials()}
              </div>
              <div className="header-profile-text">
                <div className="header-user-name">{user.full_name || 'Author'}</div>
                <div className={`header-user-role ${user.role === 'Super Admin' ? 'super-admin' : ''}`}>
                  {user.role}
                </div>
              </div>
              <ChevronDown size={14} className="profile-chevron" />
            </div>

            {isProfileOpen && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>{user.full_name}</div>
                  <div className="dropdown-email">{user.email}</div>
                </div>

                <button onClick={() => { setActivePage('dashboard'); setIsProfileOpen(false); }} className="dropdown-item">
                  <LayoutDashboard size={16} /> Author Dashboard
                </button>
                <button onClick={() => { setActivePage('create'); setIsProfileOpen(false); }} className="dropdown-item">
                  <PlusCircle size={16} /> Create Manuscript
                </button>
                <button onClick={() => { setActivePage('complaint'); setIsProfileOpen(false); }} className="dropdown-item">
                  <MessageSquarePlus size={16} /> Raise Complaint
                </button>

                <div className="dropdown-divider" />

                <button onClick={() => { logout(); setIsProfileOpen(false); }} className="dropdown-item danger">
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => openAuthModal('signin')} className="header-btn-secondary">Sign In</button>
            <button onClick={() => openAuthModal('signup')} className="header-btn-primary">Get Started</button>
          </div>
        )}
      </div>
    </header>
  );
}
