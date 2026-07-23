import { useEffect, useRef, useState } from 'react';
import { Copy, Download, Pencil, Play, Share2, Video as VideoIcon, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Artwork } from '../../constants/mockData';
import { Avatar, Button, IconButton, LikePill } from './ui';
import ImageWithFallback from './ImageWithFallback';
import VideoWithFallback, { type VideoWithFallbackHandle } from './VideoWithFallback';
import { useLikesStore } from '../../stores/useLikesStore';
import { downloadFile } from '../../utils/downloadFile';

export function DetailModal({ art, onClose }: { art: Artwork | null; onClose: () => void }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<VideoWithFallbackHandle>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const overrides = useLikesStore((s) => s.overrides);
  const toggleLike = useLikesStore((s) => s.toggleLike);

  useEffect(() => {
    setIsVideoPlaying(false);
  }, [art?.id]);

  if (!art) return null;

  const liked = overrides[art.id]?.liked ?? art.liked ?? false;
  const likes = overrides[art.id]?.likes ?? art.likes ?? 0;

  const info: [string, string][] = [
    ['모델', art.model],
    ['품질', art.quality],
    ['사이즈', art.ratio],
    ['생성 일자', art.createdAt],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'var(--overlay)' }} onClick={onClose}>
      <div
        className="glass-1 flex max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-card"
        style={{ boxShadow: 'var(--shadow-card)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex flex-1 items-center justify-center p-4" style={{ background: 'var(--canvas)' }}>
          {art.type === 'video' && !art.url ? (
            <div
              className="flex w-full items-center justify-center rounded-card bg-surface-3 text-body text-content-muted"
              style={{ aspectRatio: '16 / 9' }}
            >
              영상 준비 중
            </div>
          ) : art.type === 'video' ? (
            <VideoWithFallback
              ref={videoRef}
              src={art.url}
              poster={art.thumb}
              alt={art.prompt}
              className="max-h-[80vh] w-full rounded-card object-contain"
              onPlayingChange={setIsVideoPlaying}
            />
          ) : (
            <ImageWithFallback src={art.url} alt={art.prompt} className="max-h-[80vh] w-full rounded-card object-contain" />
          )}
          {art.type === 'video' && art.url && !isVideoPlaying && (
            <span
              className="absolute flex h-14 w-14 cursor-pointer items-center justify-center rounded-full"
              style={{ background: 'rgba(11,9,18,0.55)', border: '1px solid var(--stroke-strong)' }}
              onClick={() => videoRef.current?.togglePlay()}
            >
              <Play size={22} className="translate-x-0.5 text-white" fill="white" />
            </span>
          )}
          <div className="absolute right-6 top-6">
            <IconButton size={32}>
              <Share2 size={15} />
            </IconButton>
          </div>
        </div>

        <div className="flex w-[360px] shrink-0 flex-col" style={{ borderLeft: '1px solid var(--stroke-soft)' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--stroke-soft)' }}>
            <div className="flex items-center gap-2.5">
              <Avatar src={art.creator.avatar} size={32} />
              <span className="font-num text-body-medium text-content">{art.creator.handle}</span>
            </div>
            <div className="flex items-center gap-2">
              <LikePill
                count={likes}
                liked={liked}
                onToggle={() => toggleLike(art.id, liked, likes)}
              />
              <button className="text-content-muted hover:text-content" onClick={onClose}>
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-label text-content-secondary">프롬프트</span>
                <button
                  className="flex items-center gap-1 text-caption text-brand-light hover:brightness-110"
                  onClick={() => {
                    navigator.clipboard.writeText(art.prompt);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  <Copy size={13} /> {copied ? '복사됨' : '복사'}
                </button>
              </div>
              <p className={`text-body text-content ${expanded ? '' : 'line-clamp-3'}`}>{art.prompt}</p>
              <button className="self-start text-caption text-content-muted hover:text-content-secondary" onClick={() => setExpanded((e) => !e)}>
                {expanded ? '접기' : '전체 보기'}
              </button>
            </div>

            <div className="flex flex-col rounded-field" style={{ border: '1px solid var(--stroke-soft)' }}>
              {info.map(([k, v], i) => (
                <div
                  key={k}
                  className="flex items-center justify-between px-3.5 py-3"
                  style={i < info.length - 1 ? { borderBottom: '1px solid var(--stroke-soft)' } : undefined}
                >
                  <span className="text-caption text-content-muted">{k}</span>
                  <span className="font-num text-caption text-content">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 px-5 py-4" style={{ borderTop: '1px solid var(--stroke-soft)' }}>
            <Button
              block
              leftIcon={<Pencil size={16} />}
              onClick={() => {
                onClose();
                navigate(art.type === 'video' ? '/video' : '/image');
              }}
            >
              재편집
            </Button>
            <Button
              variant="secondary"
              block
              leftIcon={<Download size={16} />}
              disabled={art.type === 'video' && !art.url}
              onClick={
                art.type === 'image'
                  ? () => downloadFile(art.url, `${art.id}.jpg`)
                  : art.type === 'video' && art.url
                    ? () => downloadFile(art.url, `${art.id}.mp4`)
                    : undefined
              }
            >
              다운로드
            </Button>
            {art.type === 'image' && (
              <Button
                variant="secondary"
                block
                leftIcon={<VideoIcon size={16} />}
                onClick={() => {
                  onClose();
                  navigate('/video', { state: { referenceArt: art } });
                }}
              >
                영상으로 만들기
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
