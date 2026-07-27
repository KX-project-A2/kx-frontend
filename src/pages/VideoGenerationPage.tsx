import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ModeTabs,
  PanelSelect,
  PromptComposer,
  ReferenceGrid,
  ResultGroup,
} from '@/components/domain/image-generation/GenParts';
import { Panel } from '@/components/common/ui';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import EmptyState from '@/components/common/EmptyState';
import { DetailModal } from '@/components/common/DetailModal';
import { useVideoGenerationOptionsStore } from '@/hooks/useVideoGenerationOptionsStore';
import { useVideoDraftStore } from '@/hooks/useVideoDraftStore';
import { useObjectUrls } from '@/hooks/useObjectUrls';
import { fetchImageBlobUrl } from '@/services/imageGeneration';
import {
  fetchActiveVideoJob,
  generateVideo,
  resumeVideoJob,
  uploadReferenceImage,
} from '@/services/videoGeneration';
import type { VideoGenerationResult } from '@/types/generation';
import { toVideoGenGroup } from '@/utils/generationAdapter';
import {
  getAvailableLengths,
  getVideoModelCapability,
  mapModelToModelId,
  mapQualityToResolution,
  mapRatioToAspectRatio,
  toVideoValidationInput,
} from '@/utils/videoOptionMapping';
import { KLING_REFERENCE_TO_VIDEO, validateVideoOptions } from '@/utils/videoOptionValidator';
import { VIDEO_MODELS, type Artwork } from '@/constants/mockData';
import { findOptionForRestore } from '@/utils/restoreOption';
import { JobFailedError } from '@/utils/pollJob';
import { validateImageFile } from '@/utils/validateImageFile';

const REFERENCE_IMAGE_MAX_MB = 50;

const REFERENCE_CELL_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14 8H8V14H6V8H0V6H6V0H8V6H14V8Z"
      fill="#988E99"
    />
  </svg>
);

const STORYBOARD_CELL_STYLE: React.CSSProperties = {
  display: 'flex',
  width: 100,
  height: 100,
  justifyContent: 'center',
  alignItems: 'center',
  flexShrink: 0,
  borderRadius: 8,
  border: '1px solid var(--Surface-Elevated, #2C2830)',
  background: 'var(--Surface-Card, #1D1A21)',
  overflow: 'hidden',
};

const REFERENCE_CELL_STYLE: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  aspectRatio: '1 / 1',
  borderRadius: 12,
  border: '1px dashed rgba(240, 165, 255, 0.50)',
  background: 'var(--greyscale-900, #212121)',
  overflow: 'hidden',
};

