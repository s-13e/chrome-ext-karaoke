// menuTutorialConfigs.ts
// 메뉴 튜토리얼 1-6 개별 설정 및 위치 계산 헬퍼

import { STORAGE_KEYS } from '@constants/storageKeys';
import type { MenuTutorialConfig, StepHighlightResult } from './tutorialTypes';

// ─── 위치 계산 헬퍼 ────────────────────────────────────

/** 하단바/사이드바 기준 fallback 위치 계산 */
export function calculateMenuTutorialPosition(position: 'bottom-center' | 'bottom-right' | 'sidebar-left'): string {
  const bottomContainer = document.querySelector('.ytk-bottom-container') as HTMLElement;
  const sidebarContainer = document.querySelector('[class*="sidebarWrapper"]') as HTMLElement;

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
        const sidebarContainer = document.querySelector('[class*="sidebarWrapper"]') as HTMLElement;
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

/** lyrics 하단 컨트롤 바의 N번째 버튼을 하이라이트하는 헬퍼 */
function findLyricsControlButton(buttonIndex: number, panelOpen = false): StepHighlightResult {
  const controls = document.querySelector('[class*="lyricsSidebarControls"]') as HTMLElement | null;
  if (controls) {
    const buttons = controls.querySelectorAll('button');
    const targetButton = buttons[buttonIndex] as HTMLElement | undefined;
    if (targetButton) {
      // 사이드바 왼쪽에 배치 (패널 열림 or 버튼이 화면 오른쪽 끝에 위치)
      const sidebarEl = document.querySelector('[class*="sidebarWrapper"]') as HTMLElement | null;
      if (sidebarEl) {
        const sRect = sidebarEl.getBoundingClientRect();
        if (panelOpen) {
          return {
            targetElements: [targetButton],
            positionStyle: `bottom: ${window.innerHeight - sRect.bottom + 80}px; right: ${window.innerWidth - sRect.left + 16}px;`,
          };
        }
        // step0: 버튼 위치에 따라 왼쪽 배치 (잘림 방지)
        const btnRect = targetButton.getBoundingClientRect();
        const rightSpace = window.innerWidth - btnRect.right;
        if (rightSpace < 150) {
          return {
            targetElements: [targetButton],
            positionStyle: `bottom: ${window.innerHeight - btnRect.top + 12}px; right: ${window.innerWidth - btnRect.right + btnRect.width + 16}px;`,
          };
        }
      }
      const rect = targetButton.getBoundingClientRect();
      const bottom = window.innerHeight - rect.top + 12;
      const left = rect.left + rect.width / 2;
      return {
        targetElements: [targetButton],
        positionStyle: `bottom: ${bottom}px; left: ${left}px; transform: translateX(-50%);`,
      };
    }
  }
  return { targetElements: [], positionStyle: calculateMenuTutorialPosition('sidebar-left') };
}

/** lyrics 하단 컨트롤 바 전체를 하이라이트 — 툴팁은 사이드바 왼쪽에 배치 */
function findLyricsControlBar(): StepHighlightResult {
  const controls = document.querySelector('[class*="lyricsSidebarControls"]') as HTMLElement | null;
  if (controls) {
    const sidebarContainer = document.querySelector('[class*="sidebarWrapper"]') as HTMLElement | null;
    if (sidebarContainer) {
      const sRect = sidebarContainer.getBoundingClientRect();
      return {
        targetElements: [controls],
        positionStyle: `bottom: ${window.innerHeight - sRect.bottom + 80}px; right: ${window.innerWidth - sRect.left + 16}px;`,
      };
    }
  }
  return { targetElements: [], positionStyle: calculateMenuTutorialPosition('sidebar-left') };
}

// ─── Tutorial: 가라오케 모드 활성화 ─────────────────

export const TutorialKaraokeModeConfig: MenuTutorialConfig = {
  tutorialId: 'tutorialKaraokeMode',
  storageKey: STORAGE_KEYS.TUTORIAL_STEP1_COMPLETED,
  substeps: [
    { titleKey: 'extTutorialKaraokeModeStep1Title', descKey: 'extTutorialKaraokeModeStep1Desc' },
    { titleKey: 'extTutorialKaraokeModeStep2Title', descKey: 'extTutorialKaraokeModeStep2Desc' },
  ],
  getHighlightForStep(step: number): StepHighlightResult {
    if (step === 0) {
      // 영상 우하단 음표 버튼
      const musicNoteBtn = document.querySelector('[class*="musicNoteButton"]') as HTMLElement | null;
      if (musicNoteBtn) {
        const rect = musicNoteBtn.getBoundingClientRect();
        const bottom = window.innerHeight - rect.top + 12;
        const left = rect.left + rect.width / 2;
        return {
          targetElements: [musicNoteBtn],
          positionStyle: `bottom: ${bottom}px; left: ${left}px; transform: translateX(-50%);`,
        };
      }
    } else {
      // 툴바의 가라오케 버튼 (만들기/알림 사이)
      const toolbarBtn = document.querySelector(
        '[class*="toolbarKaraokeButton"], [class*="ToolbarKaraoke"]',
      ) as HTMLElement | null;
      if (toolbarBtn) {
        const rect = toolbarBtn.getBoundingClientRect();
        const left = rect.left + rect.width / 2;
        return {
          targetElements: [toolbarBtn],
          positionStyle: `top: ${rect.bottom + 12}px; left: ${left}px; transform: translateX(-50%);`,
        };
      }
    }
    return { targetElements: [], positionStyle: calculateMenuTutorialPosition('bottom-center') };
  },
};

// ─── Tutorial: 가사 보기 (Lyrics 서브) ───────────────

export const TutorialLyricsViewConfig: MenuTutorialConfig = {
  tutorialId: 'tutorialLyricsView',
  storageKey: STORAGE_KEYS.TUTORIAL_LYRICS_COMPLETED,
  navigateToTab: 'lyrics',
  substeps: [
    { titleKey: 'extTutorialLyricsViewStep1Title', descKey: 'extTutorialLyricsViewStep1Desc' },
    { titleKey: 'extTutorialLyricsViewStep2Title', descKey: 'extTutorialLyricsViewStep2Desc' },
    { titleKey: 'extTutorialLyricsViewStep3Title', descKey: 'extTutorialLyricsViewStep3Desc' },
  ],
  getHighlightForStep(step: number): StepHighlightResult {
    if (step === 0) {
      return findSidebarTabButton(0);
    }
    if (step === 2) {
      // step 2: 곡 정보 헤더의 flag 아이콘
      const flagBtn = document.querySelector(
        '[class*="songInfoHeader"] [title*="문제"], [class*="songInfoHeader"] [title*="Report"]',
      ) as HTMLElement | null;
      if (flagBtn) {
        const rect = flagBtn.getBoundingClientRect();
        return {
          targetElements: [flagBtn],
          positionStyle: `top: ${rect.bottom + 10}px; right: ${window.innerWidth - rect.right}px;`,
        };
      }
      return findSidebarTabButton(0);
    }
    // step 1: lyrics 하단 컨트롤 바 전체
    return findLyricsControlBar();
  },
};

// ─── Tutorial: 구간 반복 (Lyrics 서브) ───────────────

export const TutorialLyricsLoopConfig: MenuTutorialConfig = {
  tutorialId: 'tutorialLyricsLoop',
  storageKey: STORAGE_KEYS.TUTORIAL_LOOP_COMPLETED,
  navigateToTab: 'lyrics',
  substeps: [
    { titleKey: 'extTutorialLoopStep1Title', descKey: 'extTutorialLoopStep1Desc' },
    { titleKey: 'extTutorialLoopStep2Title', descKey: 'extTutorialLoopStep2Desc' },
    { titleKey: 'extTutorialLoopStep3Title', descKey: 'extTutorialLoopStep3Desc' },
  ],
  getHighlightForStep(step: number): StepHighlightResult {
    if (step >= 1) {
      window.dispatchEvent(new CustomEvent('tutorial-open-panel', { detail: { panel: 'loop' } }));
    }
    return findLyricsControlButton(0, step >= 1);
  },
};

// ─── Tutorial: 반주 건너뛰기 (Lyrics 서브) ───────────

export const TutorialLyricsSkipConfig: MenuTutorialConfig = {
  tutorialId: 'tutorialLyricsSkip',
  storageKey: STORAGE_KEYS.TUTORIAL_JUMP_COMPLETED,
  navigateToTab: 'lyrics',
  substeps: [
    { titleKey: 'extTutorialSkipStep1Title', descKey: 'extTutorialSkipStep1Desc' },
    { titleKey: 'extTutorialSkipStep2Title', descKey: 'extTutorialSkipStep2Desc' },
  ],
  getHighlightForStep(): StepHighlightResult {
    // 하단 컨트롤의 두 번째 버튼 (건너뛰기)
    return findLyricsControlButton(1);
  },
};

// ─── Tutorial: 싱크 조절 (Lyrics 서브) ───────────────

export const TutorialLyricsSyncConfig: MenuTutorialConfig = {
  tutorialId: 'tutorialLyricsSync',
  storageKey: STORAGE_KEYS.TUTORIAL_SYNC_COMPLETED,
  navigateToTab: 'lyrics',
  substeps: [
    { titleKey: 'extTutorialSyncStep1Title', descKey: 'extTutorialSyncStep1Desc' },
    { titleKey: 'extTutorialSyncStep2Title', descKey: 'extTutorialSyncStep2Desc' },
    { titleKey: 'extTutorialSyncStep3Title', descKey: 'extTutorialSyncStep3Desc' },
    { titleKey: 'extTutorialSyncStep4Title', descKey: 'extTutorialSyncStep4Desc' },
    { titleKey: 'extTutorialSyncStep5Title', descKey: 'extTutorialSyncStep5Desc' },
  ],
  getHighlightForStep(step: number): StepHighlightResult {
    if (step >= 1) {
      const syncTab = step >= 3 ? 'section' : 'global';
      window.dispatchEvent(new CustomEvent('tutorial-open-panel', { detail: { panel: 'sync', tab: syncTab } }));
    }
    return findLyricsControlButton(2, step >= 1);
  },
};

// ─── Tutorial: 가사 검색 ─────────────────────────────

export const TutorialSearchConfig: MenuTutorialConfig = {
  tutorialId: 'tutorialSearch',
  storageKey: STORAGE_KEYS.TUTORIAL_SEARCH_COMPLETED,
  navigateToTab: 'search',
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
  navigateToTab: 'library',
  substeps: [
    { titleKey: 'extTutorialRecordingStep1Title', descKey: 'extTutorialRecordingStep1Desc' },
    { titleKey: 'extTutorialRecordingStep2Title', descKey: 'extTutorialRecordingStep2Desc' },
  ],
  getHighlightForStep(step: number): StepHighlightResult {
    if (step === 0) {
      // 하단 바의 마이크 아이콘 (title 속성으로 검색)
      const recBtn = document.querySelector(
        '[title*="녹음"], [title*="Record"], [title*="録音"], [title*="Grabar"], [title*="Gravar"]',
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
  navigateToTab: 'tune',
  substeps: [{ titleKey: 'extTutorialTuneStep1Title', descKey: 'extTutorialTuneStep1Desc' }],
  getHighlightForStep(): StepHighlightResult {
    return findSidebarTabButton(4);
  },
};

// ─── Tutorial: 설정 ─────────────────────────────────

export const TutorialSettingsConfig: MenuTutorialConfig = {
  tutorialId: 'tutorialSettings',
  storageKey: STORAGE_KEYS.TUTORIAL_SETTINGS_COMPLETED,
  navigateToTab: 'settings',
  substeps: [
    { titleKey: 'extTutorialSettingsStep1Title', descKey: 'extTutorialSettingsStep1Desc' },
    { titleKey: 'extTutorialSettingsStep2Title', descKey: 'extTutorialSettingsStep2Desc' },
    { titleKey: 'extTutorialSettingsStep3Title', descKey: 'extTutorialSettingsStep3Desc' },
    { titleKey: 'extTutorialSettingsStep4Title', descKey: 'extTutorialSettingsStep4Desc' },
  ],
  getHighlightForStep(): StepHighlightResult {
    return findSidebarTabButton(6);
  },
};
