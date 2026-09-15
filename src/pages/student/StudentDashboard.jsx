import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  getStudentProfile,
  getOpportunities,
  getStudentApplications,
  getSavedOpportunities,
} from '../../services/firestoreService';
import { calculateSkillMatch } from '../../utils/skillMatching';
import OpportunityCard from '../../components/OpportunityCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import SkillConstellation from '../../components/SkillConstellation';
import TiltCard from '../../components/TiltCard';
import ZoomMeetingModal from '../../components/ZoomMeetingModal';
import MockInterviewModal from '../../components/MockInterviewModal';
import {
  Briefcase,
  Sparkles,
  FileCheck,
  Bookmark,
  TrendingUp,
  ArrowRight,
  Target,
  Zap,
  Radio,
  Layers,
  Video,
  BrainCircuit,
  Linkedin,
  Github,
} from 'lucide-react';

export default function StudentDashboard() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeZoomModal, setActiveZoomModal] = useState(null);
  const [showMockModal, setShowMockModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!currentUser) return;
      try {
        const [profData, opps, apps, savedOpps] = await Promise.all([
          getStudentProfile(currentUser.uid),
          getOpportunities(),
          getStudentApplications(currentUser.uid),
          getSavedOpportunities(currentUser.uid),
        ]);
        setProfile(profData);
        setOpportunities(opps);
        setApplications(apps);
        setSaved(savedOpps);
      } catch (err) {
        console.error('Error loading student dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser]);

  if (loading) return <LoadingSpinner text="Connecting to personal career telemetry..." />;

  const studentSkills = profile?.skills || [];

  // Match ranking algorithm
  const opportunitiesWithMatch = opportunities.map(opp => ({
    ...opp,
    match: calculateSkillMatch(studentSkills, opp.requiredSkills, opp.preferredSkills),
  })).sort((a, b) => b.match.matchPercentage - a.match.matchPercentage);

  const topMatches = opportunitiesWithMatch.slice(0, 4);
  const highMatchCount = opportunitiesWithMatch.filter(o => o.match.matchPercentage >= 70).length;

  // Compute average readiness score across postings
  const avgReadiness = opportunitiesWithMatch.length > 0
    ? Math.round(opportunitiesWithMatch.slice(0, 5).reduce((acc, curr) => acc + curr.match.matchPercentage, 0) / Math.min(5, opportunitiesWithMatch.length))
    : 75;

  return (
    <div style={{ position: 'relative' }}>
      {/* Career Cockpit Telemetry Welcome Banner */}
      <TiltCard maxTilt={4} scale={1.006} glare={true} style={{ marginBottom: '28px' }}>
        <div className="card" style={{
          padding: '28px',
          background: 'linear-gradient(135deg, var(--bg-glass-elevated) 0%, var(--bg-card) 100%)',
          border: '1px solid var(--border-glow)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ flex: '1', minWidth: '280px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                <Radio size={14} style={{ animation: 'beaconPulse 1.8s infinite' }} /> Career Cockpit Live
              </div>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--text-main)', marginBottom: '6px', fontWeight: 800 }}>
                Welcome back, {currentUser?.name || 'Student'}! ⚡
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '8px' }}>
                {profile?.collegeName ? `${profile.degree} in ${profile.branch} • ${profile.collegeName}` : 'Map your competencies to activate automated placement ranking.'}
              </p>
              {/* Connected Profiles */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                {profile?.linkedinUrl ? (
                  <a href={profile.linkedinUrl.startsWith('http') ? profile.linkedinUrl : `https://${profile.linkedinUrl}`} target="_blank" rel="noreferrer" className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(10, 102, 194, 0.15)', color: '#60a5fa', borderColor: 'rgba(10, 102, 194, 0.3)', textDecoration: 'none', fontSize: '0.75rem', padding: '3px 8px' }}>
                    <Linkedin size={12} /> LinkedIn Connected
                  </a>
                ) : (
                  <Link to="/student/profile" className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8', textDecoration: 'none', fontSize: '0.75rem', padding: '3px 8px' }}>
                    <Linkedin size={12} /> + Add LinkedIn
                  </Link>
                )}
                {profile?.githubUrl ? (
                  <a href={profile.githubUrl.startsWith('http') ? profile.githubUrl : `https://${profile.githubUrl}`} target="_blank" rel="noreferrer" className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255, 255, 255, 0.08)', color: '#f1f5f9', borderColor: 'rgba(255, 255, 255, 0.2)', textDecoration: 'none', fontSize: '0.75rem', padding: '3px 8px' }}>
                    <Github size={12} /> GitHub Connected
                  </a>
                ) : (
                  <Link to="/student/profile" className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8', textDecoration: 'none', fontSize: '0.75rem', padding: '3px 8px' }}>
                    <Github size={12} /> + Add GitHub
                  </Link>
                )}
              </div>
            </div>

            {/* Circular Readiness Gauge & Quick CTAs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                backgroundColor: 'var(--bg-glass)',
                padding: '10px 18px',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {/* SVG Progress Dial */}
                <div style={{ position: 'relative', width: '56px', height: '56px' }}>
                  <svg width="56" height="56" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="23" fill="none" stroke="var(--border-color)" strokeWidth="5" />
                    <circle
                      cx="28"
                      cy="28"
                      r="23"
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="5"
                      strokeDasharray={144.5}
                      strokeDashoffset={144.5 - (144.5 * avgReadiness) / 100}
                      strokeLinecap="round"
                      transform="rotate(-90 28 28)"
                      style={{ transition: 'stroke-dashoffset 1s ease' }}
                    />
                  </svg>
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: 'var(--text-main)'
                  }}>
                    {avgReadiness}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Career Readiness</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Top 5 Role Compatibility</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setShowMockModal(true)}
                  className="btn btn-secondary"
                  style={{ borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <BrainCircuit size={16} style={{ color: '#38bdf8' }} /> AI Mock Interview
                </button>
                <Link to="/student/skills" className="btn btn-outline" style={{ borderRadius: '10px' }}>
                  <Sparkles size={16} /> Update Skills
                </Link>
                <Link to="/student/opportunities" className="btn btn-primary" style={{ borderRadius: '10px' }}>
                  <Briefcase size={16} /> Explore Open Roles
                </Link>
              </div>
            </div>
          </div>
        </div>
      </TiltCard>

      {/* Live Zoom Interview Scheduled Alert */}
      {(() => {
        const interviewApp = applications.find(a => a.status === 'interview');
        if (!interviewApp) return null;
        const opp = opportunities.find(o => o.id === interviewApp.opportunityId) || {};
        const meetingId = interviewApp.zoomMeetingId || '849 2931 0482';
        const password = interviewApp.zoomPassword || 'SIH26';

        return (
          <div style={{
            backgroundColor: 'rgba(11, 92, 255, 0.1)',
            border: '1px solid rgba(11, 92, 255, 0.4)',
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 10px 30px -10px rgba(11, 92, 255, 0.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                backgroundColor: '#0b5cff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 0 20px rgba(11, 92, 255, 0.5)',
                flexShrink: 0,
              }}>
                <Video size={26} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.72rem', backgroundColor: '#ef4444', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                    ACTION REQUIRED
                  </span>
                  <span style={{ fontSize: '0.72rem', backgroundColor: 'rgba(11, 92, 255, 0.2)', color: '#60a5fa', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    Official Zoom API
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', color: '#ffffff', fontWeight: 800, margin: '0 0 4px 0' }}>
                  Live Zoom Interview Scheduled: {opp.title || 'Technical Assessment'}
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span>Host: <strong style={{ color: '#ffffff' }}>{opp.companyName || 'NexGen Cloud Solutions'}</strong></span>
                  <span>Meeting ID: <code style={{ color: '#60a5fa', fontWeight: 700 }}>{meetingId}</code></span>
                  <span>Passcode: <code style={{ color: '#34d399', fontWeight: 700 }}>{password}</code></span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveZoomModal({
                meetingId,
                password,
                joinUrl: interviewApp.zoomJoinUrl || 'https://zoom.us/j/84929310482?pwd=U2lIMjYwNDRJbnRlcnZpZXc',
                appUrl: `zoommtg://zoom.us/join?confno=${meetingId.replace(/\s+/g, '')}&pwd=${password}`,
                webClientUrl: `https://zoom.us/wc/${meetingId.replace(/\s+/g, '')}/join?prefer=1&pwd=${password}`,
                topic: interviewApp.interviewType || `${opp.title || 'Technical'} Interview`,
                hostName: opp.companyName || 'Hiring Lead',
                startTime: interviewApp.interviewDate || new Date().toISOString(),
                duration: 45,
                agenda: 'Technical assessment, coding evaluation, and architectural review via Zoom.',
                attendeeName: currentUser?.name || 'Aarav Sharma',
              })}
              className="btn btn-primary"
              style={{
                backgroundColor: '#0b5cff',
                borderColor: '#0b5cff',
                padding: '12px 20px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 700,
                fontSize: '0.95rem',
                boxShadow: '0 0 20px rgba(11, 92, 255, 0.4)',
              }}
            >
              <Video size={18} /> Join Live Zoom Interview
            </button>
          </div>
        );
      })()}

      {/* Metric Cards Grid with 3D Mouse Tilt */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <TiltCard maxTilt={8} scale={1.02} glare={true}>
          <div className="card" style={{ borderLeft: '3px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Skills Mapped</span>
              <div style={{ padding: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '10px' }}>
                <Sparkles size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
              {studentSkills.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {studentSkills.length === 0 ? 'No skills added yet' : 'Verified competencies'}
            </div>
          </div>
        </TiltCard>

        <TiltCard maxTilt={8} scale={1.02} glare={true}>
          <div className="card" style={{ borderLeft: '3px solid var(--purple)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Applications</span>
              <div style={{ padding: '8px', backgroundColor: 'var(--purple-light)', color: 'var(--purple)', borderRadius: '10px' }}>
                <FileCheck size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--purple)', fontFamily: 'var(--font-heading)' }}>
              {applications.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Live recruiter pipelines
            </div>
          </div>
        </TiltCard>

        <TiltCard maxTilt={8} scale={1.02} glare={true}>
          <div className="card" style={{ borderLeft: '3px solid var(--success)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>High Alignment</span>
              <div style={{ padding: '8px', backgroundColor: 'var(--success-light)', color: 'var(--success)', borderRadius: '10px' }}>
                <TrendingUp size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--success)', fontFamily: 'var(--font-heading)' }}>
              {highMatchCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Postings with 70%+ match
            </div>
          </div>
        </TiltCard>

        <TiltCard maxTilt={8} scale={1.02} glare={true}>
          <div className="card" style={{ borderLeft: '3px solid var(--warning)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Saved Bookmarks</span>
              <div style={{ padding: '8px', backgroundColor: 'var(--warning-light)', color: 'var(--warning)', borderRadius: '10px' }}>
                <Bookmark size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--warning)', fontFamily: 'var(--font-heading)' }}>
              {saved.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Target roles saved for later
            </div>
          </div>
        </TiltCard>
      </div>

      {/* Interactive Skill Constellation Section */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} style={{ color: 'var(--primary)' }} /> Interactive Skill Constellation
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Neural representation of your technical competencies and interconnected proficiencies
            </p>
          </div>
          <Link to="/student/skills" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Open Skill Profiler <ArrowRight size={14} />
          </Link>
        </div>

        <SkillConstellation skills={studentSkills} height={280} />
      </div>

      {/* Top Matched Opportunities with 3D Tilt Cards */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>Top Matched Opportunities For You</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Ranked in real-time by algorithmic compatibility with your verified skills
            </p>
          </div>
          <Link to="/student/opportunities" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All Vacancies <ArrowRight size={14} />
          </Link>
        </div>

        {topMatches.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '36px' }}>
            <p style={{ color: 'var(--text-muted)' }}>No opportunities currently listed.</p>
          </div>
        ) : (
          <div className="grid-2">
            {topMatches.map(opp => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                matchResult={opp.match}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Applications Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Active Application Pipeline</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Status timeline of your submitted internship and placement applications
            </p>
          </div>
          <Link to="/student/applications" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Full History <ArrowRight size={14} />
          </Link>
        </div>

        {applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
            You have not applied to any opportunities yet. Explore vacancies above to start your journey!
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Role & Company</th>
                  <th>Applied On</th>
                  <th>Skill Match</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 4).map(app => {
                  const opp = opportunities.find(o => o.id === app.opportunityId) || {};
                  const matchRes = calculateSkillMatch(studentSkills, opp.requiredSkills || [], opp.preferredSkills || []);
                  return (
                    <tr key={app.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{opp.title || 'Opportunity'}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{opp.companyName || 'Company'}</div>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recent'}
                      </td>
                      <td>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          backgroundColor: 'var(--primary-light)',
                          color: 'var(--primary)',
                          border: '1px solid var(--border-color)'
                        }}>
                          {matchRes.matchPercentage}% Match
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${app.status?.toLowerCase().replace(' ', '_') || 'applied'}`}>
                          {app.status || 'Applied'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Zoom Interview Live Modal */}
      {activeZoomModal && (
        <ZoomMeetingModal
          meeting={activeZoomModal}
          onClose={() => setActiveZoomModal(null)}
        />
      )}

      {/* AI Mock Interview Practice Room */}
      <MockInterviewModal
        isOpen={showMockModal}
        onClose={() => setShowMockModal(false)}
      />
    </div>
  );
}
