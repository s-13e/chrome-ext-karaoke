import { isAdPlaying } from '../dom/domUtils';

// adWatcher.ts
let lastAdPlaying = isAdPlaying();

/**
 * 광고 종료시 콜백 실행하는 광고 상태 감지자
 * @param onAdEndCallback 광고 종료 시 실행할 함수 (예: handleVideoDetection)
 */
export function startAdWatcher(onAdEndCallback: () => void) {
  // 광고 상태를 주기적으로 확인
  const intervalId = setInterval(() => {
    const nowAd = isAdPlaying();
    // 상태 변화: 광고 종료?
    if (lastAdPlaying && !nowAd) {
      console.log('[adWatcher] 광고 종료 감지, 감지 재시도');
      onAdEndCallback();
    }
    lastAdPlaying = nowAd;
  }, 1000); // 1초 간격

  return () => clearInterval(intervalId);
}
