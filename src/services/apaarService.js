/**
 * APAAR ID (Automated Permanent Academic Account Registry) & Anti-Fraud Engine
 * Ministry of Education (Govt. of India) & NEP 2020 Compliance (SIH26044)
 * 
 * Provides:
 * 1. 12-digit Indian APAAR / Academic Bank of Credits (ABC) ID validation
 * 2. Simulated DigiLocker / ABC e-KYC OTP generation and verification
 * 3. Immutable APAAR Blacklist Registry for permanent banning of fraudulent candidates
 * 4. Dual persistence across Cloud Firestore and LocalStorage
 */

import { getLocalStore, setLocalStore, LS_KEYS as FIRESTORE_LS_KEYS } from './firestoreService';
import { db, isFirebaseConfigured } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

const LS_KEYS = {
  BANNED_APAARS: 'sih_banned_apaars',
  STUDENT_APAAR: 'sih_student_apaars',
  BAN_APPEALS: 'sih_ban_appeals',
};

// Default blacklisted records for testing/demonstration
const DEFAULT_BANNED_APAARS = [
  {
    apaarNumber: '999988887777',
    maskedApaar: 'XXXX-XXXX-7777',
    studentUid: 'banned_student_demo',
    studentName: 'Vikram Singh (Suspended)',
    banReason: 'Submitted forged NPTEL Deep Learning certificate with fabricated serial code.',
    bannedBy: 'Dr. Sunita Rao (Dean T&P)',
    bannedAt: '2026-08-15T10:30:00.000Z',
    immutableNotice: 'Permanent national academic blacklisting under Ministry of Education NEP 2020 Directive.',
  },
];

// Pre-seeded demo appeals so the authority review desk is immediately demonstratable
const DEFAULT_BAN_APPEALS = [
  {
    appealId: 'appeal_demo_1',
    studentUid: 'banned_student_demo',
    studentName: 'Vikram Singh',
    studentEmail: 'vikram.singh@student.edu',
    apaarNumber: '999988887777',
    maskedApaar: 'XXXX-XXXX-7777',
    banReason: 'Submitted forged NPTEL Deep Learning certificate with fabricated serial code.',
    justificationText: 'Respected Authority, I apologize for the confusion. During scan upload, the serial number had a typo (NPTEL24CS01 instead of NPTEL24CS10). Attached is my original direct NPTEL verification URL and professor letter.',
    proofUrl: 'https://nptel.ac.in/noc/Ecertificate/?q=NPTEL24CS10S12345',
    status: 'pending', // 'pending' | 'approved' | 'rejected'
    submittedAt: '2026-08-16T11:00:00.000Z',
    adjudicatedAt: null,
    adjudicatedBy: null,
    adjudicationRemarks: null,
  },
];

// Pre-seeded verified APAAR for demo students
const DEFAULT_STUDENT_APAARS = {
  student_1: {
    verified: false, // Starts unverified so users can test the verification gate live!
    apaarNumber: '548923109821',
    maskedApaar: 'XXXX-XXXX-9821',
    phone: '+91 98765 43210',
    verifiedAt: null,
  },
  student_2: {
    verified: true,
    apaarNumber: '761234901845',
    maskedApaar: 'XXXX-XXXX-1845',
    phone: '+91 98111 22334',
    verifiedAt: '2026-08-20T14:15:00.000Z',
  },
  student_3: {
    verified: true,
    apaarNumber: '349018239044',
    maskedApaar: 'XXXX-XXXX-9044',
    phone: '+91 99222 33445',
    verifiedAt: '2026-08-22T09:00:00.000Z',
  },
};

/**
 * Format raw 12-digit number as XXXX XXXX XXXX
 */
export function formatApaar(val) {
  if (!val) return '';
  const digits = String(val).replace(/\D/g, '').slice(0, 12);
  const parts = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(' ');
}

/**
 * Mask APAAR number as XXXX-XXXX-1234
 */
export function maskApaar(val) {
  if (!val) return '';
  const clean = String(val).replace(/\D/g, '');
  if (clean.length < 4) return 'XXXX-XXXX-XXXX';
  const last4 = clean.slice(-4);
  return `XXXX-XXXX-${last4}`;
}

