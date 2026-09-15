import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import {
  MOCK_USERS,
  MOCK_STUDENTS,
  MOCK_RECRUITERS,
  MOCK_INSTITUTIONS,
  MOCK_OPPORTUNITIES,
  MOCK_APPLICATIONS,
  MOCK_SAVED,
} from './mockData';

// Local store keys for fallback persistence
export const LS_KEYS = {
  USERS: 'sih_store_users',
  STUDENTS: 'sih_store_students',
  RECRUITERS: 'sih_store_recruiters',
  INSTITUTIONS: 'sih_store_institutions',
  OPPORTUNITIES: 'sih_store_opportunities',
  APPLICATIONS: 'sih_store_applications',
  SAVED: 'sih_store_saved',
  ENROLLMENTS: 'sih_store_enrollments',
  CERTIFICATES: 'sih_store_certificates',
  CURRICULUM: 'sih_store_curriculum',
};

export function getLocalStore(key, initial) {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(initial) && Array.isArray(parsed) && initial.length > 0) {
      const idKey = initial[0].id ? 'id' : initial[0].uid ? 'uid' : null;
      if (idKey) {
        let updated = false;
        for (const item of initial) {
          if (!parsed.some(p => p[idKey] === item[idKey])) {
            parsed.push(item);
            updated = true;
          }
        }
        if (updated) {
          localStorage.setItem(key, JSON.stringify(parsed));
        }
      }
    }
    return parsed;
  } catch (e) {
    return initial;
  }
}

