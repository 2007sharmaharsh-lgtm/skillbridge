import React from 'react';
import { MapPin, Clock, Calendar, DollarSign, Bookmark, ArrowRight, Sparkles, Building } from 'lucide-react';
import SkillTag from './SkillTag';
import TiltCard from './TiltCard';
import { calculateSkillMatch } from '../utils/skillMatching';

export default function OpportunityCard({
  opportunity,
  studentSkills = [],
  onViewDetails,
  onApply,
  onToggleSave,
  isSaved = false,
  hasApplied = false,
  showRecruiterControls = false,
  onEdit,
  onDelete,
}) {
  const matchResult = studentSkills.length > 0
    ? calculateSkillMatch(studentSkills, opportunity.requiredSkills, opportunity.preferredSkills)
    : null;

  const isHighMatch = matchResult && matchResult.matchPercentage >= 70;

  return (
    <TiltCard maxTilt={8} scale={1.015} glare={true} style={{ height: '100%' }}>
      <div className="card" style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(16px)',
        border: isHighMatch ? '1px solid var(--border-glow)' : '1px solid var(--border-color)',
        boxShadow: isHighMatch ? '0 10px 30px -5px rgba(0, 0, 0, 0.4), 0 0 20px var(--primary-glow)' : 'var(--shadow-md)',
      }}>
        {/* Top Header & Match Pill */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', gap: '12px' }}>
          <div>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: opportunity.type === 'Internship' ? 'var(--purple)' : 'var(--primary)',
              backgroundColor: opportunity.type === 'Internship' ? 'var(--purple-light)' : 'var(--primary-light)',
              border: `1px solid ${opportunity.type === 'Internship' ? 'var(--border-color)' : 'var(--border-color)'}`,
              padding: '3px 10px',
              borderRadius: '9999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: opportunity.type === 'Internship' ? 'var(--purple)' : 'var(--primary)' }}></span>
              {opportunity.type}
            </span>
            <h3 style={{ fontSize: '1.18rem', marginTop: '8px', color: 'var(--text-main)', fontWeight: 700 }}>
              {opportunity.title}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
              <Building size={14} style={{ color: 'var(--primary)' }} />
              {opportunity.companyName}
            </p>
          </div>

          {matchResult && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isHighMatch ? 'var(--success-light)' : 'var(--bg-glass)',
              border: `1px solid ${isHighMatch ? 'var(--success-glow)' : 'var(--border-color)'}`,
              boxShadow: isHighMatch ? '0 0 14px var(--success-glow)' : 'none',
              borderRadius: '10px',
              padding: '6px 12px',
              minWidth: '65px',
            }}>
              <div style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: isHighMatch ? 'var(--success)' : 'var(--text-muted)',
                lineHeight: 1.1,
                fontFamily: 'var(--font-heading)'
              }}>
                {matchResult.matchPercentage}%
              </div>
              <span style={{ fontSize: '0.62rem', color: isHighMatch ? 'var(--success)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                Match
              </span>
            </div>
          )}
        </div>

        {/* Meta Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <MapPin size={14} style={{ color: 'var(--primary)' }} />
            <span>{opportunity.location || 'Remote / Pan-India'}</span>
          </div>
          {opportunity.duration && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={14} style={{ color: 'var(--purple)' }} />
              <span>{opportunity.duration}</span>
            </div>
          )}
          {opportunity.compensation && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <DollarSign size={14} style={{ color: 'var(--success)' }} />
              <span>{opportunity.compensation}</span>
            </div>
          )}
          {opportunity.deadline && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={14} style={{ color: 'var(--warning)' }} />
              <span>Apply by {new Date(opportunity.deadline).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Description Snippet */}
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          marginBottom: '16px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.5,
        }}>
          {opportunity.description}
        </p>

        {/* Required Skills Matrix */}
        <div style={{ marginBottom: '18px', flex: '1' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={12} style={{ color: 'var(--primary)' }} /> Required Competencies:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {(opportunity.requiredSkills || []).slice(0, 5).map((skill) => {
              const isMatch = matchResult?.matchedSkills.some(m => m.name.toLowerCase() === skill.toLowerCase());
              return (
                <SkillTag
                  key={skill}
                  name={skill}
                  isMatched={isMatch}
                  showIcon={false}
                />
              );
            })}
            {(opportunity.requiredSkills || []).length > 5 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center', padding: '2px 6px' }}>
                +{opportunity.requiredSkills.length - 5} more
              </span>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '14px',
          borderTop: '1px solid var(--border-color)',
          gap: '8px',
        }}>
          {showRecruiterControls ? (
            <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => onEdit && onEdit(opportunity)}>
                Edit Position
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => onDelete && onDelete(opportunity.id)}>
                Delete
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '8px' }}>
                {onToggleSave && (
                  <button
                    type="button"
                    onClick={() => onToggleSave(opportunity.id)}
                    style={{
                      background: 'var(--bg-glass)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--border-radius)',
                      padding: '8px 10px',
                      cursor: 'pointer',
                      color: isSaved ? 'var(--primary)' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      boxShadow: isSaved ? '0 0 10px var(--primary-glow)' : 'none',
                    }}
                    title={isSaved ? 'Saved' : 'Save Opportunity'}
                  >
                    <Bookmark size={16} fill={isSaved ? 'var(--primary)' : 'none'} />
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    if (typeof onViewDetails === 'function') {
                      onViewDetails(opportunity);
                    } else {
                      window.location.href = `/student/opportunities?highlight=${opportunity.id}`;
                    }
                  }}
                >
                  Gap Analysis & Details
                </button>
              </div>

              {hasApplied ? (
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--success)',
                  background: 'var(--success-light)',
                  border: '1px solid var(--success-glow)',
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  ✓ Applied
                </span>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    if (typeof onApply === 'function') {
                      onApply(opportunity);
                    } else {
                      window.location.href = `/student/opportunities?apply=${opportunity.id}`;
                    }
                  }}
                >
                  Apply Now <ArrowRight size={14} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </TiltCard>
  );
}
