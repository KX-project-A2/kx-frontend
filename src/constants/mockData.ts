/* Seed data & shared types for the AI generation service (mock/stub data). */

import presetCatalogData from '@/data/presets_catalog.json';

export type MediaType = 'image' | 'video';

export interface Creator {
  id: string;
  handle: string;
  avatar: string;
}

export interface Artwork {
  id: string;
  type: MediaType;
  url: string;
  thumb: string;
  prompt: string;
  creator: Creator;
  likes: number;
  liked: boolean;
  model: string;
  quality: string;
  ratio: string;
  createdAt: string;
  /** rough aspect ratio for masonry layout */
  aspect: number;
  /** video specific */
  duration?: string;
  /** BE MediaFile ID - image-to-video 생성 시 startMediaFileId로 사용 */
  mediaFileId?: number;
  /** BE의 favorite(찜) 상태 - 라이브러리 API 전용 */
  favorite?: boolean;
  /** presets_catalog.json 원본 데이터의 실제 로컬 에셋 경로 */
  localPath?: string;
  /** presets_catalog.json 원본 데이터 - 임시 목업(교체 예정) 여부 */
  isTempMockup?: boolean;
  /** presets_catalog.json 원본 데이터의 카테고리 (프리셋 전용) */
  category?: string;
}

const u = (id: string, w = 1080) =>
  `https://images.unsplash.com/${id}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=${w}`;

export const CREATORS: Creator[] = [
  { id: 'c1', handle: '@nova_kim', avatar: u('photo-1641901960200-1e878f0cbf63', 96) },
  { id: 'c2', handle: '@studio_haru', avatar: u('photo-1657180881998-c8a03ef22695', 96) },
  { id: 'c3', handle: '@pixel_moon', avatar: u('photo-1779589897306-6428730477ff', 96) },
  { id: 'c4', handle: '@aiden.lab', avatar: u('photo-1772460638029-07a8db04f316', 96) },
];

export const ME: Creator = {
  id: 'me',
  handle: '@my_studio',
  avatar: u('photo-1779399153789-74d266fda6a4', 96),
};

const IMG = {
  p1: 'photo-1581841064838-a470c740e8ee',
  p2: 'photo-1641901960200-1e878f0cbf63',
  p3: 'photo-1657180881998-c8a03ef22695',
  p4: 'photo-1772460638029-07a8db04f316',
  p5: 'photo-1779399153789-74d266fda6a4',
  p6: 'photo-1765410849364-56b49c81c657',
  p7: 'photo-1779589897306-6428730477ff',
  p8: 'photo-1765445666179-f99d7b0e4cdb',
  l1: 'photo-1612805148798-00f691878516',
  l2: 'photo-1711319551836-f7ca9764a898',
  l3: 'photo-1731937817165-1fed94fc03b2',
  l4: 'photo-1608737494061-acbb3f728d0d',
  l5: 'photo-1559586115-db415d831d64',
  l6: 'photo-1738193026574-cfbcccbeb052',
  l7: 'photo-1571315742781-a6140d3a8bd5',
  l8: 'photo-1530318893805-e7e1d466bd40',
};

function make(
  id: string,
  type: MediaType,
  key: keyof typeof IMG,
  prompt: string,
  creator: Creator,
  likes: number,
  aspect: number,
  opts: Partial<Artwork> = {}
): Artwork {
  return {
    id,
    type,
    url: u(IMG[key], 1400),
    thumb: u(IMG[key], 720),
    prompt,
    creator,
    likes,
    liked: false,
    model: type === 'image' ? '제미나이' : 'seedance 2.0',
    quality: type === 'image' ? '4K' : '고화질 1920×1080',
    ratio: aspect >= 1 ? '16:9 · 1376×768' : '1:1 · 1024×1024',
    createdAt: '2026.07.05',
    aspect,
    ...opts,
  };
}

export const RECENT_WORKS: Artwork[] = [
  make('r1', 'image', 'p3', '긴 머리의 여인, 몽환적 톤', ME, 12, 0.64),
  make('r2', 'image', 'l2', '강과 산의 풍경화, 황금빛 시간', ME, 8, 1.66),
  make('r3', 'image', 'p2', '흑백 초상, 부드러운 그림자', ME, 21, 0.75),
  make('r4', 'video', 'l4', '흔들리는 초원, 시네마틱 무빙', ME, 5, 1.77, { duration: '8초' }),
];

/** For the image generation screen — grouped by prompt */
export interface GenGroup {
  prompt: string;
  items: Artwork[];
}

