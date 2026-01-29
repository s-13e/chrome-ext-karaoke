/**
 * YouTube 자막(Caption) 제어 유틸리티
 * 카라오케 모드 활성화 시 YouTube 자막을 자동으로 비활성화하고,
 * 모드 종료 시 원래 상태로 복원하는 기능 제공
 */

// 카라오케 모드 진입 전 자막 상태 저장
let wasCaptionEnabled: boolean | null = null;

/**
 * 현재 YouTube 자막이 활성화되어 있는지 확인
 * ytp-subtitles-button의 aria-pressed 속성으로 판별
 */
export function isCaptionEnabled(): boolean {
  const captionButton = document.querySelector<HTMLButtonElement>('.ytp-subtitles-button');
  if (!captionButton) {
    return false;
  }

  // aria-pressed="true"면 자막 활성화 상태
  return captionButton.getAttribute('aria-pressed') === 'true';
}

/**
 * YouTube 자막 비활성화
 * 이미 비활성화 상태라면 아무 동작도 하지 않음
 */
export function disableCaption(): void {
  if (!isCaptionEnabled()) {
    console.log('[CaptionControl] 이미 자막 비활성화 상태');
    return;
  }

  const captionButton = document.querySelector<HTMLButtonElement>('.ytp-subtitles-button');
  if (captionButton) {
    console.log('[CaptionControl] 자막 버튼 클릭하여 비활성화');
    captionButton.click();
  } else {
    console.warn('[CaptionControl] 자막 버튼을 찾을 수 없음');
  }
}

/**
 * YouTube 자막 활성화
 * 이미 활성화 상태라면 아무 동작도 하지 않음
 */
export function enableCaption(): void {
  if (isCaptionEnabled()) {
    console.log('[CaptionControl] 이미 자막 활성화 상태');
    return;
  }

  const captionButton = document.querySelector<HTMLButtonElement>('.ytp-subtitles-button');
  if (captionButton) {
    console.log('[CaptionControl] 자막 버튼 클릭하여 활성화');
    captionButton.click();
  } else {
    console.warn('[CaptionControl] 자막 버튼을 찾을 수 없음');
  }
}

/**
 * 카라오케 모드 진입 시 호출
 * 현재 자막 상태를 저장하고 자막을 비활성화
 */
export function saveCaptionStateAndDisable(): void {
  wasCaptionEnabled = isCaptionEnabled();
  console.log(`[CaptionControl] 자막 상태 저장: ${wasCaptionEnabled ? '활성화' : '비활성화'}`);

  if (wasCaptionEnabled) {
    disableCaption();
  }
}

/**
 * 카라오케 모드 종료 시 호출
 * 저장된 자막 상태로 복원
 */
export function restoreCaptionState(): void {
  if (wasCaptionEnabled === null) {
    console.log('[CaptionControl] 저장된 자막 상태 없음, 복원 생략');
    return;
  }

  console.log(`[CaptionControl] 자막 상태 복원: ${wasCaptionEnabled ? '활성화' : '비활성화'}`);

  if (wasCaptionEnabled) {
    enableCaption();
  }

  // 상태 초기화
  wasCaptionEnabled = null;
}
