import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertOctagon, UserX, ExternalLink, LogOut, Send, CheckCircle2, Clock, HelpCircle, FileText, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { submitBanAppeal, getStudentAppeal } from '../services/apaarService';

export default function BannedAccountModal({ banDetails, onClose }) {
  const { logout, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('notice'); // 'notice' | 'appeal'
  const [justification, setJustification] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [existingAppeal, setExistingAppeal] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const studentUid = currentUser?.uid || banDetails?.studentUid || 'student_1';

  useEffect(() => {
    if (studentUid) {
      const app = getStudentAppeal(studentUid);
      if (app) {
        setExistingAppeal(app);
        if (app.justificationText) setJustification(app.justificationText);
        if (app.proofUrl) setProofUrl(app.proofUrl);
      }
    }
  }, [studentUid]);

  const handleLogout = async () => {
    try {
      if (logout) await logout();
      window.location.href = '/';
    } catch (e) {
      window.location.reload();
    }
  };

  const handleAppealSubmit = async (e) => {
    e.preventDefault();
    if (!justification.trim()) {
      setErrorMsg('Please enter a thorough explanation to clarify your submission.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);
    try {
      const res = await submitBanAppeal({
        studentUid,
        studentName: currentUser?.name || 'Student Candidate',
        studentEmail: currentUser?.email || 'student@university.edu',
        justificationText: justification.trim(),
        proofUrl: proofUrl.trim(),
      });
      if (res.success) {
        setExistingAppeal(res.appeal);
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 5000);
      }
    } catch (err) {
      console.error('Error submitting appeal:', err);
      setErrorMsg('Failed to submit appeal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 16, 0.95)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '20px',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '620px',
          background: 'linear-gradient(145deg, #1c0f13 0%, #12090b 100%)',
          border: '2px solid rgba(239, 68, 68, 0.6)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.25), 0 0 40px rgba(0, 0, 0, 0.9)',
          padding: '26px',
          textAlign: 'center',
          animation: 'fadeIn 0.3s ease-out',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Warning Icon Badge */}
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '2px solid rgba(239, 68, 68, 0.5)',
            boxShadow: '0 0 25px rgba(239, 68, 68, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444',
            margin: '0 auto 16px auto',
          }}
        >
          <ShieldAlert size={32} />
        </div>

        <h2 style={{ fontSize: '1.45rem', color: '#f87171', marginBottom: '6px', fontWeight: 800 }}>
          🚫 ACCESS RESTRICTED / BLACKLISTED
        </h2>

        <div style={{ fontSize: '0.82rem', color: '#fca5a5', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px' }}>
          National APAAR ID Academic Anti-Fraud Audit
        </div>

        {/* Modal Navigation Tabs: Notice vs Appeal */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0, 0, 0, 0.5)', padding: '4px', borderRadius: '10px', marginBottom: '18px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('notice')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: activeTab === 'notice' ? 700 : 500,
              background: activeTab === 'notice' ? 'rgba(239, 68, 68, 0.25)' : 'transparent',
              color: activeTab === 'notice' ? '#ffffff' : '#94a3b8',
              border: activeTab === 'notice' ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Sanction Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('appeal')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: activeTab === 'appeal' ? 700 : 500,
              background: activeTab === 'appeal' ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
              color: activeTab === 'appeal' ? '#ffffff' : '#94a3b8',
              border: activeTab === 'appeal' ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            Submit Justification / Appeal
            {existingAppeal && (
              <span className="badge" style={{ backgroundColor: existingAppeal.status === 'pending' ? 'rgba(234, 179, 8, 0.2)' : existingAppeal.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: existingAppeal.status === 'pending' ? '#fbbf24' : existingAppeal.status === 'approved' ? '#34d399' : '#f87171', fontSize: '0.68rem', padding: '1px 6px' }}>
                {existingAppeal.status.toUpperCase()}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'notice' ? (
          <div>
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.55, marginBottom: '16px' }}>
              This student account and its associated Ministry of Education academic identity (<strong>{banDetails?.maskedApaar || banDetails?.maskedAadhaar || 'XXXX-XXXX-9821'}</strong>) have been blacklisted following an institutional audit.
            </p>

            {/* Ban Details Card */}
            <div
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                padding: '14px 16px',
                textAlign: 'left',
                marginBottom: '18px',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#fca5a5', marginBottom: '6px' }}>
                <strong>Reported Academic Violation:</strong>
              </div>
              <div style={{ fontSize: '0.86rem', color: '#ffffff', background: 'rgba(239, 68, 68, 0.1)', padding: '10px 12px', borderRadius: '6px', borderLeft: '3px solid #ef4444', marginBottom: '10px', lineHeight: 1.4 }}>
                "{banDetails?.banReason || 'Submission of fabricated skill claims, forged certifications, or falsified academic project records.'}"
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', flexWrap: 'wrap', gap: '8px' }}>
                <span>Action By: <strong style={{ color: '#e2e8f0' }}>{banDetails?.bannedBy || 'Faculty Review Desk'}</strong></span>
                <span>Date: <strong style={{ color: '#e2e8f0' }}>{new Date(banDetails?.bannedAt || Date.now()).toLocaleDateString()}</strong></span>
              </div>
            </div>

            {/* Right to Appeal Notice */}
            <div
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.35)',
                borderRadius: '10px',
                padding: '12px 14px',
                textAlign: 'left',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <HelpCircle size={20} style={{ color: '#60a5fa', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#93c5fd' }}>Right to Justification & Natural Justice:</strong>
                <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: '3px 0 0 0', lineHeight: 1.45 }}>
                  If you believe this sanction occurred due to a clerical error, scanning mistake, or miscommunication, you may submit your formal explanation and genuine proof link to the Academic Discipline Committee.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('appeal')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#38bdf8',
                    padding: 0,
                    marginTop: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  Write Justification Defense Now <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-primary"
              style={{
                width: '100%',
                backgroundColor: '#ef4444',
                borderColor: '#dc2626',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: 700,
                padding: '11px 20px',
              }}
            >
              <LogOut size={16} /> Sign Out of Platform
            </button>
          </div>
        ) : (
          /* APPEAL & JUSTIFICATION TAB */
          <div style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '14px' }}>
              <h4 style={{ fontSize: '1rem', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} style={{ color: '#60a5fa' }} /> Formal Justification & Defense Statement
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                Your appeal will be directly forwarded to the institutional Academic Committee for verification.
              </p>
            </div>

            {submitSuccess && (
              <div style={{ padding: '10px 14px', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                <CheckCircle2 size={16} /> Justification submitted successfully. Authority status: <strong>Under Review</strong>
              </div>
            )}

            {errorMsg && (
              <div style={{ padding: '10px 14px', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', marginBottom: '14px', fontSize: '0.82rem' }}>
                {errorMsg}
              </div>
            )}

            {existingAppeal && (
              <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Existing Submission</span>
                  <span className="badge" style={{ backgroundColor: existingAppeal.status === 'pending' ? 'rgba(234, 179, 8, 0.2)' : existingAppeal.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: existingAppeal.status === 'pending' ? '#fbbf24' : existingAppeal.status === 'approved' ? '#34d399' : '#f87171', fontSize: '0.75rem' }}>
                    {existingAppeal.status === 'pending' ? '⏳ Under Authority Review' : existingAppeal.status === 'approved' ? '✓ Justification Accepted (Unbanned)' : '🚫 Appeal Rejected'}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                  Submitted on: <strong>{new Date(existingAppeal.submittedAt).toLocaleString()}</strong>
                </div>
                {existingAppeal.adjudicationRemarks && (
                  <div style={{ marginTop: '8px', fontSize: '0.8rem', color: existingAppeal.status === 'approved' ? '#34d399' : '#fca5a5', background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '6px' }}>
                    <strong>Authority Verdict:</strong> {existingAppeal.adjudicationRemarks}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleAppealSubmit}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '0.82rem', color: '#e2e8f0' }}>
                  Explain Your Case / Justification:
                </label>
                <textarea
                  rows={4}
                  className="form-textarea"
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Explain why this credential is valid, clarify any typo or misunderstanding, or detail your defense..."
                  style={{ width: '100%', fontSize: '0.85rem' }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontSize: '0.82rem', color: '#e2e8f0' }}>
                  Direct Verification Link / Proof URL (Optional):
                </label>
                <input
                  type="url"
                  className="form-input"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  placeholder="https://nptel.ac.in/noc/Ecertificate/?q=... or https://coursera.org/verify/..."
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('notice')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                >
                  Back to Notice
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || !justification.trim()}
                  style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', borderColor: '#2563eb', fontSize: '0.85rem', padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={15} /> {submitting ? 'Submitting...' : 'Submit Formal Appeal'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
