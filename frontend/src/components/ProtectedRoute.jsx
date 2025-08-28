import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const location = useLocation();

  if (!user || !user.token) {
    return <Navigate to="/auth" />;
  }

  const normalizedRole = user.role?.toString().trim().toLowerCase();

  // Skip profile requirement for admins
  if (!user.hasProfile && location.pathname !== '/profile' && normalizedRole !== 'admin') {
    return <Navigate to="/profile" />;
  }

  if (!allowedRoles.includes(normalizedRole)) {
    return <Navigate to="/auth" />;
  }

  return children;
};

export default ProtectedRoute;
