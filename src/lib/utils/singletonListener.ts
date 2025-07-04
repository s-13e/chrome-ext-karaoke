// src/lib/utils/singletonListener.ts
export function registerSingletonListener(flagName: string, registerFn: () => void) {
  // 타입 안전하게 window에 동적 속성 부여
  const win = window as Record<string, unknown>;
  if (!win[flagName]) {
    registerFn();
    win[flagName] = true;
  }
}
