/* Seed data & shared types for the AI generation service (mock/stub data). */

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
  /** BE의 favorite(찜) 상태 - 라이브러리 API 전용 */
  favorite?: boolean;
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

export const GALLERY_IMAGES: Artwork[] = [
  make(
    'g1',
    'image',
    'p1',
    '에메랄드빛 숲의 여신, 부드러운 역광, 초현실적 포트레이트',
    CREATORS[0],
    1284,
    0.66
  ),
  make('g2', 'image', 'l1', '광활한 초원과 뭉게구름, 시네마틱 와이드샷', CREATORS[1], 842, 1.5),
  make('g3', 'image', 'p4', '거울에 비친 두 얼굴, 추상적 빛의 회화', CREATORS[2], 2103, 0.66),
  make(
    'g4',
    'image',
    'l3',
    '안개 낀 마법의 숲, 흐르는 시냇물, 판타지 콘셉트 아트',
    CREATORS[3],
    671,
    1.77
  ),
  make('g5', 'image', 'p6', '수평선으로 왜곡된 인물, 실험적 글리치 아트', CREATORS[0], 455, 1.84),
  make('g6', 'image', 'p7', '수련 사이 물 위에 누운 노란 드레스의 여인', CREATORS[1], 1567, 0.76),
  make('g7', 'image', 'l5', '녹음의 산과 숲, 세밀한 일러스트레이션', CREATORS[2], 389, 0.7),
  make('g8', 'image', 'p8', '글리치 효과의 추상 초상, 디스토션', CREATORS[3], 928, 1.84),
];

export const GALLERY_VIDEOS: Artwork[] = [
  make(
    'v1',
    'video',
    'l4',
    '흐린 하늘 아래 흔들리는 초원, 느린 카메라 무빙',
    CREATORS[1],
    743,
    1.77,
    { duration: '8초' }
  ),
  make(
    'v2',
    'video',
    'p5',
    '사이버네틱 팔을 가진 미래의 여인, 글리치 트랜지션',
    CREATORS[0],
    1521,
    0.8,
    { duration: '5초', model: 'Kling 3.0' }
  ),
  make('v3', 'video', 'l6', '안개 낀 들판에 서 있는 사람, 드리프트 샷', CREATORS[3], 512, 1.77, {
    duration: '10초',
  }),
  make('v4', 'video', 'l7', '파노라마 초원 위 구름의 흐름, 타임랩스', CREATORS[2], 634, 1.77, {
    duration: '12초',
    model: 'Kling 3.0',
  }),
  make('v5', 'video', 'l8', '구름에 뒤덮인 산맥, 서사적 항공 촬영', CREATORS[1], 897, 1.77, {
    duration: '15초',
  }),
  make('v6', 'video', 'l2', '강이 흐르는 산악 풍경 회화, 부드러운 패닝', CREATORS[0], 421, 1.66, {
    duration: '6초',
  }),
];

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

export const PROMPT_SUGGESTIONS = [
  '사이버펑크 도시의 밤',
  '수채화 스타일 고양이',
  '미니멀 제품 광고컷',
  '판타지 캐릭터 시트',
  '시네마틱 풍경 영상',
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
export const VIDEO_LENGTHS = ['3초', '4초', '5초', '8초', '10초', '15초'];
export const VIDEO_QUALITIES = ['고화질 1920×1080', '표준 1280×720'];
