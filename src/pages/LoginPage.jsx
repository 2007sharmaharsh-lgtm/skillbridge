import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ROLES } from '../constants';
import { isFirebaseConfigured } from '../services/firebase';
import {
  GraduationCap,
  Briefcase,
  Building2,
  AlertCircle,
  Sparkles,
  Info,
  ShieldCheck,
  Zap,
  ArrowRight,
  Lock,
  Mail,
  User,
  CheckCircle,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import BackgroundEffects from '../components/BackgroundEffects';
import HeroEcosystem3D from '../components/HeroEcosystem3D';
import TiltCard from '../components/TiltCard';
import ThemeToggle from '../components/ThemeToggle';

export default function LoginPage() {
  const {
    loginWithGoogle,
    loginWithEmail,
    registerUser,
    loginAsGuest,
    assignRole,
    currentUser,
    needsRoleSelection,
    loading,
  } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLES.STUDENT);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectToDashboard = (role) => {
    switch (role) {
      case ROLES.STUDENT:
        navigate('/student/dashboard');
        break;
      case ROLES.RECRUITER:
        navigate('/recruiter/dashboard');
        break;
      case ROLES.ACADEMICIAN:
        navigate('/academician/dashboard');
        break;
      case ROLES.INSTITUTION_ADMIN:
        navigate('/institution/dashboard');
        break;
      default:
        navigate('/student/dashboard');
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      if (authMode === 'login') {
        const user = await loginWithEmail(email, password);
        redirectToDashboard(user.role || ROLES.STUDENT);
      } else {
        if (!fullName.trim()) {
          throw new Error('Please enter your full name.');
        }
        const user = await registerUser(email, password, fullName, selectedRole);
        redirectToDashboard(selectedRole);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleSelection = async (roleToAssign) => {
    setIsSubmitting(true);
    setError('');
    try {
      await assignRole(roleToAssign);
      redirectToDashboard(roleToAssign);
    } catch (err) {
      setError(err.message || 'Failed to select role.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const user = await loginWithGoogle();
      if (user?.role) {
        redirectToDashboard(user.role);
      }
    } catch (err) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestLogin = async (role) => {
    setIsSubmitting(true);
    setError('');
    try {
      await loginAsGuest(role);
      redirectToDashboard(role);
    } catch (err) {
      setError(err.message || 'Guest login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || isSubmitting) {
    return <LoadingSpinner text="Authenticating Credentials & Telemetry..." />;
  }

  // If user signed in with Google for the first time and needs to pick a role
  if (needsRoleSelection) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backgroundColor: 'var(--bg-cosmos)', position: 'relative' }}>
        <BackgroundEffects />
        <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 50 }}>
          <ThemeToggle showLabel={true} />
        </div>
        <TiltCard maxTilt={8} scale={1.01} glare={true} style={{ maxWidth: '540px', width: '100%', zIndex: 1 }}>
          <div className="card" style={{ textAlign: 'center', padding: '36px 30px', border: '1px solid var(--border-glow)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              border: '2px solid var(--border-color)',
              boxShadow: '0 0 20px var(--primary-glow)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px'
            }}>
              <ShieldCheck size={28} />
            </div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '8px', color: 'var(--text-main)' }}>Select Your Platform Persona</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Welcome, <strong style={{ color: 'var(--text-main)' }}>{currentUser?.name || currentUser?.displayName || 'User'}</strong>! Assign your role to initiate tailored telemetry.
            </p>

            {error && (
              <div style={{ padding: '12px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid var(--danger-glow)', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => handleRoleSelection(ROLES.STUDENT)}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '14px 18px', textAlign: 'left', borderRadius: '12px' }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '14px', flexShrink: 0 }}>
                  <GraduationCap size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>Student</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Build skills, find internships & get placed</div>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelection(ROLES.RECRUITER)}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '14px 18px', textAlign: 'left', borderRadius: '12px' }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--purple-light)', color: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '14px', flexShrink: 0 }}>
                  <Briefcase size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>Recruiter / Industry</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Post job opportunities & discover matched candidates</div>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelection(ROLES.INSTITUTION_ADMIN)}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '14px 18px', textAlign: 'left', borderRadius: '12px' }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '14px', flexShrink: 0 }}>
                  <Building2 size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>Academic Institution</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monitor student employability & curriculum gaps</div>
                </div>
              </button>
            </div>
          </div>
        </TiltCard>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(16px, 3vw, 32px) clamp(12px, 3vw, 20px)',
      backgroundColor: 'var(--bg-cosmos)',
      position: 'relative',
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden'
    }}>
      <BackgroundEffects />

      {/* Top Floating Theme Switcher Setting */}
      <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 50 }}>
        <ThemeToggle showLabel={false} />
      </div>

      {/* Spatial Dual-Panel Container */}
      <div style={{
        maxWidth: '1100px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 310px), 1fr))',
        gap: 'clamp(16px, 3vw, 32px)',
        alignItems: 'center',
        zIndex: 1,
      }}>
        {/* Left Side: 3D Spatial Mission Showcase */}
        <div style={{
          padding: 'clamp(12px, 2vw, 24px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'left'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 14px',
            borderRadius: '9999px',
            backgroundColor: 'var(--primary-light)',
            border: '1px solid var(--border-color)',
            color: 'var(--primary)',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '16px',
            width: 'fit-content',
            maxWidth: '100%'
          }}>
            <Sparkles size={14} /> SIH26044 Secure Portal
          </div>

          <h1 style={{
            fontSize: 'clamp(1.7rem, 3.5vw, 2.8rem)',
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: '14px',
            color: 'var(--text-main)'
          }}>
            Connecting Academic Potential With{' '}
            <span style={{
              background: 'var(--primary-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Industrial Opportunity
            </span>
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '20px' }}>
            Enter the central collaboration hub for AI-driven skill mapping, real-time curriculum gap diagnostics, and automated candidate compatibility matching.
          </p>

          {/* Mini 3D Preview Widget */}
          <div style={{
            background: 'var(--bg-glass)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '12px',
            boxShadow: 'var(--shadow-md)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ height: '180px' }}>
              <HeroEcosystem3D height={180} />
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Cockpit */}
        <TiltCard maxTilt={5} scale={1.008} glare={true}>
          <div className="card" style={{
            padding: 'clamp(20px, 3vw, 32px)',
            border: '1px solid var(--border-glow)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--btn-primary-text, #060709)',
                fontWeight: 800,
                fontSize: '1.3rem',
                margin: '0 auto 10px',
                boxShadow: '0 0 20px var(--primary-glow)',
                border: '1px solid rgba(255, 255, 255, 0.4)'
              }}>
                S
              </div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '4px', color: 'var(--text-main)' }}>
                {authMode === 'login' ? 'Sign In to Skill Connect' : 'Create New Account'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                {authMode === 'login'
                  ? 'Access your personalized dashboard and opportunities'
                  : 'Join the unified Academia-Industry platform'}
              </p>
            </div>

            {/* Auth Mode Toggle Tabs */}
            <div style={{
              display: 'flex',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '10px',
              padding: '4px',
              marginBottom: '18px',
              border: '1px solid var(--border-color)'
            }}>
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setError(''); }}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: authMode === 'login' ? 'var(--primary)' : 'transparent',
                  color: authMode === 'login' ? '#ffffff' : 'var(--text-muted)',
                  transition: 'all 0.2s ease'
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setError(''); }}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: authMode === 'register' ? 'var(--primary)' : 'transparent',
                  color: authMode === 'register' ? '#ffffff' : 'var(--text-muted)',
                  transition: 'all 0.2s ease'
                }}
              >
                Register / Sign Up
              </button>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid var(--danger-glow)', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={15} /> {error}
              </div>
            )}

            {/* Standard Email & Password Form */}
            <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
              {authMode === 'register' && (
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Aarav Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      style={{ paddingLeft: '38px', borderRadius: '8px', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    className="form-input"
                    placeholder="name@college.edu or name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ paddingLeft: '38px', borderRadius: '8px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    style={{ paddingLeft: '38px', borderRadius: '8px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>I Am Registering As:</label>
                  <select
                    className="form-select"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                  >
                    <option value={ROLES.STUDENT}>Student</option>
                    <option value={ROLES.RECRUITER}>Recruiter / Industry Partner</option>
                    <option value={ROLES.INSTITUTION_ADMIN}>Institution / T&P Cell Admin</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', borderRadius: '10px', padding: '11px', marginTop: '4px', fontSize: '0.9rem' }}
              >
                {authMode === 'login' ? 'Sign In with Email' : 'Create Account'} <ArrowRight size={16} />
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0', gap: '10px' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                Or Continue With
              </span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
            </div>

            {/* Google Authentication Button */}
            <button
              onClick={handleGoogleLogin}
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '0.85rem',
                marginBottom: '14px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
              </svg>
              Google Workspace
            </button>

            {/* Instant Demo Personas */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '8px', textAlign: 'center' }}>
                ⚡ Instant Demo Personas (1-Click Test)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                <button
                  onClick={() => handleGuestLogin(ROLES.STUDENT)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '6px 4px', borderRadius: '8px', justifyContent: 'center' }}
                >
                  <GraduationCap size={13} style={{ color: 'var(--primary)' }} /> Student
                </button>
                <button
                  onClick={() => handleGuestLogin(ROLES.RECRUITER)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '6px 4px', borderRadius: '8px', justifyContent: 'center' }}
                >
                  <Briefcase size={13} style={{ color: 'var(--purple)' }} /> Recruiter
                </button>
                <button
                  onClick={() => handleGuestLogin(ROLES.INSTITUTION_ADMIN)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '6px 4px', borderRadius: '8px', justifyContent: 'center' }}
                >
                  <Building2 size={13} style={{ color: 'var(--success)' }} /> Academia
                </button>
              </div>
            </div>

          </div>
        </TiltCard>
      </div>
    </div>
  );
}
