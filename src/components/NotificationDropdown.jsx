import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
  getEmailOutbox,
  NOTIF_TYPES,
} from '../services/notificationService';
import EmailAlertModal from './EmailAlertModal';
import ZoomMeetingModal from './ZoomMeetingModal';
import {
  Bell,
  CheckCheck,
  Trash2,
  Video,
  Award,
  MessageSquare,
  FileCheck,
  Mail,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function NotificationDropdown() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('notifs'); // 'notifs' | 'emails'
  const [notifications, setNotifications] = useState([]);
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [selectedZoomMeeting, setSelectedZoomMeeting] = useState(null);

  const refreshData = () => {
    const notifs = getNotifications(currentUser?.uid || 'student_1');
    const outbox = getEmailOutbox();
    setNotifications(notifs);
    setEmails(outbox);
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [currentUser?.uid]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);
    refreshData();

    if (notif.type === NOTIF_TYPES.INTERVIEW && notif.metadata?.meetingId) {
      setSelectedZoomMeeting({
        meetingId: notif.metadata.meetingId,
        password: notif.metadata.passcode || 'SIH26',
        joinUrl: `https://zoom.us/j/${notif.metadata.meetingId.replace(/\s+/g, '')}`,
        appUrl: `zoommtg://zoom.us/join?confno=${notif.metadata.meetingId.replace(/\s+/g, '')}&pwd=${notif.metadata.passcode || 'SIH26'}`,
        webClientUrl: `https://zoom.us/wc/${notif.metadata.meetingId.replace(/\s+/g, '')}/join?prefer=1&pwd=${notif.metadata.passcode || 'SIH26'}`,
        topic: notif.title.replace('📹 ', ''),
        hostName: notif.metadata.company || 'NexGen Cloud Solutions',
        startTime: new Date().toISOString(),
        duration: 45,
        agenda: notif.message,
      });
      setIsOpen(false);
      return;
    }

    if (notif.link) {
      setIsOpen(false);
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = () => {
    markAllAsRead(currentUser?.uid || 'student_1');
    refreshData();
  };

  const handleClearAll = () => {
    clearAllNotifications(currentUser?.uid || 'student_1');
    refreshData();
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case NOTIF_TYPES.INTERVIEW:
        return <Video size={16} style={{ color: '#38bdf8' }} />;
      case NOTIF_TYPES.SHORTLIST:
        return <Award size={16} style={{ color: '#34d399' }} />;
      case NOTIF_TYPES.MESSAGE:
        return <MessageSquare size={16} style={{ color: '#a78bfa' }} />;
      default:
        return <FileCheck size={16} style={{ color: '#f59e0b' }} />;
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(prev => !prev);
          refreshData();
        }}
        aria-label="Notifications"
        title="Notifications & Alerts"
        style={{
          position: 'relative',
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          backgroundColor: isOpen ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-glass)',
          border: isOpen ? '1px solid var(--primary)' : '1px solid var(--border-color)',
          color: isOpen ? 'var(--primary)' : 'var(--text-main)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-3px',
            right: '-3px',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            borderRadius: '9999px',
            fontSize: '0.65rem',
            fontWeight: 800,
            padding: '1px 5px',
            minWidth: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 8px rgba(239, 68, 68, 0.7)',
            animation: 'pulse 1.8s infinite',
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '48px',
          right: 0,
          width: '380px',
          maxWidth: '90vw',
          backgroundColor: '#0f172a',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '14px',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 25px rgba(59, 130, 246, 0.15)',
          zIndex: 9999,
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 16px',
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span style={{
                  fontSize: '0.7rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  color: '#f87171',
                  padding: '2px 6px',
                  borderRadius: '999px',
                  fontWeight: 700,
                }}>
                  {unreadCount} New
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  title="Mark all as read"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 6px',
                  }}
                >
                  <CheckCheck size={14} /> Read all
                </button>
              )}
              <button
                type="button"
                onClick={handleClearAll}
                title="Clear notifications"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '3px 6px',
                }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <button
              type="button"
              onClick={() => setActiveTab('notifs')}
              style={{
                flex: 1,
                padding: '9px 12px',
                background: activeTab === 'notifs' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                color: activeTab === 'notifs' ? '#60a5fa' : '#94a3b8',
                border: 'none',
                borderBottom: activeTab === 'notifs' ? '2px solid #3b82f6' : '2px solid transparent',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Push Alerts ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('emails')}
              style={{
                flex: 1,
                padding: '9px 12px',
                background: activeTab === 'emails' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                color: activeTab === 'emails' ? '#60a5fa' : '#94a3b8',
                border: 'none',
                borderBottom: activeTab === 'emails' ? '2px solid #3b82f6' : '2px solid transparent',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              <Mail size={13} /> Email Log ({emails.length})
            </button>
          </div>

          {/* Body Content */}
          <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
            {activeTab === 'notifs' ? (
              notifications.length === 0 ? (
                <div style={{ padding: '30px 20px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                  No notifications yet. You're all caught up!
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      backgroundColor: notif.read ? 'transparent' : 'rgba(59, 130, 246, 0.08)',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notif.read ? 'transparent' : 'rgba(59, 130, 246, 0.08)'}
                  >
                    <div style={{
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(30, 41, 59, 0.8)',
                      marginTop: '2px',
                    }}>
                      {getNotifIcon(notif.type)}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.85rem',
                        fontWeight: notif.read ? 600 : 700,
                        color: notif.read ? '#e2e8f0' : '#ffffff',
                        marginBottom: '3px',
                      }}>
                        {notif.title}
                      </div>
                      <div style={{
                        fontSize: '0.78rem',
                        color: '#94a3b8',
                        lineHeight: 1.4,
                        marginBottom: '6px',
                      }}>
                        {notif.message}
                      </div>
                      <div style={{
                        fontSize: '0.7rem',
                        color: '#64748b',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}>
                        <span>{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {notif.type === NOTIF_TYPES.INTERVIEW && (
                          <span style={{ color: '#38bdf8', fontWeight: 600 }}>Open Zoom Meeting →</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : (
              emails.length === 0 ? (
                <div style={{ padding: '30px 20px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                  No email dispatches recorded.
                </div>
              ) : (
                emails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(30, 41, 59, 0.8)', marginTop: '2px' }}>
                      <Mail size={16} style={{ color: '#38bdf8' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', marginBottom: '2px' }}>
                        {email.subject}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {email.preview}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#34d399', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Status: {email.status}</span>
                        <span style={{ color: '#60a5fa' }}>Click to view email →</span>
                      </div>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      )}

      {/* Email Body Modal */}
      {selectedEmail && (
        <EmailAlertModal
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
        />
      )}

      {/* Zoom Modal if triggered from notification */}
      {selectedZoomMeeting && (
        <ZoomMeetingModal
          meeting={selectedZoomMeeting}
          onClose={() => setSelectedZoomMeeting(null)}
        />
      )}
    </div>
  );
}
