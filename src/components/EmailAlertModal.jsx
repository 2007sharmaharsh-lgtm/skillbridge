import React from 'react';
import { Mail, X, CheckCircle, ExternalLink, Calendar, Video, Clock, ShieldCheck } from 'lucide-react';

export default function EmailAlertModal({ email, onClose }) {
  if (!email) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px',
    }}>
      <div style={{
        background: '#ffffff',
        color: '#0f172a',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '640px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
      }}>
        {/* Email Header Bar */}
        <div style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={18} style={{ color: '#38bdf8' }} />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              Simulated Outgoing Email Dispatch
            </span>
            <span style={{
              fontSize: '0.65rem',
              backgroundColor: 'rgba(52, 211, 153, 0.2)',
              color: '#34d399',
              border: '1px solid rgba(52, 211, 153, 0.4)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 700,
            }}>
              SMTP 250 OK (Delivered)
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Email Meta Details */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '14px 20px',
          fontSize: '0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}>
          <div><strong>Subject:</strong> {email.subject}</div>
          <div><strong>To:</strong> <code style={{ color: '#0b5cff' }}>{email.to}</code></div>
          <div><strong>From:</strong> {email.senderName} &lt;{email.from}&gt;</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            <strong>Dispatched:</strong> {new Date(email.sentAt).toLocaleString()}
          </div>
        </div>

        {/* Email Body Content */}
        <div
          style={{ padding: '24px', maxHeight: '420px', overflowY: 'auto' }}
          dangerouslySetInnerHTML={{ __html: email.htmlBody }}
        />

        {/* Footer */}
        <div style={{
          backgroundColor: '#f1f5f9',
          borderTop: '1px solid #e2e8f0',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} style={{ color: '#059669' }} /> DKIM & SPF Authenticated
          </span>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ backgroundColor: '#ffffff', color: '#0f172a', borderColor: '#cbd5e1' }}
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
