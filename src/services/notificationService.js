/**
 * Notification and Email Alert Service
 * Handles:
 * 1. In-app Push Notifications (Status changes, Interview reminders, Mentorship alerts)
 * 2. Instant Email Alert generation & simulation (with SMTP / SendGrid ready dispatch log)
 * 3. Browser Web Notifications API (when granted by user)
 * 4. LocalStorage persistence under `sih_store_notifications` & `sih_store_emails`
 */

const NOTIF_STORAGE_KEY = 'sih_store_notifications';
const EMAIL_STORAGE_KEY = 'sih_store_emails';

export const NOTIF_TYPES = {
  INTERVIEW: 'interview',
  SHORTLIST: 'shortlist',
  APPLICATION: 'application',
  MESSAGE: 'message',
  MENTORSHIP: 'mentorship',
  SYSTEM: 'system',
};

// Initial realistic seed notifications for the student Aarav Sharma (`student_1`)
const SEED_NOTIFICATIONS = [
  {
    id: 'notif_1',
    userId: 'student_1',
    title: '📹 Live Zoom Interview Scheduled',
    message: 'NexGen Cloud Solutions scheduled a Technical Interview for tomorrow at 3:00 PM IST.',
    type: NOTIF_TYPES.INTERVIEW,
    read: false,
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 mins ago
    link: '/student/applications',
    metadata: {
      meetingId: '849 2931 0482',
      passcode: 'SIH26',
      company: 'NexGen Cloud Solutions',
    },
  },
  {
    id: 'notif_2',
    userId: 'student_1',
    title: '🎉 Application Shortlisted!',
    message: 'Congratulations! Your profile has been shortlisted for Full-Stack Developer Internship.',
    type: NOTIF_TYPES.SHORTLIST,
    read: false,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    link: '/student/applications',
    metadata: {
      company: 'NexGen Cloud Solutions',
    },
  },
  {
    id: 'notif_3',
    userId: 'student_1',
    title: '💬 New Message from Mentor',
    message: 'Dr. Priya Srinivasan: "Reviewed your React constellation project. Ready for our Zoom call?"',
    type: NOTIF_TYPES.MESSAGE,
    read: true,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    link: '/student/learning',
  },
];

