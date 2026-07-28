import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Plus } from 'lucide-react';
import {
  ModeTabs,
  ModelField,
  PanelSelect,
  PromptComposer,
  PurposeTabs,
  QuantityStepper,
  ReferenceGrid,
  ResultGroup,
  SettingSection,
} from '@/components/domain/image-generation/GenParts';
import { Panel } from '@/components/common/ui';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import EmptyState from '@/components/common/EmptyState';
import { DetailModal } from '@/components/common/DetailModal';
import {
  CharacterSheetModal,
  DEFAULT_CHARACTER_SHEET_FORM_DATA,
  hasSavedCharacterAttributes,
  type CharacterSheetFormData,
} from '@/components/domain/image-generation/CharacterSheetModal';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useGenerationOptionsStore } from '@/hooks/useGenerationOptionsStore';
import { useImageDraftStore } from '@/hooks/useImageDraftStore';
import { useRevokeObjectUrls } from '@/hooks/useRevokeObjectUrls';
import { useObjectUrls } from '@/hooks/useObjectUrls';
import {
  characterConceptSheet,
  fetchActiveImageJob,
  generateImage,
  mapQualityToBE,
  resumeImageJob,
} from '@/services/imageGeneration';
import type { GenerationResult } from '@/types/generation';
import { confirmLogin } from '@/utils/confirmLogin';
import { toGenGroup } from '@/utils/generationAdapter';
import { findOptionForRestore } from '@/utils/restoreOption';
import { JobFailedError } from '@/utils/pollJob';
import { validateImageFile } from '@/utils/validateImageFile';
import { IMAGE_QUALITIES, type Artwork } from '@/constants/mockData';

const RATIO_OPTIONS = ['1:1', '16:9', '9:16'];
const REFERENCE_IMAGE_MAX_MB = 50;
const PURPOSE_TABS = [
  { id: '캐릭터', label: '캐릭터' },
  { id: '배경', label: '배경' },
  { id: '캐릭터시트', label: '캐릭터시트' },
];
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 4;
const MAX_REFERENCES = 8;

