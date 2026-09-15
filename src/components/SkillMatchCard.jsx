import React from 'react';
import SkillTag from './SkillTag';
import { CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

export default function SkillMatchCard({ matchResult, compact = false }) {
  if (!matchResult) return null;

  const {
    matchPercentage = 0,
    matchedSkills = [],
    missingSkills = [],
    totalRequiredSkills = 0,
    matchedSkillCount = 0,
  } = matchResult;

  const getProgressColor = () => {
    if (matchPercentage >= 75) return 'var(--success)';
    if (matchPercentage >= 50) return 'var(--primary)';
    if (matchPercentage >= 30) return 'var(--warning)';
    return 'var(--danger)';
  };

  const getProgressGlow = () => {
    if (matchPercentage >= 75) return 'var(--success-glow)';
    if (matchPercentage >= 50) return 'var(--primary-glow)';
    if (matchPercentage >= 30) return 'var(--warning-glow)';
    return 'var(--danger-glow)';
  };

  return (
    <div style={{
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--border-radius)',
      padding: compact ? '12px 14px' : '18px',
      backgroundColor: 'var(--bg-card)',
      backdropFilter: 'blur(14px)',
      boxShadow: 'var(--shadow-sm)',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} style={{ color: getProgressColor() }} />
          Skill Compatibility Telemetry
        </span>
        <span style={{
          fontSize: compact ? '0.95rem' : '1.2rem',
          fontWeight: 800,
          color: getProgressColor(),
          fontFamily: 'var(--font-heading)',
          textShadow: `0 0 12px ${getProgressGlow()}`
        }}>
          {matchPercentage}%
        </span>
      </div>

      {/* Cyber Glowing Progress Bar */}
      <div style={{
        height: '8px',
        backgroundColor: 'var(--bg-subtle)',
        borderRadius: '9999px',
        overflow: 'hidden',
        marginBottom: '10px',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          height: '100%',
          width: `${matchPercentage}%`,
          backgroundColor: getProgressColor(),
          boxShadow: `0 0 12px ${getProgressGlow()}`,
          borderRadius: '9999px',
          transition: 'width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }} />
      </div>

      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: compact ? 0 : '14px', display: 'flex', justifyContent: 'space-between' }}>
        <span>Matches {matchedSkillCount} of {totalRequiredSkills} mandatory competencies</span>
        <span style={{ color: getProgressColor(), fontWeight: 600 }}>
          {matchPercentage >= 75 ? 'Ready to Interview' : matchPercentage >= 50 ? 'Promising Fit' : 'Upskilling Needed'}
        </span>
      </div>

      {!compact && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
          {/* Matched Skills */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--success)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <CheckCircle2 size={14} />
              <span>Matched Verified Skills ({matchedSkills.length})</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {matchedSkills.length === 0 ? (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No direct overlap identified</span>
              ) : (
                matchedSkills.map(skill => (
                  <SkillTag
                    key={skill.name}
                    name={skill.name}
                    level={skill.studentProficiency}
                    isMatched={true}
                  />
                ))
              )}
            </div>
          </div>

          {/* Missing Skills */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--danger)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <AlertTriangle size={14} />
              <span>Identified Skill Gaps ({missingSkills.length})</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {missingSkills.length === 0 ? (
                <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>✓ All mandatory skills satisfied!</span>
              ) : (
                missingSkills.map(skill => (
                  <SkillTag
                    key={skill}
                    name={skill}
                    isMissing={true}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
