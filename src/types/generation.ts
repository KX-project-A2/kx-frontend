export interface GenerationOptions {
  model: string;
  ratio: string;
  quality: string;
  quantity: number;
}

export interface GenerationResult {
  id: string;
  prompt: string;
  images: { url: string }[];
  createdAt: string;
}

export interface VideoGenerationOptions {
  model: string;
  length: string;
  ratio: string;
  quality: string;
}

export interface VideoGenerationResult {
  id: string;
  prompt: string;
  videoUrl: string;
  duration: string;
  createdAt: string;
}
