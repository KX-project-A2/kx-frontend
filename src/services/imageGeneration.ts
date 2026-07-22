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

const RATIO_TO_SIZE: Record<string, string> = {
  '1:1': '1024x1024',
  '4:3': '1536x1024',
  '3:4': '1024x1536',
  '16:9': '1792x1024',
  '9:16': '1024x1792',
};

const QUALITY_TO_BE: Record<string, string> = {
  '2K': 'medium',
  '4K': 'high',
};

export function mapRatioToSize(ratio: string): string {
  return RATIO_TO_SIZE[ratio];
}

export function mapQualityToBE(quality: string): string {
  return QUALITY_TO_BE[quality];
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

export async function generateImage(
  prompt: string,
  options: GenerationOptions
): Promise<GenerationResult> {
  const requestBody = {
    prompt,
    type: 'TEXT_TO_IMAGE',
    imageCount: options.quantity,
    size: mapRatioToSize(options.ratio),
    quality: mapQualityToBE(options.quality),
  };

  console.log('[generateImage] request body', requestBody);
  const createResponse = await axiosInstance.post<ApiResponse<GenerateImageJob>>(
    '/api/generate/images',
    requestBody
  );

  console.log('[generateImage] create response', JSON.stringify(createResponse.data, null, 2));
  const { jobId } = createResponse.data.data;

  const resultImages = await pollJob<{ mediaFileId: number; filePath: string }[]>(async () => {
    const statusResponse = await axiosInstance.get<ApiResponse<GenerateImageJob>>(
      `/api/generate/images/jobs/${jobId}`
    );

    console.log('[generateImage] job status response', JSON.stringify(statusResponse.data, null, 2));
    const { status, resultImages } = statusResponse.data.data;

    return { status, data: resultImages };
  }, { intervalMs: 5000, timeoutMs: 900000 });

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
