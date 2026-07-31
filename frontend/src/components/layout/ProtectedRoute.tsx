import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

export const ProtectedRoute: React.FC = () => {
  const { user } = useAppContext();
  const location = useLocation();

  // If user is not authenticated, redirect to the login page
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