/**
 * Validate 12-digit APAAR format
 */
export function validateApaarFormat(val) {
  if (!val) return { valid: false, error: '12-digit APAAR ID is required.' };
  const digits = String(val).replace(/\s/g, '').replace(/\D/g, '');
  
  if (digits.length !== 12) {
    return { valid: false, error: 'APAAR ID must be exactly 12 numeric digits.' };
  }

  if (digits[0] === '0' || digits[0] === '1') {
    return { valid: false, error: 'Valid APAAR ID cannot begin with 0 or 1.' };
  }

  if (/^(\d)\1{11}$/.test(digits)) {
    return { valid: false, error: 'Invalid APAAR ID: Repeated digit sequence detected.' };
  }

  return { valid: true, digits };
}

/**
 * Check if an APAAR ID is permanently blacklisted
 */
export function isApaarBanned(rawApaar) {
  if (!rawApaar) return null;
  const clean = String(rawApaar).replace(/\D/g, '');
  const last4 = clean.slice(-4);
  
  const bannedList = getLocalStore(LS_KEYS.BANNED_APAARS, DEFAULT_BANNED_APAARS);
  
  return bannedList.find(b => {
    const bClean = String(b.apaarNumber).replace(/\D/g, '');
    return bClean === clean || (b.maskedApaar && b.maskedApaar.endsWith(last4));
  }) || null;
}

/**
 * Retrieve all banned APAAR records
 */
export function getAllBannedApaars() {
  return getLocalStore(LS_KEYS.BANNED_APAARS, DEFAULT_BANNED_APAARS);
}

/**
 * Get student's current APAAR verification record
 */
export function getStudentApaarRecord(studentUid) {
  if (!studentUid) return null;
  const store = getLocalStore(LS_KEYS.STUDENT_APAAR, DEFAULT_STUDENT_APAARS);
  return store[studentUid] || {
    verified: false,
    apaarNumber: '',
    maskedApaar: '',
    phone: '',
    verifiedAt: null,
  };
}

/**
 * Request simulated DigiLocker / ABC OTP
 */
export function sendApaarOTP(rawApaar) {
  const check = validateApaarFormat(rawApaar);
  if (!check.valid) {
    return { success: false, error: check.error };
  }

  // Check if blacklisted
  const banned = isApaarBanned(check.digits);
  if (banned) {
    return {
      success: false,
      isBanned: true,
      error: `🚫 APAAR ID PERMANENTLY BLACKLISTED: This APAAR ID (${banned.maskedApaar}) was banned for: "${banned.banReason}". As APAAR ID is an immutable lifetime academic identifier, re-registration is prohibited.`,
      banDetails: banned,
    };
  }

  const simulatedOTP = '260044';
  const cleanPhone = `+91 ${check.digits.slice(0, 2)}*** ***${check.digits.slice(-2)}`;

  return {
    success: true,
    maskedApaar: maskApaar(check.digits),
    apaarDigits: check.digits,
    linkedPhone: cleanPhone,
    demoOtp: simulatedOTP,
    expiresInSeconds: 120,
  };
}

/**
 * Complete OTP verification and persist verified APAAR ID
 */
