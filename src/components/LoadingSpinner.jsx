import React from 'react';

export default function LoadingSpinner({ text = 'Initializing Telemetry...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      gap: '18px',
      minHeight: '200px'
    }}>
      <div style={{
        position: 'relative',
        width: '48px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          border: '3px solid rgba(56, 189, 248, 0.15)',
          borderTopColor: '#38bdf8',
          borderRadius: '50%',
          animation: 'spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite',
          boxShadow: '0 0 16px rgba(56, 189, 248, 0.4)'
        }} />
        <div style={{
          position: 'absolute',
          inset: '8px',
          border: '2px solid rgba(168, 85, 247, 0.2)',
          borderBottomColor: '#c084fc',
          borderRadius: '50%',
          animation: 'spinReverse 1.4s cubic-bezier(0.5, 0, 0.5, 1) infinite',
        }} />
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#38bdf8',
          boxShadow: '0 0 10px #38bdf8'
        }} />
      </div>

      <span style={{
        fontSize: '0.85rem',
        fontFamily: 'var(--font-heading)',
        letterSpacing: '0.04em',
        color: '#cbd5e1',
        textTransform: 'uppercase',
        fontWeight: 600
      }}>
        {text}
      </span>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spinReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
