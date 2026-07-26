import axiosInstance from './axiosInstance';
import type { ApiResponse } from '../types/api';
import type { AuthProfile } from '../hooks/useAuthStore';

export interface GenerationSummary {
  totalMediaCount: number;
  imageCount: number;
  videoCount: number;
  latestGeneratedAt: string | null;
}

export async function updateNickname(nickname: string): Promise<AuthProfile> {
  const response = await axiosInstance.patch<ApiResponse<AuthProfile>>('/api/me/profile', {
    nickname,
  });
  return response.data.data;
}

export async function uploadProfileImage(file: File): Promise<AuthProfile> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosInstance.post<ApiResponse<AuthProfile>>(
    '/api/me/profile-image',
    formData,
    { headers: { 'Content-Type': undefined } }
  );
  return response.data.data;
}

export async function deleteProfileImage(): Promise<AuthProfile> {
  const response = await axiosInstance.delete<ApiResponse<AuthProfile>>('/api/me/profile-image');
  return response.data.data;
}

export async function deleteAccount(): Promise<void> {
  await axiosInstance.delete('/api/me');
}

export async function fetchGenerationSummary(): Promise<GenerationSummary> {
  const response = await axiosInstance.get<ApiResponse<GenerationSummary>>(
    '/api/me/generation-summary'
  );
  return response.data.data;
}
