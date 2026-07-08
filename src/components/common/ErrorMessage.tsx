import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorMessage({ message, onRetry, className = '' }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-danger/30 bg-danger/10 px-4 py-6 text-center ${className}`}
    >
      <AlertCircle className="h-6 w-6 text-danger" />
      <p className="text-sm text-danger">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-[var(--radius-btn)] bg-danger px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
