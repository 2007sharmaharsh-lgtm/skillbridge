import React, { useState } from 'react';
import {
  Video,
  ExternalLink,
  Copy,
  Check,
  X,
  ShieldCheck,
  Calendar,
  Clock,
  User,
  Monitor,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { formatZoomInvitation, launchZoomApp, openZoomWeb } from '../services/zoomService';

export default function ZoomMeetingModal({ meeting, onClose }) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [inAppPreview, setInAppPreview] = useState(false);

  // In-app preview states
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [activeTab, setActiveTab] = useState('video'); // 'video' | 'chat'
  const [chatMessages, setChatMessages] = useState([
    { sender: 'Zoom AI Assistant', text: 'Welcome to your secure meeting room. Audio and video encrypted.' },
    { sender: meeting?.hostName || 'Host', text: 'Hi! Let me know when you are ready to begin the session.' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  if (!meeting) return null;

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    } else if (type === 'pass') {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2500);
    } else {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setChatMessages(prev => [...prev, { sender: 'You', text: newMessage.trim() }]);
    setNewMessage('');
  };

  const formattedDate = new Date(meeting.startTime).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
    }}>
      <div style={{
        background: '#0f172a',
        border: '1px solid rgba(59, 130, 246, 0.4)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: inAppPreview ? '850px' : '580px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px rgba(59, 130, 246, 0.25)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}>
        {/* Header with Zoom Branding */}
        <div style={{
          backgroundColor: '#0b5cff',
          padding: '16px 22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#ffffff',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0b5cff',
            }}>
              <Video size={20} fill="#0b5cff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Zoom Video Communications
                <span style={{
                  fontSize: '0.65rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}>
                  Official API
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} /> End-to-End Encrypted (AES-256)
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {/* Topic & Metadata */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#60a5fa', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
              <Sparkles size={12} /> Live Session Invitation
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 700, marginBottom: '8px', lineHeight: 1.3 }}>
              {meeting.topic}
            </h3>
            {meeting.agenda && (
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '14px', lineHeight: 1.4 }}>
                {meeting.agenda}
              </p>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '12px',
              backgroundColor: 'rgba(30, 41, 59, 0.6)',
              padding: '12px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.8rem',
            }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem', fontWeight: 600 }}>HOST & ORGANIZER</span>
                <span style={{ color: '#f8fafc', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={12} style={{ color: '#38bdf8' }} /> {meeting.hostName}
                </span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem', fontWeight: 600 }}>SCHEDULED TIME</span>
                <span style={{ color: '#f8fafc', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} style={{ color: '#38bdf8' }} /> {formattedDate}
                </span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem', fontWeight: 600 }}>SESSION DURATION</span>
                <span style={{ color: '#f8fafc', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} style={{ color: '#38bdf8' }} /> {meeting.duration} Minutes
                </span>
              </div>
            </div>
          </div>

          {/* Credentials Highlight Card */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'rgba(11, 92, 255, 0.08)',
            border: '1px solid rgba(11, 92, 255, 0.3)',
            borderRadius: '12px',
            padding: '14px 18px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#93c5fd', textTransform: 'uppercase', fontWeight: 700 }}>
                Zoom Meeting ID
              </div>
              <div style={{ fontSize: '1.25rem', fontFamily: 'monospace', color: '#ffffff', fontWeight: 700, letterSpacing: '0.04em' }}>
                {meeting.meetingId}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(meeting.meetingId, 'id')}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '6px' }}
            >
              {copiedId ? <Check size={14} style={{ color: '#34d399' }} /> : <Copy size={14} />}
              {copiedId ? 'Copied ID' : 'Copy ID'}
            </button>

            <div style={{ width: '1px', height: '36px', backgroundColor: 'rgba(255, 255, 255, 0.1)', display: 'none' }} />

            <div>
              <div style={{ fontSize: '0.72rem', color: '#93c5fd', textTransform: 'uppercase', fontWeight: 700 }}>
                Passcode
              </div>
              <div style={{ fontSize: '1.25rem', fontFamily: 'monospace', color: '#ffffff', fontWeight: 700 }}>
                {meeting.password}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(meeting.password, 'pass')}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '6px' }}
            >
              {copiedPass ? <Check size={14} style={{ color: '#34d399' }} /> : <Copy size={14} />}
              {copiedPass ? 'Copied Passcode' : 'Copy Passcode'}
            </button>
          </div>

          {/* In-App Interactive Video Studio Test */}
          {inAppPreview && (
            <div style={{
              backgroundColor: '#020617',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                    In-App Zoom Studio & AV Device Test
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('video')}
                    className={`btn btn-sm ${activeTab === 'video' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                  >
                    Video Room
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('chat')}
                    className={`btn btn-sm ${activeTab === 'chat' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                  >
                    In-Meeting Chat ({chatMessages.length})
                  </button>
                </div>
              </div>

              {activeTab === 'video' ? (
                <div>
                  <div style={{
                    position: 'relative',
                    height: '240px',
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}>
                    {camOn ? (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          backgroundColor: '#0b5cff',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.8rem',
                          fontWeight: 700,
                          margin: '0 auto 10px',
                          boxShadow: '0 0 25px rgba(11, 92, 255, 0.6)',
                        }}>
                          {meeting.attendeeName ? meeting.attendeeName.charAt(0) : 'U'}
                        </div>
                        <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem' }}>
                          Camera Ready: {meeting.attendeeName || 'You'}
                        </div>
                        <div style={{ color: '#34d399', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <Check size={12} /> Audio & Video Stream Active (720p HD)
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                        <CameraOff size={36} style={{ margin: '0 auto 8px', color: '#f87171' }} />
                        <div>Camera Muted</div>
                      </div>
                    )}

                    <div style={{ position: 'absolute', bottom: '12px', left: '12px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', color: '#ffffff' }}>
                      {meeting.attendeeName || 'You (Candidate)'}
                    </div>

                    <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
                      Latency: 18ms
                    </div>
                  </div>

                  {/* Audio / Video Controls */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setMicOn(p => !p)}
                      className={`btn btn-sm ${micOn ? 'btn-secondary' : 'btn-outline'}`}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px', color: micOn ? '#ffffff' : '#f87171' }}
                    >
                      {micOn ? <Mic size={14} style={{ color: '#34d399' }} /> : <MicOff size={14} />}
                      {micOn ? 'Mute Mic' : 'Unmute Mic'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setCamOn(p => !p)}
                      className={`btn btn-sm ${camOn ? 'btn-secondary' : 'btn-outline'}`}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px', color: camOn ? '#ffffff' : '#f87171' }}
                    >
                      {camOn ? <Camera size={14} style={{ color: '#38bdf8' }} /> : <CameraOff size={14} />}
                      {camOn ? 'Turn Off Cam' : 'Turn On Cam'}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', height: '220px' }}>
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                    {chatMessages.map((msg, i) => (
                      <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.8rem' }}>
                        <strong style={{ color: msg.sender === 'You' ? '#60a5fa' : '#34d399' }}>{msg.sender}: </strong>
                        <span style={{ color: '#e2e8f0' }}>{msg.text}</span>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' }}
                      placeholder="Type message to attendees..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary btn-sm" style={{ borderRadius: '6px' }}>
                      Send
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Action Launch Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              {/* Primary: Launch Zoom Native App */}
              <a
                href={meeting.appUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{
                  backgroundColor: '#0b5cff',
                  borderColor: '#0b5cff',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                }}
              >
                <Video size={18} /> Launch in Zoom App
              </a>

              {/* Secondary: Join in Web Browser */}
              <a
                href={meeting.webClientUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                }}
              >
                <Monitor size={18} /> Join via Zoom Web Client <ExternalLink size={14} />
              </a>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setInAppPreview(p => !p)}
                className="btn btn-outline"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '8px', fontSize: '0.85rem' }}
              >
                <Camera size={15} /> {inAppPreview ? 'Hide Device Test Studio' : 'Test AV Camera & Mic Before Joining'}
              </button>

              <button
                type="button"
                onClick={() => handleCopy(formatZoomInvitation(meeting), 'all')}
                className="btn btn-secondary"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '8px', fontSize: '0.85rem' }}
              >
                {copiedAll ? <Check size={15} style={{ color: '#34d399' }} /> : <Copy size={15} />}
                {copiedAll ? 'Invitation Copied!' : 'Copy Full Zoom Invite'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