export default function VideoGenerationPage() {
  const location = useLocation();
  const referenceArt = (location.state as { referenceArt?: Artwork } | null)?.referenceArt;
  const editArt = (location.state as { editArt?: Artwork } | null)?.editArt;

  const { model, length, ratio, quality, setModel, setLength, setRatio, setQuality } =
    useVideoGenerationOptionsStore();
  // length(길이)는 BE에 저장되지 않아 재편집 시 복원하지 않고 기본값으로 시작한다.
  // BE에 length 저장이 추가되면 복원 로직도 추가.
  const {
    prompt,
    referenceImages,
    storyboardImage,
    seedReference,
    setPrompt,
    setStoryboardImage,
    setSeedReference,
    addReferenceImage,
    removeReferenceImage,
  } = useVideoDraftStore();
  const [results, setResults] = useState<VideoGenerationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorJobId, setErrorJobId] = useState<number | undefined>(undefined);
  const [selectedArt, setSelectedArt] = useState<Artwork | null>(null);

  const referencePreviewUrls = useObjectUrls(referenceImages);
  // storyboardImage ? [storyboardImage] : [] 를 그대로 넘기면 매 렌더마다 새 배열 참조가 생겨
  // useObjectUrls 내부 useEffect([files])가 매번 재실행 → setUrls가 매번 새 배열을 세팅 →
  // 무한 렌더 루프("Maximum update depth exceeded")로 이어진다. storyboardImage가 실제로
  // 바뀔 때만 배열 참조가 바뀌도록 메모이즈.
  const storyboardFiles = useMemo(
    () => (storyboardImage ? [storyboardImage] : []),
    [storyboardImage]
  );
  const storyboardPreviewUrls = useObjectUrls(storyboardFiles);

  const capability = getVideoModelCapability(model);
  const availableLengths = getAvailableLengths(model);

  const usedReferenceCount = (seedReference ? 1 : 0) + referenceImages.length;
  const hasStoryboard = storyboardImage !== null;

  useEffect(() => {
    if (!getAvailableLengths(model).includes(length)) {
      setLength(getAvailableLengths(model)[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- model 변경 시에만 리셋, length 변경으로는 재실행 안 함
  }, [model]);

  useEffect(() => {
    if (capability.ratioOptions.length > 0 && !capability.ratioOptions.includes(ratio)) {
      setRatio(capability.ratioOptions[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- model 변경 시에만 리셋, ratio 변경으로는 재실행 안 함
  }, [model]);

  useEffect(() => {
    if (capability.qualityOptions.length > 0 && !capability.qualityOptions.includes(quality)) {
      setQuality(capability.qualityOptions[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- model 변경 시에만 리셋, quality 변경으로는 재실행 안 함
  }, [model]);

  useEffect(() => {
    // referenceArt("동영상 만들기")로 진입한 경우에만 seedReference를 설정한다. 순수 네비게이션
    // (referenceArt 없음)으로는 이 effect가 재실행되지 않아 기존 draft가 유지된다. 이미 같은
    // mediaFileId의 seedReference를 draft로 갖고 있으면(화면 이동 후 복귀) 재요청하지 않는다.
    // blob URL 정리는 setSeedReference 내부에서 처리하므로 여기서는 revoke하지 않는다.
    const mediaFileId = referenceArt?.mediaFileId;
    if (!mediaFileId || mediaFileId === seedReference?.mediaFileId) return;
    fetchImageBlobUrl(mediaFileId).then((url) => {
      setSeedReference({ mediaFileId, previewUrl: url });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- referenceArt.mediaFileId 변경 시에만 실행
  }, [referenceArt?.mediaFileId]);

  useEffect(() => {
    // editArt로 들어온 경우에만 draft의 prompt를 덮어쓴다. referenceArt("동영상 만들기")는
    // 새 영상용 프롬프트를 새로 작성해야 하는 플로우라 의도적으로 비워둔다(seedReference만 세팅).
    // 뒤로가기 등 순수 네비게이션으로는 이 effect가 재실행되지 않아 기존 draft가 유지된다.
    if (editArt?.prompt !== undefined) setPrompt(editArt.prompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- editArt로 진입 시에만 실행
  }, [editArt?.id]);

  useEffect(() => {
    if (referenceArt?.mediaFileId) {
      setModel(
        VIDEO_MODELS.find((m) => mapModelToModelId(m) === KLING_REFERENCE_TO_VIDEO) ??
          VIDEO_MODELS[0]
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- referenceArt.mediaFileId 변경(새로 "동영상 만들기"로 진입) 시에만 실행
  }, [referenceArt?.mediaFileId]);

  useEffect(() => {
    if (!editArt) return;
    setModel(editArt.model);

    // art.ratio/quality는 DetailModal 표시용(픽셀 해상도 포함/축약 라벨)이라 옵션 목록과 그대로
    // 매칭되지 않는다. BE 원본 값(aspectRatioRaw/qualityRaw)을 옵션이 실제 검증에 쓰는 형태로
    // 역변환해 일치하는 옵션을 찾아 복원한다. 일치하는 옵션이 없으면 기본값을 그대로 둔다.
    const capability = getVideoModelCapability(editArt.model);
    const ratioOption = findOptionForRestore(
      capability.ratioOptions,
      editArt.aspectRatioRaw,
      mapRatioToAspectRatio
    );
    if (ratioOption) setRatio(ratioOption);

    const qualityOption = findOptionForRestore(
      capability.qualityOptions,
      editArt.qualityRaw,
      mapQualityToResolution
    );
    if (qualityOption) setQuality(qualityOption);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- editArt로 재편집 진입 시에만 실행
  }, [editArt?.id]);

  useEffect(() => {
    let cancelled = false;

    fetchActiveVideoJob().then((activeJob) => {
      if (!activeJob || cancelled) return;

      setIsLoading(true);
      setError(null);
      setErrorJobId(undefined);

      resumeVideoJob(activeJob.jobId, activeJob.prompt)
        .then((result) => {
          if (cancelled) return;
          setResults((prev) => [result, ...prev]);
        })
        .catch((err) => {
          if (cancelled) return;
          if (err instanceof JobFailedError) {
            setError(err.message);
            setErrorJobId(err.jobId);
          } else {
            setError('영상 생성에 실패했어요. 다시 시도해주세요.');
          }
        })
        .finally(() => {
          if (cancelled) return;
          setIsLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const validationError = validateVideoOptions(
    toVideoValidationInput(prompt.trim(), { model, length, ratio, quality })
  );

  const handleAddStoryboardImage = async (file: File) => {
    const validation = await validateImageFile(file, REFERENCE_IMAGE_MAX_MB);
    if (!validation.valid) {
      setError(validation.reason);
      return;
    }
    setError(null);
    setStoryboardImage(file);
  };

  const handleAddReference = async (file: File) => {
    const validation = await validateImageFile(file, REFERENCE_IMAGE_MAX_MB);
    if (!validation.valid) {
      setError(validation.reason);
      return;
    }
    setError(null);
    const used = (seedReference ? 1 : 0) + referenceImages.length;
    if (used >= capability.maxReferenceImages) return;
    addReferenceImage(file);
  };

  const handleRemoveReference = (index: number) => {
    if (seedReference && index === 0) {
      setSeedReference(null);
      return;
    }
    const fileIndex = seedReference ? index - 1 : index;
    removeReferenceImage(fileIndex);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading || validationError) return;

    if (capability.requiresReferenceImages && usedReferenceCount === 0 && !hasStoryboard) {
      setError('참조 이미지가 필요해요. 레퍼런스 또는 스토리보드 이미지를 추가해주세요.');
      setErrorJobId(undefined);
      return;
    }

    setIsLoading(true);
    setError(null);
    setErrorJobId(undefined);

    try {
      let startMediaFileId: number | null = null;
      let referenceMediaFileIds: number[] = [];

      if (storyboardImage) {
        referenceMediaFileIds = [await uploadReferenceImage(storyboardImage, 'storyboard')];
      } else {
        const uploadedIds = await Promise.all(
          referenceImages.map((file) => uploadReferenceImage(file, 'video_reference'))
        );
        if (seedReference && capability.supportsStartImage) {
          startMediaFileId = seedReference.mediaFileId;
          referenceMediaFileIds = uploadedIds;
        } else if (seedReference) {
          referenceMediaFileIds = [seedReference.mediaFileId, ...uploadedIds];
        } else {
          referenceMediaFileIds = uploadedIds;
        }
      }

      const result = await generateVideo(
        prompt.trim(),
        { model, length, ratio, quality },
        startMediaFileId,
        referenceMediaFileIds
      );
      setResults((prev) => [result, ...prev]);
    } catch (err) {
      if (err instanceof JobFailedError) {
        setError(err.message);
        setErrorJobId(err.jobId);
      } else {
        setError('영상 생성에 실패했어요. 다시 시도해주세요.');
      }
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
        <ModeTabs variant="video" />
        <PanelSelect label="모델" value={model} options={VIDEO_MODELS} onChange={setModel} />
        <PanelSelect label="길이" value={length} options={availableLengths} onChange={setLength} />
        {capability.ratioOptions.length > 0 && (
          <PanelSelect
            label="비율"
            value={ratio}
            options={capability.ratioOptions}
            onChange={setRatio}
          />
        )}
        {capability.qualityOptions.length > 0 && (
          <PanelSelect
            label="품질"
            value={quality}
            options={capability.qualityOptions}
            onChange={setQuality}
          />
        )}
        {capability.supportsReferenceImages && (
          <ReferenceGrid
            label="스토리보드"
            slots={['스토리보드 추가']}
            used={storyboardImage ? 1 : 0}
            max={1}
            images={[storyboardPreviewUrls[0]]}
            onAdd={handleAddStoryboardImage}
            onRemove={() => setStoryboardImage(null)}
            disabled={usedReferenceCount > 0}
            icon={REFERENCE_CELL_ICON}
            containerClassName="flex"
            cellClassName="flex items-center justify-center transition-colors"
            cellStyle={STORYBOARD_CELL_STYLE}
          />
        )}
        {capability.supportsReferenceImages && (
          <ReferenceGrid
            slots={Array.from({ length: capability.maxReferenceImages }, () => '레퍼런스 추가')}
            used={usedReferenceCount}
            max={capability.maxReferenceImages}
            images={[...(seedReference ? [seedReference.previewUrl] : []), ...referencePreviewUrls]}
            onAdd={handleAddReference}
            onRemove={handleRemoveReference}
            icon={REFERENCE_CELL_ICON}
            containerClassName="grid gap-2"
            containerStyle={{
              gridTemplateColumns: `repeat(${Math.round(Math.sqrt(capability.maxReferenceImages))}, 1fr)`,
            }}
            cellClassName="flex items-center justify-center transition-colors"
            cellStyle={REFERENCE_CELL_STYLE}
            disabled={hasStoryboard}
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
            ...(capability.ratioOptions.length > 0 ? [ratio.split(' · ')[0]] : []),
            ...(capability.qualityOptions.length > 0 ? [quality.split(' ')[0]] : []),
          ]}
          onGenerate={handleGenerate}
          placeholder="생성하고 싶은 영상을 설명해주세요"
          disabled={isLoading || (!!prompt.trim() && !!validationError)}
        />

        {error && <ErrorMessage message={error} jobId={errorJobId} onRetry={handleGenerate} />}
        {!error && prompt.trim() && validationError && <ErrorMessage message={validationError} />}

        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-3 py-4">
            <LoadingSpinner size="md" />
            <p className="text-body text-content-secondary">
              영상 생성 중입니다. 최대 10분 정도 걸릴 수 있어요.
            </p>
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
