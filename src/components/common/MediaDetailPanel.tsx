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
import { useAuthStore } from '../../hooks/useAuthStore';
import { useLikesStore } from '../../stores/useLikesStore';
import { createShareLink } from '../../services/share';
import { confirmLogin } from '../../utils/confirmLogin';
import { buildDownloadFilename, downloadFile } from '../../utils/downloadFile';
import { formatDate } from '../../utils/formatDate';
import { formatDuration } from '../../utils/formatDuration';

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface MediaDetailPanelProps {
  art: Artwork;
  /** X 버튼 클릭 시 호출 (모달: 모달 닫기 / 공유 페이지: 홈으로 이동) */
  onClose: () => void;
  /** 재편집·영상 만들기로 이동하기 직전 호출 (모달을 먼저 닫기 위함). 페이지에서는 필요 없음 */
  onBeforeNavigate?: () => void;
  /** false면 찜(하트)·공유 버튼처럼 소유자 전용 기능을 숨김 (기본 true) */
  isOwnerView?: boolean;
}

export default function MediaDetailPanel({
  art,
  onClose,
  onBeforeNavigate,
  isOwnerView = true,
}: MediaDetailPanelProps) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.status === 'authenticated');
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareState, setShareState] = useState<'idle' | 'loading' | 'copied' | 'error'>('idle');
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
  }, [art.id]);

  const hasPrompt = !!art.prompt?.trim();
  const liked = overrides[art.id]?.liked ?? art.liked ?? false;
  const likes = overrides[art.id]?.likes ?? art.likes ?? 0;

  const handleToggleLike = () => {
    if (!isAuthenticated) {
      confirmLogin(navigate);
      return;
    }
    toggleLike(art.id, liked, likes, art.mediaFileId);
  };

  const handleShare = async () => {
    if (!isAuthenticated) {
      confirmLogin(navigate);
      return;
    }

    if (!art.mediaFileId) {
      setShareState('error');
      setTimeout(() => setShareState('idle'), 2000);
      return;
    }

    setShareState('loading');
    try {
      const { token } = await createShareLink(art.mediaFileId);
      await navigator.clipboard.writeText(`${window.location.origin}/share/${token}`);
      setShareState('copied');
    } catch {
      setShareState('error');
    } finally {
      setTimeout(() => setShareState('idle'), 2000);
    }
  };

  const handleNavigate = (path: string, state: Record<string, Artwork>) => {
    onBeforeNavigate?.();
    navigate(path, { state });
  };

  const info: [string, string][] = [
    ['모델', art.model],
    ['품질', art.quality],
    ['비율', art.ratio],
    ...(art.type === 'video' && art.duration
      ? ([['길이', formatDuration(art.duration)]] as [string, string][])
      : []),
    ['생성 일자', formatDate(art.createdAt)],
    ['작업 ID', art.id],
  ];

  return (
    <div
      className="glass-1 flex h-[80vh] w-fit max-w-[calc(100vw-3rem)] overflow-hidden rounded-card"
      style={{
        boxShadow: 'var(--shadow-card)',
        // glass-1 기본값(50%)보다 불투명하게 — 공유 클래스를 바꾸면 사이드바/다른 모달에도
        // 영향을 주므로 이 패널에만 인라인으로 덮어씀.
        background: 'color-mix(in srgb, var(--surface-1) 95%, transparent)',
      }}
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
            <div className={`flex items-center ${isOwnerView ? 'justify-between' : 'justify-end'}`}>
              {isOwnerView && <Avatar src={art.creator.avatar} size={28} />}
              <span className="font-num text-caption text-white">
                {formatTime(videoCurrentTime)} / {formatTime(videoDuration)}
              </span>
            </div>
          </div>
        )}
        {isOwnerView && (
          <div className="absolute right-6 top-6">
            <IconButton size={32} disabled={shareState === 'loading'} onClick={handleShare}>
              <Share2 size={15} />
            </IconButton>
          </div>
        )}
        {(shareState === 'copied' || shareState === 'error') && (
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-2 text-caption whitespace-nowrap shadow-xl"
            style={{
              background: 'rgba(11,9,18,0.9)',
              border: '1px solid var(--stroke-strong)',
              color: shareState === 'error' ? 'var(--danger)' : 'var(--content)',
            }}
          >
            {shareState === 'copied' ? '링크가 복사되었어요' : '공유 링크 생성에 실패했어요'}
          </div>
        )}
      </div>

      <div
        className="flex w-[360px] shrink-0 flex-col"
        style={{ borderLeft: '1px solid var(--stroke-soft)' }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--stroke-soft)' }}
        >
          {isOwnerView ? (
            <div className="flex items-center gap-2.5">
              <Avatar src={art.creator.avatar} size={32} />
              <span className="font-num text-body-medium text-content">{art.creator.handle}</span>
            </div>
          ) : (
            <span className="font-num text-body-medium text-content-secondary">공유된 미디어</span>
          )}
          <div className="flex items-center gap-2">
            {isOwnerView && <LikePill liked={liked} onToggle={handleToggleLike} />}
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
                  i < info.length - 1 ? { borderBottom: '1px solid var(--stroke-soft)' } : undefined
                }
              >
                <span className="text-caption text-content-muted">{k}</span>
                <span className="font-num text-caption text-content">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 px-5 py-4" style={{ borderTop: '1px solid var(--stroke-soft)' }}>
          <Button
            className="flex-1"
            leftIcon={<Pencil size={16} />}
            onClick={() =>
              handleNavigate(art.type === 'video' ? '/video' : '/image', { editArt: art })
            }
          >
            재편집
          </Button>
          {art.type === 'image' && (
            <Button
              variant="secondary"
              className="flex-1"
              leftIcon={<VideoIcon size={16} />}
              onClick={() => handleNavigate('/video', { referenceArt: art })}
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
              art.type === 'image' || (art.type === 'video' && art.url)
                ? () => downloadFile(art.downloadUrl ?? art.url, buildDownloadFilename(art))
                : undefined
            }
          >
            다운로드
          </Button>
        </div>
      </div>
    </div>
  );
}
