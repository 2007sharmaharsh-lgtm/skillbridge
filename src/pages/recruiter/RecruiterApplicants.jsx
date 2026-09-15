import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  getOpportunities,
  getRecruiterApplications,
  getAllStudents,
  updateApplicationStatus,
} from '../../services/firestoreService';
import { calculateSkillMatch } from '../../utils/skillMatching';
import CandidateCard from '../../components/CandidateCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ZoomMeetingModal from '../../components/ZoomMeetingModal';
import ScheduleZoomMeetingModal from '../../components/ScheduleZoomMeetingModal';
import { sendNotification, NOTIF_TYPES } from '../../services/notificationService';
import { Users, Filter, Sparkles, UserCheck, Video } from 'lucide-react';

export default function RecruiterApplicants() {
  const { currentUser } = useAuth();
  const location = useLocation();

  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedOppId, setSelectedOppId] = useState('all');
  const [viewMode, setViewMode] = useState('applicants'); // 'applicants' or 'talent_pool'
  const [minMatch, setMinMatch] = useState(0);

  useEffect(() => {
    async function loadData() {
      if (!currentUser) return;
      try {
        const [opps, apps, allStudents] = await Promise.all([
          getOpportunities({ recruiterId: currentUser.uid }),
          getRecruiterApplications(currentUser.uid),
          getAllStudents(),
        ]);
        setOpportunities(opps);
        setApplications(apps);
        setStudents(allStudents);

        const params = new URLSearchParams(location.search);
        const queryOppId = params.get('opportunityId');
        if (queryOppId) {
          setSelectedOppId(queryOppId);
        } else if (opps.length > 0) {
          setSelectedOppId(opps[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser, location.search]);

  // Zoom Meeting Modals
  const [scheduleModalData, setScheduleModalData] = useState(null);
  const [viewingMeeting, setViewingMeeting] = useState(null);

  const handleStatusChange = async (appId, newStatus, studentObj = null) => {
    try {
      const targetApp = applications.find(a => a.id === appId);
      if (newStatus === 'interview') {
        const targetStudent = studentObj || students.find(s => s.uid === targetApp?.studentId);
        setScheduleModalData({ application: targetApp, student: targetStudent });
        return;
      }

      const updated = await updateApplicationStatus(appId, newStatus);
      if (updated) {
        setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));

        // Dispatch real-time push notification and simulated email alert
        if (newStatus === 'shortlisted') {
          sendNotification({
            recipientId: targetApp?.studentId || 'student_1',
            type: NOTIF_TYPES.SHORTLIST,
            title: 'Application Shortlisted!',
            message: `Great news! Your application has been shortlisted. The recruitment team will reach out for the next stage.`,
            link: '/student/applications',
            metadata: { applicationId: appId, recruiterName: currentUser?.name || 'Recruiter' },
          });
        } else if (newStatus === 'selected') {
          sendNotification({
            recipientId: targetApp?.studentId || 'student_1',
            type: NOTIF_TYPES.SHORTLIST,
            title: 'Congratulations! You Have Been Selected 🎉',
            message: `You have received an offer for this opportunity! Please check your applications tab for verification and onboarding steps.`,
            link: '/student/applications',
            metadata: { applicationId: appId },
          });
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleZoomMeetingCreated = async (meeting) => {
    if (!scheduleModalData?.application) return;
    const appId = scheduleModalData.application.id;
    const targetStudentId = scheduleModalData.application.studentId || 'student_1';

    try {
      const extraData = {
        zoomMeetingId: meeting.meetingId,
        zoomPassword: meeting.password,
        zoomJoinUrl: meeting.joinUrl,
        interviewDate: meeting.startTime,
        interviewType: meeting.topic,
        interviewerName: meeting.hostName,
      };

      const updated = await updateApplicationStatus(appId, 'interview', extraData);
      if (updated) {
        setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'interview', ...extraData } : a));

        // Dispatch real-time Zoom notification & HTML invitation email
        sendNotification({
          recipientId: targetStudentId,
          type: NOTIF_TYPES.INTERVIEW,
          title: 'Zoom Video Interview Scheduled!',
          message: `An interview for "${meeting.topic}" has been confirmed for ${new Date(meeting.startTime).toLocaleString()}. Meeting ID: ${meeting.meetingId} (Passcode: ${meeting.password})`,
          link: '/student/applications',
          metadata: {
            applicationId: appId,
            meetingId: meeting.meetingId,
            password: meeting.password,
            joinUrl: meeting.joinUrl,
            startTime: meeting.startTime,
          },
        });
      }
    } catch (err) {
      console.error('Error attaching Zoom meeting to application:', err);
    }
  };

  const handleOpenZoomViewer = (application) => {
    if (!application) return;
    const meetingObj = {
      meetingId: application.zoomMeetingId || '849 2931 0482',
      password: application.zoomPassword || 'SIH26',
      joinUrl: application.zoomJoinUrl || `https://zoom.us/j/${(application.zoomMeetingId || '').replace(/\s+/g, '')}`,
      appUrl: `zoommtg://zoom.us/join?confno=${(application.zoomMeetingId || '').replace(/\s+/g, '')}&pwd=${application.zoomPassword || 'SIH26'}`,
      webClientUrl: `https://zoom.us/wc/${(application.zoomMeetingId || '').replace(/\s+/g, '')}/join?prefer=1&pwd=${application.zoomPassword || 'SIH26'}`,
      topic: application.interviewType || 'Candidate Technical Interview',
      hostName: application.interviewerName || currentUser?.name || 'Recruiter Lead',
      startTime: application.interviewDate || new Date().toISOString(),
      duration: 45,
      agenda: 'Technical evaluation and candidate interview via Zoom API.',
    };
    setViewingMeeting(meetingObj);
  };

  if (loading) return <LoadingSpinner text="Analyzing candidate skill matches..." />;

  const activeOpp = opportunities.find(o => o.id === selectedOppId) || opportunities[0] || null;
  const studentMap = new Map(students.map(s => [s.uid, s]));

  // If in 'applicants' view: list candidates who applied to the selected opportunity
  let displayedCandidates = [];

  if (viewMode === 'applicants') {
    const relevantApps = selectedOppId === 'all'
      ? applications
      : applications.filter(a => a.opportunityId === selectedOppId);

    displayedCandidates = relevantApps.map(app => {
      const student = studentMap.get(app.studentId) || { uid: app.studentId, name: 'Student' };
      const opp = opportunities.find(o => o.id === app.opportunityId) || activeOpp;
      const matchResult = opp
        ? calculateSkillMatch(student.skills || [], opp.requiredSkills, opp.preferredSkills)
        : null;

      return {
        student,
        application: app,
        matchResult,
      };
    });
  } else {
    // In 'talent_pool' discovery mode: rank ALL registered students against the selected opportunity requirements!
    if (activeOpp) {
      displayedCandidates = students.map(student => {
        const matchResult = calculateSkillMatch(
          student.skills || [],
          activeOpp.requiredSkills,
          activeOpp.preferredSkills
        );
        const existingApp = applications.find(a => a.studentId === student.uid && a.opportunityId === activeOpp.id);
        return {
          student,
          application: existingApp || null,
          matchResult,
        };
      });
    }
  }

  // Filter by min match and sort by highest compatibility match
  displayedCandidates = displayedCandidates
    .filter(item => {
      if (!item.matchResult) return true;
      return item.matchResult.matchPercentage >= minMatch;
    })
    .sort((a, b) => (b.matchResult?.matchPercentage || 0) - (a.matchResult?.matchPercentage || 0));

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users style={{ color: 'var(--purple)' }} /> Candidate Discovery & Skill Matching Engine
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Review candidate submissions ranked dynamically by competency compatibility against vacancy requirements.
        </p>
      </div>

      {/* Control Toolbar */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
            {/* View Mode Toggle */}
            <div style={{ display: 'inline-flex', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--border-radius)', padding: '2px', border: '1px solid var(--border-color)' }}>
              <button
                className={`btn btn-sm ${viewMode === 'applicants' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ border: 'none' }}
                onClick={() => setViewMode('applicants')}
              >
                Direct Applicants ({applications.length})
              </button>
              <button
                className={`btn btn-sm ${viewMode === 'talent_pool' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ border: 'none' }}
                onClick={() => setViewMode('talent_pool')}
              >
                <Sparkles size={13} /> Discover Talent Pool ({students.length})
              </button>
            </div>

            {/* Opportunity Selector */}
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: 'min(100%, 220px)', maxWidth: '100%' }}
              value={selectedOppId}
              onChange={(e) => setSelectedOppId(e.target.value)}
            >
              {viewMode === 'applicants' && <option value="all">All Opportunities</option>}
              {opportunities.map(opp => (
                <option key={opp.id} value={opp.id}>
                  {opp.title} ({opp.type})
                </option>
              ))}
            </select>

            {/* Match percentage filter */}
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: 'min(100%, 150px)', maxWidth: '100%' }}
              value={minMatch}
              onChange={(e) => setMinMatch(Number(e.target.value))}
            >
              <option value="0">All Match Scores</option>
              <option value="50">50%+ Compatibility</option>
              <option value="70">70%+ High Fit</option>
              <option value="85">85%+ Optimal Match</option>
            </select>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing <strong>{displayedCandidates.length}</strong> candidates
          </div>
        </div>
      </div>

      {displayedCandidates.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No candidates found"
          description={
            viewMode === 'applicants'
              ? 'No applications submitted for this role yet. Try switching to "Discover Talent Pool" to find qualified students proactively!'
              : 'No students match the minimum compatibility threshold for this vacancy.'
          }
        />
      ) : (
        <div className="grid-2">
          {displayedCandidates.map(({ student, application, matchResult }) => (
            <CandidateCard
              key={`${student.uid}_${application?.id || 'pool'}`}
              student={student}
              application={application}
              matchResult={matchResult}
              onStatusChange={handleStatusChange}
              onScheduleZoom={(app, stu) => setScheduleModalData({ application: app, student: stu })}
              onViewZoom={(app) => handleOpenZoomViewer(app)}
            />
          ))}
        </div>
      )}

      {/* Schedule Zoom Modal */}
      {scheduleModalData && (
        <ScheduleZoomMeetingModal
          initialCandidateName={scheduleModalData.student?.name || 'Candidate'}
          initialTopic={`Technical Interview: ${scheduleModalData.student?.name || 'Candidate'} - ${activeOpp?.title || 'Engineering Role'}`}
          hostName={currentUser?.name || 'Technical Hiring Lead'}
          hostEmail={currentUser?.email || 'recruiter@company.com'}
          onClose={() => setScheduleModalData(null)}
          onMeetingCreated={(meeting) => {
            handleZoomMeetingCreated(meeting);
            setScheduleModalData(null);
          }}
        />
      )}

      {/* View Zoom Details Modal */}
      {viewingMeeting && (
        <ZoomMeetingModal
          meeting={viewingMeeting}
          onClose={() => setViewingMeeting(null)}
        />
      )}
    </div>
  );
}
