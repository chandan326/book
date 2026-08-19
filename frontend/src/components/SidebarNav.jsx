import React, { useRef, memo } from 'react';
import { 
  BookOpen, LayoutDashboard, PlusCircle, Sparkles, Library, Search, 
  MapPin, ShieldCheck, LogOut, LogIn, AlertCircle, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './SidebarNav.css';

function SidebarNav({ activePage, setActivePage, isCollapsed, setIsCollapsed, openAuthModal }) {
  const { user, logout } = useAuth();
  const isAdmin = user && (user.role === 'Super Admin' || user.role === 'Admin');
  const hoverTimerRef = useRef(null);

  const handleNavClick = (page) => {
    setActivePage(page);
  };

  // Debounced hover handlers for ultra-smooth 60fps/120fps sidebar animation without jitter
  const handleMouseEnter = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setIsCollapsed(false);
    }, 40);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setIsCollapsed(true);
    }, 40);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside 
      className={`saas-sidebar-container ${isCollapsed ? 'collapsed' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div>
        {/* Top Left Attached PANNA.AI Brand Logo Box */}
        <div 
          className="sidebar-top-brand" 
          onClick={() => handleNavClick('landing')} 
          title="PANNA.AI Home"
        >
          <div className="header-logo-badge">
            <span className="panna-logo-letter">P</span>
          </div>
          {!isCollapsed && (
            <div className="brand-text-wrapper">
              <div className="header-brand-title">PANNA.AI</div>
              <div className="header-brand-subtitle">upskill thoughts</div>
            </div>
          )}
        </div>

        <div className="sidebar-nav-list">
          
          {/* 1. Dashboard */}
          {user && (
            <button 
              onClick={() => handleNavClick('dashboard')}
              className={`sidebar-nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
              title={isCollapsed ? "Dashboard" : ""}
            >
              <LayoutDashboard size={18} />
              {!isCollapsed && <span>Dashboard</span>}
            </button>
          )}

          {/* 2. Primary Action Button: Create Book */}
          <button 
            onClick={() => user ? handleNavClick('create') : openAuthModal('signup')}
            className={`sidebar-btn-create ${activePage === 'create' ? 'active' : ''}`}
            title={isCollapsed ? "Create Book" : ""}
          >
            <PlusCircle size={18} />
            {!isCollapsed && <span>Create Book</span>}
          </button>

          {/* 3. AI Studio (Glowing Accent Item) */}
          {user && (
            <button 
              onClick={() => handleNavClick('studio')}
              className={`sidebar-nav-item item-ai-studio ${activePage === 'studio' ? 'active' : ''}`}
              title={isCollapsed ? "AI Studio" : ""}
            >
              <Sparkles size={18} color="#38BDF8" />
              {!isCollapsed && <span>AI Studio</span>}
            </button>
          )}

          {/* 4. Reader Mode */}
          {user && (
            <button 
              onClick={() => handleNavClick('reader')}
              className={`sidebar-nav-item ${activePage === 'reader' ? 'active' : ''}`}
              title={isCollapsed ? "Reader Mode" : ""}
            >
              <Library size={18} />
              {!isCollapsed && <span>Reader Mode</span>}
            </button>
          )}

          {/* 5. Discover */}
          <button 
            onClick={() => handleNavClick('discover')}
            className={`sidebar-nav-item ${activePage === 'discover' ? 'active' : ''}`}
            title={isCollapsed ? "Discover" : ""}
          >
            <Search size={18} />
            {!isCollapsed && <span>Discover</span>}
          </button>

          {/* 6. Nearby Publishers */}
          <button 
            onClick={() => handleNavClick('publishers')}
            className={`sidebar-nav-item ${activePage === 'publishers' ? 'active' : ''}`}
            title={isCollapsed ? "Nearby Publishers" : ""}
          >
            <MapPin size={18} color="#EF4444" />
            {!isCollapsed && <span>Nearby Publishers</span>}
          </button>

          {/* 7. Raise Complaint */}
          <button 
            onClick={() => handleNavClick('complaint')}
            className={`sidebar-nav-item ${activePage === 'complaint' ? 'active' : ''}`}
            title={isCollapsed ? "Raise Complaint" : ""}
          >
            <AlertCircle size={18} color="#F59E0B" />
            {!isCollapsed && <span>Raise Complaint</span>}
          </button>

          {/* 8. Admin Portal (Red Outlined Button) */}
          {isAdmin && (
            <button 
              onClick={() => handleNavClick('admin')}
              className={`sidebar-btn-admin ${activePage === 'admin' ? 'active' : ''}`}
              title={isCollapsed ? "Admin Portal" : ""}
            >
              <ShieldCheck size={18} />
              {!isCollapsed && <span>Admin Portal</span>}
            </button>
          )}

        </div>
      </div>

      {/* Sleek Premium Sidebar Footer User Profile / Login Bar */}
      <div className="sidebar-footer-user">
        {user ? (
          <div className="user-profile-badge-row" title={`${user.full_name || 'User'} (${user.role})`}>
            <div className="user-avatar-circle">
              {getInitials(user.full_name || user.email)}
            </div>

            {!isCollapsed && (
              <div className="user-profile-details">
                <div className="user-name-singleline">{user.full_name || 'Author'}</div>
                <div className={`user-role-badge ${user.role === 'Super Admin' ? 'super-admin' : ''}`}>
                  {user.role}
                </div>
              </div>
            )}

            {!isCollapsed && (
              <button onClick={logout} className="user-logout-icon-btn" title="Sign Out">
                <LogOut size={16} />
              </button>
            )}
          </div>
        ) : (
          <button 
            onClick={() => openAuthModal('signin')} 
            className="sidebar-btn-login-action"
            title={isCollapsed ? "Sign In / Register" : ""}
          >
            <LogIn size={18} />
            {!isCollapsed && <span>Sign In / Register</span>}
          </button>
        )}
      </div>

    </aside>
  );
}

export default memo(SidebarNav);
