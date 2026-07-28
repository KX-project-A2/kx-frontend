import axios from 'axios';
import axiosInstance from './axiosInstance';
import { pollJob } from '../utils/pollJob';
import type { ApiResponse } from '../types/api';
import type { GenerationOptions, GenerationResult } from '../types/generation';

interface GenerateImageJob {
  jobId: number;
  type: string;
  status: string;
  batchId: string;
  prompt: string;
  imageCount: number;
  size: string;
  quality: string;
  resultMediaFileId: number | null;
  resultFilePath: string | null;
  resultImages: { mediaFileId: number; filePath: string }[];
  errorMessage: string | null;
  createdAt: string;
  submittedAt: string;
  completedAt: string | null;
}

/** GPT Image는 정사각/가로/세로 3가지 픽셀 크기만 지원. 1536×864와 864×1536은 정확한
 * 16:9·9:16 비율이라 라벨도 그에 맞춘다. */
const RATIO_TO_SIZE: Record<string, string> = {
  '1:1': '1024x1024',
  '16:9': '1536x864',
  '9:16': '864x1536',
};

const QUALITY_TO_BE: Record<string, string> = {
  '표준(Standard)': 'standard',
  '4K': 'high',
};

const PURPOSE_TO_BE: Record<string, string> = {
  캐릭터: 'CHARACTER',
  배경: 'BACKGROUND',
};

export function mapRatioToSize(ratio: string): string {
  return RATIO_TO_SIZE[ratio];
}

export function mapQualityToBE(quality: string): string {
  return QUALITY_TO_BE[quality];
}

export function mapPurposeToBE(purpose: string): string {
  return PURPOSE_TO_BE[purpose];
}

export async function fetchImageBlobUrl(mediaFileId: number): Promise<string> {
  try {
    const response = await axiosInstance.get<Blob>(`/api/media/images/${mediaFileId}/download`, {
      responseType: 'blob',
    });
    return URL.createObjectURL(response.data);
  } catch (error) {
    // TODO: 디버깅용 임시 코드 - 원인 파악 후 제거
    if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
      const errorText = await error.response.data.text();
      console.log('[fetchImageBlobUrl] error response body', errorText);
    }
    throw error;
  }
}

async function pollImageJobToResult(jobId: number, prompt: string): Promise<GenerationResult> {
  const resultImages = await pollJob<{ mediaFileId: number; filePath: string }[]>(
    async () => {
      const statusResponse = await axiosInstance.get<ApiResponse<GenerateImageJob>>(
        `/api/generate/images/jobs/${jobId}`
      );

      console.log(
        '[pollImageJobToResult] job status response',
        JSON.stringify(statusResponse.data, null, 2)
      );
      const { status, resultImages, errorMessage } = statusResponse.data.data;

      return { status, data: resultImages, errorMessage: errorMessage ?? undefined };
    },
    { intervalMs: 5000, timeoutMs: 900000, jobId }
  );

  const images = await Promise.all(
    resultImages.map(async (image) => ({
      url: await fetchImageBlobUrl(image.mediaFileId),
      mediaFileId: image.mediaFileId,
    }))
  );

  return {
    id: String(jobId),
    prompt,
    images,
    createdAt: new Date().toISOString(),
  };
}

export async function generateImage(
  prompt: string,
  options: GenerationOptions,
  extra: { purpose: string; promptCorrectionEnabled: boolean; references?: File[] }
): Promise<GenerationResult> {
  const requestBody = {
    prompt,
    purpose: mapPurposeToBE(extra.purpose),
    imageCount: options.quantity,
    size: mapRatioToSize(options.ratio),
    quality: mapQualityToBE(options.quality),
    promptCorrectionEnabled: extra.promptCorrectionEnabled,
  };

  const formData = new FormData();
  formData.append('request', new Blob([JSON.stringify(requestBody)], { type: 'application/json' }));
  extra.references?.forEach((file) => {
    formData.append('references', file);
  });

  console.log('[generateImage] request body', requestBody);
  const createResponse = await axiosInstance.post<ApiResponse<GenerateImageJob>>(
    '/api/generate/images',
    formData,
    {
      headers: { 'Content-Type': undefined },
      timeout: 60000,
    }
  );

  console.log('[generateImage] create response', JSON.stringify(createResponse.data, null, 2));
  const { jobId } = createResponse.data.data;

  return pollImageJobToResult(jobId, prompt);
}

