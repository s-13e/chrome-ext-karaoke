// menuTutorialRunner.tsx
// 메뉴 튜토리얼 제네릭 실행 함수 (Tutorial 2-6 공통) + Tutorial 1 별도

import React from 'react';
import ReactDOM from 'react-dom/client';
import type { MenuTutorialConfig } from './tutorialTypes';
import { clearAllHighlights } from './tutorialStyles';
import type { TutorialController } from './tutorialController';

const MENU_CONTAINER_ID = 'menu-tutorial-container';

/**
 * Tutorial 2-6 공통 실행 함수
 * config의 substep 정의와 getHighlightForStep에 따라 위치/하이라이트를 동적으로 처리
 */
export async function showMenuTutorial(config: MenuTutorialConfig, controller: TutorialController): Promise<void> {
  const { TutorialTooltip } = await import('../components/karaoke-mode/TutorialTooltip');

  // navigateToMainFirst: 사이드바를 메인 뷰로 이동
  if (config.navigateToMainFirst) {
    window.dispatchEvent(new CustomEvent('tutorial-go-main'));
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  // 기존 컨테이너 정리
  controller.cleanupMenuTutorial();

  const container = document.createElement('div');
  container.id = MENU_CONTAINER_ID;
  document.body.appendChild(container);
  controller.setMenuTutorialContainer(container);

  let currentSubstep = 0;

  const updatePositionAndHighlight = (step: number) => {
    const currentContainer = controller.getMenuTutorialContainer();
    if (!currentContainer) return;

    clearAllHighlights();

    const result = config.getHighlightForStep(step);
    for (const el of result.targetElements) {
      el.classList.add('ytk-tutorial-highlight');
    }
    currentContainer.style.cssText = `position: fixed; ${result.positionStyle} z-index: 10000;`;
  };

  const renderTooltip = () => {
    if (!controller.getMenuTutorialRoot()) {
      controller.setMenuTutorialRoot(ReactDOM.createRoot(container));
    }

    updatePositionAndHighlight(currentSubstep);

    controller.getMenuTutorialRoot()?.render(
      <TutorialTooltip
        step="feature"
        visible={true}
        featureStepIndex={0}
        featureSubstepIndex={currentSubstep}
        customSubsteps={config.substeps as Array<{ titleKey: string; descKey: string }>}
        onDismiss={() => {
          clearAllHighlights();
          controller.cleanupMenuTutorial();
          window.dispatchEvent(new CustomEvent('tutorial-cancel'));
        }}
        onFeatureStepChange={(_, newSubstep) => {
          if (newSubstep >= config.substeps.length) {
            // 모든 스텝 완료
            clearAllHighlights();
            controller.cleanupMenuTutorial();
            chrome.storage.sync.set({ [config.storageKey]: true });
            window.dispatchEvent(
              new CustomEvent('tutorial-complete', {
                detail: { tutorialId: config.tutorialId },
              }),
            );
          } else if (newSubstep >= 0) {
            currentSubstep = newSubstep;
            renderTooltip();
          }
        }}
      />,
    );
  };

  renderTooltip();
}

/**
 * Tutorial 1: 가라오케 모드 시작 (단일 스텝, 버튼 클릭 완료)
 * 패턴이 Tutorial 2-6과 다르므로 별도 함수로 유지
 */
export async function showTutorial1FromMenu(): Promise<void> {
  const musicNoteBtn = document.querySelector('#ytk-music-note-btn');
  if (!musicNoteBtn) {
    console.warn('[Tutorial] 뮤직노트 버튼을 찾을 수 없음');
    window.dispatchEvent(new CustomEvent('tutorial-cancel'));
    return;
  }

  const { TutorialTooltip } = await import('../components/karaoke-mode/TutorialTooltip');

  // 기존 컨테이너 제거
  let container = document.getElementById(MENU_CONTAINER_ID);
  if (container) container.remove();

  container = document.createElement('div');
  container.id = MENU_CONTAINER_ID;
  document.body.appendChild(container);

  // 버튼 위치 계산
  const buttonRect = musicNoteBtn.getBoundingClientRect();
  const bottomDistance = window.innerHeight - buttonRect.top + 15;
  const rightDistance = window.innerWidth - buttonRect.right + buttonRect.width / 2 - 20;

  container.style.cssText = `
    position: fixed;
    bottom: ${bottomDistance}px;
    right: ${rightDistance}px;
    z-index: 10000;
    pointer-events: none;
  `;

  // 버튼 하이라이트 효과
  musicNoteBtn.classList.add('ytk-tutorial-highlight');

  const root = ReactDOM.createRoot(container);
  root.render(
    <TutorialTooltip
      step="step1"
      visible={true}
      onDismiss={() => {
        root.unmount();
        container?.remove();
        musicNoteBtn.classList.remove('ytk-tutorial-highlight');
        window.dispatchEvent(
          new CustomEvent('tutorial-complete', {
            detail: { tutorialId: 'tutorial1' },
          }),
        );
      }}
    />,
  );

  // 버튼 클릭 시 튜토리얼 완료 처리
  const handleButtonClick = () => {
    root.unmount();
    container?.remove();
    musicNoteBtn.classList.remove('ytk-tutorial-highlight');
    musicNoteBtn.removeEventListener('click', handleButtonClick);
    window.dispatchEvent(
      new CustomEvent('tutorial-complete', {
        detail: { tutorialId: 'tutorial1' },
      }),
    );
  };
  musicNoteBtn.addEventListener('click', handleButtonClick, { once: true });
}
