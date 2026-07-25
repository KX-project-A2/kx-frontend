/**
 * 재편집 복원 시 BE 원본 값(rawValue)에 해당하는 표시용 옵션을 옵션 목록에서 찾는다.
 * 각 옵션을 toRawValue로 원본 값 형태로 변환해 정확히 일치하는 것을 우선 찾고,
 * 없으면 rawValue로 시작하는 옵션(prefix 매칭)으로 대체한다.
 */
export function findOptionForRestore<T extends string>(
  options: T[],
  rawValue: string | undefined,
  toRawValue: (option: T) => string
): T | undefined {
  if (!rawValue) return undefined;
  return (
    options.find((opt) => toRawValue(opt) === rawValue) ??
    options.find((opt) => opt.startsWith(rawValue))
  );
}
