import React from 'react';
import { Link } from 'react-router-dom';
import { User, MapPin, GraduationCap, FileText, CheckCircle, Award, Sparkles, Video, Linkedin, Github } from 'lucide-react';
import SkillMatchCard from './SkillMatchCard';
import ApplicationStatusBadge from './ApplicationStatusBadge';
import { APPLICATION_STATUS } from '../constants';
import TiltCard from './TiltCard';

export default function CandidateCard({
  student,
  application,
  matchResult,
  onStatusChange,
  onViewResume,
  onScheduleZoom,
  onViewZoom,
}) {
  const matchPct = matchResult?.matchPercentage || 0;
  const isHighMatch = matchPct >= 70;

  return (
    <TiltCard maxTilt={6} scale={1.01} glare={true} style={{ height: '100%' }}>
      <div className="card" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        height: '100%',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(18px)',
        border: isHighMatch ? '1px solid var(--border-glow)' : '1px solid var(--border-color)',
        boxShadow: isHighMatch ? '0 10px 30px -5px rgba(0, 0, 0, 0.4), 0 0 20px var(--purple-glow)' : 'var(--shadow-md)',
      }}>
        {/* Candidate Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--purple-light)',
              border: '2px solid var(--border-color)',
              boxShadow: '0 0 16px var(--purple-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--purple)',
              fontWeight: 700,
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {student?.photoURL ? (
                <img src={student.photoURL} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={24} />
              )}
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                {student?.name || 'Candidate'}
                {isHighMatch && <Sparkles size={14} style={{ color: 'var(--primary)' }} />}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <GraduationCap size={14} style={{ color: 'var(--primary)' }} />
                <span>{student?.degree} {student?.branch} • Class of {student?.graduationYear || '2025'}</span>
              </div>
            </div>
          </div>

          {application && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ApplicationStatusBadge status={application.status} />
            </div>
          )}
        </div>

        {/* Institution & Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={14} style={{ color: 'var(--primary)' }} /> {student?.location || 'India'}
          </span>
          <span style={{ color: 'var(--border-color)' }}>•</span>
          <span style={{ color: 'var(--text-muted)' }}>{student?.collegeName || 'National Institute'}</span>
        </div>

        {student?.about && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {student.about}
          </p>
        )}

        {/* Dynamic Candidate Match Visualization Bar */}
        {matchResult && (
          <div style={{
            background: 'var(--bg-glass)',
            padding: '12px 14px',
            borderRadius: 'var(--border-radius)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                AI Match Compatibility
              </span>
              <span style={{
                fontSize: '1rem',
                fontWeight: 800,
                color: isHighMatch ? 'var(--success)' : 'var(--primary)',
                fontFamily: 'var(--font-heading)'
              }}>
                {matchPct}%
              </span>
            </div>

            {/* Glowing Segmented / Continuous Bar */}
            <div style={{
              height: '8px',
              width: '100%',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '9999px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                height: '100%',
                width: `${matchPct}%`,
                background: isHighMatch ? 'var(--success)' : 'var(--primary-gradient)',
                boxShadow: isHighMatch ? '0 0 12px var(--success-glow)' : '0 0 12px var(--primary-glow)',
                borderRadius: '9999px',
                transition: 'width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)'
              }} />
            </div>

            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span>{matchResult.matchedSkillCount} of {matchResult.totalRequiredSkills} Required Skills Met</span>
              <span style={{ color: isHighMatch ? 'var(--success)' : 'var(--text-muted)' }}>{isHighMatch ? 'High Alignment' : 'Moderate Alignment'}</span>
            </div>
          </div>
        )}

        {/* Match Breakdown Detailed Component */}
        {matchResult && (
          <SkillMatchCard matchResult={matchResult} compact={false} />
        )}

        {/* Recruiter Action Toolbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '14px',
          borderTop: '1px solid var(--border-color)',
          marginTop: 'auto',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link
              to={`/portfolio/${student?.uid || 'std_1'}`}
              target="_blank"
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Award size={14} style={{ color: 'var(--primary)' }} /> View Digital Portfolio
            </Link>
            {student?.resumeURL ? (
              <a
                href={student.resumeURL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <FileText size={14} /> Resume
              </a>
            ) : null}
            {student?.linkedinUrl && (
              <a
                href={student.linkedinUrl.startsWith('http') ? student.linkedinUrl : `https://${student.linkedinUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.4)', background: 'rgba(59, 130, 246, 0.08)' }}
                title="View LinkedIn Profile"
              >
                <Linkedin size={13} /> LinkedIn
              </a>
            )}
            {student?.githubUrl && (
              <a
                href={student.githubUrl.startsWith('http') ? student.githubUrl : `https://${student.githubUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#f1f5f9', borderColor: 'rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.08)' }}
                title="View GitHub Repositories"
              >
                <Github size={13} /> GitHub
              </a>
            )}
          </div>

          {application && onStatusChange && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {application.zoomMeetingId ? (
                <button
                  type="button"
                  onClick={() => onViewZoom ? onViewZoom(application) : null}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: 'rgba(11, 92, 255, 0.15)',
                    border: '1px solid rgba(11, 92, 255, 0.4)',
                    color: '#60a5fa',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    borderRadius: '6px',
                    fontWeight: 600,
                  }}
                  title="View Scheduled Zoom Interview"
                >
                  <Video size={13} style={{ color: '#38bdf8' }} /> Zoom: {application.zoomMeetingId}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onScheduleZoom ? onScheduleZoom(application, student) : null}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: '#0b5cff',
                    borderColor: '#0b5cff',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    borderRadius: '6px',
                    fontWeight: 600,
                  }}
                >
                  <Video size={13} /> Schedule Zoom
                </button>
              )}

              <select
                className="form-select"
                style={{ width: 'auto', padding: '5px 10px', fontSize: '0.75rem', borderRadius: '6px' }}
                value={application.status}
                onChange={(e) => onStatusChange(application.id, e.target.value, student)}
              >
                <option value={APPLICATION_STATUS.APPLIED}>Status: Applied</option>
                <option value={APPLICATION_STATUS.UNDER_REVIEW}>Status: Under Review</option>
                <option value={APPLICATION_STATUS.SHORTLISTED}>Status: Shortlisted</option>
                <option value={APPLICATION_STATUS.INTERVIEW}>Status: Interview Scheduled</option>
                <option value={APPLICATION_STATUS.SELECTED}>Status: Selected / Hired</option>
                <option value={APPLICATION_STATUS.REJECTED}>Status: Rejected</option>
              </select>

              {application.status !== APPLICATION_STATUS.SHORTLISTED && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => onStatusChange(application.id, APPLICATION_STATUS.SHORTLISTED)}
                >
                  Shortlist
                </button>
              )}

              {application.status !== APPLICATION_STATUS.SELECTED && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => onStatusChange(application.id, APPLICATION_STATUS.SELECTED)}
                >
                  Select & Hire
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </TiltCard>
  );
}
