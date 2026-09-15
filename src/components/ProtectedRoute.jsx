import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, needsRoleSelection } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner text="Authenticating..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (needsRoleSelection) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
