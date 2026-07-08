import { useState } from 'react';
import Button from '@/components/common/Button';
import PromptInput from '@/components/common/PromptInput';

interface GenerationInputAreaProps {
  onGenerate: (prompt: string) => void;
  disabled?: boolean;
}

export default function GenerationInputArea({
  onGenerate,
  disabled = false,
}: GenerationInputAreaProps) {
  const [prompt, setPrompt] = useState('');

  const canGenerate = !disabled && prompt.trim().length > 0;

  const handleGenerate = () => {
    if (!canGenerate) return;
    onGenerate(prompt.trim());
  };

  return (
    <div className="flex flex-col gap-3">
      <PromptInput
        value={prompt}
        onChange={setPrompt}
        onSubmit={handleGenerate}
        placeholder="생성하고 싶은 이미지를 설명해주세요"
        disabled={disabled}
      />
      <Button
        label={disabled ? '생성 중...' : '이미지 생성'}
        onClick={handleGenerate}
        disabled={!canGenerate}
        className="self-end rounded-[var(--radius-btn)] bg-gradient-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:bg-surface-3 disabled:text-content-muted disabled:opacity-100"
      />
    </div>
  );
}
