import axiosInstance from './axiosInstance';
import { pollJob } from '../utils/pollJob';
import type { ApiResponse } from '../types/api';
import type { VideoGenerationOptions, VideoGenerationResult } from '../types/generation';

const DEFAULT_MODEL_ID = 'fal-ai/kling-video/o3/standard/image-to-video';

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

const LENGTH_TO_DURATION: Record<string, string> = {
  '3초': '3',
  '5초': '5',
  '8초': '8',
  '10초': '10',
  '15초': '15',
};

export function mapLengthToDuration(length: string): string {
  return LENGTH_TO_DURATION[length];
}

/** 화면 표시용 mm:ss 변환 (요청 body의 duration과는 별개) */
function toDuration(length: string): string {
  const seconds = parseInt(length, 10) || 0;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}

export async function generateVideo(
  prompt: string,
  options: VideoGenerationOptions,
  startMediaFileId: number
): Promise<VideoGenerationResult> {
  const requestBody = {
    startMediaFileId,
    endMediaFileId: null,
    referenceMediaFileIds: [], // TODO: 스토리보드 업로드는 다음 단계에서 연동
    modelId: DEFAULT_MODEL_ID,
    prompt,
    webhookUrl: '',
    options: {
      duration: mapLengthToDuration(options.length),
      generate_audio: false,
    },
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
  };
}