export default function ImageGenerationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.status === 'authenticated');
  const initialPrompt = (location.state as { prompt?: string } | null)?.prompt;
  const editArt = (location.state as { editArt?: Artwork } | null)?.editArt;

  const { model, ratio, quality, quantity, setRatio, setQuality, setQuantity } =
    useGenerationOptionsStore();
  // purpose(유형: 캐릭터/배경/캐릭터시트)는 BE 응답에 해당 데이터가 없어 재편집 시 복원하지 않고
  // 항상 기본값(첫 번째 탭)으로 시작한다. BE에 purpose 노출 요청 필요, 노출되면 복원 로직 추가.
  const {
    prompt,
    purpose,
    correction,
    references,
    setPrompt,
    setPurpose,
    setCorrection,
    addReference,
    removeReference,
  } = useImageDraftStore();
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorJobId, setErrorJobId] = useState<number | undefined>(undefined);
  const [selectedArt, setSelectedArt] = useState<Artwork | null>(null);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [characterAttributes, setCharacterAttributes] = useState<CharacterSheetFormData>(
    DEFAULT_CHARACTER_SHEET_FORM_DATA
  );

  useEffect(() => {
    if (!editArt) return;

    // art.ratio/quality는 DetailModal 표시용(픽셀 해상도 포함/축약 라벨)이라 옵션 목록과 그대로
    // 매칭되지 않는다. BE 원본 값(aspectRatioRaw/qualityRaw)을 옵션이 실제 검증에 쓰는 형태로
    // 역변환해 일치하는 옵션을 찾아 복원한다. 일치하는 옵션이 없으면 기본값을 그대로 둔다.
    const ratioOption = findOptionForRestore(RATIO_OPTIONS, editArt.aspectRatioRaw, (opt) => opt);
    if (ratioOption) setRatio(ratioOption);

    const qualityOption = findOptionForRestore(IMAGE_QUALITIES, editArt.qualityRaw, mapQualityToBE);
    if (qualityOption) setQuality(qualityOption);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- editArt로 재편집 진입 시에만 실행
  }, [editArt?.id]);

  useEffect(() => {
    // editArt(재편집) 또는 initialPrompt(홈에서 프롬프트를 들고 진입)로 들어온 경우에만 draft의
    // prompt를 덮어쓴다. 뒤로가기 등 순수 네비게이션으로는 이 effect가 재실행되지 않아 기존
    // draft가 유지된다.
    const nextPrompt = editArt?.prompt ?? initialPrompt;
    if (nextPrompt !== undefined) setPrompt(nextPrompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- editArt/initialPrompt로 진입 시에만 실행
  }, [editArt?.id, initialPrompt]);

  useEffect(() => {
    let cancelled = false;

    fetchActiveImageJob().then((activeJob) => {
      if (!activeJob || cancelled) return;

      setIsLoading(true);
      setError(null);
      setErrorJobId(undefined);

      resumeImageJob(activeJob.jobId, activeJob.prompt)
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
            setError('이미지 생성에 실패했어요. 다시 시도해주세요.');
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

  useRevokeObjectUrls(results.flatMap((result) => result.images.map((image) => image.url)));
  const referencePreviewUrls = useObjectUrls(references);

  const handleAddReference = async (file: File) => {
    const validation = await validateImageFile(file, REFERENCE_IMAGE_MAX_MB);
    if (!validation.valid) {
      setError(validation.reason);
      return;
    }
    setError(null);
    if (references.length >= MAX_REFERENCES) return;
    addReference(file);
  };

  const handleRemoveReference = (index: number) => {
    removeReference(index);
  };

  const hasSavedCharacterInfo = hasSavedCharacterAttributes(characterAttributes);

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;

    if (!isAuthenticated) {
      confirmLogin(navigate);
      return;
    }

    setIsLoading(true);
    setError(null);
    setErrorJobId(undefined);

    try {
      const result =
        purpose === '캐릭터시트'
          ? await characterConceptSheet(
              hasSavedCharacterInfo
                ? { ...characterAttributes, additionalPrompt: prompt.trim() }
                : {
                    gender: undefined,
                    ageGroup: undefined,
                    bodyType: undefined,
                    style: undefined,
                    worldSetting: undefined,
                    hairLength: undefined,
                    hairStyle: undefined,
                    hairColor: undefined,
                    expression: undefined,
                    eyeColor: undefined,
                    eyeCharacteristic: undefined,
                    outfitGenre: undefined,
                    outfitColor: undefined,
                    accessories: undefined,
                    additionalPrompt: prompt.trim(),
                  },
              { model, ratio, quality, quantity },
              references
            )
          : await generateImage(
              prompt.trim(),
              { model, ratio, quality, quantity },
              { purpose, promptCorrectionEnabled: correction, references }
            );
      setResults((prev) => [result, ...prev]);
    } catch (err) {
      if (err instanceof JobFailedError) {
        setError(err.message);
        setErrorJobId(err.jobId);
      } else {
        setError(
          purpose === '캐릭터시트'
            ? '캐릭터 생성에 실패했어요. 다시 시도해주세요.'
            : '이미지 생성에 실패했어요. 다시 시도해주세요.'
        );
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
        className="flex w-[300px] shrink-0 flex-col gap-8 overflow-y-auto p-6"
        style={{ borderRadius: 0 }}
      >
        <ModeTabs variant="image" />
        <SettingSection title="모델">
          <ModelField name={model} />
        </SettingSection>
        <SettingSection title="유형">
          <PurposeTabs tabs={PURPOSE_TABS} value={purpose} onChange={setPurpose} />
        </SettingSection>
        {purpose === '캐릭터시트' && (
          <div className="flex flex-col gap-4">
            <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <button
              type="button"
              onClick={() => setIsCharacterModalOpen(true)}
              className="flex items-center justify-center gap-1 rounded-[12px] py-3 transition-colors hover:bg-surface-2"
              style={{
                background: hasSavedCharacterInfo ? 'rgba(240,165,255,0.2)' : 'var(--surface-3)',
                border: `1px solid ${hasSavedCharacterInfo ? 'var(--primary-300)' : 'rgba(255,255,255,0.15)'}`,
                color: 'var(--primary-100)',
                fontFamily: 'var(--font-sans)',
                fontSize: 16,
                fontWeight: 500,
                lineHeight: '24px',
              }}
            >
              {hasSavedCharacterInfo ? (
                <Check size={20} strokeWidth={2} />
              ) : (
                <Plus size={20} strokeWidth={2} />
              )}
              {hasSavedCharacterInfo ? '캐릭터 정보 저장됨 · 수정하기' : '캐릭터 만들기'}
            </button>
            <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>
        )}
        <PanelSelect label="비율" value={ratio} options={RATIO_OPTIONS} onChange={setRatio} />
        <PanelSelect label="품질" value={quality} options={IMAGE_QUALITIES} onChange={setQuality} />
        <div className="flex items-center justify-between">
          <span className="text-[14px] leading-[20px] text-content-secondary">수량</span>
          <QuantityStepper
            value={quantity}
            min={MIN_QUANTITY}
            max={MAX_QUANTITY}
            onChange={setQuantity}
          />
        </div>
        <ReferenceGrid
          layout="row"
          slots={Array.from(
            { length: Math.max(4, Math.min(references.length + 1, MAX_REFERENCES)) },
            () => '레퍼런스 추가'
          )}
          used={references.length}
          max={MAX_REFERENCES}
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
          chips={[
            { label: model, noArrow: true },
            quality,
            ratio.split(' · ')[0],
            `× ${quantity}장`,
          ]}
          correction={correction}
          onCorrectionChange={setCorrection}
          onGenerate={handleGenerate}
          placeholder="생성하고 싶은 이미지를 설명해주세요"
        />

        {error && <ErrorMessage message={error} jobId={errorJobId} onRetry={handleGenerate} />}

        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-3 py-4">
            <LoadingSpinner size="md" />
            <p className="text-body text-content-secondary">
              이미지 생성 중이에요. 시간이 조금 소요될 수 있어요. 조금만 기다려 주세요.
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
        initialData={characterAttributes}
        onSave={(data) => {
          setCharacterAttributes(data);
          setIsCharacterModalOpen(false);
        }}
      />
    </div>
  );
}
