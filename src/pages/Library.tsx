import { useEffect, useRef, useState } from 'react';
import { Download, Link2, Pencil, Play, Trash2, Video as VideoIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Select, Tabs } from '@/components/common/ui';
import { ResultCard } from '@/components/domain/library/ResultCard';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import VideoWithFallback, { type VideoWithFallbackHandle } from '@/components/common/VideoWithFallback';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { type Artwork } from '@/constants/mockData';
import { useRevokeObjectUrls } from '@/hooks/useRevokeObjectUrls';
import { generateImage } from '@/services/imageGeneration';
import { generateVideo } from '@/services/videoGeneration';
import { fetchLibraryItems } from '@/services/library';
import { downloadFile } from '@/utils/downloadFile';
import { toGenGroup, toVideoGenGroup } from '@/utils/generationAdapter';

const SORTS = ['최신순', '오래된순', '좋아요순'];

export default function Library() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');
  const [sort, setSort] = useState(SORTS[0]);
  const [selected, setSelected] = useState<Artwork | null>(null);
  const [items, setItems] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const videoRef = useRef<VideoWithFallbackHandle>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const fetched = await fetchLibraryItems(0, 20);
        if (cancelled) return;
        setItems(fetched);
        setSelected(fetched[0] ?? null);
      } catch {
        if (!cancelled) setLoadError('라이브러리를 불러오지 못했어요.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setIsVideoPlaying(false);
  }, [selected?.id]);

  useRevokeObjectUrls(items.filter((a) => a.url.startsWith('blob:')).map((a) => a.url));

  const visibleItems = items.filter((a) => tab === 'all' || a.type === tab);

  const meta: [string, string][] = selected
    ? (
        [
          ['모델', selected.model],
          ['품질', selected.quality],
          ['비율', selected.ratio],
          ['생성 일자', selected.createdAt],
        ] as [string, string][]
      ).filter(([, v]) => v)
    : [];

  const handleRegenerate = async (art: Artwork) => {
    if (regeneratingId) return;
    setRegeneratingId(art.id);
    try {
      if (art.type === 'image') {
        const options = { model: art.model, ratio: art.ratio, quality: art.quality, quantity: 1 };
        const result = await generateImage(art.prompt, options, {
          purpose: '캐릭터',
          promptCorrectionEnabled: false,
        });
        const { items: newItems } = toGenGroup(result, options);
        setItems((prev) => [newItems[0], ...prev]);
      } else {
        if (!art.mediaFileId) {
          console.warn('[Library] video regenerate skipped - missing mediaFileId', art.id);
          return;
        }
        const options = {
          model: art.model,
          length: art.duration ?? '8초',
          ratio: art.ratio,
          quality: art.quality,
        };
        const result = await generateVideo(art.prompt, options, art.mediaFileId);
        const { items: newItems } = toVideoGenGroup(result, options);
        setItems((prev) => [newItems[0], ...prev]);
      }
    } finally {
      setRegeneratingId(null);
    }
  };

  return (
    <div className="flex h-full">
      {/* left grid */}
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-8 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-h1 text-content">라이브러리</h1>
          <Select value={sort} options={SORTS} onChange={setSort} className="w-36" />
        </div>

        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'all', label: '전체' },
            { id: 'image', label: '이미지' },
            { id: 'video', label: '영상' },
          ]}
        />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : loadError ? (
          <ErrorMessage message={loadError} />
        ) : visibleItems.length === 0 ? (
          <EmptyState message="아직 항목이 없어요" description="이미지나 영상을 생성해보세요" />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {visibleItems.map((art) => (
              <div
                key={art.id}
                className="rounded-card"
                style={
                  art.id === selected?.id
                    ? { outline: '2px solid var(--selected-border)', outlineOffset: 2 }
                    : undefined
                }
              >
                <ResultCard
                  art={art}
                  onOpen={() => setSelected(art)}
                  showToVideo={art.type === 'image'}
                  onCopyPrompt={() => navigator.clipboard.writeText(art.prompt)}
                  onReedit={() => navigate(art.type === 'video' ? '/video' : '/image')}
                  onToVideo={() => navigate('/video', { state: { referenceArt: art } })}
                  onRegenerate={() => handleRegenerate(art)}
                  isRegenerating={regeneratingId === art.id}
                  onDownload={
                    art.url
                      ? () => downloadFile(art.url, `${art.id}.${art.type === 'video' ? 'mp4' : 'jpg'}`)
                      : undefined
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* right detail panel */}
      {selected && (
        <div
          className="glass-1 flex w-95 shrink-0 flex-col overflow-y-auto p-6"
          style={{ borderRadius: 0 }}
        >
          <div
            className="relative overflow-hidden rounded-card"
            style={{ border: '1px solid var(--stroke-soft)' }}
          >
            {selected.type === 'video' && !selected.url ? (
              <div
                className="flex w-full items-center justify-center bg-surface-3 text-body text-content-muted"
                style={{ aspectRatio: '16 / 9' }}
              >
                영상 준비 중
              </div>
            ) : selected.type === 'image' && !selected.thumb ? (
              <div
                className="flex w-full items-center justify-center bg-surface-3 text-body text-content-muted"
                style={{ aspectRatio: String(selected.aspect) }}
              >
                이미지 로드 실패
              </div>
            ) : selected.type === 'video' ? (
              <VideoWithFallback
                ref={videoRef}
                src={selected.url}
                poster={selected.thumb}
                alt={selected.prompt}
                className="w-full object-cover"
                style={{ aspectRatio: '16 / 9' }}
                onPlayingChange={setIsVideoPlaying}
              />
            ) : (
              <ImageWithFallback
                src={selected.url}
                alt={selected.prompt}
                className="w-full object-cover"
                style={{ aspectRatio: String(selected.aspect) }}
              />
            )}
            {selected.type === 'video' && selected.url && !isVideoPlaying && (
              <span
                className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full"
                style={{
                  background: 'rgba(11,9,18,0.55)',
                  border: '1px solid var(--stroke-strong)',
                }}
                onClick={() => videoRef.current?.togglePlay()}
              >
                <Play size={18} className="translate-x-0.5 text-white" fill="white" />
              </span>
            )}
            <div className="absolute left-2.5 top-2.5">
              <Badge tone={selected.type === 'video' ? 'brand' : 'neutral'}>
                {selected.type === 'video' ? '영상' : '이미지'}
              </Badge>
            </div>
          </div>

          <p className="mt-4 text-body text-content">{selected.prompt}</p>

          <div
            className="mt-5 flex flex-col rounded-field"
            style={{ border: '1px solid var(--stroke-soft)' }}
          >
            {meta.map(([k, v], i) => (
              <div
                key={k}
                className="flex items-center justify-between px-3.5 py-3"
                style={
                  i < meta.length - 1 ? { borderBottom: '1px solid var(--stroke-soft)' } : undefined
                }
              >
                <span className="text-caption text-content-muted">{k}</span>
                <span className="font-num text-caption text-content">{v}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <Button block leftIcon={<Pencil size={16} />} onClick={() => navigate('/image')}>
              재편집
            </Button>
            <div className="grid grid-cols-2 gap-2">
              {selected.type === 'image' && (
                <Button
                  variant="secondary"
                  leftIcon={<VideoIcon size={16} />}
                  onClick={() => navigate('/video', { state: { referenceArt: selected } })}
                >
                  동영상 만들기
                </Button>
              )}
              <Button
                variant="secondary"
                leftIcon={<Download size={16} />}
                className={selected.type === 'video' ? 'col-span-2' : undefined}
                disabled={selected.type === 'video' && !selected.url}
                onClick={
                  selected.type === 'image'
                    ? () => downloadFile(selected.url, `${selected.id}.jpg`)
                    : selected.type === 'video' && selected.url
                      ? () => downloadFile(selected.url, `${selected.id}.mp4`)
                      : undefined
                }
              >
                다운로드
              </Button>
            </div>
            <Button variant="ghost" leftIcon={<Trash2 size={16} />}>
              삭제
            </Button>
          </div>

          {/* share link — not finalized (dashed) */}
          <div
            className="mt-4 flex items-center gap-2 rounded-field px-3.5 h-11"
            style={{ border: '1px dashed var(--stroke-strong)', background: 'transparent' }}
          >
            <Link2 size={15} className="text-content-muted" />
            <span className="text-caption text-content-muted">공유 링크 — 준비 중</span>
          </div>
        </div>
      )}
    </div>
  );
}
