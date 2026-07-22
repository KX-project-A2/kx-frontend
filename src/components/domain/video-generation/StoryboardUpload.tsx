import { useRef, useState } from 'react';
import { Grid3x3 } from 'lucide-react';

export interface StoryboardImage {
  file: File;
  previewUrl: string;
}

interface StoryboardUploadProps {
  images: StoryboardImage[];
  onChange: (images: StoryboardImage[]) => void;
  maxCount?: number;
}

export function StoryboardUpload({ images, onChange, maxCount = 9 }: StoryboardUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const isFull = images.length >= maxCount;

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    const imagesOnly = files.filter((f) => f.type.startsWith('image/'));
    const remaining = maxCount - images.length;
    const accepted = imagesOnly.slice(0, remaining);

    if (imagesOnly.length < files.length) {
      setError('이미지 파일만 업로드할 수 있어요.');
    } else if (imagesOnly.length > remaining) {
      setError(`최대 ${maxCount}개까지만 업로드할 수 있어요.`);
    } else {
      setError(null);
    }

    if (accepted.length > 0) {
      onChange([
        ...images,
        ...accepted.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
      ]);
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-label text-content-muted">스토리보드 (9컷)</span>
        <span className="font-num text-label text-content-secondary">{images.length}개</span>
      </div>
      <button
        type="button"
        onClick={() => !isFull && inputRef.current?.click()}
        disabled={isFull}
        className={`grid aspect-square grid-cols-3 grid-rows-3 gap-1 rounded-field p-1.5 transition-colors ${
          isFull ? 'cursor-not-allowed opacity-60' : 'hover:border-selected-border'
        }`}
        style={{ background: 'var(--surface-2)', border: '1px dashed var(--stroke-strong)' }}
      >
        {Array.from({ length: maxCount }).map((_, i) => {
          const image = images[i];
          const showHint = !image && i === 4 && images.length === 0;
          return (
            <span
              key={i}
              className="flex items-center justify-center overflow-hidden rounded-sm"
              style={{ background: showHint ? 'var(--selected-bg)' : 'var(--surface-3)' }}
            >
              {image ? (
                <img
                  src={image.previewUrl}
                  alt={`스토리보드 ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                showHint && <Grid3x3 size={14} className="text-brand-light" />
              )}
            </span>
          );
        })}
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      {error && <span className="text-caption text-danger">{error}</span>}
    </div>
  );
}
