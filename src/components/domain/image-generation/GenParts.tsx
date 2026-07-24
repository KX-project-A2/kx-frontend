import { useRef } from 'react';
import { ImagePlus, Sparkles, Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Artwork, GenGroup } from '@/constants/mockData';
import { Badge, Button, Chip, Panel, Toggle, cn } from '@/components/common/ui';
import { ResultCard } from '@/components/domain/library/ResultCard';

/* Panel section wrapper for the left settings column */
export function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-label text-content-muted">{title}</span>
      {children}
    </div>
  );
}

/* Read-only model field (image screen) */
export function ModelField({ name }: { name: string }) {
  return (
    <div
      className="flex items-center gap-2 rounded-field px-3 h-10"
      style={{ background: 'var(--surface-2)', border: '1px solid var(--stroke-soft)' }}
    >
      <Sparkles size={15} className="text-brand-light" />
      <span className="text-body text-content">{name}</span>
    </div>
  );
}

/* 2×2 reference upload grid with a x/8 counter */
export function ReferenceGrid({
  slots,
  used = 2,
  images = [],
  onAdd,
  onRemove,
}: {
  slots: string[];
  used?: number;
  images?: (string | undefined)[];
  onAdd?: (file: File) => void;
  onRemove?: (index: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onAdd?.(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-label text-content-muted">레퍼런스</span>
        <span className="font-num text-label text-content-secondary">{used}/8</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="grid grid-cols-2 gap-2">
        {slots.map((label, i) => {
          const filled = i < used;
          const image = images[i];
          return (
            <button
              key={i}

              onClick={() => (filled ? onRemove?.(i) : inputRef.current?.click())}

              className={cn(
                'flex aspect-square flex-col items-center justify-center gap-1.5 overflow-hidden rounded-field p-2 text-center transition-colors hover:border-selected-border'
              )}

              style={{
                background: filled ? 'var(--selected-bg)' : 'var(--surface-2)',
                border: `1px dashed ${filled ? 'var(--selected-border)' : 'var(--stroke-strong)'}`,
              }}
            >
              {image ? (
                <img src={image} alt={label} className="h-full w-full object-cover" />
              ) : (
                <>
                  <ImagePlus
                    size={16}
                    className={filled ? 'text-brand-light' : 'text-content-muted'}
                  />
                  <span
                    className="text-label leading-tight"
                    style={{ color: filled ? 'var(--content)' : 'var(--content-muted)' }}
                  >
                    {label}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* Prompt composer: chips (editable settings) + AI correction toggle + generate */
export function PromptComposer({
  value,
  onChange,
  chips,
  correction,
  onCorrectionChange,
  onGenerate,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  chips: string[];
  correction?: boolean;
  onCorrectionChange?: (v: boolean) => void;
  onGenerate: () => void;
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <Panel level={2} className="flex flex-col gap-3 p-3">
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <Chip key={c} selected>
            {c} <span className="text-content-muted">▾</span>
          </Chip>
        ))}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder={placeholder}
        className="w-full resize-none bg-transparent px-1 text-body text-content placeholder:text-content-muted outline-none"
      />
      <div className={cn('flex items-center', onCorrectionChange ? 'justify-between' : 'justify-end')}>
        {onCorrectionChange && (
          <div
            className="flex items-center gap-2 rounded-chip px-3 h-8"
            style={{ background: 'var(--surface-3)' }}
          >
            <Wand2 size={14} className="text-brand-light" />
            <span className="text-caption text-content-secondary">AI 프롬프트 교정</span>
            <Toggle checked={!!correction} onChange={onCorrectionChange} />
          </div>
        )}
        <Button leftIcon={<Sparkles size={16} />} onClick={onGenerate} disabled={disabled}>
          생성
        </Button>
      </div>
    </Panel>
  );
}

/* One prompt group of results */
export function ResultGroup({
  group,
  onOpen,
  showToVideo,
}: {
  group: GenGroup;
  onOpen: (art: Artwork) => void;
  showToVideo?: boolean;
}) {
  const navigate = useNavigate();
  const isVideo = group.items[0]?.type === 'video';
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <p className="line-clamp-1 flex-1 text-body-medium text-content-secondary">
          {group.prompt}
        </p>
        <Badge tone="brand">
          {group.items.length}
          {isVideo ? '개' : '장'}
        </Badge>
      </div>
      <div
        className={cn(
          'grid gap-4',
          isVideo ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 md:grid-cols-4'
        )}
      >
        {group.items.map((art) => (
          <ResultCard
            key={art.id}
            art={art}
            onOpen={() => onOpen(art)}
            showToVideo={showToVideo && art.type === 'image'}
            onCopyPrompt={() => navigator.clipboard.writeText(art.prompt)}
            onReedit={() => navigate(art.type === 'video' ? '/video' : '/image')}
          />
        ))}
      </div>
    </div>
  );
}
