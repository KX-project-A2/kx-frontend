import { Sparkles } from 'lucide-react';

// TODO: 실제 로고 에셋으로 교체
export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-btn)] bg-gradient-primary text-white">
        <Sparkles size={16} strokeWidth={2.5} />
      </span>
      <span className="text-title text-content">Lumina</span>
    </div>
  );
}
