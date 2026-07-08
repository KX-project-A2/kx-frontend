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
