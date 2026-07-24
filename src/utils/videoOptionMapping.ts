import type { VideoGenerationOptions } from '../types/generation';
import { VIDEO_LENGTHS } from '../constants/mockData';
import {
  KLING_REFERENCE_TO_VIDEO,
  SEEDANCE_REFERENCE_TO_VIDEO,
  type VideoValidationInput,
} from './videoOptionValidator';

const MODEL_TO_MODEL_ID: Record<string, string> = {
  'Kling 3.0': KLING_REFERENCE_TO_VIDEO,
  'seedance 2.0': SEEDANCE_REFERENCE_TO_VIDEO,
};

const LENGTH_TO_DURATION: Record<string, string> = {
  '3초': '3',
  '4초': '4',
  '5초': '5',
  '8초': '8',
  '10초': '10',
  '15초': '15',
  '자동': 'auto',
};

const QUALITY_TO_RESOLUTION: Record<string, string> = {
  '고화질 1920×1080': '1080p',
  '표준 1280×720': '720p',
  '480p': '480p',
  '4K': '4k',
};

const RATIO_TO_ASPECT_RATIO: Record<string, string> = {
  '16:9 · 1376×768': '16:9',
  '9:16 · 768×1376': '9:16',
  '1:1 · 1024×1024': '1:1',
  '21:9': '21:9',
  '4:3': '4:3',
  '3:4': '3:4',
  '자동': 'auto',
};

export interface VideoModelCapability {
  requiresReferenceImages: boolean;
  supportsReferenceImages: boolean;
  supportsStartImage: boolean;
  requiresAtLeastOneImage: boolean;
  ratioOptions: string[];
  qualityOptions: string[];
}

const MODEL_CAPABILITIES: Record<string, VideoModelCapability> = {
  [KLING_REFERENCE_TO_VIDEO]: {
    requiresReferenceImages: true,
    supportsReferenceImages: true,
    supportsStartImage: true,
    requiresAtLeastOneImage: true,
    ratioOptions: ['16:9 · 1376×768', '9:16 · 768×1376', '1:1 · 1024×1024'],
    qualityOptions: [],
  },
  [SEEDANCE_REFERENCE_TO_VIDEO]: {
    requiresReferenceImages: true,
    supportsReferenceImages: true,
    supportsStartImage: false,
    requiresAtLeastOneImage: false,
    ratioOptions: [
      '16:9 · 1376×768',
      '9:16 · 768×1376',
      '1:1 · 1024×1024',
      '21:9',
      '4:3',
      '3:4',
      '자동',
    ],
    qualityOptions: ['고화질 1920×1080', '표준 1280×720', '480p', '4K'],
  },
};

export function mapModelToModelId(model: string): string {
  return MODEL_TO_MODEL_ID[model] ?? model;
}

export function mapLengthToDuration(length: string): string {
  return LENGTH_TO_DURATION[length] ?? length;
}

export function mapRatioToAspectRatio(ratio: string): string {
  return RATIO_TO_ASPECT_RATIO[ratio] ?? ratio;
}

export function mapQualityToResolution(quality: string): string {
  return QUALITY_TO_RESOLUTION[quality];
}

export function getVideoModelCapability(model: string): VideoModelCapability {
  const modelId = mapModelToModelId(model);
  return MODEL_CAPABILITIES[modelId] ?? MODEL_CAPABILITIES[KLING_REFERENCE_TO_VIDEO];
}

/** 모델(Kling/Seedance)에 따라 선택 가능한 길이 옵션만 필터링 (Seedance는 4초 미만 불가) */
export function getAvailableLengths(model: string): string[] {
  const modelId = mapModelToModelId(model);
  if (modelId === SEEDANCE_REFERENCE_TO_VIDEO) {
    return VIDEO_LENGTHS.filter((length) => length !== '3초');
  }
  return VIDEO_LENGTHS.filter((length) => length !== '자동');
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
    aspectRatio:
      capability.ratioOptions.length > 0 ? mapRatioToAspectRatio(options.ratio) : undefined,
    resolution:
      capability.qualityOptions.length > 0 ? mapQualityToResolution(options.quality) : undefined,
    // shotType/bitrateMode/multiPrompt: 현재 UI에 입력 수단이 없어 전달하지 않음
  };
}
