import { useState } from 'react';
import { AlertCircle, Copy } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  jobId?: string | number;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorMessage({
  message,
  jobId,
  onRetry,
  className = '',
}: ErrorMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyJobId = () => {
    navigator.clipboard.writeText(String(jobId));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      role="alert"
      className={`flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-danger/30 bg-danger/10 px-4 py-6 text-center ${className}`}
    >
      <AlertCircle className="h-6 w-6 text-danger" />
      <p className="text-sm text-danger">{message}</p>
      {jobId !== undefined && (
        <div className="flex items-center gap-1 text-xs text-content-muted">
          <span>작업 ID: {jobId}</span>
          <button
            type="button"
            onClick={handleCopyJobId}
            aria-label="작업 ID 복사"
            className="flex items-center text-content-muted hover:text-content-secondary"
          >
            {copied ? <span>복사됨</span> : <Copy size={12} />}
          </button>
        </div>
      )}
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
