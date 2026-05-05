import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import LoadingAnimation from './LoadingAnimation.jsx';

const ProtectedRoute = ({ children }) => {
  const { currentUser, isAuthenticated, isGuest, loading } = useAuth();

  if (loading) {
    return <LoadingAnimation />;
  }

  if (!isAuthenticated && !isGuest) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but not verified (and not a guest), redirect to verification page
  if (isAuthenticated && !isGuest && currentUser && !currentUser.verified) {
    return <Navigate to="/verification-pending" state={{ email: currentUser.email }} replace />;
  }

  return children;
};

export default ProtectedRoute;
