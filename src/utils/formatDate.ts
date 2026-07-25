/** BE의 ISO 타임스탬프("2026-07-23T07:27:03...")나 목업의 점 구분("2026.07.05") 모두 "YYYY-MM-DD"로 축약 */
export function formatDate(value: string): string {
  const match = value.match(/^(\d{4})[-.](\d{2})[-.](\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : value;
}
