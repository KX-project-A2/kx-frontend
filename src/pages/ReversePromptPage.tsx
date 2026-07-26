import { useState } from 'react';
import { Copy, MoreVertical } from 'lucide-react';
import {
  ModeTabs,
  ModelField,
  PanelSelect,
  ReferenceGrid,
  SettingSection,
} from '@/components/domain/image-generation/GenParts';
import { Button, Panel } from '@/components/common/ui';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import EmptyState from '@/components/common/EmptyState';
import { useObjectUrls } from '@/hooks/useObjectUrls';
import { useRevokeObjectUrls } from '@/hooks/useRevokeObjectUrls';
import { extractReversePrompt } from '@/services/reversePrompt';

const RATIO_OPTIONS = ['auto', '1:1', '16:9', '9:16'];

interface ReversePromptItem {
  id: number;
  prompt: string;
  aspectRatio: string;
  mediaFileId: number;
  imageUrl: string;
}

function PromptCard({ item }: { item: ReversePromptItem }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Panel level={2} className="flex gap-4 p-4">
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
            <button
              type="button"
              aria-label="더보기"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-content-secondary transition-colors hover:bg-surface-3 hover:text-content"
            >
              <MoreVertical size={14} strokeWidth={2} />
            </button>
          </div>
        </div>
        <p className="max-h-40 overflow-y-auto whitespace-pre-wrap text-body text-content-secondary">
          {item.prompt}
        </p>
        {copied && <span className="text-caption text-brand-light">복사됨</span>}
      </div>
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

  const handleAddReference = (file: File) => {
    setReferences([file]);
  };

  const handleRemoveReference = () => {
    setReferences([]);
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
          <PromptCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
