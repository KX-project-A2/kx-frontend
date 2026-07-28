import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MediaDetailPanel from '@/components/common/MediaDetailPanel';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { fetchSharedMedia } from '@/services/share';
import type { Artwork } from '@/constants/mockData';

export default function SharedMediaPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [art, setArt] = useState<Artwork | null>(null);
  const [isLoading, setIsLoading] = useState(!!token);
  const [notFound, setNotFound] = useState(!token);

  useEffect(() => {
    if (!token) return;

    fetchSharedMedia(token)
      .then(setArt)
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [token]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(0, 0, 0, 0.7)' }}
    >
      {isLoading ? (
        <LoadingSpinner size="lg" />
      ) : notFound || !art ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-title text-content">링크가 만료되었거나 존재하지 않아요</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-body text-brand-light hover:brightness-110"
          >
            홈으로 이동
          </button>
        </div>
      ) : (
        <MediaDetailPanel art={art} onClose={() => navigate('/')} isOwnerView={false} />
      )}
    </div>
  );
}
