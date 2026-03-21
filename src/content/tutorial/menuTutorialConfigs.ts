// menuTutorialConfigs.ts
// 메뉴 튜토리얼 1-6 개별 설정 및 위치 계산 헬퍼

import { STORAGE_KEYS } from '@constants/storageKeys';
import type { MenuTutorialConfig, StepHighlightResult } from './tutorialTypes';

// ─── 위치 계산 헬퍼 ────────────────────────────────────

/** 하단바/사이드바 기준 fallback 위치 계산 */
export function calculateMenuTutorialPosition(position: 'bottom-center' | 'bottom-right' | 'sidebar-left'): string {
  const bottomContainer = document.querySelector('.ytk-bottom-container') as HTMLElement;
  const sidebarContainer = document.querySelector('[class*="sidebarContainer"]') as HTMLElement;

  switch (position) {
    case 'bottom-center': {
      if (bottomContainer) {
        const rect = bottomContainer.getBoundingClientRect();
        const bottom = window.innerHeight - rect.top + 20;
        const left = rect.left + rect.width / 2;
        return `bottom: ${bottom}px; left: ${left}px; transform: translateX(-50%);`;
      }
      return 'bottom: 150px; left: 50%; transform: translateX(-50%);';
    }
    case 'bottom-right': {
      if (bottomContainer) {
        const rect = bottomContainer.getBoundingClientRect();
        const bottom = window.innerHeight - rect.top + 20;
        const right = window.innerWidth - rect.right + 50;
        return `bottom: ${bottom}px; right: ${right}px;`;
      }
      return 'bottom: 150px; right: 100px;';
    }
    case 'sidebar-left': {
      if (sidebarContainer) {
        const rect = sidebarContainer.getBoundingClientRect();
        const top = rect.top + 100;
        const right = window.innerWidth - rect.left + 20;
        return `top: ${top}px; right: ${right}px;`;
      }
      return 'top: 200px; right: 400px;';
    }
    default:
      return 'bottom: 150px; left: 50%; transform: translateX(-50%);';
  }
}

// ─── Tutorial 2: 싱크 조절 ─────────────────────────────

export const Tutorial2Config: MenuTutorialConfig = {
  tutorialId: 'tutorial2',
  storageKey: STORAGE_KEYS.TUTORIAL_SYNC_COMPLETED,
  navigateToMainFirst: true,
  substeps: [
    { titleKey: 'extTutorial2Step1Title', descKey: 'extTutorial2Step1Desc' },
    { titleKey: 'extTutorial2Step2Title', descKey: 'extTutorial2Step2Desc' },
  ],
  getHighlightForStep(step: number): StepHighlightResult {
    if (step === 0) {
      const syncButton = document.querySelector(
        '[aria-label*="싱크셋"], [aria-label*="Sync"], [aria-label*="同期"]',
      ) as HTMLElement | null;
      if (syncButton) {
        const rect = syncButton.getBoundingClientRect();
        const bottom = window.innerHeight - rect.top + 15;
        const left = rect.left + rect.width / 2;
        return {
          targetElements: [syncButton],
          positionStyle: `bottom: ${bottom}px; left: ${left}px; transform: translateX(-50%);`,
        };
      }
      // fallback: bottom-center (하단바 기준)
      const bottomContainer = document.querySelector('.ytk-bottom-container') as HTMLElement;
      if (bottomContainer) {
        const rect = bottomContainer.getBoundingClientRect();
        const bottom = window.innerHeight - rect.top + 20;
        return {
          targetElements: [],
          positionStyle: `bottom: ${bottom}px; left: 50%; transform: translateX(-50%);`,
        };
      }
    } else {
      // Step 2-2: 사이드바의 싱크셋 목록 버튼
      const sidebarContent = document.querySelector('[class*="sidebarContent"]');
      if (sidebarContent) {
        const buttons = sidebarContent.querySelectorAll('button');
        const syncOffsetButton = buttons[4] as HTMLElement | undefined;
        if (syncOffsetButton) {
          const rect = syncOffsetButton.getBoundingClientRect();
          const top = rect.top + rect.height / 2;
          const right = window.innerWidth - rect.left + 20;
          return {
            targetElements: [syncOffsetButton],
            positionStyle: `top: ${top}px; right: ${right}px; transform: translateY(-50%);`,
          };
        }
        // fallback: 사이드바 왼쪽
        const sidebarContainer = document.querySelector('[class*="sidebarContainer"]') as HTMLElement;
        if (sidebarContainer) {
          const rect = sidebarContainer.getBoundingClientRect();
          const top = rect.top + 100;
          const right = window.innerWidth - rect.left + 20;
          return {
            targetElements: [],
            positionStyle: `top: ${top}px; right: ${right}px;`,
          };
        }
      }
    }
    return { targetElements: [], positionStyle: calculateMenuTutorialPosition('bottom-center') };
  },
};

