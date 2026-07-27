const FILENAME_PROMPT_MAX_LENGTH = 40;

/** 파일시스템에서 위험한 문자를 제거/치환하고 공백을 언더스코어로 정리한다. */
function sanitizeFilenamePart(text: string): string {
  return text
    .trim()
    .replace(/[\\/:*?"<>|\r\n\t]+/g, ' ')
    .replace(/\s+/g, '_')
    .slice(0, FILENAME_PROMPT_MAX_LENGTH)
    .replace(/^_+|_+$/g, '');
}

/** "프롬프트 앞부분_생성날짜.ext" 형태의 다운로드 파일명 생성. 프롬프트가 없으면 id로 대체. */
export function buildDownloadFilename(art: {
  id: string;
  prompt: string;
  createdAt: string;
  type: 'image' | 'video';
}): string {
  const ext = art.type === 'video' ? 'mp4' : 'jpg';
  const datePart = art.createdAt.slice(0, 10).replace(/-/g, '');
  const promptPart = sanitizeFilenamePart(art.prompt ?? '');
  const base = [promptPart, datePart].filter(Boolean).join('_');
  return `${base || art.id}.${ext}`;
}

export async function downloadFile(url: string, filename: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(objectUrl);
  } catch (err) {
    console.error('Failed to download file', err);
  }
}
