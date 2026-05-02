// autoFlowTutorial.tsx
// 자동 튜토리얼 (Step 1: 카라오케 모드 활성화 안내, Step 2: 복귀 안내)

import ReactDOM from 'react-dom/client';
import { STORAGE_KEYS } from '@constants/storageKeys';
import { injectTutorialHighlightStyles, clearAllHighlights } from './tutorialStyles';
import type { TutorialController } from './tutorialController';

/**
 * 튜토리얼 Step1 표시 가능 여부를 판정하고, 가능한 경우 음악 감지 이벤트 구독을 시작한다.
 *
 * 표시 정책:
 * - DEV 모드: 완료 상태를 매번 리셋 → 다른 모든 스킵 조건을 무시하고 항상 구독 활성화
 * - Simple 모드(빠르게 시작): 약화된 안내(subtle) — 하이라이트/CTA 없이 정보 전달용 툴팁만 1회 노출
 * - Karaoke 모드(차근차근 안내): 기존 강조 안내(default)
 * - Step1 이미 완료: 스킵
 *
 * 실제 툴팁 렌더는 `yt-karaoke-music-detection` 이벤트가 isMusic=true를 보낼 때만 일어난다.
 * 비음악 영상에서는 툴팁이 렌더되지 않고, 이미 렌더된 상태에서 비음악이 감지되면 숨겨진다.
 */
export async function showTutorialStep1IfNeeded(controller: TutorialController): Promise<void> {
  console.log('[Tutorial] showTutorialStep1IfNeeded 호출됨');

  // DEV_MODE: 모든 스킵 조건을 무시하고 완료 상태 초기화 (테스트 편의)
  if (controller.getIsDevMode()) {
    console.log('[Tutorial] DEV_MODE: Step1/Step2 완료 상태 초기화');
    chrome.storage.sync.remove([STORAGE_KEYS.TUTORIAL_STEP1_COMPLETED, STORAGE_KEYS.TUTORIAL_STEP2_COMPLETED]);
    controller.setStep1Completed(false);
    controller.setStep2Completed(false);
  } else {
    // 이미 완료된 경우 표시하지 않음
    const result = await chrome.storage.sync.get([STORAGE_KEYS.TUTORIAL_STEP1_COMPLETED]);
    const completed = (result[STORAGE_KEYS.TUTORIAL_STEP1_COMPLETED] as boolean | undefined) ?? false;
    controller.setStep1Completed(completed);

    console.log('[Tutorial] Step1 완료 상태:', completed);

    if (completed) {
      console.log('[Tutorial] Step1 이미 완료됨, 스킵');
      return;
    }
  }

  // userMode 조회 — 'simple'이면 약화 variant, 그 외(기본 또는 'karaoke')는 강조 variant
  const modeResult = await chrome.storage.sync.get([STORAGE_KEYS.USER_MODE]);
  const isSimpleMode = modeResult[STORAGE_KEYS.USER_MODE] === 'simple';
  console.log('[Tutorial] Step1 variant:', isSimpleMode ? 'subtle' : 'default');

  subscribeStep1ToMusicDetection(controller, isSimpleMode);
}

/**
 * 음악 감지 이벤트를 구독해 Step1 툴팁의 표시/숨김을 제어한다.
 * 중복 등록을 방지하기 위해 controller에 handler 참조를 저장한다.
 */
function subscribeStep1ToMusicDetection(controller: TutorialController, isSimpleMode: boolean): void {
  if (controller.getStep1MusicDetectionHandler()) {
    console.log('[Tutorial] Step1 음악 감지 리스너 이미 등록됨');
    return;
  }

  const handler = (e: Event) => {
    // 완료된 이후 잔여 이벤트는 무시 (completeTutorialStep1에서 정식 제거됨)
    if (controller.isStep1Completed()) return;

    const detail = (e as CustomEvent<{ isMusic: boolean }>).detail;
    if (detail.isMusic) {
      waitForButtonAndRenderStep1(controller, isSimpleMode);
    } else {
      hideTutorialStep1Tooltip(controller);
    }
  };

  window.addEventListener('yt-karaoke-music-detection', handler);
  controller.setStep1MusicDetectionHandler(handler);
  console.log('[Tutorial] Step1 음악 감지 리스너 등록');
}

