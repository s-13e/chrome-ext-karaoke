// tutorialController.tsx
// 튜토리얼 시스템 메인 컨트롤러 (상태 관리 + public API + 이벤트 리스너 등록)

import ReactDOM from 'react-dom/client';
import { injectTutorialHighlightStyles } from './tutorialStyles';
import { showTutorial1FromMenu, showMenuTutorial } from './menuTutorialRunner';
import {
  Tutorial2Config,
  Tutorial3Config,
  Tutorial4Config,
  Tutorial5Config,
  Tutorial6Config,
  TutorialKaraokeModeConfig,
  TutorialLyricsViewConfig,
  TutorialLyricsLoopConfig,
  TutorialLyricsSkipConfig,
  TutorialLyricsSyncConfig,
  TutorialSearchConfig,
  TutorialRecordingConfig,
  TutorialTuneConfig,
  TutorialSettingsConfig,
} from './menuTutorialConfigs';
import {
  showTutorialStep1IfNeeded as autoFlowStep1,
  completeTutorialStep1 as autoFlowCompleteStep1,
  showTutorialStep2 as autoFlowStep2,
} from './autoFlowTutorial';
import { showFeatureTutorial, hideFeatureTutorial } from './featureTutorialRunner';
import { showJitTutorial } from './justInTimeTutorial';

/**
 * 튜토리얼 컨트롤러 클래스
 * KaraokeModeManager 패턴을 따르는 싱글톤 컨트롤러
 */
export class TutorialController {
  // ─── Step1/Step2 자동 튜토리얼 상태 ──────────────────
  private tutorialTooltipRoot: ReactDOM.Root | null = null;
  private step1Completed = false;
  private step2Completed = false;
  // Step1 툴팁은 음악 영상 감지 이벤트(yt-karaoke-music-detection)를 구독해 표시되므로,
  // 완료 시 정확히 해당 리스너를 제거하기 위해 참조를 보관한다
  private step1MusicDetectionHandler: ((e: Event) => void) | null = null;

  // ─── Feature 튜토리얼 상태 ───────────────────────────
  private featureActive = false;
  private featureRoot: ReactDOM.Root | null = null;
  private featureContainer: HTMLElement | null = null;
  private featureStepIndex = 0;
  private featureSubstepIndex = 0;

  // ─── 메뉴 튜토리얼 상태 ─────────────────────────────
  private menuRoot: ReactDOM.Root | null = null;
  private menuContainer: HTMLElement | null = null;

  private readonly isDevMode: boolean;

  constructor(isDevMode: boolean) {
    this.isDevMode = isDevMode;
  }

  // ─── 이벤트 리스너 등록 ─────────────────────────────

  /** 이벤트 리스너 등록 (index.tsx에서 초기화 시 호출) */
  public init(): void {
    window.addEventListener('start-tutorial', (e) => {
      const customEvent = e as CustomEvent<{ tutorialId: string }>;
      const { tutorialId } = customEvent.detail;
      console.log('[Index] start-tutorial 이벤트 수신:', tutorialId);
      this.handleTutorialStart(tutorialId);
    });

    // JIT 튜토리얼 이벤트 리스너
    window.addEventListener('sidebar-first-open', () => {
      this.showSidebarJitIfNeeded();
    });

    window.addEventListener('karaoke-mode-first-activate', () => {
      this.showJumpJitIfNeeded();
    });

    window.addEventListener('toggle-feature-tutorial', (e) => {
      const customEvent = e as CustomEvent<{ active: boolean }>;
      const shouldActivate = customEvent.detail.active;
      console.log('[Index] toggle-feature-tutorial 이벤트 수신:', shouldActivate);

      if (shouldActivate && !this.featureActive) {
        showFeatureTutorial(this);
      } else if (!shouldActivate && this.featureActive) {
        hideFeatureTutorial(this);
      }
    });
  }

  // ─── Public API (index.tsx에서 호출) ─────────────────

  /** MusicNoteButton 렌더 후 호출 — Step1 표시 여부 확인 */
  public async showTutorialStep1IfNeeded(): Promise<void> {
    return autoFlowStep1(this);
  }

  /** 카라오케 모드 활성화 시 호출 — Step1 완료 처리 */
  public completeTutorialStep1(): void {
    autoFlowCompleteStep1(this);
  }

  /** Step1 완료 후 호출 — Step2 표시 */
  public async showTutorialStep2(): Promise<void> {
    return autoFlowStep2(this);
  }

  /** Step1 완료 여부 (onModeChanged에서 참조) */
  public isStep1Completed(): boolean {
    return this.step1Completed;
  }

  /** Step2 완료 여부 (onModeChanged에서 참조) */
  public isStep2Completed(): boolean {
    return this.step2Completed;
  }

  // ─── Just-In-Time 튜토리얼 ─────────────────────────

  /** 사이드바 첫 진입 시 JIT 튜토리얼 표시 */
  public showSidebarJitIfNeeded(): void {
    showJitTutorial('sidebar');
  }

  /** 간주 구간 감지 시 JIT 튜토리얼 표시 */
  public showJumpJitIfNeeded(): void {
    showJitTutorial('jump');
  }

  // ─── 메뉴 튜토리얼 라우팅 ───────────────────────────

