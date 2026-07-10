import type { GenerationOptions, GenerationResult } from '@/types/generation';
import { ME, type Artwork, type GenGroup } from '@/constants/mockData';

/** "16:9 · 1376×768" 또는 "16:9" 형태의 비율 문자열을 숫자 종횡비로 변환 (예: "1:1" → 1) */
function parseAspect(ratio: string): number {
  const [w, h] = ratio.split('·')[0].trim().split(':').map(Number);
  return w && h ? w / h : 1;
}

/** GenerationResult(생성 API 응답)를 GenGroup(이미지 생성 화면 표시용)으로 변환 */
export function toGenGroup(result: GenerationResult, options: GenerationOptions): GenGroup {
  const aspect = parseAspect(options.ratio);

  const items: Artwork[] = result.images.map((image, index) => ({
    id: `${result.id}-${index}`,
    type: 'image',
    url: image.url,
    thumb: image.url,
    prompt: result.prompt,
    creator: ME,
    likes: 0,
    liked: false,
    model: options.model,
    quality: options.quality,
    ratio: options.ratio,
    createdAt: result.createdAt,
    aspect,
  }));

  return {
    prompt: result.prompt,
    items,
  };
}
