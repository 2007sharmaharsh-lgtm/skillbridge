import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  title = 'No items found',
  description = 'There are currently no records matching your criteria.',
  icon: Icon = Inbox,
  action,
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      textAlign: 'center',
      backgroundColor: 'var(--bg-card)',
      backdropFilter: 'blur(16px)',
      borderRadius: 'var(--border-radius-lg)',
      border: '1px dashed var(--border-glow)',
      boxShadow: 'inset 0 0 20px var(--primary-light)',
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: 'var(--primary-light)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 0 20px var(--primary-glow)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
        color: 'var(--primary)'
      }}>
        <Icon size={28} />
      </div>
      <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '8px', fontWeight: 600 }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '420px', marginBottom: action ? '22px' : 0, lineHeight: 1.5 }}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
