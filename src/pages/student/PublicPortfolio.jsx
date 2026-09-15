import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStudentProfile } from '../../services/firestoreService';
import LoadingSpinner from '../../components/LoadingSpinner';
import SkillConstellation from '../../components/SkillConstellation';
import { ShieldCheck, ExternalLink, Github, Linkedin, Award, Briefcase, GraduationCap, Download, QrCode, CheckCircle2, MapPin, Share2 } from 'lucide-react';

export default function PublicPortfolio() {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const data = await getStudentProfile(studentId || 'std_1');
        setStudent(data);
      } catch (err) {
        console.error('Failed to load portfolio:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPortfolio();
  }, [studentId]);

  const handleSharePortfolio = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${student?.name || 'Student'} - Verified Portfolio`,
        text: `Check out ${student?.name || 'this student'}'s verified skills, projects, and LinkedIn/GitHub on SkillConnect.`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    }
  };

  if (loading) return <LoadingSpinner text="Fetching verified digital portfolio..." />;

  if (!student) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
        <h3>Digital Portfolio Not Found</h3>
        <p>The student ID requested does not exist or has set their profile to private.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '16px' }}>Back to Portal</Link>
      </div>
    );
  }

  const skillsList = student.skills || [
    { name: 'React', level: 'Advanced', verified: true },
    { name: 'Node.js', level: 'Intermediate', verified: true },
    { name: 'Python', level: 'Advanced', verified: true },
    { name: 'Data Analysis', level: 'Intermediate', verified: false }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', padding: '30px 20px' }}>
      <div style={{ maxWidth: '950px', margin: '0 auto' }}>
        
        {/* Verified Header Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', backgroundColor: 'rgba(15, 23, 42, 0.8)', padding: '16px 24px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.3)', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#60a5fa', fontWeight: '600' }}>
            <ShieldCheck size={22} style={{ color: '#34d399' }} /> Verified Academia-Industry Digital Roster Badge
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={handleSharePortfolio} className="btn btn-secondary" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px' }}>
              <Share2 size={14} /> {shareCopied ? 'Copied Portfolio Link!' : 'Share Portfolio'}
            </button>
            <button onClick={() => window.print()} className="btn btn-primary" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px' }}>
              <Download size={14} /> Export PDF Resume
            </button>
          </div>
        </div>

        {/* Profile Info Card */}
        <div className="card" style={{ marginBottom: '24px', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: '90px', height: '90px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', fontWeight: 'bold' }}>
            {student.name ? student.name.charAt(0) : 'S'}
          </div>

          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '1.8rem', color: '#ffffff', margin: 0 }}>
                {student.name || 'Student Candidate'}
              </h1>
              <CheckCircle2 size={20} style={{ color: '#34d399' }} title="Verified Academic Roster" />
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0 0 10px 0' }}>
              {student.degree || 'B.Tech'} in {student.branch || 'Computer Science'} • {student.collegeName || 'National Institute of Technology'} ({student.graduationYear || '2026'})
            </p>

            <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: '#cbd5e1', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} style={{ color: 'var(--primary)' }} /> {student.location || 'Delhi, India'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <GraduationCap size={14} style={{ color: 'var(--purple)' }} /> Verified Student ID: {student.uid?.slice(0, 8) || 'STD-26044'}
              </span>
            </div>

            {/* Social & Professional Connections */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
              {student.linkedinUrl && (
                <a
                  href={student.linkedinUrl.startsWith('http') ? student.linkedinUrl : `https://${student.linkedinUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.4)', background: 'rgba(59, 130, 246, 0.1)', padding: '5px 12px' }}
                >
                  <Linkedin size={14} /> LinkedIn Profile <ExternalLink size={11} />
                </a>
              )}
              {student.githubUrl && (
                <a
                  href={student.githubUrl.startsWith('http') ? student.githubUrl : `https://${student.githubUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#f1f5f9', borderColor: 'rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.08)', padding: '5px 12px' }}
                >
                  <Github size={14} /> GitHub Repos <ExternalLink size={11} />
                </a>
              )}
            </div>
          </div>

          {/* QR Code Verification box */}
          <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255, 255, 255, 0.1)', paddingLeft: '20px' }}>
            <div style={{ padding: '8px', backgroundColor: '#ffffff', borderRadius: '8px', display: 'inline-block', marginBottom: '6px' }}>
              <QrCode size={64} style={{ color: '#090d16' }} />
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Scan to Verify Credentials</div>
          </div>
        </div>

        {/* Skill Constellation & Badges */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} style={{ color: 'var(--primary)' }} /> Verified Competencies & Skill Constellation
          </h3>

          <SkillConstellation skills={skillsList} height={240} />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
            {skillsList.map((sk, idx) => (
              <div key={idx} style={{ padding: '8px 14px', backgroundColor: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#ffffff', fontWeight: '500', fontSize: '0.9rem' }}>{sk.name || sk}</span>
                <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', fontSize: '0.75rem' }}>
                  {sk.level || 'Intermediate'}
                </span>
                {sk.verified && <CheckCircle2 size={14} style={{ color: '#34d399' }} title="Verified Assessment" />}
              </div>
            ))}
          </div>
        </div>

        {/* Projects & Industry Projects Showcase */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={18} style={{ color: 'var(--purple)' }} /> Verified Projects & Industry Capstones
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '1.05rem', color: '#ffffff', margin: 0 }}>Academia-Industry Collaboration Portal</h4>
                <a href="https://github.com" target="_blank" rel="noreferrer" style={{ color: '#94a3b8' }}><Github size={16} /></a>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '12px' }}>
                Centralized SIH portal connecting students, industry recruiters, and academic faculty with live skill gap radar and ATS tracking.
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span className="badge" style={{ fontSize: '0.7rem' }}>React</span>
                <span className="badge" style={{ fontSize: '0.7rem' }}>Firebase</span>
                <span className="badge" style={{ fontSize: '0.7rem' }}>Tailwind</span>
              </div>
            </div>

            <div style={{ padding: '16px', backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '1.05rem', color: '#ffffff', margin: 0 }}>ML Driven Resume Skill Parser</h4>
                <a href="https://github.com" target="_blank" rel="noreferrer" style={{ color: '#94a3b8' }}><Github size={16} /></a>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '12px' }}>
                Automated NLP model to extract technical competencies from PDF resumes and calculate job description compatibility.
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span className="badge" style={{ fontSize: '0.7rem' }}>Python</span>
                <span className="badge" style={{ fontSize: '0.7rem' }}>Scikit-Learn</span>
                <span className="badge" style={{ fontSize: '0.7rem' }}>FastAPI</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
