import { create } from 'zustand';

const DEFAULT_PURPOSE = '캐릭터';

interface ImageDraftStore {
  prompt: string;
  purpose: string;
  correction: boolean;
  references: File[];
  setPrompt: (prompt: string) => void;
  setPurpose: (purpose: string) => void;
  setCorrection: (correction: boolean) => void;
  addReference: (file: File) => void;
  removeReference: (index: number) => void;
  reset: () => void;
}

export const useImageDraftStore = create<ImageDraftStore>((set) => ({
  prompt: '',
  purpose: DEFAULT_PURPOSE,
  correction: false,
  references: [],
  setPrompt: (prompt) => set({ prompt }),
  setPurpose: (purpose) => set({ purpose }),
  setCorrection: (correction) => set({ correction }),
  addReference: (file) => set((state) => ({ references: [...state.references, file] })),
  removeReference: (index) =>
    set((state) => ({ references: state.references.filter((_, i) => i !== index) })),
  reset: () => set({ prompt: '', purpose: DEFAULT_PURPOSE, correction: false, references: [] }),
}));
