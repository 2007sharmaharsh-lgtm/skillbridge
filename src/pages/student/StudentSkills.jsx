import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getStudentProfile, updateStudentProfile, getOpportunities, getStudentCertificates } from '../../services/firestoreService';
import { calculateSkillMatch } from '../../utils/skillMatching';
import SkillSelector from '../../components/SkillSelector';
import SkillMatchCard from '../../components/SkillMatchCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import SkillConstellation from '../../components/SkillConstellation';
import CertificateUploadModal from '../../components/CertificateUploadModal';
import ApaarVerificationModal from '../../components/ApaarVerificationModal';
import { getStudentApaarRecord } from '../../services/apaarService';
import TiltCard from '../../components/TiltCard';
import { Sparkles, Save, Check, Layers, Target, Info, Zap, Award, ShieldCheck, UploadCloud, CheckCircle2, Lock, Fingerprint, GraduationCap } from 'lucide-react';

export default function StudentSkills() {
  const { currentUser } = useAuth();
  const [skills, setSkills] = useState([]);
  const [sampleOpportunities, setSampleOpportunities] = useState([]);
  const [selectedOppId, setSelectedOppId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [apaarRecord, setApaarRecord] = useState(null);
  const [apaarModalOpen, setApaarModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!currentUser) return;
      try {
        const [studentData, opps, certs] = await Promise.all([
          getStudentProfile(currentUser.uid),
          getOpportunities(),
          getStudentCertificates(currentUser.uid),
        ]);
        const apaarData = getStudentApaarRecord(currentUser.uid);
        setApaarRecord({
          ...apaarData,
          verified: apaarData?.verified || studentData?.apaarVerified || studentData?.aadhaarVerified || false,
          maskedApaar: apaarData?.maskedApaar || studentData?.maskedApaar || studentData?.maskedAadhaar || '',
        });
        setSkills(studentData?.skills || []);
        setSampleOpportunities(opps || []);
        setCertificates(certs || []);
        if (opps && opps.length > 0) {
          setSelectedOppId(opps[0].id);
        }
      } catch (err) {
        console.error('Failed to load skills:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser]);

  const isApaarVerified = !!apaarRecord?.verified || !!currentUser?.apaarVerified || !!currentUser?.aadhaarVerified;

  const handleSkillsChange = async (newSkills) => {
    if (!isApaarVerified) {
      setApaarModalOpen(true);
      return;
    }
    setSkills(newSkills);
    if (currentUser?.uid) {
      try {
        await updateStudentProfile(currentUser.uid, { skills: newSkills });
      } catch (err) {
        console.error('Auto-save skills error:', err);
      }
    }
  };

  const handleSaveSkills = async () => {
    if (!isApaarVerified) {
      setApaarModalOpen(true);
      return;
    }
    setSaving(true);
    setSaveSuccess(false);
    try {
      await updateStudentProfile(currentUser.uid, { skills });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving skills:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading skill inventory telemetry..." />;

  const currentOpportunity = sampleOpportunities.find(o => o.id === selectedOppId);
  const simulationResult = currentOpportunity
    ? calculateSkillMatch(skills, currentOpportunity.requiredSkills, currentOpportunity.preferredSkills)
    : null;

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles style={{ color: 'var(--primary)' }} /> Student Skill Profiler & Mapping
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Curate your technical competencies with verified proficiency levels. Changes directly impact your compatibility across recruiter postings.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setCertModalOpen(true)}
            className="btn btn-secondary"
            style={{ borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <UploadCloud size={16} style={{ color: '#38bdf8' }} /> Upload Certificate Proof
          </button>
          <Link
            to="/student/quiz"
            className="btn btn-secondary"
            style={{ borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Zap size={16} style={{ color: 'var(--primary)' }} /> Take Skill Assessment Quiz
          </Link>
          <button
            onClick={handleSaveSkills}
            className="btn btn-primary"
            disabled={saving}
            style={{ borderRadius: '10px' }}
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Skill Profile'}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div style={{ padding: '14px 18px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: 'var(--border-radius)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Check size={18} /> Mapped skills updated successfully in live Firestore database!
        </div>
      )}

      {/* Live Visual Constellation Display */}
      <div style={{ marginBottom: '28px' }}>
        <SkillConstellation skills={skills} height={260} />
      </div>

      {/* APAAR ID Identity Verification Gate Banner */}
      {!isApaarVerified ? (
        <div
          className="card"
          style={{
            marginBottom: '28px',
            background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.35) 0%, rgba(15, 23, 42, 0.9) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.45)',
            borderRadius: '14px',
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 20px rgba(59, 130, 246, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
                flexShrink: 0,
              }}
            >
              <GraduationCap size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Lock size={12} /> APAAR ID e-KYC Verification Required
                </span>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Ministry of Education & NEP 2020 Standard</span>
              </div>
              <h4 style={{ fontSize: '1.05rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>
                One Nation One Student ID (APAAR / ABC) Gate Active
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                To eliminate fraudulent skills and fake academic claims, skill curation is locked until your 12-digit APAAR ID is verified via DigiLocker.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setApaarModalOpen(true)}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '10px',
              fontWeight: 700,
              padding: '12px 20px',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
            }}
          >
            <ShieldCheck size={18} /> Verify APAAR ID to Unlock Skills
          </button>
        </div>
      ) : (
        <div
          style={{
            marginBottom: '24px',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '12px',
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldCheck size={24} style={{ color: '#34d399', flexShrink: 0 }} />
            <div>
              <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                APAAR ID Authenticated: <code>{apaarRecord?.maskedApaar || 'XXXX-XXXX-9821'}</code>
                <span className="badge" style={{ backgroundColor: 'rgba(52, 211, 153, 0.2)', color: '#34d399', fontSize: '0.72rem', padding: '2px 8px' }}>
                  ✓ Ministry of Education Verified
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                Automated Permanent Academic Account Registry verified. Full skill editing and credential endorsements unlocked.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setApaarModalOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <GraduationCap size={14} /> View APAAR Card
          </button>
        </div>
      )}

      {/* Skill Selector Area */}
      <div className="card" style={{ marginBottom: '28px', opacity: !isApaarVerified ? 0.75 : 1, position: 'relative' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} style={{ color: 'var(--primary)' }} /> Add & Manage Your Verified Skills
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
          Select from standardized industry keywords or enter custom tools, then assign your experience tier (Beginner, Intermediate, Advanced).
        </p>

        <SkillSelector
          skills={skills}
          onChange={handleSkillsChange}
        />
      </div>

      {/* Interactive Live Skill Mapping Simulator */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={18} style={{ color: 'var(--purple)' }} /> Live Skill Mapping Simulator
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Select an active job/internship to preview your instant match percentage, identify exact missing skill gaps, and receive upskilling targets.
            </p>
          </div>

          {sampleOpportunities.length > 0 && (
            <select
              className="form-select"
              style={{ width: '100%', maxWidth: '320px', borderRadius: '8px', minWidth: 0 }}
              value={selectedOppId}
              onChange={(e) => setSelectedOppId(e.target.value)}
            >
              {sampleOpportunities.map(opp => (
                <option key={opp.id} value={opp.id}>
                  {opp.title} ({opp.companyName})
                </option>
              ))}
            </select>
          )}
        </div>

        {simulationResult && currentOpportunity ? (
          <div>
            <div style={{ padding: '12px 16px', backgroundColor: 'rgba(10, 15, 29, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 'var(--border-radius)', marginBottom: '18px', fontSize: '0.85rem', color: '#f8fafc' }}>
              <strong style={{ color: 'var(--primary)' }}>Role:</strong> {currentOpportunity.title} at <strong style={{ color: '#ffffff' }}>{currentOpportunity.companyName}</strong> ({currentOpportunity.type})
            </div>

            <SkillMatchCard matchResult={simulationResult} compact={false} />

            {simulationResult.missingSkills.length > 0 && (
              <div style={{ marginTop: '18px', padding: '16px', backgroundColor: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: 'var(--border-radius)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Info size={20} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.86rem', color: '#fef3c7', lineHeight: 1.5 }}>
                  <strong style={{ color: '#fbbf24' }}>Upskilling Recommendation:</strong> Recruiters for this position prioritize <em>{simulationResult.missingSkills.join(', ')}</em>. Completing projects or certifications in these areas will elevate your match to 100%!
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            No opportunities available to test.
          </div>
        )}
      </div>

      {/* Verified Certificates & Credentials Proof Ledger */}
      <div className="card" style={{ marginTop: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} style={{ color: 'var(--primary)' }} /> Verified Certifications & Proof Ledger
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Credentials verified via faculty review or standardized tests, confirming your competence to employers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCertModalOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <UploadCloud size={14} /> Add New Proof
          </button>
        </div>

        {certificates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No certificates attached yet. Click "Upload Certificate Proof" to submit your certificates from Coursera, NPTEL, AWS, etc.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {certificates.map(c => (
              <div
                key={c.id}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: c.verified ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(251, 191, 36, 0.4)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: c.verified ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: c.verified ? '#34d399' : '#fbbf24',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    {c.verified ? <CheckCircle2 size={12} /> : <ShieldCheck size={12} />}
                    {c.verified ? 'Faculty Verified' : 'Under Faculty Review'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {c.issueDate}
                  </span>
                </div>

                <h4 style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 700, margin: '0 0 4px 0' }}>
                  {c.title}
                </h4>

                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px' }}>
                  Issuer: <strong style={{ color: '#cbd5e1' }}>{c.issuer}</strong>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '8px' }}>
                  <span>ID: <code>{c.credentialId}</code></span>
                  {c.verifiedBy && <span style={{ color: '#34d399' }}>By: {c.verifiedBy}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Certificate Modal */}
      <CertificateUploadModal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        studentId={currentUser?.uid}
        onCertificateAdded={(newCert) => setCertificates(prev => [newCert, ...prev])}
      />

      {/* APAAR ID Verification Modal */}
      <ApaarVerificationModal
        isOpen={apaarModalOpen}
        onClose={() => setApaarModalOpen(false)}
        studentUid={currentUser?.uid}
        onVerified={(record) => {
          setApaarRecord(record);
          setApaarModalOpen(false);
        }}
      />
    </div>
  );
}
