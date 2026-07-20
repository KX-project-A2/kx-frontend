import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuthStore } from '../hooks/useAuthStore';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  useEffect(() => {
    setAuthenticated(true);
    navigate('/home', { replace: true });
  }, [setAuthenticated, navigate]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-body text-content-secondary">로그인 처리 중...</p>
    </div>
  );
}
