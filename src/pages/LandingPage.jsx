import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ROLES } from '../constants';
import {
  GraduationCap,
  Briefcase,
  Building2,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  Layers,
  Cpu,
  Shield,
  Activity,
  Award,
  ChevronRight,
  Menu,
  X,
  Radio,
} from 'lucide-react';
import HeroEcosystem3D from '../components/HeroEcosystem3D';
import TiltCard from '../components/TiltCard';
import BackgroundEffects from '../components/BackgroundEffects';
import ThemeToggle from '../components/ThemeToggle';

export default function LandingPage() {
  const { switchPersona, loginAsGuest, isAuthenticated, userRole } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleQuickDemo = async (role) => {
    setMobileMenuOpen(false);
    try {
      if (switchPersona) {
        await switchPersona(role);
      } else if (loginAsGuest) {
        await loginAsGuest(role);
      }
      if (role === ROLES.STUDENT) navigate('/student/dashboard');
      else if (role === ROLES.RECRUITER) navigate('/recruiter/dashboard');
      else if (role === ROLES.ACADEMICIAN) navigate('/academician/dashboard');
      else if (role === ROLES.INSTITUTION_ADMIN) navigate('/institution/dashboard');
    } catch (err) {
      console.error('Quick demo error:', err);
      navigate('/login');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-cosmos)', position: 'relative', width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      <BackgroundEffects />

      {/* Top Futuristic Translucent Navigation Bar */}
      <header className="landing-header" style={{
        backgroundColor: 'var(--bg-glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '14px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-sm)',
        width: '100%',
        maxWidth: '100vw',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px var(--primary-glow)',
            border: '1px solid var(--border-glow)',
            background: 'var(--bg-card)',
            flexShrink: 0
          }}>
            <img src="/favicon.png" alt="Skill Connect" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-main)',
              letterSpacing: '-0.01em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              Skill Connect
              <span style={{
                fontSize: '0.65rem',
                padding: '2px 7px',
                borderRadius: '9999px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                border: '1px solid var(--border-color)',
                fontWeight: 700,
                letterSpacing: '0.04em'
              }}>
                SIH26044
              </span>
            </div>
            <p className="landing-subtitle" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, letterSpacing: '0.01em' }}>
              Academia–Industry Collaboration & AI Skill Mapping
            </p>
          </div>
        </div>

        {/* Desktop Header Buttons (>= 1025px) */}
        <div className="desktop-landing-controls" style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <ThemeToggle showLabel={false} />

          {isAuthenticated ? (
            <Link
              to={
                userRole === ROLES.STUDENT
                  ? '/student/dashboard'
                  : userRole === ROLES.RECRUITER
                  ? '/recruiter/dashboard'
                  : '/institution/dashboard'
              }
              className="btn btn-primary"
              style={{ borderRadius: '9999px', padding: '9px 20px' }}
            >
              Enter Command Center <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary" style={{ borderRadius: '9999px', padding: '8px 18px' }}>
                Sign In
              </Link>
              <Link to="/login" className="btn btn-primary" style={{ borderRadius: '9999px', padding: '8px 20px' }}>
                Launch Portal
              </Link>
            </>
          )}
        </div>

        {/* Mobile Header Buttons (< 1025px) */}
        <div className="mobile-landing-controls" style={{ display: 'none', alignItems: 'center', gap: '10px' }}>
          <ThemeToggle showLabel={false} />
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle Navigation Menu"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-glass)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {mobileMenuOpen ? <X size={22} style={{ color: 'var(--primary)' }} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Landing Page Drawer */}
      <div
        className={`mobile-nav-backdrop ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/favicon.png" alt="Skill Connect" style={{ width: '28px', height: '28px' }} />
            <span style={{ fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>Skill Connect</span>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {isAuthenticated ? (
              <Link
                to={
                  userRole === ROLES.STUDENT
                    ? '/student/dashboard'
                    : userRole === ROLES.RECRUITER
                    ? '/recruiter/dashboard'
                    : '/institution/dashboard'
                }
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ width: '100%', borderRadius: '10px' }}
              >
                Enter Command Center <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary"
                  style={{ width: '100%', borderRadius: '10px' }}
                >
                  Sign In / Launch Portal
                </Link>
              </>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '12px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Radio size={13} style={{ animation: 'beaconPulse 1.8s infinite' }} /> Instant Persona Demos:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => handleQuickDemo(ROLES.STUDENT)}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '10px 14px', borderRadius: '10px' }}
              >
                <GraduationCap size={18} style={{ color: 'var(--primary)' }} /> Explore as Student
              </button>
              <button
                onClick={() => handleQuickDemo(ROLES.RECRUITER)}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '10px 14px', borderRadius: '10px' }}
              >
                <Briefcase size={18} style={{ color: 'var(--purple)' }} /> Explore as Recruiter
              </button>
              <button
                onClick={() => handleQuickDemo(ROLES.ACADEMICIAN)}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '10px 14px', borderRadius: '10px' }}
              >
                <GraduationCap size={18} style={{ color: '#f59e0b' }} /> Explore as Faculty
              </button>
              <button
                onClick={() => handleQuickDemo(ROLES.INSTITUTION_ADMIN)}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '10px 14px', borderRadius: '10px' }}
              >
                <Building2 size={18} style={{ color: 'var(--success)' }} /> Explore as Academia
              </button>
            </div>
          </div>
        </div>

        <div className="mobile-nav-footer">
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
            Problem Statement #SIH26044
          </div>
        </div>
      </div>

      {/* Main Hero Container */}
      <main style={{ flex: 1, position: 'relative', zIndex: 1, width: '100%', overflowX: 'hidden' }}>
        <section style={{
          padding: '40px 16px 20px',
          maxWidth: '1280px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative'
        }}>
          {/* SIH Problem Statement Glowing Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '9999px',
            backgroundColor: 'var(--primary-light)',
            border: '1px solid var(--border-color)',
            color: 'var(--primary)',
            fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
            fontWeight: 700,
            marginBottom: '20px',
            boxShadow: '0 0 25px var(--primary-glow)',
            letterSpacing: '0.02em',
            maxWidth: '92%',
          }}>
            <Sparkles size={16} style={{ flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Smart India Hackathon #SIH26044</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(1.9rem, 4.5vw, 3.8rem)',
            fontWeight: 800,
            lineHeight: 1.18,
            marginBottom: '18px',
            color: 'var(--text-main)',
            maxWidth: '1000px',
            margin: '0 auto 18px',
            padding: '0 8px'
          }}>
            Bridging Academic Potential with Industry Need via{' '}
            <span style={{
              background: 'var(--primary-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 35px var(--primary-glow)'
            }}>
              Intelligent 3D Skill Mapping
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(0.92rem, 2vw, 1.15rem)',
            color: 'var(--text-secondary)',
            maxWidth: '820px',
            margin: '0 auto 28px',
            lineHeight: 1.6,
            padding: '0 12px'
          }}>
            A unified spatial ecosystem connecting Students, Academic Institutions, and Enterprise Recruiters.
            Analyze curriculum gaps in real time, calculate instant candidate compatibility scores, and streamline campus placements.
          </p>

          {/* Interactive Ecosystem Flow Pipeline */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            margin: '0 auto 32px',
            maxWidth: '920px',
            padding: '10px 16px',
            backgroundColor: 'var(--bg-glass)',
            borderRadius: '9999px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <GraduationCap size={14} /> ACADEMIA
            </span>
            <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Cpu size={14} /> SKILLS & AI
            </span>
            <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--purple)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Briefcase size={14} /> INDUSTRY
            </span>
            <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Target size={14} /> OPPORTUNITIES
            </span>
            <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Award size={14} /> CAREER GROWTH
            </span>
          </div>

          {/* Central 3D Visual Experience Container */}
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '1180px',
            margin: '0 auto 28px',
            minHeight: '280px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* Desktop-Only Orbiting 3D Skill Cards (Left) */}
            <div className="hero-cards-desktop-left" style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              zIndex: 10,
              pointerEvents: 'none'
            }}>
              <div className="floating-element" style={{ pointerEvents: 'auto' }}>
                <TiltCard maxTilt={15} scale={1.05} glare={false}>
                  <div style={{
                    padding: '8px 16px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-glass)',
                    border: '1px solid var(--border-glow)',
                    boxShadow: 'var(--shadow-md)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backdropFilter: 'blur(12px)'
                  }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }}></span>
                    AI & Machine Learning
                  </div>
                </TiltCard>
              </div>

              <div className="floating-element-delayed" style={{ pointerEvents: 'auto', marginLeft: '25px' }}>
                <TiltCard maxTilt={15} scale={1.05} glare={false}>
                  <div style={{
                    padding: '8px 16px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-glass)',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-md)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: 'var(--purple)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backdropFilter: 'blur(12px)'
                  }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--purple)', boxShadow: '0 0 8px var(--purple)' }}></span>
                    Python & Data Science
                  </div>
                </TiltCard>
              </div>

              <div className="floating-element" style={{ pointerEvents: 'auto' }}>
                <TiltCard maxTilt={15} scale={1.05} glare={false}>
                  <div style={{
                    padding: '8px 16px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-glass)',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-md)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: 'var(--success)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backdropFilter: 'blur(12px)'
                  }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }}></span>
                    Cloud & Cybersecurity
                  </div>
                </TiltCard>
              </div>
            </div>

            {/* Central 3D Ecosystem Canvas */}
            <div style={{ width: '100%', maxWidth: '780px' }}>
              <HeroEcosystem3D height={420} />
            </div>

            {/* Desktop-Only Orbiting 3D Industry Cards (Right) */}
            <div className="hero-cards-desktop-right" style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              zIndex: 10,
              pointerEvents: 'none'
            }}>
              <div className="floating-element-delayed" style={{ pointerEvents: 'auto' }}>
                <TiltCard maxTilt={15} scale={1.05} glare={false}>
                  <div style={{
                    padding: '8px 16px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-glass)',
                    border: '1px solid var(--border-glow)',
                    boxShadow: 'var(--shadow-md)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: 'var(--warning)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backdropFilter: 'blur(12px)'
                  }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)', boxShadow: '0 0 8px var(--warning)' }}></span>
                    AI Research Intern • Recruiting
                  </div>
                </TiltCard>
              </div>

              <div className="floating-element" style={{ pointerEvents: 'auto', marginRight: '25px' }}>
                <TiltCard maxTilt={15} scale={1.05} glare={false}>
                  <div style={{
                    padding: '8px 16px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-glass)',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-md)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backdropFilter: 'blur(12px)'
                  }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }}></span>
                    Software Engineer • 94% Match
                  </div>
                </TiltCard>
              </div>

              <div className="floating-element-delayed" style={{ pointerEvents: 'auto' }}>
                <TiltCard maxTilt={15} scale={1.05} glare={false}>
                  <div style={{
                    padding: '8px 16px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-glass)',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-md)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: 'var(--success)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backdropFilter: 'blur(12px)'
                  }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }}></span>
                    Data Analyst • Verified Campus Offer
                  </div>
                </TiltCard>
              </div>
            </div>

            {/* Mobile/Tablet Adaptive Chip Rail (< 1024px) */}
            <div className="hero-cards-mobile" style={{
              display: 'none',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '16px',
              width: '100%'
            }}>
              <span style={{
                padding: '6px 12px',
                borderRadius: '9999px',
                backgroundColor: 'var(--bg-glass)',
                border: '1px solid var(--border-color)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--primary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
                AI & Machine Learning
              </span>
              <span style={{
                padding: '6px 12px',
                borderRadius: '9999px',
                backgroundColor: 'var(--bg-glass)',
                border: '1px solid var(--border-color)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--purple)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--purple)' }} />
                Python & Data Science
              </span>
              <span style={{
                padding: '6px 12px',
                borderRadius: '9999px',
                backgroundColor: 'var(--bg-glass)',
                border: '1px solid var(--border-color)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--success)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
                Software Engineer (94% Match)
              </span>
            </div>
          </div>

          {/* Autonomous Guest Quick Login Bar */}
          <TiltCard maxTilt={4} scale={1.008} glare={true} style={{ maxWidth: '920px', margin: '0 auto 48px' }}>
            <div className="card" style={{
              padding: '22px 24px',
              textAlign: 'left',
              border: '1px solid var(--border-glow)',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={18} style={{ color: 'var(--primary)' }} /> Quick Autonomous Evaluation / Guest Demo:
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Test any module instantly with pre-populated real-world data
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '12px' }}>
                <button
                  onClick={() => handleQuickDemo(ROLES.STUDENT)}
                  className="btn btn-secondary"
                  style={{ justifyContent: 'flex-start', padding: '12px 16px', textAlign: 'left', borderRadius: '12px' }}
                >
                  <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--primary-light)', marginRight: '10px', flexShrink: 0 }}>
                    <GraduationCap size={20} style={{ color: 'var(--primary)' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>Explore as Student</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Skill mapping & job applications</div>
                  </div>
                </button>

                <button
                  onClick={() => handleQuickDemo(ROLES.RECRUITER)}
                  className="btn btn-secondary"
                  style={{ justifyContent: 'flex-start', padding: '12px 16px', textAlign: 'left', borderRadius: '12px' }}
                >
                  <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--purple-light)', marginRight: '10px', flexShrink: 0 }}>
                    <Briefcase size={20} style={{ color: 'var(--purple)' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>Explore as Recruiter</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Post jobs & match candidates</div>
                  </div>
                </button>

                <button
                  onClick={() => handleQuickDemo(ROLES.ACADEMICIAN)}
                  className="btn btn-secondary"
                  style={{ justifyContent: 'flex-start', padding: '12px 16px', textAlign: 'left', borderRadius: '12px' }}
                >
                  <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', marginRight: '10px', flexShrink: 0 }}>
                    <GraduationCap size={20} style={{ color: '#f59e0b' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>Explore as Faculty</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>FDPs, syllabus review & internships</div>
                  </div>
                </button>

                <button
                  onClick={() => handleQuickDemo(ROLES.INSTITUTION_ADMIN)}
                  className="btn btn-secondary"
                  style={{ justifyContent: 'flex-start', padding: '12px 16px', textAlign: 'left', borderRadius: '12px' }}
                >
                  <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--success-light)', marginRight: '10px', flexShrink: 0 }}>
                    <Building2 size={20} style={{ color: 'var(--success)' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>Explore as Academia</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Skill gap matrix & placement stats</div>
                  </div>
                </button>
              </div>
            </div>
          </TiltCard>
        </section>

        {/* Embedded CSS for Landing Page Responsiveness */}
        <style>{`
          @media (max-width: 1024px) {
            .desktop-landing-controls {
              display: none !important;
            }
            .mobile-landing-controls {
              display: flex !important;
            }
            .hero-cards-desktop-left, .hero-cards-desktop-right {
              display: none !important;
            }
            .hero-cards-mobile {
              display: flex !important;
            }
            .landing-header {
              padding: 12px 16px !important;
            }
          }
          @media (max-width: 600px) {
            .landing-subtitle {
              display: none !important;
            }
          }
        `}</style>


        {/* 3 Pillars Section with Futuristic 3D Tilt Cards */}
        <section style={{
          backgroundColor: 'var(--bg-glass)',
          padding: '80px 24px',
          borderTop: '1px solid var(--border-color)',
          borderBottom: '1px solid var(--border-color)',
          position: 'relative'
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                ARCHITECTURE & CAPABILITIES
              </div>
              <h2 style={{ fontSize: '2.2rem', marginBottom: '14px', color: 'var(--text-main)' }}>
                Three Pillars of the SIH26044 Platform
              </h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto', fontSize: '0.95rem' }}>
                Built to eliminate the misalignment between academic curricula and evolving industrial requirements.
              </p>
            </div>

            <div className="grid-3">
              {/* Student Pillar */}
              <TiltCard maxTilt={8} scale={1.02} glare={true} style={{ height: '100%' }}>
                <div className="card" style={{ height: '100%', borderTop: '3px solid var(--primary)' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--primary-light)',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 0 16px var(--primary-glow)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px'
                  }}>
                    <GraduationCap size={26} />
                  </div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: 'var(--text-main)' }}>For Students</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
                    Map your technical competencies with verified proficiencies, calculate instant match percentages with live industry vacancies, and pinpoint exact skill gaps before applying.
                  </p>
                  <ul style={{ listStyle: 'none', fontSize: '0.84rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle size={16} style={{ color: 'var(--success)' }} /> Automated Skill Gap Calculation
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle size={16} style={{ color: 'var(--success)' }} /> Verified Internship & Placement Board
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle size={16} style={{ color: 'var(--success)' }} /> Real-time Application Status Timeline
                    </li>
                  </ul>
                </div>
              </TiltCard>

              {/* Recruiter Pillar */}
              <TiltCard maxTilt={8} scale={1.02} glare={true} style={{ height: '100%' }}>
                <div className="card" style={{ height: '100%', borderTop: '3px solid var(--purple)' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--purple-light)',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 0 16px var(--purple-glow)',
                    color: 'var(--purple)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px'
                  }}>
                    <Briefcase size={26} />
                  </div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: 'var(--text-main)' }}>For Industry & Recruiters</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
                    Publish vacancies with precise skill requirements. Let our matching engine rank candidates based on competency compatibility, reducing recruitment turnaround times.
                  </p>
                  <ul style={{ listStyle: 'none', fontSize: '0.84rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle size={16} style={{ color: 'var(--success)' }} /> Instant Candidate Compatibility Score
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle size={16} style={{ color: 'var(--success)' }} /> Opportunity Creation & Status Control
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle size={16} style={{ color: 'var(--success)' }} /> Direct Access to Student Talent Pools
                    </li>
                  </ul>
                </div>
              </TiltCard>

              {/* Academia Pillar */}
              <TiltCard maxTilt={8} scale={1.02} glare={true} style={{ height: '100%' }}>
                <div className="card" style={{ height: '100%', borderTop: '3px solid var(--success)' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--success-light)',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 0 16px var(--success-glow)',
                    color: 'var(--success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px'
                  }}>
                    <Building2 size={26} />
                  </div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: 'var(--text-main)' }}>For Academic Institutions</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
                    Compare your student body's skill supply against real-time industry demands. Identify missing curriculum technologies and track college-wide placement conversion rates.
                  </p>
                  <ul style={{ listStyle: 'none', fontSize: '0.84rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle size={16} style={{ color: 'var(--success)' }} /> Curriculum Skill Gap Demand Matrix
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle size={16} style={{ color: 'var(--success)' }} /> Student Directory with Branch & Skill Filters
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle size={16} style={{ color: 'var(--success)' }} /> Placement Funnel Conversion Metrics
                    </li>
                  </ul>
                </div>
              </TiltCard>
            </div>
          </div>
        </section>
      </main>

      {/* Futuristic Cyber Footer */}
      <footer style={{
        marginTop: 'auto',
        backgroundColor: 'var(--bg-glass)',
        borderTop: '1px solid var(--border-color)',
        padding: '28px 24px',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>Smart India Hackathon • Problem Statement #SIH26044 Prototype</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 6px var(--primary)' }}></span>
            Theme Engine: Golden & Black (Dark) • Orange & White (Light)
          </div>
        </div>
      </footer>
    </div>
  );
}