export async function verifyApaarOTP(studentUid, apaarDigits, enteredOtp, expectedOtp = '260044') {
  if (!studentUid) return { success: false, error: 'User session not found.' };

  if (enteredOtp !== expectedOtp && enteredOtp !== '260044' && enteredOtp !== '123456') {
    return { success: false, error: 'Invalid OTP entered. Please use demo OTP: 260044.' };
  }

  const banned = isApaarBanned(apaarDigits);
  if (banned) {
    return {
      success: false,
      isBanned: true,
      error: `🚫 APAAR ID PERMANENTLY BLACKLISTED: ${banned.banReason}`,
    };
  }

  const masked = maskApaar(apaarDigits);
  const record = {
    verified: true,
    apaarNumber: apaarDigits,
    maskedApaar: masked,
    verifiedAt: new Date().toISOString(),
    verificationAuthority: 'DigiLocker / Academic Bank of Credits (Ministry of Education, GoI)',
  };

  // 1. Update APAAR store
  const store = getLocalStore(LS_KEYS.STUDENT_APAAR, DEFAULT_STUDENT_APAARS);
  store[studentUid] = record;
  setLocalStore(LS_KEYS.STUDENT_APAAR, store);

  // 2. Update Student Profile in localStorage & Firestore
  try {
    const studentsStore = getLocalStore(FIRESTORE_LS_KEYS.STUDENTS, []);
    const idx = studentsStore.findIndex(s => s.uid === studentUid);
    if (idx >= 0) {
      studentsStore[idx] = {
        ...studentsStore[idx],
        apaarVerified: true,
        maskedApaar: masked,
        apaarVerifiedAt: record.verifiedAt,
      };
      setLocalStore(FIRESTORE_LS_KEYS.STUDENTS, studentsStore);
    }

    // Update active session user if matching
    const activeUser = localStorage.getItem('sih_portal_user');
    if (activeUser) {
      const parsed = JSON.parse(activeUser);
      if (parsed.uid === studentUid) {
        localStorage.setItem(
          'sih_portal_user',
          JSON.stringify({ ...parsed, apaarVerified: true, maskedApaar: masked })
        );
      }
    }

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'students', studentUid), {
        apaarVerified: true,
        maskedApaar: masked,
        apaarVerifiedAt: record.verifiedAt,
      }, { merge: true });
    }
  } catch (err) {
    console.warn('[ApaarService] Error updating profile storage:', err);
  }

  return {
    success: true,
    maskedApaar: masked,
    record,
  };
}

/**
 * Permanently ban a student and blacklist their APAAR ID
 */
export async function banStudentByApaar(studentUid, reason, bannedBy = 'Academician / Faculty') {
  if (!studentUid) return { success: false, error: 'Student UID required.' };

  const apaarStore = getLocalStore(LS_KEYS.STUDENT_APAAR, DEFAULT_STUDENT_APAARS);
  const studentApaar = apaarStore[studentUid] || {
    apaarNumber: '548923109821',
    maskedApaar: 'XXXX-XXXX-9821',
  };

  const banRecord = {
    apaarNumber: studentApaar.apaarNumber,
    maskedApaar: studentApaar.maskedApaar || maskApaar(studentApaar.apaarNumber),
    studentUid,
    banReason: reason || 'Submitted fraudulent skill certificates and fabricated academic credentials.',
    bannedBy,
    bannedAt: new Date().toISOString(),
    immutableNotice: 'Permanent national academic blacklisting under Ministry of Education NEP 2020 Directive.',
  };

  // 1. Add to permanent blacklist registry
  const bannedList = getLocalStore(LS_KEYS.BANNED_APAARS, DEFAULT_BANNED_APAARS);
  const existingIdx = bannedList.findIndex(b => b.apaarNumber === banRecord.apaarNumber || b.studentUid === studentUid);
  if (existingIdx >= 0) {
    bannedList[existingIdx] = banRecord;
  } else {
    bannedList.push(banRecord);
  }
  setLocalStore(LS_KEYS.BANNED_APAARS, bannedList);

  // 2. Mark student as banned in students store
  const studentsStore = getLocalStore(FIRESTORE_LS_KEYS.STUDENTS, []);
  const studentIdx = studentsStore.findIndex(s => s.uid === studentUid);
  if (studentIdx >= 0) {
    studentsStore[studentIdx] = {
      ...studentsStore[studentIdx],
      banned: true,
      banReason: banRecord.banReason,
      bannedAt: banRecord.bannedAt,
    };
    setLocalStore(FIRESTORE_LS_KEYS.STUDENTS, studentsStore);
  }

  // 3. Mark user in users store
  const usersStore = getLocalStore(FIRESTORE_LS_KEYS.USERS, []);
  const userIdx = usersStore.findIndex(u => u.uid === studentUid);
  if (userIdx >= 0) {
    usersStore[userIdx] = {
      ...usersStore[userIdx],
      banned: true,
      banReason: banRecord.banReason,
      bannedAt: banRecord.bannedAt,
    };
    setLocalStore(FIRESTORE_LS_KEYS.USERS, usersStore);
  }

  // 4. Update active user in localStorage if matching
  try {
    const activeUser = localStorage.getItem('sih_portal_user');
    if (activeUser) {
      const parsed = JSON.parse(activeUser);
      if (parsed.uid === studentUid) {
        localStorage.setItem(
          'sih_portal_user',
          JSON.stringify({ ...parsed, banned: true, banReason: banRecord.banReason, bannedAt: banRecord.bannedAt })
        );
      }
    }
  } catch (e) {}

  // 5. Cloud Firestore persistence
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'banned_apaars', banRecord.apaarNumber), banRecord);
      await setDoc(doc(db, 'students', studentUid), {
        banned: true,
        banReason: banRecord.banReason,
        bannedAt: banRecord.bannedAt,
      }, { merge: true });
    } catch (err) {
      console.warn('[ApaarService] Firestore ban persistence error:', err);
    }
  }

  return {
    success: true,
    banRecord,
  };
}

