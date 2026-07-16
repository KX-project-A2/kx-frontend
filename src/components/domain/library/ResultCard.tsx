import { useEffect, useRef, useState } from 'react';
import {
  Copy,
  Download,
  Heart,
  MoreHorizontal,
  Pencil,
  Play,
  RefreshCw,
  Trash2,
  Video as VideoIcon,
} from 'lucide-react';
import type { Artwork } from '@/constants/mockData';
import { Badge, IconButton, cn } from '@/components/common/ui';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import LoadingSpinner from '@/components/common/LoadingSpinner';

/* --- Result / library card with hover actions + more menu --- */
interface ResultCardProps {
  art: Artwork;
  onFavorite?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  onCopyPrompt?: () => void;
  onReedit?: () => void;
  onRegenerate?: () => void;
  onToVideo?: () => void;
  onOpen?: () => void;
  selected?: boolean;
  showToVideo?: boolean;
  isRegenerating?: boolean;
}

export function ResultCard({
  art,
  onFavorite,
  onDownload,
  onDelete,
  onCopyPrompt,
  onReedit,
  onRegenerate,
  onToVideo,
  onOpen,
  selected,
  showToVideo,
  isRegenerating,
}: ResultCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [fav, setFav] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [menuOpen]);

  const menuItems = [
    { icon: Copy, label: '프롬프트 복사', fn: onCopyPrompt, loading: false },
    { icon: Pencil, label: '재편집', fn: onReedit, loading: false },
    {
      icon: RefreshCw,
      label: isRegenerating ? '생성 중...' : '다시 생성',
      fn: onRegenerate,
      loading: isRegenerating ?? false,
    },
    ...(showToVideo
      ? [{ icon: VideoIcon, label: '동영상으로 만들기', fn: onToVideo, loading: false }]
      : []),
  ];

  return (
    <div
      className="group relative overflow-hidden rounded-card"
      style={{ border: `1px solid ${selected ? 'var(--selected-border)' : 'var(--stroke-soft)'}` }}
      ref={ref}
    >
      <button onClick={onOpen} className="block w-full">
        <ImageWithFallback
          src={art.thumb}
          alt={art.prompt}
          className="w-full object-cover"
          style={{ aspectRatio: art.type === 'video' ? '16 / 9' : String(art.aspect) }}
        />
      </button>

      {art.type === 'video' && (
        <div className="pointer-events-none absolute left-2.5 top-2.5 flex gap-1.5">
          <Badge tone="neutral">
            <Play size={11} fill="currentColor" /> {art.duration}
          </Badge>
        </div>
      )}

      {/* hover action bar */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ background: 'linear-gradient(to top, rgba(11,9,18,0.7), transparent 45%)' }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-end gap-1.5 p-2.5 opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
        <IconButton
          active={fav}
          onClick={() => {
            setFav((f) => !f);
            onFavorite?.();
          }}
          aria-label="찜"
        >
          <Heart size={14} strokeWidth={2} fill={fav ? 'currentColor' : 'transparent'} />
        </IconButton>
        <IconButton
          onClick={onDownload}
          disabled={!onDownload}
          className={!onDownload ? 'cursor-not-allowed opacity-40' : undefined}
          aria-label="다운로드"
        >
          <Download size={14} strokeWidth={2} />
        </IconButton>
        <IconButton tone="danger" onClick={onDelete} aria-label="삭제">
          <Trash2 size={14} strokeWidth={2} />
        </IconButton>
        <IconButton active={menuOpen} onClick={() => setMenuOpen((o) => !o)} aria-label="더보기">
          <MoreHorizontal size={14} strokeWidth={2} />
        </IconButton>
      </div>

      {menuOpen && (
        <div
          className="absolute bottom-12 right-2.5 z-20 w-44 overflow-hidden rounded-field p-1 shadow-xl"
          style={{ background: 'var(--surface-3)', border: '1px solid var(--stroke-strong)' }}
        >
          {menuItems.map(({ icon: Icon, label, fn, loading }) => (
            <button
              key={label}
              onClick={() => {
                if (loading) return;
                fn?.();
                setMenuOpen(false);
              }}
              disabled={loading}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-caption text-content-secondary hover:bg-surface-2 hover:text-content',
                loading && 'cursor-not-allowed opacity-60'
              )}
            >
              {loading ? <LoadingSpinner size="sm" /> : <Icon size={15} strokeWidth={2} />}
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
