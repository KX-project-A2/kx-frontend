import type { GenerationOptions, GenerationResult } from '../types/generation';

const MOCK_DELAY_MS = 1500;

export async function generateImage(
  prompt: string,
  options: GenerationOptions
): Promise<GenerationResult> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  const images = Array.from({ length: options.quantity }, () => ({
    url: `https://picsum.photos/512?random=${Math.floor(Math.random() * 1_000_000)}`,
  }));

  return {
    id: `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`,
    prompt,
    images,
    createdAt: new Date().toISOString(),
  };
}