/**
 * Submit an appeal / justification against an APAAR ban
 */
export async function submitBanAppeal({ studentUid, studentName, studentEmail, justificationText, proofUrl }) {
  if (!studentUid || !justificationText?.trim()) {
    return { success: false, error: 'Detailed justification statement is required.' };
  }

  const apaarStore = getLocalStore(LS_KEYS.STUDENT_APAAR, DEFAULT_STUDENT_APAARS);
  const studentApaar = apaarStore[studentUid] || {
    apaarNumber: '548923109821',
    maskedApaar: 'XXXX-XXXX-9821',
  };

  const bannedList = getLocalStore(LS_KEYS.BANNED_APAARS, DEFAULT_BANNED_APAARS);
  const banRecord = bannedList.find(b => b.studentUid === studentUid || b.apaarNumber === studentApaar.apaarNumber);

  const appeals = getLocalStore(LS_KEYS.BAN_APPEALS, DEFAULT_BAN_APPEALS);
  const existingIdx = appeals.findIndex(a => a.studentUid === studentUid && a.status === 'pending');

  const newAppeal = {
    appealId: existingIdx >= 0 ? appeals[existingIdx].appealId : `appeal_${Date.now()}`,
    studentUid,
    studentName: studentName || 'Student Candidate',
    studentEmail: studentEmail || 'student@university.edu',
    apaarNumber: studentApaar.apaarNumber,
    maskedApaar: studentApaar.maskedApaar || maskApaar(studentApaar.apaarNumber),
    banReason: banRecord?.banReason || 'Academic credential violation',
    bannedBy: banRecord?.bannedBy || 'Academic Committee',
    bannedAt: banRecord?.bannedAt || new Date().toISOString(),
    justificationText: justificationText.trim(),
    proofUrl: proofUrl?.trim() || '',
    status: 'pending', // pending, approved, rejected
    submittedAt: new Date().toISOString(),
    adjudicatedAt: null,
    adjudicatedBy: null,
    adjudicationRemarks: null,
  };

  if (existingIdx >= 0) {
    appeals[existingIdx] = newAppeal;
  } else {
    appeals.unshift(newAppeal);
  }

  setLocalStore(LS_KEYS.BAN_APPEALS, appeals);

  // Firestore sync if online
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'ban_appeals', newAppeal.appealId), newAppeal);
    } catch (err) {
      console.warn('[ApaarService] Appeal firestore write warning:', err);
    }
  }

  return { success: true, appeal: newAppeal };
}

/**
 * Get active appeal for a specific student
 */
export function getStudentAppeal(studentUid) {
  if (!studentUid) return null;
  const appeals = getLocalStore(LS_KEYS.BAN_APPEALS, DEFAULT_BAN_APPEALS);
  return appeals.find(a => a.studentUid === studentUid) || null;
}

/**
 * Retrieve all ban appeals for authority dashboard
 */
export function getAllBanAppeals() {
  return getLocalStore(LS_KEYS.BAN_APPEALS, DEFAULT_BAN_APPEALS);
}

/**
 * Authority Adjudication of Appeal:
 * - decision: 'approved' (Student justified their case -> Ban Revoked)
 * - decision: 'rejected' (Fraud confirmed -> Permanent Ban Upheld)
 */
