import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  message: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  message,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-lg px-4 py-12 text-center ${className}`}
    >
      <Inbox className="h-10 w-10 text-content-muted" />
      <p className="text-sm font-medium text-content">{message}</p>
      {description && <p className="text-sm text-content-secondary">{description}</p>}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-1 rounded-[var(--radius-btn)] bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
