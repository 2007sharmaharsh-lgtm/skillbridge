import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getStudentProfile, updateStudentProfile, createUserProfile } from '../../services/firestoreService';
import { DEPARTMENTS } from '../../constants';
import LoadingSpinner from '../../components/LoadingSpinner';
import ImageUploader from '../../components/ImageUploader';
import ResumeUploader from '../../components/ResumeUploader';
import ApaarVerificationModal from '../../components/ApaarVerificationModal';
import { getStudentApaarRecord } from '../../services/apaarService';
import { Save, Check, User, Mail, GraduationCap, MapPin, FileText, Info, Award, ExternalLink, Copy, Sparkles, Linkedin, Github, Globe, Share2, Fingerprint, Lock, ShieldCheck } from 'lucide-react';

export default function StudentProfile() {
  const { currentUser, updateCurrentUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [apaarRecord, setApaarRecord] = useState(null);
  const [apaarModalOpen, setApaarModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    photoURL: '',
    collegeName: '',
    university: '',
    degree: 'B.Tech',
    branch: 'Computer Science & Engineering',
    graduationYear: '2025',
    location: '',
    resumeURL: '',
    linkedinUrl: '',
    githubUrl: '',
    about: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      if (!currentUser?.uid) return;
      try {
        const studentData = await getStudentProfile(currentUser.uid);
        if (isMounted) {
          setFormData({
            name: studentData.name || currentUser.name || '',
            email: studentData.email || currentUser.email || '',
            photoURL: studentData.photoURL || currentUser.photoURL || '',
            collegeName: studentData.collegeName || '',
            university: studentData.university || '',
            degree: studentData.degree || 'B.Tech',
            branch: studentData.branch || 'Computer Science & Engineering',
            graduationYear: studentData.graduationYear || '2025',
            location: studentData.location || '',
            resumeURL: studentData.resumeURL || '',
            linkedinUrl: studentData.linkedinUrl || '',
            githubUrl: studentData.githubUrl || '',
            about: studentData.about || '',
          });
          const apaarData = getStudentApaarRecord(currentUser.uid);
          setApaarRecord({
            ...apaarData,
            verified: apaarData?.verified || studentData?.apaarVerified || studentData?.aadhaarVerified || false,
            maskedApaar: apaarData?.maskedApaar || studentData?.maskedApaar || studentData?.maskedAadhaar || '',
          });
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadProfile();
    return () => { isMounted = false; };
  }, [currentUser?.uid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCopyPortfolio = () => {
    const url = `${window.location.origin}/portfolio/${currentUser?.uid || 'std_1'}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareAllProfiles = () => {
    const portfolioLink = `${window.location.origin}/portfolio/${currentUser?.uid || 'std_1'}`;
    const shareText = `🎓 ${formData.name || 'Candidate'} - Professional Profile & Project Links
🏛️ ${formData.collegeName || 'Engineering College'} | ${formData.degree} ${formData.branch}
💼 LinkedIn: ${formData.linkedinUrl || 'Not provided'}
💻 GitHub: ${formData.githubUrl || 'Not provided'}
🌐 Digital Portfolio: ${portfolioLink}
${formData.resumeURL ? `📄 Resume: ${formData.resumeURL}` : ''}`;

    navigator.clipboard.writeText(shareText);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 3500);
  };

  const handleResumeParsed = async (parsed) => {
    if (!parsed) return;
    setFormData(prev => ({
      ...prev,
      name: parsed.name || prev.name,
      degree: parsed.degree || prev.degree,
      branch: parsed.branch || prev.branch,
      linkedinUrl: parsed.linkedinUrl || prev.linkedinUrl,
      githubUrl: parsed.githubUrl || prev.githubUrl,
      about: parsed.about ? (prev.about ? `${prev.about}\n\n${parsed.about}` : parsed.about) : prev.about,
    }));

    // If new skills were extracted, merge them into the student profile skills
    if (parsed.extractedSkills?.length > 0 && currentUser?.uid) {
      try {
        const student = await getStudentProfile(currentUser.uid);
        const existing = student?.skills || [];
        const existingNames = new Set(existing.map(s => (s.name || s).toLowerCase()));
        const newToAdd = parsed.extractedSkills.filter(s => !existingNames.has(s.name.toLowerCase()));
        if (newToAdd.length > 0) {
          const merged = [...existing, ...newToAdd];
          await updateStudentProfile(currentUser.uid, { skills: merged });
        }
      } catch (err) {
        console.error('Error merging resume skills:', err);
      }
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        photoURL: formData.photoURL,
        collegeName: formData.collegeName,
        university: formData.university,
        degree: formData.degree,
        branch: formData.branch,
        graduationYear: formData.graduationYear,
        location: formData.location,
        resumeURL: formData.resumeURL,
        linkedinUrl: formData.linkedinUrl,
        githubUrl: formData.githubUrl,
        about: formData.about,
      };

      await updateStudentProfile(currentUser.uid, payload);

      if (updateCurrentUser) {
        updateCurrentUser({ name: formData.name, photoURL: formData.photoURL });
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to update student profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading profile details..." />;

  const portfolioUrl = `/portfolio/${currentUser?.uid || 'std_1'}`;

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem' }}>Student Profile & Academic Record</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Manage your personal information, academic credentials, and resume link for recruiter discovery.
        </p>
      </div>

      {/* Verified Shareable Digital Portfolio Banner */}
      <div className="card" style={{ marginBottom: '24px', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', backgroundColor: 'rgba(59, 130, 246, 0.2)', borderRadius: '10px', color: '#60a5fa' }}>
            <Award size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.05rem', color: '#ffffff', margin: 0 }}>Public Verified Digital Portfolio</h4>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
              Share your verified badges, skills constellation, and projects with companies.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleCopyPortfolio} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Copy size={14} /> {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <Link to={portfolioUrl} target="_blank" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ExternalLink size={14} /> Open Live Portfolio
          </Link>
        </div>
      </div>

      {savedSuccess && (
        <div style={{ padding: '12px 16px', backgroundColor: 'var(--success-light)', color: 'var(--success)', border: '1px solid #bbf7d0', borderRadius: 'var(--border-radius)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} /> Profile details saved successfully to database.
        </div>
      )}

      {/* National Academic Identity & APAAR Verification Card */}
      <div
        className="card"
        style={{
          marginBottom: '24px',
          background: apaarRecord?.verified
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)'
            : 'linear-gradient(135deg, rgba(30, 58, 138, 0.25) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: apaarRecord?.verified
            ? '1px solid rgba(16, 185, 129, 0.35)'
            : '1px solid rgba(59, 130, 246, 0.4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '18px 22px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              padding: '10px',
              backgroundColor: apaarRecord?.verified ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
              borderRadius: '10px',
              color: apaarRecord?.verified ? '#34d399' : '#60a5fa',
            }}
          >
            <GraduationCap size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ fontSize: '1.05rem', color: '#ffffff', margin: 0 }}>
                National Academic Identity (APAAR / ABC ID - Ministry of Education)
              </h4>
              <span
                className="badge"
                style={{
                  backgroundColor: apaarRecord?.verified ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: apaarRecord?.verified ? '#34d399' : '#f87171',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                }}
              >
                {apaarRecord?.verified ? '✓ APAAR Verified' : 'APAAR e-KYC Pending'}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
              {apaarRecord?.verified
                ? `Masked ID: ${apaarRecord?.maskedApaar || 'XXXX-XXXX-9821'} • Immutable student lifetime ID under NEP 2020.`
                : '12-digit APAAR ID verification is required to unlock skill additions and protect against academic fraud.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setApaarModalOpen(true)}
          className={apaarRecord?.verified ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ShieldCheck size={16} />
          {apaarRecord?.verified ? 'View APAAR Card' : 'Verify APAAR ID Now'}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Personal Details */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} style={{ color: 'var(--primary)' }} /> Basic Information
          </h3>

          {/* Interactive Photo Uploader */}
          <ImageUploader
            currentImage={formData.photoURL}
            onImageChange={(newPhoto) => setFormData(prev => ({ ...prev, photoURL: newPhoto }))}
            label="Student Profile Picture"
            shape="circle"
            size={90}
          />

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                disabled
                style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Current Location (City, State)</label>
              <input
                type="text"
                name="location"
                className="form-input"
                placeholder="e.g. New Delhi, India"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Academic Details */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap size={18} style={{ color: 'var(--purple)' }} /> Academic Credentials
          </h3>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">College / Institution Name</label>
              <input
                type="text"
                name="collegeName"
                className="form-input"
                placeholder="e.g. National Institute of Technology"
                value={formData.collegeName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Affiliated University</label>
              <input
                type="text"
                name="university"
                className="form-input"
                placeholder="e.g. Delhi University / Autonomous"
                value={formData.university}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Degree Program</label>
              <select
                name="degree"
                className="form-select"
                value={formData.degree}
                onChange={handleChange}
              >
                <option value="B.Tech">B.Tech / B.E.</option>
                <option value="M.Tech">M.Tech / M.E.</option>
                <option value="BCA">BCA</option>
                <option value="MCA">MCA</option>
                <option value="B.Sc">B.Sc Computer Science / IT</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Branch / Specialization</label>
              <select
                name="branch"
                className="form-select"
                value={formData.branch}
                onChange={handleChange}
              >
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Graduation Year</label>
              <select
                name="graduationYear"
                className="form-select"
                value={formData.graduationYear}
                onChange={handleChange}
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resume PDF & Document Intelligence Card */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} style={{ color: 'var(--primary)' }} /> Resume & Document Intelligence
          </h3>

          <ResumeUploader
            currentResumeUrl={formData.resumeURL}
            onResumeUrlChange={(url) => setFormData(prev => ({ ...prev, resumeURL: url }))}
            onParsed={handleResumeParsed}
          />

          <div className="form-group" style={{ marginTop: '12px' }}>
            <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Or paste cloud link (Google Drive / Dropbox / Hosted PDF):
            </label>
            <input
              type="url"
              name="resumeURL"
              className="form-input"
              placeholder="https://drive.google.com/..."
              value={formData.resumeURL}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Professional Profiles & Code Repositories (LinkedIn & GitHub) */}
        <div className="card" style={{ marginBottom: '24px', border: '1px solid rgba(14, 165, 233, 0.25)', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
                <Share2 size={18} /> Professional Social Links & Repositories (LinkedIn & GitHub)
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Connect your LinkedIn & GitHub profiles to share directly with hiring teams and recruiters.
              </p>
            </div>
            <button
              type="button"
              onClick={handleShareAllProfiles}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', borderColor: 'rgba(56, 189, 248, 0.4)', background: 'rgba(56, 189, 248, 0.08)' }}
            >
              <Copy size={13} /> {shareCopied ? 'Copied Profile Summary!' : 'Share / Copy Profile Card'}
            </button>
          </div>

          <div className="grid-2">
            {/* LinkedIn Profile Input */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Linkedin size={15} style={{ color: '#0a66c2' }} /> LinkedIn Profile URL
                </span>
                {formData.linkedinUrl && (
                  <a
                    href={formData.linkedinUrl.startsWith('http') ? formData.linkedinUrl : `https://${formData.linkedinUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.75rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    Test Link <ExternalLink size={11} />
                  </a>
                )}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="url"
                  name="linkedinUrl"
                  className="form-input"
                  placeholder="https://linkedin.com/in/your-username"
                  value={formData.linkedinUrl}
                  onChange={handleChange}
                  style={{ paddingLeft: '38px' }}
                />
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#0a66c2', pointerEvents: 'none' }}>
                  <Linkedin size={16} />
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Used by recruiters to review your recommendations and network.
              </span>
            </div>

            {/* GitHub Profile Input */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Github size={15} style={{ color: '#f1f5f9' }} /> GitHub Profile URL
                </span>
                {formData.githubUrl && (
                  <a
                    href={formData.githubUrl.startsWith('http') ? formData.githubUrl : `https://${formData.githubUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.75rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    Test Link <ExternalLink size={11} />
                  </a>
                )}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="url"
                  name="githubUrl"
                  className="form-input"
                  placeholder="https://github.com/your-username"
                  value={formData.githubUrl}
                  onChange={handleChange}
                  style={{ paddingLeft: '38px' }}
                />
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#f1f5f9', pointerEvents: 'none' }}>
                  <Github size={16} />
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Recruiters inspect your commit activity, open source PRs, and repositories.
              </span>
            </div>
          </div>

          {/* Quick Recruiter Live Preview Bar */}
          {(formData.linkedinUrl || formData.githubUrl) && (
            <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Live Recruiter Badges:</span>
                {formData.linkedinUrl && (
                  <a
                    href={formData.linkedinUrl.startsWith('http') ? formData.linkedinUrl : `https://${formData.linkedinUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="badge"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(10, 102, 194, 0.2)', color: '#60a5fa', borderColor: 'rgba(10, 102, 194, 0.4)', textDecoration: 'none', padding: '5px 12px', fontSize: '0.78rem' }}
                  >
                    <Linkedin size={13} /> LinkedIn Connected
                  </a>
                )}
                {formData.githubUrl && (
                  <a
                    href={formData.githubUrl.startsWith('http') ? formData.githubUrl : `https://${formData.githubUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="badge"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.1)', color: '#f1f5f9', borderColor: 'rgba(255, 255, 255, 0.2)', textDecoration: 'none', padding: '5px 12px', fontSize: '0.78rem' }}
                  >
                    <Github size={13} /> GitHub Connected
                  </a>
                )}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={14} /> Shared with Recruiters on Applications
              </span>
            </div>
          )}
        </div>

        {/* Bio / About */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} style={{ color: 'var(--success)' }} /> About Me & Professional Summary
          </h3>

          <div className="form-group">
            <textarea
              name="about"
              rows={4}
              className="form-textarea"
              placeholder="Highlight your key interests, career goals, major engineering projects, and problem-solving focus..."
              value={formData.about}
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            <Save size={18} /> {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>

      {/* APAAR Verification Modal */}
      <ApaarVerificationModal
        isOpen={apaarModalOpen}
        onClose={() => setApaarModalOpen(false)}
        studentUid={currentUser?.uid}
        onVerified={(record) => {
          setApaarRecord(record);
          setApaarModalOpen(false);
          setSavedSuccess(true);
          setTimeout(() => setSavedSuccess(false), 3000);
        }}
      />
    </div>
  );
}