export async function adjudicateBanAppeal(appealId, decision, remarks, authorityName = 'Dean & Academic Discipline Committee') {
  const appeals = getLocalStore(LS_KEYS.BAN_APPEALS, DEFAULT_BAN_APPEALS);
  const appealIdx = appeals.findIndex(a => a.appealId === appealId);
  if (appealIdx < 0) return { success: false, error: 'Appeal record not found.' };

  const targetAppeal = appeals[appealIdx];
  const isApproved = decision === 'approved';
  const isInfoRequested = decision === 'info_requested';

  targetAppeal.status = isApproved ? 'approved' : isInfoRequested ? 'info_requested' : 'rejected';
  targetAppeal.adjudicatedAt = new Date().toISOString();
  targetAppeal.adjudicatedBy = authorityName;
  targetAppeal.adjudicationRemarks = remarks || (
    isApproved
      ? 'Justification verified and accepted by Academic Committee. Ban revoked.'
      : isInfoRequested
      ? 'Additional supporting documentation / original grade card verification requested from candidate.'
      : 'Justification rejected. Counterfeit credentials upheld.'
  );

  appeals[appealIdx] = targetAppeal;
  setLocalStore(LS_KEYS.BAN_APPEALS, appeals);

  // If approved: Revoke Ban & Unblacklist
  if (isApproved) {
    // 1. Remove from banned APAAR list
    const bannedList = getLocalStore(LS_KEYS.BANNED_APAARS, DEFAULT_BANNED_APAARS);
    const filteredBanned = bannedList.filter(b => b.studentUid !== targetAppeal.studentUid && b.apaarNumber !== targetAppeal.apaarNumber);
    setLocalStore(LS_KEYS.BANNED_APAARS, filteredBanned);

    // 2. Unban in students store
    const studentsStore = getLocalStore(FIRESTORE_LS_KEYS.STUDENTS, []);
    const sIdx = studentsStore.findIndex(s => s.uid === targetAppeal.studentUid);
    if (sIdx >= 0) {
      studentsStore[sIdx] = {
        ...studentsStore[sIdx],
        banned: false,
        banReason: null,
        bannedAt: null,
        reinstatedAt: targetAppeal.adjudicatedAt,
        reinstatedBy: authorityName,
      };
      setLocalStore(FIRESTORE_LS_KEYS.STUDENTS, studentsStore);
    }

    // 3. Unban in users store
    const usersStore = getLocalStore(FIRESTORE_LS_KEYS.USERS, []);
    const uIdx = usersStore.findIndex(u => u.uid === targetAppeal.studentUid);
    if (uIdx >= 0) {
      usersStore[uIdx] = {
        ...usersStore[uIdx],
        banned: false,
        banReason: null,
        bannedAt: null,
      };
      setLocalStore(FIRESTORE_LS_KEYS.USERS, usersStore);
    }

    // 4. Update active user session if matching
    try {
      const activeUser = localStorage.getItem('sih_portal_user');
      if (activeUser) {
        const parsed = JSON.parse(activeUser);
        if (parsed.uid === targetAppeal.studentUid) {
          localStorage.setItem(
            'sih_portal_user',
            JSON.stringify({ ...parsed, banned: false, banReason: null, bannedAt: null })
          );
        }
      }
    } catch (e) {}

    // 5. Firestore sync
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'students', targetAppeal.studentUid), {
          banned: false,
          banReason: null,
          bannedAt: null,
          reinstatedAt: targetAppeal.adjudicatedAt,
          reinstatedBy: authorityName,
        }, { merge: true });
      } catch (e) {}
    }
  }

  // Firestore sync appeal update
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'ban_appeals', appealId), targetAppeal, { merge: true });
    } catch (e) {}
  }

  return {
    success: true,
    decision,
    appeal: targetAppeal,
  };
}

// Backward compatibility alias exports
export const formatAadhaar = formatApaar;
export const maskAadhaar = maskApaar;
export const validateAadhaarFormat = validateApaarFormat;
export const isAadhaarBanned = isApaarBanned;
export const getAllBannedAadhaars = getAllBannedApaars;
export const getStudentAadhaarRecord = getStudentApaarRecord;
export const sendAadhaarOTP = sendApaarOTP;
export const verifyAadhaarOTP = verifyApaarOTP;
export const banStudentByAadhaar = banStudentByApaar;
