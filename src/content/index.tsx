// ./index.tsx
import React from 'react';
import { App } from './App';
import { i18nInstance, initializeI18n } from '@services/i18n';
import { ErrorFallback } from '@components/common/ErrorFallback';
import { I18nextProvider } from 'react-i18next';
import { ErrorBoundary } from 'react-error-boundary';
import { detectYouTubeVideo, setupSPAObserver } from '@lib/youtube';
import { debounce } from '@lib/utils/common/common';
import { contentLogger, contentErrorTracker, LogLevelEnum } from '@lib/utils/monitoring';
import { STORAGE_KEYS } from '@constants/storageKeys';
import { isMusicVideo } from '@lib/utils/audio/musicDetection';
import type { YouTubeVideoMetaFullValue } from '@background/api/youtube';
import { UIResourceManager } from '@lib/utils/infra/uiResourceManager';
import { YOUTUBE_MINI_PLAYER_CLASSES, YOUTUBE_MINI_PLAYER_CONTAINER_SELECTOR } from '@constants/youtubeSelectors';
import { extractArtistAndTitle, fallbackArtistAndTitle } from '@lib/utils/lyrics/meta/artistTitle';
import {
  cleanTopicName,
  extractArtistAndTitleCustom,
  preprocessArtistOrTitle,
  removeExtraInfo,
  stripEmojiAndBeforeColon,
} from '@lib/utils/lyrics/parsers/stringUtils';
import { listenerManager } from '@lib/utils/infra/listenerManager';
import { withContentEnabled } from '@lib/utils/platform/contentGuard';
import { DualHighlightLyrics } from './components/lyrics/SyncLyrics/DualHighlightLyrics';
import { SingleLineLyrics } from './components/lyrics/SingleLineLyrics/SingleLineLyrics';
import { FullLyrics } from './components/lyrics/FullLyrics/FullLyrics';
import { isAdPlaying } from '@lib/utils/dom/domUtils';
import { startLyricsAdMonitoring } from '@lib/utils/infra/adWatcher';
import { parseLyrics } from '@lib/utils/lyrics/parsers/lyricsParser';
import { Line } from '@lib/types/lyrics';
import { extractVideoIdFromUrl, tryDetectVideoChange } from '@lib/utils/platform/videoDetection';
import { getLyricsFromCacheOrFetch } from '@lib/utils/lyrics/meta/getLyricsFromCacheOrFetch';
import { fetchLyricsWithAliasFallback } from '@background/api/lyrics';
import { LyricsError, LyricsErrorCode } from '@lib/types/lyricsError';
import { LrcLibLyricsResult } from '@background/api/lrclib';
import { LyricsErrorDisplay } from './components/lyrics/common/LyricsErrorDisplay';
// normalize.css 제거 - content script에서 불필요 (YouTube 페이지에 스타일 충돌 방지)
import { cleanupMediaElementSource } from '@lib/utils/audio/audio';
import { checkIfMiniPlayerActive } from '@lib/utils/platform/playerUtils';
import { isWatchPage as checkIsWatchPage } from '@lib/utils/common/urlUtils';
import { hasUrlChanged } from '@lib/utils/platform/navigation';
import { SongInfoOverlay } from './components/song-info/SongInfoOverlay';
import { overlayManager } from '@lib/utils/infra/overlayManager';
import { KaraokeModeManager } from '@lib/utils/infra/karaokeModeManager';
import { MusicNoteButton } from './components/karaoke-mode/MusicNoteButton';
import { RiMusicAiLine } from 'react-icons/ri';
import musicNoteStyles from './components/karaoke-mode/musicNoteButton.module.css';
import ReactDOM from 'react-dom/client';
import { KaraokeModeContainer } from './components/karaoke-mode';
import { loadFontFromFamilyString } from '@lib/utils/fonts/googleFontsLoader';
import {
  incrementNonMusicCount,
  resetNonMusicCount,
  enableAutoDisable,
  disableAutoDisable,
  shouldAutoDisable,
} from '@lib/utils/storage/autoDisableStorage';
import { ActionableToast } from './components/common/ActionableToast';
import { CurrentTimeProvider } from '@hooks/CurrentTimeContext';