/**
 * MusicNoteButton이 DOM에 삽입되기를 기다린 뒤 Step1 툴팁을 렌더한다.
 * 이미 툴팁이 렌더된 상태라면 중복 호출을 무시한다.
 */
function waitForButtonAndRenderStep1(controller: TutorialController, isSimpleMode: boolean): void {
  if (document.getElementById('tutorial-tooltip-container')) {
    return;
  }

  console.log('[Tutorial] 버튼 대기 시작...');
  let attempts = 0;

  const waitForButton = setInterval(() => {
    attempts++;
    const musicNoteBtn = document.querySelector('.ytp-music-note-button');
    console.log(`[Tutorial] 버튼 검색 시도 #${attempts}:`, musicNoteBtn ? '발견!' : '미발견');

    if (musicNoteBtn) {
      clearInterval(waitForButton);
      console.log('[Tutorial] 버튼 발견, 툴팁 렌더링 시작');
      renderTutorialStep1(musicNoteBtn as HTMLElement, controller, isSimpleMode);
    }
  }, 200);

  setTimeout(() => {
    clearInterval(waitForButton);
    console.log('[Tutorial] 버튼 대기 타임아웃 (10초)');
  }, 10000);
}

/**
 * Step1 툴팁 DOM/React root를 정리한다 (비음악 영상 전환 시 호출).
 * 완료 처리(setStep1Completed)는 하지 않으므로 이후 음악 영상으로 돌아오면 다시 표시된다.
 */
function hideTutorialStep1Tooltip(controller: TutorialController): void {
  const root = controller.getTutorialTooltipRoot();
  if (!root) return;

  root.unmount();
  controller.setTutorialTooltipRoot(null);

  const container = document.getElementById('tutorial-tooltip-container') as
    | (HTMLElement & { _cleanup?: () => void })
    | null;
  if (container) {
    container._cleanup?.();
    container.remove();
  }
  console.log('[Tutorial] 비음악 영상 감지 - Step1 툴팁 숨김');
}

/** 튜토리얼 툴팁 위치 업데이트 함수 */
function updateTutorialTooltipPosition(): void {
  const tooltipContainer = document.getElementById('tutorial-tooltip-container');
  const musicNoteBtn = document.querySelector('.ytp-music-note-button');

  if (!tooltipContainer || !musicNoteBtn) return;

  const buttonRect = musicNoteBtn.getBoundingClientRect();
  console.log('[Tutorial] 위치 업데이트 - 버튼 좌표:', buttonRect);

  // 전체화면일 때는 툴팁 숨김
  if (document.fullscreenElement) {
    tooltipContainer.style.display = 'none';
    console.log('[Tutorial] 전체화면 모드 - 툴팁 숨김');
    return;
  }
  tooltipContainer.style.display = 'block';

  // 툴팁을 버튼 바로 위에 배치
  const bottomDistance = window.innerHeight - buttonRect.top + 10;
  const rightDistance = window.innerWidth - buttonRect.right + 20;

  console.log('[Tutorial] 새 위치 - bottom:', bottomDistance, 'right:', rightDistance);
  tooltipContainer.style.bottom = `${bottomDistance}px`;
  tooltipContainer.style.right = `${rightDistance}px`;
}

