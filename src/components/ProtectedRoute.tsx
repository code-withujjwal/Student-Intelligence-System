import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  const isRoleAllowed = !allowedRoles || (user && allowedRoles.includes(user.role));

  useEffect(() => {
    if (isAuthenticated && !isRoleAllowed) {
      toast.error('Access Denied: Insufficient permissions', {
        description: `Required role: ${allowedRoles?.join(' or ')}. Your role: ${user?.role || 'None'}.`,
        id: 'access-denied-toast'
      });
    }
  }, [isAuthenticated, isRoleAllowed, allowedRoles, user]);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!isRoleAllowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
