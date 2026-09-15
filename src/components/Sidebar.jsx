import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../constants';
import {
  LayoutDashboard,
  User,
  Sparkles,
  Briefcase,
  FileCheck,
  Bookmark,
  PlusCircle,
  Users,
  BarChart3,
  TrendingUp,
  Building,
  Building2,
  Zap,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  Scale,
  Layers,
  Radio,
} from 'lucide-react';

export default function Sidebar() {
  const { userRole, switchPersona } = useAuth();
  const navigate = useNavigate();

  const navItemStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '11px 16px',
    borderRadius: 'var(--border-radius)',
    fontSize: '0.875rem',
    fontWeight: isActive ? 600 : 500,
    color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
    background: isActive ? 'var(--primary-light)' : 'transparent',
    border: isActive ? '1px solid var(--border-glow)' : '1px solid transparent',
    boxShadow: isActive ? '0 0 16px var(--primary-glow)' : 'none',
    textDecoration: 'none',
    transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
    marginBottom: '6px',
    position: 'relative',
  });

  return (
    <aside className="sidebar">
      <div style={{ padding: '24px 16px', flex: 1, overflowY: 'auto' }}>
        {/* STUDENT NAVIGATION */}
        {userRole === ROLES.STUDENT && (
          <div>
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: 'var(--primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '0 12px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Zap size={13} style={{ color: 'var(--primary)' }} /> Student Cockpit
            </div>
            <NavLink to="/student/dashboard" style={navItemStyle}>
              <LayoutDashboard size={18} /> Dashboard Overview
            </NavLink>
            <NavLink to="/student/profile" style={navItemStyle}>
              <User size={18} /> Profile & Portfolio
            </NavLink>
            <NavLink to="/student/skills" style={navItemStyle}>
              <Sparkles size={18} /> Skill Profiler & Mapping
            </NavLink>
            <NavLink to="/student/quiz" style={navItemStyle}>
              <Zap size={18} style={{ color: 'var(--primary)' }} /> Take Skill Quiz / Test
            </NavLink>
            <NavLink to="/student/learning" style={navItemStyle}>
              <GraduationCap size={18} style={{ color: 'var(--purple)' }} /> Industry Learning Hub
            </NavLink>
            <NavLink to="/student/opportunities" style={navItemStyle}>
              <Briefcase size={18} /> Browse Opportunities
            </NavLink>
            <NavLink to="/student/applications" style={navItemStyle}>
              <FileCheck size={18} /> Track Applications
            </NavLink>
            <NavLink to="/student/saved" style={navItemStyle}>
              <Bookmark size={18} /> Saved Roles
            </NavLink>
          </div>
        )}

        {/* ACADEMICIAN NAVIGATION */}
        {userRole === ROLES.ACADEMICIAN && (
          <div>
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: 'var(--primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '0 12px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Zap size={13} style={{ color: 'var(--primary)' }} /> Academician Portal
            </div>
            <NavLink to="/academician/dashboard" style={navItemStyle} end>
              <GraduationCap size={18} /> Faculty Industrial Hub
            </NavLink>
            <NavLink to="/academician/curriculum" style={navItemStyle}>
              <BookOpen size={18} /> Curriculum Collaboration
            </NavLink>
          </div>
        )}

        {/* RECRUITER NAVIGATION */}
        {userRole === ROLES.RECRUITER && (
          <div>
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: 'var(--purple)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '0 12px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Zap size={13} style={{ color: 'var(--purple)' }} /> Talent Command Center
            </div>
            <NavLink to="/recruiter/dashboard" style={navItemStyle}>
              <LayoutDashboard size={18} /> Talent Dashboard
            </NavLink>
            <NavLink to="/recruiter/profile" style={navItemStyle}>
              <Building size={18} /> Company Profile
            </NavLink>
            <NavLink to="/recruiter/opportunities/create" style={navItemStyle}>
              <PlusCircle size={18} /> Post Opportunity
            </NavLink>
            <NavLink to="/recruiter/opportunities" style={navItemStyle}>
              <Briefcase size={18} /> Manage Postings
            </NavLink>
            <NavLink to="/recruiter/applicants" style={navItemStyle}>
              <Users size={18} /> Candidates & Applicants
            </NavLink>
            <NavLink to="/recruiter/curriculum" style={navItemStyle}>
              <BookOpen size={18} /> Review Syllabi & Curriculum
            </NavLink>
          </div>
        )}

        {/* INSTITUTION ADMIN NAVIGATION */}
        {userRole === ROLES.INSTITUTION_ADMIN && (
          <div>
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: 'var(--success)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '0 12px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Zap size={13} style={{ color: 'var(--success)' }} /> Academic Intelligence
            </div>
            <NavLink to="/institution/dashboard" style={navItemStyle}>
              <LayoutDashboard size={18} /> Placement Overview
            </NavLink>
            <NavLink to="/institution/students" style={navItemStyle}>
              <Users size={18} /> Student Directory
            </NavLink>
            <NavLink to="/institution/curriculum" style={navItemStyle}>
              <BookOpen size={18} /> Curriculum Collaboration
            </NavLink>
            <NavLink to="/institution/skill-analysis" style={navItemStyle}>
              <BarChart3 size={18} /> Skill Gap Analytics
            </NavLink>
            <NavLink to="/institution/placements" style={navItemStyle}>
              <TrendingUp size={18} /> Placement Tracking
            </NavLink>
          </div>
        )}

        {/* Global Quick Persona Switcher in Sidebar */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '0 8px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Radio size={12} style={{ color: '#f59e0b', animation: 'beaconPulse 1.8s infinite' }} /> Switch Workspace Portal
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', padding: '0 4px' }}>
            <button
              onClick={async () => { await switchPersona(ROLES.STUDENT); navigate('/student/dashboard'); }}
              className={`btn btn-sm ${userRole === ROLES.STUDENT ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 4px', fontSize: '0.7rem', borderRadius: '8px', justifyContent: 'center', gap: '4px' }}
            >
              <GraduationCap size={13} /> Student
            </button>
            <button
              onClick={async () => { await switchPersona(ROLES.RECRUITER); navigate('/recruiter/dashboard'); }}
              className={`btn btn-sm ${userRole === ROLES.RECRUITER ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 4px', fontSize: '0.7rem', borderRadius: '8px', justifyContent: 'center', gap: '4px' }}
            >
              <Briefcase size={13} /> Recruiter
            </button>
            <button
              onClick={async () => { await switchPersona(ROLES.INSTITUTION_ADMIN); navigate('/institution/dashboard'); }}
              className={`btn btn-sm ${userRole === ROLES.INSTITUTION_ADMIN ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 4px', fontSize: '0.7rem', borderRadius: '8px', justifyContent: 'center', gap: '4px' }}
            >
              <Building2 size={13} /> Academia
            </button>
          </div>
        </div>
      </div>

      {/* Cyber Telemetry Status Beacon Footer */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        background: 'var(--bg-card)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary)',
          boxShadow: '0 0 10px var(--primary)',
          animation: 'beaconPulse 2s infinite'
        }}></div>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>SIH26044 SECURE NODE</div>
          <div style={{ fontSize: '0.68rem' }}>Live Cloud Engine • Match Telemetry Active</div>
        </div>
      </div>
    </aside>
  );
}
