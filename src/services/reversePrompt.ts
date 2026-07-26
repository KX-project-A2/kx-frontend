import axiosInstance from './axiosInstance';
import { fetchImageBlobUrl } from './imageGeneration';
import { pollJob } from '../utils/pollJob';
import type { ApiResponse } from '../types/api';

export interface ReversePromptResult {
  id: number;
  prompt: string;
  aspectRatio: string;
  mediaFileId: number;
}

interface GenerateImageJobStatus {
  status: string;
  resultImages: { mediaFileId: number; filePath: string }[];
  errorMessage: string | null;
}

const ASPECT_RATIO_TO_SIZE: Record<string, string> = {
  auto: 'auto',
  '1:1': '1024x1024',
  '16:9': '1536x1024',
  '9:16': '1024x1536',
};

export async function extractReversePrompt(
  image: File,
  aspectRatio: string
): Promise<ReversePromptResult> {
  const requestBody = { aspectRatio };

  const formData = new FormData();
  formData.append('request', new Blob([JSON.stringify(requestBody)], { type: 'application/json' }));
  formData.append('image', image);

  const response = await axiosInstance.post<ApiResponse<ReversePromptResult>>(
    '/api/generate/reverse-prompt',
    formData,
    {
      headers: { 'Content-Type': undefined },
      timeout: 60000,
    }
  );

  return response.data.data;
}

export async function updateReversePrompt(
  id: number,
  data: { prompt?: string; aspectRatio?: string }
): Promise<ReversePromptResult> {
  const response = await axiosInstance.patch<ApiResponse<ReversePromptResult>>(
    `/api/generate/reverse-prompt/${id}`,
    data
  );

  return response.data.data;
}

export async function regenerateFromReversePrompt(
  id: number,
  purpose: 'CHARACTER' | 'BACKGROUND',
  aspectRatio: string
): Promise<{ images: { mediaFileId: number; url: string }[] }> {
  const requestBody = {
    purpose,
    imageCount: 1,
    size: ASPECT_RATIO_TO_SIZE[aspectRatio] ?? 'auto',
    quality: 'standard',
    promptCorrectionEnabled: false,
  };

  const createResponse = await axiosInstance.post<ApiResponse<{ jobId: number }>>(
    `/api/generate/reverse-prompt/${id}/generate`,
    requestBody
  );

  const { jobId } = createResponse.data.data;

  const resultImages = await pollJob<{ mediaFileId: number; filePath: string }[]>(
    async () => {
      const statusResponse = await axiosInstance.get<ApiResponse<GenerateImageJobStatus>>(
        `/api/generate/images/jobs/${jobId}`
      );
      const { status, resultImages, errorMessage } = statusResponse.data.data;

      return { status, data: resultImages, errorMessage: errorMessage ?? undefined };
    },
    { intervalMs: 5000, timeoutMs: 900000, jobId }
  );

  const images = await Promise.all(
    resultImages.map(async (image) => ({
      mediaFileId: image.mediaFileId,
      url: await fetchImageBlobUrl(image.mediaFileId),
    }))
  );

  return { images };
}
