import { Grid3x3 } from 'lucide-react';

export function StoryboardUpload() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-label text-content-muted">스토리보드 (9컷)</span>
        <span className="font-num text-label text-content-secondary">1개</span>
      </div>
      <button
        className="grid aspect-square grid-cols-3 grid-rows-3 gap-1 rounded-field p-1.5 transition-colors hover:border-selected-border"
        style={{ background: 'var(--surface-2)', border: '1px dashed var(--stroke-strong)' }}
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <span
            key={i}
            className="flex items-center justify-center rounded-sm"
            style={{ background: i === 4 ? 'var(--selected-bg)' : 'var(--surface-3)' }}
          >
            {i === 4 && <Grid3x3 size={14} className="text-brand-light" />}
          </span>
        ))}
      </button>
    </div>
  );
}
