import type { VideoGenerationOptions } from '../types/generation';
import { VIDEO_LENGTHS } from '../constants/mockData';
import {
  KLING_IMAGE_TO_VIDEO,
  SEEDANCE_REFERENCE_TO_VIDEO,
  type VideoValidationInput,
} from './videoOptionValidator';

// TODO: UI 모델 선택값 ↔ 실제 modelId 매핑 미확정 (image-to-video/reference-to-video, standard/turbo pro 구분 불가)
const MODEL_TO_MODEL_ID: Record<string, string> = {
  'Kling 3.0': KLING_IMAGE_TO_VIDEO,
  'seedance 2.0': SEEDANCE_REFERENCE_TO_VIDEO,
};

const LENGTH_TO_DURATION: Record<string, string> = {
  '3초': '3',
  '4초': '4',
  '5초': '5',
  '8초': '8',
  '10초': '10',
  '15초': '15',
};

const QUALITY_TO_RESOLUTION: Record<string, string> = {
  '고화질 1920×1080': '1080p',
  '표준 1280×720': '720p',
};

export interface VideoModelCapability {
  requiresStartImage: boolean;
  requiresReferenceImages: boolean;
  supportsReferenceImages: boolean;
  supportsRatio: boolean;
  supportsQuality: boolean;
}

const MODEL_CAPABILITIES: Record<string, VideoModelCapability> = {
  [KLING_IMAGE_TO_VIDEO]: {
    requiresStartImage: true,
    requiresReferenceImages: false,
    supportsReferenceImages: false,
    supportsRatio: false,
    supportsQuality: false,
  },
  [SEEDANCE_REFERENCE_TO_VIDEO]: {
    requiresStartImage: false,
    requiresReferenceImages: true,
    supportsReferenceImages: true,
    supportsRatio: true,
    supportsQuality: true,
  },
};

export function mapModelToModelId(model: string): string {
  return MODEL_TO_MODEL_ID[model] ?? model;
}

export function mapLengthToDuration(length: string): string {
  return LENGTH_TO_DURATION[length] ?? length;
}

export function mapRatioToAspectRatio(ratio: string): string {
  return ratio.split(' · ')[0].trim();
}

export function mapQualityToResolution(quality: string): string {
  return QUALITY_TO_RESOLUTION[quality];
}

export function getVideoModelCapability(model: string): VideoModelCapability {
  const modelId = mapModelToModelId(model);
  return MODEL_CAPABILITIES[modelId] ?? MODEL_CAPABILITIES[KLING_IMAGE_TO_VIDEO];
}

/** 모델(Kling/Seedance)에 따라 선택 가능한 길이 옵션만 필터링 (Seedance는 4초 미만 불가) */
export function getAvailableLengths(model: string): string[] {
  const modelId = mapModelToModelId(model);
  if (modelId === SEEDANCE_REFERENCE_TO_VIDEO) {
    return VIDEO_LENGTHS.filter((length) => length !== '3초');
  }
  return VIDEO_LENGTHS;
}

export function toVideoValidationInput(
  prompt: string,
  options: VideoGenerationOptions
): VideoValidationInput {
  const capability = getVideoModelCapability(options.model);

  return {
    prompt,
    modelId: mapModelToModelId(options.model),
    duration: mapLengthToDuration(options.length),
    aspectRatio: capability.supportsRatio ? mapRatioToAspectRatio(options.ratio) : undefined,
    resolution: capability.supportsQuality ? mapQualityToResolution(options.quality) : undefined,
    // shotType/bitrateMode/multiPrompt: 현재 UI에 입력 수단이 없어 전달하지 않음
  };
}
