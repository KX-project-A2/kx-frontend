import axiosInstance from './axiosInstance';
import type { ApiResponse } from '../types/api';
import type { Artwork } from '../constants/mockData';
import {
  composeRatio,
  parseAspect,
  toDisplayModel,
  toDisplayQuality,
  toDisplayVideoQuality,
} from './library';
import { formatDuration } from '../utils/formatDuration';

export interface ShareLink {
  token: string;
}

/** kx-backend MediaFileResponseDto — SharedMediaResponseDto.mediaFile의 실제 구조 */
interface SharedMediaFile {
  id: number;
  type: 'IMAGE' | 'VIDEO';
  filePath: string | null;
  model: string | null;
  quality: string | null;
  aspectRatio: string | null;
  resolution: string | null;
  duration: string | null;
  generatePromptContent: string | null;
  favorite: boolean;
  createdAt: string;
}

/** kx-backend SharedMediaResponseDto — 미디어 정보가 mediaFile에 중첩되어 있고,
 * 표시용 mediaUrl과 다운로드 전용 downloadUrl이 별도로 내려온다. */
interface SharedMediaResponse {
  token: string;
  expiresAt: string;
  mediaFile: SharedMediaFile;
  mediaUrl: string;
  downloadUrl: string;
  urlExpiresInSeconds: number;
}

/** MediaFileResponseDto에는 작성자 정보가 없음 — MediaDetailPanel이 isOwnerView=false일 때
 * 작성자 표시 영역 자체를 숨기므로 이 값은 실제로 화면에 노출되지 않는다. */
const ANONYMOUS_CREATOR = { id: 'shared', handle: '', avatar: '' };

function toSharedArtwork({ mediaFile, mediaUrl, downloadUrl }: SharedMediaResponse): Artwork {
  const isVideo = mediaFile.type === 'VIDEO';

  return {
    id: String(mediaFile.id),
    type: isVideo ? 'video' : 'image',
    url: mediaUrl,
    thumb: isVideo ? '' : mediaUrl,
    downloadUrl,
    prompt: mediaFile.generatePromptContent ?? '',
    creator: ANONYMOUS_CREATOR,
    likes: 0,
    liked: mediaFile.favorite,
    favorite: mediaFile.favorite,
    model: toDisplayModel(mediaFile.model),
    quality: isVideo
      ? toDisplayVideoQuality(mediaFile.quality, mediaFile.resolution)
      : toDisplayQuality(mediaFile.quality),
    ratio: composeRatio(mediaFile.aspectRatio, mediaFile.resolution),
    createdAt: mediaFile.createdAt,
    aspect: parseAspect(mediaFile.aspectRatio),
    duration: mediaFile.duration ? formatDuration(mediaFile.duration) : undefined,
    mediaFileId: mediaFile.id,
    aspectRatioRaw: mediaFile.aspectRatio ?? undefined,
    qualityRaw: (isVideo ? mediaFile.resolution : mediaFile.quality) ?? undefined,
  };
}

export async function createShareLink(mediaFileId: number): Promise<ShareLink> {
  const response = await axiosInstance.post<ApiResponse<ShareLink>>(
    `/api/media/files/${mediaFileId}/share-links`
  );
  return response.data.data;
}

export async function fetchSharedMedia(token: string): Promise<Artwork> {
  const response = await axiosInstance.get<ApiResponse<SharedMediaResponse>>(`/api/share/${token}`);
  return toSharedArtwork(response.data.data);
}
