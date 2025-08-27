import React from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { useNavigate } from '@tanstack/react-router';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = true 
}) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If not authenticated, redirect to login
  if (!user) {
    navigate({ to: '/login' });
    return null;
  }

  // If admin access is required but user is not admin
  if (requireAdmin && user.role !== 'admin') {
    // Redirect to login with error message
    navigate({ to: '/login' });
    return null;
  }

  // User is authenticated and has proper access
  return <>{children}</>;
};

export default ProtectedRoute;
