import { useEffect, useRef, useState } from 'react';
import { Copy, Download, Heart, MoreHorizontal, Pencil, Play, RefreshCw, Trash2, Video as VideoIcon } from 'lucide-react';
import type { Artwork } from '@/constants/mockData';
import { Avatar, Badge, IconButton, LikePill, cn } from '@/components/common/ui';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import { useLikesStore } from '@/stores/useLikesStore';

/* --- Explore gallery card (author + likes on hover, click opens detail) --- */
export function GalleryCard({ art, onOpen }: { art: Artwork; onOpen?: () => void }) {
  const overrides = useLikesStore((s) => s.overrides);
  const toggleLike = useLikesStore((s) => s.toggleLike);
  const liked = overrides[art.id]?.liked ?? art.liked ?? false;
  const likes = overrides[art.id]?.likes ?? art.likes ?? 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen?.();
        }
      }}
      className="group relative block w-full cursor-pointer overflow-hidden rounded-card"
      style={{ border: '1px solid var(--stroke-soft)' }}
    >
      <ImageWithFallback
        src={art.thumb}
        alt={art.prompt}
        className="w-full object-cover"
        style={{ aspectRatio: String(art.aspect) }}
      />
      {/* overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ background: 'linear-gradient(to bottom, rgba(11,9,18,0.55), transparent 35%, transparent 60%, rgba(11,9,18,0.55))' }}
      />
      {art.type === 'video' && (
        <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
          style={{ background: 'rgba(11,9,18,0.55)', border: '1px solid var(--stroke-strong)' }}>
          <Play size={18} className="translate-x-0.5 text-white" fill="white" />
        </span>
      )}
      {/* author top-left */}
      <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <Avatar src={art.creator.avatar} size={22} />
        <span className="font-num text-label text-white drop-shadow">{art.creator.handle}</span>
      </div>
      {/* like top-right */}
      <div
        className="absolute right-2.5 top-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          toggleLike(art.id, liked, likes);
        }}
      >
        <LikePill count={likes} liked={liked} size="sm" />
      </div>
    </div>
  );
}

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
    { icon: Copy, label: '프롬프트 복사', fn: onCopyPrompt },
    { icon: Pencil, label: '재편집', fn: onReedit },
    { icon: RefreshCw, label: '다시 생성', fn: onRegenerate },
    ...(showToVideo ? [{ icon: VideoIcon, label: '동영상으로 전환', fn: onToVideo }] : []),
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
        <IconButton active={fav} onClick={() => { setFav((f) => !f); onFavorite?.(); }} aria-label="찜">
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
          {menuItems.map(({ icon: Icon, label, fn }) => (
            <button
              key={label}
              onClick={() => {
                fn?.();
                setMenuOpen(false);
              }}
              className={cn('flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-caption text-content-secondary hover:bg-surface-2 hover:text-content')}
            >
              <Icon size={15} strokeWidth={2} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
