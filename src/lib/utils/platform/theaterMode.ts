/**
 * YouTube 영화관(Theater) 모드 제어 유틸리티
 * 영화관 모드 상태 확인, 활성화/비활성화 기능 제공
 */

/**
 * 현재 YouTube가 영화관 모드인지 확인
 * ytd-watch-flexy 요소의 theater 속성으로 판별
 */
export function isTheaterMode(): boolean {
  const watchFlexy = document.querySelector('ytd-watch-flexy');
  if (!watchFlexy) {
    return false;
  }

  // theater 속성이 있으면 영화관 모드
  return watchFlexy.hasAttribute('theater');
}

/**
 * YouTube 영화관 모드로 전환
 * 이미 영화관 모드라면 아무 동작도 하지 않음
 */
export function enableTheaterMode(): void {
  if (isTheaterMode()) {
    console.log('[TheaterMode] 이미 영화관 모드 활성화 상태');
    return;
  }

  // YouTube의 영화관 모드 버튼 찾기 (언어 독립적)
  // ytp-size-button 클래스를 가진 버튼이 영화관 모드 토글 버튼
  const theaterButton = document.querySelector<HTMLButtonElement>('.ytp-chrome-controls .ytp-size-button');

  if (theaterButton) {
    console.log('[TheaterMode] 영화관 모드 버튼 클릭하여 활성화');
    theaterButton.click();
  } else {
    console.warn('[TheaterMode] 영화관 모드 버튼을 찾을 수 없음');
    // 버튼을 찾을 수 없는 경우 직접 속성 추가 시도
    const watchFlexy = document.querySelector('ytd-watch-flexy');
    if (watchFlexy) {
      watchFlexy.setAttribute('theater', '');
      console.log('[TheaterMode] 직접 theater 속성 추가');
    }
  }
}

/**
 * YouTube 기본 모드로 전환
 * 이미 기본 모드라면 아무 동작도 하지 않음
 */
export function disableTheaterMode(): void {
  if (!isTheaterMode()) {
    console.log('[TheaterMode] 이미 기본 모드 상태');
    return;
  }

  // YouTube의 영화관 모드 버튼 찾기 (언어 독립적)
  // 영화관 모드일 때도 같은 버튼이므로 클릭하면 토글됨
  const theaterButton = document.querySelector<HTMLButtonElement>('.ytp-chrome-controls .ytp-size-button');

  if (theaterButton) {
    console.log('[TheaterMode] 영화관 모드 버튼 클릭하여 비활성화');
    theaterButton.click();
  } else {
    console.warn('[TheaterMode] 기본 모드 버튼을 찾을 수 없음');
    // 버튼을 찾을 수 없는 경우 직접 속성 제거 시도
    const watchFlexy = document.querySelector('ytd-watch-flexy');
    if (watchFlexy) {
      watchFlexy.removeAttribute('theater');
      console.log('[TheaterMode] 직접 theater 속성 제거');
    }
  }
}

/**
 * YouTube 영화관 모드 상태 전환
 * @param enabled - true면 영화관 모드, false면 기본 모드
 */
export function setTheaterMode(enabled: boolean): void {
  if (enabled) {
    enableTheaterMode();
  } else {
    disableTheaterMode();
  }
}
