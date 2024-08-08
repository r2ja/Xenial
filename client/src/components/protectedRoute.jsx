import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../utils/authApi';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await authApi.refreshToken();
      } catch (error) {
        console.error('Authentication error:', error);
        authApi.logout();
        navigate('/login', { state: { from: location } });
      }
    };

    checkAuth();
  }, [location, navigate]);

  if (!authApi.isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;