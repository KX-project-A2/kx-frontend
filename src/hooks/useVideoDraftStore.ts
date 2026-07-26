import { create } from 'zustand';

interface SeedReference {
  mediaFileId: number;
  previewUrl: string;
}

interface VideoDraftStore {
  prompt: string;
  referenceImages: File[];
  storyboardImage: File | null;
  seedReference: SeedReference | null;
  setPrompt: (prompt: string) => void;
  setStoryboardImage: (file: File | null) => void;
  setSeedReference: (seedReference: SeedReference | null) => void;
  addReferenceImage: (file: File) => void;
  removeReferenceImage: (index: number) => void;
  reset: () => void;
}

export const useVideoDraftStore = create<VideoDraftStore>((set) => ({
  prompt: '',
  referenceImages: [],
  storyboardImage: null,
  seedReference: null,
  setPrompt: (prompt) => set({ prompt }),
  setStoryboardImage: (storyboardImage) => set({ storyboardImage }),
  setSeedReference: (seedReference) =>
    set((state) => {
      // 이전 seedReference의 blob URL은 draft에 영속 보관되던 값이라, 교체/제거되는 시점에만
      // 여기서 정리한다(컴포넌트 unmount 기준으로 revoke하면 화면 이동 후 복귀 시 draft에
      // 남아있는 previewUrl이 이미 죽은 blob이 되어버린다).
      if (
        state.seedReference?.previewUrl &&
        state.seedReference.previewUrl !== seedReference?.previewUrl
      ) {
        URL.revokeObjectURL(state.seedReference.previewUrl);
      }
      return { seedReference };
    }),
  addReferenceImage: (file) =>
    set((state) => ({ referenceImages: [...state.referenceImages, file] })),
  removeReferenceImage: (index) =>
    set((state) => ({ referenceImages: state.referenceImages.filter((_, i) => i !== index) })),
  reset: () => set({ prompt: '', referenceImages: [], storyboardImage: null, seedReference: null }),
}));
