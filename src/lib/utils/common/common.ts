// 디바운싱
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// 스로틀링
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      func(...args);
      lastCall = now;
    }
  };
};

/**
 * React useRef와 함께 사용하는 쓰로틀 헬퍼
 * 컴포넌트 내에서 쓰로틀 상태를 유지하면서 실행 가능 여부 확인
 *
 * @param lastCallRef 마지막 호출 시간을 저장하는 ref ({ current: number })
 * @param delay 쓰로틀 간격 (ms)
 * @returns 실행 가능 여부 (true면 실행, false면 스킵)
 *
 * @example
 * const lastCallRef = useRef(0);
 * const handleClick = () => {
 *   if (!canExecuteThrottled(lastCallRef, THROTTLE_DELAYS.UI_INTERACTION)) return;
 *   // 실행할 로직
 * };
 */
export const canExecuteThrottled = (lastCallRef: { current: number }, delay: number): boolean => {
  const now = Date.now();
  if (now - lastCallRef.current >= delay) {
    lastCallRef.current = now;
    return true;
  }
  return false;
};

/** 공통 쓰로틀 간격 상수 (ms) */
export const THROTTLE_DELAYS = {
  /** 빠른 UI 상호작용 (탭 전환, 버튼 클릭 등) */
  UI_INTERACTION: 300,
  /** API 호출 */
  API_CALL: 1000,
  /** 스토리지 저장 */
  STORAGE_SAVE: 500,
} as const;
