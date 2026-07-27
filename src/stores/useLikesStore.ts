import { create } from 'zustand';
import { addFavorite, removeFavorite } from '@/services/library';

interface LikeState {
  liked: boolean;
  likes: number;
}

interface LikesStore {
  overrides: Record<string, LikeState>;
  /** mediaFileId가 있으면(실제 BE 미디어 파일) 찜 API와 동기화, 없으면(목업/생성 직후 임시 항목) 로컬 상태만 토글 */
  toggleLike: (
    id: string,
    currentLiked: boolean,
    currentLikes: number,
    mediaFileId?: number
  ) => void;
}

export const useLikesStore = create<LikesStore>((set) => ({
  overrides: {},
  toggleLike: (id, currentLiked, currentLikes, mediaFileId) => {
    const nextLiked = !currentLiked;

    set((state) => ({
      overrides: {
        ...state.overrides,
        [id]: {
          liked: nextLiked,
          likes: currentLiked ? currentLikes - 1 : currentLikes + 1,
        },
      },
    }));

    if (mediaFileId === undefined) return;

    const request = nextLiked ? addFavorite(mediaFileId) : removeFavorite(mediaFileId);
    request.catch((err) => {
      console.error('[useLikesStore] 찜 상태 서버 동기화 실패 - 로컬 상태를 되돌립니다', err);
      set((state) => ({
        overrides: {
          ...state.overrides,
          [id]: { liked: currentLiked, likes: currentLikes },
        },
      }));
    });
  },
}));
