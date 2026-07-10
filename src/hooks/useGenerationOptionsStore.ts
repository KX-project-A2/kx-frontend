import { create } from 'zustand';
import type { GenerationOptions } from '../types/generation';

interface GenerationOptionsStore extends GenerationOptions {
  setModel: (model: string) => void;
  setRatio: (ratio: string) => void;
  setQuality: (quality: string) => void;
  setQuantity: (quantity: number) => void;
}

export const useGenerationOptionsStore = create<GenerationOptionsStore>((set) => ({
  model: '제미나이',
  ratio: '1:1',
  quality: '4K',
  quantity: 1,
  setModel: (model) => set({ model }),
  setRatio: (ratio) => set({ ratio }),
  setQuality: (quality) => set({ quality }),
  setQuantity: (quantity) => set({ quantity }),
}));