// ─── Tutorial 3: 구간 반복 ─────────────────────────────

export const Tutorial3Config: MenuTutorialConfig = {
  tutorialId: 'tutorial3',
  storageKey: STORAGE_KEYS.TUTORIAL_LOOP_COMPLETED,
  substeps: [
    { titleKey: 'extTutorial3Step1Title', descKey: 'extTutorial3Step1Desc' },
    { titleKey: 'extTutorial3Step2Title_v2', descKey: 'extTutorial3Step2Desc_v2' },
    { titleKey: 'extTutorial3Step6Title', descKey: 'extTutorial3Step6Desc' },
    { titleKey: 'extTutorial3Step7Title', descKey: 'extTutorial3Step7Desc' },
  ],
  getHighlightForStep(step: number): StepHighlightResult {
    const bottomContainer = document.querySelector('.ytk-bottom-container');

    if (step <= 1) {
      // Step 1-2: 구간 반복 버튼 (ko: "구간반복", en/ja/es/pt/zh: "A-B ...")
      const targetButton = bottomContainer?.querySelector(
        '[aria-label*="구간"], [aria-label*="A-B"]',
      ) as HTMLElement | null;
      if (targetButton) {
        const rect = targetButton.getBoundingClientRect();
        const bottom = window.innerHeight - rect.top + 15;
        const left = rect.left + rect.width / 2;
        return {
          targetElements: [targetButton],
          positionStyle: `bottom: ${bottom}px; left: ${left}px; transform: translateX(-50%);`,
        };
      }
    } else if (step === 2) {
      // Step 3: 연속 재생 — 같은 루프 버튼 하이라이트
      const targetButton = bottomContainer?.querySelector(
        '[aria-label*="구간"], [aria-label*="A-B"]',
      ) as HTMLElement | null;
      if (targetButton) {
        const rect = targetButton.getBoundingClientRect();
        const bottom = window.innerHeight - rect.top + 15;
        const left = rect.left + rect.width / 2;
        return {
          targetElements: [targetButton],
          positionStyle: `bottom: ${bottom}px; left: ${left}px; transform: translateX(-50%);`,
        };
      }
    } else {
      // Step 4: 이전/다음 버튼 (둘 다 강조)
      const prevButton = bottomContainer?.querySelector(
        '[aria-label*="이전"], [aria-label*="Prev"], [aria-label*="前"]',
      ) as HTMLElement | null;
      const nextButton = bottomContainer?.querySelector(
        '[aria-label*="다음"], [aria-label*="Next"], [aria-label*="次"]',
      ) as HTMLElement | null;

      const targets: HTMLElement[] = [];
      if (prevButton) targets.push(prevButton);
      if (nextButton) targets.push(nextButton);

      if (prevButton) {
        const rect = prevButton.getBoundingClientRect();
        const bottom = window.innerHeight - rect.top + 15;
        return {
          targetElements: targets,
          positionStyle: `bottom: ${bottom}px; left: ${rect.left}px;`,
        };
      }
    }

    return {
      targetElements: [],
      positionStyle: 'bottom: 150px; left: 50%; transform: translateX(-50%);',
    };
  },
};

// ─── Tutorial 4: 커스텀 가사 ───────────────────────────

