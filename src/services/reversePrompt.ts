import axiosInstance from './axiosInstance';
import type { ApiResponse } from '../types/api';

export interface ReversePromptResult {
  id: number;
  prompt: string;
  aspectRatio: string;
  mediaFileId: number;
}

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
