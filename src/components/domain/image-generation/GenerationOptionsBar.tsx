import { useGenerationOptionsStore } from '@/hooks/useGenerationOptionsStore';

const RATIO_OPTIONS = ['1:1', '4:3', '3:4', '16:9', '9:16'];
const QUALITY_OPTIONS = ['2K', '4K'];
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 4;

export default function GenerationOptionsBar() {
  const { ratio, quality, quantity, setRatio, setQuality, setQuantity } =
    useGenerationOptionsStore();

  const decreaseQuantity = () => setQuantity(Math.max(MIN_QUANTITY, quantity - 1));
  const increaseQuantity = () => setQuantity(Math.min(MAX_QUANTITY, quantity + 1));

  return (
    <div className="flex flex-wrap items-center gap-4">
      <label className="flex items-center gap-2 text-sm text-content-secondary">
        비율
        <select
          value={ratio}
          onChange={(e) => setRatio(e.target.value)}
          className="rounded-[var(--radius-btn)] border border-stroke-soft bg-surface-1 px-2 py-1.5 text-sm text-content"
        >
          {RATIO_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm text-content-secondary">
        품질
        <select
          value={quality}
          onChange={(e) => setQuality(e.target.value)}
          className="rounded-[var(--radius-btn)] border border-stroke-soft bg-surface-1 px-2 py-1.5 text-sm text-content"
        >
          {QUALITY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-center gap-2 text-sm text-content-secondary">
        수량
        <div className="flex items-center rounded-[var(--radius-btn)] border border-stroke-soft bg-surface-1">
          <button
            type="button"
            onClick={decreaseQuantity}
            disabled={quantity <= MIN_QUANTITY}
            aria-label="수량 감소"
            className="px-2 py-1 text-content-secondary hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            −
          </button>
          <span className="w-6 text-center text-content">{quantity}</span>
          <button
            type="button"
            onClick={increaseQuantity}
            disabled={quantity >= MAX_QUANTITY}
            aria-label="수량 증가"
            className="px-2 py-1 text-content-secondary hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