export const LIBRARY_ITEMS: Artwork[] = [
  ...RECENT_WORKS,
  make('lb1', 'image', 'p5', '사이버펑크 여전사, 네온 라이팅', ME, 3, 0.8),
  make('lb2', 'video', 'l7', '초원 파노라마 타임랩스', ME, 7, 1.77, { duration: '12초' }),
  make('lb3', 'image', 'l5', '녹음의 산, 디테일 일러스트', ME, 15, 0.7),
  make('lb4', 'image', 'p7', '물 위의 여인, 노란 드레스', ME, 9, 0.76),
  make('lb5', 'video', 'l8', '산맥 항공 촬영', ME, 4, 1.77, { duration: '15초' }),
];

export const PROMPT_SUGGESTIONS = ['사이버펑크 도시의 밤', '미니멀 제품 광고컷'];
// 제거된 칩: '수채화 스타일 고양이' / '판타지 캐릭터 시트' / '시네마틱 풍경 영상'
// → presets_catalog.json(110건, 저작권 정리본)에 매칭되는 카테고리가 없어 임시 제거.
// PM/디자이너와 재협의 후 대응 카테고리 확정되면 재추가 예정.

/** 홈 "탐색하기" 섹션 해시태그 필터 칩 — 라벨과 PRESET_CATALOG(src/data/presets_catalog.json)의 실제 category 값 매핑 */
export const EXPLORE_CATEGORY_CHIPS: { label: string; category: string | null }[] = [
  { label: '전체', category: null },
  { label: '사이버펑크', category: 'Cyberpunk' },
  { label: '캐릭터시트', category: 'Character Sheet' },
  { label: '판타지 배경시트', category: 'Fantasy Background Sheet' },
  { label: '시네마틱 랜드스케이프', category: 'Cinematic Landscape' },
];

export const IMAGE_MODELS = ['제미나이'];
export const VIDEO_MODELS = ['seedance 2.0', 'Kling 3.0'];
export const PURPOSES = ['캐릭터', '배경', '키이미지 캐릭터시트', '키이미지 배경시트'];
export const IMAGE_RATIOS = [
  '1:1 · 1024×1024',
  '4:3 · 1152×896',
  '16:9 · 1376×768',
  '9:16 · 768×1376',
];
export const VIDEO_RATIOS = ['16:9 · 1376×768', '9:16 · 768×1376', '1:1 · 1024×1024'];
export const IMAGE_QUALITIES = ['2K', '4K'];
export const VIDEO_LENGTHS = ['3초', '4초', '5초', '8초', '10초', '15초', '자동'];
export const VIDEO_QUALITIES = ['고화질 1920×1080', '표준 1280×720'];

interface PresetCatalogEntry {
  mergedId: string;
  mediaType: 'IMAGE' | 'VIDEO';
  category: string;
  quality: string;
  createdDate: string;
  originalArtist: string;
  generationModel: string;
  isTempMockup: boolean;
  creatorId: string;
  prompt: string;
  /** "WIDTHxHEIGHT" 형식 — extra.width/height가 없는 항목에도 항상 존재해 이걸 기준으로 계산 */
  size: string;
  extra: {
    ratio?: string;
    width?: number;
    height?: number;
    localPath: string;
  };
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function simplifyRatio(width: number, height: number): string {
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

function toPresetArtwork(entry: PresetCatalogEntry): Artwork {
  const [width, height] = entry.size.split('x').map(Number);
  const ratioLabel = entry.extra.ratio ?? simplifyRatio(width, height);
  const assetPath = entry.extra.localPath.replace(/^public/, '');

  return {
    id: entry.mergedId,
    type: entry.mediaType.toLowerCase() as MediaType,
    category: entry.category,
    url: assetPath,
    thumb: assetPath,
    prompt: entry.prompt,
    creator: {
      id: entry.creatorId,
      handle: `@${entry.originalArtist.replace(/\s+/g, '_')}`,
      avatar: u(IMG.p2, 96),
    },
    likes: 0,
    liked: false,
    model: entry.generationModel,
    quality: entry.quality,
    ratio: `${ratioLabel} · ${width}×${height}`,
    createdAt: entry.createdDate,
    aspect: Math.round((width / height) * 1000) / 1000,
    localPath: assetPath,
    isTempMockup: entry.isTempMockup,
  };
}

/** presets_catalog.json(저작권 정리본, 110건 전부 IMAGE)을 런타임에 Artwork[]로 변환 */
export const PRESET_CATALOG: Artwork[] = (presetCatalogData as PresetCatalogEntry[]).map(
  toPresetArtwork
);