export function setLocalStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[LocalStore] Quota exceeded or error saving "${key}":`, e);
  }
}

// -------------------------------------------------------------
// USER & ROLE SERVICES
// -------------------------------------------------------------

export async function getUserProfile(uid) {
  if (isFirebaseConfigured && db) {
    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      return snap.exists() ? snap.data() : null;
    } catch (e) {
      console.warn('[Firestore] getUserProfile error:', e);
    }
  }
  const users = getLocalStore(LS_KEYS.USERS, MOCK_USERS);
  return users.find(u => u.uid === uid) || null;
}

export async function createUserProfile(user) {
  const payload = {
    ...user,
    createdAt: user.createdAt || new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'users', user.uid), payload, { merge: true });
    } catch (e) {
      console.warn('[Firestore] createUserProfile error:', e);
    }
  }

  // Update local fallback
  const users = getLocalStore(LS_KEYS.USERS, MOCK_USERS);
  const idx = users.findIndex(u => u.uid === user.uid);
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...payload };
  } else {
    users.push(payload);
  }
  setLocalStore(LS_KEYS.USERS, users);
  return payload;
}

// -------------------------------------------------------------
// STUDENT PROFILE & SKILLS SERVICES
// -------------------------------------------------------------

export async function getStudentProfile(uid) {
  let studentData = null;
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'students', uid));
      if (snap.exists()) studentData = snap.data();
    } catch (e) {
      console.warn('[Firestore] getStudentProfile error:', e);
    }
  }

  if (!studentData) {
    const students = getLocalStore(LS_KEYS.STUDENTS, MOCK_STUDENTS);
    studentData = students.find(s => s.uid === uid) || {
      uid,
      collegeName: '',
      university: '',
      degree: 'B.Tech',
      branch: 'Computer Science & Engineering',
      graduationYear: '2025',
      location: '',
      skills: [],
      resumeURL: '',
      about: '',
    };
  }

  // Cross-reference with users collection for name & photoURL
  const users = getLocalStore(LS_KEYS.USERS, MOCK_USERS);
  const matchedUser = users.find(u => u.uid === uid);

  return {
    ...studentData,
    name: studentData.name || matchedUser?.name || '',
    email: studentData.email || matchedUser?.email || '',
    photoURL: studentData.photoURL || matchedUser?.photoURL || '',
  };
}

export async function updateStudentProfile(uid, data) {
  const payload = { ...data, uid };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'students', uid), payload, { merge: true });
    } catch (e) {
      console.warn('[Firestore] updateStudentProfile error:', e);
    }
  }

  const students = getLocalStore(LS_KEYS.STUDENTS, MOCK_STUDENTS);
  const idx = students.findIndex(s => s.uid === uid);
  if (idx >= 0) {
    students[idx] = { ...students[idx], ...payload };
  } else {
    students.push(payload);
  }
  setLocalStore(LS_KEYS.STUDENTS, students);

  // Sync user profile if name, email, or photoURL are provided
  if (payload.name !== undefined || payload.photoURL !== undefined || payload.email !== undefined) {
    const userUpdate = { uid };
    if (payload.name !== undefined) userUpdate.name = payload.name;
    if (payload.photoURL !== undefined) userUpdate.photoURL = payload.photoURL;
    if (payload.email !== undefined) userUpdate.email = payload.email;
    await createUserProfile(userUpdate);

    // Also sync sih_portal_user in localStorage so immediate auth re-render has the new data
    try {
      const activeUser = localStorage.getItem('sih_portal_user');
      if (activeUser) {
        const parsed = JSON.parse(activeUser);
        if (parsed.uid === uid) {
          localStorage.setItem('sih_portal_user', JSON.stringify({ ...parsed, ...userUpdate }));
        }
      }
    } catch (e) {}
  }

  return payload;
}

export async function getAllStudents() {
  let rawStudents = [];
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'students'));
      rawStudents = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('[Firestore] getAllStudents error:', e);
    }
  }
  if (!rawStudents.length) {
    rawStudents = getLocalStore(LS_KEYS.STUDENTS, MOCK_STUDENTS);
  }

  const users = getLocalStore(LS_KEYS.USERS, MOCK_USERS);
  return rawStudents.map(student => {
    const matchedUser = users.find(u => u.uid === student.uid || u.uid === student.id);
    return {
      ...student,
      name: student.name || matchedUser?.name || 'Candidate',
      email: student.email || matchedUser?.email || '',
      photoURL: student.photoURL || matchedUser?.photoURL || '',
    };
  });
}

// -------------------------------------------------------------
// RECRUITER & COMPANY PROFILE SERVICES
// -------------------------------------------------------------

export async function getRecruiterProfile(uid) {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'recruiters', uid));
      if (snap.exists()) return snap.data();
    } catch (e) {
      console.warn('[Firestore] getRecruiterProfile error:', e);
    }
  }
  const recruiters = getLocalStore(LS_KEYS.RECRUITERS, MOCK_RECRUITERS);
  return recruiters.find(r => r.uid === uid) || {
    uid,
    companyName: 'My Company',
    industry: 'Software / IT',
    description: '',
    website: '',
    location: '',
    logoURL: '',
  };
}

export async function updateRecruiterProfile(uid, data) {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'recruiters', uid), data, { merge: true });
    } catch (e) {
      console.warn('[Firestore] updateRecruiterProfile error:', e);
    }
  }
  const recruiters = getLocalStore(LS_KEYS.RECRUITERS, MOCK_RECRUITERS);
  const idx = recruiters.findIndex(r => r.uid === uid);
  if (idx >= 0) {
    recruiters[idx] = { ...recruiters[idx], ...data };
  } else {
    recruiters.push({ uid, ...data });
  }
  setLocalStore(LS_KEYS.RECRUITERS, recruiters);
  return data;
}

// -------------------------------------------------------------
// INSTITUTION PROFILE SERVICES
// -------------------------------------------------------------

export async function getInstitutionProfile(uid) {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'institutions', uid));
      if (snap.exists()) return snap.data();
    } catch (e) {
      console.warn('[Firestore] getInstitutionProfile error:', e);
    }
  }
  const institutions = getLocalStore(LS_KEYS.INSTITUTIONS, MOCK_INSTITUTIONS);
  return institutions.find(i => i.uid === uid) || {
    uid,
    institutionName: 'National Institute of Technology',
    university: 'Institute of National Importance',
    location: 'Delhi',
    website: 'https://example.ac.in',
  };
}

export async function updateInstitutionProfile(uid, data) {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'institutions', uid), data, { merge: true });
    } catch (e) {
      console.warn('[Firestore] updateInstitutionProfile error:', e);
    }
  }
  const institutions = getLocalStore(LS_KEYS.INSTITUTIONS, MOCK_INSTITUTIONS);
  const idx = institutions.findIndex(i => i.uid === uid);
  if (idx >= 0) {
    institutions[idx] = { ...institutions[idx], ...data };
  } else {
    institutions.push({ uid, ...data });
  }
  setLocalStore(LS_KEYS.INSTITUTIONS, institutions);
  return data;
}

// -------------------------------------------------------------
// OPPORTUNITIES (JOBS & INTERNSHIPS) SERVICES
// -------------------------------------------------------------

export async function getOpportunities(filters = {}) {
  if (isFirebaseConfigured && db) {
    try {
      let q = collection(db, 'opportunities');
      if (filters.recruiterId) {
        q = query(q, where('recruiterId', '==', filters.recruiterId));
      }
      const snap = await getDocs(q);
      let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return list;
    } catch (e) {
      console.warn('[Firestore] getOpportunities error:', e);
    }
  }
  let opportunities = getLocalStore(LS_KEYS.OPPORTUNITIES, MOCK_OPPORTUNITIES);
  if (filters.recruiterId) {
    opportunities = opportunities.filter(o => o.recruiterId === filters.recruiterId);
  }
  if (filters.type && filters.type !== 'all') {
    opportunities = opportunities.filter(o => o.type.toLowerCase() === filters.type.toLowerCase());
  }
  return opportunities;
}

export async function getOpportunityById(id) {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'opportunities', id));
      if (snap.exists()) return { id: snap.id, ...snap.data() };
    } catch (e) {
      console.warn('[Firestore] getOpportunityById error:', e);
    }
  }
  const list = getLocalStore(LS_KEYS.OPPORTUNITIES, MOCK_OPPORTUNITIES);
  return list.find(o => o.id === id) || null;
}

export async function createOpportunity(data) {
  const payload = {
    ...data,
    status: data.status || 'active',
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, 'opportunities'), payload);
      return { id: docRef.id, ...payload };
    } catch (e) {
      console.warn('[Firestore] createOpportunity error:', e);
    }
  }

  const list = getLocalStore(LS_KEYS.OPPORTUNITIES, MOCK_OPPORTUNITIES);
  const newOpp = { id: `opp_${Date.now()}`, ...payload };
  list.unshift(newOpp);
  setLocalStore(LS_KEYS.OPPORTUNITIES, list);
  return newOpp;
}

export async function updateOpportunity(id, data) {
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'opportunities', id), data);
    } catch (e) {
      console.warn('[Firestore] updateOpportunity error:', e);
    }
  }
  const list = getLocalStore(LS_KEYS.OPPORTUNITIES, MOCK_OPPORTUNITIES);
  const idx = list.findIndex(o => o.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...data };
    setLocalStore(LS_KEYS.OPPORTUNITIES, list);
  }
  return { id, ...data };
}

export async function deleteOpportunity(id) {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'opportunities', id));
    } catch (e) {
      console.warn('[Firestore] deleteOpportunity error:', e);
    }
  }
  let list = getLocalStore(LS_KEYS.OPPORTUNITIES, MOCK_OPPORTUNITIES);
  list = list.filter(o => o.id !== id);
  setLocalStore(LS_KEYS.OPPORTUNITIES, list);
  return true;
}

// -------------------------------------------------------------
// APPLICATIONS SERVICES
// -------------------------------------------------------------

export async function applyToOpportunity({ studentId, opportunityId, recruiterId, ...extra }) {
  const payload = {
    studentId,
    opportunityId,
    recruiterId,
    status: extra.status || 'applied',
    appliedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...extra,
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, 'applications'), payload);
      return { id: docRef.id, ...payload };
    } catch (e) {
      console.warn('[Firestore] applyToOpportunity error:', e);
    }
  }

  const list = getLocalStore(LS_KEYS.APPLICATIONS, MOCK_APPLICATIONS);
  // Check if already applied
  const existing = list.find(a => a.studentId === studentId && a.opportunityId === opportunityId);
  if (existing) return existing;

  const newApp = { id: `app_${Date.now()}`, ...payload };
  list.unshift(newApp);
  setLocalStore(LS_KEYS.APPLICATIONS, list);
  return newApp;
}

export async function getStudentApplications(studentId) {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'applications'), where('studentId', '==', studentId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('[Firestore] getStudentApplications error:', e);
    }
  }
  const list = getLocalStore(LS_KEYS.APPLICATIONS, MOCK_APPLICATIONS);
  return list.filter(a => a.studentId === studentId);
}

export async function getRecruiterApplications(recruiterId) {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'applications'), where('recruiterId', '==', recruiterId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('[Firestore] getRecruiterApplications error:', e);
    }
  }
  const list = getLocalStore(LS_KEYS.APPLICATIONS, MOCK_APPLICATIONS);
  return list.filter(a => a.recruiterId === recruiterId);
}

export async function getAllApplications() {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'applications'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('[Firestore] getAllApplications error:', e);
    }
  }
  return getLocalStore(LS_KEYS.APPLICATIONS, MOCK_APPLICATIONS);
}

export async function updateApplicationStatus(applicationId, newStatus, extraData = {}) {
  const updateData = {
    status: newStatus,
    ...extraData,
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'applications', applicationId), updateData);
    } catch (e) {
      console.warn('[Firestore] updateApplicationStatus error:', e);
    }
  }

  const list = getLocalStore(LS_KEYS.APPLICATIONS, MOCK_APPLICATIONS);
  const idx = list.findIndex(a => a.id === applicationId);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...updateData };
    setLocalStore(LS_KEYS.APPLICATIONS, list);
    return list[idx];
  }
  return null;
}

// -------------------------------------------------------------
// SAVED / BOOKMARKED OPPORTUNITIES
// -------------------------------------------------------------

export async function getSavedOpportunities(studentId) {
  const list = getLocalStore(LS_KEYS.SAVED, MOCK_SAVED);
  return list.filter(s => s.studentId === studentId);
}

export async function toggleSaveOpportunity(studentId, opportunityId) {
  let list = getLocalStore(LS_KEYS.SAVED, MOCK_SAVED);
  const exists = list.some(s => s.studentId === studentId && s.opportunityId === opportunityId);
  if (exists) {
    list = list.filter(s => !(s.studentId === studentId && s.opportunityId === opportunityId));
  } else {
    list.push({ studentId, opportunityId, savedAt: new Date().toISOString() });
  }
  setLocalStore(LS_KEYS.SAVED, list);
  return !exists;
}

// -------------------------------------------------------------
// LEARNING HUB ENROLLMENT PERSISTENCE
// -------------------------------------------------------------

export async function getStudentEnrollments(studentId) {
  const initial = [
    { studentId: 'student_1', programId: 'prog_aws_cloud', enrolledAt: new Date().toISOString() },
    { studentId: 'std_1', programId: 'prog_aws_cloud', enrolledAt: new Date().toISOString() },
  ];
  const list = getLocalStore(LS_KEYS.ENROLLMENTS, initial);
  return list.filter(e => e.studentId === studentId);
}

export async function enrollInLearningProgram(studentId, programId) {
  let list = getLocalStore(LS_KEYS.ENROLLMENTS, []);
  const existing = list.find(e => e.studentId === studentId && e.programId === programId);
  if (!existing) {
    const newEntry = {
      id: `enr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      studentId,
      programId,
      enrolledAt: new Date().toISOString(),
      progress: 15,
    };
    list.push(newEntry);
    setLocalStore(LS_KEYS.ENROLLMENTS, list);
    return newEntry;
  }
  return existing;
}