/** 튜토리얼 Step1 렌더링 */
async function renderTutorialStep1(
  buttonElement: HTMLElement,
  controller: TutorialController,
  isSimpleMode: boolean,
): Promise<void> {
  console.log('[Tutorial] renderTutorialStep1 시작 (variant:', isSimpleMode ? 'subtle' : 'default', ')');

  const { TutorialTooltip } = await import('../components/karaoke-mode/TutorialTooltip');
  console.log('[Tutorial] TutorialTooltip 컴포넌트 로드됨');

  // 기존 컨테이너 및 React root 제거 후 새로 생성
  let tooltipContainer = document.getElementById('tutorial-tooltip-container');
  if (tooltipContainer) {
    tooltipContainer.remove();
    const existingRoot = controller.getTutorialTooltipRoot();
    if (existingRoot) {
      existingRoot.unmount();
      controller.setTutorialTooltipRoot(null);
    }
    console.log('[Tutorial] 기존 컨테이너 및 root 제거됨');
  }

  tooltipContainer = document.createElement('div');
  tooltipContainer.id = 'tutorial-tooltip-container';
  document.body.appendChild(tooltipContainer);
  console.log('[Tutorial] 새 컨테이너 생성 및 body에 추가됨');

  // 버튼의 화면 좌표 계산
  const buttonRect = buttonElement.getBoundingClientRect();
  console.log('[Tutorial] 버튼 좌표:', buttonRect);

  const bottomDistance = window.innerHeight - buttonRect.top + 10;
  const rightDistance = window.innerWidth - buttonRect.right + 20;

  console.log('[Tutorial] 계산된 위치 - bottom:', bottomDistance, 'right:', rightDistance);

  // subtle variant는 dismissable이라 close 버튼 클릭이 가능해야 함
  tooltipContainer.style.cssText = `
    position: fixed;
    z-index: 2147483647;
    pointer-events: ${isSimpleMode ? 'auto' : 'none'};
    bottom: ${bottomDistance}px;
    right: ${rightDistance}px;
  `;
  console.log('[Tutorial] 컨테이너 스타일 적용됨');

  const root = ReactDOM.createRoot(tooltipContainer);
  controller.setTutorialTooltipRoot(root);

  if (isSimpleMode) {
    // Simple 모드: 약화 안내 — 자동 닫힘 8초, 닫힘 시 step1 완료 처리하여 재노출 방지
    root.render(
      <TutorialTooltip
        step="step1"
        variant="subtle"
        visible={true}
        autoHideDelay={8000}
        onDismiss={() => completeTutorialStep1(controller)}
      />,
    );
  } else {
    root.render(<TutorialTooltip step="step1" visible={true} />);

    // YouTube 하단 컨트롤 바 고정 표시 (auto-hide 방지) — 강조 안내일 때만
    const moviePlayer = document.getElementById('movie_player');
    if (moviePlayer) {
      moviePlayer.classList.remove('ytp-autohide');
    }

    // toolbar 버튼도 하이라이트 — 강조 안내일 때만
    injectTutorialHighlightStyles();
    const toolbarBtn = document.querySelector('.ytk-toolbar-karaoke-btn') as HTMLElement | null;
    if (toolbarBtn) {
      toolbarBtn.classList.add('ytk-tutorial-highlight');
    }
  }

  // 모드 변경 시 위치 업데이트를 위한 이벤트 리스너 등록
  const handleModeChange = () => {
    setTimeout(updateTutorialTooltipPosition, 300);
  };

  document.addEventListener('fullscreenchange', handleModeChange);
  window.addEventListener('resize', handleModeChange);
  window.addEventListener('scroll', updateTutorialTooltipPosition, true);

  // 영화관 모드 변경 감지
  let theaterModeObserver: MutationObserver | null = null;
  const watchFlexy = document.querySelector('ytd-watch-flexy');
  if (watchFlexy) {
    theaterModeObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'theater') {
          console.log('[Tutorial] 영화관 모드 변경 감지');
          handleModeChange();
        }
      }
    });
    theaterModeObserver.observe(watchFlexy, { attributes: true, attributeFilter: ['theater'] });
  }

  // 컨테이너에 cleanup 함수 저장
  (tooltipContainer as HTMLElement & { _cleanup?: () => void })._cleanup = () => {
    document.removeEventListener('fullscreenchange', handleModeChange);
    window.removeEventListener('resize', handleModeChange);
    window.removeEventListener('scroll', updateTutorialTooltipPosition, true);
    theaterModeObserver?.disconnect();
  };

  console.log('[Tutorial] Step1 툴팁 표시됨, 버튼 위치:', buttonRect);
}