(() => {
  // 전역 에러 핸들러 설정 (최상단)
  window.addEventListener('error', (event) => {
    // ResizeObserver 에러는 Chrome의 harmless warning이므로 무시
    if (event.message.includes('ResizeObserver loop')) {
      return;
    }

    contentErrorTracker.captureError(
      event.error || new Error(event.message),
      'Uncaught error in content script',
      LogLevelEnum.ERROR,
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        url: window.location.href,
        videoId: extractVideoIdFromUrl(window.location.href),
      },
    );
  });

  window.addEventListener('unhandledrejection', (event) => {
    contentErrorTracker.captureError(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      'Unhandled promise rejection in content script',
      LogLevelEnum.ERROR,
      {
        url: window.location.href,
        videoId: extractVideoIdFromUrl(window.location.href),
      },
    );
  });

  // 새로고침 시 contentscript 내 중복 실행 방지
  if (window.__LYRICS_OVERLAY_INITED) {
    contentLogger.warn('Content script already initialized, skipping...');
    return;
  }
  window.__LYRICS_OVERLAY_INITED = true;

  contentLogger.info('Content script initializing...');

  // Extension context invalidation 감지 및 자동 페이지 새로고침
  // 개발 중 확장 재로드 시 content script가 무효화되는 문제 해결
  function isExtensionContextValid(): boolean {
    try {
      // chrome.runtime.id 접근 시 context가 무효화되면 에러 발생
      return !!chrome.runtime?.id;
    } catch {
      return false;
    }
  }

  function checkExtensionContext() {
    if (!isExtensionContextValid()) {
      contentLogger.warn('Extension context invalidated, reloading page...');
      window.location.reload();
    }
  }

  // 5초마다 context 유효성 확인 (개발 모드용)
  let contextCheckInterval: ReturnType<typeof setInterval> | null = setInterval(checkExtensionContext, 5000);

  // --- 플래그 및 관리 객체 ---
  let isDetectionActive = false; // 감지 시스템 활성화 여부
  let isDetecting = false; // 영상 감지 함수 진입 여부(동시 실행 방지)

  let lastVideoId: string | null = null;
  let lastUrl = window.location.href;

  let latestLyrics: Line[] = [];
  let contentEnabled = false;

  let spaObserverShouldTriggerDetection = true;
  let isRetryingDetection = false; // 재시도 중복 제어 플래그
  let isFirstMutation = true;

  // font
  let lyricsFontColorCurrent = '#FFFFFF';
  let lyricsFontColorPronunciation = '#FFFFFF';

  // 가사 스타일 설정
  let lyricsStyleDual: Partial<import('@lib/types/lyricsStyles').DualHighlightLyricsStyleConfig> = {};
  let lyricsStyleFull: Partial<import('@lib/types/lyricsStyles').FullLyricsStyleConfig> = {};
  let lyricsStyleSingle: Partial<import('@lib/types/lyricsStyles').SingleLineLyricsStyleConfig> = {};

  /**
   * Background script를 통해 YouTube 비디오 메타데이터 조회
   * (보안: API 키를 content script에 노출하지 않음)
   */
  async function fetchYouTubeMetaViaBackground(videoId: string): Promise<YouTubeVideoMetaFullValue | null> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: 'FETCH_YOUTUBE_META', videoId }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (response?.success) {
          resolve(response.data);
        } else {
          reject(new Error(response?.error || 'YouTube Meta fetch failed'));
        }
      });
    });
  }

  let showRealtimeLyrics = true; // 현재 가사 ui 보이게
  let showPronunciationLyrics = true;

  let lyricsMode: 'sync' | 'single' | 'full' = 'sync';

  // let analyzeLyricsAfterAd: (() => Promise<void>) | null = null;

  // 중복 가사 호출 방지
  let isCollecting = false;

  let lastContentEnabledFalseTime = 0; // 마지막 false 처리 시각(ms)
  const CLEANUP_DEBOUNCE_MS = 500; // 0.5초 딜레이
  let lastChangeOrigin: 'user' | 'system' = 'system';

  // MusicNoteButton 전용 React Root
  let musicNoteButtonRoot: ReactDOM.Root | null = null;

  // KaraokeModeContainer 전용 React Root
  let karaokeModeRoot: ReactDOM.Root | null = null;

  // 카라오케 모드 매니저 초기화
  const karaokeModeManager = new KaraokeModeManager({
    onShowToast: (message: string) => showToast(message),
    onModeChanged: (isVisible: boolean) => {
      // 모드 변경 시 렌더링 및 버튼 상태 업데이트
      renderKaraokeModeContainer();
      updateMusicNoteButtonState(isVisible);
    },
    onLyricsChanged: () => {
      // 가사 변경 시 KaraokeModeContainer 재렌더링
      if (karaokeModeManager.isVisible()) {
        renderKaraokeModeContainer();
      }
    },
  });

  // 가라오케 모드 자동 종료 이벤트 리스너 (모드 버튼 클릭 시)
  window.addEventListener('karaoke-mode-exit', () => {
    console.log('[Index] 가라오케 모드 종료 이벤트 수신 (모드 버튼 클릭)');
    if (karaokeModeManager.isVisible()) {
      // skipTheaterModeRestore: true - 사용자가 이미 모드를 변경했으므로 복원하지 않음
      karaokeModeManager.toggleKaraokeMode(true);
    }
  });

  // 토스트/알림 전용 React Root
  let toastRoot: ReactDOM.Root | null = null;
  let notificationRoot: ReactDOM.Root | null = null;

  // 광고 상태 추적 및 모니터링 cleanup 함수
  let stopLyricsAdMonitoring: (() => void) | null = null;

  // song-info 자동 숨김 (영상 재생 시간 기준)
  let songInfoVideoTimeListener: (() => void) | null = null;
  const SONG_INFO_HIDE_AT_VIDEO_TIME = 8; // 영상 8초 시점에 숨김

  // 가사 모드
  const getContentEnabled = () => contentEnabled;
  const uiManager = new UIResourceManager();
  const RETRY_DELAY = 300;
  const API_RETRY_MAX_ATTEMPTS = 2; // API 타임아웃 시 최대 재시도 횟수
  const isMiniToFullTransitioning = false;

  function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // current video id를 얻는 헬퍼
  function getCurrentVideoId(): string | null {
    return extractVideoIdFromUrl(window.location.href);
  }

  /**
   * 가사 스타일 설정에서 폰트를 추출하여 Google Fonts 로드
   * 페이지 로드 시 및 스타일 변경 시 호출되어 필요한 폰트를 미리 로드
   */
  function loadFontsFromStyleConfigs(): void {
    const fontFamilies = new Set<string>();

    // Dual 스타일에서 폰트 추출
    if (lyricsStyleDual?.lyrics?.default?.fontFamily) {
      fontFamilies.add(lyricsStyleDual.lyrics.default.fontFamily);
    }
    if (lyricsStyleDual?.lyrics?.highlight?.fontFamily) {
      fontFamilies.add(lyricsStyleDual.lyrics.highlight.fontFamily);
    }
    if (lyricsStyleDual?.pronunciation?.default?.fontFamily) {
      fontFamilies.add(lyricsStyleDual.pronunciation.default.fontFamily);
    }
    if (lyricsStyleDual?.pronunciation?.highlight?.fontFamily) {
      fontFamilies.add(lyricsStyleDual.pronunciation.highlight.fontFamily);
    }

    // Full 스타일에서 폰트 추출
    if (lyricsStyleFull?.lyrics?.default?.fontFamily) {
      fontFamilies.add(lyricsStyleFull.lyrics.default.fontFamily);
    }
    if (lyricsStyleFull?.lyrics?.highlight?.fontFamily) {
      fontFamilies.add(lyricsStyleFull.lyrics.highlight.fontFamily);
    }
    if (lyricsStyleFull?.pronunciation?.default?.fontFamily) {
      fontFamilies.add(lyricsStyleFull.pronunciation.default.fontFamily);
    }

    // Single 스타일에서 폰트 추출
    if (lyricsStyleSingle?.lyrics?.fontFamily) {
      fontFamilies.add(lyricsStyleSingle.lyrics.fontFamily);
    }
    if (lyricsStyleSingle?.pronunciation?.fontFamily) {
      fontFamilies.add(lyricsStyleSingle.pronunciation.fontFamily);
    }

    // 각 폰트를 로드 (중복 제거됨)
    fontFamilies.forEach((fontFamily) => {
      loadFontFromFamilyString(fontFamily);
    });

    if (fontFamilies.size > 0) {
      // eslint-disable-next-line no-console
      console.log('[Index] 가사 스타일에서 폰트 로드:', Array.from(fontFamilies));
    }
  }

  interface DetectionObserverManager {
    spaObserver: MutationObserver | null;
    lyricsObserver: MutationObserver | null;
    videoElementObserver: MutationObserver | null;
    miniToBasicObserver: MutationObserver | null;
    basicToMiniObserver: MutationObserver | null;
  }
  const detectionObserverManager: DetectionObserverManager = {
    spaObserver: null,
    lyricsObserver: null,
    videoElementObserver: null,
    miniToBasicObserver: null,
    basicToMiniObserver: null,
  };

  //
  // clear, clean logic
  /**
   * 모든 리스너와 옵저버, UI 리소스, 오버레이, 가사 상태 데이터를 포함해
   * 콘텐츠 관련 전반적인 리소스를 정리하는 최상위 클린업 함수
   */
  const cleanupAllResources = (): void => {
    console.log('[cleanupAllResources] 실행 - tracking Emotion unmounting');
    contentLogger.info('[cleanupAllResources] Cleaning up all resources and unmounting React components');

    // setInterval 정리
    if (contextCheckInterval !== null) {
      clearInterval(contextCheckInterval);
      contextCheckInterval = null;
    }

    listenerManager.removeAll();
    removeAllObservers();
    uiManager.cleanup();
    resetLyricsData();

    console.log('[cleanupAllResources] 완료 - React components should be unmounted');
    contentLogger.info('[cleanupAllResources] Cleanup complete');
  };

  // --- Observer 및 리스너 관리 함수 ---
  const removeAllObservers = (): void => {
    Object.values(detectionObserverManager).forEach((obs) => obs?.disconnect && obs.disconnect());
    detectionObserverManager.spaObserver = null;
    detectionObserverManager.lyricsObserver = null;
    detectionObserverManager.videoElementObserver = null;
    detectionObserverManager.miniToBasicObserver = null;
    detectionObserverManager.basicToMiniObserver = null;
  };

  /**
   * 렌더링된 가사 데이터를 초기화하고,
   * 화면에 표시된 가사 렌더링을 초기 상태로 재실행하는 함수
   */
  function resetLyricsData() {
    console.log('[resetLyricsData] 가사 상태 초기화 완료');

    // 광고 모니터링 중지
    stopLyricsAdMonitoringIfNeeded();

    // song-info 자동 숨김 리스너 제거
    removeSongInfoVideoTimeListener();

    latestLyrics = [];
    // songInfo container가 존재할 때만 숨김 처리
    if (overlayManager.getContainer('songInfo')) {
      overlayManager.setVisibility('songInfo', false);
    }

    // 최신 상태 반영 위해 화면 재렌더링
    renderLyricsOverlay(latestLyrics);
  }

  const injectCSS = () => {
    const cssId = 'karaoke-styles';
    if (document.getElementById(cssId)) return Promise.resolve();

    return new Promise((resolve) => {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = chrome.runtime.getURL('content/style.css');

      link.onload = () => {
        resolve(null);
      };
      link.onerror = () => {
        resolve(null); // 실패해도 바로 resolve
      };
      document.head.appendChild(link);
    });
  };

  /**
   * 토스트 애니메이션 CSS 추가
   */
  function addToastStyles() {
    if (document.getElementById('karaoke-toast-styles')) return;

    const style = document.createElement('style');
    style.id = 'karaoke-toast-styles';
    style.textContent = `
      @keyframes karaokeToastFadeIn {
        from {
          opacity: 0;
          transform: translate(-50%, -10px);
        }
        to {
          opacity: 1;
          transform: translate(-50%, 0);
        }
      }

      @keyframes karaokeToastFadeOut {
        from {
          opacity: 1;
          transform: translate(-50%, 0);
        }
        to {
          opacity: 0;
          transform: translate(-50%, -10px);
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 토스트 메시지 표시
   */
  function showToast(message: string, duration: number = 5000) {
    addToastStyles();

    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 0, 0, 0.9);
      color: #ffffff;
      padding: 16px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      pointer-events: none;
      animation: karaokeToastFadeIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'karaokeToastFadeOut 0.3s ease';
      setTimeout(() => {
        if (toast.parentNode) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, duration);
  }

  /**
   * ActionableToast 렌더링 (React 기반)
   */
  let actionableToastRoot: ReactDOM.Root | null = null;

  function showActionableToast(
    title: string,
    description: string,
    actionText: string,
    onAction: () => void,
    icon?: React.ReactNode,
  ) {
    // 기존 토스트 제거
    const existingContainer = document.getElementById('actionable-toast-container');
    if (existingContainer) {
      existingContainer.remove();
      actionableToastRoot = null;
    }

    // 새 컨테이너 생성
    const container = document.createElement('div');
    container.id = 'actionable-toast-container';
    container.style.position = 'fixed';
    container.style.zIndex = '999999';
    container.style.pointerEvents = 'none'; // 컨테이너는 클릭 차단 안 함
    document.body.appendChild(container);

    // React Root 생성 및 렌더링
    actionableToastRoot = ReactDOM.createRoot(container);
    actionableToastRoot.render(
      <ActionableToast
        title={title}
        description={description}
        actionText={actionText}
        onAction={onAction}
        icon={icon}
        onClose={() => {
          if (actionableToastRoot) {
            actionableToastRoot.unmount();
            actionableToastRoot = null;
          }
          if (container.parentNode) {
            container.remove();
          }
        }}
      />,
    );
  }

  /**
   * MusicNoteButton 상태 업데이트 (DOM 직접 조작)
   */
  function updateMusicNoteButtonState(isVisible: boolean) {
    const musicNoteBtn = document.querySelector('.ytp-music-note-button') as HTMLButtonElement;
    if (musicNoteBtn) {
      musicNoteBtn.classList.toggle('clicked', isVisible);
      musicNoteBtn.setAttribute('data-menu-visible', isVisible ? 'true' : 'false');
    }
  }

  // KaraokeModeContainer 렌더링 함수
  // 가라오케 모드 컨테이너 렌더링
  function renderKaraokeModeContainer() {
    // 기존 컨테이너 찾기 또는 생성
    let karaokeContainer = document.getElementById('karaoke-mode-container');

    if (!karaokeContainer) {
      karaokeContainer = document.createElement('div');
      karaokeContainer.id = 'karaoke-mode-container';

      // fixed 포지셔닝으로 변경 - YouTube 툴바 아래에 전체 화면을 덮음
      karaokeContainer.style.position = 'fixed';
      karaokeContainer.style.top = '56px'; // YouTube 툴바 높이
      karaokeContainer.style.left = '0';
      karaokeContainer.style.right = '0';
      karaokeContainer.style.bottom = '0';
      karaokeContainer.style.pointerEvents = 'none'; // 기본적으로 클릭 이벤트 통과
      karaokeContainer.style.zIndex = '2001'; // YouTube UI보다 위

      // body에 추가 (YouTube 페이지 전체를 덮음)
      document.body.appendChild(karaokeContainer);
    }

    // React Root 생성 또는 재사용
    if (!karaokeModeRoot) {
      console.log('[renderKaraokeModeContainer] Tracking: Creating KaraokeModeContainer React root - Emotion may load');
      contentLogger.debug('Creating KaraokeModeContainer React root');
      karaokeModeRoot = ReactDOM.createRoot(karaokeContainer);
    }

    // KaraokeModeContainer 렌더링 (visible 상태에 따라 표시/숨김)
    karaokeModeRoot.render(
      <KaraokeModeContainer visible={karaokeModeManager.isVisible()} lyrics={karaokeModeManager.getLyrics()} />,
    );
  }

  // MusicNoteButton 렌더링 함수 (확장 로드 시 한 번만 실행)
  function renderMusicNoteButton() {
    console.log('[renderMusicNoteButton] 버튼 렌더링 시작');

    if (musicNoteButtonRoot) {
      console.log('[renderMusicNoteButton] 이미 렌더링됨, 스킵');
      return;
    }

    // MusicNoteButton 전용 컨테이너 생성
    let buttonContainer = document.getElementById('music-note-button-container');
    if (!buttonContainer) {
      buttonContainer = document.createElement('div');
      buttonContainer.id = 'music-note-button-container';
      buttonContainer.style.position = 'fixed';
      buttonContainer.style.zIndex = '9999';
      buttonContainer.style.pointerEvents = 'none'; // 컨테이너는 클릭 차단 안 함
      document.body.appendChild(buttonContainer);
      console.log('[renderMusicNoteButton] 컨테이너 생성 완료');
    }

    // React Root 생성 및 렌더링
    console.log('[renderMusicNoteButton] Tracking: Creating MusicNoteButton React root - Emotion may load');
    contentLogger.debug('Creating MusicNoteButton React root');
    musicNoteButtonRoot = ReactDOM.createRoot(buttonContainer);
    musicNoteButtonRoot.render(
      <MusicNoteButton
        icon={<RiMusicAiLine className={musicNoteStyles.icon} size={24} color="white" />}
        contentEnabled={true} // 항상 true
        menuVisible={karaokeModeManager.isVisible()}
        onClick={() => karaokeModeManager.toggleKaraokeMode()}
      />,
    );

    console.log('[renderMusicNoteButton] 렌더링 완료');
  }

  // 재활성화 토스트 표시
  async function showReactivationToast() {
    console.log('[AutoDisable] 재활성화 토스트 표시');

    // Lazy import Toast component
    const { Toast } = await import('./components/common/Toast');

    let toastContainer = document.getElementById('auto-disable-toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'auto-disable-toast-container';
      document.body.appendChild(toastContainer);
    }

    if (!toastRoot) {
      console.log('[showReactivationToast] Tracking: Creating Toast React root - Emotion may load');
      contentLogger.debug('Creating Toast React root');
      toastRoot = ReactDOM.createRoot(toastContainer);
    }

    const message = `🎵 ${i18nInstance.t('extAutoDisableToast')}`;

    toastRoot.render(
      <Toast
        message={message}
        duration={3000}
        onClose={() => {
          if (toastRoot) {
            toastRoot.unmount();
            toastRoot = null;
          }
          toastContainer?.remove();
        }}
      />,
    );
  }

  // 자동 비활성화 알림 표시
  async function showAutoDisableNotification(threshold: number) {
    console.log('[AutoDisable] 자동 비활성화 알림 표시');

    // Lazy import AutoDisableNotification component
    const { AutoDisableNotification } = await import('./components/common/AutoDisableNotification');

    let notificationContainer = document.getElementById('auto-disable-notification-container');
    if (!notificationContainer) {
      notificationContainer = document.createElement('div');
      notificationContainer.id = 'auto-disable-notification-container';
      document.body.appendChild(notificationContainer);
    }

    if (!notificationRoot) {
      console.log(
        '[showAutoDisableNotification] Tracking: Creating AutoDisableNotification React root - Emotion may load',
      );
      contentLogger.debug('Creating AutoDisableNotification React root');
      notificationRoot = ReactDOM.createRoot(notificationContainer);
    }

    const title = i18nInstance.t('extAutoDisableNotificationTitle');
    const message = i18nInstance.t('extAutoDisableNotificationMessage', { count: threshold });

    notificationRoot.render(
      <AutoDisableNotification
        title={title}
        message={message}
        onClose={() => {
          if (notificationRoot) {
            notificationRoot.unmount();
            notificationRoot = null;
          }
          notificationContainer?.remove();
        }}
      />,
    );
  }

  // 가사 렌더링 함수
  async function renderLyricsOverlay(lyrics: Line[], offset = 0) {
    if (lyricsMode === 'full') {
      overlayManager.renderOverlay(
        'lyrics',
        <CurrentTimeProvider>
          <FullLyrics
            lyrics={lyrics}
            offset={offset}
            fontColor={lyricsFontColorCurrent}
            pronunciationColor={lyricsFontColorPronunciation}
            showRealtimeLyrics={showRealtimeLyrics}
            showPronunciationLyrics={showPronunciationLyrics}
            styleConfig={lyricsStyleFull}
          />
        </CurrentTimeProvider>,
      );
    } else if (lyricsMode === 'sync') {
      overlayManager.renderOverlay(
        'lyrics',
        <CurrentTimeProvider>
          <DualHighlightLyrics
            lyrics={lyrics}
            offset={offset}
            fontColor={lyricsFontColorCurrent}
            pronunciationColor={lyricsFontColorPronunciation}
            showRealtimeLyrics={showRealtimeLyrics}
            showPronunciationLyrics={showPronunciationLyrics}
            styleConfig={lyricsStyleDual}
          />
        </CurrentTimeProvider>,
      );
    } else if (lyricsMode === 'single') {
      overlayManager.renderOverlay(
        'lyrics',
        <CurrentTimeProvider>
          <SingleLineLyrics
            lyrics={lyrics}
            offset={offset}
            fontColor={lyricsFontColorCurrent}
            pronunciationColor={lyricsFontColorPronunciation}
            showRealtimeLyrics={showRealtimeLyrics}
            showPronunciationLyrics={showPronunciationLyrics}
            styleConfig={lyricsStyleSingle}
          />
        </CurrentTimeProvider>,
      );
    } else {
      console.log('[renderLyricsOverlay] else 문으로 overlay cleanup 실행');
      overlayManager.cleanupOverlay('lyrics');
    }
  }

  /**
   * song-info 자동 숨김 리스너 제거
   */
  function removeSongInfoVideoTimeListener() {
    const videoElem = document.querySelector('video');
    if (videoElem && songInfoVideoTimeListener) {
      videoElem.removeEventListener('timeupdate', songInfoVideoTimeListener);
      songInfoVideoTimeListener = null;
    }
  }

  // 노래 정보 렌더링
  function renderSongInfo(title: string, artist: string) {
    // 기존 리스너 제거
    removeSongInfoVideoTimeListener();

    overlayManager.renderOverlay('songInfo', <SongInfoOverlay title={title} artist={artist} lyricsSource="LRCLIB" />);
    overlayManager.setVisibility('songInfo', true);

    // 영상 재생 시간 기준으로 자동 숨김 (광고 시간 제외)
    const videoElem = document.querySelector('video');
    if (videoElem) {
      songInfoVideoTimeListener = () => {
        // 광고 중이 아니고, 영상 재생 시간이 8초 이상일 때만 숨김
        if (!isAdPlaying() && videoElem.currentTime >= SONG_INFO_HIDE_AT_VIDEO_TIME) {
          overlayManager.setVisibility('songInfo', false);
          removeSongInfoVideoTimeListener();
        }
      };
      videoElem.addEventListener('timeupdate', songInfoVideoTimeListener);
    }
  }

  function renderLyricsError(error: LyricsError) {
    console.log(`[renderLyricsError] - 오류: ${error.code}`, error);

    // 가사 오버레이 제거
    overlayManager.cleanupOverlay('lyrics');

    // 가사 없음 에러인 경우 ActionableToast 표시 (수동 검색 유도)
    if (error.code === LyricsErrorCode.LRCLIB_NOT_FOUND) {
      console.log('[Lyrics Error] 가사 없음 감지 - ActionableToast 표시');

      showActionableToast(
        i18nInstance.t('extLyricsNotFoundTitle'),
        i18nInstance.t('extLyricsNotFoundDescription'),
        i18nInstance.t('extLyricsNotFoundAction'),
        () => {
          // 수동 검색 버튼 클릭 액션
          console.log('[ActionableToast] 수동 검색 버튼 클릭됨');

          // 가라오케 모드가 활성화되어 있지 않다면 먼저 활성화
          if (!karaokeModeManager.isVisible()) {
            karaokeModeManager.toggleKaraokeMode();
          }

          // 수동 검색 패널 열기 이벤트 발생
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('open-manual-search'));
          }, 500); // 가라오케 모드 활성화 대기
        },
        React.createElement('span', { style: { fontSize: '20px' } }, '🔍'),
      );
    }

    // 오류 UI 렌더링
    overlayManager.renderOverlay(
      'lyricsError',
      <LyricsErrorDisplay
        error={error}
        onRetry={() => handleLyricsErrorRetry()}
        onManualSearch={() => handleLyricsErrorManualSearch()}
        onUploadLyrics={() => handleLyricsErrorUploadLyrics()}
        onIgnore={() => handleLyricsErrorIgnore()}
      />,
    );
  }

  function handleLyricsErrorRetry() {
    console.log('[handleLyricsErrorRetry] 가사 재시도');
    overlayManager.cleanupOverlay('lyricsError');

    // 현재 영상 다시 감지 및 가사 재시도
    const videoData = detectYouTubeVideo();
    if (videoData?.videoId) {
      const videoElem = document.querySelector('video') as HTMLMediaElement;
      if (videoElem) {
        collectMetadataAndLyrics(videoData.videoId, videoElem);
      }
    }
  }

  function handleLyricsErrorManualSearch() {
    console.log('[handleLyricsErrorManualSearch] 수동 검색 요청');
    // TODO: 수동 검색 UI 구현
    alert('수동 검색 기능은 추후 구현 예정입니다.');
  }

  function handleLyricsErrorUploadLyrics() {
    console.log('[handleLyricsErrorUploadLyrics] 가사 업로드 요청');
    // TODO: 가사 업로드 UI 구현
    alert('가사 업로드 기능은 추후 구현 예정입니다.');
  }

  function handleLyricsErrorIgnore() {
    console.log('[handleLyricsErrorIgnore] 가사 오류 무시');
    overlayManager.cleanupOverlay('lyricsError');
  }

  // Storage 상태 관리 및 초기값 설정
  function initStorageState(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(
        [
          'lyricsFontColorCurrent',
          'lyricsFontColorPronunciation',
          'realtimeLyrics',
          'announceLyrics',
          'lyricsMode',
          'lyricsStyleDual',
          'lyricsStyleFull',
          'lyricsStyleSingle',
        ],
        (items) => {
          if (typeof items.lyricsFontColorCurrent === 'string') {
            lyricsFontColorCurrent = items.lyricsFontColorCurrent;
          }
          if (typeof items.lyricsFontColorPronunciation === 'string') {
            lyricsFontColorPronunciation = items.lyricsFontColorPronunciation;
          }
          if (typeof items.realtimeLyrics === 'boolean') {
            showRealtimeLyrics = items.realtimeLyrics;
          }
          if (typeof items.announceLyrics === 'boolean') {
            showPronunciationLyrics = items.announceLyrics;
          }
          if (['sync', 'single', 'full'].includes(items.lyricsMode)) {
            lyricsMode = items.lyricsMode;
          }
          if (items.lyricsStyleDual) {
            lyricsStyleDual = items.lyricsStyleDual;
          }
          if (items.lyricsStyleFull) {
            lyricsStyleFull = items.lyricsStyleFull;
          }
          if (items.lyricsStyleSingle) {
            lyricsStyleSingle = items.lyricsStyleSingle;
          }

          // 스타일에서 폰트 로드 (페이지 로드 시)
          loadFontsFromStyleConfigs();

          // 최초 렌더 호출 (초기 상태 반영)
          if (latestLyrics.length > 0) {
            renderLyricsOverlay(latestLyrics);
          }
          resolve();
        },
      );
    });
  }
  // 다른 이벤트 리스너 등록
  function setupOtherListeners(): void {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      switch (message.type) {
        case 'SPA_NAVIGATION_DETECTED':
          handleSpaUrlChange(message.payload);
          sendResponse({ status: 'ok' });
          break;

        case 'GET_LATEST_LYRICS':
          console.log('[content] GET_LATEST_LYRICS 요청 - 가사 수:', latestLyrics.length);
          sendResponse({ lyrics: latestLyrics });
          break;
        case 'APPLY_OFFSET_LYRICS': {
          const { offset, lyrics } = message.payload;
          console.log(`[content] APPLY_OFFSET_LYRICS 수신 → offset: ${offset}, 가사 길이: ${lyrics.length}`);
          onLyricsUpdated(lyrics);
          break;
        }
        case 'RESET_OFFSET_TO_ORIGINAL': {
          console.log('[content] RESET_OFFSET_TO_ORIGINAL 수신 - 페이지 새로고침하여 원본 가사 복원');
          // 페이지 새로고침하여 원본 가사 로드 (가장 안전하고 간단한 방법)
          window.location.reload();
          break;
        }
      }
    });
  }
  // 스토리지 변경 리스너 등록
  function setupStorageChangeListener() {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'sync') return;
      let needRerender = false;

      if ('lyricsFontColorCurrent' in changes) {
        const newColor = changes.lyricsFontColorCurrent.newValue;
        if (typeof newColor === 'string' && newColor !== lyricsFontColorCurrent) {
          lyricsFontColorCurrent = newColor;
          needRerender = true;
        }
      }
      if ('lyricsFontColorPronunciation' in changes) {
        const newColor = changes.lyricsFontColorPronunciation.newValue;
        if (typeof newColor === 'string' && newColor !== lyricsFontColorPronunciation) {
          lyricsFontColorPronunciation = newColor;
          needRerender = true;
        }
      }
      if ('realtimeLyrics' in changes) {
        showRealtimeLyrics = !!changes.realtimeLyrics.newValue;
        needRerender = true;
      }
      if ('announceLyrics' in changes) {
        showPronunciationLyrics = !!changes.announceLyrics.newValue;
        needRerender = true;
      }
      if ('lyricsMode' in changes) {
        const m = changes.lyricsMode.newValue;
        if (m === 'sync' || m === 'single' || m === 'full') {
          lyricsMode = m;
          needRerender = true;
        }
      }
      if ('lyricsStyleDual' in changes) {
        lyricsStyleDual = changes.lyricsStyleDual.newValue || {};
        console.log('[Storage] lyricsStyleDual 변경 감지:', lyricsStyleDual);
        loadFontsFromStyleConfigs();
        needRerender = true;
      }
      if ('lyricsStyleFull' in changes) {
        lyricsStyleFull = changes.lyricsStyleFull.newValue || {};
        console.log('[Storage] lyricsStyleFull 변경 감지:', lyricsStyleFull);
        loadFontsFromStyleConfigs();
        needRerender = true;
      }
      if ('lyricsStyleSingle' in changes) {
        lyricsStyleSingle = changes.lyricsStyleSingle.newValue || {};
        console.log('[Storage] lyricsStyleSingle 변경 감지:', lyricsStyleSingle);
        loadFontsFromStyleConfigs();
        needRerender = true;
      }

      if (needRerender) {
        if (latestLyrics.length) {
          renderLyricsOverlay(latestLyrics);
        }
      }
    });
  }

  async function initListenersAndState(): Promise<void> {
    await initStorageState();
    setupStorageChangeListener();
    setupOtherListeners();
  }

  function onLyricsUpdated(newLyrics: Line[]) {
    latestLyrics = newLyrics;
    console.log('[Lyrics] 가사 상태 업데이트 완료');

    renderLyricsOverlay(latestLyrics);

    // 카라오케 모드 매니저에 가사 업데이트 (자동으로 KaraokeModeContainer 재렌더링됨)
    karaokeModeManager.setLyrics(newLyrics);

    // 광고 모니터링 시작: 가사가 렌더링된 후 광고 상태를 지속적으로 체크
    startLyricsAdMonitoringIfNeeded();
  }

  /**
   * 광고 모니터링을 시작 (중복 방지)
   */
  function startLyricsAdMonitoringIfNeeded() {
    // 이미 모니터링 중이면 중복 실행 방지
    if (stopLyricsAdMonitoring) {
      return;
    }

    stopLyricsAdMonitoring = startLyricsAdMonitoring(
      // 광고 시작 시: 가사 오버레이 숨김
      () => {
        overlayManager.setVisibility('lyrics', false);
      },
      // 광고 종료 시: 가사 오버레이 표시
      () => {
        overlayManager.setVisibility('lyrics', true);
      },
    );
  }

  /**
   * 광고 모니터링 중지
   */
  function stopLyricsAdMonitoringIfNeeded() {
    if (stopLyricsAdMonitoring) {
      stopLyricsAdMonitoring();
      stopLyricsAdMonitoring = null;
    }
  }

  function isLyricsOverlayMounted(): boolean {
    return overlayManager.isOverlayMounted('lyrics');
  }

  // ✅ URL 변경 핸들러 개선, 변화에 따른 상세 후처리(UI 초기화, 중복 방지 등)**를 담당하는 하위 레벨 함수
  const handleUrlChange = (url: string) => {
    console.log('handleUrlChange가 실행됨.');
    const isMini = checkIfMiniPlayerActive();
    const currentVideoId = getCurrentVideoId();

    // 영상 id가 같으면 cleanup 스킵
    if (currentVideoId && currentVideoId === lastVideoId) {
      console.log('[handleUrlChange] 같은 videoId 확인됨 → cleanup 건너뜀');
      return;
    }

    if (isMini) {
      console.log('[handleUrlChange] 미니플레이어 → cleanup 안 함');
      lastUrl = url;
      console.log('lastUrl:', lastUrl);
      return;
    }

    if (url === lastUrl) {
      // URL이 같아도 페이지 새로고침인지 판단하여 감지 호출
      console.log('[handleUrlChange] URL 동일, 새로고침 또는 동작 보장용 감지 실행');

      lastVideoId = null;
      resetLyricsData();
      handleVideoDetectionGuarded();
      return;
    }

    resetLyricsData();
    lastVideoId = null;
    lastUrl = url;

    const isWatchPage = checkIsWatchPage(url);
    console.log(`[URL Change] ${url}, isWatchPage: ${isWatchPage}`);

    if (isWatchPage) {
      const videoData = detectYouTubeVideo();
      tryDetectVideoChange(videoData?.videoId || null, debouncedDetection);
    }
  };
  const handleUrlChangeGuarded = withContentEnabled(getContentEnabled, handleUrlChange);

  // 1. 영상과 크게 무관한 메타데이터, 가사 정보를 확보하는 함수 (재시도 래퍼)
  async function collectMetadataAndLyrics(videoId: string, videoElem: HTMLMediaElement): Promise<boolean | null> {
    for (let attempt = 1; attempt <= API_RETRY_MAX_ATTEMPTS + 1; attempt++) {
      try {
        const result = await collectMetadataAndLyricsCore(videoId, videoElem, attempt);
        return result;
      } catch (error) {
        // 재시도 가능한 에러이고 아직 재시도 횟수가 남은 경우
        if (
          error instanceof LyricsError &&
          (error.code === LyricsErrorCode.API_TIMEOUT || error.code === LyricsErrorCode.NETWORK_ERROR) &&
          attempt <= API_RETRY_MAX_ATTEMPTS
        ) {
          const errorType = error.code === LyricsErrorCode.API_TIMEOUT ? 'API timeout' : 'Network error';
          contentLogger.warn(`${errorType}, retrying...`, {
            videoId,
            attempt,
            maxAttempts: API_RETRY_MAX_ATTEMPTS,
          });
          console.log(`[collectMetadataAndLyrics] ${errorType} 발생, 재시도 ${attempt}/${API_RETRY_MAX_ATTEMPTS}`);
          continue; // 바로 다음 시도
        }

        // 재시도 불가능하거나 다른 에러인 경우
        // 비음악 비디오인 경우는 에러가 아니므로 에러 추적 및 UI 렌더링 생략
        if (error instanceof LyricsError && error.code === LyricsErrorCode.NOT_MUSIC_VIDEO) {
          console.log('[NOT_MUSIC_VIDEO] Tracking: Error caught in collectMetadataAndLyrics wrapper');
          contentLogger.info('Not a music video, skipping error tracking and UI', { videoId });
          console.log('[NOT_MUSIC_VIDEO] Tracking: Returning null, no UI changes');
          return null;
        }

        // 실제 에러만 console.error 로깅
        console.error('[collectMetadataAndLyrics] 최종 실패:', error);

        // 에러 추적 (API 에러 상세 정보 포함)
        if (error instanceof Error) {
          contentErrorTracker.captureError(error, 'Failed to collect metadata and lyrics', LogLevelEnum.ERROR, {
            videoId,
            attempt,
            totalAttempts: API_RETRY_MAX_ATTEMPTS + 1,
            errorCode: error instanceof LyricsError ? error.code : undefined,
            isTimeout: error instanceof LyricsError && error.code === LyricsErrorCode.API_TIMEOUT,
            isNetworkError: error instanceof LyricsError && error.code === LyricsErrorCode.NETWORK_ERROR,
            url: window.location.href,
          });
        }

        // 에러 UI 렌더링
        if (error instanceof LyricsError) {
          renderLyricsError(error);
        } else {
          const lyricsError = new LyricsError(
            LyricsErrorCode.UNKNOWN_ERROR,
            error instanceof Error ? error.message : String(error),
          );
          renderLyricsError(lyricsError);
        }

        return null;
      }
    }
    return null;
  }

  // 1-1. 실제 메타데이터, 가사 정보를 확보하는 핵심 함수
  async function collectMetadataAndLyricsCore(
    videoId: string,
    videoElem: HTMLMediaElement,
    attempt: number = 1,
  ): Promise<boolean | null> {
    if (isCollecting) {
      console.log('[Lyrics] 수집 중복 방지 중...');
      return null;
    }
    isCollecting = true;

    const startTime = performance.now();
    console.log(`[collectMetadataAndLyrics] 시도 ${attempt}/${API_RETRY_MAX_ATTEMPTS + 1} - videoId: ${videoId}`);

    // 🎵 "가사 준비 중..." 오버레이 표시
    const player =
      (document.querySelector('video') as HTMLVideoElement)?.closest('ytd-watch-flexy')?.querySelector('video') ||
      document.querySelector('video');

    let loadingOverlay: HTMLElement | null = null;

    if (player) {
      console.log('[AutoRewind] 가사 로딩 오버레이 표시');

      // "가사 준비 중..." 오버레이 생성
      loadingOverlay = document.createElement('div');
      loadingOverlay.id = 'lyrics-loading-overlay';

      loadingOverlay.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 20px 40px;
        border-radius: 8px;
        font-size: 18px;
        font-weight: bold;
        z-index: 9999;
        pointer-events: none;
      `;
      loadingOverlay.textContent = `🎵 ${i18nInstance.t('extLyricsLoading')}`;

      // YouTube 플레이어 컨테이너 (#movie_player)에 직접 추가
      const playerContainer = document.getElementById('movie_player');
      if (playerContainer) {
        playerContainer.style.position = 'relative';
        playerContainer.appendChild(loadingOverlay);
      }
    }

    try {
      contentLogger.debug('Starting metadata and lyrics collection', { videoId, attempt });

      // 🚀 Prefetch 전략: 가사 로드를 광고 여부와 무관하게 시작 (백그라운드)
      const metaStartTime = performance.now();
      const metaPromise = fetchYouTubeMetaViaBackground(videoId);

      // 1) 메타데이터 및 기본 정보 수집
      let meta;
      try {
        meta = await metaPromise;
        console.log(`[Performance] YouTube Meta 조회 완료 (${(performance.now() - metaStartTime).toFixed(0)}ms)`);
      } catch (metaError) {
        // YouTube API 에러 상세 추적
        const responseTime = performance.now() - metaStartTime;
        const errorMessage = metaError instanceof Error ? metaError.message : String(metaError);
        const isHttpError = errorMessage.includes('HTTP');
        const statusMatch = errorMessage.match(/HTTP (\d+):/);
        const httpStatus = statusMatch?.[1] ? parseInt(statusMatch[1], 10) : undefined;

        contentErrorTracker.captureError(
          metaError instanceof Error ? metaError : new Error(errorMessage),
          'YouTube API fetch failed',
          LogLevelEnum.ERROR,
          {
            videoId,
            apiEndpoint: 'youtube.googleapis.com/v3/videos',
            responseTime,
            httpStatus,
            isHttpError,
            attempt,
            url: window.location.href,
          },
        );

        throw metaError;
      }

      if (!meta) {
        contentLogger.warn('YouTube metadata not found', { videoId });
        throw new Error('메타 정보 없음');
      }

      const isMusic = isMusicVideo(meta);
      contentLogger.debug('Music video detection result', { videoId, isMusic });

      // 음악 영상이 아니면 오버레이 제거
      if (!isMusic) {
        console.log('[AutoRewind] 음악 영상 아님, 오버레이 제거');
        contentLogger.info('Not a music video, skipping lyrics and cleaning up UI', { videoId });
        console.log('[NOT_MUSIC_VIDEO] Tracking: about to remove loading overlay');

        if (loadingOverlay && loadingOverlay.parentElement) {
          loadingOverlay.remove();
        }

        console.log('[NOT_MUSIC_VIDEO] Tracking: cleanup complete, about to throw LyricsError');
      }

      // 자동 비활성화 로직: 음악 여부에 따라 카운트 업데이트
      if (isMusic) {
        console.log('[AutoDisable] 음악 영상 감지 - 카운트 리셋');
        const state = await resetNonMusicCount();

        // 자동 비활성화 상태였다면 재활성화 처리
        if (state.autoDisabled && state.autoDisabledReason === 'consecutive_non_music') {
          console.log('[AutoDisable] 자동 비활성화 상태였으나 음악 영상 감지 → 재활성화');
          await disableAutoDisable();
          showReactivationToast();
        }
      } else {
        console.log('[AutoDisable] 비음악 영상 감지 - 카운트 증가');
        const state = await incrementNonMusicCount();
        console.log(`[AutoDisable] 연속 비음악 카운트: ${state.consecutiveNonMusicCount}/${state.threshold}`);

        // 임계값 도달 시 자동 비활성화
        if (await shouldAutoDisable()) {
          console.log('[AutoDisable] 임계값 도달 - 자동 비활성화 활성화');
          await enableAutoDisable('consecutive_non_music');
          showAutoDisableNotification(state.threshold);
        }

        // 비음악 비디오는 LyricsError로 처리 (정상적인 스킵 상황)
        throw new LyricsError(LyricsErrorCode.NOT_MUSIC_VIDEO, 'Not a music video');
      }

      const videoDurationSec = meta.durationSec ?? 0;

      // 🚀 최적화: YouTube-LRCLib 캐시 조회를 Title 파싱과 병렬 처리
      const parallelStartTime = performance.now();

      const [ytLrclibCacheResult, titleParseResult] = await Promise.all([
        // YouTube-LRCLib 캐시 조회 (Background Script를 통한 API 프록시)
        (async () => {
          try {
            const cacheStartTime = performance.now();
            const response = await chrome.runtime.sendMessage({
              type: 'FETCH_YOUTUBE_LRCLIB_CACHE',
              videoId,
            });
            const result = response?.success ? response.data : null;
            console.log(
              `[Performance] YouTube-LRCLib 캐시 조회 완료 (${(performance.now() - cacheStartTime).toFixed(0)}ms, 상태: ${result ? '200' : '404'})`,
            );
            return result;
          } catch (error) {
            console.warn('[YouTube-LRCLib 캐시] 조회 실패:', error);
            return null;
          }
        })(),

        // Title 파싱 (병렬 처리)
        (async () => {
          const titleParseStartTime = performance.now();
          // 제목 정제: 이모지 + 콜론 앞부분 제거
          const cleanedTitle = stripEmojiAndBeforeColon(meta.title);
          console.log('[TITLE PARSE] 원본 타이틀:', meta.title);
          console.log('[TITLE PARSE] 정제된 타이틀:', cleanedTitle);

          // 1차: get-artist-title 라이브러리
          let parsed = extractArtistAndTitle(cleanedTitle);
          console.log('[TITLE PARSE] 1차(라이브러리) 결과:', parsed);

          // 2차: 커스텀 파서 (일본어 쌍따옴표 등 특수 패턴)
          if (!parsed) {
            parsed = extractArtistAndTitleCustom(cleanedTitle);
            console.log('[TITLE PARSE] 2차(커스텀) 결과:', parsed);
          }

          // 3차: fallback (채널명 사용 - 타이틀에 artist 정보가 없는 경우)
          if (!parsed) {
            const fallback = fallbackArtistAndTitle(meta);
            if (!fallback) throw new Error('곡명/아티스트 파싱 실패');

            fallback.title = cleanTopicName(fallback.title);
            fallback.artist = cleanTopicName(fallback.artist);
            // Fallback 파싱 결과는 removeExtraInfo가 적용되지 않았으므로 여기서 적용
            fallback.title = removeExtraInfo(fallback.title);
            fallback.artist = removeExtraInfo(fallback.artist);
            parsed = fallback;
            console.log('[TITLE PARSE] 3차(fallback) 결과:', parsed);
          }

          const artist = preprocessArtistOrTitle(parsed.artist);
          const title = preprocessArtistOrTitle(parsed.title);
          const artistVariants: string[] | undefined =
            'artistVariants' in parsed ? (parsed.artistVariants as string[] | undefined) : undefined;
          console.log(
            `[Performance] Title 파싱 완료 (${(performance.now() - titleParseStartTime).toFixed(0)}ms) - artist: ${artist}, title: ${title}`,
          );

          return { artist, title, artistVariants };
        })(),
      ]);

      console.log(`[Performance] 병렬 처리 완료 (${(performance.now() - parallelStartTime).toFixed(0)}ms)`);

      // 캐시 히트 시: Title 파싱 결과 불필요, 바로 가사 로드
      let lyricsData: {
        lyricsResult: LrcLibLyricsResult;
        parsedLyrics: Line[];
        effectiveLyricsDuration: number;
      };

      if (ytLrclibCacheResult?.lrclibId) {
        console.log(
          `[LRCLib] YouTube-LRCLib 캐시 히트! videoId: ${videoId} → lrclibId: ${ytLrclibCacheResult.lrclibId}`,
        );
        console.log('[LRCLib] 통합 엔드포인트로 가사 직접 조회 (최고속)');

        const lyricsSearchStartTime = performance.now();
        const response = await chrome.runtime.sendMessage({
          type: 'FETCH_YOUTUBE_LYRICS',
          videoId: videoId,
        });
        const result = response?.success ? response.data : null;
        console.log(`[Performance] 가사 검색 완료 (${(performance.now() - lyricsSearchStartTime).toFixed(0)}ms)`);

        if (!result) throw new Error('가사 없음');

        // 가사 파싱
        const { lyrics, duration: lyricsDuration } = result;
        const parsedLyrics: Line[] = typeof lyrics === 'string' ? parseLyrics(lyrics) : lyrics;
        const effectiveLyricsDuration =
          lyricsDuration ?? (parsedLyrics.length > 0 ? (parsedLyrics[parsedLyrics.length - 1]?.time ?? 0) : 0);

        lyricsData = { lyricsResult: result, parsedLyrics, effectiveLyricsDuration };
      } else {
        // 캐시 미스: Title 파싱 결과 사용하여 가사 조회
        console.log('[LRCLib] YouTube-LRCLib 캐시 미스, Title 파싱 결과로 가사 조회');
        const { artist, title, artistVariants } = titleParseResult;

        const lyricsSearchStartTime = performance.now();
        const result = await getLyricsFromCacheOrFetch(artist, title, {
          fetch: async () => fetchLyricsWithAliasFallback(artist, title, videoDurationSec, artistVariants, videoId),
        });
        console.log(`[Performance] 가사 검색 완료 (${(performance.now() - lyricsSearchStartTime).toFixed(0)}ms)`);

        if (!result) throw new Error('가사 없음');

        // 가사 파싱
        const { lyrics, duration: lyricsDuration } = result;
        const parsedLyrics: Line[] = typeof lyrics === 'string' ? parseLyrics(lyrics) : lyrics;
        const effectiveLyricsDuration =
          lyricsDuration ?? (parsedLyrics.length > 0 ? (parsedLyrics[parsedLyrics.length - 1]?.time ?? 0) : 0);

        console.log('[Lyrics] 가사 로딩 완료, 광고 종료 대기 중...');
        lyricsData = { lyricsResult: result, parsedLyrics, effectiveLyricsDuration };
      }
      console.log(`[Performance] 전체 가사 조회 완료 (${(performance.now() - startTime).toFixed(0)}ms)`);
      console.log('[Lyrics] 가사 로딩 완료');
      contentLogger.info('Lyrics loaded successfully', {
        videoId,
        lyricsCount: lyricsData.parsedLyrics.length,
        duration: lyricsData.effectiveLyricsDuration,
      });

      // 광고 대기 로직 제거: 광고 여부와 상관없이 즉시 렌더링
      // 광고 모니터링(startLyricsAdMonitoring)이 자동으로 가사 숨김/표시 처리

      // 4) 가사 준비 완료, 상태 업데이트 및 UI 렌더링
      const { lyricsResult: finalLyricsResult, parsedLyrics, effectiveLyricsDuration } = lyricsData;

      chrome.runtime.sendMessage({ type: 'LYRICS_READY', length: parsedLyrics.length }, () => {
        if (chrome.runtime.lastError) {
          // 에러 무시 - 수신자가 없을 수 있음
        }
      });

      // 🔄 Auto-Rewind: 첫 가사를 놓쳤다면 영상 처음으로 되감기 (광고 중에는 실행 안 함)
      if (parsedLyrics.length > 0 && parsedLyrics[0] && player) {
        const firstLyricTime = parsedLyrics[0].time;

        if (typeof firstLyricTime === 'number') {
          const currentTime = player.currentTime;
          const rewindDistance = currentTime - firstLyricTime;

          // 광고가 아닐 때만 되감기 로직 실행
          if (!isAdPlaying()) {
            // 가사를 받은 시점이 첫 가사 타임스탬프 이후라면 무조건 0초로 되감기
            if (rewindDistance > 0.5) {
              console.log(`[AutoRewind] 첫 가사 놓침 감지 (${rewindDistance.toFixed(1)}초), 0초로 되감기 실행`);
              console.log(
                `[AutoRewind] 현재 시간: ${currentTime.toFixed(1)}초 → 첫 가사: ${firstLyricTime.toFixed(1)}초`,
              );

              // 영상 처음(0초)으로 이동
              player.currentTime = 0;

              console.log(`[AutoRewind] 되감기 완료: 영상 처음(0초)으로 이동`);
            } else {
              console.log(`[AutoRewind] 첫 가사 놓치지 않음 (여유: ${Math.abs(rewindDistance).toFixed(1)}초)`);
            }
          } else {
            console.log(`[AutoRewind] 광고 재생 중, 되감기 스킵`);
          }

          // 모든 경우에 오버레이 제거
          if (loadingOverlay && loadingOverlay.parentElement) {
            loadingOverlay.remove();
            loadingOverlay = null;
          }
          console.log(`[AutoRewind] 오버레이 제거 완료`);
        }
      }

      const durationDiff = Math.abs(videoDurationSec - effectiveLyricsDuration);

      // 가사 싱크 불일치 감지 (±3초 이상 차이)
      if (durationDiff >= 3) {
        console.log(`[Lyrics Sync] 싱크 불일치 감지 - 차이: ${durationDiff.toFixed(1)}초`);

        // ActionableToast 표시 (싱크셋 유도)
        showActionableToast(
          i18nInstance.t('extLyricsSyncMismatchTitle'),
          i18nInstance.t('extLyricsSyncMismatchDescription'),
          i18nInstance.t('extLyricsSyncMismatchAction'),
          () => {
            // 싱크셋 버튼 클릭 액션
            console.log('[ActionableToast] 싱크셋 버튼 클릭됨');

            // 가라오케 모드가 활성화되어 있지 않다면 먼저 활성화
            if (!karaokeModeManager.isVisible()) {
              karaokeModeManager.toggleKaraokeMode();
            }

            // 싱크셋 패널 열기 이벤트 발생
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('open-sync-settings'));
            }, 500); // 가라오케 모드 활성화 대기
          },
          React.createElement('span', { style: { fontSize: '20px' } }, '⚠️'),
        );
      } else {
        console.debug(
          `[Lyrics Sync] 영상 길이 (${videoDurationSec}s)와 가사 길이 (${effectiveLyricsDuration}s) 차이: ${durationDiff.toFixed(1)}s - 정상 범위`,
        );
      }

      renderSongInfo(finalLyricsResult.title || 'Unknown', finalLyricsResult.artist || 'Unknown');

      // 5) 저장된 오프셋 확인 및 자동 적용
      const { getVideoOffset } = await import('@lib/utils/storage/videoOffsetStorage');
      const { applyOffsetToLyrics } = await import('@lib/utils/lyrics/display/lyricsOffset');

      const savedData = await getVideoOffset(videoId);
      let finalParsedLyrics = parsedLyrics;

      if (savedData && savedData.offset !== 0) {
        console.log(`[AutoOffset] 저장된 오프셋 발견 (videoId: ${videoId}, offset: ${savedData.offset}초) - 자동 적용`);
        finalParsedLyrics = applyOffsetToLyrics(parsedLyrics, savedData.offset, 0);
      } else {
        console.log(`[AutoOffset] 저장된 오프셋 없음 - 원본 가사 사용`);
      }

      // 6) 광고 종료 후 즉시 가사 렌더링 (오프셋 적용된 가사)
      onLyricsUpdated(finalParsedLyrics);
      await analyzeAudioAndRender(videoElem, meta, effectiveLyricsDuration, finalParsedLyrics);

      contentLogger.info('Lyrics rendering completed', {
        videoId,
        artist: finalLyricsResult.artist,
        title: finalLyricsResult.title,
        totalTime: (performance.now() - startTime).toFixed(0) + 'ms',
      });

      return true;
    } catch (error) {
      // NOT_MUSIC_VIDEO는 정상 시나리오이므로 에러 로깅 생략
      if (error instanceof LyricsError && error.code === LyricsErrorCode.NOT_MUSIC_VIDEO) {
        throw error; // 상위로 전파만
      }

      // 재시도 가능한 에러는 WARN 레벨로 로깅
      const isRetryableError =
        error instanceof LyricsError &&
        (error.code === LyricsErrorCode.API_TIMEOUT || error.code === LyricsErrorCode.NETWORK_ERROR);

      if (isRetryableError && attempt <= API_RETRY_MAX_ATTEMPTS) {
        // 재시도 중인 에러는 WARN 레벨
        console.warn(`[collectMetadataAndLyricsCore] 재시도 가능한 에러 (시도 ${attempt}):`, error);
        contentLogger.warn('Retryable error in collectMetadataAndLyricsCore', {
          videoId,
          attempt,
          errorCode: error instanceof LyricsError ? error.code : undefined,
        });
      } else {
        // 최종 실패 에러는 ERROR 레벨
        console.error(`[collectMetadataAndLyricsCore] 에러 (시도 ${attempt}):`, error);
        contentLogger.error('Error in collectMetadataAndLyricsCore', error as Error, {
          videoId,
          attempt,
        });
      }

      // LyricsError 처리
      if (error instanceof LyricsError) {
        // 재시도 중인 경우 에러를 위로 전파 (렌더링하지 않음)
        throw error;
      } else {
        // 일반 에러를 LyricsError로 변환하여 전파
        let lyricsError: LyricsError;

        if (error instanceof Error) {
          // 네트워크 에러 감지
          if (error.message.includes('Failed to fetch') || error.name === 'NetworkError') {
            lyricsError = LyricsError.fromNetworkError(error, { videoId, attempt });
          } else {
            lyricsError = new LyricsError(LyricsErrorCode.UNKNOWN_ERROR, error.message);
          }
        } else {
          lyricsError = new LyricsError(LyricsErrorCode.UNKNOWN_ERROR, String(error));
        }

        throw lyricsError;
      }
    } finally {
      isCollecting = false;

      // 로딩 오버레이 제거 (비음악 비디오 포함)
      if (loadingOverlay && loadingOverlay.parentElement) {
        loadingOverlay.remove();
      }
    }
  }

  // 실제 영상 분석 + 가사 동기화 렌더링 분리 함수. 후에 meta와 lyricsDuration을 매개변수로 추가할 수 있음
  async function analyzeAudioAndRender(
    videoElem: HTMLMediaElement,
    _meta: { durationSec?: number },
    _lyricsDuration: number | undefined,
    parsedLyrics: Line[],
  ) {
    // 중복 audio source 연결 방지 및 안전한 초기화
    cleanupMediaElementSource(videoElem);

    latestLyrics = parsedLyrics;
    onLyricsUpdated(parsedLyrics);

    // 추가적인 싱크 조정 로직이나 렌더링 로직이 들어갈 수 있음
  }

  // 영상 감지 핸들러 (순수 로직)
  const handleVideoDetection = async () => {
    console.log('handleVideoDetection 실행');
    if (isDetecting) {
      console.log('[handleVideoDetection] 이미 실행되고 있음');
      return;
    }
    isDetecting = true;

    //const videoIdFromUrl = getCurrentVideoId();
    const videoElem = document.querySelector('video');
    if (!videoElem) {
      contentLogger.warn('Video element not found, skipping detection');
      return;
    }

    let videoData;
    try {
      videoData = detectYouTubeVideo();

      if (!videoData || !videoData.videoId) {
        contentLogger.warn('Failed to detect YouTube video');
        return;
      }

      if (videoData.videoId === lastVideoId && isLyricsOverlayMounted()) {
        contentLogger.debug('Video already processed, skipping', { videoId: videoData.videoId });
        return;
      }

      // 미니플레이어 전환 중엔 클린업 안 하도록 처리
      if (isMiniToFullTransitioning) {
        console.log('[handleVideoDetection] 미니 -> 일반 플레이어 전환 중, 클린업 생략');
        return;
      }
      // 이제 감지 성공했을 경우만 갱신
      lastVideoId = videoData.videoId;

      contentLogger.info('Starting lyrics collection', { videoId: videoData.videoId });
      const collected = await collectMetadataAndLyrics(videoData.videoId, videoElem);

      if (!collected) {
        contentLogger.warn('Lyrics collection failed or no data');
        return;
      }
    } catch (error) {
      contentErrorTracker.captureError(error as Error, 'Failed to detect and process video', LogLevelEnum.ERROR, {
        videoId: videoData?.videoId,
      });
    } finally {
      isDetecting = false;

      if (videoData && videoData.videoId) {
        lastVideoId = videoData.videoId;
      }
    }
  };
  // --- wrapper ---
  const handleVideoDetectionGuarded = withContentEnabled(getContentEnabled, handleVideoDetection);
  const debouncedDetection = debounce(handleVideoDetectionGuarded, RETRY_DELAY);

  // --- 스토리지, UI, SPA 이벤트, visibility 이벤트 일괄 관리 ---
  // SPA URL 변화 처리 공통 함수, URL 변화의 감지와 상태 판단을 담당하는 상위 레벨 함수
  function handleSpaUrlChange(url: string) {
    if (!contentEnabled) return;
    const currentVideoId = getCurrentVideoId();
    const currentIsWatchPage = checkIsWatchPage(url);

    const videoIdChanged = currentVideoId !== lastVideoId;
    const urlChanged = hasUrlChanged(url, lastUrl);
    const watchPageChanged = currentIsWatchPage !== checkIsWatchPage(lastUrl);

    console.log(
      `[SPA] url: ${url} videoIdChanged: ${videoIdChanged} urlChanged: ${urlChanged} watchPageChanged: ${watchPageChanged}`,
    );

    // watch 페이지를 벗어날 때 가라오케 모드 자동 해제
    if (watchPageChanged && !currentIsWatchPage && karaokeModeManager.isVisible()) {
      console.log('[SPA] watch 페이지 벗어남 - 가라오케 모드 자동 해제');
      karaokeModeManager.toggleKaraokeMode();
    }

    if (isMiniToFullTransitioning) {
      console.log('[SPA] 미니-일반 전환 중 감지 호출 스킵');
      return;
    }

    // contentEnabled 상태는 chrome.storage.sync에서 관리됨
    if (!contentEnabled) {
      console.log('[Content] 콘텐츠 비활성 상태 - UI 렌더링 및 리스너 초기화 건너뜀');
      return;
    }

    // 영상 -> 영상, videoId가 있는 곳으로 url 변경된 상황
    if (videoIdChanged || (urlChanged && watchPageChanged)) {
      spaObserverShouldTriggerDetection = false;
      resetLyricsData();
      handleUrlChangeGuarded(url);
      setTimeout(() => {
        spaObserverShouldTriggerDetection = true;
      }, 5000);
    } else {
      console.log('[SPA] 영상 및 페이지 변동 없음, 감지 생략');
    }
  }

  function isReadyForDetection() {
    const player = document.querySelector('video');

    // readyState 2 이상 체크(HAVE_CURRENT_DATA)
    // 광고 체크 제거: 광고 중이어도 가사 fetch는 진행하고, fetch 완료 후 광고 종료를 대기함
    const ready = player && player.readyState >= 2;

    return ready;
  }

  async function detectVideoWithRetry(maxRetries = 15, retryInterval = 2000) {
    if (isDetecting || isRetryingDetection) return;
    isRetryingDetection = true;

    try {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        if (!isReadyForDetection()) {
          await delay(retryInterval);
          continue;
        }
        const detected = await detectAndProcessVideo();
        if (detected) break;
        await delay(retryInterval);
      }
    } finally {
      isRetryingDetection = false;
    }
  }
  async function detectAndProcessVideo() {
    const videoId = getCurrentVideoId();
    if (!videoId) return false;

    if (videoId === lastVideoId) return true;

    // 영상 변경 대응 및 데이터 처리
    await handleVideoDetectionGuarded();

    return true;
  }

  // --- video DOM 등장 관찰용 MutationObserver 등록 함수 ---
  function setupVideoElementObserver() {
    // 최적화: Observer 등록 전에 이미 존재하는지 먼저 확인
    const existingVideo = document.querySelector('video');
    if (existingVideo) {
      console.log('[setupVideoElementObserver] video 엘리먼트 이미 존재, 즉시 처리');
      handleVideoDetectionGuarded();
      return null; // Observer 불필요
    }

    // YouTube 플레이어 컨테이너만 관찰 (document.body 전체 대신)
    const playerContainer = document.getElementById('movie_player') || document.body;
    console.log(
      `[setupVideoElementObserver] Observer 시작 (target: ${playerContainer === document.body ? 'body' : '#movie_player'})`,
    );

    const observer = new MutationObserver(() => {
      const videoElem = document.querySelector('video');
      if (videoElem) {
        console.log('[setupVideoElementObserver] video 엘리먼트 발견');
        handleVideoDetectionGuarded();

        observer.disconnect();
        detectionObserverManager.videoElementObserver = null;
      }
    });

    observer.observe(playerContainer, { childList: true, subtree: true });
    return observer;
  }

  // 미니 -> 기본 감지
  function setupMiniToBasicTransitionObserver() {
    const player = document.querySelector(YOUTUBE_MINI_PLAYER_CONTAINER_SELECTOR);
    if (!player) return null;

    let lastIsMini = YOUTUBE_MINI_PLAYER_CLASSES.some((c) => player.classList.contains(c));
    const observer = new MutationObserver(() => {
      if (isFirstMutation) {
        isFirstMutation = false;
        lastIsMini = YOUTUBE_MINI_PLAYER_CLASSES.some((c) => player.classList.contains(c));
        return;
      }
      const isMini = YOUTUBE_MINI_PLAYER_CLASSES.some((c) => player.classList.contains(c));
      if (lastIsMini && !isMini) {
        console.log('[Transition] 미니 -> 기본 유지');
        renderLyricsOverlay(latestLyrics);
      }
      lastIsMini = isMini;
    });
    observer.observe(player, { attributes: true, attributeFilter: ['class'] });
    detectionObserverManager.miniToBasicObserver = observer;
    return observer;
  }
  // 기본 -> 미니 감지
  function setupBasicToMiniTransitionObserver() {
    const player = document.querySelector(YOUTUBE_MINI_PLAYER_CONTAINER_SELECTOR);
    if (!player) return null;

    let lastIsMini = YOUTUBE_MINI_PLAYER_CLASSES.some((c) => player.classList.contains(c));

    const observer = new MutationObserver(() => {
      const isMini = YOUTUBE_MINI_PLAYER_CLASSES.some((c) => player.classList.contains(c));

      if (!lastIsMini && isMini) {
        console.log('[Transition] 기본 → 미니 플레이어 전환 감지');
        // 미니플레이어 전환 시 UI 유지 또는 재렌더링 처리
        renderLyricsOverlay(latestLyrics); // 필요 시 상태 동기화 및 감지 조작 수행
      }

      lastIsMini = isMini;
    });

    observer.observe(player, { attributes: true, attributeFilter: ['class'] });
    detectionObserverManager.basicToMiniObserver = observer;

    return observer;
  }

  // 감지 활성화 및 옵저버 등록 전담 함수
  const enableDetection = async () => {
    console.log('[enableDetection] 실행');
    if (isDetectionActive) {
      console.log('[SKIP] 감지 시스템 이미 활성화됨');
      return;
    }

    const debouncedSpaObserverCallback = debounce(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        if (spaObserverShouldTriggerDetection) {
          handleSpaUrlChange(currentUrl);
          lastUrl = currentUrl;
          console.log(`lastUrl: ${lastUrl}, currentUrl: ${currentUrl}`);
        } else {
          console.log('[SPA Observer] 감지 호출 스킵 (메시지 리스너 우선)');
        }
      }
    }, 200); // debounce delay can be tuned, example 200ms

    detectionObserverManager.spaObserver = setupSPAObserver(debouncedSpaObserverCallback);

    if (!detectionObserverManager.videoElementObserver) {
      detectionObserverManager.videoElementObserver = setupVideoElementObserver();
    }

    isDetectionActive = true;
  };
  // 감지 시스템 완전 비활성화
  const disableDetection = () => {
    console.log('[disableDetection] cleanupAllResources 실행');
    cleanupAllResources();

    if (detectionObserverManager.videoElementObserver) {
      detectionObserverManager.videoElementObserver.disconnect();
      detectionObserverManager.videoElementObserver = null;
    }

    if (detectionObserverManager.miniToBasicObserver) {
      detectionObserverManager.miniToBasicObserver.disconnect();
      detectionObserverManager.miniToBasicObserver = null;
    }

    if (detectionObserverManager.basicToMiniObserver) {
      detectionObserverManager.basicToMiniObserver.disconnect();
      detectionObserverManager.basicToMiniObserver = null;
    }

    if (!isDetectionActive) {
      console.log('[SKIP] 감지 시스템 이미 비활성화됨');
      return;
    }

    isDetectionActive = false;
    lastVideoId = null;

    console.log('[Detection] 감지 시스템 완전 비활성화');
  };

  // 에러 바운더리 에러 핸들러 (모니터링 통합)
  const handleError = (error: Error, info: { componentStack?: string | null }) => {
    contentErrorTracker.captureError(error, 'React Error Boundary caught an error', LogLevelEnum.ERROR, {
      componentStack: info.componentStack ?? undefined,
      videoId: lastVideoId,
    });
    contentLogger.error('React component error', error, {
      componentStack: info.componentStack ?? undefined,
      videoId: lastVideoId,
    });
  };

  // 에러 바운더리 리셋 핸들러
  const handleReset = () => {
    contentLogger.info('Error boundary reset triggered');
    window.location.reload();
  };

  function setupUIResources() {
    contentLogger.info('[setupUIResources] Starting UI resource setup');
    console.log('[setupUIResources] Starting UI resource setup - tracking Emotion mounting');

    cleanupAllResources();
    if (!overlayManager.isInitialized('lyrics')) {
      console.log('[setupUIResources] 오버레이 초기화 진행');
      contentLogger.info('[setupUIResources] Creating overlay roots and mounting React components');

      overlayManager.createOverlayRoot('lyrics');
      overlayManager.createOverlayRoot('songInfo');

      overlayManager.renderOverlay(
        'lyrics',
        <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError} onReset={handleReset}>
          <I18nextProvider i18n={i18nInstance}>
            <App />
          </I18nextProvider>
        </ErrorBoundary>,
      );

      console.log('[setupUIResources] React components mounted - Emotion should be loaded');
      contentLogger.info('[setupUIResources] React components mounted successfully');
    } else {
      console.log('[setupUIResources] Overlays already initialized, skipping mount');
      contentLogger.info('[setupUIResources] Overlays already initialized');
    }
    // 다른 오버레이 타입들(예: songInfo)도 여기에 포함 가능
  }
  function startDetectionWorkflow() {
    console.log('[startDetectionWorkflow] 시작');
    initListenersAndState(); // Storage 초기값 및 이벤트 등록

    // MutationObserver 등록 및 manager에 저장
    if (!detectionObserverManager.miniToBasicObserver) {
      detectionObserverManager.miniToBasicObserver = setupMiniToBasicTransitionObserver();
    }
    if (!detectionObserverManager.basicToMiniObserver) {
      detectionObserverManager.basicToMiniObserver = setupBasicToMiniTransitionObserver();
    }

    enableDetection(); // 감지 시스템 활성화 및 옵저버 등록
    detectVideoWithRetry();
  }

  function shouldCleanupNow(): boolean {
    const now = Date.now();
    const diff = now - lastContentEnabledFalseTime;
    console.log(`[shouldCleanupNow] now=${now}, lastFalse=${lastContentEnabledFalseTime}, diff=${diff}ms`);
    return diff > CLEANUP_DEBOUNCE_MS;
  }

  // 상태 변경 함수를 별도 구현
  function setContentEnabled(status: boolean, origin: 'user' | 'system') {
    contentEnabled = status;
    lastChangeOrigin = origin;

    if (!status) {
      lastContentEnabledFalseTime = Date.now();
    }
  }

  // 앱 초기화. 맨 처음, 새로고침 할 경우.
  const initializeApp = async () => {
    contentLogger.info('Content app initialization started');
    try {
      await initializeI18n();
      await injectCSS();

      // YouTube 페이지 로드 대기 후 MusicNoteButton 렌더링
      const waitForYouTubePlayer = async () => {
        let attempts = 0;
        const maxAttempts = 20;

        while (attempts < maxAttempts) {
          const playerControls =
            document.querySelector('.ytp-right-controls-right') || document.querySelector('.ytp-right-controls');

          if (playerControls) {
            console.log('[initializeApp] YouTube 플레이어 컨트롤 발견, MusicNoteButton 렌더링');
            renderMusicNoteButton();
            break;
          }

          await new Promise((resolve) => setTimeout(resolve, 500));
          attempts++;
        }

        if (attempts >= maxAttempts) {
          // YouTube 플레이어 컨트롤을 찾을 수 없는 경우 경고
          console.warn('[initializeApp] YouTube 플레이어 컨트롤을 찾을 수 없음');
        }
      };

      // 비동기로 버튼 렌더링 시도
      waitForYouTubePlayer();

      // contentEnabled 상태를 chrome.storage.sync에서 읽어옴
      const result = await chrome.storage.sync.get([STORAGE_KEYS.CONTENT_ENABLED]);
      contentEnabled = result[STORAGE_KEYS.CONTENT_ENABLED] ?? false;
      contentLogger.info('Content enabled state loaded', { contentEnabled });

      if (!contentEnabled) {
        contentLogger.info('Content disabled - skipping UI and listeners initialization');
      } else {
        setupUIResources();
        startDetectionWorkflow();
        contentLogger.info('Content app initialization completed successfully');
      }

      // 수동 가사 검색으로 가사 선택 시 이벤트 리스너
      window.addEventListener('manual-lyrics-selected', (event: Event) => {
        const customEvent = event as CustomEvent<{ lyrics: Line[] }>;
        const newLyrics = customEvent.detail.lyrics;
        console.log('[Index] 수동 가사 검색으로 가사 선택됨:', newLyrics.length, '줄');

        // 가사 업데이트
        karaokeModeManager.setLyrics(newLyrics);

        // 가사 오버레이 렌더링
        renderLyricsOverlay(newLyrics);

        // 광고 모니터링 시작
        startLyricsAdMonitoringIfNeeded();
      });

      // 온체인지 리스너
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'sync' && STORAGE_KEYS.CONTENT_ENABLED in changes) {
          const newValue = changes[STORAGE_KEYS.CONTENT_ENABLED]?.newValue;

          // origin 정보는 changes 내에 없으니 lastChangeOrigin 사용
          console.log(`contentEnabled 변경 감지: ${newValue}, origin: ${lastChangeOrigin}`);

          setContentEnabled(newValue, lastChangeOrigin);

          if (newValue === false) {
            if (shouldCleanupNow()) {
              console.log('[storage.onChanged] Tracking: Content disabled, about to cleanup');
              disableDetection();
              cleanupAllResources();
            } else {
              console.log('[storage.onChanged] 초기화 지연됨 - debounce 및 origin 조건');
            }
          } else if (newValue === true) {
            if (shouldCleanupNow()) {
              console.log('[storage.onChanged] Tracking: Content enabled, about to setup UI resources');
              setupUIResources();
              startDetectionWorkflow();
            } else {
              console.log('[storage.onChanged] 초기화 스킵 - 빈번한 토글 감지됨');
            }
          }
        }
      });
    } catch (error) {
      contentErrorTracker.captureError(error as Error, 'Failed to initialize content app', LogLevelEnum.FATAL);
      contentLogger.fatal('Content app initialization failed', error as Error);
    }
  };

  initializeApp();
})();
