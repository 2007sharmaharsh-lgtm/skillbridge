import React, { useState, useRef } from 'react';
import { readResumeFile, parseResumeText } from '../services/resumeParser';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Download,
  Trash2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export default function ResumeUploader({ currentResumeUrl, onParsed, onResumeUrlChange }) {
  const [dragActive, setDragActive] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleFileProcess = async (file) => {
    if (!file) return;
    setErrorMsg('');

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File size exceeds 5MB. Please upload a smaller document.');
      return;
    }

    setParsing(true);
    setUploadedFileName(file.name);

    try {
      // 1. Read file as Base64 Data URL for persistent storage & download
      const base64Reader = new FileReader();
      base64Reader.onload = () => {
        const dataUrl = base64Reader.result;
        if (onResumeUrlChange) {
          onResumeUrlChange(dataUrl);
        }
      };
      base64Reader.readAsDataURL(file);

      // 2. Extract text and run ATS heuristics
      const text = await readResumeFile(file);
      const parsed = parseResumeText(text);
      setParsedResult(parsed);
    } catch (err) {
      console.error('Resume analysis error:', err);
      setErrorMsg('Could not parse resume file. Please ensure it is a valid PDF, DOCX, or TXT document.');
    } finally {
      setParsing(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleApplyToProfile = () => {
    if (!parsedResult) return;
    if (onParsed) {
      onParsed(parsedResult);
    }
  };

  const handleRemoveResume = () => {
    setParsedResult(null);
    setUploadedFileName('');
    if (onResumeUrlChange) {
      onResumeUrlChange('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt,.doc"
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />

      {/* Drag and Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        style={{
          border: dragActive ? '2px dashed #3b82f6' : '2px dashed var(--border-color)',
          backgroundColor: dragActive ? 'rgba(59, 130, 246, 0.08)' : 'rgba(15, 23, 42, 0.4)',
          borderRadius: '14px',
          padding: '28px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          color: '#60a5fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
        }}>
          {parsing ? (
            <RefreshCw size={24} style={{ animation: 'spin 1.5s linear infinite' }} />
          ) : (
            <UploadCloud size={26} />
          )}
        </div>

        <h4 style={{ fontSize: '1.05rem', color: '#ffffff', fontWeight: 700, margin: '0 0 6px 0' }}>
          {parsing ? 'Analyzing Resume Structure & Skills...' : 'Upload PDF / DOCX Resume'}
        </h4>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 14px 0' }}>
          Drag & drop your resume file here or click to browse (Max 5MB)
        </p>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#94a3b8', backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '6px 12px', borderRadius: '999px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <Sparkles size={13} style={{ color: '#38bdf8' }} /> Auto-extracts skills & calculates ATS compatibility
        </div>
      </div>

      {errorMsg && (
        <div style={{ marginTop: '12px', padding: '10px 14px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} /> {errorMsg}
        </div>
      )}

      {/* Active Resume / Parsed Telemetry */}
      {(parsedResult || currentResumeUrl) && (
        <div className="card" style={{ marginTop: '18px', padding: '20px', border: '1px solid var(--border-glow)', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.6) 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '10px', backgroundColor: 'rgba(59, 130, 246, 0.2)', borderRadius: '10px', color: '#60a5fa' }}>
                <FileText size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>
                  {uploadedFileName || 'Candidate_Resume.pdf'}
                </h4>
                <div style={{ fontSize: '0.78rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <ShieldCheck size={14} /> Ready for Automated Recruiter Matching
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {currentResumeUrl && (
                <a
                  href={currentResumeUrl}
                  download={uploadedFileName || "resume.pdf"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Download size={14} /> Download File
                </a>
              )}
              <button
                type="button"
                onClick={handleRemoveResume}
                className="btn btn-secondary btn-sm"
                style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </div>

          {/* ATS Telemetry Gauge & Diagnostic breakdown */}
          {parsedResult && (
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    ATS Compatibility Rating
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                    <span style={{
                      fontSize: '1.8rem',
                      fontWeight: 800,
                      color: parsedResult.atsScore >= 75 ? '#34d399' : parsedResult.atsScore >= 50 ? '#fbbf24' : '#f87171'
                    }}>
                      {parsedResult.atsScore}/100
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                      {parsedResult.atsScore >= 75 ? 'Excellent Formatting & Density' : 'Needs Optimization'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApplyToProfile}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', fontWeight: 700 }}
                >
                  <Sparkles size={15} /> Auto-Fill Profile & Import Skills ({parsedResult.extractedSkills.length})
                </button>
              </div>

              {/* Extracted Skills Preview */}
              {parsedResult.extractedSkills.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
                    SKILLS EXTRACTED BY ENGINE:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {parsedResult.extractedSkills.map(s => (
                      <span
                        key={s.name}
                        style={{
                          backgroundColor: 'rgba(59, 130, 246, 0.15)',
                          color: '#93c5fd',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          padding: '3px 9px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                        }}
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ATS Checklist Details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                {parsedResult.atsFeedback.map((fb, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {fb.startsWith('✓') ? (
                      <CheckCircle2 size={14} style={{ color: '#34d399', flexShrink: 0 }} />
                    ) : (
                      <AlertTriangle size={14} style={{ color: '#fbbf24', flexShrink: 0 }} />
                    )}
                    <span>{fb.replace(/^[✓⚠]\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
