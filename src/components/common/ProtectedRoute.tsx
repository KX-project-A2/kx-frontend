import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../hooks/useAuthStore';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // TODO: 새로고침 시 isAuthenticated가 false로 초기화됨 - 쿠키는 남아있어도 프론트 상태만 리셋되는 문제.
  // 서버에 인증 상태를 확인하는 API(예: /api/me) 호출 후 초기화하는 로직 보강 필요
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
