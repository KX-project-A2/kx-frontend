import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../hooks/useAuthStore';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const status = useAuthStore((state) => state.status);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
