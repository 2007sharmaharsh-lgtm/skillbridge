import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithGoogle,
  signInGuestAnonymously,
  signInAsGuestPersona,
  signInWithEmail,
  registerWithEmail,
  logOutUser,
  subscribeToAuthChanges,
} from '../services/firebaseAuth';
import { getUserProfile, createUserProfile } from '../services/firestoreService';
import { isApaarBanned, getStudentApaarRecord } from '../services/apaarService';
import BannedAccountModal from '../components/BannedAccountModal';
import { ROLES } from '../constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false);
  const [bannedDetails, setBannedDetails] = useState(null);

  // Sync profile & role whenever authenticated user changes
  const syncUserProfile = async (rawUser) => {
    if (!rawUser) {
      setCurrentUser(null);
      setUserRole(null);
      setNeedsRoleSelection(false);
      setLoading(false);
      return;
    }

    try {
      // Check database / local storage for any updated profile data (name, photoURL, etc.)
      const profile = await getUserProfile(rawUser.uid);
      const mergedUser = profile ? { ...rawUser, ...profile } : rawUser;
      const role = mergedUser.role || rawUser.role;

      if (role) {
        setCurrentUser({ ...mergedUser, role });
        setUserRole(role);
        setNeedsRoleSelection(false);
      } else {
        // New user without role
        setCurrentUser(mergedUser);
        setUserRole(null);
        setNeedsRoleSelection(true);
      }

      // Check if student or user is banned via immutable APAAR ID registry
      const apaarRecord = getStudentApaarRecord(rawUser.uid);
      const bannedRecord = (apaarRecord?.apaarNumber ? isApaarBanned(apaarRecord.apaarNumber) : null) ||
                           (mergedUser.banned ? {
                             banReason: mergedUser.banReason || 'Fraudulent academic or skill credentials.',
                             maskedApaar: apaarRecord?.maskedApaar || mergedUser.maskedApaar || 'XXXX-XXXX-9821',
                             bannedBy: mergedUser.bannedBy || 'Faculty Review Desk',
                             bannedAt: mergedUser.bannedAt || new Date().toISOString(),
                           } : null);

      if (bannedRecord) {
        setBannedDetails(bannedRecord);
      } else {
        setBannedDetails(null);
      }
    } catch (error) {
      console.error('[AuthContext] Error syncing profile:', error);
      setCurrentUser(rawUser);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      syncUserProfile(user);
    });

    const handleStorageChange = () => {
      const activeUser = localStorage.getItem('sih_portal_user');
      if (activeUser) {
        try {
          syncUserProfile(JSON.parse(activeUser));
        } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const activeUser = localStorage.getItem('sih_portal_user');
      if (activeUser) {
        try {
          const parsed = JSON.parse(activeUser);
          const apaarRecord = getStudentApaarRecord(parsed.uid);
          const banned = apaarRecord?.apaarNumber ? isApaarBanned(apaarRecord.apaarNumber) : null;
          if (!banned && bannedDetails) {
            syncUserProfile(parsed);
          }
        } catch (e) {}
      }
    }, 2500);

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [bannedDetails]);

  // Google Login
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      await syncUserProfile(user);
      return user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // Email & Password Login
  const loginWithEmail = async (email, password) => {
    setLoading(true);
    try {
      const user = await signInWithEmail(email, password);
      await syncUserProfile(user);
      return user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // Email & Password Registration
  const registerUser = async (email, password, name, role) => {
    setLoading(true);
    try {
      const user = await registerWithEmail(email, password, name, role);
      await createUserProfile(user);
      await syncUserProfile(user);
      return user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // Autonomous / Guest Login (Anonymous Firebase Auth)
  const loginAsGuest = async (role = ROLES.STUDENT) => {
    setLoading(true);
    try {
      const guest = await signInGuestAnonymously(role);
      await syncUserProfile(guest);
      return guest;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // Fast Persona Switcher (For demo/evaluators)
  const switchPersona = async (role) => {
    setLoading(true);
    try {
      const persona = await signInAsGuestPersona(role);
      await syncUserProfile(persona);
      return persona;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // Assign Role to New User
  const assignRole = async (role) => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const profileData = {
        uid: currentUser.uid,
        name: currentUser.name || currentUser.displayName || 'Anonymous User',
        email: currentUser.email || '',
        photoURL: currentUser.photoURL || '',
        role: role,
        createdAt: new Date().toISOString(),
      };
      await createUserProfile(profileData);
      setCurrentUser({ ...currentUser, ...profileData });
      setUserRole(role);
      setNeedsRoleSelection(false);
    } catch (error) {
      console.error('[AuthContext] Failed to assign role:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    try {
      await logOutUser();
      setCurrentUser(null);
      setUserRole(null);
      setNeedsRoleSelection(false);
    } finally {
      setLoading(false);
    }
  };

  // Update current user local state immediately
  const updateCurrentUser = (partialData) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...partialData };
      try {
        localStorage.setItem('sih_portal_user', JSON.stringify(updated));
      } catch (e) {
        console.warn('[AuthContext] Failed to save sih_portal_user to localStorage:', e);
      }
      return updated;
    });
  };

  const value = {
    currentUser,
    userRole,
    loading,
    needsRoleSelection,
    loginWithGoogle,
    loginWithEmail,
    registerUser,
    loginAsGuest,
    switchPersona,
    assignRole,
    updateCurrentUser,
    logout,
    isAuthenticated: Boolean(currentUser),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {bannedDetails && <BannedAccountModal banDetails={bannedDetails} />}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
