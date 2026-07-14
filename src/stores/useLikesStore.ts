import { create } from 'zustand';

interface LikeState {
  liked: boolean;
  likes: number;
}

interface LikesStore {
  overrides: Record<string, LikeState>;
  getLikeState: (id: string, fallbackLiked: boolean, fallbackLikes: number) => LikeState;
  toggleLike: (id: string, currentLiked: boolean, currentLikes: number) => void;
}

export const useLikesStore = create<LikesStore>((set, get) => ({
  overrides: {},
  getLikeState: (id, fallbackLiked, fallbackLikes) =>
    get().overrides[id] ?? { liked: fallbackLiked, likes: fallbackLikes },
  toggleLike: (id, currentLiked, currentLikes) =>
    set((state) => ({
      overrides: {
        ...state.overrides,
        [id]: {
          liked: !currentLiked,
          likes: currentLiked ? currentLikes - 1 : currentLikes + 1,
        },
      },
    })),
}));
