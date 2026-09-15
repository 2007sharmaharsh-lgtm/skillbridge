/**
 * Real-Time Chat & Mentorship Messaging Service
 * Manages 1-on-1 conversations between Students, Recruiters, and Mentors
 * Persists in localStorage under `sih_store_chat_conversations` and `sih_store_chat_messages`
 */

const CONVERSATIONS_KEY = 'sih_store_chat_conversations';
const MESSAGES_KEY = 'sih_store_chat_messages';

const SEED_CONVERSATIONS = [
  {
    id: 'conv_1',
    participants: ['student_1', 'recruiter_1'],
    participantDetails: {
      student_1: { name: 'Aarav Sharma', role: 'student', photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
      recruiter_1: { name: 'Vikram Malhotra', role: 'recruiter', title: 'NexGen Cloud Solutions', photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
    },
    title: 'Full-Stack Developer Internship Interview',
    lastMessage: 'Looking forward to our Zoom session tomorrow at 3:00 PM. Have your React project ready!',
    lastMessageTime: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    unreadCount: { student_1: 1, recruiter_1: 0 },
  },
  {
    id: 'conv_2',
    participants: ['student_1', 'mentor_google'],
    participantDetails: {
      student_1: { name: 'Aarav Sharma', role: 'student', photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
      mentor_google: { name: 'Dr. Priya Srinivasan', role: 'mentor', title: 'Staff AI Scientist @ Google', photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    },
    title: 'AI & Machine Learning Mentorship Session',
    lastMessage: 'I reviewed your skill quiz score. Your mathematical foundations are solid.',
    lastMessageTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    unreadCount: { student_1: 0, mentor_google: 0 },
  },
];

const SEED_MESSAGES = {
  conv_1: [
    {
      id: 'm1',
      conversationId: 'conv_1',
      senderId: 'recruiter_1',
      senderName: 'Vikram Malhotra',
      text: 'Hi Aarav! We reviewed your digital portfolio and skill assessment test. Great work on the React state architecture!',
      timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    },
    {
      id: 'm2',
      conversationId: 'conv_1',
      senderId: 'student_1',
      senderName: 'Aarav Sharma',
      text: 'Thank you Mr. Malhotra! I am very interested in the Cloud solutions role at NexGen.',
      timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    },
    {
      id: 'm3',
      conversationId: 'conv_1',
      senderId: 'recruiter_1',
      senderName: 'Vikram Malhotra',
      text: 'We have scheduled your technical round on Zoom. Looking forward to our Zoom session tomorrow at 3:00 PM. Have your React project ready!',
      zoomLink: 'https://zoom.us/j/84929310482?pwd=U2lIMjYwNDRJbnRlcnZpZXc',
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    },
  ],
  conv_2: [
    {
      id: 'm4',
      conversationId: 'conv_2',
      senderId: 'mentor_google',
      senderName: 'Dr. Priya Srinivasan',
      text: 'Hello Aarav, welcome to the Google AI Mentorship Hub!',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'm5',
      conversationId: 'conv_2',
      senderId: 'mentor_google',
      senderName: 'Dr. Priya Srinivasan',
      text: 'I reviewed your skill quiz score. Your mathematical foundations are solid.',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

function getStoredConversations() {
  const raw = localStorage.getItem(CONVERSATIONS_KEY);
  if (!raw) {
    try {
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(SEED_CONVERSATIONS));
    } catch (e) {}
    return SEED_CONVERSATIONS;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return SEED_CONVERSATIONS;
  }
}

function saveStoredConversations(convs) {
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(convs));
  } catch (e) {
    console.warn('[ChatService] Storage error:', e);
  }
}

function getStoredMessages() {
  const raw = localStorage.getItem(MESSAGES_KEY);
  if (!raw) {
    try {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(SEED_MESSAGES));
    } catch (e) {}
    return SEED_MESSAGES;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return SEED_MESSAGES;
  }
}

function saveStoredMessages(messages) {
  try {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  } catch (e) {
    console.warn('[ChatService] Storage error:', e);
  }
}

export function getUserConversations(userId) {
  const convs = getStoredConversations();
  if (!userId) return convs;
  return convs.filter(c => c.participants.includes(userId));
}

export function getConversationMessages(conversationId) {
  const allMessages = getStoredMessages();
  return allMessages[conversationId] || [];
}

export function sendMessage({
  conversationId,
  senderId,
  senderName,
  text,
  zoomLink = null,
}) {
  const newMsg = {
    id: `msg_${Date.now()}`,
    conversationId,
    senderId,
    senderName,
    text,
    zoomLink,
    timestamp: new Date().toISOString(),
  };

  // Append message
  const allMessages = getStoredMessages();
  if (!allMessages[conversationId]) {
    allMessages[conversationId] = [];
  }
  allMessages[conversationId].push(newMsg);
  saveStoredMessages(allMessages);

  // Update conversation last message
  const allConvs = getStoredConversations();
  const convIndex = allConvs.findIndex(c => c.id === conversationId);
  if (convIndex >= 0) {
    allConvs[convIndex].lastMessage = text;
    allConvs[convIndex].lastMessageTime = newMsg.timestamp;
    // Set unread count for other participants
    allConvs[convIndex].participants.forEach(pId => {
      if (pId !== senderId) {
        if (!allConvs[convIndex].unreadCount) allConvs[convIndex].unreadCount = {};
        allConvs[convIndex].unreadCount[pId] = (allConvs[convIndex].unreadCount[pId] || 0) + 1;
      }
    });
    saveStoredConversations(allConvs);
  }

  // Autonomous smart reply simulation (1.2 seconds later)
  if (senderId === 'student_1') {
    setTimeout(() => {
      simulateReply(conversationId, allConvs[convIndex]);
    }, 1200);
  }

  return newMsg;
}

function simulateReply(conversationId, conv) {
  if (!conv) return;
  const otherParticipantId = conv.participants.find(p => p !== 'student_1');
  const details = conv.participantDetails?.[otherParticipantId] || { name: 'Support', role: 'mentor' };

  const replies = [
    `Thanks for the update, Aarav! I have noted your points. Let us discuss this further in our upcoming session.`,
    `Sounds great! Make sure to review the system design notes we shared. See you on Zoom!`,
    `Got it! I will have the assessment rubric ready for you.`,
  ];
  const replyText = replies[Math.floor(Math.random() * replies.length)];

  const replyMsg = {
    id: `msg_${Date.now()}`,
    conversationId,
    senderId: otherParticipantId,
    senderName: details.name,
    text: replyText,
    timestamp: new Date().toISOString(),
  };

  const allMessages = getStoredMessages();
  if (!allMessages[conversationId]) allMessages[conversationId] = [];
  allMessages[conversationId].push(replyMsg);
  saveStoredMessages(allMessages);

  const allConvs = getStoredConversations();
  const idx = allConvs.findIndex(c => c.id === conversationId);
  if (idx >= 0) {
    allConvs[idx].lastMessage = replyText;
    allConvs[idx].lastMessageTime = replyMsg.timestamp;
    if (!allConvs[idx].unreadCount) allConvs[idx].unreadCount = {};
    allConvs[idx].unreadCount['student_1'] = (allConvs[idx].unreadCount['student_1'] || 0) + 1;
    saveStoredConversations(allConvs);
  }
}

export function markConversationAsRead(conversationId, userId) {
  const allConvs = getStoredConversations();
  const conv = allConvs.find(c => c.id === conversationId);
  if (conv && conv.unreadCount && conv.unreadCount[userId]) {
    conv.unreadCount[userId] = 0;
    saveStoredConversations(allConvs);
  }
}

export function createOrGetConversation({
  currentUserId,
  currentUserName,
  targetUserId,
  targetUserName,
  targetTitle,
  contextTitle = 'General Discussion',
}) {
  const convs = getStoredConversations();
  const existing = convs.find(c =>
    c.participants.includes(currentUserId) && c.participants.includes(targetUserId)
  );
  if (existing) return existing;

  const newConv = {
    id: `conv_${Date.now()}`,
    participants: [currentUserId, targetUserId],
    participantDetails: {
      [currentUserId]: { name: currentUserName || 'User' },
      [targetUserId]: { name: targetUserName || 'Contact', title: targetTitle || '' },
    },
    title: contextTitle,
    lastMessage: 'Conversation started',
    lastMessageTime: new Date().toISOString(),
    unreadCount: { [currentUserId]: 0, [targetUserId]: 0 },
  };

  convs.unshift(newConv);
  saveStoredConversations(convs);
  return newConv;
}

export function getTotalUnreadChatCount(userId) {
  const convs = getUserConversations(userId);
  return convs.reduce((acc, curr) => acc + (curr.unreadCount?.[userId] || 0), 0);
}