/** 튜토리얼 Step1 완료 처리 */
export function completeTutorialStep1(controller: TutorialController): void {
  controller.setStep1Completed(true);

  // DEV_MODE에서는 저장하지 않음 (테스트 편의)
  if (!controller.getIsDevMode()) {
    chrome.storage.sync.set({ [STORAGE_KEYS.TUTORIAL_STEP1_COMPLETED]: true });
  } else {
    console.log('[Tutorial] DEV_MODE: Step1 완료 저장 스킵');
  }

  // 음악 감지 이벤트 구독 해제 (완료 이후 불필요)
  const musicHandler = controller.getStep1MusicDetectionHandler();
  if (musicHandler) {
    window.removeEventListener('yt-karaoke-music-detection', musicHandler);
    controller.setStep1MusicDetectionHandler(null);
  }

  // 하이라이트 해제 + YouTube 하단바 복원
  clearAllHighlights();
  const moviePlayer = document.getElementById('movie_player');
  if (moviePlayer) {
    moviePlayer.classList.remove('ytp-autohide-active');
  }

  // 툴팁 제거
  const root = controller.getTutorialTooltipRoot();
  if (root) {
    root.unmount();
    controller.setTutorialTooltipRoot(null);
  }
  const tooltipContainer = document.getElementById('tutorial-tooltip-container') as
    | (HTMLElement & { _cleanup?: () => void })
    | null;
  if (tooltipContainer) {
    tooltipContainer._cleanup?.();
    tooltipContainer.remove();
  }

  console.log('[Tutorial] Step1 완료 처리됨');
}

/** 튜토리얼 Step2 표시 (원래 화면 복귀 안내) */
export async function showTutorialStep2(controller: TutorialController): Promise<void> {
  // 이미 완료된 경우 표시하지 않음
  const result = await chrome.storage.sync.get([STORAGE_KEYS.TUTORIAL_STEP2_COMPLETED]);
  const completed = (result[STORAGE_KEYS.TUTORIAL_STEP2_COMPLETED] as boolean | undefined) ?? false;
  controller.setStep2Completed(completed);

  if (completed) {
    console.log('[Tutorial] Step2 이미 완료됨, 스킵');
    return;
  }

  // musicNoteButton 위치 확인
  const musicNoteBtn = document.querySelector('.ytp-music-note-button');
  if (!musicNoteBtn) {
    console.log('[Tutorial] Step2: musicNoteButton을 찾을 수 없음');
    return;
  }

  const { TutorialTooltip } = await import('../components/karaoke-mode/TutorialTooltip');

  let step2Container = document.getElementById('tutorial-step2-container');
  if (step2Container) {
    step2Container.remove();
  }

  step2Container = document.createElement('div');
  step2Container.id = 'tutorial-step2-container';

  // 가라오케 모드 컨테이너 안에 추가하여 z-index 문제 해결
  const fullBleedContainer = document.getElementById('full-bleed-container');
  if (fullBleedContainer) {
    fullBleedContainer.appendChild(step2Container);
  } else {
    document.body.appendChild(step2Container);
  }

  // 버튼의 화면 좌표 계산
  const buttonRect = musicNoteBtn.getBoundingClientRect();
  const bottomDistance = window.innerHeight - buttonRect.top + 10;

  // 사이드바가 있으면 사이드바 왼쪽에 배치
  const sidebar = document.querySelector('[class*="sidebarContainer"]');
  let rightDistance: number;

  if (sidebar) {
    const sidebarRect = sidebar.getBoundingClientRect();
    rightDistance = window.innerWidth - sidebarRect.left + 80;
  } else {
    rightDistance = window.innerWidth - buttonRect.right + 60;
  }

  step2Container.style.cssText = `
    position: fixed;
    z-index: 2147483647;
    pointer-events: none;
    bottom: ${bottomDistance}px;
    right: ${rightDistance}px;
  `;

  const isDevMode = controller.getIsDevMode();
  const step2Root = ReactDOM.createRoot(step2Container);
  step2Root.render(
    <TutorialTooltip
      step="step2"
      visible={true}
      autoHideDelay={10000}
      onDismiss={() => {
        controller.setStep2Completed(true);
        if (!isDevMode) {
          chrome.storage.sync.set({ [STORAGE_KEYS.TUTORIAL_STEP2_COMPLETED]: true });
        } else {
          console.log('[Tutorial] DEV_MODE: Step2 완료 저장 스킵');
        }
        step2Root.unmount();
        step2Container?.remove();
        console.log('[Tutorial] Step2 완료 처리됨');
      }}
    />,
  );

  console.log('[Tutorial] Step2 툴팁 표시됨');
}
