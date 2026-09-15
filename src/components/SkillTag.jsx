import React from 'react';
import { X, Check, AlertCircle } from 'lucide-react';

export default function SkillTag({
  name,
  level,
  isMatched,
  isMissing,
  onRemove,
  showIcon = true,
}) {
  let tagClass = 'skill-tag';
  if (isMatched) tagClass += ' matched';
  if (isMissing) tagClass += ' missing';

  return (
    <span className={tagClass}>
      {showIcon && isMatched && <Check size={13} style={{ strokeWidth: 3 }} />}
      {showIcon && isMissing && <AlertCircle size={13} />}
      <span>{name}</span>
      {level && <span className="level">{level}</span>}
      {onRemove && (
        <button
          type="button"
          aria-label={`Remove ${name}`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(name);
          }}
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            padding: '3px',
            marginLeft: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f87171',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.35)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
            e.currentTarget.style.color = '#f87171';
          }}
        >
          <X size={12} strokeWidth={2.5} />
        </button>
      )}
    </span>
  );
}
