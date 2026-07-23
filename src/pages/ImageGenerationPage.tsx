import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  ModelField,
  PromptComposer,
  ReferenceGrid,
  ResultGroup,
  SettingSection,
} from '@/components/domain/image-generation/GenParts';
import { Button, Panel, Select, Stepper, Tabs } from '@/components/common/ui';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import EmptyState from '@/components/common/EmptyState';
import { DetailModal } from '@/components/common/DetailModal';
import { CharacterSheetModal } from '@/components/domain/image-generation/CharacterSheetModal';
import { useGenerationOptionsStore } from '@/hooks/useGenerationOptionsStore';
import { useRevokeObjectUrls } from '@/hooks/useRevokeObjectUrls';
import { useObjectUrls } from '@/hooks/useObjectUrls';
import { characterConceptSheet, generateImage } from '@/services/imageGeneration';
import type { GenerationResult } from '@/types/generation';
import { toGenGroup } from '@/utils/generationAdapter';
import { IMAGE_QUALITIES, type Artwork } from '@/constants/mockData';

const RATIO_OPTIONS = ['1:1', '4:3', '3:4'];
const PURPOSE_TABS = [
  { id: '캐릭터', label: '캐릭터' },
  { id: '배경', label: '배경' },
  { id: '캐릭터시트', label: '캐릭터시트' },
];
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 4;
const MAX_REFERENCES = 8;

export default function ImageGenerationPage() {
  const { model, ratio, quality, quantity, setRatio, setQuality, setQuantity } =
    useGenerationOptionsStore();
  const [purpose, setPurpose] = useState(PURPOSE_TABS[0].id);
  const [prompt, setPrompt] = useState('');
  const [correction, setCorrection] = useState(false);
  const [references, setReferences] = useState<File[]>([]);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedArt, setSelectedArt] = useState<Artwork | null>(null);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);

  useRevokeObjectUrls(results.flatMap((result) => result.images.map((image) => image.url)));
  const referencePreviewUrls = useObjectUrls(references);

  const handleAddReference = (file: File) => {
    setReferences((prev) => (prev.length >= MAX_REFERENCES ? prev : [...prev, file]));
  };

  const handleRemoveReference = (index: number) => {
    setReferences((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await generateImage(
        prompt.trim(),
        { model, ratio, quality, quantity },
        { purpose, promptCorrectionEnabled: correction, references }
      );
      setResults((prev) => [result, ...prev]);
    } catch {
      setError('이미지 생성에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = (art: Artwork) => {
    setSelectedArt(art);
  };

  return (
    <div className="flex h-full">
      {/* left settings panel */}
      <Panel level={1} bordered={false} className="flex w-[300px] shrink-0 flex-col gap-6 overflow-y-auto p-6" style={{ borderRadius: 0 }}>
        <SettingSection title="모델">
          <ModelField name={model} />
        </SettingSection>
        <SettingSection title="목적">
          <Tabs tabs={PURPOSE_TABS} value={purpose} onChange={setPurpose} />
          {purpose === '캐릭터시트' && (
            <Button
              variant="secondary"
              block
              leftIcon={<Plus size={14} />}
              onClick={() => setIsCharacterModalOpen(true)}
            >
              캐릭터 만들기
            </Button>
          )}
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
        <ReferenceGrid
          slots={Array.from(
            { length: Math.max(4, Math.min(references.length + 1, MAX_REFERENCES)) },
            () => '레퍼런스 추가'
          )}
          used={references.length}
          images={referencePreviewUrls}
          onAdd={handleAddReference}
          onRemove={handleRemoveReference}
        />
      </Panel>

      {/* main area */}
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-8 py-8">
        <PromptComposer
          value={prompt}
          onChange={setPrompt}
          chips={[model, quality, ratio.split(' · ')[0], `× ${quantity}장`]}
          correction={correction}
          onCorrectionChange={setCorrection}
          onGenerate={handleGenerate}
          placeholder="생성하고 싶은 이미지를 설명해주세요"
          disabled={purpose === '캐릭터시트'}
        />

        {error && <ErrorMessage message={error} onRetry={handleGenerate} />}

        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-3 py-4">
            <LoadingSpinner size="md" />
            <p className="text-body text-content-secondary">
              이미지 생성 중입니다. 최대 10분 정도 걸릴 수 있어요.
            </p>
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

      <DetailModal art={selectedArt} onClose={() => setSelectedArt(null)} />

      <CharacterSheetModal
        open={isCharacterModalOpen}
        onClose={() => setIsCharacterModalOpen(false)}
        onGenerate={async (data) => {
          setIsLoading(true);
          setError(null);

          try {
            const result = await characterConceptSheet(data, { model, ratio, quality, quantity });
            setResults((prev) => [result, ...prev]);
            setIsCharacterModalOpen(false);
          } catch {
            setError('캐릭터 생성에 실패했어요. 다시 시도해주세요.');
          } finally {
            setIsLoading(false);
          }
        }}
      />
    </div>
  );
}
