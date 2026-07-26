import { useEffect, useRef, useState } from 'react';
import { Copy, MoreVertical } from 'lucide-react';
import {
  ModeTabs,
  ModelField,
  PanelSelect,
  ReferenceGrid,
  SettingSection,
} from '@/components/domain/image-generation/GenParts';
import { Button, Chip, Panel, Select } from '@/components/common/ui';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import EmptyState from '@/components/common/EmptyState';
import { useObjectUrls } from '@/hooks/useObjectUrls';
import { useRevokeObjectUrls } from '@/hooks/useRevokeObjectUrls';
<<<<<<< HEAD
import {
  extractReversePrompt,
  regenerateFromReversePrompt,
  updateReversePrompt,
} from '@/services/reversePrompt';
import { validateImageFile } from '@/utils/validateImageFile';
import { JobFailedError } from '@/utils/pollJob';

const RATIO_OPTIONS = ['auto', '1:1', '16:9', '9:16'];
const REFERENCE_IMAGE_MAX_MB = 10;
const PURPOSE_OPTIONS: { id: 'CHARACTER' | 'BACKGROUND'; label: string }[] = [
  { id: 'CHARACTER', label: '캐릭터' },
  { id: 'BACKGROUND', label: '배경' },
];
=======
import { extractReversePrompt } from '@/services/reversePrompt';
import { validateImageFile } from '@/utils/validateImageFile';

const RATIO_OPTIONS = ['auto', '1:1', '16:9', '9:16'];
const REFERENCE_IMAGE_MAX_MB = 10;
>>>>>>> main

interface ReversePromptItem {
  id: number;
  prompt: string;
  aspectRatio: string;
  mediaFileId: number;
  imageUrl: string;
}

