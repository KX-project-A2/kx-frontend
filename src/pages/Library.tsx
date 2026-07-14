import { useState } from 'react';
import { Download, Link2, Pencil, Play, Trash2, Video as VideoIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Select, Tabs } from '@/components/common/ui';
import { ResultCard } from '@/components/domain/library/ResultCard';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import { LIBRARY_ITEMS, type Artwork } from '@/constants/mockData';

const SORTS = ['최신순', '오래된순', '좋아요순'];

export default function Library() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');
  const [sort, setSort] = useState(SORTS[0]);
  const [selected, setSelected] = useState<Artwork>(LIBRARY_ITEMS[0]);

  const items = LIBRARY_ITEMS.filter((a) => tab === 'all' || a.type === tab);

  const meta: [string, string][] = [
    ['모델', selected.model],
    ['품질', selected.quality],
    ['비율', selected.ratio],
    ['생성 일자', selected.createdAt],
  ];

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

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {items.map((art) => (
            <div
              key={art.id}
              className="rounded-card"
              style={
                art.id === selected.id
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
              />
            </div>
          ))}
        </div>
      </div>

      {/* right detail panel */}
      <div
        className="glass-1 flex w-[380px] shrink-0 flex-col overflow-y-auto p-6"
        style={{ borderRadius: 0 }}
      >
        <div
          className="relative overflow-hidden rounded-card"
          style={{ border: '1px solid var(--stroke-soft)' }}
        >
          <ImageWithFallback
            src={selected.url}
            alt={selected.prompt}
            className="w-full object-cover"
            style={{ aspectRatio: selected.type === 'video' ? '16 / 9' : String(selected.aspect) }}
          />
          {selected.type === 'video' && (
            <span
              className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
              style={{ background: 'rgba(11,9,18,0.55)', border: '1px solid var(--stroke-strong)' }}
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
            <Button
              variant="secondary"
              leftIcon={<VideoIcon size={16} />}
              onClick={() => console.log('영상 생성은 추후 구현')}
            >
              동영상 만들기
            </Button>
            <Button variant="secondary" leftIcon={<Download size={16} />}>
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
    </div>
  );
}
