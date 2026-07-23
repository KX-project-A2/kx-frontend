import axiosInstance from './axiosInstance';
import { pollJob } from '../utils/pollJob';
import {
  getVideoModelCapability,
  mapLengthToDuration,
  mapModelToModelId,
  mapQualityToResolution,
  mapRatioToAspectRatio,
} from '../utils/videoOptionMapping';
import type { ApiResponse } from '../types/api';
import type { VideoGenerationOptions, VideoGenerationResult } from '../types/generation';

interface GenerateVideoJob {
  id: number;
  type: 'IMAGE_TO_VIDEO';
  status: string;
  falRequestId: string;
  falModelId: string;
  falStatusUrl: string;
  falResponseUrl: string | null;
  inputMediaFileId: number;
  resultMediaFileId: number | null;
  submittedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // 폴링 응답에만 존재
  resultFilePath?: string | null;
  resultModel?: string | null;
  resultQuality?: string | null;
  resultAspectRatio?: string | null;
  resultResolution?: string | null;
}

/** 화면 표시용 mm:ss 변환 (요청 body의 duration과는 별개) */
function toDuration(length: string): string {
  const seconds = parseInt(length, 10) || 0;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}

/** 스토리보드 원본 파일을 업로드해 mediaFileId를 받아온다. */
export async function uploadReferenceImage(file: File): Promise<number> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosInstance.post<ApiResponse<{ mediaFileId: number }>>(
    '/api/media/images/upload',
    formData,
    { headers: { 'Content-Type': undefined } }
  );
  return response.data.data.mediaFileId;
}

export async function generateVideo(
  prompt: string,
  options: VideoGenerationOptions,
  startMediaFileId: number | null,
  referenceMediaFileIds: number[] = []
): Promise<VideoGenerationResult> {
  const capability = getVideoModelCapability(options.model);

  const videoOptions: Record<string, unknown> = {
    duration: mapLengthToDuration(options.length),
    generate_audio: true,
  };
  if (capability.supportsRatio) videoOptions.aspect_ratio = mapRatioToAspectRatio(options.ratio);
  if (capability.supportsQuality) videoOptions.resolution = mapQualityToResolution(options.quality);

  const requestBody = {
    startMediaFileId: capability.requiresStartImage ? startMediaFileId : null,
    endMediaFileId: null,
    referenceMediaFileIds: capability.supportsReferenceImages ? referenceMediaFileIds : [],
    modelId: mapModelToModelId(options.model),
    prompt,
    webhookUrl: '',
    options: videoOptions,
  };

  console.log('[generateVideo] request body', requestBody);
  const createResponse = await axiosInstance.post<ApiResponse<GenerateVideoJob>>(
    '/api/generate/videos',
    requestBody
  );

  console.log('[generateVideo] create response', JSON.stringify(createResponse.data, null, 2));
  const { id: jobId } = createResponse.data.data;

  const job = await pollJob<GenerateVideoJob>(async () => {
    const statusResponse = await axiosInstance.get<ApiResponse<GenerateVideoJob>>(
      `/api/generate/videos/jobs/${jobId}`
    );

    console.log('[generateVideo] job status response', JSON.stringify(statusResponse.data, null, 2));
    const jobData = statusResponse.data.data;

    return { status: jobData.status, data: jobData };
  }, { intervalMs: 5000, timeoutMs: 900000 });

  // TODO: falResponseUrl과 resultFilePath 중 실제 재생 가능한 URL이 무엇인지 로그로 확인 후 확정
  console.log('[generateVideo] COMPLETED job - url candidates', {
    falResponseUrl: job.falResponseUrl,
    resultFilePath: job.resultFilePath,
  });
  const videoUrl = job.falResponseUrl ?? job.resultFilePath ?? '';

  return {
    id: String(jobId),
    prompt,
    videoUrl,
    duration: toDuration(options.length),
    createdAt: new Date().toISOString(),
    mediaFileId: job.resultMediaFileId ?? undefined,
  };
}
