import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MOCK_LEARNING_PROGRAMS } from '../../constants';
import { getAllZoomMeetings } from '../../services/zoomService';
import {
  getStudentEnrollments,
  enrollInLearningProgram,
  unenrollLearningProgram,
} from '../../services/firestoreService';
import ZoomMeetingModal from '../../components/ZoomMeetingModal';
import ScheduleZoomMeetingModal from '../../components/ScheduleZoomMeetingModal';
import {
  GraduationCap,
  Award,
  BookOpen,
  Clock,
  Users,
  Star,
  CheckCircle,
  ArrowUpRight,
  Video,
  Radio,
  Calendar,
  Sparkles,
  PlusCircle,
} from 'lucide-react';

export default function LearningHub() {
  const { currentUser } = useAuth();
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [activeZoomMeeting, setActiveZoomMeeting] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [zoomMeetings, setZoomMeetings] = useState(() => getAllZoomMeetings());

  useEffect(() => {
    async function loadEnrollments() {
      const studentId = currentUser?.uid || 'student_1';
      try {
        const enrollments = await getStudentEnrollments(studentId);
        setEnrolledIds(enrollments.map(e => e.programId));
      } catch (err) {
        console.error('Failed to load enrollments:', err);
      }
    }
    loadEnrollments();
  }, [currentUser?.uid]);

  const handleEnroll = async (id) => {
    const studentId = currentUser?.uid || 'student_1';
    try {
      await enrollInLearningProgram(studentId, id);
      setEnrolledIds(prev => [...prev, id]);
    } catch (err) {
      console.error('Enrollment error:', err);
    }
  };

  const handleMeetingCreated = (newMeeting) => {
    setZoomMeetings(prev => [newMeeting, ...prev]);
    setActiveZoomMeeting(newMeeting);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <GraduationCap style={{ color: 'var(--primary)' }} /> Industry Learning Programs & Mentorship Hub
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Upskill through verified company courses, join live Zoom workshops, and book 1-on-1 mentorship sessions with industry leaders.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowScheduleModal(true)}
          className="btn btn-primary"
          style={{
            backgroundColor: '#0b5cff',
            borderColor: '#0b5cff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            fontWeight: 700,
            boxShadow: '0 0 20px rgba(11, 92, 255, 0.4)',
          }}
        >
          <Video size={18} /> Book 1-on-1 Zoom Mentorship
        </button>
      </div>

      {/* Live Zoom Mentorship & Interactive Broadcasts Banner */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Radio size={18} style={{ color: '#ef4444', animation: 'pulse 1.5s infinite' }} />
          <h3 style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 700, margin: 0 }}>
            Live Zoom Mentorship & Interactive Workshops
          </h3>
          <span style={{ fontSize: '0.72rem', backgroundColor: 'rgba(11, 92, 255, 0.2)', color: '#60a5fa', border: '1px solid rgba(11, 92, 255, 0.4)', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
            Powered by Zoom API
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {zoomMeetings.slice(0, 3).map((zm) => {
            const isLive = zm.status === 'live';
            return (
              <div
                key={zm.id}
                className="card"
                style={{
                  border: isLive ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(11, 92, 255, 0.3)',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {isLive && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#f87171',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
                    LIVE NOW
                  </div>
                )}

                <div>
                  <div style={{ fontSize: '0.75rem', color: '#60a5fa', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                    {zm.category.toUpperCase()} • {zm.duration} MINS
                  </div>
                  <h4 style={{ fontSize: '1.05rem', color: '#ffffff', fontWeight: 700, marginBottom: '8px', lineHeight: 1.3 }}>
                    {zm.topic}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '14px', lineHeight: 1.4 }}>
                    {zm.agenda}
                  </p>

                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div><strong>Mentor:</strong> {zm.hostName}</div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <span><strong>Meeting ID:</strong> <code style={{ color: '#60a5fa' }}>{zm.meetingId}</code></span>
                      <span><strong>Passcode:</strong> <code style={{ color: '#34d399' }}>{zm.password}</code></span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveZoomMeeting(zm)}
                  className="btn btn-primary"
                  style={{
                    backgroundColor: isLive ? '#ef4444' : '#0b5cff',
                    borderColor: isLive ? '#ef4444' : '#0b5cff',
                    width: '100%',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 700,
                  }}
                >
                  <Video size={16} /> {isLive ? 'Join Live Zoom Meeting Now' : 'Open Zoom Meeting Details'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Program Cards Grid */}
      <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 700, marginBottom: '16px' }}>
        Certified Industry Bootcamps & Specializations
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '22px' }}>
        {MOCK_LEARNING_PROGRAMS.map((program) => {
          const isEnrolled = enrolledIds.includes(program.id);
          return (
            <div key={program.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="badge" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                    {program.type}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#fbbf24' }}>
                    <Star size={14} fill="#fbbf24" /> {program.rating}
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '4px' }}>
                  {program.provider}
                </div>
                <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '10px', lineHeight: 1.3 }}>
                  {program.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.4 }}>
                  {program.description}
                </p>

                {/* Skills tags */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>
                    COMPETENCIES TAUGHT:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {program.skillsProvided.map((sk, idx) => (
                      <span key={idx} className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa', fontSize: '0.75rem' }}>
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Meta details */}
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '18px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} /> {program.duration}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <BookOpen size={14} /> {program.level}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={14} /> {program.enrolledCount} Students
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleEnroll(program.id)}
                  className={isEnrolled ? "btn btn-secondary" : "btn btn-primary"}
                  style={{ flex: 1, borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                  disabled={isEnrolled}
                >
                  {isEnrolled ? (
                    <>
                      <CheckCircle size={16} style={{ color: '#34d399' }} /> Enrolled & Active
                    </>
                  ) : (
                    <>
                      Enroll Now <ArrowUpRight size={16} />
                    </>
                  )}
                </button>

                {isEnrolled && (
                  <button
                    onClick={() => setActiveZoomMeeting({
                      meetingId: '912 4058 1192',
                      password: 'Cloud26',
                      joinUrl: 'https://zoom.us/j/91240581192?pwd=Q2xvdWQyNk1hc3RlcmNsYXNz',
                      appUrl: 'zoommtg://zoom.us/join?confno=91240581192&pwd=Cloud26',
                      webClientUrl: 'https://zoom.us/wc/91240581192/join?prefer=1&pwd=Cloud26',
                      topic: `${program.title} - Live Zoom Session`,
                      hostName: `${program.provider} Lead Instructor`,
                      startTime: new Date().toISOString(),
                      duration: 60,
                      agenda: program.description,
                    })}
                    className="btn btn-primary"
                    style={{
                      backgroundColor: '#0b5cff',
                      borderColor: '#0b5cff',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                    title="Launch Live Zoom Class"
                  >
                    <Video size={16} /> Live Class
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Zoom Meeting Launch Modal */}
      {activeZoomMeeting && (
        <ZoomMeetingModal
          meeting={activeZoomMeeting}
          onClose={() => setActiveZoomMeeting(null)}
        />
      )}

      {/* Schedule 1-on-1 Mentorship Modal */}
      {showScheduleModal && (
        <ScheduleZoomMeetingModal
          initialTopic="1-on-1 Career Mentorship & Portfolio Review"
          hostName="Dr. Priya Srinivasan (Google AI Lead)"
          hostEmail="mentor@industry-mentorship.org"
          onClose={() => setShowScheduleModal(false)}
          onMeetingCreated={(meeting) => {
            handleMeetingCreated(meeting);
            setShowScheduleModal(false);
          }}
        />
      )}
    </div>
  );
}
