import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../constants';
import LoadingSpinner from './LoadingSpinner';

export default function RoleProtectedRoute({ allowedRoles = [], children }) {
  const { userRole, loading, isAuthenticated, needsRoleSelection } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Verifying role permissions..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (needsRoleSelection) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    // Redirect to user's assigned dashboard
    if (userRole === ROLES.STUDENT) return <Navigate to="/student/dashboard" replace />;
    if (userRole === ROLES.RECRUITER) return <Navigate to="/recruiter/dashboard" replace />;
    if (userRole === ROLES.INSTITUTION_ADMIN) return <Navigate to="/institution/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}
