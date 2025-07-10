// lib/utils/contentGuard.ts
// contents 비활성화/활성화 여부에 따라 진행되는 함수의 경우 해당 함수 사용
export function withContentEnabled<Args extends unknown[], R>(
  getContentEnabled: () => boolean,
  fn: (...args: Args) => R,
): (...args: Args) => R | undefined {
  return function (...args: Args): R | undefined {
    if (!getContentEnabled()) return;
    return fn(...args);
  };
}
