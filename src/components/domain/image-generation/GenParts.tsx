import { useEffect, useRef, useState } from 'react';
import { Check, Image as ImageIcon, Minus, PenLine, Plus, Sparkles, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Artwork, GenGroup } from '@/constants/mockData';
import { Badge, Button, Chip, Panel, Toggle, cn } from '@/components/common/ui';
import { ResultCard } from '@/components/domain/library/ResultCard';

/* Panel section wrapper for the left settings column */
export function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-[14px] leading-[20px] text-content-secondary">{title}</span>
      {children}
    </div>
  );
}

/* Read-only model field (image/video screens) */
export function ModelField({ name }: { name: string }) {
  return (
    <div
      className="flex h-12 items-center justify-center rounded-[12px] px-3"
      style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-3)' }}
    >
      <span className="text-[16px] font-medium leading-[24px] text-content">{name}</span>
    </div>
  );
}

/* Top-of-panel image/video/prompt mode switcher */
export function ModeTabs({ variant }: { variant: 'image' | 'video' | 'prompt' }) {
  const navigate = useNavigate();
  const items = [
    { id: 'image' as const, label: '이미지', icon: ImageIcon, to: '/image' },
    { id: 'video' as const, label: '영상', icon: Video, to: '/video' },
    { id: 'prompt' as const, label: '역프롬프트', icon: PenLine, to: '/reverse-prompt' },
  ];

  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="flex items-center justify-between">
        {items.map((item) => {
          const active = item.id === variant;
          return (
            <button
              key={item.id}
              type="button"
              disabled={!item.to}
              onClick={() => item.to && navigate(item.to)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 transition-colors',
                !item.to && 'cursor-not-allowed opacity-50'
              )}
              style={active ? { background: 'var(--surface-3)', color: '#f5c0ff' } : { color: '#988e99' }}
            >
              <item.icon size={16} strokeWidth={2} />
              <span className="text-[14px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
      <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
    </div>
  );
}

/* Independent pill buttons for the "유형" (purpose) selector */
export function PurposeTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  value: string;
  onChange?: (id: string) => void;
}) {
  return (
    <div className="flex w-full items-center gap-2">
      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange?.(t.id)}
            className="flex flex-1 items-center justify-center whitespace-nowrap rounded-full px-4 py-2.5 text-[14px] transition-colors"
            style={
              active
                ? {
                    background: 'rgba(240,165,255,0.3)',
                    border: '1px solid #f5c0ff',
                    color: '#f8d6ff',
                  }
                : { border: '1px solid rgba(255,255,255,0.15)', color: '#e9e0e9' }
            }
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/* Dropdown used for 비율/품질/모델 fields in the generation panels */
export function PanelSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange?: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  return (
    <SettingSection title={label}>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded-[8px] p-3 text-content transition-colors"
          style={{ background: 'var(--surface-3)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <span className="truncate text-[16px] leading-[24px]">{value}</span>
          <span className="text-[20px] leading-[20px] text-content-muted">▾</span>
        </button>
        {open && (
          <div
            className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-[8px] p-1 shadow-xl"
            style={{ background: 'var(--surface-3)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange?.(opt);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[16px] text-content-secondary hover:bg-surface-2 hover:text-content"
              >
                <span className="truncate text-left">{opt}</span>
                {opt === value && (
                  <Check size={15} strokeWidth={2} style={{ color: 'var(--brand-light)' }} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </SettingSection>
  );
}

/* Quantity pill stepper (수량) */
export function QuantityStepper({
  value,
  min = 1,
  max = 4,
  onChange,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange?: (v: number) => void;
}) {
  return (
    <div
      className="flex h-10 items-center gap-2 rounded-full px-4"
      style={{ background: 'rgba(29,26,33,0.8)', border: '1px solid rgba(255,255,255,0.15)' }}
    >
      <button
        type="button"
        onClick={() => onChange?.(Math.max(min, value - 1))}
        disabled={value <= min}
        className="flex items-center justify-center text-content-secondary transition-colors hover:text-content disabled:opacity-30"
      >
        <Minus size={20} strokeWidth={2} />
      </button>
      <span className="font-num text-[14px] leading-[20px] text-content">{value}</span>
      <button
        type="button"
        onClick={() => onChange?.(Math.min(max, value + 1))}
        disabled={value >= max}
        className="flex items-center justify-center text-content-secondary transition-colors hover:text-content disabled:opacity-30"
      >
        <Plus size={20} strokeWidth={2} />
      </button>
    </div>
  );
}

/* Reference image upload — 2 columns (video screen) or a single 4-wide row (image screen) */
export function ReferenceGrid({
  slots,
  used = 2,
  max,
  images = [],
  onAdd,
  onRemove,
  layout = 'grid',
  label = '레퍼런스',
  disabled = false,
  icon,
  containerClassName,
  containerStyle,
  cellClassName,
  cellStyle,
}: {
  slots: string[];
  used?: number;
  max: number;
  images?: (string | undefined)[];
  onAdd?: (file: File) => void;
  onRemove?: (index: number) => void;
  layout?: 'grid' | 'row';
  label?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
  cellClassName?: string;
  cellStyle?: React.CSSProperties;
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
        <span className="text-[14px] leading-[20px] text-content-secondary">{label}</span>
        <span className="font-num text-[12px] leading-[16px] text-content-secondary">
          {used}/{max}
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <div
        className={
          containerClassName ??
          (layout === 'row' ? 'grid grid-cols-4 gap-2' : 'grid grid-cols-2 gap-2')
        }
        style={containerStyle}
      >
        {slots.map((slotLabel, i) => {
          const filled = i < used;
          const image = images[i];
          const addDisabled = !filled && disabled;
          return (
            <button
              key={i}
              type="button"
              aria-label={slotLabel}
              disabled={addDisabled}
              onClick={() => (filled ? onRemove?.(i) : inputRef.current?.click())}
              className={`${
                cellClassName ??
                'flex aspect-square items-center justify-center overflow-hidden rounded-[12px] transition-colors'
              } ${addDisabled ? 'cursor-not-allowed opacity-50' : !cellClassName ? 'hover:border-selected-border' : ''}`}
              style={
                cellStyle ?? {
                  background: filled ? 'var(--selected-bg)' : '#212121',
                  border: `1px dashed ${filled ? 'var(--selected-border)' : 'rgba(240,165,255,0.5)'}`,
                }
              }
            >
              {image ? (
                <img src={image} alt={slotLabel} className="h-full w-full object-cover" />
              ) : (
                (icon ?? (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"
                      fill="#F8D6FF"
                    />
                  </svg>
                ))
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* Prompt composer: chips (editable settings) + AI correction toggle + generate */
type PromptChip = string | { label: string; noArrow?: boolean };

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
  chips: PromptChip[];
  correction?: boolean;
  onCorrectionChange?: (v: boolean) => void;
  onGenerate: () => void;
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <Panel
      level={2}
      className="flex flex-col gap-4 p-4"
      style={{
        borderRadius: '15px',
        border: '1px solid var(--content-muted, #988E99)',
        background: 'rgba(1, 1, 1, 0.80)',
      }}
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder={placeholder}
        className="w-full resize-none bg-transparent px-1 text-body text-content placeholder:text-content-muted outline-none"
      />
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {onCorrectionChange && (
            <div
              className="flex items-center gap-2 px-3 h-8"
              style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '8px' }}
            >
              <span className="text-caption text-content-secondary">AI 프롬프트 변환</span>
              <Toggle checked={!!correction} onChange={onCorrectionChange} />
            </div>
          )}
          {chips.map((c) => {
            const chip = typeof c === 'string' ? { label: c, noArrow: false } : c;
            return (
              <Chip
                key={chip.label}
                selected
                style={{ borderRadius: '100px', background: 'var(--surface-1)', border: 'none' }}
              >
                {chip.label} {!chip.noArrow && <span className="text-content-muted">▾</span>}
              </Chip>
            );
          })}
        </div>
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
