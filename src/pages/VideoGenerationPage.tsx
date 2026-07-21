import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PromptComposer, ReferenceGrid, ResultGroup, SettingSection } from '@/components/domain/image-generation/GenParts';
import { StoryboardUpload } from '@/components/domain/video-generation/StoryboardUpload';
import { Panel, Select } from '@/components/common/ui';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import EmptyState from '@/components/common/EmptyState';
import { DetailModal } from '@/components/common/DetailModal';
import { useVideoGenerationOptionsStore } from '@/hooks/useVideoGenerationOptionsStore';
import { generateVideo } from '@/services/videoGeneration';
import type { VideoGenerationResult } from '@/types/generation';
import { toVideoGenGroup } from '@/utils/generationAdapter';
import { VIDEO_LENGTHS, VIDEO_MODELS, VIDEO_QUALITIES, VIDEO_RATIOS, type Artwork } from '@/constants/mockData';

const REFERENCE_SLOTS = ['레퍼런스 추가'];

export default function VideoGenerationPage() {
  const location = useLocation();
  const referenceArt = (location.state as { referenceArt?: Artwork } | null)?.referenceArt;

  const { model, length, ratio, quality, setModel, setLength, setRatio, setQuality } =
    useVideoGenerationOptionsStore();
  const [prompt, setPrompt] = useState(referenceArt?.prompt ?? '');
  const [referenceImage] = useState<string | undefined>(referenceArt?.thumb);
  const [correction, setCorrection] = useState(false);
  const [results, setResults] = useState<VideoGenerationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedArt, setSelectedArt] = useState<Artwork | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;

    if (!referenceArt?.mediaFileId) {
      setError('시작 이미지가 필요해요. 이미지를 먼저 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await generateVideo(
        prompt.trim(),
        { model, length, ratio, quality },
        referenceArt.mediaFileId
      );
      setResults((prev) => [result, ...prev]);
    } catch {
      setError('영상 생성에 실패했어요. 다시 시도해주세요.');
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
        <ReferenceGrid
          slots={REFERENCE_SLOTS}
          used={referenceImage ? 1 : 0}
          images={[referenceImage]}
        />
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

      <DetailModal art={selectedArt} onClose={() => setSelectedArt(null)} />
    </div>
  );
}
