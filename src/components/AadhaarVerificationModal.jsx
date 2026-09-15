import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  AlertTriangle,
  CheckCircle2,
  X,
  Smartphone,
  Fingerprint,
  RefreshCw,
  Info,
  Building2,
} from 'lucide-react';
import {
  formatAadhaar,
  validateAadhaarFormat,
  isAadhaarBanned,
  sendAadhaarOTP,
  verifyAadhaarOTP,
} from '../services/aadhaarService';

export default function AadhaarVerificationModal({ isOpen, onClose, studentUid, onVerified }) {
  const [step, setStep] = useState(1); // 1 = Aadhaar Input, 2 = OTP Verification
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpSession, setOtpSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [bannedDetails, setBannedDetails] = useState(null);

  if (!isOpen) return null;

  const handleAadhaarChange = (e) => {
    const formatted = formatAadhaar(e.target.value);
    setAadhaarInput(formatted);
    setErrorMsg('');
    setBannedDetails(null);

    // If 12 digits are complete, check blacklist immediately
    const clean = formatted.replace(/\s/g, '');
    if (clean.length === 12) {
      const banned = isAadhaarBanned(clean);
      if (banned) {
        setBannedDetails(banned);
        setErrorMsg(`🚫 AADHAAR PERMANENTLY BANNED: This Aadhaar has been blacklisted for fraudulent activity.`);
      }
    }
  };

  const handleSendOTP = () => {
    const clean = aadhaarInput.replace(/\s/g, '');
    const validation = validateAadhaarFormat(clean);
    if (!validation.valid) {
      setErrorMsg(validation.error);
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = sendAadhaarOTP(clean);
      if (!res.success) {
        if (res.isBanned) {
          setBannedDetails(res.banDetails);
        }
        setErrorMsg(res.error);
        return;
      }
      setOtpSession(res);
      setStep(2);
    } catch (err) {
      setErrorMsg('Failed to connect to UIDAI authentication gateway.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpInput || otpInput.trim().length < 6) {
      setErrorMsg('Please enter the 6-digit verification OTP.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await verifyAadhaarOTP(
        studentUid,
        otpSession.aadhaarDigits,
        otpInput.trim(),
        otpSession.demoOtp
      );

      if (!res.success) {
        setErrorMsg(res.error);
        return;
      }

      setSuccessMsg(`Identity verified successfully! Masked Aadhaar ${res.maskedAadhaar} is now permanently linked.`);
      if (onVerified) onVerified(res.record);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err) {
      setErrorMsg('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setOtpInput('');
    setErrorMsg('');
    setSuccessMsg('');
    setBannedDetails(null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 16, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'linear-gradient(135deg, #0d1527 0%, #151e36 100%)',
          border: '1px solid rgba(59, 130, 246, 0.35)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(59, 130, 246, 0.2)',
          padding: '0',
          overflow: 'hidden',
          animation: 'fadeIn 0.25s ease-out',
        }}
      >
        {/* Official UIDAI Header Strip */}
        <div
          style={{
            background: 'linear-gradient(90deg, #1e3a8a 0%, #0369a1 100%)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#67e8f9',
              }}
            >
              <Fingerprint size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', letterSpacing: '0.02em' }}>
                UIDAI Aadhaar e-KYC Verification
              </div>
              <div style={{ fontSize: '0.72rem', color: '#bae6fd' }}>
                National Identity Gate • SIH26044 Compliance
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#e0f2fe',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Why Aadhaar is Required Alert */}
          <div
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '20px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}
          >
            <ShieldCheck size={18} style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.45 }}>
              <strong>Immutable Identity Enforcement:</strong> To eliminate fraudulent skill claims, multiple accounts, and fake certificates, candidates must verify their Aadhaar identity. Verified credentials remain permanently linked to your national ID.
            </div>
          </div>

          {/* Blacklisted Alert Banner (if banned) */}
          {bannedDetails && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                borderRadius: '10px',
                padding: '14px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>
                <AlertTriangle size={18} /> PERMANENT NATIONAL BLACKLIST
              </div>
              <p style={{ fontSize: '0.82rem', color: '#fca5a5', margin: '0 0 6px 0', lineHeight: 1.4 }}>
                This Aadhaar number (<code>{bannedDetails.maskedAadhaar}</code>) was permanently banned by <strong>{bannedDetails.bannedBy}</strong>.
              </p>
              <div style={{ fontSize: '0.78rem', color: '#fecaca', background: 'rgba(0, 0, 0, 0.3)', padding: '6px 10px', borderRadius: '6px' }}>
                <strong>Reason:</strong> {bannedDetails.banReason}
              </div>
            </div>
          )}

          {errorMsg && !bannedDetails && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#f87171',
                fontSize: '0.82rem',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertTriangle size={16} /> {errorMsg}
            </div>
          )}

          {successMsg && (
            <div
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                borderRadius: '8px',
                padding: '12px 14px',
                color: '#4ade80',
                fontSize: '0.85rem',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={18} /> {successMsg}
            </div>
          )}

          {/* STEP 1: Enter 12-Digit Aadhaar */}
          {step === 1 && (
            <div>
              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', color: '#e2e8f0', marginBottom: '6px' }}>
                  Enter 12-Digit Aadhaar Number
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    maxLength={14} // 12 digits + 2 spaces
                    className="form-input"
                    placeholder="XXXX XXXX XXXX"
                    value={aadhaarInput}
                    onChange={handleAadhaarChange}
                    style={{
                      fontSize: '1.25rem',
                      letterSpacing: '0.15em',
                      fontFamily: 'monospace',
                      paddingLeft: '44px',
                      fontWeight: 600,
                      borderColor: bannedDetails ? '#ef4444' : undefined,
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                      pointerEvents: 'none',
                    }}
                  >
                    <Lock size={18} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.72rem', color: '#94a3b8' }}>
                  <span>UIDAI Verhoeff Checksum Applied</span>
                  <span>12 Numeric Digits</span>
                </div>
              </div>

              {/* Quick Demo Fill Helper */}
              <div style={{ marginBottom: '20px', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Demo Test Aadhaar:</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setAadhaarInput('5489 2310 9821');
                      setErrorMsg('');
                      setBannedDetails(null);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                  >
                    Valid: 5489 2310 9821
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAadhaarInput('9999 8888 7777');
                      const banned = isAadhaarBanned('999988887777');
                      setBannedDetails(banned);
                      setErrorMsg('🚫 Blacklisted Aadhaar loaded.');
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.72rem', padding: '3px 8px', color: '#f87171', borderColor: 'rgba(239,68,68,0.4)' }}
                  >
                    Banned: 9999 8888 7777
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSendOTP}
                disabled={loading || !!bannedDetails || aadhaarInput.replace(/\s/g, '').length !== 12}
                className="btn btn-primary btn-lg"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderRadius: '10px',
                  fontWeight: 700,
                }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="spin" /> Contacting UIDAI Gateway...
                  </>
                ) : (
                  <>
                    <Smartphone size={18} /> Send Aadhaar OTP to Linked Mobile
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 2: Enter 6-Digit OTP */}
          {step === 2 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  OTP sent to mobile linked with Aadhaar
                </div>
                <div style={{ fontSize: '1rem', color: '#38bdf8', fontWeight: 700, marginTop: '2px' }}>
                  {otpSession?.maskedAadhaar} ({otpSession?.linkedPhone})
                </div>
                <div
                  style={{
                    display: 'inline-block',
                    marginTop: '8px',
                    padding: '4px 10px',
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    color: '#7dd3fc',
                  }}
                >
                  ⚡ Demo OTP: <strong>{otpSession?.demoOtp || '260044'}</strong>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', color: '#e2e8f0', textAlign: 'center', display: 'block' }}>
                  Enter 6-Digit OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  className="form-input"
                  placeholder="• • • • • •"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  style={{
                    textAlign: 'center',
                    fontSize: '1.75rem',
                    letterSpacing: '0.35em',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn btn-secondary"
                  style={{ flex: 1, borderRadius: '10px' }}
                >
                  Change Aadhaar
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={loading || otpInput.length < 6}
                  className="btn btn-primary"
                  style={{
                    flex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    borderRadius: '10px',
                    fontWeight: 700,
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={18} className="spin" /> Verifying e-KYC...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} /> Verify & Link Identity
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* DPDP Act & UIDAI Compliance Notice */}
          <div
            style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              fontSize: '0.7rem',
              color: '#64748b',
            }}
          >
            <Info size={14} style={{ flexShrink: 0 }} />
            <span>
              UIDAI & MeitY DPDP Act 2023 Compliant: Raw 12-digit Aadhaar numbers are never stored in plain text. Only cryptographic verification hashes and masked identifiers are retained.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
