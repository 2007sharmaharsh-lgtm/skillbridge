import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  getInstitutionProfile,
  getAllStudents,
  getOpportunities,
  getAllApplications,
} from '../../services/firestoreService';
import { calculateCurriculumSkillGap } from '../../utils/skillMatching';
import LoadingSpinner from '../../components/LoadingSpinner';
import TiltCard from '../../components/TiltCard';
import {
  Users,
  Briefcase,
  GraduationCap,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  Radio,
  Building2,
} from 'lucide-react';

export default function InstitutionDashboard() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!currentUser) return;
      try {
        const [profData, allStudents, allOpps, allApps] = await Promise.all([
          getInstitutionProfile(currentUser.uid),
          getAllStudents(),
          getOpportunities(),
          getAllApplications(),
        ]);
        setProfile(profData);
        setStudents(allStudents);
        setOpportunities(allOpps);
        setApplications(allApps);
      } catch (err) {
        console.error('Error loading institution dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser]);

  if (loading) return <LoadingSpinner text="Aggregating academic intelligence telemetry..." />;

  // Calculate skill gap telemetry
  const gapAnalysis = calculateCurriculumSkillGap(students, opportunities);
  const topDeficits = gapAnalysis.filter(g => g.gap > 0).slice(0, 5);

  const totalStudents = students.length;
  const appliedStudentsCount = new Set(applications.map(a => a.studentId)).size;
  const shortlistedCount = applications.filter(a =>
    ['shortlisted', 'interview', 'selected'].includes(a.status?.toLowerCase())
  ).length;
  const selectedCount = applications.filter(a => a.status === 'selected').length;
  const placementRate = totalStudents > 0 ? Math.round((selectedCount / totalStudents) * 100) : 0;

  return (
    <div style={{ position: 'relative' }}>
      {/* College Academic Intelligence Banner */}
      <TiltCard maxTilt={4} scale={1.006} glare={true} style={{ marginBottom: '28px' }}>
        <div className="card" style={{
          padding: '28px',
          background: 'linear-gradient(135deg, var(--bg-glass-elevated) 0%, var(--bg-card) 100%)',
          border: '1px solid var(--border-glow)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                <Radio size={14} style={{ color: 'var(--success)', animation: 'beaconPulse 1.8s infinite' }} /> Academic Intelligence Center Live
              </div>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--text-main)', marginBottom: '6px', fontWeight: 800 }}>
                {profile?.institutionName || 'National Institute of Technology'} 🎓
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                {profile?.university ? `${profile.university} • ${profile.location}` : 'Academic Administration & Training & Placement Cell Diagnostic Dashboard'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link to="/institution/skill-analysis" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '10px' }}>
                <BarChart3 size={16} /> Skill Gap Analytics
              </Link>
              <Link to="/institution/students" className="btn btn-secondary" style={{ borderRadius: '10px' }}>
                <Users size={16} /> Student Directory
              </Link>
            </div>
          </div>
        </div>
      </TiltCard>

      {/* KPI Cards Grid */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <TiltCard maxTilt={8} scale={1.02} glare={true}>
          <div className="card" style={{ borderLeft: '3px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Enrolled Students</span>
              <div style={{ padding: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '10px' }}>
                <GraduationCap size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
              {totalStudents}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Profiles mapped with verified skills
            </div>
          </div>
        </TiltCard>

        <TiltCard maxTilt={8} scale={1.02} glare={true}>
          <div className="card" style={{ borderLeft: '3px solid var(--purple)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Recruiter Openings</span>
              <div style={{ padding: '8px', backgroundColor: 'var(--purple-light)', color: 'var(--purple)', borderRadius: '10px' }}>
                <Briefcase size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--purple)', fontFamily: 'var(--font-heading)' }}>
              {opportunities.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Active industry vacancies
            </div>
          </div>
        </TiltCard>

        <TiltCard maxTilt={8} scale={1.02} glare={true}>
          <div className="card" style={{ borderLeft: '3px solid var(--success)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Placement Rate</span>
              <div style={{ padding: '8px', backgroundColor: 'var(--success-light)', color: 'var(--success)', borderRadius: '10px' }}>
                <TrendingUp size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--success)', fontFamily: 'var(--font-heading)' }}>
              {placementRate}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {selectedCount} student(s) selected
            </div>
          </div>
        </TiltCard>

        <TiltCard maxTilt={8} scale={1.02} glare={true}>
          <div className="card" style={{ borderLeft: '3px solid var(--warning)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Curriculum Gaps</span>
              <div style={{ padding: '8px', backgroundColor: 'var(--warning-light)', color: 'var(--warning)', borderRadius: '10px' }}>
                <AlertTriangle size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--warning)', fontFamily: 'var(--font-heading)' }}>
              {topDeficits.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              High-demand skills deficient
            </div>
          </div>
        </TiltCard>
      </div>

      {/* Placement Funnel Progress Bar */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} style={{ color: 'var(--success)' }} /> Campus Placement Funnel Progression
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Real-time conversion pipeline from verified student enrollment to final industry offers
            </p>
          </div>
          <Link to="/institution/placements" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Detailed Placement Tracking <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '12px', marginTop: '12px' }}>
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-glass)', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>{totalStudents}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>1. Registered Talent Pool</div>
          </div>

          <div style={{ padding: '16px', backgroundColor: 'var(--bg-glass)', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>{appliedStudentsCount}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>2. Actively Applied</div>
          </div>

          <div style={{ padding: '16px', backgroundColor: 'var(--bg-glass)', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--purple)' }}>{shortlistedCount}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>3. Shortlisted / Interview</div>
          </div>

          <div style={{ padding: '16px', backgroundColor: 'var(--bg-glass)', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success)' }}>{selectedCount}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>4. Placed & Hired 🎉</div>
          </div>
        </div>
      </div>

      {/* Top Curriculum Deficits Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} style={{ color: 'var(--warning)' }} /> Top Industry Demand vs Student Supply Gaps
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Skills urgently demanded by recruiter postings where student enrollment supply is lagging
            </p>
          </div>
          <Link to="/institution/skill-analysis" className="btn btn-secondary btn-sm" style={{ borderRadius: '8px' }}>
            View Full Matrix ({gapAnalysis.length})
          </Link>
        </div>

        {topDeficits.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No major skill deficits detected! Curricula are currently aligned with market demand.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Skill / Competency</th>
                  <th>Recruiter Demand</th>
                  <th>Student Supply</th>
                  <th>Curriculum Deficit</th>
                  <th>Market Readiness Ratio</th>
                </tr>
              </thead>
              <tbody>
                {topDeficits.map(item => (
                  <tr key={item.skill}>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.displayName}</td>
                    <td>
                      <span style={{ color: 'var(--purple)', fontWeight: 600 }}>{item.demandCount} vacancies</span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{item.supplyCount} students</span>
                    </td>
                    <td>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--danger-light)',
                        color: 'var(--danger)',
                        border: '1px solid var(--danger-glow)'
                      }}>
                        -{item.gap} deficit
                      </span>
                    </td>
                    <td style={{ width: '180px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--bg-subtle)', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${item.readinessRatio}%`,
                            backgroundColor: item.readinessRatio >= 70 ? 'var(--success)' : item.readinessRatio >= 40 ? 'var(--warning)' : 'var(--danger)'
                          }} />
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)' }}>{item.readinessRatio}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
