import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user.isLoggedIn) {
    // Redirect to the choice login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect role mismatch (e.g. staff trying to access admin dashboard or vice-versa)
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
