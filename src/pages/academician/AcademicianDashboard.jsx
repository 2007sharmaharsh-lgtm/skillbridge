import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getOpportunities,
  applyToOpportunity,
  getStudentApplications,
  getAllCertificates,
  verifyStudentCertificate,
  getAllStudents,
} from '../../services/firestoreService';
import { sendNotification, NOTIF_TYPES } from '../../services/notificationService';
import { banStudentByApaar, getAllBanAppeals, adjudicateBanAppeal } from '../../services/apaarService';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  GraduationCap,
  Briefcase,
  BookOpen,
  Award,
  CheckCircle2,
  ArrowRight,
  Building,
  PlusCircle,
  Search,
  ShieldCheck,
  Check,
  User,
  UserX,
  AlertTriangle,
  ShieldAlert,
  Lock,
  Scale,
  ExternalLink,
  MessageSquare,
  FileText,
  Clock,
  XCircle,
} from 'lucide-react';

export default function AcademicianDashboard() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('browse');
  const [opportunities, setOpportunities] = useState([]);
  const [appliedOppIds, setAppliedOppIds] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [students, setStudents] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [verifyingCertId, setVerifyingCertId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [banModalCert, setBanModalCert] = useState(null);
  const [banReason, setBanReason] = useState('');
  const [banning, setBanning] = useState(false);
  const [banSuccessMsg, setBanSuccessMsg] = useState('');
  const [adjudicatingAppealId, setAdjudicatingAppealId] = useState(null);
  const [verdictRemarks, setVerdictRemarks] = useState({});

  useEffect(() => {
    async function loadAcademicianData() {
      try {
        const [opps, apps, certs, allStudents] = await Promise.all([
          getOpportunities(),
          currentUser?.uid ? getStudentApplications(currentUser.uid) : Promise.resolve([]),
          getAllCertificates(),
          getAllStudents(),
        ]);
        const allAppeals = getAllBanAppeals();

        // Filter for Faculty / Academician relevance
        setOpportunities(opps || []);
        setAppliedOppIds((apps || []).map((a) => a.opportunityId));
        setCertificates(certs || []);
        setStudents(allStudents || []);
        setAppeals(allAppeals || []);
      } catch (err) {
        console.error('Failed to load academician portal data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAcademicianData();
  }, [currentUser]);

  const handleAdjudicate = async (appealId, decision) => {
    setAdjudicatingAppealId(appealId);
    try {
      const remarks = verdictRemarks[appealId] || (decision === 'approved' ? 'Student justification accepted after verification. Ban revoked.' : 'Appeal rejected. Fabricated credentials confirmed.');
      const res = await adjudicateBanAppeal(
        appealId,
        decision,
        remarks,
        currentUser?.name || 'Prof. Academic Review Committee'
      );
      if (res.success) {
        setAppeals(prev => prev.map(a => a.appealId === appealId ? res.appeal : a));
        if (decision === 'approved') {
          setBanSuccessMsg(`Appeal accepted! Student ${res.appeal.studentName} has been exonerated and reinstated.`);
        } else {
          setBanSuccessMsg(`Appeal rejected. Permanent APAAR ban confirmed for ${res.appeal.studentName}.`);
        }
        setTimeout(() => setBanSuccessMsg(''), 6000);
      }
    } catch (err) {
      console.error('Error adjudicating appeal:', err);
    } finally {
      setAdjudicatingAppealId(null);
    }
  };

  const handleVerifyCertificate = async (cert) => {
    setVerifyingCertId(cert.id);
    try {
      const verifierName = currentUser?.name || 'Faculty Evaluator';
      const updated = await verifyStudentCertificate(cert.id, verifierName);
      if (updated) {
        setCertificates(prev => prev.map(c => c.id === cert.id ? updated : c));

        // Notify student that their skill has been officially verified!
        sendNotification({
          recipientId: cert.studentId,
          type: NOTIF_TYPES.MESSAGE,
          title: `Skill Verified: ${cert.skillName} Endorsed!`,
          message: `Great news! Your competency in "${cert.skillName}" has been validated and endorsed by ${verifierName}.`,
          link: '/student/skills',
          metadata: { skillName: cert.skillName },
        });
      }
    } catch (err) {
      console.error('Error verifying certificate:', err);
    } finally {
      setVerifyingCertId(null);
    }
  };

  const handleBanStudent = async () => {
    if (!banModalCert || !banReason.trim()) return;
    setBanning(true);
    try {
      const res = await banStudentByApaar(
        banModalCert.studentId,
        banReason.trim(),
        currentUser?.name || 'Prof. Faculty Reviewer'
      );
      if (res.success) {
        setBanSuccessMsg(`Student and linked APAAR ID (${res.banRecord.maskedApaar || res.banRecord.maskedAadhaar}) have been permanently blacklisted.`);
        setCertificates((prev) => prev.filter((c) => c.studentId !== banModalCert.studentId));
        setBanModalCert(null);
        setBanReason('');
        setTimeout(() => setBanSuccessMsg(''), 6000);
      }
    } catch (err) {
      console.error('Ban student error:', err);
    } finally {
      setBanning(false);
    }
  };

  const handleApplyFacultyOpp = async (opp) => {
    if (!currentUser) return;
    setApplyingId(opp.id);
    try {
      await applyToOpportunity({
        studentId: currentUser.uid,
        opportunityId: opp.id,
        recruiterId: opp.recruiterId || 'rec_1',
      });
      setAppliedOppIds((prev) => [...prev, opp.id]);
    } catch (err) {
      console.error('Error applying to faculty program:', err);
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) return <LoadingSpinner text="Loading Academician & Faculty Hub..." />;

  const facultyOpportunities = opportunities.filter((o) => {
    const isFacultyType = ['Faculty Internship', 'Faculty Development Program', 'Research Collaboration', 'Internship', 'Job'].includes(o.type);
    const matchesSearch = o.title?.toLowerCase().includes(searchTerm.toLowerCase()) || o.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    return isFacultyType && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GraduationCap style={{ color: 'var(--primary)' }} /> Academician & Faculty Industrial Exposure Portal
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Empowering faculty members to participate in Faculty Internships, FDPs, Consultancy Projects, and Collaborative Industry Research.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(15, 23, 42, 0.7)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('browse')}
            className={`btn ${activeTab === 'browse' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '6px 14px', borderRadius: '8px' }}
          >
            Faculty Opportunities
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`btn ${activeTab === 'applications' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '6px 14px', borderRadius: '8px' }}
          >
            My Engagements ({appliedOppIds.length})
          </button>
          <button
            onClick={() => setActiveTab('endorsements')}
            className={`btn ${activeTab === 'endorsements' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '6px 14px', borderRadius: '8px' }}
          >
            Student Skill Endorsements ({certificates.filter(c => !c.verified).length})
          </button>
          <button
            onClick={() => setActiveTab('appeals')}
            className={`btn ${activeTab === 'appeals' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              fontSize: '0.85rem',
              padding: '6px 14px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeTab === 'appeals' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : undefined,
              borderColor: activeTab === 'appeals' ? '#b45309' : undefined,
            }}
          >
            <Scale size={15} /> Appeals & Defense Desk
            {appeals.filter(a => a.status === 'pending').length > 0 && (
              <span className="badge" style={{ backgroundColor: '#ef4444', color: '#ffffff', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '999px', fontWeight: 800 }}>
                {appeals.filter(a => a.status === 'pending').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'browse' ? (
        <div>
          {/* Search Bar */}
          <div style={{ marginBottom: '20px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search Faculty Development Programs (FDPs), Industrial Internships, Research Projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '42px', borderRadius: '10px', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {facultyOpportunities.map((opp) => {
              const hasApplied = appliedOppIds.includes(opp.id);
              return (
                <div key={opp.id} className="card" style={{ padding: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', marginBottom: '6px', display: 'inline-block' }}>
                        {opp.type || 'Faculty Initiative'}
                      </span>
                      <h3 style={{ fontSize: '1.2rem', color: '#ffffff', margin: 0 }}>
                        {opp.title}
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building size={14} />
                        <span>{opp.companyName}</span>
                        <span>•</span>
                        <span>{opp.location || 'Hybrid / Remote'}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Duration: <strong>{opp.duration || '4 Weeks'}</strong>
                      </div>
                      {opp.compensation && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600 }}>
                          Stipend / Honorarium: {opp.compensation}
                        </div>
                      )}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: 'var(--secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                    {opp.description}
                  </p>

                  <button
                    onClick={() => handleApplyFacultyOpp(opp)}
                    className={hasApplied ? 'btn btn-secondary' : 'btn btn-primary'}
                    disabled={hasApplied || applyingId === opp.id}
                    style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {hasApplied ? (
                      <>
                        <CheckCircle2 size={16} style={{ color: '#34d399' }} /> Application Submitted
                      </>
                    ) : (
                      <>
                        {applyingId === opp.id ? 'Submitting...' : 'Apply for Faculty Program'} <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : activeTab === 'applications' ? (
        /* My Engagements View */
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '16px' }}>
            Submitted Faculty & Research Applications
          </h3>

          {appliedOppIds.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              You have not submitted any applications for FDPs or Faculty Internships yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {appliedOppIds.map((id) => {
                const opp = opportunities.find((o) => o.id === id);
                return (
                  <div key={id} style={{ padding: '14px 18px', backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', color: '#ffffff', margin: 0 }}>{opp?.title || 'Faculty Program'}</h4>
                      <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0 0' }}>{opp?.companyName} • {opp?.type}</p>
                    </div>
                    <span className="badge" style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)', color: '#34d399' }}>
                      Application Under Review
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : activeTab === 'endorsements' ? (
        /* Student Skill Endorsements View */
        <div>
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#ffffff', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck style={{ color: '#34d399' }} /> Student Skill Credentials & Verification Desk
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Review submitted certificates from NPTEL, Coursera, and college labs. Officially endorse competencies to increase student placement readiness.
            </p>
          </div>

          {banSuccessMsg && (
            <div style={{ padding: '14px 18px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} /> {banSuccessMsg}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {certificates.map((cert) => {
              const student = students.find((s) => s.uid === cert.studentId) || { name: 'Aarav Sharma', branch: 'Computer Science' };
              return (
                <div
                  key={cert.id}
                  className="card"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                    borderLeft: cert.verified ? '4px solid #34d399' : '4px solid #fbbf24',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="badge" style={{
                        backgroundColor: cert.verified ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                        color: cert.verified ? '#34d399' : '#fbbf24',
                        fontWeight: 700,
                      }}>
                        {cert.verified ? '✓ Verified by Faculty' : 'Pending Faculty Review'}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Competency: <strong style={{ color: 'var(--primary)' }}>{cert.skillName}</strong>
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', color: '#ffffff', margin: '0 0 4px 0' }}>
                      {cert.title}
                    </h4>

                    <div style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                      <span>Student: <strong style={{ color: '#ffffff' }}>{student.name}</strong> ({student.branch})</span>
                      <span>Issuer: {cert.issuer}</span>
                      <span>ID: <code>{cert.credentialId}</code></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {cert.verified ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>
                        <CheckCircle2 size={18} /> Endorsed by {cert.verifiedBy}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleVerifyCertificate(cert)}
                        disabled={verifyingCertId === cert.id}
                        className="btn btn-primary btn-sm"
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontWeight: 700,
                        }}
                      >
                        <ShieldCheck size={16} /> {verifyingCertId === cert.id ? 'Endorsing...' : 'Endorse & Verify Skill'}
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setBanModalCert(cert);
                        setBanReason('Submitted forged certificate with fabricated serial code and fake university credentials.');
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{
                        borderColor: 'rgba(239, 68, 68, 0.4)',
                        color: '#f87171',
                        background: 'rgba(239, 68, 68, 0.08)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.8rem',
                      }}
                      title="Permanently Blacklist Student APAAR ID"
                    >
                      <UserX size={14} /> Report Fake / Ban APAAR ID
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* APPEALS & JUSTIFICATION ADJUDICATION DESK VIEW */
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Scale style={{ color: '#fbbf24' }} /> Academic Integrity Appeals & Defense Adjudication Desk
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
              Under principles of natural justice, sanctioned students may submit show-cause defenses and proof links. Review their justification below to either accept their case (revoking ban & un-blacklisting APAAR ID) or confirm permanent blacklist.
            </p>
          </div>

          {banSuccessMsg && (
            <div style={{ padding: '14px 18px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} /> {banSuccessMsg}
            </div>
          )}

          {appeals.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <CheckCircle2 size={36} style={{ color: '#34d399', margin: '0 auto 12px auto' }} />
              <h4 style={{ color: '#ffffff', margin: '0 0 6px 0' }}>No Pending Student Appeals</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                All academic integrity sanctions are currently uncontested or already adjudicated.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {appeals.map((appeal) => {
                const isPending = appeal.status === 'pending';
                const isApproved = appeal.status === 'approved';
                const isRejected = appeal.status === 'rejected';

                return (
                  <div
                    key={appeal.appealId}
                    className="card"
                    style={{
                      padding: '24px',
                      borderRadius: '14px',
                      borderLeft: isPending ? '4px solid #fbbf24' : isApproved ? '4px solid #34d399' : '4px solid #ef4444',
                      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.5) 100%)',
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span className="badge" style={{
                            backgroundColor: isPending ? 'rgba(251, 191, 36, 0.15)' : isApproved ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: isPending ? '#fbbf24' : isApproved ? '#34d399' : '#f87171',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}>
                            {isPending ? <Clock size={12} /> : isApproved ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                            {isPending ? 'Pending Committee Review' : isApproved ? 'Ban Revoked (Justification Accepted)' : 'Permanent Ban Upheld'}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                            Case ID: <code>{appeal.appealId}</code>
                          </span>
                        </div>

                        <h4 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>
                          {appeal.studentName}
                        </h4>
                        <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px' }}>
                          APAAR ID: <strong style={{ color: '#e2e8f0' }}>{appeal.maskedApaar || 'XXXX-XXXX-9821'}</strong> • Contact: {appeal.studentEmail}
                        </div>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                        Submitted: <strong>{new Date(appeal.submittedAt).toLocaleDateString()}</strong>
                      </div>
                    </div>

                    {/* Comparison: Sanction vs Student Justification */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                      {/* Left: Original Violation */}
                      <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', padding: '12px 14px' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f87171', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ShieldAlert size={14} /> Original Sanction Accusation:
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: 0, lineHeight: 1.45 }}>
                          "{appeal.banReason}"
                        </p>
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '6px' }}>
                          Sanctioned by: {appeal.bannedBy}
                        </div>
                      </div>

                      {/* Right: Student's Defense */}
                      <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '10px', padding: '12px 14px' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#60a5fa', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FileText size={14} /> Student's Submitted Justification:
                        </div>
                        <p style={{ fontSize: '0.84rem', color: '#ffffff', margin: 0, lineHeight: 1.45 }}>
                          "{appeal.justificationText}"
                        </p>
                        {appeal.proofUrl && (
                          <div style={{ marginTop: '8px' }}>
                            <a
                              href={appeal.proofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#38bdf8', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}
                            >
                              <ExternalLink size={12} /> Inspect Direct Verification Proof Link
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Verdict / Adjudication Controls */}
                    {isPending ? (
                      <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '14px' }}>
                        <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                          Authority Adjudication Remarks:
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Serial code verified with NPTEL database. Scanning typo confirmed, ban revoked."
                          value={verdictRemarks[appeal.appealId] || ''}
                          onChange={(e) => setVerdictRemarks({ ...verdictRemarks, [appeal.appealId]: e.target.value })}
                          style={{ marginBottom: '12px', fontSize: '0.82rem', width: '100%' }}
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => handleAdjudicate(appeal.appealId, 'rejected')}
                            disabled={adjudicatingAppealId === appeal.appealId}
                            className="btn btn-secondary btn-sm"
                            style={{
                              borderColor: 'rgba(239, 68, 68, 0.4)',
                              color: '#f87171',
                              background: 'rgba(239, 68, 68, 0.08)',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <UserX size={14} /> Reject Justification & Confirm Permanent Ban
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdjudicate(appeal.appealId, 'approved')}
                            disabled={adjudicatingAppealId === appeal.appealId}
                            className="btn btn-primary btn-sm"
                            style={{
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontWeight: 700,
                            }}
                          >
                            <CheckCircle2 size={16} /> Accept Justification & Revoke Ban (Restore Access)
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: isApproved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: isApproved ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '12px 14px', fontSize: '0.82rem', color: isApproved ? '#34d399' : '#f87171' }}>
                        <strong>Authority Adjudication Result:</strong> {appeal.adjudicationRemarks}
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                          Decided by: <strong>{appeal.adjudicatedBy}</strong> on {new Date(appeal.adjudicatedAt).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Permanent APAAR Blacklist & Ban Confirmation Modal */}
      {banModalCert && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(5, 8, 16, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', background: '#130d12', border: '2px solid rgba(239, 68, 68, 0.5)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', marginBottom: '12px' }}>
              <ShieldAlert size={26} />
              <h3 style={{ fontSize: '1.25rem', color: '#f87171', margin: 0 }}>
                Permanent APAAR ID Blacklist Action
              </h3>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '16px' }}>
              You are initiating a permanent national academic blacklist against <strong>{students.find(s => s.uid === banModalCert.studentId)?.name || 'this student'}</strong> for submitting fraudulent academic credentials or falsified certificates.
            </p>

            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '0.8rem', color: '#fca5a5' }}>
              <strong>⚠️ Lifetime APAAR Academic Registry Policy:</strong> Under NEP 2020 & Academic Bank of Credits (ABC), an APAAR ID is a lifetime unique student identifier. This action permanently flags this APAAR ID, barring the student from claiming skills, applying for campus opportunities, or circumventing bans with new accounts.
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>
                State Detailed Reason for Ban:
              </label>
              <textarea
                rows={3}
                className="form-textarea"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Describe fraudulent certificate, fake project links, or falsified GPA..."
                style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setBanModalCert(null)}
                className="btn btn-secondary"
                disabled={banning}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBanStudent}
                disabled={banning || !banReason.trim()}
                className="btn btn-primary"
                style={{ backgroundColor: '#ef4444', borderColor: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <UserX size={16} /> {banning ? 'Blacklisting...' : 'Confirm & Execute Permanent APAAR Ban'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