export async function fetchActiveImageJob(): Promise<{ jobId: number; prompt: string } | null> {
  const response = await axiosInstance.get<ApiResponse<{ jobId: number; prompt: string }[]>>(
    '/api/generate/images/jobs/active'
  );
  const jobs = response.data.data;
  if (jobs.length === 0) return null;

  const { jobId, prompt } = jobs[0];
  return { jobId, prompt };
}

export async function resumeImageJob(jobId: number, prompt: string): Promise<GenerationResult> {
  return pollImageJobToResult(jobId, prompt);
}

export async function characterConceptSheet(
  data: {
    gender?: string;
    ageGroup?: string;
    bodyType?: string;
    style?: string;
    worldSetting?: string;
    hairLength?: string;
    hairStyle?: string;
    hairColor?: string;
    expression?: string;
    eyeColor?: string;
    eyeCharacteristic?: string;
    outfitGenre?: string;
    outfitColor?: string;
    accessories?: string[];
    additionalPrompt: string;
  },
  options: GenerationOptions,
  references?: File[]
): Promise<GenerationResult> {
  const requestBody = {
    gender: data.gender,
    age: data.ageGroup,
    bodyType: data.bodyType,
    artStyle: data.style,
    worldView: data.worldSetting,
    hairLength: data.hairLength,
    hairStyle: data.hairStyle,
    hairColor: data.hairColor,
    eyeColor: data.eyeColor,
    eyeCharacteristic: data.eyeCharacteristic,
    expression: data.expression,
    outfitGenre: data.outfitGenre,
    outfitColor: data.outfitColor,
    accessories: data.accessories,
    additionalPrompt: data.additionalPrompt,
    imageCount: options.quantity,
    size: mapRatioToSize(options.ratio),
    quality: mapQualityToBE(options.quality),
  };

  const formData = new FormData();
  formData.append('request', new Blob([JSON.stringify(requestBody)], { type: 'application/json' }));
  references?.forEach((file) => {
    formData.append('references', file);
  });

  console.log('[characterConceptSheet] request body', requestBody);
  const createResponse = await axiosInstance.post<ApiResponse<GenerateImageJob>>(
    '/api/generate/images/character-concept-sheet',
    formData,
    { headers: { 'Content-Type': undefined }, timeout: 60000 }
  );

  console.log(
    '[characterConceptSheet] create response',
    JSON.stringify(createResponse.data, null, 2)
  );
  const { jobId } = createResponse.data.data;

  const job = await pollJob<GenerateImageJob>(
    async () => {
      const statusResponse = await axiosInstance.get<ApiResponse<GenerateImageJob>>(
        `/api/generate/images/jobs/${jobId}`
      );

      console.log(
        '[characterConceptSheet] job status response',
        JSON.stringify(statusResponse.data, null, 2)
      );
      const { status, errorMessage } = statusResponse.data.data;

      return { status, data: statusResponse.data.data, errorMessage: errorMessage ?? undefined };
    },
    { intervalMs: 5000, timeoutMs: 900000, jobId }
  );

  const images = await Promise.all(
    job.resultImages.map(async (image) => ({
      url: await fetchImageBlobUrl(image.mediaFileId),
      mediaFileId: image.mediaFileId,
    }))
  );

  return {
    id: String(jobId),
    prompt: job.prompt,
    images,
    createdAt: new Date().toISOString(),
  };
}