  /** start-tutorial 이벤트 핸들러 — tutorialId에 따라 적절한 튜토리얼 실행 */
  private async handleTutorialStart(tutorialId: string): Promise<void> {
    console.log('[Tutorial] 개별 튜토리얼 시작:', tutorialId);
    injectTutorialHighlightStyles();

    switch (tutorialId) {
      // 레거시 튜토리얼 (호환성 유지)
      case 'tutorial1':
        await showTutorial1FromMenu();
        break;
      case 'tutorial2':
        await showMenuTutorial(Tutorial2Config, this);
        break;
      case 'tutorial3':
        await showMenuTutorial(Tutorial3Config, this);
        break;
      case 'tutorial4':
        await showMenuTutorial(Tutorial4Config, this);
        break;
      case 'tutorial5':
        await showMenuTutorial(Tutorial5Config, this);
        break;
      case 'tutorial6':
        await showMenuTutorial(Tutorial6Config, this);
        break;
      // 새 사이드바 기반 튜토리얼
      case 'tutorialKaraokeMode':
        await showMenuTutorial(TutorialKaraokeModeConfig, this);
        break;
      case 'tutorialLyricsView':
        await showMenuTutorial(TutorialLyricsViewConfig, this);
        break;
      case 'tutorialLyricsLoop':
        await showMenuTutorial(TutorialLyricsLoopConfig, this);
        break;
      case 'tutorialLyricsSkip':
        await showMenuTutorial(TutorialLyricsSkipConfig, this);
        break;
      case 'tutorialLyricsSync':
        await showMenuTutorial(TutorialLyricsSyncConfig, this);
        break;
      case 'tutorialSearch':
        await showMenuTutorial(TutorialSearchConfig, this);
        break;
      case 'tutorialRecording':
        await showMenuTutorial(TutorialRecordingConfig, this);
        break;
      case 'tutorialTune':
        await showMenuTutorial(TutorialTuneConfig, this);
        break;
      case 'tutorialSettings':
        await showMenuTutorial(TutorialSettingsConfig, this);
        break;
      default:
        console.warn('[Tutorial] 알 수 없는 튜토리얼 ID:', tutorialId);
        window.dispatchEvent(new CustomEvent('tutorial-cancel'));
    }
  }

  // ─── 메뉴 튜토리얼 상태 접근자 (menuTutorialRunner에서 사용) ──

  public getMenuTutorialRoot(): ReactDOM.Root | null {
    return this.menuRoot;
  }

  public setMenuTutorialRoot(root: ReactDOM.Root | null): void {
    this.menuRoot = root;
  }

  public getMenuTutorialContainer(): HTMLElement | null {
    return this.menuContainer;
  }

  public setMenuTutorialContainer(container: HTMLElement | null): void {
    this.menuContainer = container;
  }

  /** 메뉴 튜토리얼 정리 (컨테이너/루트 제거 + 하이라이트 해제) */
  public cleanupMenuTutorial(): void {
    if (this.menuRoot) {
      this.menuRoot.unmount();
      this.menuRoot = null;
    }
    if (this.menuContainer) {
      this.menuContainer.remove();
      this.menuContainer = null;
    }
    document.querySelectorAll('.ytk-tutorial-highlight').forEach((el) => {
      el.classList.remove('ytk-tutorial-highlight');
    });
  }

  // ─── 자동 튜토리얼 상태 접근자 (autoFlowTutorial에서 사용) ──

  public getTutorialTooltipRoot(): ReactDOM.Root | null {
    return this.tutorialTooltipRoot;
  }

  public setTutorialTooltipRoot(root: ReactDOM.Root | null): void {
    this.tutorialTooltipRoot = root;
  }

  public setStep1Completed(completed: boolean): void {
    this.step1Completed = completed;
  }

  public setStep2Completed(completed: boolean): void {
    this.step2Completed = completed;
  }

  public getStep1MusicDetectionHandler(): ((e: Event) => void) | null {
    return this.step1MusicDetectionHandler;
  }

  public setStep1MusicDetectionHandler(handler: ((e: Event) => void) | null): void {
    this.step1MusicDetectionHandler = handler;
  }

  public getIsDevMode(): boolean {
    return this.isDevMode;
  }

  // ─── Feature 튜토리얼 상태 접근자 (featureTutorialRunner에서 사용) ──

  public getFeatureTutorialRoot(): ReactDOM.Root | null {
    return this.featureRoot;
  }

  public setFeatureTutorialRoot(root: ReactDOM.Root | null): void {
    this.featureRoot = root;
  }

  public getFeatureTutorialContainer(): HTMLElement | null {
    return this.featureContainer;
  }

  public setFeatureTutorialContainer(container: HTMLElement | null): void {
    this.featureContainer = container;
  }

  public setFeatureTutorialActive(active: boolean): void {
    this.featureActive = active;
  }

  public getCurrentFeatureStepIndex(): number {
    return this.featureStepIndex;
  }

  public setCurrentFeatureStepIndex(index: number): void {
    this.featureStepIndex = index;
  }

  public getCurrentFeatureSubstepIndex(): number {
    return this.featureSubstepIndex;
  }

  public setCurrentFeatureSubstepIndex(index: number): void {
    this.featureSubstepIndex = index;
  }
}