export async function unenrollLearningProgram(studentId, programId) {
  let list = getLocalStore(LS_KEYS.ENROLLMENTS, []);
  list = list.filter(e => !(e.studentId === studentId && e.programId === programId));
  setLocalStore(LS_KEYS.ENROLLMENTS, list);
  return true;
}

// -------------------------------------------------------------
// CERTIFICATE VERIFICATION & PROOF PERSISTENCE
// -------------------------------------------------------------

const MOCK_CERTIFICATES = [
  {
    id: 'cert_1',
    studentId: 'student_1',
    skillName: 'React',
    title: 'Meta React Native & Advanced Frontend Specialization',
    issuer: 'Coursera / Meta',
    credentialId: 'COURSERA-META-78291',
    issueDate: '2024-05-15',
    verified: true,
    verifiedBy: 'Dr. Ramesh Sharma (HOD CSE)',
    documentUrl: '',
  },
  {
    id: 'cert_2',
    studentId: 'student_1',
    skillName: 'AWS',
    title: 'AWS Certified Cloud Practitioner (CLF-C02)',
    issuer: 'Amazon Web Services',
    credentialId: 'AWS-CERT-904811',
    issueDate: '2024-08-20',
    verified: true,
    verifiedBy: 'Prof. Ananya Roy',
    documentUrl: '',
  },
  {
    id: 'cert_pending_1',
    studentId: 'student_1',
    skillName: 'Docker',
    title: 'Docker Certified Associate & Containerization',
    issuer: 'Docker Inc. / Coursera',
    credentialId: 'DOCKER-CA-98124',
    issueDate: '2026-03-01',
    verified: false,
    verifiedBy: null,
    documentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop',
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'cert_pending_2',
    studentId: 'student_2',
    skillName: 'Machine Learning',
    title: 'Deep Learning Specialization - Stanford Online',
    issuer: 'Coursera / Stanford',
    credentialId: 'STANFORD-DL-44821',
    issueDate: '2026-02-28',
    verified: false,
    verifiedBy: null,
    documentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop',
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'cert_fake_suspect_3',
    studentId: 'student_3',
    skillName: 'Cybersecurity',
    title: 'Certified Ethical Hacker (CEH v12)',
    issuer: 'EC-Council',
    credentialId: 'FAKE-CEH-000999',
    issueDate: '2026-03-05',
    verified: false,
    verifiedBy: null,
    documentUrl: '',
    submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'cert_pending_4',
    studentId: 'student_2',
    skillName: 'Kubernetes',
    title: 'Certified Kubernetes Administrator (CKA)',
    issuer: 'Cloud Native Computing Foundation (CNCF)',
    credentialId: 'CKA-992140-LINUX',
    issueDate: '2026-03-04',
    verified: false,
    verifiedBy: null,
    documentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop',
    submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'cert_pending_5',
    studentId: 'student_3',
    skillName: 'Spring Boot',
    title: 'Enterprise Java Microservices & Cloud Native Systems',
    issuer: 'VMware Tanzu / Coursera',
    credentialId: 'SPRING-BOOT-7712',
    issueDate: '2026-03-06',
    verified: false,
    verifiedBy: null,
    documentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop',
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'cert_pending_6',
    studentId: 'student_1',
    skillName: 'Python',
    title: 'Google Professional Data Engineering Specialization',
    issuer: 'Google Cloud Training',
    credentialId: 'GCP-DATA-98001',
    issueDate: '2026-03-08',
    verified: false,
    verifiedBy: null,
    documentUrl: '',
    submittedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'cert_pending_7',
    studentId: 'student_2',
    skillName: 'Machine Learning',
    title: 'TensorFlow Developer Certificate',
    issuer: 'Google Developers & Coursera',
    credentialId: 'TF-DEV-55219',
    issueDate: '2026-03-09',
    verified: false,
    verifiedBy: null,
    documentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop',
    submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
];

export async function getStudentCertificates(studentId) {
  const list = getLocalStore(LS_KEYS.CERTIFICATES, MOCK_CERTIFICATES);
  return list.filter(c => c.studentId === studentId);
}

export async function getAllCertificates() {
  return getLocalStore(LS_KEYS.CERTIFICATES, MOCK_CERTIFICATES);
}

export async function addStudentCertificate(certData) {
  const list = getLocalStore(LS_KEYS.CERTIFICATES, MOCK_CERTIFICATES);
  const newCert = {
    id: `cert_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    studentId: certData.studentId,
    skillName: certData.skillName || 'Technical Skill',
    title: certData.title || 'Technical Competency Certificate',
    issuer: certData.issuer || 'Accredited Organization',
    credentialId: certData.credentialId || `CRED-${Date.now().toString().slice(-6)}`,
    issueDate: certData.issueDate || new Date().toISOString().slice(0, 10),
    documentUrl: certData.documentUrl || '',
    verified: false,
    verifiedBy: null,
    submittedAt: new Date().toISOString(),
  };
  list.push(newCert);
  setLocalStore(LS_KEYS.CERTIFICATES, list);
  return newCert;
}

export async function verifyStudentCertificate(certificateId, verifierName) {
  const list = getLocalStore(LS_KEYS.CERTIFICATES, MOCK_CERTIFICATES);
  const idx = list.findIndex(c => c.id === certificateId);
  if (idx >= 0) {
    list[idx].verified = true;
    list[idx].status = 'verified';
    list[idx].verifiedBy = verifierName || 'Faculty Evaluator';
    list[idx].verifiedAt = new Date().toISOString();
    setLocalStore(LS_KEYS.CERTIFICATES, list);

    // Also update student skill to verified in student profile
    const studentId = list[idx].studentId;
    const student = await getStudentProfile(studentId);
    if (student?.skills) {
      const updatedSkills = student.skills.map(s => {
        const sName = (s.name || s).toLowerCase();
        if (sName === list[idx].skillName.toLowerCase()) {
          return { ...(typeof s === 'string' ? { name: s, level: 'Intermediate' } : s), verified: true };
        }
        return s;
      });
      await updateStudentProfile(studentId, { skills: updatedSkills });
    }
    return list[idx];
  }
  return null;
}

export async function rejectStudentCertificate(certificateId, reason, verifierName, actionType = 'rejected') {
  const list = getLocalStore(LS_KEYS.CERTIFICATES, MOCK_CERTIFICATES);
  const idx = list.findIndex(c => c.id === certificateId);
  if (idx >= 0) {
    list[idx].verified = false;
    list[idx].status = actionType; // 'rejected' or 'correction_requested'
    list[idx].rejectionReason = reason || 'Certificate could not be authenticated against issuer registry.';
    list[idx].reviewedBy = verifierName || 'Faculty Reviewer';
    list[idx].reviewedAt = new Date().toISOString();
    setLocalStore(LS_KEYS.CERTIFICATES, list);
    return list[idx];
  }
  return null;
}

// -------------------------------------------------------------
// CURRICULUM & SYLLABUS INDUSTRY COLLABORATION PERSISTENCE
// -------------------------------------------------------------

const INITIAL_CURRICULUMS = [
  {
    id: 'curr_cloud_2026',
    title: 'Cloud & Distributed Systems Specialization (CSE 402)',
    department: 'Computer Science & Engineering',
    proposedBy: 'National Institute of Technology - Academic Council',
    academicYear: '2025-2026',
    status: 'Under Industry Review', // 'Draft', 'Under Industry Review', 'Endorsed by Industry'
    credits: 4,
    description: 'Advanced curriculum covering distributed systems, container orchestration, cloud-native microservices, and serverless computing.',
    modules: [
      { unit: 'Unit 1', topic: 'Distributed Consensus & Raft/Paxos Protocols', hours: 8 },
      { unit: 'Unit 2', topic: 'Containerization, Docker & Kubernetes Pod Orchestration', hours: 12 },
      { unit: 'Unit 3', topic: 'Event-Driven Architectures & Message Brokers (Kafka, RabbitMQ)', hours: 10 },
      { unit: 'Unit 4', topic: 'Cloud Security, IAM, and Zero Trust Networking', hours: 10 },
    ],
    industryVotes: { upvotes: 14, downvotes: 1 },
    feedback: [
      {
        id: 'fb_1',
        reviewerName: 'Vikram Malhotra',
        company: 'NexGen Cloud Solutions',
        rating: 5,
        comment: 'Excellent inclusion of Kubernetes orchestration. We strongly recommend including Terraform Infrastructure as Code in Unit 2.',
        date: '2026-03-01',
      },
      {
        id: 'fb_2',
        reviewerName: 'Ananya Roy',
        company: 'Tata Consultancy Services',
        rating: 4.5,
        comment: 'Very aligned with current industry vacancies for Cloud DevOps engineers.',
        date: '2026-03-08',
      }
    ]
  },
  {
    id: 'curr_ai_fullstack_2026',
    title: 'Applied Generative AI & Full-Stack Systems (AI 304)',
    department: 'AI & Data Science',
    proposedBy: 'Delhi Technological University - Curriculum Committee',
    academicYear: '2025-2026',
    status: 'Under Industry Review',
    credits: 4,
    description: 'Hands-on curriculum integrating LLMs, Retrieval-Augmented Generation (RAG), vector databases, and React frontend interfaces.',
    modules: [
      { unit: 'Unit 1', topic: 'Transformers, Embeddings & Vector Search (Pinecone/Chroma)', hours: 10 },
      { unit: 'Unit 2', topic: 'RAG Pipelines, LangChain & Model Fine-Tuning', hours: 12 },
      { unit: 'Unit 3', topic: 'Full-Stack Integration with Next.js, WebSockets & Streaming UI', hours: 10 },
      { unit: 'Unit 4', topic: 'AI Safety, Guardrails & Production Deployment', hours: 8 },
    ],
    industryVotes: { upvotes: 22, downvotes: 0 },
    feedback: [
      {
        id: 'fb_3',
        reviewerName: 'Pooja Iyer',
        company: 'Apex Cyber & AI Labs',
        rating: 5,
        comment: 'Highly relevant syllabus. Candidates with RAG pipeline skills have 3x higher placement conversion rates.',
        date: '2026-03-10',
      }
    ]
  }
];

export async function getAllCurriculums() {
  return getLocalStore(LS_KEYS.CURRICULUM, INITIAL_CURRICULUMS);
}

export async function createCurriculum(currData) {
  const list = getLocalStore(LS_KEYS.CURRICULUM, INITIAL_CURRICULUMS);
  const newCurr = {
    id: `curr_${Date.now()}`,
    title: currData.title,
    department: currData.department || 'Computer Science & Engineering',
    proposedBy: currData.proposedBy || 'Faculty Curriculum Committee',
    academicYear: currData.academicYear || '2025-2026',
    status: 'Under Industry Review',
    credits: currData.credits || 4,
    description: currData.description || '',
    modules: currData.modules || [],
    industryVotes: { upvotes: 1, downvotes: 0 },
    feedback: [],
    createdAt: new Date().toISOString(),
  };
  list.unshift(newCurr);
  setLocalStore(LS_KEYS.CURRICULUM, list);
  return newCurr;
}

export async function addCurriculumFeedback(curriculumId, feedbackItem) {
  const list = getLocalStore(LS_KEYS.CURRICULUM, INITIAL_CURRICULUMS);
  const idx = list.findIndex(c => c.id === curriculumId);
  if (idx >= 0) {
    const newFb = {
      id: `fb_${Date.now()}`,
      reviewerName: feedbackItem.reviewerName || 'Industry Partner',
      company: feedbackItem.company || 'Enterprise Partner',
      rating: feedbackItem.rating || 5,
      comment: feedbackItem.comment || '',
      date: new Date().toISOString().slice(0, 10),
    };
    list[idx].feedback = [newFb, ...(list[idx].feedback || [])];
    list[idx].industryVotes.upvotes += 1;
    if (list[idx].feedback.length >= 3) {
      list[idx].status = 'Endorsed by Industry';
    }
    setLocalStore(LS_KEYS.CURRICULUM, list);
    return list[idx];
  }
  return null;
}
