import type { VideoGenerationOptions, VideoGenerationResult } from '../types/generation';

const MOCK_DELAY_MS = 3000;
const MOCK_VIDEO_URL = 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

function toDuration(length: string): string {
  const seconds = parseInt(length, 10) || 0;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}

export async function generateVideo(
  prompt: string,
  options: VideoGenerationOptions
): Promise<VideoGenerationResult> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  return {
    id: `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`,
    prompt,
    videoUrl: MOCK_VIDEO_URL,
    duration: toDuration(options.length),
    createdAt: new Date().toISOString(),
  };
}
