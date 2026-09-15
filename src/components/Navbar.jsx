import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ROLES } from '../constants';
import {
  LogOut,
  User,
  Sparkles,
  Building2,
  GraduationCap,
  Briefcase,
  Radio,
  Menu,
  X,
  LayoutDashboard,
  Bookmark,
  FileCheck,
  PlusCircle,
  Users,
  BarChart3,
  TrendingUp,
  Building,
  Zap,
  MessageSquare,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import NotificationDropdown from './NotificationDropdown';
import ChatModal from './ChatModal';
import { getTotalUnreadChatCount } from '../services/chatService';

export default function Navbar() {
  const { currentUser, userRole, logout, switchPersona, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadChat, setUnreadChat] = useState(0);

  useEffect(() => {
    const updateUnread = () => {
      const count = getTotalUnreadChatCount(currentUser?.uid || 'student_1');
      setUnreadChat(count);
    };
    updateUnread();
    const interval = setInterval(updateUnread, 4000);
    return () => clearInterval(interval);
  }, [currentUser?.uid]);

  // Prevent background scroll when mobile navigation drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case ROLES.STUDENT:
        return 'Student Persona';
      case ROLES.RECRUITER:
        return 'Recruiter / Industry';
      case ROLES.ACADEMICIAN:
        return 'Faculty / Academician';
      case ROLES.INSTITUTION_ADMIN:
        return 'Academia Admin';
      default:
        return 'Guest Evaluator';
    }
  };

  const getRoleColor = () => {
    switch (userRole) {
      case ROLES.STUDENT:
        return 'var(--primary)';
      case ROLES.RECRUITER:
        return 'var(--purple)';
      case ROLES.ACADEMICIAN:
        return '#f59e0b';
      case ROLES.INSTITUTION_ADMIN:
        return 'var(--success)';
      default:
        return 'var(--text-muted)';
    }
  };

  const mobileNavLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '11px 14px',
    borderRadius: 'var(--border-radius)',
    fontSize: '0.9rem',
    fontWeight: isActive ? 700 : 500,
    color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
    background: isActive ? 'var(--primary-light)' : 'transparent',
    border: isActive ? '1px solid var(--border-glow)' : '1px solid transparent',
    boxShadow: isActive ? '0 0 14px var(--primary-glow)' : 'none',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  });

  return (
    <>
      <header className="top-navbar">
        {/* Brand Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px var(--primary-glow)',
              border: '1px solid var(--border-glow)',
              background: 'var(--bg-card)',
              flexShrink: 0
            }}>
              <img src="/favicon.png" alt="Skill Connect" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                color: 'var(--text-main)',
                letterSpacing: '-0.01em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                Skill Connect <span style={{ fontSize: '0.66rem', padding: '1px 5px', borderRadius: '4px', background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--border-color)' }}>SIH26044</span>
              </div>
              <div className="navbar-subtitle" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.01em' }}>
                Academia–Industry Collaboration Platform
              </div>
            </div>
          </Link>
        </div>

        {/* Desktop Controls (>= 1025px) */}
        <div className="desktop-navbar-controls" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Quick Demo Persona Switcher Bar */}
          {isAuthenticated && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--bg-glass)',
              padding: '4px 10px',
              borderRadius: '9999px',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', paddingRight: '4px' }}>
                <Radio size={13} style={{ color: 'var(--primary)', animation: 'beaconPulse 1.8s infinite' }} /> Persona:
              </span>
              <button
                className={`btn btn-sm ${userRole === ROLES.STUDENT ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '3px 10px', fontSize: '0.72rem', borderRadius: '9999px' }}
                onClick={() => { switchPersona(ROLES.STUDENT); navigate('/student/dashboard'); }}
                title="Switch to Demo Student"
              >
                <GraduationCap size={13} /> Student
              </button>
              <button
                className={`btn btn-sm ${userRole === ROLES.RECRUITER ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '3px 10px', fontSize: '0.72rem', borderRadius: '9999px' }}
                onClick={() => { switchPersona(ROLES.RECRUITER); navigate('/recruiter/dashboard'); }}
                title="Switch to Demo Recruiter"
              >
                <Briefcase size={13} /> Recruiter
              </button>
              <button
                className={`btn btn-sm ${userRole === ROLES.ACADEMICIAN ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '3px 10px', fontSize: '0.72rem', borderRadius: '9999px' }}
                onClick={() => { switchPersona(ROLES.ACADEMICIAN); navigate('/academician/dashboard'); }}
                title="Switch to Demo Faculty / Academician"
              >
                <GraduationCap size={13} style={{ color: '#f59e0b' }} /> Faculty
              </button>
              <button
                className={`btn btn-sm ${userRole === ROLES.INSTITUTION_ADMIN ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '3px 10px', fontSize: '0.72rem', borderRadius: '9999px' }}
                onClick={() => { switchPersona(ROLES.INSTITUTION_ADMIN); navigate('/institution/dashboard'); }}
                title="Switch to Demo Institution Admin"
              >
                <Building2 size={13} /> Academia
              </button>
            </div>
          )}

          {/* Setting: Theme Switcher Toggle */}
          <ThemeToggle showLabel={false} />

          {/* In-App Notifications & Email Dispatches */}
          <NotificationDropdown />

          {/* Real-Time Mentorship & Recruiter Chat Trigger */}
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            aria-label="Direct Mentorship & Recruiter Chat"
            title="Open Mentorship & Recruiter Chat"
            style={{
              position: 'relative',
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: chatOpen ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-glass)',
              border: chatOpen ? '1px solid var(--primary)' : '1px solid var(--border-color)',
              color: chatOpen ? 'var(--primary)' : 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <MessageSquare size={18} />
            {unreadChat > 0 && (
              <span style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                borderRadius: '9999px',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '1px 5px',
                minWidth: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px rgba(59, 130, 246, 0.7)',
              }}>
                {unreadChat}
              </span>
            )}
          </button>

          {/* User Identity & Actions */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'var(--bg-glass)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: getRoleColor(),
                  border: `2px solid ${getRoleColor()}`,
                  boxShadow: `0 0 14px ${getRoleColor()}44`
                }}>
                  {currentUser?.photoURL ? (
                    <img src={currentUser.photoURL} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={19} />
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>
                    {currentUser?.name || 'Authorized User'}
                  </div>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    color: getRoleColor(),
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase'
                  }}>
                    {getRoleLabel()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Sign Out"
                style={{
                  color: 'var(--danger)',
                  borderColor: 'var(--border-color)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'var(--danger-light)'
                }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm" style={{ padding: '8px 18px', borderRadius: '9999px' }}>
              Sign In Portal
            </Link>
          )}
        </div>

        {/* Mobile & Tablet Controls (< 1025px) */}
        <div className="mobile-navbar-controls" style={{ display: 'none', alignItems: 'center', gap: '8px' }}>
          <ThemeToggle showLabel={false} />
          <NotificationDropdown />
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            aria-label="Direct Mentorship & Recruiter Chat"
            style={{
              position: 'relative',
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: chatOpen ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-glass)',
              border: chatOpen ? '1px solid var(--primary)' : '1px solid var(--border-color)',
              color: chatOpen ? 'var(--primary)' : 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <MessageSquare size={18} />
            {unreadChat > 0 && (
              <span style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                borderRadius: '9999px',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '1px 5px',
                minWidth: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {unreadChat}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle Navigation Menu"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-glass)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s ease',
            }}
          >
            {mobileMenuOpen ? <X size={20} style={{ color: 'var(--primary)' }} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-Over Navigation Backdrop */}
      <div
        className={`mobile-nav-backdrop ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Slide-Over Navigation Drawer */}
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px var(--primary-glow)',
              border: '1px solid var(--border-glow)',
              background: 'var(--bg-card)'
            }}>
              <img src="/favicon.png" alt="Skill Connect" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
                Skill Connect
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Navigation Hub</div>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="mobile-nav-content">
          {/* User Profile Card */}
          {isAuthenticated ? (
            <div style={{
              padding: '14px',
              borderRadius: 'var(--border-radius)',
              backgroundColor: 'var(--bg-glass)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'var(--bg-card)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: getRoleColor(),
                border: `2px solid ${getRoleColor()}`,
                boxShadow: `0 0 12px ${getRoleColor()}33`,
                flexShrink: 0
              }}>
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={20} />
                )}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser?.name || 'Authorized User'}
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: getRoleColor(),
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}>
                  {getRoleLabel()}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ width: '100%', borderRadius: '10px' }}
              >
                Sign In to Platform
              </Link>
            </div>
          )}

          {/* Persona Switcher Quick Bar */}
          {isAuthenticated && (
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Radio size={12} style={{ color: 'var(--primary)', animation: 'beaconPulse 1.8s infinite' }} /> Switch Demo Persona
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                <button
                  className={`btn btn-sm ${userRole === ROLES.STUDENT ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 4px', fontSize: '0.7rem', borderRadius: '8px', flexDirection: 'column', gap: '3px', height: 'auto' }}
                  onClick={() => { switchPersona(ROLES.STUDENT); setMobileMenuOpen(false); navigate('/student/dashboard'); }}
                >
                  <GraduationCap size={15} /> Student
                </button>
                <button
                  className={`btn btn-sm ${userRole === ROLES.RECRUITER ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 4px', fontSize: '0.7rem', borderRadius: '8px', flexDirection: 'column', gap: '3px', height: 'auto' }}
                  onClick={() => { switchPersona(ROLES.RECRUITER); setMobileMenuOpen(false); navigate('/recruiter/dashboard'); }}
                >
                  <Briefcase size={15} /> Recruiter
                </button>
                <button
                  className={`btn btn-sm ${userRole === ROLES.INSTITUTION_ADMIN ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 4px', fontSize: '0.7rem', borderRadius: '8px', flexDirection: 'column', gap: '3px', height: 'auto' }}
                  onClick={() => { switchPersona(ROLES.INSTITUTION_ADMIN); setMobileMenuOpen(false); navigate('/institution/dashboard'); }}
                >
                  <Building2 size={15} /> Academia
                </button>
              </div>
            </div>
          )}

          {/* Role Navigation Links */}
          {isAuthenticated && (
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: getRoleColor(), textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={12} style={{ color: getRoleColor() }} /> Dashboard Modules
              </div>

              {userRole === ROLES.STUDENT && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <NavLink to="/student/dashboard" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>
                    <LayoutDashboard size={18} /> Dashboard Overview
                  </NavLink>
                  <NavLink to="/student/profile" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>
                    <User size={18} /> Profile & Academics
                  </NavLink>
                  <NavLink to="/student/skills" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>
                    <Sparkles size={18} /> Skill Profiler & Simulator
                  </NavLink>
                  <NavLink to="/student/opportunities" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>
                    <Briefcase size={18} /> Browse Opportunities
                  </NavLink>
                  <NavLink to="/student/applications" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>
                    <FileCheck size={18} /> Track Applications
                  </NavLink>
                  <NavLink to="/student/saved" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>
                    <Bookmark size={18} /> Saved Roles
                  </NavLink>
                </div>
              )}

              {userRole === ROLES.RECRUITER && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <NavLink to="/recruiter/dashboard" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>
                    <LayoutDashboard size={18} /> Talent Dashboard
                  </NavLink>
                  <NavLink to="/recruiter/profile" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>
                    <Building size={18} /> Company Profile
                  </NavLink>
                  <NavLink to="/recruiter/opportunities/create" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>
                    <PlusCircle size={18} /> Post Opportunity
                  </NavLink>
                  <NavLink to="/recruiter/opportunities" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>
                    <Briefcase size={18} /> Manage Postings
                  </NavLink>
                  <NavLink to="/recruiter/applicants" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>
                    <Users size={18} /> Candidates & Applicants
                  </NavLink>
                </div>
              )}

              {userRole === ROLES.INSTITUTION_ADMIN && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <NavLink to="/institution/dashboard" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>
                    <LayoutDashboard size={18} /> Placement Overview
                  </NavLink>
                  <NavLink to="/institution/students" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>
                    <Users size={18} /> Student Directory
                  </NavLink>
                  <NavLink to="/institution/skill-analysis" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>
                    <BarChart3 size={18} /> Skill Gap Analytics
                  </NavLink>
                  <NavLink to="/institution/placements" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>
                    <TrendingUp size={18} /> Placement Tracking
                  </NavLink>
                </div>
              )}
            </div>
          )}

          {/* Quick Home Link */}
          <NavLink to="/" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>
            <Building2 size={18} /> Portal Landing Page
          </NavLink>

          {/* Action Row */}
          {isAuthenticated && (
            <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  color: 'var(--danger)',
                  borderColor: 'var(--border-color)',
                  background: 'var(--danger-light)',
                  borderRadius: '10px',
                  justifyContent: 'center'
                }}
              >
                <LogOut size={16} /> Sign Out Account
              </button>
            </div>
          )}
        </div>

        {/* Drawer Telemetry Footer */}
        <div className="mobile-nav-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              boxShadow: '0 0 8px var(--primary)',
              animation: 'beaconPulse 2s infinite'
            }} />
            <span>SIH26044 SECURE NODE • Cloud Active</span>
          </div>
        </div>
      </div>

      {/* Embedded CSS for responsive navbar toggle display */}
      <style>{`
        @media (max-width: 1024px) {
          .desktop-navbar-controls {
            display: none !important;
          }
          .mobile-navbar-controls {
            display: flex !important;
          }
        }
        @media (max-width: 580px) {
          .navbar-subtitle {
            display: none !important;
          }
        }
      `}</style>
      {/* Real-time Mentorship & Recruiter Chat Dialog */}
      <ChatModal isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}

