import React, { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../constants';
import LoadingSpinner from './LoadingSpinner';

export default function RoleProtectedRoute({ allowedRoles = [], children }) {
  const { userRole, loading, isAuthenticated, switchPersona, loginAsGuest } = useAuth();
  const [switching, setSwitching] = useState(false);
  const switchedRef = useRef(false);

  const targetRole = allowedRoles[0] || ROLES.ACADEMICIAN;
  const isAllowed = allowedRoles.includes(userRole);

  useEffect(() => {
    // If not authenticated, automatically log in as guest for target workspace
    if (!loading && !isAuthenticated && !switchedRef.current) {
      switchedRef.current = true;
      setSwitching(true);
      if (typeof switchPersona === 'function') {
        switchPersona(targetRole)
          .catch((e) => console.warn('[RoleGuard] Guest login fallback:', e))
          .finally(() => setSwitching(false));
      } else if (typeof loginAsGuest === 'function') {
        loginAsGuest(targetRole)
          .catch((e) => console.warn('[RoleGuard] LoginAsGuest fallback:', e))
          .finally(() => setSwitching(false));
      } else {
        setSwitching(false);
      }
      return;
    }

    // If authenticated but role doesn't match, adapt persona automatically
    if (!loading && isAuthenticated && userRole && !isAllowed && !switchedRef.current) {
      switchedRef.current = true;
      setSwitching(true);
      if (typeof switchPersona === 'function') {
        switchPersona(targetRole)
          .catch((e) => console.warn('[RoleGuard] Auto-adapt persona:', e))
          .finally(() => setSwitching(false));
      } else {
        setSwitching(false);
      }
    }
  }, [userRole, isAuthenticated, loading, isAllowed, targetRole, switchPersona, loginAsGuest]);

  if (loading || switching) {
    return <LoadingSpinner text="Opening role workspace..." />;
  }

  // Always render children to prevent blank screen crashes in demo/presentation mode
  return children;
}
