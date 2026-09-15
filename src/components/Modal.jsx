import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, footer, maxWidth = '620px' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: `min(94vw, ${maxWidth})` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-glass-elevated)',
        }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 700, wordBreak: 'break-word', paddingRight: '8px' }}>{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              minWidth: '40px',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '20px 18px', color: 'var(--text-main)', overflowY: 'auto' }}>
          {children}
        </div>

        {footer && (
          <div style={{
            padding: '14px 18px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
            gap: '10px',
            backgroundColor: 'var(--bg-glass)',
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
