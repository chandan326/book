import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Sparkles, User, LogOut, ShieldCheck, MapPin, 
  LayoutDashboard, PlusCircle, Library, Search, ChevronDown, Menu, X, Settings 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar({ activePage, setActivePage, openAuthModal }) {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileRef = useRef(null);

  const isAdmin = user && (user.role === 'Super Admin' || user.role === 'Admin');

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (page) => {
    setActivePage(page);
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  };

  const getUserInitials = () => {
    if (!user || !user.full_name) return 'AU';
    const parts = user.full_name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return user.full_name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="navbar-container">
      
      {/* 1. LEFT BRAND SECTION */}
      <div className="navbar-brand" onClick={() => handleNavClick('landing')}>
        <div className="brand-logo-box">
          <BookOpen size={20} />
        </div>
        <div>
          <div className="brand-title">
            PANNA<span className="brand-title-ai">.AI</span>
          </div>
          <div className="brand-subtitle">
            BOOK CREATION & PUBLISHING PLATFORM
          </div>
        </div>
      </div>

      {/* 2. CENTER PRIMARY NAVIGATION */}
      <nav className="navbar-center">
        
        <button 
          onClick={() => handleNavClick('landing')}
          className={`nav-link ${activePage === 'landing' ? 'active' : ''}`}
        >
          <BookOpen size={18} /> Home
        </button>

        {user && (
          <>
            <button 
              onClick={() => handleNavClick('dashboard')}
              className={`nav-link ${activePage === 'dashboard' ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>

            {/* Primary Action Button: Create Book */}
            <button 
              onClick={() => handleNavClick('create')}
              className={`nav-btn-create ${activePage === 'create' ? 'active' : ''}`}
            >
              <PlusCircle size={18} /> Create Book
            </button>

            {/* AI Studio Accent Link */}
            <button 
              onClick={() => handleNavClick('studio')}
              className={`nav-link nav-link-ai ${activePage === 'studio' ? 'active' : ''}`}
            >
              <Sparkles size={18} color="#38BDF8" /> AI Studio
            </button>

            <button 
              onClick={() => handleNavClick('reader')}
              className={`nav-link ${activePage === 'reader' ? 'active' : ''}`}
            >
              <Library size={18} /> Reader Mode
            </button>
          </>
        )}

        <button 
          onClick={() => handleNavClick('discover')}
          className={`nav-link ${activePage === 'discover' ? 'active' : ''}`}
        >
          <Search size={18} /> Discover
        </button>

        <button 
          onClick={() => handleNavClick('publishers')}
          className={`nav-link ${activePage === 'publishers' ? 'active' : ''}`}
        >
          <MapPin size={18} color="#EF4444" /> Nearby Publishers
        </button>

      </nav>

      {/* 3. RIGHT UTILITY / ADMIN / PROFILE SECTION */}
      <div className="navbar-right">

        {/* Admin Portal Button */}
        {isAdmin && (
          <>
            <button 
              onClick={() => handleNavClick('admin')}
              className={`nav-admin-btn ${activePage === 'admin' ? 'active' : ''}`}
            >
              <ShieldCheck size={17} /> Admin Portal
            </button>
            <div className="nav-divider" />
          </>
        )}

        {/* User Profile / Auth State */}
        {user ? (
          <div className="profile-container" ref={profileRef}>
            <div 
              className={`profile-trigger ${isProfileOpen ? 'open' : ''}`}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="profile-avatar">
                {getUserInitials()}
              </div>
              <div className="profile-info">
                <div className="profile-name">{user.full_name || 'Author'}</div>
                <div className={`profile-role ${user.role === 'Super Admin' ? 'super-admin' : ''}`}>
                  {user.role}
                </div>
              </div>
              <ChevronDown size={14} className="profile-chevron" />
            </div>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>{user.full_name}</div>
                  <div className="dropdown-email">{user.email}</div>
                </div>

                <button 
                  onClick={() => handleNavClick('dashboard')}
                  className="dropdown-item"
                >
                  <LayoutDashboard size={16} /> Author Dashboard
                </button>

                <button 
                  onClick={() => handleNavClick('create')}
                  className="dropdown-item"
                >
                  <PlusCircle size={16} /> Create New Manuscript
                </button>

                <button 
                  onClick={() => handleNavClick('reader')}
                  className="dropdown-item"
                >
                  <Library size={16} /> Reading History
                </button>

                <div className="dropdown-divider" />

                <button 
                  onClick={() => { logout(); setIsProfileOpen(false); }}
                  className="dropdown-item danger"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={() => openAuthModal('signin')}
              className="nav-link"
              style={{ height: '38px', padding: '0 12px' }}
            >
              Sign In
            </button>
            <button 
              onClick={() => openAuthModal('signup')}
              className="nav-btn-create"
              style={{ height: '38px', padding: '0 14px' }}
            >
              Get Started
            </button>
          </div>
        )}

      </div>

      {/* 4. MOBILE HAMBURGER TOGGLE */}
      <button 
        className="mobile-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle navigation menu"
      >
        {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* 5. MOBILE MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-drawer open">
          
          <button 
            onClick={() => handleNavClick('landing')}
            className={`nav-link ${activePage === 'landing' ? 'active' : ''}`}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <BookOpen size={18} /> Home
          </button>

          {user && (
            <>
              <button 
                onClick={() => handleNavClick('dashboard')}
                className={`nav-link ${activePage === 'dashboard' ? 'active' : ''}`}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <LayoutDashboard size={18} /> Dashboard
              </button>

              <button 
                onClick={() => handleNavClick('create')}
                className="nav-btn-create"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <PlusCircle size={18} /> Create Book
              </button>

              <button 
                onClick={() => handleNavClick('studio')}
                className={`nav-link nav-link-ai ${activePage === 'studio' ? 'active' : ''}`}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <Sparkles size={18} color="#38BDF8" /> AI Studio
              </button>

              <button 
                onClick={() => handleNavClick('reader')}
                className={`nav-link ${activePage === 'reader' ? 'active' : ''}`}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <Library size={18} /> Reader Mode
              </button>
            </>
          )}

          <button 
            onClick={() => handleNavClick('discover')}
            className={`nav-link ${activePage === 'discover' ? 'active' : ''}`}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <Search size={18} /> Discover
          </button>

          <button 
            onClick={() => handleNavClick('publishers')}
            className={`nav-link ${activePage === 'publishers' ? 'active' : ''}`}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <MapPin size={18} color="#EF4444" /> Nearby Publishers
          </button>

          {isAdmin && (
            <button 
              onClick={() => handleNavClick('admin')}
              className={`nav-admin-btn ${activePage === 'admin' ? 'active' : ''}`}
              style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}
            >
              <ShieldCheck size={18} /> Admin Portal
            </button>
          )}

          {user ? (
            <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                Signed in as {user.full_name} ({user.role})
              </div>
              <button 
                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                className="dropdown-item danger"
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button 
                onClick={() => { openAuthModal('signin'); setIsMobileMenuOpen(false); }}
                className="nav-link"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Sign In
              </button>
              <button 
                onClick={() => { openAuthModal('signup'); setIsMobileMenuOpen(false); }}
                className="nav-btn-create"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Get Started
              </button>
            </div>
          )}

        </div>
      )}

    </header>
  );
}
