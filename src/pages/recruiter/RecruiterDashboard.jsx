import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  getRecruiterProfile,
  getOpportunities,
  getRecruiterApplications,
} from '../../services/firestoreService';
import OpportunityCard from '../../components/OpportunityCard';
import CandidateCard from '../../components/CandidateCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import TiltCard from '../../components/TiltCard';
import {
  Briefcase,
  Users,
  PlusCircle,
  TrendingUp,
  UserCheck,
  Building2,
  Sparkles,
  ArrowRight,
  Target,
  Radio,
  Cpu,
} from 'lucide-react';

export default function RecruiterDashboard() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!currentUser) return;
      try {
        const [profData, opps, apps] = await Promise.all([
          getRecruiterProfile(currentUser.uid),
          getOpportunities({ recruiterId: currentUser.uid }),
          getRecruiterApplications(currentUser.uid),
        ]);
        setProfile(profData);
        setOpportunities(opps);
        setApplications(apps || []);
      } catch (err) {
        console.error('Error loading recruiter dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser]);

  if (loading) return <LoadingSpinner text="Initializing AI talent command center..." />;

  const shortlistedCount = applications.filter(a =>
    ['shortlisted', 'interview', 'selected'].includes(a.status?.toLowerCase())
  ).length;

  return (
    <div style={{ position: 'relative' }}>
      {/* HUD Welcome Banner */}
      <TiltCard maxTilt={4} scale={1.006} glare={true} style={{ marginBottom: '28px' }}>
        <div className="card" style={{
          padding: '28px',
          background: 'linear-gradient(135deg, var(--bg-glass-elevated) 0%, var(--bg-card) 100%)',
          border: '1px solid var(--border-glow)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                <Radio size={14} style={{ color: 'var(--purple)', animation: 'beaconPulse 1.8s infinite' }} /> AI Talent Command Center Live
              </div>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--text-main)', marginBottom: '6px', fontWeight: 800 }}>
                Welcome, {profile?.companyName || 'Recruiter'}! 🏢
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                {profile?.industry ? `${profile.industry} • ${profile.location || 'Pan-India'}` : 'Manage active talent pipelines and evaluate candidates with algorithmic skill matching.'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link to="/recruiter/opportunities/create" className="btn btn-primary" style={{ background: 'var(--purple-gradient)', borderRadius: '10px' }}>
                <PlusCircle size={16} /> Post Opportunity
              </Link>
              <Link to="/recruiter/applicants" className="btn btn-secondary" style={{ borderRadius: '10px' }}>
                <Users size={16} /> Review Applicants
              </Link>
            </div>
          </div>
        </div>
      </TiltCard>

      {/* Metrics Row */}
      <div className="grid-3" style={{ marginBottom: '32px' }}>
        <TiltCard maxTilt={8} scale={1.02} glare={true}>
          <div className="card" style={{ borderLeft: '3px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Vacancies</span>
              <div style={{ padding: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '10px' }}>
                <Briefcase size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
              {opportunities.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Internships & graduate roles
            </div>
          </div>
        </TiltCard>

        <TiltCard maxTilt={8} scale={1.02} glare={true}>
          <div className="card" style={{ borderLeft: '3px solid var(--purple)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Candidate Submissions</span>
              <div style={{ padding: '8px', backgroundColor: 'var(--purple-light)', color: 'var(--purple)', borderRadius: '10px' }}>
                <Users size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--purple)', fontFamily: 'var(--font-heading)' }}>
              {applications.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Across all published openings
            </div>
          </div>
        </TiltCard>

        <TiltCard maxTilt={8} scale={1.02} glare={true}>
          <div className="card" style={{ borderLeft: '3px solid var(--success)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Qualified Pipeline</span>
              <div style={{ padding: '8px', backgroundColor: 'var(--success-light)', color: 'var(--success)', borderRadius: '10px' }}>
                <UserCheck size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--success)', fontFamily: 'var(--font-heading)' }}>
              {shortlistedCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Shortlisted / Interviewing / Hired
            </div>
          </div>
        </TiltCard>
      </div>

      {/* Recent Candidate Applications Section with CandidateCard */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={18} style={{ color: 'var(--purple)' }} /> Recent Candidate Submissions & Match Ratings
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Student competencies compared in real time against job posting requirements
            </p>
          </div>
          <Link to="/recruiter/applicants" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--purple)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View Full Pipeline <ArrowRight size={14} />
          </Link>
        </div>

        {applications.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No applicants in pipeline yet"
            description="As students discover your opportunities on the portal, their submissions and match ratings will appear here."
          />
        ) : (
          <div className="grid-2">
            {applications.slice(0, 4).map(app => (
              <CandidateCard
                key={app.id}
                candidate={{
                  name: app.studentName || 'Candidate',
                  email: app.studentEmail,
                  collegeName: app.studentCollege,
                  degree: app.studentDegree,
                  branch: app.studentBranch,
                  skills: app.studentSkills || [],
                }}
                opportunityTitle={app.opportunityTitle}
                matchScore={app.skillMatchPercentage || 80}
                matchedSkills={app.matchedSkills || []}
                missingSkills={app.missingSkills || []}
                status={app.status}
              />
            ))}
          </div>
        )}
      </div>

      {/* Published Opportunities */}
      <div>
        <div className="card-header" style={{ marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>Your Published Opportunities</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Manage open positions and view live candidate compatibility
            </p>
          </div>
          <Link to="/recruiter/opportunities" className="btn btn-secondary btn-sm" style={{ borderRadius: '8px' }}>
            Manage All Vacancies
          </Link>
        </div>

        {opportunities.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No opportunities published yet"
            description="Create your first job or internship posting to start receiving AI-ranked candidate profiles."
            actionText="Post New Opportunity"
            onAction={() => window.location.href = '/recruiter/opportunities/create'}
          />
        ) : (
          <div className="grid-2">
            {opportunities.slice(0, 4).map(opp => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                isRecruiterView={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
