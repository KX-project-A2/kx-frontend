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

export function parseAspect(aspectRatio: string | null): number {
  if (!aspectRatio) return 1;
  const [w, h] = aspectRatio.split(':').map(Number);
  return w && h ? w / h : 1;
}

/** 둘 다 null이면 빈 문자열을 반환 - Library.tsx에서 해당 표시 줄을 숨김 */
export function composeRatio(aspectRatio: string | null, resolution: string | null): string {
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

export async function toImageArtwork(file: MediaFile): Promise<Artwork> {
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

export async function toVideoArtwork(file: MediaFile): Promise<Artwork> {
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

  return [...images, ...videos].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

interface RecentJobItem {
  mediaFileId: number;
  type: 'IMAGE' | 'VIDEO';
  model: string | null;
  quality: string | null;
  aspectRatio: string | null;
  resolution: string | null;
  favorite: boolean;
  createdAt: string;
}

interface RecentJob {
  generateJobId: number | null;
  type: 'IMAGE' | 'VIDEO';
  status: string;
  prompt: string | null;
  createdAt: string;
  items: RecentJobItem[];
}

/** job.prompt(reversedPrompt 없음) + item을 기존 MediaFile 형태로 합쳐서 toImageArtwork/toVideoArtwork 재사용 */
function toRecentMediaFile(job: RecentJob, item: RecentJobItem): MediaFile {
  return {
    id: item.mediaFileId,
    type: item.type,
    filePath: null,
    model: item.model,
    quality: item.quality,
    aspectRatio: item.aspectRatio,
    resolution: item.resolution,
    reversedPrompt: job.prompt,
    tags: [],
    favorite: item.favorite,
    createdAt: item.createdAt,
  };
}

interface RecentFileEntry {
  file: MediaFile;
  job: RecentJob;
}

/**
 * perTypeSize: "전체 개수"가 아니라 "타입별로 화면에 쓸 후보 개수" — 화면엔 탭당 4개만
 * 보여주지만, 변환 실패(=존재하지 않는 파일) 항목을 조용히 건너뛰고도 4개를 채울 수 있도록
 * 여유분을 두고 그만큼만 실제 네트워크 변환을 시도한다 (안 쓰일 항목까지 미리 다운로드하지 않음).
 */
export async function fetchRecentWorks(perTypeSize = 8): Promise<Artwork[]> {
  const response = await axiosInstance.get<ApiResponse<RecentJob[]>>('/api/media/files/recent', {
    params: { size: perTypeSize * 3 },
  });

  const jobs = response.data.data;

  // 예전 라이브러리 버그(레퍼런스 업로드 이미지가 generateJob 없이 목록에 섞여 나옴)의
  // 재발 여부를 바로 확인할 수 있도록 — generateJobId 없는 job이 있으면 콘솔에 남김
  const jobsWithoutGenerateJobId = jobs.filter((job) => !job.generateJobId);
  if (jobsWithoutGenerateJobId.length > 0) {
    console.warn(
      '[fetchRecentWorks] generateJobId가 없는 job이 최근 목록에 포함됨 — BE 버그 의심(레퍼런스 업로드 이미지 오분류 패턴)',
      jobsWithoutGenerateJobId
    );
  }

  const entries: RecentFileEntry[] = jobs.flatMap((job) =>
    job.items.map((item) => ({ file: toRecentMediaFile(job, item), job }))
  );

  // BE의 items[].type 대소문자/값이 예상과 다를 수 있어 방어적으로 정규화 — 다르면 콘솔에 남겨서
  // 실제 응답 계약을 다음에 바로 확인할 수 있게 함 (이미지가 전부 video로 오분류되는 버그 대응)
  const isImage = (file: MediaFile) => {
    const normalized = String(file.type).toUpperCase();
    if (normalized !== 'IMAGE' && normalized !== 'VIDEO') {
      console.warn('[fetchRecentWorks] unexpected item.type value', file.type, file.id);
    }
    return normalized === 'IMAGE';
  };
  const byRecency = (a: RecentFileEntry, b: RecentFileEntry) =>
    new Date(b.file.createdAt).getTime() - new Date(a.file.createdAt).getTime();

  // 타입별로 최신순 상위 perTypeSize개만 골라서 그만큼만 변환 시도 (나머지는 네트워크 호출 자체를 안 함)
  const imageEntries = entries
    .filter((e) => isImage(e.file))
    .sort(byRecency)
    .slice(0, perTypeSize);
  const videoEntries = entries
    .filter((e) => !isImage(e.file))
    .sort(byRecency)
    .slice(0, perTypeSize);

  const convert = async (
    list: RecentFileEntry[],
    toArtwork: (file: MediaFile) => Promise<Artwork>
  ): Promise<Artwork[]> => {
    const results = await Promise.allSettled(list.map((entry) => toArtwork(entry.file)));
    return results.flatMap((result, index) => {
      if (result.status === 'fulfilled') return [result.value];
      const { file, job } = list[index];
      // 플레이스홀더로 대체하지 않고 조용히 건너뜀 — 실패한 자리는 위에서 뽑아둔 여유분(perTypeSize)이 채워줌
      console.error('[fetchRecentWorks] 변환 실패 — 건너뜀 (BE에 실제 파일이 없을 가능성)', {
        mediaFileId: file.id,
        type: file.type,
        generateJobId: job.generateJobId,
        jobStatus: job.status,
        jobPrompt: job.prompt,
        createdAt: file.createdAt,
        reason: result.reason,
      });
      return [];
    });
  };

  const [images, videos] = await Promise.all([
    convert(imageEntries, toImageArtwork),
    convert(videoEntries, toVideoArtwork),
  ]);

  return [...images, ...videos].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
