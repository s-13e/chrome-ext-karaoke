// autoFlowTutorial.tsx
// 자동 튜토리얼 (Step 1: 카라오케 모드 활성화 안내, Step 2: 복귀 안내)

import ReactDOM from 'react-dom/client';
import { STORAGE_KEYS } from '@constants/storageKeys';
import type { TutorialController } from './tutorialController';

/** 튜토리얼 Step1 표시 (가라오케 모드 활성화 안내) */
export async function showTutorialStep1IfNeeded(controller: TutorialController): Promise<void> {
  console.log('[Tutorial] showTutorialStep1IfNeeded 호출됨');

  // 이미 완료된 경우 표시하지 않음
  const result = await chrome.storage.sync.get([STORAGE_KEYS.TUTORIAL_STEP1_COMPLETED]);
  const completed = (result[STORAGE_KEYS.TUTORIAL_STEP1_COMPLETED] as boolean | undefined) ?? false;
  controller.setStep1Completed(completed);

  console.log('[Tutorial] Step1 완료 상태:', completed);

  if (completed) {
    console.log('[Tutorial] Step1 이미 완료됨, 스킵');
    return;
  }

  console.log('[Tutorial] 버튼 대기 시작...');
  let attempts = 0;

  // 버튼이 DOM에 렌더링될 때까지 대기
  const waitForButton = setInterval(() => {
    attempts++;
    const musicNoteBtn = document.querySelector('.ytp-music-note-button');
    console.log(`[Tutorial] 버튼 검색 시도 #${attempts}:`, musicNoteBtn ? '발견!' : '미발견');

    if (musicNoteBtn) {
      clearInterval(waitForButton);
      console.log('[Tutorial] 버튼 발견, 툴팁 렌더링 시작');
      renderTutorialStep1(musicNoteBtn as HTMLElement, controller);
    }
  }, 200);

  // 10초 후에도 버튼이 없으면 취소
  setTimeout(() => {
    clearInterval(waitForButton);
    console.log('[Tutorial] 버튼 대기 타임아웃 (10초)');
  }, 10000);
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
async function renderTutorialStep1(buttonElement: HTMLElement, controller: TutorialController): Promise<void> {
  console.log('[Tutorial] renderTutorialStep1 시작');

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

  tooltipContainer.style.cssText = `
    position: fixed;
    z-index: 2147483647;
    pointer-events: none;
    bottom: ${bottomDistance}px;
    right: ${rightDistance}px;
  `;
  console.log('[Tutorial] 컨테이너 스타일 적용됨');

  const root = ReactDOM.createRoot(tooltipContainer);
  controller.setTutorialTooltipRoot(root);

  root.render(<TutorialTooltip step="step1" visible={true} />);

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
