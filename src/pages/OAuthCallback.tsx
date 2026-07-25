import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { fetchMe } from '../services/auth';
import { useAuthStore } from '../hooks/useAuthStore';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  useEffect(() => {
    fetchMe()
      .then((profile) => {
        setAuthenticated(profile);
        navigate('/home', { replace: true });
      })
      .catch(() => {
        navigate('/login', { replace: true });
      });
  }, [setAuthenticated, navigate]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-body text-content-secondary">로그인 처리 중...</p>
    </div>
  );
}
