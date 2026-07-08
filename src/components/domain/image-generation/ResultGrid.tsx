import EmptyState from '@/components/common/EmptyState';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import type { GenerationResult } from '@/types/generation';

interface ResultGridProps {
  results: GenerationResult[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function ResultGrid({
  results,
  isLoading = false,
  error = null,
  onRetry,
}: ResultGridProps) {
  if (error) {
    return <ErrorMessage message={error} onRetry={onRetry} />;
  }

  if (results.length === 0) {
    if (isLoading) {
      return (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      );
    }
    return (
      <EmptyState
        message="아직 생성된 이미지가 없어요"
        description="프롬프트를 입력하고 이미지를 생성해보세요"
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {isLoading && (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="md" />
        </div>
      )}
      {results.map((result) => (
        <div key={result.id} className="flex flex-col gap-3">
          <p className="text-sm text-content-secondary">{result.prompt}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {result.images.map((image, index) => (
              <img
                key={`${result.id}-${index}`}
                src={image.url}
                alt={result.prompt}
                className="aspect-square w-full rounded-lg object-cover"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
