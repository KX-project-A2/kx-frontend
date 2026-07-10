import { useState } from 'react';
import {
  ModelField,
  PromptComposer,
  ReferenceGrid,
  ResultGroup,
  SettingSection,
} from '@/components/domain/image-generation/GenParts';
import { Panel, Select, Stepper } from '@/components/common/ui';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import EmptyState from '@/components/common/EmptyState';
import { useGenerationOptionsStore } from '@/hooks/useGenerationOptionsStore';
import { generateImage } from '@/services/imageGeneration';
import type { GenerationResult } from '@/types/generation';
import { toGenGroup } from '@/utils/generationAdapter';
import { IMAGE_QUALITIES, PURPOSES } from '@/constants/mockData';

const RATIO_OPTIONS = ['1:1', '4:3', '3:4', '16:9', '9:16'];
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 4;
const REFERENCE_SLOTS = ['레퍼런스 추가', '레퍼런스 추가', '레퍼런스 추가', '레퍼런스 추가'];

export default function ImageGenerationPage() {
  const { model, ratio, quality, quantity, setRatio, setQuality, setQuantity } =
    useGenerationOptionsStore();
  const [purpose, setPurpose] = useState(PURPOSES[0]);
  const [prompt, setPrompt] = useState('');
  const [correction, setCorrection] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await generateImage(prompt.trim(), { model, ratio, quality, quantity });
      setResults((prev) => [result, ...prev]);
    } catch {
      setError('이미지 생성에 실패했어요. 다시 시도해주세요.');
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
          <ModelField name={model} />
        </SettingSection>
        <SettingSection title="목적">
          <Select value={purpose} options={PURPOSES} onChange={setPurpose} />
        </SettingSection>
        <SettingSection title="비율">
          <Select value={ratio} options={RATIO_OPTIONS} onChange={setRatio} />
        </SettingSection>
        <SettingSection title="품질">
          <Select value={quality} options={IMAGE_QUALITIES} onChange={setQuality} />
        </SettingSection>
        <SettingSection title="수량">
          <Stepper value={quantity} min={MIN_QUANTITY} max={MAX_QUANTITY} onChange={setQuantity} />
        </SettingSection>
        <ReferenceGrid slots={REFERENCE_SLOTS} used={0} />
      </Panel>

      {/* main area */}
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-8 py-8">
        <PromptComposer
          value={prompt}
          onChange={setPrompt}
          chips={[ratio, quality]}
          correction={correction}
          onCorrectionChange={setCorrection}
          onGenerate={handleGenerate}
          placeholder="생성하고 싶은 이미지를 설명해주세요"
        />

        {error && <ErrorMessage message={error} onRetry={handleGenerate} />}

        {isLoading && (
          <div className="flex justify-center py-4">
            <LoadingSpinner size="md" />
          </div>
        )}

        {!error && !isLoading && results.length === 0 && (
          <EmptyState
            message="아직 생성된 이미지가 없어요"
            description="프롬프트를 입력하고 이미지를 생성해보세요"
          />
        )}

        {results.map((result) => (
          <ResultGroup
            key={result.id}
            group={toGenGroup(result, { model, ratio, quality, quantity })}
            onOpen={handleOpen}
          />
        ))}
      </div>
    </div>
  );
}
