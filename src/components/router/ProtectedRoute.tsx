// src/components/router/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';

export const ProtectedRoute = () => {
  const { token, user, status } = useAppSelector((state) => state.auth);

  // Show loading state while session is being restored
  if (status === 'loading') {
    return (
      <div className="flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
          <p className="mt-3">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if no token or user (both should be present for valid session)
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Render the protected route content
  return <Outlet />;
};