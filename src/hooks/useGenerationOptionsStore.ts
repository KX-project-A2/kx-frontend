import { create } from 'zustand';
import type { GenerationOptions } from '../types/generation';

interface GenerationOptionsStore extends GenerationOptions {
  setModel: (model: string) => void;
  setRatio: (ratio: string) => void;
  setQuality: (quality: string) => void;
  setQuantity: (quantity: number) => void;
}

export const useGenerationOptionsStore = create<GenerationOptionsStore>((set) => ({
  model: 'GPT Image 2.0',
  ratio: '1:1',
  quality: '표준(Standard)',
  quantity: 1,
  setModel: (model) => set({ model }),
  setRatio: (ratio) => set({ ratio }),
  setQuality: (quality) => set({ quality }),
  setQuantity: (quantity) => set({ quantity }),
}));
