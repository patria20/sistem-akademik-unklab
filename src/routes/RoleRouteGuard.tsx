import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/academic';

interface RoleRouteGuardProps {
  children: React.ReactNode;
  allowedRole?: UserRole;
}

export const RoleRouteGuard: React.FC<RoleRouteGuardProps> = ({ children, allowedRole }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
