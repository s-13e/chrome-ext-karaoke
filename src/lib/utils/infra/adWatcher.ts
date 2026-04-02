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

/**
 * 광고 상태를 모니터링하여 가사 오버레이 표시 여부를 제어
 * @param onAdStart 광고 시작 시 실행할 콜백
 * @param onAdEnd 광고 종료 시 실행할 콜백
 * @returns cleanup 함수
 */
export function startLyricsAdMonitoring(onAdStart: () => void, onAdEnd: () => void) {
  // 초기 상태를 비광고로 설정: SPA 전환 직후 ad-showing 클래스가
  // 잠시 잔류할 수 있어, 초기 판정을 건너뛰고 interval에서 상태 변화만 감지
  let lastAdState = false;

  console.log('[LyricsAdMonitoring] 가사 오버레이 광고 모니터링 시작');

  const intervalId = setInterval(() => {
    const currentAdState = isAdPlaying();

    // 상태 변화가 있을 때만 콜백 실행
    if (currentAdState !== lastAdState) {
      if (currentAdState) {
        console.log('[LyricsAdMonitoring] 광고 시작 감지 → 가사 숨김');
        onAdStart();
      } else {
        console.log('[LyricsAdMonitoring] 광고 종료 감지 → 가사 표시');
        onAdEnd();
      }
      lastAdState = currentAdState;
    }
  }, 1000); // 1초 간격으로 체크 (메모리 최적화: 500ms → 1000ms)

  return () => {
    console.log('[LyricsAdMonitoring] 모니터링 중지');
    clearInterval(intervalId);
  };
}
