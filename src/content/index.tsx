// ./index.tsx
import { App } from './App';
import { i18nInstance, initializeI18n } from '@services/i18n';
import { ErrorFallback } from '@components/common/ErrorFallback';
import { I18nextProvider } from 'react-i18next';
import { ErrorBoundary } from 'react-error-boundary';
import { detectYouTubeVideo, setupSPAObserver } from '@lib/youtube';
import { debounce } from '@lib/utils/common/common';
import { STORAGE_KEYS } from '@constants/storageKeys';
import { fetchYouTubeVideoMeta } from '@background/api/youtube';
import { isMusicVideo } from '@lib/utils/audio/musicDetection';
import { UIResourceManager } from '@lib/utils/infra/uiResourceManager';
import { YOUTUBE_MINI_PLAYER_CLASSES, YOUTUBE_MINI_PLAYER_CONTAINER_SELECTOR } from '@constants/youtubeSelectors';
import { extractArtistAndTitle, fallbackArtistAndTitle } from '@lib/utils/lyrics/meta/artistTitle';
import {
  cleanTopicName,
  extractArtistAndTitleCustom,
  preprocessArtistOrTitle,
  stripEmojiAndBeforeColon,
} from '@lib/utils/lyrics/parsers/stringUtils';
import { listenerManager } from '@lib/utils/infra/listenerManager';
import { withContentEnabled } from '@lib/utils/platform/contentGuard';
import { DualHighlightLyrics } from './components/lyrics/SyncLyrics/DualHighlightLyrics';
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
import { MusicNoteButton } from './components/karaoke-player-settings/MusicNoteButton';
import { RiMusicAiLine } from 'react-icons/ri';
import musicNoteStyles from './components/karaoke-player-settings/styles.module.css';
import ReactDOM from 'react-dom/client';
import { KaraokeModeContainer } from './components/karaoke-mode';
import {
  incrementNonMusicCount,
  resetNonMusicCount,
  enableAutoDisable,
  disableAutoDisable,
  shouldAutoDisable,
} from '@lib/utils/storage/autoDisableStorage';
import { Toast } from './components/common/Toast';
import { AutoDisableNotification } from './components/common/AutoDisableNotification';

