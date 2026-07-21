import { X } from 'lucide-react';
import { PRESET_CATALOG, type Artwork } from '@/constants/mockData';
import { GalleryCard } from './MediaCard';

interface CategoryPresetModalProps {
  category: string | null;
  onClose: () => void;
  onSelectArt: (art: Artwork) => void;
}

export function CategoryPresetModal({ category, onClose, onSelectArt }: CategoryPresetModalProps) {
  if (!category) return null;

  const presets = PRESET_CATALOG.filter((art) => art.category === category);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'var(--overlay)' }}
      onClick={onClose}
    >
      <div
        className="glass-1 flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-card"
        style={{ boxShadow: 'var(--shadow-card)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--stroke-soft)' }}
        >
          <div className="flex flex-col">
            <span className="text-h2 text-content">{category}</span>
            <span className="text-caption text-content-muted">프리셋 {presets.length}개</span>
          </div>
          <button className="text-content-muted hover:text-content" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {presets.length === 0 ? (
            <p className="py-10 text-center text-body text-content-muted">
              이 카테고리의 프리셋이 아직 없어요.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {presets.map((art) => (
                <GalleryCard key={art.id} art={art} onOpen={() => onSelectArt(art)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
