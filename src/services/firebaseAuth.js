import {
  signInWithPopup,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from './firebase';
import { MOCK_USERS } from './mockData';

const LOCAL_STORAGE_USER_KEY = 'sih_portal_user';

/**
 * Signs in with Email and Password
 */
export async function signInWithEmail(email, password) {
  if (isFirebaseConfigured && auth) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.warn('[Auth] Firebase email sign-in failed, using local/mock lookup:', error);
    }
  }

  // Local / Mock store authentication
  const storedUsers = JSON.parse(localStorage.getItem('sih_store_users') || '[]');
  const allUsers = [...storedUsers, ...MOCK_USERS];
  const user = allUsers.find(u => u.email?.toLowerCase() === email.trim().toLowerCase());

  if (user) {
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    return user;
  }

  // Demo user creation for any entered email
  const demoUser = {
    uid: `user_${Date.now()}`,
    name: email.split('@')[0],
    email: email.trim(),
    role: 'student',
    photoURL: '',
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(demoUser));
  return demoUser;
}

/**
 * Registers a new user with Email and Password
 */
export async function registerWithEmail(email, password, name, role = 'student') {
  let uid = `user_${Date.now()}`;
  if (isFirebaseConfigured && auth) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      uid = result.user.uid;
    } catch (error) {
      console.warn('[Auth] Firebase registration failed, using local store:', error);
    }
  }

  const newUser = {
    uid,
    name: name.trim(),
    email: email.trim(),
    role,
    photoURL: '',
    createdAt: new Date().toISOString(),
  };

  const storedUsers = JSON.parse(localStorage.getItem('sih_store_users') || '[]');
  storedUsers.push(newUser);
  localStorage.setItem('sih_store_users', JSON.stringify(storedUsers));
  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newUser));

  return newUser;
}

/**
 * Signs in with Google using Firebase Authentication popup
 */
export async function signInWithGoogle() {
  if (!isFirebaseConfigured || !auth) {
    console.warn('[Auth] Firebase not configured. Falling back to autonomous demo student login.');
    return signInAsGuestPersona('student');
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('[Auth] Error during Google Sign-in:', error);
    throw error;
  }
}

/**
 * Signs in anonymously via Firebase Auth (Guest Mode)
 */
export async function signInGuestAnonymously(role = 'student') {
  if (isFirebaseConfigured && auth) {
    try {
      const result = await signInAnonymously(auth);
      const guestUser = {
        uid: result.user.uid,
        name: `Guest (${role})`,
        email: `guest_${result.user.uid.slice(0, 5)}@portal.guest`,
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop',
        role,
        isGuest: true,
      };
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(guestUser));
      return guestUser;
    } catch (error) {
      console.warn('[Auth] Anonymous Firebase sign-in failed, using mock guest:', error);
      return signInAsGuestPersona(role);
    }
  } else {
    return signInAsGuestPersona(role);
  }
}

/**
 * Fast autonomous persona switcher for hackathons, testing & evaluations
 * @param {'student' | 'recruiter' | 'institution_admin'} role
 */
export async function signInAsGuestPersona(role = 'student') {
  const persona = MOCK_USERS.find(u => u.role === role) || MOCK_USERS[0];
  
  // Check if there are user-saved modifications in local store
  let savedData = {};
  try {
    const storedUsers = JSON.parse(localStorage.getItem('sih_store_users') || '[]');
    const found = storedUsers.find(u => u.uid === persona.uid);
    if (found) savedData = found;
  } catch (e) {}

  const user = {
    ...persona,
    ...savedData,
    isGuest: true,
  };
  try {
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
  } catch (e) {}
  return user;
}

/**
 * Signs out current user
 */
export async function logOutUser() {
  if (isFirebaseConfigured && auth) {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.error('[Auth] Signout error:', e);
    }
  }
  localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
}

/**
 * Subscribes to auth state changes
 */
export function subscribeToAuthChanges(callback) {
  // Check if we have a persisted mock/guest user in localStorage
  const localSaved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
  if (localSaved) {
    try {
      const parsed = JSON.parse(localSaved);
      callback(parsed);
    } catch (e) {
      callback(null);
    }
  }

  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // If not a guest persona override
        const local = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
        if (local) {
          try {
            const parsed = JSON.parse(local);
            callback(parsed);
            return;
          } catch (e) {}
        }
        callback({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'Authenticated User',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop',
          role: null, // Will be resolved from firestoreService
        });
      } else if (!localSaved) {
        callback(null);
      }
    });
  } else if (!localSaved) {
    callback(null);
  }

  return () => {};
}
