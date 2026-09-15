import React, { useState } from 'react';
import { addStudentCertificate } from '../services/firestoreService';
import { sendNotification, NOTIF_TYPES } from '../services/notificationService';
import {
  Award,
  UploadCloud,
  FileCheck,
  Calendar,
  Building,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';

export default function CertificateUploadModal({ isOpen, onClose, studentId, initialSkill, onCertificateAdded }) {
  const [skillName, setSkillName] = useState(initialSkill || '');
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('Coursera');
  const [credentialId, setCredentialId] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [fileDataUrl, setFileDataUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setFileDataUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const newCert = await addStudentCertificate({
        studentId: studentId || 'student_1',
        skillName,
        title: title || `${skillName} Certification`,
        issuer,
        credentialId: credentialId || `CRED-${Math.floor(100000 + Math.random() * 900000)}`,
        issueDate,
        documentUrl: fileDataUrl,
      });

      // Send simulated notification to Institution / Faculty for endorsement
      sendNotification({
        recipientId: 'inst_admin_1',
        type: NOTIF_TYPES.MESSAGE,
        title: 'New Skill Certificate Submitted for Verification',
        message: `Student submitted certificate "${title || skillName}" for skill endorsement.`,
        link: '/institution/students',
        metadata: { certificateId: newCert.id, studentId },
      });

      setSuccess(true);
      if (onCertificateAdded) {
        onCertificateAdded(newCert);
      }
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to submit certificate proof:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(10px)',
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '560px',
        padding: '28px',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        border: '1px solid var(--border-glow)',
        background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(15, 23, 42, 0.95) 100%)',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
            <Award size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 800, margin: 0 }}>
              Upload Certificate & Credential Proof
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Submit verified certificates from NPTEL, Coursera, AWS, or college for faculty endorsement.
            </p>
          </div>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--success)' }}>
            <CheckCircle2 size={48} style={{ margin: '0 auto 12px', color: 'var(--success)' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px 0' }}>Certificate Submitted!</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Proof forwarded to faculty evaluators for badge endorsement.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Competency / Skill Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. React, Python, Cloud Computing"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Certificate / Course Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Meta React Developer Professional Certificate"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid-2" style={{ marginBottom: '14px' }}>
              <div className="form-group">
                <label className="form-label">Issuing Organization</label>
                <select
                  className="form-select"
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                >
                  <option value="Coursera / Meta">Coursera / Meta</option>
                  <option value="Amazon Web Services (AWS)">Amazon Web Services (AWS)</option>
                  <option value="NPTEL / SWAYAM">NPTEL / SWAYAM</option>
                  <option value="Google Cloud">Google Cloud</option>
                  <option value="Udemy">Udemy</option>
                  <option value="HackerRank">HackerRank</option>
                  <option value="College / University Department">College / University</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Credential ID / Verify URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. AWS-98124 or URL"
                  value={credentialId}
                  onChange={(e) => setCredentialId(e.target.value)}
                />
              </div>
            </div>

            {/* Document Upload Zone */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Certificate Document (PDF / Image)</label>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '16px',
                border: '1px dashed var(--border-color)',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
              }}>
                <UploadCloud size={20} style={{ color: 'var(--primary)' }} />
                <span>{fileName ? `Attached: ${fileName}` : 'Choose Certificate File (PDF / PNG / JPG)'}</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Submitting...' : 'Submit Proof for Endorsement'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