export const Tutorial4Config: MenuTutorialConfig = {
  tutorialId: 'tutorial4',
  storageKey: STORAGE_KEYS.TUTORIAL_CUSTOM_LYRICS_COMPLETED,
  substeps: [
    { titleKey: 'extTutorial4Step1Title', descKey: 'extTutorial4Step1Desc' },
    { titleKey: 'extTutorial4Step2Title', descKey: 'extTutorial4Step2Desc' },
    { titleKey: 'extTutorial4Step3Title', descKey: 'extTutorial4Step3Desc' },
  ],
  getHighlightForStep(step: number): StepHighlightResult {
    const bottomContainer = document.querySelector('.ytk-bottom-container');
    let targetButton: HTMLElement | null = null;
    let secondaryButton: HTMLElement | null = null;

    if (step === 0) {
      targetButton = bottomContainer?.querySelector(
        '[aria-label="가사 방식"], [aria-label*="Lyrics Display"], [aria-label*="歌詞表示"]',
      ) as HTMLElement | null;
    } else if (step === 1) {
      targetButton = bottomContainer?.querySelector(
        '[aria-label="현재 가사"], [aria-label*="Current Lyrics"], [aria-label*="現在の歌詞"]',
      ) as HTMLElement | null;
      secondaryButton = bottomContainer?.querySelector(
        '[aria-label="발음 표시"], [aria-label*="Pronunciation"], [aria-label*="発音表示"]',
      ) as HTMLElement | null;
    } else {
      targetButton = bottomContainer?.querySelector(
        '[aria-label="텍스트 효과"], [aria-label*="Text Effect"], [aria-label*="テキスト効果"]',
      ) as HTMLElement | null;
    }

    if (targetButton) {
      const targets: HTMLElement[] = [targetButton];
      if (secondaryButton) targets.push(secondaryButton);

      const rect = targetButton.getBoundingClientRect();
      const bottom = window.innerHeight - rect.top + 15;

      if (step === 2) {
        // Step 3: 텍스트 효과 버튼은 오른쪽 정렬
        const right = window.innerWidth - rect.right;
        return {
          targetElements: targets,
          positionStyle: `bottom: ${bottom}px; right: ${right}px;`,
        };
      }
      // Step 1, 2: 중앙 정렬
      const left = rect.left + rect.width / 2;
      return {
        targetElements: targets,
        positionStyle: `bottom: ${bottom}px; left: ${left}px; transform: translateX(-50%);`,
      };
    }

    return { targetElements: [], positionStyle: calculateMenuTutorialPosition('bottom-center') };
  },
};

// ─── Tutorial 5: 사이드바 기능 ─────────────────────────

export const Tutorial5Config: MenuTutorialConfig = {
  tutorialId: 'tutorial5',
  storageKey: STORAGE_KEYS.TUTORIAL_SIDEBAR_COMPLETED,
  navigateToMainFirst: true,
  substeps: [
    { titleKey: 'extTutorial5Step1Title', descKey: 'extTutorial5Step1Desc' },
    { titleKey: 'extTutorial5Step2Title', descKey: 'extTutorial5Step2Desc' },
    { titleKey: 'extTutorial5Step3Title', descKey: 'extTutorial5Step3Desc' },
    { titleKey: 'extTutorial5Step4Title', descKey: 'extTutorial5Step4Desc' },
  ],
  getHighlightForStep(step: number): StepHighlightResult {
    const sidebarContent = document.querySelector('[class*="sidebarContent"]');
    if (!sidebarContent) {
      return { targetElements: [], positionStyle: calculateMenuTutorialPosition('sidebar-left') };
    }

    const buttons = sidebarContent.querySelectorAll('button');
    let targetButton: HTMLElement | null = null;
    let secondaryButton: HTMLElement | null = null;

    if (step === 0) {
      targetButton = (buttons[0] as HTMLElement | undefined) ?? null;
    } else if (step === 1) {
      targetButton = (buttons[1] as HTMLElement | undefined) ?? null;
    } else if (step === 2) {
      targetButton = (buttons[2] as HTMLElement | undefined) ?? null;
      secondaryButton = (buttons[3] as HTMLElement | undefined) ?? null;
    } else if (step === 3) {
      targetButton = (buttons[4] as HTMLElement | undefined) ?? null;
    }

    if (targetButton) {
      const targets: HTMLElement[] = [targetButton];
      if (secondaryButton) targets.push(secondaryButton);

      const rect = targetButton.getBoundingClientRect();
      const top = rect.top + rect.height / 2;
      const right = window.innerWidth - rect.left + 20;
      return {
        targetElements: targets,
        positionStyle: `top: ${top}px; right: ${right}px; transform: translateY(-50%);`,
      };
    }

    return { targetElements: [], positionStyle: calculateMenuTutorialPosition('sidebar-left') };
  },
};

