import type { Artwork } from '../../constants/mockData';
import MediaDetailPanel from './MediaDetailPanel';

export function DetailModal({ art, onClose }: { art: Artwork | null; onClose: () => void }) {
  if (!art) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onClose}
    >
      <MediaDetailPanel art={art} onClose={onClose} onBeforeNavigate={onClose} />
    </div>
  );
}
