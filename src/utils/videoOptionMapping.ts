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

export function mapModelToModelId(model: string): string {
  return MODEL_TO_MODEL_ID[model] ?? model;
}

export function mapLengthToDuration(length: string): string {
  return LENGTH_TO_DURATION[length] ?? length;
}

export function mapRatioToAspectRatio(ratio: string): string {
  return ratio.split(' · ')[0].trim();
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
  return {
    prompt,
    modelId: mapModelToModelId(options.model),
    duration: mapLengthToDuration(options.length),
    aspectRatio: mapRatioToAspectRatio(options.ratio),
    // resolution/shotType/bitrateMode/multiPrompt: 현재 UI에 입력 수단이 없어 전달하지 않음
  };
}
