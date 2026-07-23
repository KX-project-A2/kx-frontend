import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  PromptComposer,
  ReferenceGrid,
  ResultGroup,
  SettingSection,
} from '@/components/domain/image-generation/GenParts';
import {
  StoryboardUpload,
  type StoryboardImage,
} from '@/components/domain/video-generation/StoryboardUpload';
import { Panel, Select } from '@/components/common/ui';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import EmptyState from '@/components/common/EmptyState';
import { DetailModal } from '@/components/common/DetailModal';
import { useVideoGenerationOptionsStore } from '@/hooks/useVideoGenerationOptionsStore';
import { useRevokeObjectUrls } from '@/hooks/useRevokeObjectUrls';
import { fetchImageBlobUrl } from '@/services/imageGeneration';
import { generateVideo, uploadReferenceImage } from '@/services/videoGeneration';
import type { VideoGenerationResult } from '@/types/generation';
import { toVideoGenGroup } from '@/utils/generationAdapter';
import {
  getAvailableLengths,
  getVideoModelCapability,
  mapModelToModelId,
  toVideoValidationInput,
} from '@/utils/videoOptionMapping';
import { KLING_IMAGE_TO_VIDEO, validateVideoOptions } from '@/utils/videoOptionValidator';
import { VIDEO_MODELS, VIDEO_QUALITIES, VIDEO_RATIOS, type Artwork } from '@/constants/mockData';

const REFERENCE_SLOTS = ['레퍼런스 추가'];

export default function VideoGenerationPage() {
  const location = useLocation();
  const referenceArt = (location.state as { referenceArt?: Artwork } | null)?.referenceArt;

  const { model, length, ratio, quality, setModel, setLength, setRatio, setQuality } =
    useVideoGenerationOptionsStore();
  const [prompt, setPrompt] = useState(referenceArt?.prompt ?? '');
  const [referenceImage, setReferenceImage] = useState<string | undefined>(undefined);
  const [correction, setCorrection] = useState(false);
  const [results, setResults] = useState<VideoGenerationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedArt, setSelectedArt] = useState<Artwork | null>(null);
  const [storyboardImages, setStoryboardImages] = useState<StoryboardImage[]>([]);

  useRevokeObjectUrls(storyboardImages.map((img) => img.previewUrl));

  const capability = getVideoModelCapability(model);
  const availableLengths = getAvailableLengths(model);

  useEffect(() => {
    if (!getAvailableLengths(model).includes(length)) {
      setLength(getAvailableLengths(model)[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- model 변경 시에만 리셋, length 변경으로는 재실행 안 함
  }, [model]);

  useEffect(() => {
    if (!referenceArt?.mediaFileId) {
      setReferenceImage(undefined);
      return;
    }
    let objectUrl: string | undefined;
    fetchImageBlobUrl(referenceArt.mediaFileId).then((url) => {
      objectUrl = url;
      setReferenceImage(url);
    });
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [referenceArt?.mediaFileId]);

  useEffect(() => {
    if (referenceArt?.mediaFileId) {
      setModel(VIDEO_MODELS.find((m) => mapModelToModelId(m) === KLING_IMAGE_TO_VIDEO) ?? VIDEO_MODELS[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- referenceArt.mediaFileId 변경(새로 "동영상 만들기"로 진입) 시에만 실행
  }, [referenceArt?.mediaFileId]);

  const validationError = validateVideoOptions(
    toVideoValidationInput(prompt.trim(), { model, length, ratio, quality })
  );

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading || validationError) return;

    if (capability.requiresStartImage && !referenceArt?.mediaFileId) {
      setError('시작 이미지가 필요해요. 이미지를 먼저 선택해주세요.');
      return;
    }
    if (capability.requiresReferenceImages && storyboardImages.length === 0) {
      setError('참조 이미지가 필요해요. 스토리보드에 이미지를 추가해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const referenceMediaFileIds = await Promise.all(
        storyboardImages.map((img) => uploadReferenceImage(img.file))
      );
      const result = await generateVideo(
        prompt.trim(),
        { model, length, ratio, quality },
        referenceArt?.mediaFileId ?? null,
        referenceMediaFileIds
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
      <Panel
        level={1}
        bordered={false}
        className="flex w-[300px] shrink-0 flex-col gap-6 overflow-y-auto p-6"
        style={{ borderRadius: 0 }}
      >
        <SettingSection title="모델">
          <Select value={model} options={VIDEO_MODELS} onChange={setModel} />
        </SettingSection>
        <SettingSection title="길이">
          <Select value={length} options={availableLengths} onChange={setLength} />
        </SettingSection>
        {capability.supportsRatio && (
          <SettingSection title="비율">
            <Select value={ratio} options={VIDEO_RATIOS} onChange={setRatio} />
          </SettingSection>
        )}
        {capability.supportsQuality && (
          <SettingSection title="품질">
            <Select value={quality} options={VIDEO_QUALITIES} onChange={setQuality} />
          </SettingSection>
        )}
        {capability.supportsReferenceImages && (
          <StoryboardUpload images={storyboardImages} onChange={setStoryboardImages} />
        )}
        {capability.requiresStartImage && (
          <ReferenceGrid
            slots={REFERENCE_SLOTS}
            used={referenceImage ? 1 : 0}
            images={[referenceImage]}
          />
        )}
      </Panel>

      {/* main area */}
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-8 py-8">
        <PromptComposer
          value={prompt}
          onChange={setPrompt}
          chips={[
            model,
            length,
            ...(capability.supportsRatio ? [ratio.split(' · ')[0]] : []),
            ...(capability.supportsQuality ? [quality.split(' ')[0]] : []),
          ]}
          correction={correction}
          onCorrectionChange={setCorrection}
          onGenerate={handleGenerate}
          placeholder="생성하고 싶은 영상을 설명해주세요"
          disabled={isLoading || (!!prompt.trim() && !!validationError)}
        />

        {error && <ErrorMessage message={error} onRetry={handleGenerate} />}
        {!error && prompt.trim() && validationError && <ErrorMessage message={validationError} />}

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
          <ResultGroup
            key={result.id}
            group={toVideoGenGroup(result, { model, length, ratio, quality })}
            onOpen={handleOpen}
          />
        ))}
      </div>

      <DetailModal art={selectedArt} onClose={() => setSelectedArt(null)} />
    </div>
  );
}
