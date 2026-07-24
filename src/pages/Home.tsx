import { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { useNavigate } from 'react-router-dom';
import { Button, Chip, Panel, Tabs } from '@/components/common/ui';
import { GalleryCard, ResultCard } from '@/components/domain/home/MediaCard';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import { DetailModal } from '@/components/common/DetailModal';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import EmptyState from '@/components/common/EmptyState';
import { EXPLORE_CATEGORY_CHIPS, PRESET_CATALOG, type Artwork } from '@/constants/mockData';
import { fetchRecentWorks } from '@/services/library';
import { downloadFile } from '@/utils/downloadFile';

const INTRO_POSTER =
  'https://images.unsplash.com/photo-1530318893805-e7e1d466bd40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600';

/** 탐색하기 그리드 — 피그마 스펙: 고정 3컬럼, 4행(12개) 단위로 로드 */
const EXPLORE_GRID_COLUMNS = 3;
const EXPLORE_PAGE_SIZE = EXPLORE_GRID_COLUMNS * 4;

export default function Home() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('image');
  const [prompt, setPrompt] = useState('');
  const [heroInView, setHeroInView] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(EXPLORE_PAGE_SIZE);
  const [recentTab, setRecentTab] = useState('image');
  const [recentWorks, setRecentWorks] = useState<Artwork[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState<string | null>(null);
  const heroRef = useRef<HTMLElement>(null);

  const items = PRESET_CATALOG.filter((art) => art.type === tab);
  const filteredItems =
    selectedCategory === null ? items : items.filter((art) => art.category === selectedCategory);
  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMoreItems = visibleCount < filteredItems.length;
  const visibleRecentWorks = recentWorks.filter((art) => art.type === recentTab).slice(0, 4);
  const [selectedArt, setSelectedArt] = useState<Artwork | null>(null);

  const handleOpen = (art: Artwork) => {
    setSelectedArt(art);
  };

  useEffect(() => {
    let cancelled = false;

    fetchRecentWorks(8)
      .then((works) => {
        if (!cancelled) setRecentWorks(works);
      })
      .catch((err) => {
        if (!cancelled) setRecentError((err as Error).message);
      })
      .finally(() => {
        if (!cancelled) setRecentLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const node = heroRef.current;
    if (!node) return;
    // 히어로 섹션이 뷰포트에서 완전히 벗어나면(스크롤로 지나가면) fixed 배경 영상을 숨김
    const observer = new IntersectionObserver(([entry]) => setHeroInView(entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* 홈 전용 풀스크린 배경 영상 — fixed(사이드바 뒤 full-bleed 유지) + 히어로 섹션이 뷰포트에서
          벗어나면 IntersectionObserver로 숨겨서 "1화면만 채우고 스크롤하면 사라짐" 구현 */}
      {heroInView && (
        <div className="fixed inset-0 -z-10">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: 'saturate(1.6) contrast(1.5) brightness(0.92) hue-rotate(-8deg)' }}
            src="/assets/video/home.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.45)', mixBlendMode: 'multiply' }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 68% 16%, rgba(227,110,255,0.4), transparent 70%)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 38% 76%, rgba(234,251,47,0.2), transparent 70%)',
            }}
          />
        </div>
      )}

      <div className="mx-auto flex max-w-[1590px] flex-col gap-16 px-12 py-12">
        {/* ① hero + prompt */}
        <section
          ref={heroRef}
          className="flex h-screen flex-col items-center gap-14 py-75 text-center"
        >
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="flex items-center gap-2">
              {['GPT Image 2.0', 'Seedance 2.0 · Kling 3.0'].map((label) => (
                <div
                  key={label}
                  className="flex items-center rounded-lg px-3 py-1"
                  style={{ background: 'rgba(240,165,255,0.3)', border: '1px solid #f5c0ff' }}
                >
                  <span className="text-[16px] font-medium" style={{ color: '#f5c0ff' }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <h1 className="text-display max-w-2xl text-content">한계없는 상상을, 현실로</h1>
            <div className="text-[18px] leading-7" style={{ color: '#eee' }}>
              <p>생각나는 대로 적으면 나머지는 AI가 완성합니다.</p>
              <p>한계를 뛰어넘는 창작을 경험하세요.</p>
            </div>
          </div>

          <div
            className="relative z-10 flex h-20.25 w-206.25 items-center gap-3 rounded-full p-4.25"
            style={{
              background: 'rgba(1,1,1,0.8)',
              border: '1px solid #f5c0ff',
              boxShadow:
                '0 0 60px 0 rgba(230,138,255,0.1), 0 1px 3px 0 rgba(0,0,0,0.3), 0 3px 8px 0 rgba(0,0,0,0.15)',
            }}
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="노을 지는 사막을 걷는 우주비행사, 시네마틱하게!"
              className="flex-1 bg-transparent px-2 text-[18px] text-content outline-none placeholder:text-[#757575]"
            />
            <Button
              variant="hero"
              size="hero"
              leftIcon={<Plus size={24} />}
              onClick={() => navigate('/image')}
            >
              생성
            </Button>
          </div>
        </section>

        {/* ② 탐색하기 */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <h2 className="text-h1-section text-content">탐색하기</h2>
            <Tabs
              value={tab}
              onChange={(next) => {
                setTab(next);
                setSelectedCategory(null);
                setVisibleCount(EXPLORE_PAGE_SIZE);
              }}
              tabs={[
                { id: 'image', label: '이미지' },
                { id: 'video', label: '영상' },
              ]}
            />
            <div className="flex-1" />
          </div>
          <div className="flex flex-wrap gap-2.5">
            {EXPLORE_CATEGORY_CHIPS.map((chip) => {
              const selected = selectedCategory === chip.category;
              return (
                <Chip
                  key={chip.label}
                  selected={selected}
                  onClick={() => {
                    setSelectedCategory(chip.category);
                    setVisibleCount(EXPLORE_PAGE_SIZE);
                  }}
                  style={
                    selected
                      ? {
                          background: 'rgba(255,250,250,0.1)',
                          border: '1px solid var(--accent-300)',
                          color: 'var(--accent-300)',
                        }
                      : {
                          background: 'rgba(117,117,117,0.1)',
                          border: '1px solid #757575',
                          color: 'var(--content-secondary)',
                        }
                  }
                >
                  #{chip.label}
                </Chip>
              );
            })}
          </div>
          {filteredItems.length === 0 ? (
            <EmptyState
              message={
                tab === 'video' ? '영상 프리셋을 준비 중이에요' : '조건에 맞는 프리셋이 없어요'
              }
              description={
                tab === 'video'
                  ? '곧 다양한 영상 프리셋으로 찾아올게요.'
                  : '다른 태그를 선택해보세요.'
              }
            />
          ) : (
            <div className="relative">
              <ResponsiveMasonry columnsCountBreakPoints={{ 0: EXPLORE_GRID_COLUMNS }}>
                <Masonry gutter="8px">
                  {visibleItems.map((art) => (
                    <GalleryCard key={art.id} art={art} onOpen={() => handleOpen(art)} />
                  ))}
                </Masonry>
              </ResponsiveMasonry>
              {hasMoreItems && (
                <>
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-67"
                    style={{
                      background:
                        'linear-gradient(to bottom, rgba(13,13,13,0) 29.197%, #0d0d0d 84.489%)',
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-6 flex justify-center">
                    <button
                      onClick={() => setVisibleCount((count) => count + EXPLORE_PAGE_SIZE)}
                      className="inline-flex items-center gap-1 rounded-full px-6 py-3 text-[18px] font-medium"
                      style={{ background: '#f5c0ff', color: '#543180' }}
                    >
                      <Plus size={20} />
                      더보기
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        {/* ③ 서비스 소개 영상 */}
        <section className="flex flex-col gap-6">
          <h2 className="text-h1-section text-content">AI 튜토리얼</h2>
          <Panel level={1} bordered className="relative overflow-hidden">
            <ImageWithFallback
              src={INTRO_POSTER}
              alt="AI 튜토리얼"
              className="w-full object-cover"
              style={{ aspectRatio: '16 / 9' }}
            />
          </Panel>
        </section>

        {/* ④ 최근 생성한 작품 */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-h1-section text-content">최근 생성한 작품</h2>
              <Tabs
                value={recentTab}
                onChange={setRecentTab}
                tabs={[
                  { id: 'image', label: '이미지' },
                  { id: 'video', label: '영상' },
                ]}
              />
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/library')}>
              전체 보기
            </Button>
          </div>
          {recentLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : recentError ? (
            <ErrorMessage message={recentError} />
          ) : visibleRecentWorks.length === 0 ? (
            <EmptyState
              message="아직 생성한 작품이 없어요"
              description="첫 작품을 만들어보면 여기에 표시돼요."
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {visibleRecentWorks.map((art) => (
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
          )}
        </section>

        <DetailModal art={selectedArt} onClose={() => setSelectedArt(null)} />
      </div>
    </>
  );
}
