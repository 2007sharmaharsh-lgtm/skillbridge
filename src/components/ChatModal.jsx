import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markConversationAsRead,
} from '../services/chatService';
import ZoomMeetingModal from './ZoomMeetingModal';
import {
  MessageSquare,
  X,
  Send,
  Video,
  User,
  CheckCheck,
  Smile,
  Sparkles,
  Search,
} from 'lucide-react';

export default function ChatModal({ isOpen, onClose, initialConversationId = null }) {
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.uid || 'student_1';

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedZoomMeeting, setSelectedZoomMeeting] = useState(null);
  const messagesEndRef = useRef(null);

  const refreshChat = () => {
    const convs = getUserConversations(currentUserId);
    setConversations(convs);

    if (!activeConvId && convs.length > 0) {
      const targetId = initialConversationId || convs[0].id;
      setActiveConvId(targetId);
      setMessages(getConversationMessages(targetId));
      markConversationAsRead(targetId, currentUserId);
    } else if (activeConvId) {
      setMessages(getConversationMessages(activeConvId));
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshChat();
      const interval = setInterval(refreshChat, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, activeConvId, currentUserId]);

  useEffect(() => {
    if (activeConvId) {
      setMessages(getConversationMessages(activeConvId));
      markConversationAsRead(activeConvId, currentUserId);
    }
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];
  const otherParticipantId = activeConv?.participants.find(p => p !== currentUserId);
  const otherDetails = activeConv?.participantDetails?.[otherParticipantId] || { name: 'Contact' };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId) return;

    sendMessage({
      conversationId: activeConvId,
      senderId: currentUserId,
      senderName: currentUser?.name || 'Aarav Sharma',
      text: inputText.trim(),
    });

    setInputText('');
    refreshChat();
  };

  const handleAttachZoom = () => {
    if (!activeConvId) return;
    const zoomLink = 'https://zoom.us/j/84929310482?pwd=U2lIMjYwNDRJbnRlcnZpZXc';
    sendMessage({
      conversationId: activeConvId,
      senderId: currentUserId,
      senderName: currentUser?.name || 'Aarav Sharma',
      text: '📹 Here is the Zoom Meeting link for our upcoming discussion: Meeting ID: 849 2931 0482 | Passcode: SIH26',
      zoomLink,
    });
    refreshChat();
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
        border: '1px solid rgba(59, 130, 246, 0.4)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '850px',
        height: '600px',
        maxHeight: '90vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px rgba(59, 130, 246, 0.2)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#1e293b',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '14px 20px',
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
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}>
              <MessageSquare size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                Direct Mentorship & Recruiter Messaging Hub
              </h3>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8' }}>
                End-to-End Real-Time Collaboration & Direct Zoom Invites
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body: Left sidebar (conversations) + Right pane (chat) */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          {/* Conversation Sidebar */}
          <div style={{
            width: '280px',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active Channels
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {conversations.map((conv) => {
                const otherId = conv.participants.find(p => p !== currentUserId);
                const details = conv.participantDetails?.[otherId] || { name: 'Contact' };
                const isSelected = conv.id === activeConvId;
                const unread = conv.unreadCount?.[currentUserId] || 0;

                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    style={{
                      padding: '12px 14px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                      borderLeft: isSelected ? '3px solid #3b82f6' : '3px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: isSelected ? '#60a5fa' : '#ffffff' }}>
                        {details.name}
                      </span>
                      {unread > 0 && (
                        <span style={{ fontSize: '0.65rem', backgroundColor: '#ef4444', color: '#ffffff', padding: '1px 5px', borderRadius: '999px', fontWeight: 800 }}>
                          {unread}
                        </span>
                      )}
                    </div>
                    {details.title && (
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>
                        {details.title}
                      </div>
                    )}
                    <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {conv.lastMessage}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Chat Pane */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#020617' }}>
            {/* Active Contact Header */}
            {activeConv && (
              <div style={{
                padding: '12px 18px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#3b82f6',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 700,
                  }}>
                    {otherDetails.photoURL ? (
                      <img src={otherDetails.photoURL} alt={otherDetails.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={18} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#ffffff' }}>
                      {otherDetails.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34d399' }} /> Online & Ready
                    </div>
                  </div>
                </div>

                {/* Quick Action: Attach Zoom Meeting Link */}
                <button
                  type="button"
                  onClick={handleAttachZoom}
                  className="btn btn-secondary btn-sm"
                  style={{
                    backgroundColor: 'rgba(11, 92, 255, 0.15)',
                    borderColor: 'rgba(11, 92, 255, 0.4)',
                    color: '#60a5fa',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                  }}
                  title="Share Zoom Meeting Link directly into chat"
                >
                  <Video size={14} /> Send Zoom Invite
                </button>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map((msg) => {
                const isMe = msg.senderId === currentUserId;

                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div style={{
                      fontSize: '0.7rem',
                      color: '#64748b',
                      marginBottom: '3px',
                      padding: '0 4px',
                    }}>
                      {isMe ? 'You' : msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    <div style={{
                      maxWidth: '75%',
                      padding: '10px 14px',
                      borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      backgroundColor: isMe ? '#2563eb' : '#1e293b',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      lineHeight: 1.45,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                    }}>
                      {msg.text}

                      {/* Zoom link embed card */}
                      {msg.zoomLink && (
                        <div style={{
                          marginTop: '10px',
                          padding: '10px 12px',
                          backgroundColor: 'rgba(11, 92, 255, 0.2)',
                          border: '1px solid rgba(11, 92, 255, 0.5)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Video size={16} style={{ color: '#38bdf8' }} />
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff' }}>
                              Live Zoom Meeting
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedZoomMeeting({
                              meetingId: '849 2931 0482',
                              password: 'SIH26',
                              joinUrl: msg.zoomLink,
                              appUrl: 'zoommtg://zoom.us/join?confno=84929310482&pwd=SIH26',
                              webClientUrl: 'https://zoom.us/wc/84929310482/join?prefer=1&pwd=SIH26',
                              topic: 'Mentorship & Interview Discussion',
                              hostName: otherDetails.name || 'Host',
                              startTime: new Date().toISOString(),
                              duration: 45,
                              agenda: 'Direct discussion and candidate evaluation via Zoom API.',
                            })}
                            className="btn btn-sm"
                            style={{ backgroundColor: '#0b5cff', color: '#ffffff', fontSize: '0.72rem', padding: '3px 8px', borderRadius: '6px' }}
                          >
                            Join Zoom Call
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} style={{
              padding: '12px 18px',
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
            }}>
              <input
                type="text"
                className="form-input"
                style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem' }}
                placeholder={`Message ${otherDetails.name}... (Press Enter to send)`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />

              <button
                type="submit"
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '8px' }}
              >
                <Send size={15} /> Send
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Embedded Zoom Meeting Modal if triggered from chat */}
      {selectedZoomMeeting && (
        <ZoomMeetingModal
          meeting={selectedZoomMeeting}
          onClose={() => setSelectedZoomMeeting(null)}
        />
      )}
    </div>
  );
}
