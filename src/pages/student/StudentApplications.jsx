import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getStudentApplications, getOpportunities } from '../../services/firestoreService';
import ApplicationStatusBadge from '../../components/ApplicationStatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ZoomMeetingModal from '../../components/ZoomMeetingModal';
import MockInterviewModal from '../../components/MockInterviewModal';
import { FileCheck, ArrowRight, Building, Calendar, CheckCircle2, Clock, Video, Sparkles, BrainCircuit } from 'lucide-react';

const STATUS_STEPS = ['applied', 'under_review', 'shortlisted', 'interview', 'selected'];

export default function StudentApplications() {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showMockModal, setShowMockModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!currentUser) return;
      try {
        const [apps, opps] = await Promise.all([
          getStudentApplications(currentUser.uid),
          getOpportunities(),
        ]);
        setApplications(apps);
        setOpportunities(opps);
      } catch (err) {
        console.error('Error loading applications:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser]);

  if (loading) return <LoadingSpinner text="Loading tracked applications..." />;

  const getStepProgress = (status) => {
    if (status === 'rejected') return -1;
    const idx = STATUS_STEPS.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>My Applications Tracking</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Monitor your application lifecycle across recruiter review, shortlisting, interviews, and final selection.
          </p>
        </div>
        <button
          onClick={() => setShowMockModal(true)}
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(56, 189, 248, 0.4)', background: 'rgba(56, 189, 248, 0.08)' }}
        >
          <BrainCircuit size={16} style={{ color: '#38bdf8' }} /> Practice AI Mock Interview
        </button>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="No applications tracked"
          description="You haven't applied to any internships or placement postings yet."
          action={
            <Link to="/student/opportunities" className="btn btn-primary">
              Browse Open Opportunities <ArrowRight size={16} />
            </Link>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {applications.map(app => {
            const opp = opportunities.find(o => o.id === app.opportunityId) || {};
            const stepIndex = getStepProgress(app.status);

            return (
              <div key={app.id} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '2px 8px', borderRadius: '4px' }}>
                      {opp.type || 'Opportunity'}
                    </span>
                    <h3 style={{ fontSize: '1.15rem', marginTop: '4px' }}>{opp.title || 'Position'}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <Building size={14} />
                      <span>{opp.companyName || 'Company'}</span>
                      <span>•</span>
                      <span>{opp.location || 'Location'}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ marginBottom: '6px' }}>
                      <ApplicationStatusBadge status={app.status} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> Applied on {new Date(app.appliedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Progress Timeline */}
                {app.status === 'rejected' ? (
                  <div style={{ padding: '10px 14px', backgroundColor: 'var(--danger-light)', borderRadius: 'var(--border-radius)', color: 'var(--danger)', fontSize: '0.825rem' }}>
                    Application status updated: Not selected for this opening. Don't worry—review the missing skill recommendations on similar roles and try again!
                  </div>
                ) : (
                  <div style={{ marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', minWidth: '360px', position: 'relative' }}>
                        {STATUS_STEPS.map((step, idx) => {
                          const isDone = idx <= stepIndex;
                          const isCurrent = idx === stepIndex;
                          return (
                            <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                              <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: isDone ? 'var(--primary)' : 'var(--bg-subtle)',
                                color: isDone ? '#ffffff' : 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                marginBottom: '6px',
                                border: isCurrent ? '3px solid var(--border-glow)' : 'none',
                                zIndex: 2,
                              }}>
                                {isDone ? '✓' : idx + 1}
                              </div>
                              <span style={{
                                fontSize: '0.72rem',
                                fontWeight: isCurrent ? 700 : 500,
                                color: isCurrent ? 'var(--primary)' : isDone ? 'var(--text-main)' : 'var(--text-muted)',
                                textAlign: 'center',
                                textTransform: 'capitalize',
                                whiteSpace: 'nowrap'
                              }}>
                                {step.replace('_', ' ')}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Scheduled Zoom Video Interview Alert & Join Action */}
                {app.status === 'interview' && (
                  <div style={{
                    marginTop: '16px',
                    backgroundColor: 'rgba(11, 92, 255, 0.08)',
                    border: '1px solid rgba(11, 92, 255, 0.35)',
                    borderRadius: '12px',
                    padding: '16px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '14px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        backgroundColor: '#0b5cff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        boxShadow: '0 0 16px rgba(11, 92, 255, 0.4)',
                        flexShrink: 0,
                      }}>
                        <Video size={22} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h4 style={{ fontSize: '1.05rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>
                            Live Zoom Video Interview Scheduled
                          </h4>
                          <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(52, 211, 153, 0.2)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.4)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            Zoom API Connected
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                          <span><strong>Meeting ID:</strong> <span style={{ color: '#60a5fa', fontFamily: 'monospace' }}>{app.zoomMeetingId || '849 2931 0482'}</span></span>
                          <span><strong>Passcode:</strong> <span style={{ color: '#34d399', fontFamily: 'monospace' }}>{app.zoomPassword || 'SIH26'}</span></span>
                          {app.interviewDate && (
                            <span><strong>Time:</strong> {new Date(app.interviewDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedMeeting({
                          meetingId: app.zoomMeetingId || '849 2931 0482',
                          password: app.zoomPassword || 'SIH26',
                          joinUrl: app.zoomJoinUrl || 'https://zoom.us/j/84929310482?pwd=U2lIMjYwNDRJbnRlcnZpZXc',
                          appUrl: `zoommtg://zoom.us/join?confno=${(app.zoomMeetingId || '849 2931 0482').replace(/\s+/g, '')}&pwd=${app.zoomPassword || 'SIH26'}`,
                          webClientUrl: `https://zoom.us/wc/${(app.zoomMeetingId || '849 2931 0482').replace(/\s+/g, '')}/join?prefer=1&pwd=${app.zoomPassword || 'SIH26'}`,
                          topic: app.interviewType || `${opp.title || 'Job'} Technical Interview`,
                          hostName: app.interviewerName || opp.companyName || 'Technical Recruiter Lead',
                          startTime: app.interviewDate || new Date().toISOString(),
                          duration: 45,
                          agenda: 'Full stack technical architecture evaluation & live problem solving discussion.',
                          attendeeName: currentUser?.name || 'Student Candidate',
                        })}
                        className="btn btn-primary"
                        style={{
                          backgroundColor: '#0b5cff',
                          borderColor: '#0b5cff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontWeight: 700,
                          borderRadius: '8px',
                          padding: '10px 16px',
                        }}
                      >
                        <Video size={16} /> Join Live Zoom Interview
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Zoom Meeting Viewer Modal */}
      {selectedMeeting && (
        <ZoomMeetingModal
          meeting={selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
        />
      )}

      {/* AI Mock Interview Practice Simulator */}
      <MockInterviewModal
        isOpen={showMockModal}
        onClose={() => setShowMockModal(false)}
      />
    </div>
  );
}
