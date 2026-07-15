import { useState } from 'react';
import { ArrowUp, Play, Sparkles, Zap } from 'lucide-react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { useNavigate } from 'react-router-dom';
import { Button, Chip, Panel, Tabs } from '@/components/common/ui';
import { GalleryCard, ResultCard } from '@/components/domain/home/MediaCard';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import { DetailModal } from '@/components/common/DetailModal';
import { GALLERY_IMAGES, GALLERY_VIDEOS, PROMPT_SUGGESTIONS, RECENT_WORKS, type Artwork } from '@/constants/mockData';
import { downloadFile } from '@/utils/downloadFile';

const INTRO_POSTER =
  'https://images.unsplash.com/photo-1530318893805-e7e1d466bd40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600';

export default function Home() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('image');
  const [prompt, setPrompt] = useState('');

  const items = tab === 'image' ? GALLERY_IMAGES : GALLERY_VIDEOS;
  const [selectedArt, setSelectedArt] = useState<Artwork | null>(null);

  const handleOpen = (art: Artwork) => {
    setSelectedArt(art);
  };

  return (
    <div className="mx-auto flex max-w-[1120px] flex-col gap-16 px-10 py-12">
      {/* ① hero + prompt */}
      <section className="flex flex-col items-center gap-6 pt-8 text-center">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-chip px-3 h-7" style={{ background: 'var(--selected-bg)', border: '1px solid var(--selected-border)' }}>
            <Sparkles size={14} className="text-brand-light" />
            <span className="text-label text-brand-light">제미나이 · seedance 2.0</span>
          </div>
          {/* lime accent highlight — daily free credits */}
          <div
            className="flex items-center gap-1.5 rounded-chip px-3 h-7"
            style={{ background: 'rgba(234, 251, 47, 0.16)', border: '1px solid var(--accent-600)' }}
          >
            <Zap size={13} strokeWidth={2.5} style={{ color: 'var(--accent-500)', fill: 'var(--accent-500)' }} />
            <span className="text-label" style={{ color: 'var(--accent-500)' }}>매일 무료 크레딧 +50</span>
          </div>
        </div>
        <h1 className="text-display max-w-2xl text-content">
          한 줄로 시작하는 <span className="text-gradient-primary">AI 크리에이션</span>
        </h1>
        <p className="text-body text-content-secondary">떠오르는 장면을 입력하면, 이미지와 영상이 됩니다.</p>

        <Panel level={2} className="mt-2 w-full max-w-2xl p-3">
          <div className="flex items-end gap-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              placeholder="예: 노을 지는 사막을 걷는 우주비행사, 시네마틱 영화 스틸컷"
              className="flex-1 resize-none bg-transparent px-2 py-2 text-body text-content placeholder:text-content-muted outline-none"
            />
            <Button size="md" className="shrink-0" rightIcon={<ArrowUp size={16} />} onClick={() => navigate('/image')}>
              생성
            </Button>
          </div>
          <div className="mt-1 flex flex-wrap gap-2 px-1">
            {PROMPT_SUGGESTIONS.map((s) => (
              <Chip key={s} onClick={() => setPrompt(s)}>
                {s}
              </Chip>
            ))}
          </div>
        </Panel>
      </section>

      {/* ② 탐색하기 */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-h2 text-content">탐색하기</h2>
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={[
              { id: 'image', label: '이미지' },
              { id: 'video', label: '영상' },
            ]}
          />
        </div>
        <ResponsiveMasonry columnsCountBreakPoints={{ 350: 2, 900: 3, 1100: 4 }}>
          <Masonry gutter="16px">
            {items.map((art) => (
              <GalleryCard key={art.id} art={art} onOpen={() => handleOpen(art)} />
            ))}
          </Masonry>
        </ResponsiveMasonry>
      </section>

      {/* ③ 서비스 소개 영상 */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-h2 text-content">Lumina, 이렇게 작동해요</h2>
          <p className="text-body text-content-secondary">1분 만에 살펴보는 워크플로우.</p>
        </div>
        <Panel level={1} bordered className="relative overflow-hidden">
          <ImageWithFallback src={INTRO_POSTER} alt="서비스 소개 영상" className="w-full object-cover" style={{ aspectRatio: '16 / 9' }} />
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(11,9,18,0.35)' }}>
            <button
              className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary"
              style={{ boxShadow: 'var(--shadow-glow)' }}
            >
              <Play size={26} className="translate-x-0.5 text-white" fill="white" />
            </button>
          </div>
        </Panel>
      </section>

      {/* ④ 최근 생성한 작품 */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-h2 text-content">최근 생성한 작품</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/library')}>
            전체 보기
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {RECENT_WORKS.map((art) => (
            <ResultCard
              key={art.id}
              art={art}
              onOpen={() => handleOpen(art)}
              showToVideo={art.type === 'image'}
              onDownload={
                art.type === 'image' ? () => downloadFile(art.url, `${art.id}.jpg`) : undefined
              }
            />
          ))}
        </div>
      </section>

      <DetailModal art={selectedArt} onClose={() => setSelectedArt(null)} />
    </div>
  );
}
