import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getOpportunities,
  applyToOpportunity,
  getStudentApplications,
  getAllCertificates,
  verifyStudentCertificate,
  rejectStudentCertificate,
  getAllStudents,
} from '../../services/firestoreService';
import { sendNotification, NOTIF_TYPES } from '../../services/notificationService';
import { banStudentByApaar, getAllBanAppeals, adjudicateBanAppeal } from '../../services/apaarService';
import LoadingSpinner from '../../components/LoadingSpinner';
import TiltCard from '../../components/TiltCard';
import {
  GraduationCap,
  Radio,
  Briefcase,
  BookOpen,
  Award,
  CheckCircle2,
  ArrowRight,
  Building,
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
  Filter,
  Eye,
  HelpCircle,
  RefreshCw,
  Layers,
  Calendar,
  MapPin,
  Sparkles,
  X,
  ChevronRight,
  Info,
} from 'lucide-react';

export default function AcademicianDashboard() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('browse');
  
  // Core Data States
  const [opportunities, setOpportunities] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [appliedOppIds, setAppliedOppIds] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [students, setStudents] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [oppSearchTerm, setOppSearchTerm] = useState('');
  const [selectedOppCategory, setSelectedOppCategory] = useState('All');
  const [selectedOppMode, setSelectedOppMode] = useState('All');

  const [engagementFilter, setEngagementFilter] = useState('All');

  const [endorsementSearchTerm, setEndorsementSearchTerm] = useState('');
  const [endorsementFilter, setEndorsementFilter] = useState('All');

  const [appealFilter, setAppealFilter] = useState('All');

  // Modals & Action States
  const [applyModalOpp, setApplyModalOpp] = useState(null);
  const [applyForm, setApplyForm] = useState({
    specialization: 'Cloud DevOps & Systems Architecture',
    statement: '',
    hasNoc: true,
  });
  const [submittingApp, setSubmittingApp] = useState(false);

  const [selectedEngagement, setSelectedEngagement] = useState(null);

  const [inspectCertModal, setInspectCertModal] = useState(null);
  const [confirmEndorseCert, setConfirmEndorseCert] = useState(null);
  const [endorsingCertId, setEndorsingCertId] = useState(null);

  const [correctionModalCert, setCorrectionModalCert] = useState(null);
  const [correctionAction, setCorrectionAction] = useState('correction_requested'); // 'correction_requested' | 'rejected'
  const [correctionReason, setCorrectionReason] = useState('');
  const [submittingCorrection, setSubmittingCorrection] = useState(false);

  const [banModalCert, setBanModalCert] = useState(null);
  const [banReason, setBanReason] = useState('');
  const [banning, setBanning] = useState(false);

  const [adjudicatingAppealId, setAdjudicatingAppealId] = useState(null);
  const [verdictRemarks, setVerdictRemarks] = useState({});

  // Toast / Feedback Notification Message
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (type, title, message) => {
    setToastMessage({ type, title, message });
    setTimeout(() => setToastMessage(null), 5000);
  };

  useEffect(() => {
    async function loadAcademicianData() {
      try {
        const activeUserId = currentUser?.uid || 'faculty_1';
        const [opps, apps, certs, allStudents] = await Promise.all([
          getOpportunities(),
          getStudentApplications(activeUserId),
          getAllCertificates(),
          getAllStudents(),
        ]);
        const allAppeals = getAllBanAppeals();

        setOpportunities(opps || []);
        setMyApplications(apps || []);
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

  // Derived lists for Faculty Opportunities
  const facultyOpportunityTypes = [
    'Faculty Development Program',
    'Faculty Internship',
    'Research Collaboration',
    'Workshop',
    'Training',
  ];

  const filteredOpportunities = opportunities.filter((opp) => {
    if (!opp) return false;
    const isFac = facultyOpportunityTypes.includes(opp.type) || ['Internship', 'Job'].includes(opp.type);
    if (!isFac) return false;

    if (selectedOppCategory !== 'All' && opp.type !== selectedOppCategory) {
      return false;
    }

    if (selectedOppMode !== 'All') {
      const locStr = String(opp.location || '').toLowerCase();
      const oppMode = (opp.mode || (locStr.includes('remote') || locStr.includes('online') ? 'Online' : locStr.includes('hybrid') ? 'Hybrid' : 'Offline')).toLowerCase();
      if (oppMode !== selectedOppMode.toLowerCase()) {
        return false;
      }
    }

    if (oppSearchTerm.trim()) {
      const query = oppSearchTerm.toLowerCase();
      const matchTitle = String(opp.title || '').toLowerCase().includes(query);
      const matchCompany = String(opp.companyName || '').toLowerCase().includes(query);
      const matchDesc = String(opp.description || '').toLowerCase().includes(query);
      const matchSkills = Array.isArray(opp.requiredSkills) && opp.requiredSkills.some((s) => (typeof s === 'string' ? s : s?.name || '').toLowerCase().includes(query));
      if (!matchTitle && !matchCompany && !matchDesc && !matchSkills) {
        return false;
      }
    }

    return true;
  });

  // Derived lists for My Engagements
  const filteredEngagements = myApplications.filter((app) => {
    if (engagementFilter === 'All') return true;
    if (engagementFilter === 'Under Review') return app.status === 'under_review' || app.status === 'applied';
    if (engagementFilter === 'Accepted') return app.status === 'accepted' || app.status === 'shortlisted' || app.status === 'interview';
    if (engagementFilter === 'Waitlisted') return app.status === 'waitlisted';
    if (engagementFilter === 'Rejected') return app.status === 'rejected';
    return true;
  });

  // Derived lists for Student Skill Endorsements
  const filteredCertificates = certificates.filter((cert) => {
    if (!cert) return false;
    const student = students.find((s) => s.uid === cert.studentId) || { name: 'Aarav Sharma', branch: 'CSE' };
    
    // Status filter
    if (endorsementFilter === 'Pending') {
      if (cert.verified || cert.status === 'rejected') return false;
    } else if (endorsementFilter === 'Verified') {
      if (!cert.verified) return false;
    } else if (endorsementFilter === 'Action Required') {
      if (cert.status !== 'rejected' && cert.status !== 'correction_requested') return false;
    }

    // Search filter
    if (endorsementSearchTerm.trim()) {
      const q = endorsementSearchTerm.toLowerCase();
      const matchName = String(student?.name || '').toLowerCase().includes(q);
      const matchSkill = String(cert.skillName || '').toLowerCase().includes(q);
      const matchIssuer = String(cert.issuer || '').toLowerCase().includes(q);
      const matchTitle = String(cert.title || '').toLowerCase().includes(q);
      const matchCred = String(cert.credentialId || '').toLowerCase().includes(q);
      if (!matchName && !matchSkill && !matchIssuer && !matchTitle && !matchCred) {
        return false;
      }
    }

    return true;
  });

  // Derived lists for Appeals
  const filteredAppeals = appeals.filter((appeal) => {
    if (appealFilter === 'All') return true;
    if (appealFilter === 'Pending') return appeal.status === 'pending';
    if (appealFilter === 'Approved') return appeal.status === 'approved';
    if (appealFilter === 'Rejected') return appeal.status === 'rejected';
    if (appealFilter === 'Info Requested') return appeal.status === 'info_requested';
    return true;
  });

  // Action: Open Apply Modal
  const handleOpenApplyModal = (opp) => {
    setApplyModalOpp(opp);
    setApplyForm({
      specialization: 'Cloud DevOps & Systems Architecture',
      statement: `Interested in participating in ${opp.title} to translate state-of-the-art industry practices into engineering lab curriculum and research publications.`,
      hasNoc: true,
    });
  };

  // Action: Submit Application for Faculty Opportunity
  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!applyModalOpp) return;
    setSubmittingApp(true);

    try {
      const activeUserId = currentUser?.uid || 'faculty_1';
      const createdApp = await applyToOpportunity({
        studentId: activeUserId,
        opportunityId: applyModalOpp.id,
        recruiterId: applyModalOpp.recruiterId || 'rec_1',
        status: 'under_review',
        participationStatus: 'Upcoming',
        specialization: applyForm.specialization,
        facultyNotes: applyForm.statement,
        mode: applyModalOpp.mode || 'Hybrid',
      });

      setAppliedOppIds((prev) => [...prev, applyModalOpp.id]);
      setMyApplications((prev) => [createdApp, ...prev.filter((a) => a.id !== createdApp.id)]);

      showToast(
        'success',
        'Application Submitted Successfully!',
        `Your participation application for "${applyModalOpp.title}" has been transmitted to the host organization.`
      );

      setApplyModalOpp(null);
    } catch (err) {
      console.error('Error submitting application:', err);
      showToast('error', 'Submission Failed', 'An error occurred while submitting your application. Please try again.');
    } finally {
      setSubmittingApp(false);
    }
  };

  // Action: Verify / Endorse Student Skill
  const handleConfirmEndorse = async () => {
    if (!confirmEndorseCert) return;
    setEndorsingCertId(confirmEndorseCert.id);

    try {
      const verifierName = currentUser?.name || 'Prof. Ramesh Kulkarni';
      const updated = await verifyStudentCertificate(confirmEndorseCert.id, verifierName);

      if (updated) {
        setCertificates((prev) => prev.map((c) => (c.id === confirmEndorseCert.id ? updated : c)));

        // Send Student Notification
        sendNotification({
          recipientId: confirmEndorseCert.studentId,
          type: NOTIF_TYPES.MESSAGE,
          title: `Skill Verified: ${confirmEndorseCert.skillName} Endorsed! 🎓`,
          message: `Congratulations! Your competency in "${confirmEndorseCert.skillName}" has been validated and officially endorsed on your Academic Bank of Credits ledger by ${verifierName}.`,
          link: '/student/skills',
          metadata: { skillName: confirmEndorseCert.skillName },
        });

        showToast(
          'success',
          'Skill Endorsed & Verified',
          `Competency in ${confirmEndorseCert.skillName} officially credited to student ledger.`
        );
      }
    } catch (err) {
      console.error('Error verifying certificate:', err);
      showToast('error', 'Endorsement Error', 'Could not record verification. Please try again.');
    } finally {
      setEndorsingCertId(null);
      setConfirmEndorseCert(null);
    }
  };

  // Action: Reject or Request Correction on Student Certificate
  const handleSubmitCorrection = async (e) => {
    e.preventDefault();
    if (!correctionModalCert || !correctionReason.trim()) return;
    setSubmittingCorrection(true);

    try {
      const verifierName = currentUser?.name || 'Prof. Ramesh Kulkarni';
      const updated = await rejectStudentCertificate(
        correctionModalCert.id,
        correctionReason.trim(),
        verifierName,
        correctionAction
      );

      if (updated) {
        setCertificates((prev) => prev.map((c) => (c.id === correctionModalCert.id ? updated : c)));

        // Send Student Notification with feedback
        sendNotification({
          recipientId: correctionModalCert.studentId,
          type: NOTIF_TYPES.MESSAGE,
          title: correctionAction === 'correction_requested' ? `Correction Requested: ${correctionModalCert.skillName}` : `Certificate Submission Rejected`,
          message: `Faculty Review Notice from ${verifierName}: "${correctionReason.trim()}". Please update your credentials in the Skills tab.`,
          link: '/student/skills',
          metadata: { skillName: correctionModalCert.skillName },
        });

        showToast(
          'warning',
          correctionAction === 'correction_requested' ? 'Correction Requested' : 'Certificate Submission Rejected',
          `Feedback dispatched to student. Status has been updated in the evaluation ledger.`
        );

        setCorrectionModalCert(null);
        setCorrectionReason('');
      }
    } catch (err) {
      console.error('Error submitting correction:', err);
      showToast('error', 'Action Failed', 'Could not update certificate record.');
    } finally {
      setSubmittingCorrection(false);
    }
  };

  // Action: Report Fake / Permanent Ban APAAR ID
  const handleBanStudent = async () => {
    if (!banModalCert || !banReason.trim()) return;
    setBanning(true);

    try {
      const res = await banStudentByApaar(
        banModalCert.studentId,
        banReason.trim(),
        currentUser?.name || 'Prof. Ramesh Kulkarni'
      );

      if (res.success) {
        showToast(
          'error',
          'Permanent APAAR Blacklist Executed',
          `Student APAAR ID (${res.banRecord.maskedApaar || 'XXXX-XXXX-9821'}) has been entered into the Ministry of Education Anti-Fraud registry.`
        );
        setCertificates((prev) => prev.filter((c) => c.studentId !== banModalCert.studentId));
        setBanModalCert(null);
        setBanReason('');
      }
    } catch (err) {
      console.error('Ban student error:', err);
      showToast('error', 'Blacklist Action Failed', 'Could not register APAAR blacklist.');
    } finally {
      setBanning(false);
    }
  };

  // Action: Adjudicate Ban Appeal
  const handleAdjudicate = async (appealId, decision) => {
    setAdjudicatingAppealId(appealId);
    try {
      const customRemarks = verdictRemarks[appealId];
      const defaultRemarks =
        decision === 'approved'
          ? 'Student justification & scanned grade sheet verified with issuing authority. Ban revoked.'
          : decision === 'info_requested'
          ? 'Physical certificate submission and in-person disciplinary hearing requested before final determination.'
          : 'Appeal rejected. Falsified serial code and non-accredited certificate confirmed.';

      const remarks = customRemarks || defaultRemarks;
      const res = await adjudicateBanAppeal(
        appealId,
        decision,
        remarks,
        currentUser?.name || 'Prof. Ramesh Kulkarni (Discipline Committee)'
      );

      if (res.success) {
        setAppeals((prev) => prev.map((a) => (a.appealId === appealId ? res.appeal : a)));

        if (decision === 'approved') {
          showToast(
            'success',
            'Appeal Approved & Ban Revoked',
            `Student ${res.appeal.studentName} has been exonerated and restored to good standing.`
          );
        } else if (decision === 'info_requested') {
          showToast(
            'warning',
            'Additional Information Requested',
            `Notice sent to ${res.appeal.studentName} requesting physical credential verification.`
          );
        } else {
          showToast(
            'error',
            'Appeal Dismissed: Permanent Ban Upheld',
            `Permanent blacklist confirmed for candidate ${res.appeal.studentName}.`
          );
        }
      }
    } catch (err) {
      console.error('Error adjudicating appeal:', err);
      showToast('error', 'Adjudication Error', 'Failed to record committee determination.');
    } finally {
      setAdjudicatingAppealId(null);
    }
  };

  if (loading) return <LoadingSpinner text="Loading Faculty Academic Command Hub..." />;

  // Quick Stats Counts
  const statAvailableOpps = facultyOpportunityTypes
    .map((t) => opportunities.filter((o) => o.type === t).length)
    .reduce((a, b) => a + b, 0) || filteredOpportunities.length;
  const statMyEngagements = myApplications.length;
  const statPendingEndorsements = certificates.filter((c) => !c.verified && c.status !== 'rejected').length;
  const statActiveAppeals = appeals.filter((a) => a.status === 'pending').length;

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Dynamic Alert Banner */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '84px',
            right: '24px',
            zIndex: 9999,
            backgroundColor:
              toastMessage.type === 'success'
                ? 'rgba(16, 185, 129, 0.95)'
                : toastMessage.type === 'error'
                ? 'rgba(239, 68, 68, 0.95)'
                : 'rgba(245, 158, 11, 0.95)',
            color: '#ffffff',
            padding: '16px 22px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(12px)',
            maxWidth: '420px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
          ) : toastMessage.type === 'error' ? (
            <ShieldAlert size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
          ) : (
            <AlertTriangle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '2px' }}>{toastMessage.title}</div>
            <div style={{ fontSize: '0.84rem', opacity: 0.95, lineHeight: 1.4 }}>{toastMessage.message}</div>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Faculty HUD Cockpit Welcome Banner */}
      <TiltCard maxTilt={3} scale={1.004} glare={true} style={{ marginBottom: '22px' }}>
        <div
          className="card"
          style={{
            padding: '26px 30px',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.45)',
            borderRadius: '16px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Cyber Accent Ambient Glow */}
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '18px', position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                <Radio size={14} style={{ color: '#f59e0b', animation: 'beaconPulse 1.8s infinite' }} /> Faculty Academic & Research Command Center
              </div>
              <h2 style={{ fontSize: '1.85rem', color: '#ffffff', marginBottom: '6px', fontWeight: 800 }}>
                Welcome, {currentUser?.name || 'Prof. Ramesh Kulkarni'}! 🎓
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.92rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span>Department of Computer Science & Engineering</span>
                <span>•</span>
                <span>National Institute of Technology, Delhi</span>
                <span>•</span>
                <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
                  Senior Faculty / Evaluator
                </span>
              </p>
            </div>

            {/* Quick Stats Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(105px, 1fr))', gap: '10px', width: '100%', maxWidth: '520px' }}>
              {/* Stat 1: Available Opportunities */}
              <div
                onClick={() => setActiveTab('browse')}
                style={{
                  backgroundColor: activeTab === 'browse' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                  border: activeTab === 'browse' ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#60a5fa' }}>{statAvailableOpps}</div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginTop: '2px' }}>
                  Opportunities
                </div>
              </div>

              {/* Stat 2: My Engagements */}
              <div
                onClick={() => setActiveTab('applications')}
                style={{
                  backgroundColor: activeTab === 'applications' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                  border: activeTab === 'applications' ? '1px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#c084fc' }}>{statMyEngagements}</div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginTop: '2px' }}>
                  Engagements
                </div>
              </div>

              {/* Stat 3: Pending Endorsements */}
              <div
                onClick={() => setActiveTab('endorsements')}
                style={{
                  backgroundColor: activeTab === 'endorsements' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                  border: activeTab === 'endorsements' ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24' }}>{statPendingEndorsements}</div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginTop: '2px' }}>
                  Pending Skills
                </div>
              </div>

              {/* Stat 4: Active Appeals */}
              <div
                onClick={() => setActiveTab('appeals')}
                style={{
                  backgroundColor: activeTab === 'appeals' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                  border: activeTab === 'appeals' ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171' }}>{statActiveAppeals}</div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginTop: '2px' }}>
                  Ban Appeals
                </div>
              </div>
            </div>
          </div>
        </div>
      </TiltCard>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(15, 23, 42, 0.8)', padding: '6px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '22px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('browse')}
          className={`btn ${activeTab === 'browse' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.86rem', padding: '10px 18px', borderRadius: '8px', flex: 1, minWidth: '170px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Briefcase size={16} /> Faculty Opportunities ({statAvailableOpps})
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`btn ${activeTab === 'applications' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.86rem', padding: '10px 18px', borderRadius: '8px', flex: 1, minWidth: '170px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Layers size={16} /> My Engagements ({statMyEngagements})
        </button>

        <button
          onClick={() => setActiveTab('endorsements')}
          className={`btn ${activeTab === 'endorsements' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.86rem', padding: '10px 18px', borderRadius: '8px', flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <ShieldCheck size={16} /> Student Skill Endorsements ({statPendingEndorsements})
        </button>

        <button
          onClick={() => setActiveTab('appeals')}
          className={`btn ${activeTab === 'appeals' ? 'btn-primary' : 'btn-secondary'}`}
          style={{
            fontSize: '0.86rem',
            padding: '10px 18px',
            borderRadius: '8px',
            flex: 1,
            minWidth: '190px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: activeTab === 'appeals' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : undefined,
            borderColor: activeTab === 'appeals' ? '#b45309' : undefined,
          }}
        >
          <Scale size={16} /> Appeals & Defense Desk
          {statActiveAppeals > 0 && (
            <span style={{ backgroundColor: '#ef4444', color: '#ffffff', fontSize: '0.72rem', padding: '2px 7px', borderRadius: '999px', fontWeight: 800 }}>
              {statActiveAppeals}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: FACULTY OPPORTUNITIES                                              */}
      {/* ========================================================================= */}
      {activeTab === 'browse' && (
        <div>
          {/* Filters & Search Control Bar */}
          <div className="card" style={{ padding: '18px 20px', marginBottom: '20px', backgroundColor: 'rgba(15, 23, 42, 0.65)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              {/* Search Bar */}
              <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
                <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search FDPs, Industry Internships, Research Collaborations, Workshops..."
                  value={oppSearchTerm}
                  onChange={(e) => setOppSearchTerm(e.target.value)}
                  style={{ paddingLeft: '42px', borderRadius: '10px', width: '100%' }}
                />
              </div>

              {/* Mode Pills Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginRight: '4px', fontWeight: 600 }}>Mode:</span>
                {['All', 'Online', 'Offline', 'Hybrid'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSelectedOppMode(mode)}
                    className="btn btn-sm"
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      backgroundColor: selectedOppMode === mode ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      color: selectedOppMode === mode ? '#60a5fa' : '#94a3b8',
                      borderColor: selectedOppMode === mode ? '#3b82f6' : 'rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    {mode === 'All' ? 'All Modes' : mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Pills Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginRight: '4px', fontWeight: 600 }}>Category:</span>
              {[
                { label: 'All Opportunities', value: 'All' },
                { label: 'FDP Programs', value: 'Faculty Development Program' },
                { label: 'Faculty Internships', value: 'Faculty Internship' },
                { label: 'Research Collaborations', value: 'Research Collaboration' },
                { label: 'Workshops', value: 'Workshop' },
                { label: 'Trainings', value: 'Training' },
              ].map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedOppCategory(cat.value)}
                  className="btn btn-sm"
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    backgroundColor: selectedOppCategory === cat.value ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    color: selectedOppCategory === cat.value ? '#fbbf24' : '#cbd5e1',
                    borderColor: selectedOppCategory === cat.value ? '#f59e0b' : 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Opportunities List */}
          {filteredOpportunities.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '50px 20px', borderRadius: '14px' }}>
              <Briefcase size={40} style={{ color: '#94a3b8', margin: '0 auto 14px auto' }} />
              <h4 style={{ color: '#ffffff', marginBottom: '8px' }}>No Matching Faculty Opportunities Found</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '460px', margin: '0 auto 16px auto' }}>
                Try adjusting your search criteria or clear your category/mode filters to view all available academic and industrial programs.
              </p>
              <button
                onClick={() => {
                  setOppSearchTerm('');
                  setSelectedOppCategory('All');
                  setSelectedOppMode('All');
                }}
                className="btn btn-secondary btn-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredOpportunities.map((opp) => {
                const hasApplied = appliedOppIds.includes(opp.id);
                const locStr = String(opp.location || '').toLowerCase();
                const modeLabel = opp.mode || (locStr.includes('remote') || locStr.includes('online') ? 'Online' : locStr.includes('hybrid') ? 'Hybrid' : 'Offline');

                return (
                  <div
                    key={opp.id}
                    className="card"
                    style={{
                      padding: '24px',
                      borderRadius: '14px',
                      border: hasApplied ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                      background: hasApplied
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.04) 0%, rgba(15, 23, 42, 0.7) 100%)'
                        : 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.5) 100%)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                          <span
                            className="badge"
                            style={{
                              backgroundColor:
                                opp.type === 'Faculty Development Program'
                                  ? 'rgba(59, 130, 246, 0.2)'
                                  : opp.type === 'Faculty Internship'
                                  ? 'rgba(168, 85, 247, 0.2)'
                                  : opp.type === 'Research Collaboration'
                                  ? 'rgba(245, 158, 11, 0.2)'
                                  : 'rgba(20, 184, 166, 0.2)',
                              color:
                                opp.type === 'Faculty Development Program'
                                  ? '#60a5fa'
                                  : opp.type === 'Faculty Internship'
                                  ? '#c084fc'
                                  : opp.type === 'Research Collaboration'
                                  ? '#fbbf24'
                                  : '#2dd4bf',
                              fontWeight: 700,
                            }}
                          >
                            {opp.type || 'Faculty Initiative'}
                          </span>

                          <span
                            className="badge"
                            style={{
                              backgroundColor:
                                modeLabel === 'Online'
                                  ? 'rgba(16, 185, 129, 0.15)'
                                  : modeLabel === 'Hybrid'
                                  ? 'rgba(245, 158, 11, 0.15)'
                                  : 'rgba(99, 102, 241, 0.15)',
                              color:
                                modeLabel === 'Online'
                                  ? '#34d399'
                                  : modeLabel === 'Hybrid'
                                  ? '#fbbf24'
                                  : '#818cf8',
                            }}
                          >
                            {modeLabel}
                          </span>

                          {hasApplied && (
                            <span className="badge" style={{ backgroundColor: 'rgba(52, 211, 153, 0.2)', color: '#34d399', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={13} /> Application Submitted
                            </span>
                          )}
                        </div>

                        <h3 style={{ fontSize: '1.28rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>
                          {opp.title}
                        </h3>

                        <div style={{ fontSize: '0.86rem', color: '#94a3b8', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#e2e8f0', fontWeight: 600 }}>
                            <Building size={14} style={{ color: '#f59e0b' }} /> {opp.companyName}
                          </span>
                          <span>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={13} /> {opp.location || 'Hybrid / Virtual'}
                          </span>
                          <span>•</span>
                          <span>Duration: <strong style={{ color: '#ffffff' }}>{opp.duration || '4 Weeks'}</strong></span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', minWidth: '160px' }}>
                        {opp.compensation && (
                          <div style={{ fontSize: '0.92rem', color: '#34d399', fontWeight: 700 }}>
                            {opp.compensation}
                          </div>
                        )}
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
                          Deadline: {opp.deadline || 'Rolling Admissions'}
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '16px', lineHeight: 1.55 }}>
                      {opp.description}
                    </p>

                    {/* Competency / Domain Badges */}
                    {opp.requiredSkills && opp.requiredSkills.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '18px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Prerequisites:</span>
                        {opp.requiredSkills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              color: '#cbd5e1',
                              fontSize: '0.75rem',
                              padding: '2px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        Open Seats: <strong style={{ color: '#ffffff' }}>{opp.openings || 15} Faculty Seats</strong>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {hasApplied ? (
                          <button
                            onClick={() => setActiveTab('applications')}
                            className="btn btn-secondary btn-sm"
                            style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', borderColor: 'rgba(52, 211, 153, 0.4)', color: '#34d399' }}
                          >
                            <CheckCircle2 size={16} /> View in My Engagements <ArrowRight size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenApplyModal(opp)}
                            className="btn btn-primary"
                            style={{
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontWeight: 700,
                              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            }}
                          >
                            Apply for Faculty Program <ArrowRight size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MY ENGAGEMENTS                                                     */}
      {/* ========================================================================= */}
      {activeTab === 'applications' && (
        <div>
          {/* Header & Status Filter */}
          <div className="card" style={{ padding: '18px 20px', marginBottom: '20px', backgroundColor: 'rgba(15, 23, 42, 0.65)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.22rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>
                  Submitted Faculty Engagements & Applications
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                  Track institutional clearance status, host evaluations, and upcoming participation schedules.
                </p>
              </div>

              {/* Status Filter Pills */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['All', 'Under Review', 'Accepted', 'Waitlisted', 'Rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setEngagementFilter(status)}
                    className="btn btn-sm"
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      backgroundColor: engagementFilter === status ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      color: engagementFilter === status ? '#c084fc' : '#94a3b8',
                      borderColor: engagementFilter === status ? '#a855f7' : 'rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredEngagements.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '50px 20px', borderRadius: '14px' }}>
              <Layers size={44} style={{ color: '#94a3b8', margin: '0 auto 14px auto' }} />
              <h4 style={{ color: '#ffffff', marginBottom: '8px' }}>No Submitted Engagements Found</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '460px', margin: '0 auto 18px auto' }}>
                You haven't submitted applications matching the selected criteria. Explore live Faculty Development Programs, industrial internships, and research sabbaticals.
              </p>
              <button
                onClick={() => setActiveTab('browse')}
                className="btn btn-primary"
                style={{ borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Briefcase size={16} /> Explore Faculty Opportunities <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredEngagements.map((app) => {
                const opp = opportunities.find((o) => o.id === app.opportunityId) || {
                  title: 'National Faculty Initiative Program',
                  companyName: 'Academic Council Partner',
                  type: 'Faculty Initiative',
                  duration: '4 Weeks',
                };

                const isAccepted = app.status === 'accepted' || app.status === 'shortlisted';
                const isUnderReview = app.status === 'under_review' || app.status === 'applied';
                const isRejected = app.status === 'rejected';

                const participationStatus = app.participationStatus || (isAccepted ? 'Ongoing' : 'Upcoming');

                return (
                  <div
                    key={app.id}
                    className="card"
                    style={{
                      padding: '22px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(15, 23, 42, 0.75)',
                      border: isAccepted ? '1px solid rgba(52, 211, 153, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                          {/* Program Type Badge */}
                          <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                            {opp.type}
                          </span>

                          {/* Mode Badge */}
                          <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.07)', color: '#cbd5e1' }}>
                            {app.mode || opp.mode || 'Hybrid'}
                          </span>

                          {/* Evaluation Status Badge */}
                          <span
                            className="badge"
                            style={{
                              backgroundColor: isAccepted
                                ? 'rgba(52, 211, 153, 0.2)'
                                : isUnderReview
                                ? 'rgba(245, 158, 11, 0.2)'
                                : 'rgba(239, 68, 68, 0.2)',
                              color: isAccepted ? '#34d399' : isUnderReview ? '#fbbf24' : '#f87171',
                              fontWeight: 700,
                            }}
                          >
                            {isAccepted ? '✓ Application Accepted' : isUnderReview ? 'Application Under Review' : 'Not Selected'}
                          </span>

                          {/* Participation Status */}
                          <span
                            className="badge"
                            style={{
                              backgroundColor:
                                participationStatus === 'Ongoing'
                                  ? 'rgba(16, 185, 129, 0.2)'
                                  : participationStatus === 'Completed'
                                  ? 'rgba(148, 163, 184, 0.2)'
                                  : 'rgba(59, 130, 246, 0.2)',
                              color:
                                participationStatus === 'Ongoing'
                                  ? '#34d399'
                                  : participationStatus === 'Completed'
                                  ? '#94a3b8'
                                  : '#60a5fa',
                            }}
                          >
                            Status: {participationStatus}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '1.2rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>
                          {opp.title}
                        </h4>

                        <div style={{ fontSize: '0.84rem', color: '#94a3b8', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{opp.companyName}</span>
                          <span>•</span>
                          <span>Applied on: {new Date(app.appliedAt || Date.now()).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Duration: {opp.duration || '4 Weeks'}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedEngagement({ app, opp })}
                        className="btn btn-secondary btn-sm"
                        style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Eye size={14} /> Engagement Details
                      </button>
                    </div>

                    {/* Stored Specialization or Faculty Note */}
                    {(app.specialization || app.facultyNotes) && (
                      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '10px 14px', marginTop: '10px', fontSize: '0.82rem', color: '#cbd5e1' }}>
                        {app.specialization && (
                          <div style={{ marginBottom: app.facultyNotes ? '4px' : '0' }}>
                            <strong style={{ color: '#94a3b8' }}>Focus Specialization:</strong> {app.specialization}
                          </div>
                        )}
                        {app.facultyNotes && (
                          <div>
                            <strong style={{ color: '#94a3b8' }}>Submitted Statement:</strong> "{app.facultyNotes}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: STUDENT SKILL ENDORSEMENTS                                         */}
      {/* ========================================================================= */}
      {activeTab === 'endorsements' && (
        <div>
          {/* Header & Controls Bar */}
          <div className="card" style={{ padding: '18px 20px', marginBottom: '20px', backgroundColor: 'rgba(15, 23, 42, 0.65)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#ffffff', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck style={{ color: '#34d399' }} /> Student Skill Credentials & Academic Endorsement Desk
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                  Validate student certifications from NPTEL, Coursera, HackerRank, and college laboratory exams to endorse their Academic Bank of Credits (ABC).
                </p>
              </div>

              {/* Status Filter */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { label: 'All Submissions', value: 'All' },
                  { label: 'Pending Review', value: 'Pending' },
                  { label: 'Verified & Endorsed', value: 'Verified' },
                  { label: 'Action Required', value: 'Action Required' },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setEndorsementFilter(item.value)}
                    className="btn btn-sm"
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      backgroundColor: endorsementFilter === item.value ? 'rgba(52, 211, 153, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      color: endorsementFilter === item.value ? '#34d399' : '#94a3b8',
                      borderColor: endorsementFilter === item.value ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search by student name, competency skill, issuer (NPTEL, Coursera), or credential ID..."
                value={endorsementSearchTerm}
                onChange={(e) => setEndorsementSearchTerm(e.target.value)}
                style={{ paddingLeft: '38px', borderRadius: '10px', fontSize: '0.85rem', width: '100%' }}
              />
            </div>
          </div>

          {filteredCertificates.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '45px 20px', borderRadius: '14px' }}>
              <CheckCircle2 size={40} style={{ color: '#34d399', margin: '0 auto 12px auto' }} />
              <h4 style={{ color: '#ffffff', marginBottom: '6px' }}>No Pending Certificates Matching Filter</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                All student certificate submissions under this criteria have been validated or resolved.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredCertificates.map((cert) => {
                const student = students.find((s) => s.uid === cert.studentId) || {
                  name: 'Aarav Sharma',
                  branch: 'Computer Science & Engineering',
                  collegeName: 'NIT Delhi',
                };

                const isVerified = cert.verified;
                const isRejected = cert.status === 'rejected';
                const isCorrectionReq = cert.status === 'correction_requested';

                return (
                  <div
                    key={cert.id}
                    className="card"
                    style={{
                      padding: '22px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      borderLeft: isVerified
                        ? '4px solid #10b981'
                        : isRejected
                        ? '4px solid #ef4444'
                        : isCorrectionReq
                        ? '4px solid #f59e0b'
                        : '4px solid #fbbf24',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '14px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: isVerified
                                ? 'rgba(52, 211, 153, 0.18)'
                                : isRejected
                                ? 'rgba(239, 68, 68, 0.18)'
                                : isCorrectionReq
                                ? 'rgba(245, 158, 11, 0.18)'
                                : 'rgba(251, 191, 36, 0.18)',
                              color: isVerified
                                ? '#34d399'
                                : isRejected
                                ? '#f87171'
                                : isCorrectionReq
                                ? '#fbbf24'
                                : '#f59e0b',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {isVerified ? (
                              <>
                                <CheckCircle2 size={13} /> Verified by Faculty
                              </>
                            ) : isRejected ? (
                              <>
                                <XCircle size={13} /> Submission Rejected
                              </>
                            ) : isCorrectionReq ? (
                              <>
                                <AlertTriangle size={13} /> Correction Requested
                              </>
                            ) : (
                              <>
                                <Clock size={13} /> Pending Faculty Review
                              </>
                            )}
                          </span>

                          <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                            Competency: <strong style={{ color: '#38bdf8' }}>{cert.skillName}</strong>
                          </span>
                        </div>

                        <h4 style={{ fontSize: '1.15rem', color: '#ffffff', margin: '0 0 6px 0', fontWeight: 700 }}>
                          {cert.title}
                        </h4>

                        <div style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                          <span>
                            Student: <strong style={{ color: '#ffffff' }}>{student.name}</strong> ({student.branch})
                          </span>
                          <span>Issuer: <strong style={{ color: '#cbd5e1' }}>{cert.issuer}</strong></span>
                          <span>
                            Credential ID: <code>{cert.credentialId}</code>
                          </span>
                          <span>Issued: {cert.issueDate || 'Recent'}</span>
                        </div>

                        {/* Rejection / Correction Reason Notice if applicable */}
                        {cert.rejectionReason && (
                          <div style={{ marginTop: '10px', padding: '8px 12px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', fontSize: '0.78rem', color: '#fca5a5' }}>
                            <strong>Review Feedback:</strong> {cert.rejectionReason} (by {cert.reviewedBy || 'Faculty'})
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {/* 1. View / Inspect Certificate */}
                        <button
                          onClick={() => setInspectCertModal({ cert, student })}
                          className="btn btn-secondary btn-sm"
                          style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}
                        >
                          <Eye size={14} /> Inspect Certificate
                        </button>

                        {/* 2. Endorse Button or Endorsed Badge */}
                        {isVerified ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '0.84rem', fontWeight: 700, padding: '4px 10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                            <CheckCircle2 size={16} /> Endorsed by {cert.verifiedBy}
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmEndorseCert(cert)}
                            disabled={endorsingCertId === cert.id}
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
                            <ShieldCheck size={16} /> {endorsingCertId === cert.id ? 'Endorsing...' : 'Endorse & Verify'}
                          </button>
                        )}

                        {/* 3. Reject / Request Correction Button */}
                        {!isVerified && (
                          <button
                            onClick={() => {
                              setCorrectionModalCert(cert);
                              setCorrectionReason('');
                              setCorrectionAction('correction_requested');
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{
                              borderColor: 'rgba(245, 158, 11, 0.3)',
                              color: '#fbbf24',
                              background: 'rgba(245, 158, 11, 0.06)',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '0.8rem',
                            }}
                          >
                            <AlertTriangle size={13} /> Reject / Request Correction
                          </button>
                        )}

                        {/* 4. Report Fake / Blacklist APAAR ID */}
                        <button
                          onClick={() => {
                            setBanModalCert(cert);
                            setBanReason('Submitted fabricated credential with counterfeit verification seal.');
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
                          <UserX size={14} /> Report Fake
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: APPEALS & DEFENSE DESK                                             */}
      {/* ========================================================================= */}
      {activeTab === 'appeals' && (
        <div>
          {/* Header & Status Filter */}
          <div className="card" style={{ padding: '18px 20px', marginBottom: '20px', backgroundColor: 'rgba(15, 23, 42, 0.65)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#ffffff', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Scale style={{ color: '#fbbf24' }} /> Academic Integrity Appeals & Show-Cause Adjudication Desk
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                  Natural justice review panel under NEP 2020: Adjudicate student show-cause appeals against APAAR sanctions by inspecting justification statements and live verification proofs.
                </p>
              </div>

              {/* Status Filter */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { label: 'All Appeals', value: 'All' },
                  { label: 'Pending Review', value: 'Pending' },
                  { label: 'Ban Revoked', value: 'Approved' },
                  { label: 'Ban Upheld', value: 'Rejected' },
                  { label: 'Info Requested', value: 'Info Requested' },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setAppealFilter(item.value)}
                    className="btn btn-sm"
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      backgroundColor: appealFilter === item.value ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      color: appealFilter === item.value ? '#fbbf24' : '#94a3b8',
                      borderColor: appealFilter === item.value ? '#f59e0b' : 'rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredAppeals.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '45px 20px', borderRadius: '14px' }}>
              <CheckCircle2 size={40} style={{ color: '#34d399', margin: '0 auto 12px auto' }} />
              <h4 style={{ color: '#ffffff', marginBottom: '6px' }}>No Pending Show-Cause Appeals</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                All academic discipline appeals have been thoroughly investigated and determined.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {filteredAppeals.map((appeal) => {
                const isPending = appeal.status === 'pending';
                const isApproved = appeal.status === 'approved';
                const isRejected = appeal.status === 'rejected';
                const isInfoRequested = appeal.status === 'info_requested';

                return (
                  <div
                    key={appeal.appealId}
                    className="card"
                    style={{
                      padding: '24px',
                      borderRadius: '14px',
                      borderLeft: isPending
                        ? '4px solid #fbbf24'
                        : isApproved
                        ? '4px solid #34d399'
                        : isInfoRequested
                        ? '4px solid #38bdf8'
                        : '4px solid #ef4444',
                      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.5) 100%)',
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: isPending
                                ? 'rgba(251, 191, 36, 0.15)'
                                : isApproved
                                ? 'rgba(52, 211, 153, 0.15)'
                                : isInfoRequested
                                ? 'rgba(56, 189, 248, 0.15)'
                                : 'rgba(239, 68, 68, 0.15)',
                              color: isPending
                                ? '#fbbf24'
                                : isApproved
                                ? '#34d399'
                                : isInfoRequested
                                ? '#38bdf8'
                                : '#f87171',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {isPending ? (
                              <Clock size={12} />
                            ) : isApproved ? (
                              <CheckCircle2 size={12} />
                            ) : isInfoRequested ? (
                              <Info size={12} />
                            ) : (
                              <XCircle size={12} />
                            )}
                            {isPending
                              ? 'Pending Committee Review'
                              : isApproved
                              ? 'Ban Revoked (Justification Accepted)'
                              : isInfoRequested
                              ? 'Additional Information Requested'
                              : 'Permanent Ban Upheld'}
                          </span>

                          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                            Case ID: <code>{appeal.appealId}</code>
                          </span>
                        </div>

                        <h4 style={{ fontSize: '1.2rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>
                          {appeal.studentName}
                        </h4>
                        <div style={{ fontSize: '0.84rem', color: '#94a3b8', marginTop: '2px' }}>
                          APAAR ID: <strong style={{ color: '#e2e8f0' }}>{appeal.maskedApaar || 'XXXX-XXXX-9821'}</strong> • Contact: {appeal.studentEmail}
                        </div>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                        Submitted: <strong>{new Date(appeal.submittedAt).toLocaleDateString()}</strong>
                      </div>
                    </div>

                    {/* Comparison: Sanction vs Student Defense */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                      {/* Left: Original Sanction Accusation */}
                      <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', padding: '14px' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f87171', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ShieldAlert size={15} /> Original Sanction Accusation:
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
                          "{appeal.banReason}"
                        </p>
                        <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '8px' }}>
                          Sanctioned by: <strong style={{ color: '#e2e8f0' }}>{appeal.bannedBy}</strong>
                        </div>
                      </div>

                      {/* Right: Student's Submitted Defense */}
                      <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '10px', padding: '14px' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#60a5fa', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FileText size={15} /> Student's Submitted Justification:
                        </div>
                        <p style={{ fontSize: '0.86rem', color: '#ffffff', margin: 0, lineHeight: 1.5 }}>
                          "{appeal.justificationText}"
                        </p>
                        {appeal.proofUrl && (
                          <div style={{ marginTop: '10px' }}>
                            <a
                              href={appeal.proofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#38bdf8', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'underline', fontWeight: 600 }}
                            >
                              <ExternalLink size={13} /> Inspect External Verification Proof Link
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Verdict Controls or Historical Determination */}
                    {isPending ? (
                      <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '16px' }}>
                        <label style={{ fontSize: '0.82rem', color: '#cbd5e1', display: 'block', marginBottom: '6px', fontWeight: 700 }}>
                          Committee Determination Remarks & Justification:
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Serial code cross-verified with NPTEL online ledger. Scanning typographical error confirmed, ban revoked."
                          value={verdictRemarks[appeal.appealId] || ''}
                          onChange={(e) => setVerdictRemarks({ ...verdictRemarks, [appeal.appealId]: e.target.value })}
                          style={{ marginBottom: '14px', fontSize: '0.84rem', width: '100%' }}
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
                          {/* 1. Request Info */}
                          <button
                            type="button"
                            onClick={() => handleAdjudicate(appeal.appealId, 'info_requested')}
                            disabled={adjudicatingAppealId === appeal.appealId}
                            className="btn btn-secondary btn-sm"
                            style={{
                              borderColor: 'rgba(56, 189, 248, 0.4)',
                              color: '#38bdf8',
                              background: 'rgba(56, 189, 248, 0.08)',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <Info size={14} /> Request More Information / Re-hearing
                          </button>

                          {/* 2. Reject */}
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
                            <UserX size={14} /> Reject Justification & Confirm Ban
                          </button>

                          {/* 3. Accept */}
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
                            <CheckCircle2 size={16} /> Accept Justification & Revoke Ban
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          background: isApproved
                            ? 'rgba(16, 185, 129, 0.1)'
                            : isInfoRequested
                            ? 'rgba(56, 189, 248, 0.1)'
                            : 'rgba(239, 68, 68, 0.1)',
                          border: isApproved
                            ? '1px solid rgba(16, 185, 129, 0.3)'
                            : isInfoRequested
                            ? '1px solid rgba(56, 189, 248, 0.3)'
                            : '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          fontSize: '0.84rem',
                          color: isApproved ? '#34d399' : isInfoRequested ? '#38bdf8' : '#f87171',
                        }}
                      >
                        <strong>Committee Determination:</strong> {appeal.adjudicationRemarks}
                        <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '6px' }}>
                          Determined by: <strong>{appeal.adjudicatedBy}</strong> on {new Date(appeal.adjudicatedAt).toLocaleString()}
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

      {/* ========================================================================= */}
      {/* MODAL 1: APPLY CONFIRMATION MODAL                                         */}
      {/* ========================================================================= */}
      {applyModalOpp && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(5, 8, 16, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div className="card" style={{ maxWidth: '580px', width: '100%', background: '#0f172a', border: '1px solid rgba(59, 130, 246, 0.4)', borderRadius: '16px', padding: '26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', marginBottom: '6px' }}>
                  {applyModalOpp.type}
                </span>
                <h3 style={{ fontSize: '1.3rem', color: '#ffffff', margin: 0, fontWeight: 800 }}>
                  Apply for Faculty Program
                </h3>
              </div>
              <button
                onClick={() => setApplyModalOpp(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Program Summary Brief */}
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '14px', marginBottom: '18px' }}>
              <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '1rem', marginBottom: '4px' }}>
                {applyModalOpp.title}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <span>Host: <strong style={{ color: '#e2e8f0' }}>{applyModalOpp.companyName}</strong></span>
                <span>Duration: {applyModalOpp.duration}</span>
                <span>Mode: {applyModalOpp.mode || 'Hybrid'}</span>
                {applyModalOpp.compensation && <span>Honorarium: <strong style={{ color: '#34d399' }}>{applyModalOpp.compensation}</strong></span>}
              </div>
            </div>

            <form onSubmit={handleSubmitApplication}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '0.84rem', color: '#e2e8f0', fontWeight: 600 }}>
                  Faculty Specialization / Primary Research Domain:
                </label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={applyForm.specialization}
                  onChange={(e) => setApplyForm({ ...applyForm, specialization: e.target.value })}
                  placeholder="e.g. Distributed Cloud Systems, Generative AI Architectures..."
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '0.84rem', color: '#e2e8f0', fontWeight: 600 }}>
                  Statement of Academic Purpose & Objectives:
                </label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  required
                  value={applyForm.statement}
                  onChange={(e) => setApplyForm({ ...applyForm, statement: e.target.value })}
                  placeholder="Explain how this industry engagement will benefit your department, syllabus modernization, or student labs..."
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '22px', backgroundColor: 'rgba(59, 130, 246, 0.05)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
                <input
                  type="checkbox"
                  id="nocCheck"
                  checked={applyForm.hasNoc}
                  onChange={(e) => setApplyForm({ ...applyForm, hasNoc: e.target.checked })}
                  style={{ marginTop: '3px' }}
                />
                <label htmlFor="nocCheck" style={{ fontSize: '0.78rem', color: '#cbd5e1', cursor: 'pointer', lineHeight: 1.4 }}>
                  I confirm that this engagement complies with NIT Delhi academic workload norms and that requisite departmental NOC has been initiated.
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setApplyModalOpp(null)}
                  className="btn btn-secondary"
                  disabled={submittingApp}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingApp || !applyForm.hasNoc}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                >
                  {submittingApp ? 'Submitting Application...' : 'Confirm & Transmit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: INSPECT ENGAGEMENT DETAILS MODAL                                 */}
      {/* ========================================================================= */}
      {selectedEngagement && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(5, 8, 16, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div className="card" style={{ maxWidth: '580px', width: '100%', background: '#0f172a', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '16px', padding: '26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span className="badge" style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', marginBottom: '6px' }}>
                  Engagement Record: {selectedEngagement.app.id}
                </span>
                <h3 style={{ fontSize: '1.25rem', color: '#ffffff', margin: 0, fontWeight: 800 }}>
                  {selectedEngagement.opp.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEngagement(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '22px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase' }}>Host Institution</div>
                  <div style={{ fontSize: '0.88rem', color: '#ffffff', fontWeight: 600 }}>{selectedEngagement.opp.companyName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase' }}>Delivery Mode</div>
                  <div style={{ fontSize: '0.88rem', color: '#ffffff', fontWeight: 600 }}>{selectedEngagement.app.mode || 'Hybrid'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase' }}>Application Status</div>
                  <div style={{ fontSize: '0.88rem', color: '#34d399', fontWeight: 700, textTransform: 'capitalize' }}>{selectedEngagement.app.status}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase' }}>Participation Status</div>
                  <div style={{ fontSize: '0.88rem', color: '#60a5fa', fontWeight: 700 }}>{selectedEngagement.app.participationStatus || 'Upcoming'}</div>
                </div>
              </div>

              <div>
                <h5 style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '0 0 6px 0' }}>Program Overview:</h5>
                <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                  {selectedEngagement.opp.description}
                </p>
              </div>

              {selectedEngagement.app.facultyNotes && (
                <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#60a5fa', fontWeight: 700, marginBottom: '4px' }}>
                    Faculty Purpose Statement:
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: 0 }}>
                    "{selectedEngagement.app.facultyNotes}"
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedEngagement(null)}
                className="btn btn-primary"
                style={{ borderRadius: '8px' }}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CERTIFICATE INSPECT / VIEWER MODAL                               */}
      {/* ========================================================================= */}
      {inspectCertModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(5, 8, 16, 0.88)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div className="card" style={{ maxWidth: '640px', width: '100%', background: '#0d1322', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '16px', padding: '26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span className="badge" style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', marginBottom: '4px' }}>
                  Document Inspection Desk
                </span>
                <h3 style={{ fontSize: '1.25rem', color: '#ffffff', margin: 0, fontWeight: 800 }}>
                  {inspectCertModal.cert.title}
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px' }}>
                  Submitted by: <strong style={{ color: '#ffffff' }}>{inspectCertModal.student.name}</strong> ({inspectCertModal.student.branch})
                </div>
              </div>
              <button
                onClick={() => setInspectCertModal(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Certificate Preview Card */}
            <div style={{ marginBottom: '20px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)', background: '#0a0f1d' }}>
              {inspectCertModal.cert.documentUrl ? (
                <div>
                  <img
                    src={inspectCertModal.cert.documentUrl}
                    alt="Certificate Document"
                    style={{ width: '100%', maxHeight: '320px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '12px 16px', backgroundColor: 'rgba(15, 23, 42, 0.9)', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={14} /> High-Resolution Document Verification Stream Live
                    </span>
                    <a
                      href={inspectCertModal.cert.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                    >
                      <ExternalLink size={12} /> Open Full Size
                    </a>
                  </div>
                </div>
              ) : (
                /* Fallback Notice when document URL is not provided */
                <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                  <Award size={48} style={{ color: '#fbbf24', margin: '0 auto 12px auto' }} />
                  <h4 style={{ color: '#ffffff', margin: '0 0 6px 0' }}>Certificate Document Offline / Unavailable</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '440px', margin: '0 auto 14px auto', lineHeight: 1.45 }}>
                    Certificate document is currently unavailable. The candidate submitted metadata with Credential ID <code>{inspectCertModal.cert.credentialId}</code> from <strong>{inspectCertModal.cert.issuer}</strong>.
                  </p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', fontSize: '0.78rem', color: '#fbbf24' }}>
                    <Info size={14} /> You may endorse based on official ID, or request a document re-upload.
                  </div>
                </div>
              )}
            </div>

            {/* Credential Attributes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.8rem' }}>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.72rem' }}>SKILL</span>
                <strong style={{ color: '#38bdf8' }}>{inspectCertModal.cert.skillName}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.72rem' }}>CREDENTIAL ID</span>
                <code>{inspectCertModal.cert.credentialId}</code>
              </div>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.72rem' }}>ISSUER</span>
                <span style={{ color: '#ffffff' }}>{inspectCertModal.cert.issuer}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setInspectCertModal(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
              {!inspectCertModal.cert.verified && (
                <button
                  type="button"
                  onClick={() => {
                    const c = inspectCertModal.cert;
                    setInspectCertModal(null);
                    setConfirmEndorseCert(c);
                  }}
                  className="btn btn-primary"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <ShieldCheck size={16} /> Proceed to Endorse
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CONFIRM ENDORSEMENT MODAL                                        */}
      {/* ========================================================================= */}
      {confirmEndorseCert && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(5, 8, 16, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', background: '#0f172a', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', marginBottom: '12px' }}>
              <ShieldCheck size={26} />
              <h3 style={{ fontSize: '1.25rem', color: '#34d399', margin: 0, fontWeight: 800 }}>
                Confirm Academic Skill Endorsement
              </h3>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '16px' }}>
              You are officially validating and endorsing the skill <strong>"{confirmEndorseCert.skillName}"</strong> for certificate <strong>"{confirmEndorseCert.title}"</strong>.
            </p>

            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px', fontSize: '0.82rem', color: '#6ee7b7' }}>
              <strong>🎓 Academic Bank of Credits (ABC) Integration:</strong> Endorsing this competency officially tags it as Faculty-Verified in the student's profile, elevating their resume score and boosting corporate recruiter matching algorithms.
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setConfirmEndorseCert(null)}
                className="btn btn-secondary"
                disabled={Boolean(endorsingCertId)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEndorse}
                disabled={Boolean(endorsingCertId)}
                className="btn btn-primary"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
              >
                <ShieldCheck size={16} /> {endorsingCertId ? 'Recording Endorsement...' : 'Confirm & Endorse Competency'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: REJECT / CORRECTION REQUEST MODAL                                 */}
      {/* ========================================================================= */}
      {correctionModalCert && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(5, 8, 16, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', background: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f59e0b', marginBottom: '12px' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '1.25rem', color: '#fbbf24', margin: 0, fontWeight: 800 }}>
                Certificate Evaluation Feedback
              </h3>
            </div>

            <p style={{ fontSize: '0.86rem', color: '#cbd5e1', marginBottom: '16px' }}>
              Submission: <strong>{correctionModalCert.title}</strong> ({correctionModalCert.skillName})
            </p>

            <form onSubmit={handleSubmitCorrection}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '0.84rem', color: '#e2e8f0', fontWeight: 600 }}>
                  Choose Action:
                </label>
                <div style={{ display: 'flex', gap: '14px', marginTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#cbd5e1', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="corrAction"
                      value="correction_requested"
                      checked={correctionAction === 'correction_requested'}
                      onChange={() => setCorrectionAction('correction_requested')}
                    />
                    Request Document Correction / Re-upload
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#cbd5e1', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="corrAction"
                      value="rejected"
                      checked={correctionAction === 'rejected'}
                      onChange={() => setCorrectionAction('rejected')}
                    />
                    Reject Submission (Invalid Credential)
                  </label>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontSize: '0.84rem', color: '#e2e8f0', fontWeight: 600 }}>
                  Faculty Instructions / Reason:
                </label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  required
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder={
                    correctionAction === 'correction_requested'
                      ? 'e.g. Scanned document is blurry and the credential ID is unreadable. Please re-upload a clear PDF copy.'
                      : 'e.g. Issuing organization is non-accredited and credential ID could not be validated.'
                  }
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setCorrectionModalCert(null)}
                  className="btn btn-secondary"
                  disabled={submittingCorrection}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCorrection || !correctionReason.trim()}
                  className="btn btn-primary"
                  style={{
                    backgroundColor: correctionAction === 'rejected' ? '#ef4444' : '#f59e0b',
                    borderColor: correctionAction === 'rejected' ? '#dc2626' : '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 700,
                  }}
                >
                  {submittingCorrection ? 'Submitting...' : 'Send Feedback to Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: PERMANENT APAAR BLACKLIST / BAN MODAL                            */}
      {/* ========================================================================= */}
      {banModalCert && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(5, 8, 16, 0.88)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', background: '#130d12', border: '2px solid rgba(239, 68, 68, 0.5)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', marginBottom: '12px' }}>
              <ShieldAlert size={26} />
              <h3 style={{ fontSize: '1.25rem', color: '#f87171', margin: 0, fontWeight: 800 }}>
                Permanent APAAR ID Blacklist Action
              </h3>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '16px' }}>
              You are initiating a permanent national academic blacklist against <strong>{students.find((s) => s.uid === banModalCert.studentId)?.name || 'this student'}</strong> for submitting fraudulent academic credentials or falsified certificates.
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
                placeholder="Describe fraudulent certificate, fake project links, or falsified credentials..."
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