// Seed Emails dispatched to candidate
const SEED_EMAILS = [
  {
    id: 'email_1',
    to: 'aarav.sharma@college.edu.in',
    from: 'talent@techcorp-talent.com',
    senderName: 'NexGen Cloud Solutions Talent Acquisition',
    subject: 'Action Required: Invitation to Interview with NexGen Cloud Solutions (Zoom)',
    sentAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    status: 'Delivered',
    preview: 'Hi Aarav, We were impressed by your skill match score and verified React credentials...',
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; color: #1e293b; line-height: 1.6;">
        <h2 style="color: #0b5cff; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
          NexGen Cloud Solutions - Interview Invitation
        </h2>
        <p>Dear <strong>Aarav Sharma</strong>,</p>
        <p>
          Thank you for applying for the <strong>Full-Stack Developer Internship</strong> position.
          Our technical review committee has evaluated your academic credentials and verified skill assessment score (<strong>85% Compatibility Fit</strong>).
        </p>
        <div style="background-color: #f0f7ff; border-left: 4px solid #0b5cff; padding: 14px 16px; border-radius: 4px; margin: 18px 0;">
          <h4 style="margin: 0 0 8px 0; color: #0b5cff;">📅 Scheduled Zoom Video Interview Details</h4>
          <p style="margin: 4px 0;"><strong>Position:</strong> Full Stack React & Cloud Architecture</p>
          <p style="margin: 4px 0;"><strong>Meeting Platform:</strong> Zoom Video Communications</p>
          <p style="margin: 4px 0;"><strong>Meeting ID:</strong> <code style="font-size: 1.1em; color: #0b5cff;">849 2931 0482</code></p>
          <p style="margin: 4px 0;"><strong>Passcode:</strong> <code style="font-size: 1.1em; color: #059669;">SIH26</code></p>
          <p style="margin: 4px 0;"><strong>Direct Join Link:</strong> <a href="https://zoom.us/j/84929310482?pwd=U2lIMjYwNDRJbnRlcnZpZXc" target="_blank" style="color: #0b5cff;">https://zoom.us/j/84929310482</a></p>
        </div>
        <p>Please test your audio and webcam prior to the meeting. We look forward to speaking with you!</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 0.8rem; color: #64748b;">
          Skill Connect Portal (SIH 26044) Automated Candidate Dispatcher & Notification Hub.
        </p>
      </div>
    `,
  },
];

function getStoredNotifications() {
  const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
  if (!raw) {
    try {
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(SEED_NOTIFICATIONS));
    } catch (e) {}
    return SEED_NOTIFICATIONS;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return SEED_NOTIFICATIONS;
  }
}

function saveStoredNotifications(notifs) {
  try {
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(notifs));
  } catch (e) {
    console.warn('[NotificationService] Storage error:', e);
  }
}

function getStoredEmails() {
  const raw = localStorage.getItem(EMAIL_STORAGE_KEY);
  if (!raw) {
    try {
      localStorage.setItem(EMAIL_STORAGE_KEY, JSON.stringify(SEED_EMAILS));
    } catch (e) {}
    return SEED_EMAILS;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return SEED_EMAILS;
  }
}

function saveStoredEmails(emails) {
  try {
    localStorage.setItem(EMAIL_STORAGE_KEY, JSON.stringify(emails));
  } catch (e) {
    console.warn('[EmailService] Storage error:', e);
  }
}

/**
 * Retrieves all notifications for a specific user ID
 */
export function getNotifications(userId) {
  const all = getStoredNotifications();
  if (!userId) return all;
  return all.filter(n => n.userId === userId || n.userId === 'all');
}

/**
 * Returns count of unread notifications for badge display
 */
export function getUnreadCount(userId) {
  const list = getNotifications(userId);
  return list.filter(n => !n.read).length;
}

/**
 * Creates and dispatches a notification + simulated email alert
 */
export function sendNotification({
  userId,
  title,
  message,
  type = NOTIF_TYPES.SYSTEM,
  link = null,
  metadata = {},
  recipientEmail = null,
  sendEmail = true,
}) {
  const newNotif = {
    id: `notif_${Date.now()}`,
    userId,
    title,
    message,
    type,
    read: false,
    timestamp: new Date().toISOString(),
    link,
    metadata,
  };

  const allNotifs = getStoredNotifications();
  allNotifs.unshift(newNotif);
  saveStoredNotifications(allNotifs);

  // If email dispatch is requested, create an email outbox record
  if (sendEmail) {
    const targetEmail = recipientEmail || (userId === 'student_1' ? 'aarav.sharma@college.edu.in' : 'candidate@college.edu.in');
    const newEmail = {
      id: `email_${Date.now()}`,
      to: targetEmail,
      from: 'alerts@skillconnect-portal.gov.in',
      senderName: 'Skill Connect Platform & Talent Gateway',
      subject: `[Notification] ${title}`,
      sentAt: new Date().toISOString(),
      status: 'Delivered',
      preview: message,
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; color: #1e293b; line-height: 1.6;">
          <h2 style="color: #0b5cff; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
            Skill Connect Portal Alert
          </h2>
          <h3 style="color: #1e293b;">${title}</h3>
          <p>${message}</p>
          ${metadata?.meetingId ? `
            <div style="background-color: #f0f7ff; border-left: 4px solid #0b5cff; padding: 12px; margin: 16px 0;">
              <p style="margin: 4px 0;"><strong>Zoom Meeting ID:</strong> ${metadata.meetingId}</p>
              <p style="margin: 4px 0;"><strong>Passcode:</strong> ${metadata.passcode || 'SIH26'}</p>
            </div>
          ` : ''}
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 0.8rem; color: #64748b;">
            Sent automatically to ${targetEmail}. Manage alerts in your profile settings.
          </p>
        </div>
      `,
    };

    const allEmails = getStoredEmails();
    allEmails.unshift(newEmail);
    saveStoredEmails(allEmails);
  }

  // Trigger optional browser native notification if permitted
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, { body: message, icon: '/favicon.png' });
    } catch (e) {}
  }

  return newNotif;
}

/**
 * Mark a single notification as read
 */
export function markAsRead(notifId) {
  const allNotifs = getStoredNotifications();
  const target = allNotifs.find(n => n.id === notifId);
  if (target) {
    target.read = true;
    saveStoredNotifications(allNotifs);
  }
  return true;
}

/**
 * Mark all notifications as read for a user
 */
export function markAllAsRead(userId) {
  const allNotifs = getStoredNotifications();
  allNotifs.forEach(n => {
    if (n.userId === userId || n.userId === 'all') {
      n.read = true;
    }
  });
  saveStoredNotifications(allNotifs);
  return true;
}

/**
 * Clears all notifications for a user
 */
export function clearAllNotifications(userId) {
  let allNotifs = getStoredNotifications();
  allNotifs = allNotifs.filter(n => n.userId !== userId && n.userId !== 'all');
  saveStoredNotifications(allNotifs);
  return true;
}

/**
 * Retrieves all sent emails for preview in Email Alert Viewer modal
 */
export function getEmailOutbox(recipientEmail = null) {
  const all = getStoredEmails();
  if (!recipientEmail) return all;
  return all.filter(e => e.to.toLowerCase() === recipientEmail.toLowerCase());
}
