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
      className={`flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center ${className}`}
    >
      <AlertCircle className="h-6 w-6 text-red-500" />
      <p className="text-sm text-red-600">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
