import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAuthStore } from '../../store/authStore.js';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

interface DecodedToken {
  id: string;
  email: string;
  role: string;
  exp: number;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { token, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();

  // 1. Kiểm tra xem có token và đã đăng nhập chưa
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  let isExpired = false;
  let isRoleInvalid = false;
  let isDecodeError = false;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    // eslint-disable-next-line react-hooks/purity
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      isExpired = true;
    }
    if (allowedRoles && !allowedRoles.includes(decoded.role)) {
      isRoleInvalid = true;
    }
  } catch {
    isDecodeError = true;
  }

  if (isDecodeError || isExpired) {
    logout();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isRoleInvalid) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
