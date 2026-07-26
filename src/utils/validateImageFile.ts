const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

const FORMAT_ERROR = 'PNG, JPG, WEBP 형식만 업로드할 수 있어요';
const CORRUPT_ERROR = '손상되었거나 지원하지 않는 이미지 파일이에요';

export type ImageFileValidationResult = { valid: true } | { valid: false; reason: string };

function getExtension(filename: string): string {
  const match = filename.toLowerCase().match(/\.[^.]+$/);
  return match ? match[0] : '';
}

export function validateImageFile(
  file: File,
  maxSizeMB: number
): Promise<ImageFileValidationResult> {
  const extension = getExtension(file.name);
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return Promise.resolve({ valid: false, reason: FORMAT_ERROR });
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return Promise.resolve({ valid: false, reason: FORMAT_ERROR });
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    return Promise.resolve({ valid: false, reason: `파일 용량은 ${maxSizeMB}MB 이하여야 해요` });
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ valid: true });
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ valid: false, reason: CORRUPT_ERROR });
    };

    image.src = objectUrl;
  });
}