// ─── Tutorial 6: 점프 기능 ─────────────────────────────

export const Tutorial6Config: MenuTutorialConfig = {
  tutorialId: 'tutorial6',
  storageKey: STORAGE_KEYS.TUTORIAL_JUMP_COMPLETED,
  substeps: [
    { titleKey: 'extTutorial6Step1Title', descKey: 'extTutorial6Step1Desc' },
    { titleKey: 'extTutorial6Step2Title', descKey: 'extTutorial6Step2Desc' },
    { titleKey: 'extTutorial6Step3Title', descKey: 'extTutorial6Step3Desc' },
  ],
  getHighlightForStep(step: number): StepHighlightResult {
    const bottomContainer = document.querySelector('.ytk-bottom-container');
    let targetButton: HTMLElement | null = null;

    if (step === 0) {
      targetButton = bottomContainer?.querySelector(
        '[aria-label="간주점프"], [aria-label*="Skip Intro"], [aria-label*="イントロスキップ"]',
      ) as HTMLElement | null;
    } else if (step === 1) {
      targetButton = bottomContainer?.querySelector(
        '[aria-label="자동점프"], [aria-label*="Auto Skip"], [aria-label*="オートスキップ"]',
      ) as HTMLElement | null;
    } else {
      targetButton = bottomContainer?.querySelector(
        '[aria-label="노래처음으로"], [aria-label*="Restart"], [aria-label*="最初に戻る"]',
      ) as HTMLElement | null;
    }

    if (targetButton) {
      const rect = targetButton.getBoundingClientRect();
      const bottom = window.innerHeight - rect.top + 15;
      const left = rect.left + rect.width / 2;
      return {
        targetElements: [targetButton],
        positionStyle: `bottom: ${bottom}px; left: ${left}px; transform: translateX(-50%);`,
      };
    }

    return { targetElements: [], positionStyle: calculateMenuTutorialPosition('bottom-center') };
  },
};

// ─── 새 튜토리얼: 사이드바 탭 기반 ─────────────────────

/** 사이드바 탭 버튼을 찾아 하이라이트하는 헬퍼 */
function findSidebarTabButton(tabIndex: number): StepHighlightResult {
  const iconNav = document.querySelector('[class*="iconNav"]');
  if (iconNav) {
    const buttons = iconNav.querySelectorAll('button');
    const targetButton = buttons[tabIndex] as HTMLElement | undefined;
    if (targetButton) {
      const rect = targetButton.getBoundingClientRect();
      const top = rect.top + rect.height / 2;
      const right = window.innerWidth - rect.left + 20;
      return {
        targetElements: [targetButton],
        positionStyle: `top: ${top}px; right: ${right}px; transform: translateY(-50%);`,
      };
    }
  }
  return { targetElements: [], positionStyle: calculateMenuTutorialPosition('sidebar-left') };
}

/** 사이드바 컨테이너 내 aria-label로 버튼을 찾아 하이라이트하는 헬퍼 */
function findSidebarButton(ariaLabels: string[]): StepHighlightResult {
  const sidebarContainer = document.querySelector('[class*="sidebarContainer"]');
  if (!sidebarContainer) {
    return { targetElements: [], positionStyle: calculateMenuTutorialPosition('sidebar-left') };
  }

  for (const label of ariaLabels) {
    const btn = sidebarContainer.querySelector(`[aria-label*="${label}"]`) as HTMLElement | null;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const top = rect.top + rect.height / 2;
      const right = window.innerWidth - rect.left + 20;
      return {
        targetElements: [btn],
        positionStyle: `top: ${top}px; right: ${right}px; transform: translateY(-50%);`,
      };
    }
  }
  return { targetElements: [], positionStyle: calculateMenuTutorialPosition('sidebar-left') };
}

// ─── Tutorial: 가사 & 컨트롤 ─────────────────────────

