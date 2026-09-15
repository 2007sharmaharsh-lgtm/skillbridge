import React, { useState } from 'react';
import { Video, Calendar, Clock, User, FileText, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { createZoomMeeting } from '../services/zoomService';

export default function ScheduleZoomMeetingModal({
  initialCandidateName = '',
  initialTopic = '',
  hostName = 'Hiring Manager',
  hostEmail = 'recruiter@company.com',
  onClose,
  onMeetingCreated,
}) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    topic: initialTopic || `Technical Interview: ${initialCandidateName || 'Candidate'}`,
    agenda: 'Evaluation of full-stack engineering competencies, problem solving, and architecture design.',
    date: defaultDateStr,
    time: '15:00',
    duration: 45,
    hostName: hostName || 'Technical Recruiter',
    candidateName: initialCandidateName || 'Candidate',
    interviewType: 'Technical Architecture & Coding',
  });

  const [scheduling, setScheduling] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setScheduling(true);

    try {
      const combinedDateTime = new Date(`${formData.date}T${formData.time}`).toISOString();
      const meeting = await createZoomMeeting({
        topic: formData.topic,
        agenda: `${formData.interviewType} - ${formData.agenda}`,
        startTime: combinedDateTime,
        duration: Number(formData.duration),
        hostName: formData.hostName,
        hostEmail: hostEmail,
        attendeeName: formData.candidateName,
        category: 'interview',
      });

      setCreatedMeeting(meeting);
      if (onMeetingCreated) {
        onMeetingCreated(meeting);
      }
    } catch (err) {
      console.error('Error creating Zoom meeting:', err);
    } finally {
      setScheduling(false);
    }
  };

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
        border: '1px solid rgba(11, 92, 255, 0.4)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '560px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px rgba(11, 92, 255, 0.25)',
        overflow: 'hidden',
      }}>
        {/* Header */}
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
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0b5cff',
            }}>
              <Video size={18} fill="#0b5cff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                Schedule Live Zoom Interview
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.9 }}>
                Generates instant Zoom Meeting ID & Secure Encrypted Join Link
              </p>
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
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <div style={{ padding: '24px' }}>
          {createdMeeting ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'rgba(52, 211, 153, 0.15)',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                border: '1px solid rgba(52, 211, 153, 0.3)',
              }}>
                <CheckCircle2 size={32} />
              </div>
              <h4 style={{ fontSize: '1.3rem', color: '#ffffff', fontWeight: 700, marginBottom: '8px' }}>
                Zoom Meeting Created Successfully!
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '20px' }}>
                The candidate has been notified and the Zoom link is attached to their application tracker.
              </p>

              <div style={{
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '10px',
                padding: '16px',
                textAlign: 'left',
                marginBottom: '20px',
              }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
                  MEETING TOPIC: <strong style={{ color: '#ffffff' }}>{createdMeeting.topic}</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
                  MEETING ID: <strong style={{ color: '#60a5fa', fontFamily: 'monospace' }}>{createdMeeting.meetingId}</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  PASSCODE: <strong style={{ color: '#34d399', fontFamily: 'monospace' }}>{createdMeeting.password}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <a
                  href={createdMeeting.joinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ flex: 1, textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                >
                  <Video size={16} /> Open in Zoom
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>Meeting Topic / Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.topic}
                  onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                  required
                />
              </div>

              <div className="grid-2" style={{ marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Candidate Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.candidateName}
                    onChange={(e) => setFormData(prev => ({ ...prev, candidateName: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Interview Round Type</label>
                  <select
                    className="form-select"
                    value={formData.interviewType}
                    onChange={(e) => setFormData(prev => ({ ...prev, interviewType: e.target.value }))}
                  >
                    <option value="Technical Architecture & Coding">Technical Architecture & Coding</option>
                    <option value="Data Structures & System Design">Data Structures & System Design</option>
                    <option value="Core Engineering & Problem Solving">Core Engineering & Problem Solving</option>
                    <option value="Managerial & Culture Fit">Managerial & Culture Fit</option>
                    <option value="Final Placement Round">Final Placement Round</option>
                  </select>
                </div>
              </div>

              <div className="grid-2" style={{ marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Interview Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Start Time (IST)</label>
                  <input
                    type="time"
                    className="form-input"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid-2" style={{ marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Duration</label>
                  <select
                    className="form-select"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  >
                    <option value="30">30 Minutes</option>
                    <option value="45">45 Minutes</option>
                    <option value="60">60 Minutes (1 Hour)</option>
                    <option value="90">90 Minutes</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Host / Interviewer</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.hostName}
                    onChange={(e) => setFormData(prev => ({ ...prev, hostName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '22px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>Session Agenda / Instructions</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={formData.agenda}
                  onChange={(e) => setFormData(prev => ({ ...prev, agenda: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={scheduling}
                  style={{
                    backgroundColor: '#0b5cff',
                    borderColor: '#0b5cff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 700,
                  }}
                >
                  <Sparkles size={16} /> {scheduling ? 'Generating Zoom API Link...' : 'Generate Zoom Meeting'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
