import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore';

export default function ProtectedRoute({ allowedRole }) {
  const { user, role, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    // If they have the wrong role, redirect to their correct dashboard
    if (role === 'petOwner') return <Navigate to="/pet-owner/dashboard" replace />;
    if (role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
