// featureTutorialRunner.tsx
// Feature 튜토리얼 (가이드 워크스루) 실행 및 위치 계산

import React from 'react';
import ReactDOM from 'react-dom/client';
import type { TutorialController } from './tutorialController';

/** Feature 튜토리얼 위치 계산 */
function calculateFeaturePosition(position: string): string {
  const bottomBar = document.querySelector('[class*="bottomContainer"]');
  const sidebar = document.querySelector('[class*="sidebarContainer"]');

  const bottomBarHeight = bottomBar?.getBoundingClientRect().height || 100;
  const bottomDistance = bottomBarHeight + 15;

  switch (position) {
    case 'bottom-center': {
      if (sidebar) {
        const sidebarRect = sidebar.getBoundingClientRect();
        const availableWidth = sidebarRect.left;
        const centerX = availableWidth / 2;
        return `bottom: ${bottomDistance}px; left: ${centerX}px; transform: translateX(-50%);`;
      }
      return `bottom: ${bottomDistance}px; left: 50%; transform: translateX(-30%);`;
    }
    case 'bottom-right': {
      if (sidebar) {
        const sidebarRect = sidebar.getBoundingClientRect();
        return `bottom: ${bottomDistance}px; right: ${window.innerWidth - sidebarRect.left + 20}px;`;
      }
      return `bottom: ${bottomDistance}px; right: 120px;`;
    }
    case 'sidebar-left': {
      if (sidebar) {
        const sidebarRect = sidebar.getBoundingClientRect();
        return `top: ${sidebarRect.top + 100}px; right: ${window.innerWidth - sidebarRect.left + 15}px;`;
      }
      return `bottom: ${bottomDistance}px; right: 350px;`;
    }
    default:
      return `bottom: ${bottomDistance}px; left: 50%; transform: translateX(-50%);`;
  }
}

/** Feature 튜토리얼 표시 */
export async function showFeatureTutorial(controller: TutorialController): Promise<void> {
  console.log('[Tutorial] showFeatureTutorial 시작');

  const { TutorialTooltip, FEATURE_TUTORIAL_CONFIG } = await import('../components/karaoke-mode/TutorialTooltip');

  // 초기화
  controller.setCurrentFeatureStepIndex(0);
  controller.setCurrentFeatureSubstepIndex(0);
  controller.setFeatureTutorialActive(true);

  // 사이드바에 상태 알림
  window.dispatchEvent(
    new CustomEvent('tutorial-state-change', {
      detail: { active: true },
    }),
  );

  // 초기 렌더링
  renderFeatureTutorial(TutorialTooltip, FEATURE_TUTORIAL_CONFIG, controller);

  console.log('[Tutorial] Feature 튜토리얼 표시됨');
}

/** Feature 튜토리얼 렌더링 (위치 + 컴포넌트) */
async function renderFeatureTutorial(
  TutorialTooltip: React.FC<{
    step: 'step1' | 'step2' | 'feature';
    visible: boolean;
    onDismiss?: () => void;
    featureStepIndex?: number;
    featureSubstepIndex?: number;
    onFeatureStepChange?: (stepIndex: number, substepIndex: number) => void;
  }>,
  config: Array<{
    id: string;
    position: 'bottom-center' | 'bottom-right' | 'sidebar-left';
    substeps: Array<{ titleKey: string; descKey: string }>;
  }>,
  controller: TutorialController,
): Promise<void> {
  // 기존 컨테이너 제거
  const existingContainer = controller.getFeatureTutorialContainer();
  if (existingContainer) {
    existingContainer.remove();
  }
  const existingRoot = controller.getFeatureTutorialRoot();
  if (existingRoot) {
    existingRoot.unmount();
    controller.setFeatureTutorialRoot(null);
  }

  const featureContainer = document.createElement('div');
  featureContainer.id = 'feature-tutorial-container';
  controller.setFeatureTutorialContainer(featureContainer);

  // 가라오케 모드 컨테이너(full-bleed-container) 안에 추가
  const fullBleedContainer = document.getElementById('full-bleed-container');
  if (fullBleedContainer) {
    fullBleedContainer.appendChild(featureContainer);
  } else {
    document.body.appendChild(featureContainer);
  }

  // 현재 Step의 위치 설정에 따라 위치 계산
  const currentStepIndex = controller.getCurrentFeatureStepIndex();
  const currentSubstepIndex = controller.getCurrentFeatureSubstepIndex();
  const currentConfig = config[currentStepIndex];
  const position = currentConfig?.position || 'bottom-center';

  const positionStyle = calculateFeaturePosition(position);
  featureContainer.style.cssText = `
    position: fixed;
    z-index: 2147483647;
    ${positionStyle}
  `;

  const featureRoot = ReactDOM.createRoot(featureContainer);
  controller.setFeatureTutorialRoot(featureRoot);

  featureRoot.render(
    <TutorialTooltip
      step="feature"
      visible={true}
      featureStepIndex={currentStepIndex}
      featureSubstepIndex={currentSubstepIndex}
      onDismiss={() => {
        hideFeatureTutorial(controller);
      }}
      onFeatureStepChange={async (stepIndex: number, substepIndex: number) => {
        console.log(`[Tutorial] Step 변경: ${stepIndex}-${substepIndex}`);
        const prevStepIndex = controller.getCurrentFeatureStepIndex();
        controller.setCurrentFeatureStepIndex(stepIndex);
        controller.setCurrentFeatureSubstepIndex(substepIndex);

        // Step이 변경되면 위치도 변경해야 함
        if (prevStepIndex !== stepIndex) {
          const module = await import('../components/karaoke-mode/TutorialTooltip');
          renderFeatureTutorial(module.TutorialTooltip, module.FEATURE_TUTORIAL_CONFIG, controller);
        } else {
          // 같은 Step 내 서브스텝 변경 - 리렌더만
          const currentRoot = controller.getFeatureTutorialRoot();
          currentRoot?.render(
            <TutorialTooltip
              step="feature"
              visible={true}
              featureStepIndex={controller.getCurrentFeatureStepIndex()}
              featureSubstepIndex={controller.getCurrentFeatureSubstepIndex()}
              onDismiss={() => {
                hideFeatureTutorial(controller);
              }}
              onFeatureStepChange={arguments[0] as (stepIndex: number, substepIndex: number) => void}
            />,
          );
        }
      }}
    />,
  );
}

/** Feature 튜토리얼 숨기기 */
export function hideFeatureTutorial(controller: TutorialController): void {
  console.log('[Tutorial] hideFeatureTutorial 시작');

  const root = controller.getFeatureTutorialRoot();
  if (root) {
    root.unmount();
    controller.setFeatureTutorialRoot(null);
  }

  const container = controller.getFeatureTutorialContainer();
  if (container) {
    container.remove();
    controller.setFeatureTutorialContainer(null);
  }

  controller.setFeatureTutorialActive(false);

  // 사이드바에 상태 알림
  window.dispatchEvent(
    new CustomEvent('tutorial-state-change', {
      detail: { active: false },
    }),
  );

  console.log('[Tutorial] Feature 튜토리얼 숨김 완료');
}
