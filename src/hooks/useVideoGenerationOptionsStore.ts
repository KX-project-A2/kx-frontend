import { create } from 'zustand';
import type { VideoGenerationOptions } from '../types/generation';
import { VIDEO_LENGTHS, VIDEO_MODELS, VIDEO_QUALITIES, VIDEO_RATIOS } from '../constants/mockData';

interface VideoGenerationOptionsStore extends VideoGenerationOptions {
  setModel: (model: string) => void;
  setLength: (length: string) => void;
  setRatio: (ratio: string) => void;
  setQuality: (quality: string) => void;
}

export const useVideoGenerationOptionsStore = create<VideoGenerationOptionsStore>((set) => ({
  model: VIDEO_MODELS[0],
  length: VIDEO_LENGTHS[3], // "8초" 유지 (VIDEO_LENGTHS에 "4초"가 추가되며 인덱스 밀림)
  ratio: VIDEO_RATIOS[0],
  quality: VIDEO_QUALITIES[0],
  setModel: (model) => set({ model }),
  setLength: (length) => set({ length }),
  setRatio: (ratio) => set({ ratio }),
  setQuality: (quality) => set({ quality }),
}));
