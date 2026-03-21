// tutorialTypes.ts
// 튜토리얼 시스템 공유 타입 정의

/** 메뉴 튜토리얼의 개별 substep (i18n 키 기반) */
export interface MenuTutorialSubstep {
  readonly titleKey: string;
  readonly descKey: string;
}

/** getHighlightForStep 반환값: 하이라이트 대상 + CSS 위치 */
export interface StepHighlightResult {
  readonly targetElements: HTMLElement[];
  readonly positionStyle: string;
}

/** 메뉴 튜토리얼 설정 (Tutorial 2-6 공통 인터페이스) */
export interface MenuTutorialConfig {
  readonly tutorialId: string;
  readonly substeps: readonly MenuTutorialSubstep[];
  readonly storageKey: string;
  readonly navigateToMainFirst?: boolean;
  /** 튜토리얼 시작 시 자동으로 전환할 사이드바 탭 */
  readonly navigateToTab?: string;
  getHighlightForStep(step: number): StepHighlightResult;
}