function PromptCard({
  item,
  onUpdate,
}: {
  item: ReversePromptItem;
  onUpdate: (id: number, updates: { prompt: string; aspectRatio: string }) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mode, setMode] = useState<'view' | 'edit' | 'generate'>('view');
  const menuRef = useRef<HTMLDivElement>(null);

  const [editPrompt, setEditPrompt] = useState(item.prompt);
  const [editAspectRatio, setEditAspectRatio] = useState(item.aspectRatio);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [purpose, setPurpose] = useState<'CHARACTER' | 'BACKGROUND'>('CHARACTER');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<{ mediaFileId: number; url: string }[]>(
    []
  );

  useRevokeObjectUrls(generatedImages.map((image) => image.url));

  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [menuOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleStartEdit = () => {
    setEditPrompt(item.prompt);
    setEditAspectRatio(item.aspectRatio);
    setEditError(null);
    setMode('edit');
    setMenuOpen(false);
  };

  const handleStartGenerate = () => {
    setPurpose('CHARACTER');
    setGenerateError(null);
    setGeneratedImages([]);
    setMode('generate');
    setMenuOpen(false);
  };

  const handleSaveEdit = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setEditError(null);

    try {
      const updated = await updateReversePrompt(item.id, {
        prompt: editPrompt,
        aspectRatio: editAspectRatio,
      });
      onUpdate(item.id, { prompt: updated.prompt, aspectRatio: updated.aspectRatio });
      setMode('view');
    } catch {
      setEditError('수정에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateImage = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGenerateError(null);

    try {
      const result = await regenerateFromReversePrompt(item.id, purpose, item.aspectRatio);
      setGeneratedImages(result.images);
    } catch (err) {
      setGenerateError(
        err instanceof JobFailedError ? err.message : '이미지 생성에 실패했어요. 다시 시도해주세요.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Panel level={2} className="flex flex-col gap-4 p-4">
      <div className="flex gap-4">
        <img
          src={item.imageUrl}
          alt="프롬프트 이미지"
          className="h-28 w-28 shrink-0 rounded-[12px] object-cover"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <img
                src={item.imageUrl}
                alt=""
                className="h-6 w-6 shrink-0 rounded-full object-cover"
              />
              <span className="truncate text-body-medium text-content">Generated Prompt</span>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={handleCopy}
                aria-label="복사"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-content-secondary transition-colors hover:bg-surface-3 hover:text-content"
              >
                <Copy size={14} strokeWidth={2} />
              </button>
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-label="더보기"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-content-secondary transition-colors hover:bg-surface-3 hover:text-content"
                >
                  <MoreVertical size={14} strokeWidth={2} />
                </button>
                {menuOpen && (
                  <div
                    className="absolute right-0 top-8 z-20 w-48 overflow-hidden rounded-field p-1 shadow-xl"
                    style={{
                      background: 'var(--surface-3)',
                      border: '1px solid var(--stroke-strong)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className="flex w-full items-center rounded-lg px-2.5 py-2 text-left text-caption text-content-secondary hover:bg-surface-2 hover:text-content"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={handleStartGenerate}
                      className="flex w-full items-center rounded-lg px-2.5 py-2 text-left text-caption text-content-secondary hover:bg-surface-2 hover:text-content"
                    >
                      이 프롬프트로 이미지 생성
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {mode === 'edit' ? (
            <div className="flex flex-col gap-3">
              <textarea
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-field p-3 text-body text-content outline-none"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--stroke-strong)' }}
              />
              <Select
                label="비율"
                value={editAspectRatio}
                options={RATIO_OPTIONS}
                onChange={setEditAspectRatio}
              />
              {editError && <span className="text-caption text-danger">{editError}</span>}
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveEdit} disabled={isSaving}>
                  {isSaving ? <LoadingSpinner size="sm" /> : '저장'}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setMode('view')}
                  disabled={isSaving}
                >
                  취소
                </Button>
              </div>
            </div>
          ) : (
            <p className="max-h-40 overflow-y-auto whitespace-pre-wrap text-body text-content-secondary">
              {item.prompt}
            </p>
          )}
          {copied && <span className="text-caption text-brand-light">복사됨</span>}
        </div>
      </div>

      {mode === 'generate' && (
        <div
          className="flex flex-col gap-3 pt-3"
          style={{ borderTop: '1px solid var(--stroke-soft)' }}
        >
          <div className="flex items-center gap-2">
            {PURPOSE_OPTIONS.map((option) => (
              <Chip
                key={option.id}
                selected={purpose === option.id}
                onClick={() => setPurpose(option.id)}
              >
                {option.label}
              </Chip>
            ))}
            <Button size="sm" onClick={handleGenerateImage} disabled={isGenerating}>
              {isGenerating ? <LoadingSpinner size="sm" /> : '생성'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setMode('view')}>
              닫기
            </Button>
          </div>

          {generateError && (
            <div className="flex items-center gap-2">
              <span className="text-caption text-danger">{generateError}</span>
              <button
                type="button"
                onClick={handleGenerateImage}
                className="text-caption text-brand-light hover:brightness-110"
              >
                재시도
              </button>
            </div>
          )}

          {generatedImages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {generatedImages.map((image) => (
                <img
                  key={image.mediaFileId}
                  src={image.url}
                  alt="생성된 이미지"
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}

export default function ReversePromptPage() {
  const [aspectRatio, setAspectRatio] = useState(RATIO_OPTIONS[0]);
  const [references, setReferences] = useState<File[]>([]);
  const [results, setResults] = useState<ReversePromptItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const referencePreviewUrls = useObjectUrls(references);
  useRevokeObjectUrls(results.map((r) => r.imageUrl));

  const handleAddReference = async (file: File) => {
    const validation = await validateImageFile(file, REFERENCE_IMAGE_MAX_MB);
    if (!validation.valid) {
      setError(validation.reason);
      return;
    }
    setError(null);
    setReferences([file]);
  };

  const handleRemoveReference = () => {
    setReferences([]);
  };

  const handleUpdateItem = (id: number, updates: { prompt: string; aspectRatio: string }) => {
    setResults((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const handleGenerate = async () => {
    const file = references[0];
    if (!file || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await extractReversePrompt(file, aspectRatio);
      const imageUrl = URL.createObjectURL(file);
      setResults((prev) => [{ ...result, imageUrl }, ...prev]);
    } catch {
      setError('프롬프트 생성에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
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
          <ModelField name="Claude Sonnet 5" />
        </SettingSection>
        <PanelSelect
          label="비율"
          value={aspectRatio}
          options={RATIO_OPTIONS}
          onChange={setAspectRatio}
        />
        <ReferenceGrid
          layout="row"
          label="프롬프트 이미지"
          slots={['프롬프트 이미지 추가']}
          used={references.length}
          max={1}
          images={referencePreviewUrls}
          onAdd={handleAddReference}
          onRemove={handleRemoveReference}
          containerClassName="grid grid-cols-1 gap-2"
        />
        <Button block onClick={handleGenerate} disabled={references.length === 0 || isLoading}>
          프롬프트 생성
        </Button>
      </Panel>

      {/* main area */}
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-8 py-8">
        <h1 className="text-title text-content">제안된 프롬프트</h1>

        {error && <ErrorMessage message={error} onRetry={handleGenerate} />}

        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-3 py-4">
            <LoadingSpinner size="md" />
            <p className="text-body text-content-secondary">프롬프트 생성 중입니다.</p>
          </div>
        )}

        {!error && !isLoading && results.length === 0 && (
          <EmptyState
            message="아직 생성된 프롬프트가 없어요"
            description="이미지를 업로드하고 프롬프트를 생성해보세요"
          />
        )}

        {results.map((item) => (
          <PromptCard key={item.id} item={item} onUpdate={handleUpdateItem} />
        ))}
      </div>
    </div>
  );
}
