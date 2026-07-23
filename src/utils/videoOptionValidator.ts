export const KLING_IMAGE_TO_VIDEO = 'fal-ai/kling-video/o3/standard/image-to-video';
export const KLING_REFERENCE_TO_VIDEO = 'fal-ai/kling-video/o3/standard/reference-to-video';
export const KLING_TURBO_PRO_IMAGE_TO_VIDEO = 'fal-ai/kling-video/v3/turbo/pro/image-to-video';
export const SEEDANCE_REFERENCE_TO_VIDEO = 'bytedance/seedance-2.0/reference-to-video';

const ALLOWED_MODEL_IDS = [
  KLING_IMAGE_TO_VIDEO,
  KLING_REFERENCE_TO_VIDEO,
  KLING_TURBO_PRO_IMAGE_TO_VIDEO,
  SEEDANCE_REFERENCE_TO_VIDEO,
];

export interface MultiPromptItem {
  prompt: string;
  duration: number;
}

export interface VideoValidationInput {
  prompt?: string;
  multiPrompt?: MultiPromptItem[];
  modelId: string;
  duration?: string;
  aspectRatio?: string;
  resolution?: string;
  shotType?: string;
  bitrateMode?: string;
}

function isIntStringInRange(value: string, min: number, max: number): boolean {
  if (!/^\d+$/.test(value)) return false;
  const n = Number(value);
  return n >= min && n <= max;
}

export function validateVideoOptions(input: VideoValidationInput): string | null {
  const hasPrompt = !!input.prompt?.trim();
  const hasMultiPrompt = !!input.multiPrompt?.length;

  if (hasPrompt === hasMultiPrompt) {
    return hasPrompt
      ? 'prompt와 multi_prompt는 동시에 사용할 수 없어요.'
      : '프롬프트를 입력해주세요.';
  }

  if (!ALLOWED_MODEL_IDS.includes(input.modelId)) {
    return '지원하지 않는 모델이에요.';
  }

  const isKling = input.modelId.startsWith('fal-ai/kling-video');
  const isSeedance = input.modelId === SEEDANCE_REFERENCE_TO_VIDEO;

  if (hasMultiPrompt) {
    if (input.modelId !== KLING_TURBO_PRO_IMAGE_TO_VIDEO) {
      return 'multi_prompt는 Kling v3 turbo pro 모델에서만 사용할 수 있어요.';
    }
    const items = input.multiPrompt!;
    if (items.length < 1 || items.length > 6) {
      return 'multi_prompt는 1~6개 항목만 가능해요.';
    }
    if (items.some((it) => !it.prompt.trim())) {
      return 'multi_prompt 각 항목에 프롬프트가 필요해요.';
    }
    if (items.some((it) => !Number.isInteger(it.duration) || it.duration < 1 || it.duration > 15)) {
      return 'multi_prompt 각 항목의 duration은 1~15 사이 정수여야 해요.';
    }
    if (items.reduce((sum, it) => sum + it.duration, 0) > 15) {
      return 'multi_prompt duration 합계는 15초를 넘을 수 없어요.';
    }
  }

  if (input.duration !== undefined) {
    if (isKling && !isIntStringInRange(input.duration, 3, 15)) {
      return 'Kling 모델의 길이는 3~15초 사이여야 해요.';
    }
    if (isSeedance && input.duration !== 'auto' && !isIntStringInRange(input.duration, 4, 15)) {
      return 'Seedance 모델의 길이는 "auto" 또는 4~15초 사이여야 해요.';
    }
  }

  if (input.aspectRatio !== undefined) {
    if (
      input.modelId === KLING_REFERENCE_TO_VIDEO &&
      !['16:9', '9:16', '1:1'].includes(input.aspectRatio)
    ) {
      return 'Kling reference-to-video의 비율은 16:9, 9:16, 1:1 중 하나여야 해요.';
    }
    if (
      isSeedance &&
      !['auto', '21:9', '16:9', '4:3', '1:1', '3:4', '9:16'].includes(input.aspectRatio)
    ) {
      return 'Seedance의 비율 값이 올바르지 않아요.';
    }
    // Kling image-to-video(standard/turbo pro)의 aspect_ratio 허용값은 확정 스펙에 없어 검증 생략
  }

  if (
    isSeedance &&
    input.resolution !== undefined &&
    !['480p', '720p', '1080p', '4k'].includes(input.resolution)
  ) {
    return 'Seedance의 해상도는 480p/720p/1080p/4k 중 하나여야 해요.';
  }

  if (input.shotType !== undefined && !['customize', 'intelligent'].includes(input.shotType)) {
    return 'shot_type 값이 올바르지 않아요.';
  }

  if (input.bitrateMode !== undefined && !['standard', 'high'].includes(input.bitrateMode)) {
    return 'bitrate_mode 값이 올바르지 않아요.';
  }

  return null;
}
