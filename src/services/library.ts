import axiosInstance from './axiosInstance';
import { fetchImageBlobUrl } from './imageGeneration';
import { ME, type Artwork } from '../constants/mockData';

interface ApiResponse<T> {
  message: string;
  data: T;
}

interface MediaFile {
  id: number;
  type: 'IMAGE' | 'VIDEO';
  filePath: string | null;
  model: string | null;
  quality: string | null;
  aspectRatio: string | null;
  resolution: string | null;
  reversedPrompt: string | null;
  tags: string[];
  favorite: boolean;
  createdAt: string;
}

interface MediaFilePage {
  content: MediaFile[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

function parseAspect(aspectRatio: string | null): number {
  if (!aspectRatio) return 1;
  const [w, h] = aspectRatio.split(':').map(Number);
  return w && h ? w / h : 1;
}

/** 둘 다 null이면 빈 문자열을 반환 - Library.tsx에서 해당 표시 줄을 숨김 */
function composeRatio(aspectRatio: string | null, resolution: string | null): string {
  if (aspectRatio && resolution) return `${aspectRatio} · ${resolution}`;
  return aspectRatio ?? resolution ?? '';
}

async function fetchMediaPage(
  type: 'IMAGE' | 'VIDEO',
  page: number,
  size: number
): Promise<MediaFile[]> {
  const response = await axiosInstance.get<ApiResponse<MediaFilePage>>('/api/media/files', {
    params: { type, page, size },
  });

  console.log(`[fetchMediaPage] type=${type} response`, JSON.stringify(response.data, null, 2));
  return response.data.data.content;
}

async function toImageArtwork(file: MediaFile): Promise<Artwork> {
  const url = await fetchImageBlobUrl(file.id);

  return {
    id: String(file.id),
    type: 'image',
    url,
    thumb: url,
    prompt: file.reversedPrompt ?? '',
    creator: ME,
    likes: 0,
    liked: file.favorite,
    favorite: file.favorite,
    model: file.model ?? '',
    quality: file.quality ?? '',
    ratio: composeRatio(file.aspectRatio, file.resolution),
    createdAt: file.createdAt,
    aspect: parseAspect(file.aspectRatio),
    mediaFileId: file.id,
  };
}

/** 개별 이미지 blob fetch 실패 시 - thumb/url을 비워서 "이미지 로드 실패" placeholder로 표시 (ResultCard/Library에서 처리) */
function toImageErrorPlaceholderArtwork(file: MediaFile): Artwork {
  return {
    id: String(file.id),
    type: 'image',
    url: '',
    thumb: '',
    prompt: file.reversedPrompt ?? '',
    creator: ME,
    likes: 0,
    liked: file.favorite,
    favorite: file.favorite,
    model: file.model ?? '',
    quality: file.quality ?? '',
    ratio: composeRatio(file.aspectRatio, file.resolution),
    createdAt: file.createdAt,
    aspect: parseAspect(file.aspectRatio),
    mediaFileId: file.id,
  };
}

async function fetchVideoDownloadUrl(mediaFileId: number): Promise<string> {
  const response = await axiosInstance.get<ApiResponse<{ downloadUrl: string; expiresInSeconds: number }>>(
    `/api/media/files/${mediaFileId}/download-url`
  );
  return response.data.data.downloadUrl;
}

async function toVideoArtwork(file: MediaFile): Promise<Artwork> {
  const url = await fetchVideoDownloadUrl(file.id);

  return {
    id: String(file.id),
    type: 'video',
    url,
    thumb: '',
    prompt: file.reversedPrompt ?? '',
    creator: ME,
    likes: 0,
    liked: file.favorite,
    favorite: file.favorite,
    model: file.model ?? '',
    quality: file.quality ?? '',
    ratio: composeRatio(file.aspectRatio, file.resolution),
    createdAt: file.createdAt,
    aspect: parseAspect(file.aspectRatio),
    mediaFileId: file.id,
  };
}

/** download-url 발급 실패 시 fallback placeholder로 재사용 */
function toVideoPlaceholderArtwork(file: MediaFile): Artwork {
  return {
    id: String(file.id),
    type: 'video',
    url: '',
    thumb: '',
    prompt: file.reversedPrompt ?? '',
    creator: ME,
    likes: 0,
    liked: file.favorite,
    favorite: file.favorite,
    model: file.model ?? '',
    quality: file.quality ?? '',
    ratio: composeRatio(file.aspectRatio, file.resolution),
    createdAt: file.createdAt,
    aspect: parseAspect(file.aspectRatio),
  };
}

export async function fetchLibraryItems(page = 0, size = 20): Promise<Artwork[]> {
  const [imageFiles, videoFiles] = await Promise.all([
    fetchMediaPage('IMAGE', page, size),
    fetchMediaPage('VIDEO', page, size),
  ]);

  const imageResults = await Promise.allSettled(imageFiles.map(toImageArtwork));
  const images = imageResults.map((result, index) => {
    if (result.status === 'fulfilled') return result.value;
    console.error('[fetchLibraryItems] image load failed', imageFiles[index].id, result.reason);
    return toImageErrorPlaceholderArtwork(imageFiles[index]);
  });
  const videoResults = await Promise.allSettled(videoFiles.map(toVideoArtwork));
  const videos = videoResults.map((result, index) => {
    if (result.status === 'fulfilled') return result.value;
    console.error('[fetchLibraryItems] video download url failed', videoFiles[index].id, result.reason);
    return toVideoPlaceholderArtwork(videoFiles[index]);
  });

  return [...images, ...videos];
}
