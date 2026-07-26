import { useEffect, useRef, useState } from 'react';
import {
  Copy,
  Download,
  Pause,
  Pencil,
  Play,
  Plus,
  Share2,
  Video as VideoIcon,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Artwork } from '../../constants/mockData';
import { Avatar, Button, IconButton, LikePill } from './ui';
import ImageWithFallback from './ImageWithFallback';
import VideoWithFallback, { type VideoWithFallbackHandle } from './VideoWithFallback';
import { useLikesStore } from '../../stores/useLikesStore';
import { downloadFile } from '../../utils/downloadFile';
import { formatDate } from '../../utils/formatDate';

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function DetailModal({ art, onClose }: { art: Artwork | null; onClose: () => void }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<VideoWithFallbackHandle>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const overrides = useLikesStore((s) => s.overrides);
  const toggleLike = useLikesStore((s) => s.toggleLike);

  useEffect(() => {
    setIsVideoPlaying(false);
    setVideoCurrentTime(0);
    setVideoDuration(0);
  }, [art?.id]);

  if (!art) return null;

  const hasPrompt = !!art.prompt?.trim();
  const liked = overrides[art.id]?.liked ?? art.liked ?? false;
  const likes = overrides[art.id]?.likes ?? art.likes ?? 0;

  const info: [string, string][] = [
    ['모델', art.model],
    ['품질', art.quality],
    ['비율', art.ratio],
    ...(art.type === 'video' && art.duration
      ? ([['길이', art.duration]] as [string, string][])
      : []),
    ['생성 일자', formatDate(art.createdAt)],
    ['작업 ID', art.id],
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onClose}
    >
      <div
        className="glass-1 flex h-[80vh] w-fit max-w-[calc(100vw-3rem)] overflow-hidden rounded-card"
        style={{ boxShadow: 'var(--shadow-card)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative flex min-w-0 items-center justify-center p-4"
          style={{
            background: 'var(--canvas)',
            aspectRatio: art.aspect,
            maxWidth: 'min(1300px, 70vw)',
          }}
        >
          {art.type === 'video' && !art.url ? (
            <div className="flex h-full w-full items-center justify-center rounded-card bg-surface-3 text-body text-content-muted">
              영상 준비 중
            </div>
          ) : art.type === 'video' ? (
            <VideoWithFallback
              ref={videoRef}
              src={art.url}
              poster={art.thumb}
              alt={art.prompt}
              className="h-full w-full rounded-card object-contain"
              onPlayingChange={setIsVideoPlaying}
              onTimeUpdate={(current, duration) => {
                setVideoCurrentTime(current);
                setVideoDuration(duration);
              }}
            />
          ) : (
            <ImageWithFallback
              src={art.url}
              alt={art.prompt}
              className="h-full w-full rounded-card object-contain"
            />
          )}
          {art.type === 'video' && art.url && (
            <span
              className="absolute flex h-14 w-14 cursor-pointer items-center justify-center rounded-full"
              style={{ background: 'rgba(11,9,18,0.55)', border: '1px solid var(--stroke-strong)' }}
              onClick={() => videoRef.current?.togglePlay()}
            >
              {isVideoPlaying ? (
                <Pause size={22} className="text-white" fill="white" />
              ) : (
                <Play size={22} className="translate-x-0.5 text-white" fill="white" />
              )}
            </span>
          )}
          {art.type === 'video' && art.url && (
            <div
              className="absolute inset-x-0 bottom-0 flex flex-col gap-2 rounded-b-card p-3 pt-8"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}
            >
              <div
                className="h-1 w-full cursor-pointer rounded-full bg-white/25"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const ratio = (e.clientX - rect.left) / rect.width;
                  videoRef.current?.seek(ratio * videoDuration);
                }}
              >
                <div
                  className="h-full rounded-full bg-white"
                  style={{
                    width: `${videoDuration ? (videoCurrentTime / videoDuration) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <Avatar src={art.creator.avatar} size={28} />
                <span className="font-num text-caption text-white">
                  {formatTime(videoCurrentTime)} / {formatTime(videoDuration)}
                </span>
              </div>
            </div>
          )}
          <div className="absolute right-6 top-6">
            <IconButton size={32}>
              <Share2 size={15} />
            </IconButton>
          </div>
        </div>

        <div
          className="flex w-[360px] shrink-0 flex-col"
          style={{ borderLeft: '1px solid var(--stroke-soft)' }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--stroke-soft)' }}
          >
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
                <span className="text-label text-content-secondary">사용한 프롬프트</span>
                <button
                  className="flex items-center gap-1 text-caption text-brand-light hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100"
                  disabled={!hasPrompt}
                  onClick={() => {
                    navigator.clipboard.writeText(art.prompt);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  <Copy size={13} /> {copied ? '복사됨' : '복사'}
                </button>
              </div>
              {hasPrompt ? (
                <p className={`text-body text-content ${expanded ? '' : 'line-clamp-3'}`}>
                  {art.prompt}
                </p>
              ) : (
                <p className="text-body text-content-muted">프롬프트 정보 없음</p>
              )}
              {hasPrompt && (
                <button
                  className="flex items-center gap-1 self-start text-caption text-content-muted hover:text-content-secondary"
                  onClick={() => setExpanded((e) => !e)}
                >
                  {expanded ? (
                    '접기'
                  ) : (
                    <>
                      <Plus size={12} /> 전체 보기
                    </>
                  )}
                </button>
              )}
            </div>

            <div
              className="flex flex-col rounded-field"
              style={{ border: '1px solid var(--stroke-soft)' }}
            >
              {info.map(([k, v], i) => (
                <div
                  key={k}
                  className="flex items-center justify-between px-3.5 py-3"
                  style={
                    i < info.length - 1
                      ? { borderBottom: '1px solid var(--stroke-soft)' }
                      : undefined
                  }
                >
                  <span className="text-caption text-content-muted">{k}</span>
                  <span className="font-num text-caption text-content">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="flex gap-2 px-5 py-4"
            style={{ borderTop: '1px solid var(--stroke-soft)' }}
          >
            <Button
              className="flex-1"
              leftIcon={<Pencil size={16} />}
              onClick={() => {
                onClose();
                navigate(art.type === 'video' ? '/video' : '/image', { state: { editArt: art } });
              }}
            >
              재편집
            </Button>
            {art.type === 'image' && (
              <Button
                variant="secondary"
                className="flex-1"
                leftIcon={<VideoIcon size={16} />}
                onClick={() => {
                  onClose();
                  navigate('/video', { state: { referenceArt: art } });
                }}
              >
                영상 만들기
              </Button>
            )}
            <Button
              variant="secondary"
              className="flex-1"
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
          </div>
        </div>
      </div>
    </div>
  );
}
