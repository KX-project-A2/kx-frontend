import { useState } from 'react';
import GenerationInputArea from '@/components/domain/image-generation/GenerationInputArea';
import GenerationOptionsBar from '@/components/domain/image-generation/GenerationOptionsBar';
import ResultGrid from '@/components/domain/image-generation/ResultGrid';
import { useGenerationOptionsStore } from '@/hooks/useGenerationOptionsStore';
import { generateImage } from '@/services/imageGeneration';
import type { GenerationResult } from '@/types/generation';

export default function ImageGenerationPage() {
  const { model, ratio, quality, quantity } = useGenerationOptionsStore();
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (prompt: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await generateImage(prompt, { model, ratio, quality, quantity });
      setResults((prev) => [result, ...prev]);
    } catch {
      setError('이미지 생성에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <GenerationOptionsBar />
      <GenerationInputArea onGenerate={handleGenerate} disabled={isLoading} />
      <ResultGrid results={results} isLoading={isLoading} error={error} />
    </div>
  );
}
