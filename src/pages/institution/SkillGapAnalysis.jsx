import React, { useState, useEffect } from 'react';
import { getAllStudents, getOpportunities } from '../../services/firestoreService';
import { calculateCurriculumSkillGap } from '../../utils/skillMatching';
import LoadingSpinner from '../../components/LoadingSpinner';
import TiltCard from '../../components/TiltCard';
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle2, Info, Sparkles, Zap } from 'lucide-react';

export default function SkillGapAnalysis() {
  const [students, setStudents] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [allStudents, allOpps] = await Promise.all([
          getAllStudents(),
          getOpportunities(),
        ]);
        setStudents(allStudents);
        setOpportunities(allOpps);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <LoadingSpinner text="Computing market skill gap matrix..." />;

  const gapAnalysis = calculateCurriculumSkillGap(students, opportunities);

  // Common student skills (top supply)
  const topSuppliedSkills = [...gapAnalysis]
    .sort((a, b) => b.supplyCount - a.supplyCount)
    .slice(0, 5);

  // Most in-demand recruiter skills
  const topDemandedSkills = [...gapAnalysis]
    .sort((a, b) => b.demandCount - a.demandCount)
    .slice(0, 5);

  // Deficit gaps
  const deficitSkills = gapAnalysis.filter(g => g.gap > 0);

  // Overall readiness average
  const avgReadiness = gapAnalysis.length > 0
    ? Math.round(gapAnalysis.reduce((acc, g) => acc + g.readinessRatio, 0) / gapAnalysis.length)
    : 100;

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 style={{ color: 'var(--success)' }} /> Academia–Industry Skill Gap Intelligence Matrix
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Directly compares student competencies against active industry vacancy requirements to guide curriculum interventions.
        </p>
      </div>

      {/* Summary Metrics Row with 3D TiltCards */}
      <div className="grid-3" style={{ marginBottom: '32px' }}>
        <TiltCard maxTilt={8} scale={1.02} glare={true}>
          <div className="card" style={{ borderLeft: '3px solid var(--success)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Overall Employability Readiness
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: avgReadiness >= 70 ? '#34d399' : '#fbbf24', fontFamily: 'var(--font-heading)' }}>
              {avgReadiness}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Aggregate alignment across all tracked technical skills
            </div>
          </div>
        </TiltCard>

        <TiltCard maxTilt={8} scale={1.02} glare={true}>
          <div className="card" style={{ borderLeft: '3px solid var(--danger)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Critical Skill Deficits
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#f87171', fontFamily: 'var(--font-heading)' }}>
              {deficitSkills.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Technologies demanded by recruiters but under-supplied
            </div>
          </div>
        </TiltCard>

        <TiltCard maxTilt={8} scale={1.02} glare={true}>
          <div className="card" style={{ borderLeft: '3px solid var(--primary)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Market Matched Skills
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-heading)' }}>
              {gapAnalysis.filter(g => g.gap === 0 && g.demandCount > 0).length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Competencies where student supply satisfies demand
            </div>
          </div>
        </TiltCard>
      </div>

      {/* Side-by-side Top Supply vs Top Demand */}
      <div className="grid-2" style={{ marginBottom: '32px' }}>
        {/* Most Common Student Skills */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} style={{ color: 'var(--primary)' }} /> Most Common Student Skills (Supply)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {topSuppliedSkills.map(item => (
              <div key={item.skill}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#f8fafc' }}>{item.displayName}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{item.supplyCount} students proficient</span>
                </div>
                <div style={{ height: '7px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, (item.supplyCount / Math.max(1, students.length)) * 100)}%`,
                    backgroundColor: '#38bdf8',
                    boxShadow: '0 0 10px #38bdf8'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Demanded Industry Skills */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} style={{ color: 'var(--purple)' }} /> Most Demanded Industry Skills (Market)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {topDemandedSkills.map(item => (
              <div key={item.skill}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#f8fafc' }}>{item.displayName}</span>
                  <span style={{ color: '#c084fc', fontWeight: 600, fontSize: '0.8rem' }}>{item.demandCount} job postings</span>
                </div>
                <div style={{ height: '7px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, (item.demandCount / Math.max(1, opportunities.length)) * 100)}%`,
                    backgroundColor: '#a855f7',
                    boxShadow: '0 0 10px #a855f7'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Skill Gap Matrix Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>Comprehensive Skill Deficit & Readiness Matrix</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Full cross-tabulation of market demand vs institutional student talent
            </p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Skill Name</th>
                <th>Industry Demand</th>
                <th>Student Supply</th>
                <th>Net Gap Status</th>
                <th>Employability Readiness Ratio</th>
                <th>Curriculum Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {gapAnalysis.map(item => (
                <tr key={item.skill}>
                  <td style={{ fontWeight: 600, color: '#f8fafc' }}>{item.displayName}</td>
                  <td>
                    <span style={{ color: '#c084fc', fontWeight: 600 }}>
                      {item.demandCount} postings
                    </span>
                  </td>
                  <td>
                    <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                      {item.supplyCount} students
                    </span>
                  </td>
                  <td>
                    {item.gap > 0 ? (
                      <span style={{ color: '#fda4af', backgroundColor: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '3px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem' }}>
                        Deficit: -{item.gap}
                      </span>
                    ) : (
                      <span style={{ color: '#6ee7b7', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '3px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem' }}>
                        Adequate / Surplus
                      </span>
                    )}
                  </td>
                  <td style={{ width: '180px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${item.readinessRatio}%`,
                          backgroundColor: item.readinessRatio >= 70 ? '#10b981' : item.readinessRatio >= 40 ? '#f59e0b' : '#f43f5e'
                        }} />
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f8fafc' }}>{item.readinessRatio}%</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {item.gap > 0
                      ? `Urgent: Conduct workshop / elective in ${item.displayName}`
                      : 'Curriculum aligned with industry expectations'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