(() => {
  // 새로고침 시 contentscript 내 중복 실행 방지
  if (window.__LYRICS_OVERLAY_INITED) {
    console.log('[LyricsExt] Already initialized. Skipping...');
    return;
  }
  window.__LYRICS_OVERLAY_INITED = true;

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

  let showRealtimeLyrics = true; // 현재 가사 ui 보이게
  let showPronunciationLyrics = true;

  let lyricsMode: 'sync' | 'full' = 'sync';

  // let analyzeLyricsAfterAd: (() => Promise<void>) | null = null;

  // 중복 가사 호출 방지
  let isCollecting = false;

  let lastContentEnabledFalseTime = 0; // 마지막 false 처리 시각(ms)
  const CLEANUP_DEBOUNCE_MS = 500; // 0.5초 딜레이
  let lastChangeOrigin: 'user' | 'system' = 'system';

  // MusicNoteButton 전용 React Root
  let musicNoteButtonRoot: ReactDOM.Root | null = null;

  // KaraokeModeContainer 전용 React Root 및 상태
  let karaokeModeRoot: ReactDOM.Root | null = null;
  let isKaraokeModeVisible = false;

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

  interface DetectionObserverManager {
    spaObserver: MutationObserver | null;
    lyricsObserver: MutationObserver | null;
    videoElementObserver: MutationObserver | null;
  }
  const detectionObserverManager: DetectionObserverManager = {
    spaObserver: null,
    lyricsObserver: null,
    videoElementObserver: null,
    // ...other observers
  };

  //
  // clear, clean logic
  /**
   * 모든 리스너와 옵저버, UI 리소스, 오버레이, 가사 상태 데이터를 포함해
   * 콘텐츠 관련 전반적인 리소스를 정리하는 최상위 클린업 함수
   */
  const cleanupAllResources = (): void => {
    console.log('cleanupAllResources 실행');

    listenerManager.removeAll();
    removeAllObservers();
    uiManager.cleanup();
    resetLyricsData();
  };

  // --- Observer 및 리스너 관리 함수 ---
  const removeAllObservers = (): void => {
    Object.values(detectionObserverManager).forEach((obs) => obs?.disconnect && obs.disconnect());
    detectionObserverManager.spaObserver = null;
    detectionObserverManager.lyricsObserver = null;
    detectionObserverManager.videoElementObserver = null;
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
    overlayManager.setVisibility('songInfo', false);

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

  // 가라오케 모드 토글 함수
  async function toggleKaraokeMode() {
    // 가라오케 모드를 켜려고 할 때만 확장 활성화 상태 확인
    if (!isKaraokeModeVisible) {
      const result = await chrome.storage.sync.get([STORAGE_KEYS.CONTENT_ENABLED]);
      const isExtensionEnabled = result[STORAGE_KEYS.CONTENT_ENABLED] ?? false;

      if (!isExtensionEnabled) {
        // 확장이 비활성화되어 있으면 토스트 메시지 표시 후 차단
        showToast('확장 프로그램을 먼저 활성화해주세요 (우측 상단 확장 아이콘 클릭)');
        console.log('[toggleKaraokeMode] 확장 비활성화 상태 - 가라오케 모드 진입 차단');
        return;
      }
    }

    // 가라오케 모드 토글 (끄는 것은 확장 활성화 여부와 무관)
    isKaraokeModeVisible = !isKaraokeModeVisible;
    console.log(`[toggleKaraokeMode] 가라오케 모드 ${isKaraokeModeVisible ? '활성화' : '비활성화'}`);

    // KaraokeModeContainer 렌더링
    renderKaraokeModeContainer();

    // MusicNoteButton의 menuVisible 상태를 DOM으로 직접 업데이트 (재렌더링 방지)
    const musicNoteBtn = document.querySelector('.ytp-music-note-button') as HTMLButtonElement;
    if (musicNoteBtn) {
      musicNoteBtn.classList.toggle('clicked', isKaraokeModeVisible);
      musicNoteBtn.setAttribute('data-menu-visible', isKaraokeModeVisible ? 'true' : 'false');
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
      karaokeModeRoot = ReactDOM.createRoot(karaokeContainer);
    }

    // KaraokeModeContainer 렌더링 (visible 상태에 따라 표시/숨김)
    karaokeModeRoot.render(<KaraokeModeContainer visible={isKaraokeModeVisible} lyrics={latestLyrics} />);
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
    musicNoteButtonRoot = ReactDOM.createRoot(buttonContainer);
    musicNoteButtonRoot.render(
      <MusicNoteButton
        icon={<RiMusicAiLine className={musicNoteStyles.icon} size={24} color="white" />}
        contentEnabled={true} // 항상 true
        menuVisible={isKaraokeModeVisible}
        onClick={toggleKaraokeMode}
      />,
    );

    console.log('[renderMusicNoteButton] 렌더링 완료');
  }

  // 재활성화 토스트 표시
  function showReactivationToast() {
    console.log('[AutoDisable] 재활성화 토스트 표시');

    let toastContainer = document.getElementById('auto-disable-toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'auto-disable-toast-container';
      document.body.appendChild(toastContainer);
    }

    if (!toastRoot) {
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
  function showAutoDisableNotification(threshold: number) {
    console.log('[AutoDisable] 자동 비활성화 알림 표시');

    let notificationContainer = document.getElementById('auto-disable-notification-container');
    if (!notificationContainer) {
      notificationContainer = document.createElement('div');
      notificationContainer.id = 'auto-disable-notification-container';
      document.body.appendChild(notificationContainer);
    }

    if (!notificationRoot) {
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
        <FullLyrics
          lyrics={lyrics}
          offset={offset}
          fontColor={lyricsFontColorCurrent}
          pronunciationColor={lyricsFontColorPronunciation}
          showRealtimeLyrics={showRealtimeLyrics}
          showPronunciationLyrics={showPronunciationLyrics}
        />,
      );
    } else if (lyricsMode === 'sync') {
      overlayManager.renderOverlay(
        'lyrics',
        <DualHighlightLyrics
          lyrics={lyrics}
          offset={offset}
          fontColor={lyricsFontColorCurrent}
          pronunciationColor={lyricsFontColorPronunciation}
          showRealtimeLyrics={showRealtimeLyrics}
          showPronunciationLyrics={showPronunciationLyrics}
        />,
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

    overlayManager.setVisibility('songInfo', true);
    overlayManager.renderOverlay('songInfo', <SongInfoOverlay title={title} artist={artist} lyricsSource="LRCLIB" />);

    // 영상 재생 시간 기준으로 자동 숨김 (광고 시간 제외)
    const videoElem = document.querySelector('video');
    if (videoElem) {
      songInfoVideoTimeListener = () => {
        if (videoElem.currentTime >= SONG_INFO_HIDE_AT_VIDEO_TIME) {
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
        ['lyricsFontColorCurrent', 'lyricsFontColorPronunciation', 'realtimeLyrics', 'announceLyrics', 'lyricsMode'],
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
          if (['sync', 'full'].includes(items.lyricsMode)) {
            lyricsMode = items.lyricsMode;
          }

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
        if (m === 'sync' || m === 'full') {
          lyricsMode = m;
          needRerender = true;
        }
      }

      if (needRerender && latestLyrics.length) {
        renderLyricsOverlay(latestLyrics);
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

    // KaraokeModeContainer도 업데이트 (가사가 변경되면 BottomContainer에 전달)
    if (isKaraokeModeVisible) {
      renderKaraokeModeContainer();
    }

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
        // API 타임아웃이고 아직 재시도 가능한 경우
        if (
          error instanceof LyricsError &&
          error.code === LyricsErrorCode.API_TIMEOUT &&
          attempt <= API_RETRY_MAX_ATTEMPTS
        ) {
          console.log(`[collectMetadataAndLyrics] API 타임아웃 발생, 재시도 ${attempt}/${API_RETRY_MAX_ATTEMPTS}`);
          continue; // 바로 다음 시도
        }

        // 재시도 불가능하거나 다른 에러인 경우
        console.error('[collectMetadataAndLyrics] 최종 실패:', error);

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

    try {
      // 🚀 Prefetch 전략: 가사 로드를 광고 여부와 무관하게 시작 (백그라운드)
      const metaStartTime = performance.now();
      const metaPromise = fetchYouTubeVideoMeta(videoId, process.env.YOUTUBE_API_KEY!);

      // 1) 메타데이터 및 기본 정보 수집
      const meta = await metaPromise;
      console.log(`[Performance] YouTube Meta 조회 완료 (${(performance.now() - metaStartTime).toFixed(0)}ms)`);
      if (!meta) throw new Error('메타 정보 없음');

      const isMusic = isMusicVideo(meta);

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

        throw new Error('음악 영상 아님');
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
        console.log('[LRCLib] Title 파싱 생략, 캐시된 ID로 직접 가사 조회');

        const lyricsSearchStartTime = performance.now();
        const response = await chrome.runtime.sendMessage({
          type: 'FETCH_LYRICS_BY_ID',
          lrclibId: ytLrclibCacheResult.lrclibId,
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
      console.log('[Lyrics] 가사 로딩 완료, 광고 종료 대기 시작');

      // 🚀 2단계: 광고 종료 대기 (가사 준비 후에만 수행)
      let adWaitAttempt = 0;
      while (isAdPlaying() && adWaitAttempt < 30) {
        console.log('[Lyrics] 광고 재생 중, 대기... (' + (adWaitAttempt + 1) + '/30)');
        await delay(500);
        adWaitAttempt++;
      }
      if (adWaitAttempt >= 30) {
        throw new Error('광고 대기 시간 초과');
      }
      if (adWaitAttempt > 0) {
        console.log('[Lyrics] 광고 종료 확인');
      }

      // 4) 가사 준비 완료, 상태 업데이트 및 UI 렌더링
      const { lyricsResult: finalLyricsResult, parsedLyrics, effectiveLyricsDuration } = lyricsData;

      chrome.runtime.sendMessage({ type: 'LYRICS_READY', length: parsedLyrics.length }, () => {
        if (chrome.runtime.lastError) {
          // 에러 무시 - 수신자가 없을 수 있음
        }
      });

      const durationDiff = videoDurationSec - effectiveLyricsDuration;
      if (durationDiff > 0 && durationDiff < 4) {
        console.log('싱크 오류 가능성 있음, 추가 분석 진행');
      } else {
        console.debug(
          `영상 길이 (${videoDurationSec}s)와 가사 길이 (${effectiveLyricsDuration}s) 차이: ${durationDiff}s`,
        );
      }

      renderSongInfo(finalLyricsResult.title || 'Unknown', finalLyricsResult.artist || 'Unknown');

      // 5) 광고 종료 후 즉시 가사 렌더링
      onLyricsUpdated(parsedLyrics);
      await analyzeAudioAndRender(videoElem, meta, effectiveLyricsDuration, parsedLyrics);
      return true;
    } catch (error) {
      console.error(`[collectMetadataAndLyricsCore] 에러 (시도 ${attempt}):`, error);

      // LyricsError 처리
      if (error instanceof LyricsError) {
        // 재시도 중인 경우 에러를 위로 전파 (렌더링하지 않음)
        throw error;
      } else {
        // 일반 에러를 LyricsError로 변환하여 전파
        const lyricsError = new LyricsError(
          LyricsErrorCode.UNKNOWN_ERROR,
          error instanceof Error ? error.message : String(error),
        );
        throw lyricsError;
      }
    } finally {
      isCollecting = false;
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
      console.log('[handleVideoDetection] video element 미존재, 렌더링 생략');
      return;
    }

    let videoData;
    try {
      videoData = detectYouTubeVideo();

      if (!videoData || !videoData.videoId) {
        console.log('[handleVideoDetection] 비디오 감지 실패');
        return;
      }

      if (videoData.videoId === lastVideoId && isLyricsOverlayMounted()) {
        console.log('[handleVideoDetection] 이미 처리한 videoId, 오버레이도 실제로 화면에 있음 -> skip');
        return;
      }

      // 미니플레이어 전환 중엔 클린업 안 하도록 처리
      if (isMiniToFullTransitioning) {
        console.log('[handleVideoDetection] 미니 -> 일반 플레이어 전환 중, 클린업 생략');
        return;
      }
      // 이제 감지 성공했을 경우만 갱신
      lastVideoId = videoData.videoId;
      const collected = await collectMetadataAndLyrics(videoData.videoId, videoElem);

      if (!collected) {
        console.warn('[handleVideoDetection] 가사 수집 실패 또는 데이터 없음');
        return;
      }
    } catch (error) {
      console.error('[handleVideoDetection] 에러 발생:', error);
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
    if (!player) return;

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

    if (!isDetectionActive) {
      console.log('[SKIP] 감지 시스템 이미 비활성화됨');
      return;
    }

    isDetectionActive = false;
    lastVideoId = null;

    console.log('[Detection] 감지 시스템 완전 비활성화');
  };

  // 에러 바운더리 리셋 핸들러
  const handleReset = () => {
    window.location.reload();
  };

  function setupUIResources() {
    cleanupAllResources();
    if (!overlayManager.isInitialized('lyrics')) {
      console.log('[setupUIResources] 오버레이 초기화 진행');
      overlayManager.createOverlayRoot('lyrics');
      overlayManager.createOverlayRoot('songInfo');

      overlayManager.renderOverlay(
        'lyrics',
        <ErrorBoundary FallbackComponent={ErrorFallback} onReset={handleReset}>
          <I18nextProvider i18n={i18nInstance}>
            <App />
          </I18nextProvider>
        </ErrorBoundary>,
      );
    }
    // 다른 오버레이 타입들(예: songInfo)도 여기에 포함 가능
  }
  function startDetectionWorkflow() {
    console.log('[startDetectionWorkflow] 시작');
    initListenersAndState(); // Storage 초기값 및 이벤트 등록
    setupMiniToBasicTransitionObserver();
    setupBasicToMiniTransitionObserver();
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
    console.log('content app initializeApp 시작');
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
      console.log(`[initializeApp] contentEnabled 초기값: ${contentEnabled}`);

      if (!contentEnabled) {
        console.log('[Content] 콘텐츠 비활성 상태 - UI 렌더링 및 리스너 초기화 건너뜀');
      } else {
        setupUIResources();
        startDetectionWorkflow();
      }

      // 온체인지 리스너
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'sync' && STORAGE_KEYS.CONTENT_ENABLED in changes) {
          const newValue = changes[STORAGE_KEYS.CONTENT_ENABLED]?.newValue;

          // origin 정보는 changes 내에 없으니 lastChangeOrigin 사용
          console.log(`contentEnabled 변경 감지: ${newValue}, origin: ${lastChangeOrigin}`);

          setContentEnabled(newValue, lastChangeOrigin);

          if (newValue === false) {
            if (shouldCleanupNow()) {
              disableDetection();
              cleanupAllResources();
            } else {
              console.log('[storage.onChanged] 초기화 지연됨 - debounce 및 origin 조건');
            }
          } else if (newValue === true) {
            if (shouldCleanupNow()) {
              setupUIResources();
              startDetectionWorkflow();
            } else {
              console.log('[storage.onChanged] 초기화 스킵 - 빈번한 토글 감지됨');
            }
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  initializeApp();
})();
