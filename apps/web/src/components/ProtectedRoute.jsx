
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';

const ProtectedRoute = ({ children }) => {
  const { currentUser, isAuthenticated, isGuest, initialLoading } = useAuth();

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
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
