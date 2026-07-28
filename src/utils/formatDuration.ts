/** 영상 길이를 "8초"처럼 화면 표시용으로 통일. 이미 "초"로 끝나면 중복으로 붙이지 않는다. */
export function formatDuration(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  const str = String(value).trim();
  return str.endsWith('초') ? str : `${str}초`;
}