export const TutorialLyricsConfig: MenuTutorialConfig = {
  tutorialId: 'tutorialLyrics',
  storageKey: STORAGE_KEYS.TUTORIAL_LYRICS_COMPLETED,
  substeps: [
    { titleKey: 'extTutorialLyricsStep1Title', descKey: 'extTutorialLyricsStep1Desc' },
    { titleKey: 'extTutorialLyricsStep2Title', descKey: 'extTutorialLyricsStep2Desc' },
    { titleKey: 'extTutorialLyricsStep3Title', descKey: 'extTutorialLyricsStep3Desc' },
    { titleKey: 'extTutorialLyricsStep4Title', descKey: 'extTutorialLyricsStep4Desc' },
  ],
  getHighlightForStep(step: number): StepHighlightResult {
    if (step === 0) {
      return findSidebarTabButton(0);
    } else if (step === 1) {
      return findSidebarButton(['구간', 'A-B', 'Loop']);
    } else if (step === 2) {
      return findSidebarButton(['간주', 'Skip', 'スキップ']);
    } else {
      return findSidebarButton(['싱크', 'Sync', '同期']);
    }
  },
};

// ─── Tutorial: 가사 검색 ─────────────────────────────

export const TutorialSearchConfig: MenuTutorialConfig = {
  tutorialId: 'tutorialSearch',
  storageKey: STORAGE_KEYS.TUTORIAL_SEARCH_COMPLETED,
  substeps: [
    { titleKey: 'extTutorialSearchStep1Title', descKey: 'extTutorialSearchStep1Desc' },
    { titleKey: 'extTutorialSearchStep2Title', descKey: 'extTutorialSearchStep2Desc' },
  ],
  getHighlightForStep(step: number): StepHighlightResult {
    if (step === 0) {
      return findSidebarTabButton(1);
    }
    return findSidebarTabButton(1);
  },
};

// ─── Tutorial: 녹음 ─────────────────────────────────

export const TutorialRecordingConfig: MenuTutorialConfig = {
  tutorialId: 'tutorialRecording',
  storageKey: STORAGE_KEYS.TUTORIAL_RECORDING_COMPLETED,
  substeps: [
    { titleKey: 'extTutorialRecordingStep1Title', descKey: 'extTutorialRecordingStep1Desc' },
    { titleKey: 'extTutorialRecordingStep2Title', descKey: 'extTutorialRecordingStep2Desc' },
  ],
  getHighlightForStep(step: number): StepHighlightResult {
    if (step === 0) {
      const bottomContainer = document.querySelector('.ytk-bottom-container');
      const recBtn = bottomContainer?.querySelector(
        '[aria-label*="녹음"], [aria-label*="Record"], [aria-label*="録音"]',
      ) as HTMLElement | null;
      if (recBtn) {
        const rect = recBtn.getBoundingClientRect();
        const bottom = window.innerHeight - rect.top + 15;
        const left = rect.left + rect.width / 2;
        return {
          targetElements: [recBtn],
          positionStyle: `bottom: ${bottom}px; left: ${left}px; transform: translateX(-50%);`,
        };
      }
      return { targetElements: [], positionStyle: calculateMenuTutorialPosition('bottom-center') };
    }
    return findSidebarTabButton(3);
  },
};

// ─── Tutorial: 튜닝 ─────────────────────────────────

export const TutorialTuneConfig: MenuTutorialConfig = {
  tutorialId: 'tutorialTune',
  storageKey: STORAGE_KEYS.TUTORIAL_TUNE_COMPLETED,
  substeps: [{ titleKey: 'extTutorialTuneStep1Title', descKey: 'extTutorialTuneStep1Desc' }],
  getHighlightForStep(): StepHighlightResult {
    return findSidebarTabButton(4);
  },
};

// ─── Tutorial: 설정 ─────────────────────────────────

export const TutorialSettingsConfig: MenuTutorialConfig = {
  tutorialId: 'tutorialSettings',
  storageKey: STORAGE_KEYS.TUTORIAL_SETTINGS_COMPLETED,
  substeps: [{ titleKey: 'extTutorialSettingsStep1Title', descKey: 'extTutorialSettingsStep1Desc' }],
  getHighlightForStep(): StepHighlightResult {
    return findSidebarTabButton(6);
  },
};
