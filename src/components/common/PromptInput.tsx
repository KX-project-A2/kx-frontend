import { Send } from 'lucide-react';
import type { KeyboardEvent } from 'react';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

export default function PromptInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  disabled = false,
  maxLength,
}: PromptInputProps) {
  const canSubmit = !disabled && value.trim().length > 0;

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSubmit) {
        onSubmit();
      }
    }
  };

  return (
    <div
      className={`flex items-end gap-2 rounded-2xl border border-gray-300 bg-white p-2 shadow-sm focus-within:border-gray-400 ${
        disabled ? 'opacity-60' : ''
      }`}
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        rows={1}
        className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none disabled:cursor-not-allowed"
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        aria-label="전송"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  );
}
