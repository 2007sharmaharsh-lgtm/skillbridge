import React, { useState } from 'react';
import { Plus, Sparkles, Check, AlertCircle } from 'lucide-react';
import { COMMON_SKILLS, SKILL_LEVELS } from '../constants';
import SkillTag from './SkillTag';

export default function SkillSelector({ skills = [], onChange }) {
  const [selectedSkill, setSelectedSkill] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [level, setLevel] = useState(SKILL_LEVELS.INTERMEDIATE);
  const [feedback, setFeedback] = useState(null);

  const POPULAR_SKILLS = ['Python', 'React', 'JavaScript', 'Node.js', 'SQL', 'Machine Learning', 'Docker', 'AWS'];

  const showFeedback = (msg, isError = false) => {
    setFeedback({ msg, isError });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAddSkill = (skillNameToAdd = null) => {
    const rawName = skillNameToAdd || customSkill.trim() || selectedSkill;
    const cleanName = typeof rawName === 'string' ? rawName.trim() : '';
    if (!cleanName) return;

    // Check duplicate
    const exists = skills.some(
      (s) => (s?.name || s || '').toLowerCase() === cleanName.toLowerCase()
    );

    if (exists) {
      showFeedback(`"${cleanName}" is already in your skill profile.`, true);
      setSelectedSkill('');
      setCustomSkill('');
      return;
    }

    const newSkills = [...skills, { name: cleanName, level, verified: false }];
    onChange(newSkills);
    showFeedback(`Added "${cleanName}" (${level})`);

    setSelectedSkill('');
    setCustomSkill('');
  };

  const handleRemove = (skillNameToRemove) => {
    if (!skillNameToRemove) return;
    const target = skillNameToRemove.toLowerCase();
    const newSkills = skills.filter(
      (s) => (s?.name || s || '').toLowerCase() !== target
    );
    onChange(newSkills);
    showFeedback(`Removed "${skillNameToRemove}"`);
  };

  return (
    <div>
      {/* Quick Feedback Toast */}
      {feedback && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          borderRadius: '8px',
          marginBottom: '14px',
          fontSize: '0.85rem',
          backgroundColor: feedback.isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          color: feedback.isError ? '#f87171' : '#34d399',
          border: `1px solid ${feedback.isError ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
        }}>
          {feedback.isError ? <AlertCircle size={15} /> : <Check size={15} />}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Input Row */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
        <select
          className="form-select"
          style={{ flex: '1', minWidth: '170px' }}
          value={selectedSkill}
          onChange={(e) => {
            setSelectedSkill(e.target.value);
            if (e.target.value) setCustomSkill('');
          }}
        >
          <option value="">-- Choose Common Skill --</option>
          {COMMON_SKILLS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <input
          type="text"
          className="form-input"
          style={{ flex: '1', minWidth: '170px' }}
          placeholder="Or type custom skill..."
          value={customSkill}
          onChange={(e) => {
            setCustomSkill(e.target.value);
            if (e.target.value) setSelectedSkill('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddSkill();
            }
          }}
        />

        <select
          className="form-select"
          style={{ width: '140px' }}
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          {Object.values(SKILL_LEVELS).map((lvl) => (
            <option key={lvl} value={lvl}>{lvl}</option>
          ))}
        </select>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => handleAddSkill()}
          disabled={!selectedSkill && !customSkill.trim()}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} /> Add Skill
        </button>
      </div>

      {/* Quick Add Popular Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={12} style={{ color: 'var(--primary)' }} /> Quick Add:
        </span>
        {POPULAR_SKILLS.map((sk) => {
          const isAdded = skills.some((s) => (s?.name || s || '').toLowerCase() === sk.toLowerCase());
          return (
            <button
              key={sk}
              type="button"
              onClick={() => handleAddSkill(sk)}
              disabled={isAdded}
              style={{
                fontSize: '0.75rem',
                padding: '3px 10px',
                borderRadius: '9999px',
                border: isAdded ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(59, 130, 246, 0.3)',
                backgroundColor: isAdded ? 'rgba(255, 255, 255, 0.04)' : 'rgba(59, 130, 246, 0.12)',
                color: isAdded ? 'var(--text-muted)' : '#60a5fa',
                cursor: isAdded ? 'default' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {isAdded ? `✓ ${sk}` : `+ ${sk}`}
            </button>
          );
        })}
      </div>

      {/* Active Skills Tag Display */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        minHeight: '48px',
        padding: '14px',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius)',
        backgroundColor: 'var(--bg-subtle)'
      }}>
        {skills.length === 0 ? (
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            No skills added yet. Select from the dropdown, type above and press Enter, or click the Quick Add buttons.
          </span>
        ) : (
          skills.map((skill) => {
            const skillName = skill?.name || skill;
            const skillLevel = skill?.level || 'Intermediate';
            return (
              <SkillTag
                key={skillName}
                name={skillName}
                level={skillLevel}
                onRemove={handleRemove}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
