import { useState } from 'react';
import { PromptComposer, ResultGroup, SettingSection } from '@/components/domain/image-generation/GenParts';
import { StoryboardUpload } from '@/components/domain/video-generation/StoryboardUpload';
import { Panel, Select } from '@/components/common/ui';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import EmptyState from '@/components/common/EmptyState';
import { useVideoGenerationOptionsStore } from '@/hooks/useVideoGenerationOptionsStore';
import { generateVideo } from '@/services/videoGeneration';
import type { VideoGenerationResult } from '@/types/generation';
import { toVideoGenGroup } from '@/utils/generationAdapter';
import { VIDEO_LENGTHS, VIDEO_MODELS, VIDEO_QUALITIES, VIDEO_RATIOS } from '@/constants/mockData';

export default function VideoGenerationPage() {
  const { model, length, ratio, quality, setModel, setLength, setRatio, setQuality } =
    useVideoGenerationOptionsStore();
  const [prompt, setPrompt] = useState('');
  const [correction, setCorrection] = useState(false);
  const [results, setResults] = useState<VideoGenerationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await generateVideo(prompt.trim(), { model, length, ratio, quality });
      setResults((prev) => [result, ...prev]);
    } catch {
      setError('영상 생성에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = (_id: string) => {
    console.log('상세보기는 추후 구현');
  };

  return (
    <div className="flex h-full">
      {/* left settings panel */}
      <Panel level={1} bordered={false} className="flex w-[300px] shrink-0 flex-col gap-6 overflow-y-auto p-6" style={{ borderRadius: 0 }}>
        <SettingSection title="모델">
          <Select value={model} options={VIDEO_MODELS} onChange={setModel} />
        </SettingSection>
        <SettingSection title="길이">
          <Select value={length} options={VIDEO_LENGTHS} onChange={setLength} />
        </SettingSection>
        <SettingSection title="비율">
          <Select value={ratio} options={VIDEO_RATIOS} onChange={setRatio} />
        </SettingSection>
        <SettingSection title="품질">
          <Select value={quality} options={VIDEO_QUALITIES} onChange={setQuality} />
        </SettingSection>
        <StoryboardUpload />
      </Panel>

      {/* main area */}
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-8 py-8">
        <PromptComposer
          value={prompt}
          onChange={setPrompt}
          chips={[model, length, ratio.split(' · ')[0], quality.split(' ')[0]]}
          correction={correction}
          onCorrectionChange={setCorrection}
          onGenerate={handleGenerate}
          placeholder="생성하고 싶은 영상을 설명해주세요"
        />

        {error && <ErrorMessage message={error} onRetry={handleGenerate} />}

        {isLoading && (
          <div className="flex justify-center py-4">
            <LoadingSpinner size="md" />
          </div>
        )}

        {!error && !isLoading && results.length === 0 && (
          <EmptyState
            message="아직 생성된 영상이 없어요"
            description="프롬프트를 입력하고 영상을 생성해보세요"
          />
        )}

        {results.map((result) => (
          <ResultGroup key={result.id} group={toVideoGenGroup(result, { model, length, ratio, quality })} onOpen={handleOpen} />
        ))}
      </div>
    </div>
  );
}
