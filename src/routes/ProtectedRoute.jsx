import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { currentUser, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login page if user is not authenticated
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // If a specific role is required (student, tutor or admin)
  if (requiredRole && currentUser.userType !== requiredRole) {
    // Redirect to appropriate dashboard based on current user's role
    if (currentUser.userType === 'student') {
      return <Navigate to="/student-dashboard" replace />;
    } else if (currentUser.userType === 'tutor') {
      return <Navigate to="/tutor-dashboard" replace />;
    } else if (currentUser.userType === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
