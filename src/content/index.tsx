// src/content/index.tsx
import { createRoot, Root } from 'react-dom/client';
import { App } from './App';
import { i18nInstance, initializeI18n } from '@services/i18n';
import { ErrorFallback } from '@components/common/ErrorFallback';
import { I18nextProvider } from 'react-i18next';
import { ErrorBoundary } from 'react-error-boundary';
import { detectYouTubeVideo, setupSPAObserver } from '@lib/youtube';
import { debounce } from '@lib/utils/common/common';
import { STORAGE_KEYS } from '@constants/storageKeys';
import { DOM_IDS } from '@constants/doomIds';
import { fetchYouTubeVideoMeta } from '@background/api/youtube';
import { isMusicVideo } from '@lib/utils/audio/musicDetection';
import { UIResourceManager } from '@lib/utils/infra/uiResourceManager';
import {
  YOUTUBE_MINI_PLAYER_CLASSES,
  YOUTUBE_MINI_PLAYER_CONTAINER_SELECTOR,
  YOUTUBE_PLAYER_SELECTOR,
} from '@constants/youtubeSelectors';
import { extractArtistAndTitle, fallbackArtistAndTitle } from '@lib/utils/lyrics/meta/artistTitle';
import {
  cleanTopicName,
  extractArtistAndTitleCustom,
  preprocessArtistOrTitle,
} from '@lib/utils/lyrics/parsers/stringUtils';
import { listenerManager } from '@lib/utils/infra/listenerManager';
import { withContentEnabled } from '@lib/utils/platform/contentGuard';
import { injectLyricsOverlayRoot } from '@components/lyrics/infra/LyricsOverlayRoot';
import { DualHighlightLyrics } from '@components/lyrics/SyncLyrics/DualHighlightLyrics';
import { FullLyrics } from '@components/lyrics/FullLyrics/FullLyrics';
import { isAdPlaying } from '@lib/utils/dom/domUtils';
import { parseLyrics } from '@lib/utils/lyrics/parsers/lyricsParser';
import { Line } from '@lib/types/lyrics';
import { extractVideoIdFromUrl, tryDetectVideoChange } from '@lib/utils/platform/videoDetection';
import { clearLyricsCache, setToLyricsCache } from '@lib/utils/cache/lyricsCache';
import { normalizeLyricsQuery } from '@lib/utils/lyrics/meta/queryNormalizer';
import { getLyricsFromCacheOrFetch } from '@lib/utils/lyrics/meta/getLyricsFromCacheOrFetch';
import { fetchLyricsWithAliasFallback } from '@background/api/lyrics';
import 'normalize.css';
import { cleanupMediaElementSource } from '@lib/utils/audio/audio';
import { startAdWatcher } from '@lib/utils/infra/adWatcher';
import { checkIfMiniPlayerActive } from '@lib/utils/platform/playerUtils';
import { isWatchPage as checkIsWatchPage } from '@lib/utils/common/urlUtils';
import { hasUrlChanged } from '@lib/utils/platform/navigation';

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

  let lastRenderedLyrics = '';
  let latestLyrics: Line[] = [];
  let contentEnabled = false;
  let lyricsOverlayRoot: Root | null = null; // 렌더링된 root 인스턴스 보관
  let lyricsOverlayElement: HTMLElement | null = null;
  let spaObserverShouldTriggerDetection = true;
  let isRetryingDetection = false; // 재시도 중복 제어 플래그
  let isFirstMutation = true;

  // font
  let lyricsFontColorCurrent = '#FFFFFF';
  let lyricsFontColorPronunciation = '#FFFFFF';
  let isOverlayInitializing = false;

  let showRealtimeLyrics = true; // 현재 가사 ui 보이게
  let showPronunciationLyrics = true;

  let lyricsMode: 'sync' | 'full' = 'sync';
  let lastLyricsMode: 'sync' | 'full' | null = null;
  let lastShowRealtimeLyrics: boolean | null = null;
  let lastShowPronunciationLyrics: boolean | null = null;

  let stopAdWatcher: (() => void) | null = null;

  // 중복 가사 호출 방지
  let lastCollectedVideoId: string | null = null;
  let isCollecting = false;

  // 가사 모드
  const getContentEnabled = () => contentEnabled;
  const uiManager = new UIResourceManager();
  const RETRY_DELAY = 300;
  const isMiniToFullTransitioning = false;

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

  // --- Observer 및 리스너 관리 함수 ---
  const removeAllObservers = (): void => {
    Object.values(detectionObserverManager).forEach((obs) => obs?.disconnect && obs.disconnect());
    detectionObserverManager.spaObserver = null;
    detectionObserverManager.lyricsObserver = null;
    detectionObserverManager.videoElementObserver = null;
  };

  const cleanupAllResources = (): void => {
    console.log('cleanupAllResources 실행');

    listenerManager.removeAll();
    removeAllObservers();
    cleanupOverlayUI();
  };

  // 가사 배열 cleanup
  function resetLyricsState() {
    lastRenderedLyrics = '';
    latestLyrics = [];
    console.log('[resetLyricsState] 가사 상태 초기화 완료');
  }

  // UI 오버레이 cleanup
  function cleanupOverlayUI() {
    uiManager.cleanup();

    if (lyricsOverlayRoot) {
      lyricsOverlayRoot.unmount();
      lyricsOverlayRoot = null;
    }

    if (lyricsOverlayElement && lyricsOverlayElement.parentNode) {
      lyricsOverlayElement.parentNode.removeChild(lyricsOverlayElement);
      lyricsOverlayElement = null;
      console.log('[cleanupOverlayUI] Lyrics overlay element 제거 완료');
    }
  }

  // 루트 엘리먼트 생성
  const createRootElement = () => {
    console.log('createRootElement 실행');

    const root = document.createElement('div');
    root.id = DOM_IDS.ROOT_CONTAINER;
    document.body.appendChild(root);
    return root;
  };

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

  // DOM 및 React root 생성 함수, 호출 시 existing overlay DOM 체크
  async function createOverlayRoot() {
    await injectCSS(); // CSS 먼저 완전히 로드 대기
    // 이제야 DOM 생성 후 body에 append
    lyricsOverlayElement = injectLyricsOverlayRoot();
    console.log('[Lyrics] 오버레이 DOM 생성 및 body 삽입 완료');

    if (lyricsOverlayElement) {
      // visibility hidden 상태에서 보여주도록 변경
      lyricsOverlayElement.style.visibility = 'visible';
    }

    if (!lyricsOverlayRoot && lyricsOverlayElement) {
      lyricsOverlayRoot = createRoot(lyricsOverlayElement);
      console.log('[createOverlayRoot] React Root 생성 완료');
    }
  }

  function initListenersAndState() {
    // 초기값 읽기
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
        // 최초 렌더 호출
        if (latestLyrics.length > 0) {
          rerenderLyricsOverlay();
        }
      },
    );
    // 2. 저장소 변경 감지 - 실시간 업데이트
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'sync') return;
      let needRerender = false;
      console.log('[storage.onChanged] 변경 감지됨:', changes);

      if ('lyricsFontColorCurrent' in changes) {
        const newColor = changes.lyricsFontColorCurrent.newValue;
        console.log('[storage.onChanged] lyricsFontColorCurrent 변경:', newColor);

        if (typeof newColor === 'string' && newColor !== lyricsFontColorCurrent) {
          lyricsFontColorCurrent = newColor;
          needRerender = true;
        }
      }
      if ('lyricsFontColorPronunciation' in changes) {
        const newColor = changes.lyricsFontColorPronunciation.newValue;
        console.log('[storage.onChanged] lyricsFontColorPronunciation 변경:', newColor);

        if (typeof newColor === 'string' && newColor !== lyricsFontColorPronunciation) {
          lyricsFontColorPronunciation = newColor;
          needRerender = true;
        }
      }
      if ('realtimeLyrics' in changes) {
        showRealtimeLyrics = changes.realtimeLyrics.newValue;
        console.log('[storage.onChanged] realtimeLyrics 변경:', showRealtimeLyrics);
        needRerender = true;
      }
      if ('announceLyrics' in changes) {
        showPronunciationLyrics = changes.announceLyrics.newValue;
        console.log('[storage.onChanged] announceLyrics 변경:', showPronunciationLyrics);
        needRerender = true;
      }
      if ('lyricsMode' in changes) {
        lyricsMode = changes.lyricsMode.newValue;
        console.log('[storage.onChanged] lyricsMode 변경:', lyricsMode);
        needRerender = true;
      }

      if (needRerender) {
        rerenderLyricsOverlay();
      }
    });

    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      console.log('[content] onMessage 수신:', message);

      if (message.type === 'GET_LATEST_LYRICS') {
        console.log('[content] GET_LATEST_LYRICS 요청 수신 - latestLyrics 길이:', latestLyrics.length);
        sendResponse({ lyrics: latestLyrics });
      }

      // ✅ 오프셋 적용 반영 처리
      if (message.type === 'APPLY_OFFSET_LYRICS') {
        const { offset, lyrics } = message.payload;
        console.log(`[content] APPLY_OFFSET_LYRICS 수신 → offset: ${offset}, 가사 길이: ${lyrics.length}`);

        latestLyrics = lyrics; // 전역 최신 가사 교체
        rerenderLyricsOverlay(); // full / sync 모드에 즉시 적용
      }
    });

    // ✅ Visibility API를 통한 탭 전환 추가 감지
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        tryDetectionWithRetry(0, 5, 200);
      }
    });
  }
  function onLyricsUpdated(newLyrics: Line[]) {
    latestLyrics = newLyrics;
    console.log('[Lyrics] 가사 상태 업데이트 완료');

    rerenderLyricsOverlay();
  }
  function isLyricsOverlayMounted(): boolean {
    return !!lyricsOverlayRoot && !!lyricsOverlayElement && document.body.contains(lyricsOverlayElement);
  }

  function hideLyricsOverlay() {
    const isMiniPlayer = checkIfMiniPlayerActive();
    if (isMiniPlayer) {
      console.log('[hideLyricsOverlay] 미니플레이어 상태 - 클린업 취소');
      return;
    }

    console.log('[hideLyricsOverlay] 미니 플레이어 아니고, hideLyricsOverlay 실행');
    const overlay = document.getElementById('lyrics-cc-overlay');
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay); // 1. 오버레이 DOM 완전 제거
      console.log('[hideLyricsOverlay] lyrics-cc-overlay 제거');

      lyricsOverlayRoot = null; // 2. React Root 인스턴스 해제
      lyricsOverlayElement = null; // 3. 전역 DOM 참조 변수 초기화
    }
    resetLyricsState();
  }

  // sync 가사만 랜더링 함.
  function showLyricsOverlay(lyrics: Line[], offset?: number) {
    console.log('[showLyricsOverlay] called');

    if (!lyricsOverlayElement || !lyricsOverlayRoot) {
      createOverlayRoot();
    }

    if (!lyricsOverlayElement) {
      console.warn('[showLyricsOverlay] lyricsOverlayElement가 없음, 함수 종료');
      return;
    }
    lyricsOverlayElement.style.display = '';

    if (lyricsMode !== 'sync') {
      return;
    }
    if (!showRealtimeLyrics && !showPronunciationLyrics) {
      console.log('[showLyricsOverlay] 현재가사/발음가사 모두 꺼짐 → hide');
      hideLyricsOverlay();
      return;
    }
    // React Root 인스턴스가 없으면 (예외 상황) 생성 (평상시 createOverlayRoot에서 처리되어야 함)
    if (!lyricsOverlayRoot && lyricsOverlayElement) {
      lyricsOverlayRoot = createRoot(lyricsOverlayElement);
    }

    if (!lyricsOverlayRoot) {
      console.warn('[showLyricsOverlay] lyricsOverlayRoot가 없음, 렌더링 불가');
      return;
    }

    lyricsOverlayRoot.render(
      <DualHighlightLyrics
        lyrics={lyrics}
        offset={offset}
        fontColor={lyricsFontColorCurrent}
        pronunciationColor={lyricsFontColorPronunciation}
        showRealtimeLyrics={showRealtimeLyrics}
        showPronunciationLyrics={showPronunciationLyrics}
      />,
    );
  }
  // 현재 가사/전체 가사의 분기 함수
  // full 모드 전용
  async function rerenderLyricsOverlay() {
    console.log('[rerenderLyricsOverlay] 호출됨, 상태:', {
      lyricsOverlayElement,
      lyricsOverlayRoot,
      showRealtimeLyrics,
      showPronunciationLyrics,
      lyricsMode,
      latestLyricsLength: latestLyrics.length,
      lyricsFontColorCurrent,
      lyricsFontColorPronunciation,
    });

    // [1] overlay, root 둘 중 하나라도 없으면 반드시 비동기 fetch-storage 후 render!
    if (!lyricsOverlayElement || !lyricsOverlayRoot) {
      if (isOverlayInitializing) {
        console.log('[rerenderLyricsOverlay] 초기화 중 중복 호출 무시');
        return;
      }
      isOverlayInitializing = true;

      await injectCSS();
      createOverlayRoot();

      chrome.storage.sync.get(['lyricsFontColorCurrent', 'lyricsFontColorPronunciation'], (items) => {
        console.log('[rerenderLyricsOverlay] storage.get 결과:', items);

        if (typeof items.lyricsFontColorCurrent === 'string') {
          lyricsFontColorCurrent = items.lyricsFontColorCurrent;
        } else {
          console.log(
            '[rerenderLyricsOverlay] lyricsFontColorCurrent가 저장소에 없음, 디폴트 사용:',
            lyricsFontColorCurrent,
          );
        }

        if (typeof items.lyricsFontColorPronunciation === 'string') {
          lyricsFontColorPronunciation = items.lyricsFontColorPronunciation;
        } else {
          console.log(
            '[rerenderLyricsOverlay] lyricsFontColorPronunciation가 저장소에 없음, 디폴트 사용:',
            lyricsFontColorPronunciation,
          );
        }
        realOverlayRender(); // storage fetch 완료 후 렌더 호출
        isOverlayInitializing = false;
      });
      return;
    }
    realOverlayRender();
  }

  function realOverlayRender() {
    if (!showRealtimeLyrics && !showPronunciationLyrics) {
      hideLyricsOverlay();
      return;
    }
    if (!lyricsOverlayRoot) return;

    if (lyricsMode === 'full') {
      lyricsOverlayRoot.render(
        <FullLyrics
          lyrics={latestLyrics}
          fontColor={lyricsFontColorCurrent}
          pronunciationColor={lyricsFontColorPronunciation}
          showRealtimeLyrics={showRealtimeLyrics}
          showPronunciationLyrics={showPronunciationLyrics}
        />,
      );
    } else if (lyricsMode === 'sync') {
      lyricsOverlayRoot.render(
        <DualHighlightLyrics
          lyrics={latestLyrics}
          offset={0} // 필요 시 offset 변수
          fontColor={lyricsFontColorCurrent}
          pronunciationColor={lyricsFontColorPronunciation}
          showRealtimeLyrics={showRealtimeLyrics}
          showPronunciationLyrics={showPronunciationLyrics}
        />,
      );
    } else {
      console.warn('[realOverlayRender] 알 수 없는 lyricsMode:', lyricsMode);
      hideLyricsOverlay();
    }
  }

  //rerenderLyricsOverlay() 호출해서 현재 모드에 맞게 "무엇을 보여줄지" 판단.
  function renderLyricsOverlay(lyrics: Line[]) {
    const player = document.querySelector(YOUTUBE_PLAYER_SELECTOR);
    if (!player) return;

    console.log('[renderLyricsOverlay] 호출됨, lyrics 길이:', lyrics.length);

    latestLyrics = lyrics;
    rerenderLyricsOverlay();

    const lyricsStr = JSON.stringify(lyrics);
    if (lastRenderedLyrics === lyricsStr) return;
    lastRenderedLyrics = lyricsStr;

    // Observer 중복 생성 방지
    if (detectionObserverManager.lyricsObserver) {
      detectionObserverManager.lyricsObserver.disconnect();
      detectionObserverManager.lyricsObserver = null;
    }

    if (!showRealtimeLyrics && !showPronunciationLyrics) {
      hideLyricsOverlay();
      return;
    }
    // 최신 lyrics를 클로저로 안전하게 캡처
    detectionObserverManager.lyricsObserver = new MutationObserver(() => {
      if (
        lyricsMode !== lastLyricsMode ||
        showRealtimeLyrics !== lastShowRealtimeLyrics ||
        showPronunciationLyrics !== lastShowPronunciationLyrics
      ) {
        lastLyricsMode = lyricsMode;
        lastShowRealtimeLyrics = showRealtimeLyrics;
        lastShowPronunciationLyrics = showPronunciationLyrics; // 추가 상태 저장

        console.log('[MutationObserver] lyricsMode or showRealtimeLyrics changed, updating UI');

        if (lyricsMode === 'sync' && (showRealtimeLyrics || showPronunciationLyrics)) {
          showLyricsIfNotAd(latestLyrics);
        } else {
          rerenderLyricsOverlay();
        }
      }
    });

    detectionObserverManager.lyricsObserver.observe(player, {
      attributes: true,
      attributeFilter: ['class'],
      attributeOldValue: true,
    });
    showLyricsIfNotAd(lyrics);
  }

  function showLyricsIfNotAd(lyrics: Line[], offset?: number) {
    if (isAdPlaying()) {
      hideLyricsOverlay();
    } else {
      if (lyricsMode === 'sync' && (showRealtimeLyrics || showPronunciationLyrics)) {
        showLyricsOverlay(lyrics, offset);
      } else if (lyricsMode === 'full') {
        rerenderLyricsOverlay();
      }
    }
  }

  // ✅ URL 변경 핸들러 개선, 변화에 따른 상세 후처리(UI 초기화, 중복 방지 등)**를 담당하는 하위 레벨 함수
  const handleUrlChange = (url: string) => {
    console.log('handleUrlChange가 실행됨.');
    const isMini = checkIfMiniPlayerActive();
    const currentVideoId = extractVideoIdFromUrl(url);
    console.log('currentVideoId:', currentVideoId, 'lastVideoId:', lastVideoId);

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
      cleanupOverlayUI();
      handleVideoDetectionGuarded();
      return;
    }

    // 페이지/영상 바뀌기 직전에 강제 cleanup
    cleanupOverlayUI();
    console.log('handleUrlChange 내부의 cleanupAllUIElements가 실행!');
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

  function finishParsingLyrics(lyricsArray: Line[]) {
    latestLyrics = lyricsArray; // 원본만 저장

    // background로 가사 준비 완료 신호 전송
    chrome.runtime.sendMessage({ type: 'LYRICS_READY', length: lyricsArray.length });
  }

  // 1. 영상과 크게 무관한 메타데이터, 가사 정보를 확보하는 함수
  async function collectMetadataAndLyrics(videoId: string) {
    // YouTube Video Meta 호출
    const meta = await fetchYouTubeVideoMeta(videoId, process.env.YOUTUBE_API_KEY!);

    if (!meta) {
      console.log('[collectMetadataAndLyrics] 메타 정보 없음');
      throw new Error('메타 정보 없음');
    }

    if (!isMusicVideo(meta)) {
      console.log('[collectMetadataAndLyrics] 음악 영상 아님');
      throw new Error('음악 영상 아님');
    }
    // 아티스트, 타이틀 파싱(기존 처리 로직 사용)
    let parsed = extractArtistAndTitle(meta.title);

    if (!parsed) {
      const fallback = fallbackArtistAndTitle(meta);
      if (!fallback) {
        throw new Error('곡명/아티스트 파싱 실패');
      }
      fallback.title = cleanTopicName(fallback.title);
      fallback.artist = cleanTopicName(fallback.artist);
      parsed = fallback;
    }

    const refined = extractArtistAndTitleCustom(`${parsed.artist} - ${parsed.title}`);
    if (!refined) {
      throw new Error('정제된 곡명/아티스트 파싱 실패');
    }

    const artist = preprocessArtistOrTitle(refined.artist);
    const title = preprocessArtistOrTitle(refined.title);

    clearLyricsCache();

    // 가사 캐시 혹은 서버에서 가사 fetch
    const lyricsResult = await getLyricsFromCacheOrFetch(artist, title, {
      fetch: async () => fetchLyricsWithAliasFallback(artist, title),
    });

    console.log('[Lyrics] API 가사 데이터 수신 완료:', lyricsResult);

    if (!lyricsResult) {
      throw new Error('가사 없음');
    }
    // ----------- 여기서 캐시 저장 추가 -----------
    setToLyricsCache(normalizeLyricsQuery(artist, title, {}), {
      lyrics: lyricsResult.lyrics,
      duration: lyricsResult.duration,
      artist: lyricsResult.artist,
      title: lyricsResult.title,
      id: lyricsResult.id,
    });

    const { lyrics, duration: lyricsDuration } = lyricsResult;

    // 가사 파싱, 기본 전처리 + 앞당기기(3초 예시)
    const parsedLyrics: Line[] = typeof lyrics === 'string' ? parseLyrics(lyrics) : lyrics;

    finishParsingLyrics(parsedLyrics);
    onLyricsUpdated(parsedLyrics);

    // shiftedLyrics: Line[] 배열 (각 원소에 'text'가 있다고 가정)
    //const lyricsText = shiftedLyrics.map((line) => line.text).join('\n');
    //const lyricsLang = await detectLyricsLanguage(lyricsText, 2);

    // 이 함수는 성공시 meta 및 shiftedLyrics 반환 (후속 분석용)
    return { meta, lyricsDuration, parsedLyrics };
  }

  // delay 함수 (Promise 기반 6초 대기)
  // async function pauseVideoAndDelay(videoElem: HTMLMediaElement, ms: number) {
  //   if (!videoElem) return;

  //   try {
  //     if (!videoElem.paused) {
  //       videoElem.pause();
  //       console.log(`영상 일시정지, ${ms}ms 대기 시작`);
  //     }

  //     await new Promise((resolve) => setTimeout(resolve, ms));

  //     console.log(`${ms}ms 대기 종료, 영상 재생 재개`);

  //     await videoElem.play().catch((e) => {
  //       console.warn('영상 재생 재개 실패:', e);
  //     });
  //   } catch (error) {
  //     console.error('영상 일시정지 대기 중 예외 발생:', error);
  //   }
  // }

  // 2. 영상 엘리먼트가 준비된 후, 실제 분석 및 렌더링 수행하는 함수
  async function analyzeAudioAndRenderLyrics(
    meta: { durationSec?: number },
    lyricsDuration: number | undefined,
    videoElem: HTMLMediaElement,
    shiftedLyrics: Line[],
  ) {
    if (!videoElem) {
      console.log('[analyzeAudioAndRenderLyrics] 비디오 엘리먼트가 없음');
      return;
    }

    const videoDurationSec = meta.durationSec ?? 0;
    const effectiveLyricsDuration =
      lyricsDuration ?? (shiftedLyrics.length > 0 ? (shiftedLyrics[shiftedLyrics.length - 1]?.time ?? 0) : 0);

    const durationSec = videoDurationSec - effectiveLyricsDuration;

    if (durationSec <= 0 || durationSec >= 4) {
      console.log(`영상 길이(${videoDurationSec}s) - 가사 길이(${effectiveLyricsDuration}s) 얼마 차이 안 남.`);
    } else {
      console.log('싱크 오류 가능성 높음.');
    }

    if (isAdPlaying()) {
      console.warn('[analyzeAudioAndRenderLyrics] 광고 중이므로 분석 스킵');
      hideLyricsOverlay();
      return;
    }

    // 중복 audio source 연결 방지 및 안전한 초기화
    cleanupMediaElementSource(videoElem);

    latestLyrics = shiftedLyrics;
    renderLyricsOverlay(shiftedLyrics);
  }

  async function tryCollectMetadataAndLyrics(videoId: string) {
    if (isCollecting) {
      console.log('[Lyrics] 수집 중복 방지 중...');
      return; // 필요시 캐시된 데이터 반환하도록 개선 가능
    }

    if (videoId === lastCollectedVideoId && isLyricsOverlayMounted()) {
      console.log('[Lyrics] 이미 처리한 videoId, 수집 스킵:', videoId);
      return;
    }
    try {
      isCollecting = true;
      const data = await collectMetadataAndLyrics(videoId);
      lastCollectedVideoId = videoId;

      return data;
    } finally {
      isCollecting = false;
    }
  }

  // 영상 감지 핸들러 (순수 로직)
  const handleVideoDetection = async () => {
    console.log('handleVideoDetection 실행');
    if (isDetecting) {
      console.log('[handleVideoDetection] 이미 실행되고 있음');
      return;
    }
    isDetecting = true;
    let videoData;

    // 비디오 엘리먼트가 준비되었으면 본 분석 및 렌더링 실행
    const videoElem = document.querySelector('video');
    if (!videoElem) {
      console.log('[handleVideoDetection] video element 미존재, 렌더링 생략');
      return;
    }

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

      // 새 영상이 들어왔으므로 이전 자막 제거
      hideLyricsOverlay();
      lastVideoId = videoData.videoId;

      // 1. 메타데이터 및 가사 수집 (영상 로드 여부 무관)
      const collected = await tryCollectMetadataAndLyrics(videoData.videoId);
      if (!collected) {
        console.warn('가사 수집 데이터 없음');
        return;
      }

      const { meta, lyricsDuration, parsedLyrics } = collected;

      await analyzeAudioAndRenderLyrics(meta, lyricsDuration, videoElem, parsedLyrics);
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

  // 1) 광고 종료 감지 콜백용 별도 함수 (가사/메타 수집에 집중)
  async function prefetchMetadataAndLyricsOnAdEnd() {
    const videoData = detectYouTubeVideo();
    if (!videoData?.videoId) {
      console.log('[AdWatcher] videoId 미존재, 수집 중단');
      return;
    }
    try {
      // 광고 중이라도 가사/메타 데이터는 미리 가져오기 가능
      await tryCollectMetadataAndLyrics(videoData.videoId);
      console.log('[AdWatcher] 광고 종료 후 메타/가사 선수집 완료');
    } catch (error) {
      console.warn('[AdWatcher] 광고 종료 후 메타/가사 선수집 실패:', error);
    }
  }

  // 2) 광고 감시 초기화 함수, 광고 종료 시 prefetch 후 handleVideoDetection 호출
  function initAdWatcher() {
    if (stopAdWatcher) return;
    stopAdWatcher = startAdWatcher(async () => {
      console.log('[AdWatcher] 광고 종료 감지, 선수집 -> 본 감지 순서 시작');
      lastVideoId = null;

      await prefetchMetadataAndLyricsOnAdEnd();
      handleVideoDetectionGuarded();
    });
  }

  // --- 스토리지, UI, SPA 이벤트, visibility 이벤트 일괄 관리 ---
  // SPA URL 변화 처리 공통 함수, URL 변화의 감지와 상태 판단을 담당하는 상위 레벨 함수
  function handleSpaUrlChange(url: string) {
    if (!contentEnabled) return;
    const currentVideoId = extractVideoIdFromUrl(url);
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
    // 영상 -> 영상, videoId가 있는 곳으로 url 변경된 상황
    if (videoIdChanged || (urlChanged && watchPageChanged)) {
      spaObserverShouldTriggerDetection = false;
      handleUrlChangeGuarded(url);
      setTimeout(() => {
        spaObserverShouldTriggerDetection = true;
      }, 5000);
    } else {
      console.log('[SPA] 영상 및 페이지 변동 없음, 감지 생략');
    }
  }

  // 재시도 함수: 현재 시도 횟수, 최대 시도 횟수, 인터벌(ms)
  function tryDetectionWithRetry(attempt: number, maxAttempts: number, interval: number) {
    if (attempt >= maxAttempts) {
      console.warn('[visibilitychange] 감지 재시도 최대횟수 도달, 종료');
      return;
    }

    if (isReadyForDetection()) {
      handleVideoDetectionGuarded();
    } else {
      // 준비 안 됐다면 interval ms 후 다시 시도
      setTimeout(() => {
        tryDetectionWithRetry(attempt + 1, maxAttempts, interval);
      }, interval);
    }
  }

  function isReadyForDetection() {
    const player = document.querySelector('video');
    const adPlaying = isAdPlaying();

    // readyState 2 이상 체크(HAVE_CURRENT_DATA), 광고 안 재생 중인지 명확히 체크
    const ready = player && player.readyState >= 2 && !adPlaying;

    console.log(
      `[isReadyForDetection] player: ${!!player}, readyState: ${player?.readyState}, adPlaying: ${adPlaying}, ready: ${ready}`,
    );
    return ready;
  }

  // --- 비디오 감지 재시도 함수 (최대 시도 횟수 maxTries, 간격 interval(ms)) ---
  async function handleVideoDetectionWithRetry(maxTries = 15, interval = 2000) {
    if (isRetryingDetection) {
      console.log('[handleVideoDetectionWithRetry] 재시도 중복 실행 방지로 종료');
      return;
    }

    isRetryingDetection = true;

    try {
      for (let i = 0; i < maxTries; i++) {
        const videoData = detectYouTubeVideo();
        if (videoData && videoData.videoId) {
          await handleVideoDetectionGuarded(); // 내부 감지 및 렌더 호출
          return;
        }
        console.log(
          `[handleVideoDetectionWithRetry] videoId 없음, ${interval / 1000}s 후 재시도... (${i + 1} / ${maxTries})`,
        );
        await new Promise((res) => setTimeout(res, interval));
      }
      console.warn(`[handleVideoDetectionWithRetry] ${(maxTries * interval) / 1000}s 동안 videoId를 못 찾음`);
    } finally {
      isRetryingDetection = false; // 재시도 종료 시 플래그 해제
    }
  }

  // 반드시 한 번 실행 (initializeApp 등 진입 시)
  function runInitialDetection() {
    // 무조건 한 번 감지!
    handleVideoDetectionWithRetry().catch((error) => {
      console.error('[runInitialDetection] 감지 재시도 중 error:', error);
    });
    lastUrl = window.location.href;
    console.log(`[runInitialDetection] lastVideoId: ${lastVideoId}, lastUrl: ${lastUrl}`);
  }
  // --- video DOM 등장 관찰용 MutationObserver 등록 함수 ---
  function setupVideoElementObserver() {
    const observer = new MutationObserver(() => {
      const videoElem = document.querySelector('video');
      if (videoElem) {
        console.log('[VideoObserver] video element 찾음, 감지 실행');
        handleVideoDetectionGuarded();

        // 첫 감지 완료 후 observer 해제하여 중복 호출 방지
        observer.disconnect();
        detectionObserverManager.videoElementObserver = null;
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
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
        rerenderLyricsOverlay();
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
        rerenderLyricsOverlay();
        // 필요 시 상태 동기화 및 감지 조작 수행
      }

      lastIsMini = isMini;
    });

    observer.observe(player, { attributes: true, attributeFilter: ['class'] });

    return observer;
  }

  // 감지 시스템 활성화
  const enableDetection = async () => {
    if (isDetectionActive) {
      console.log('[SKIP] 감지 시스템 이미 활성화됨');
      return;
    }
    cleanupAllResources();

    const debouncedSpaObserverCallback = debounce(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        if (spaObserverShouldTriggerDetection) {
          handleSpaUrlChange(currentUrl);
          lastUrl = currentUrl;
        } else {
          console.log('[SPA Observer] 감지 호출 스킵 (메시지 리스너 우선)');
        }
      }
    }, 200); // debounce delay can be tuned, example 200ms

    detectionObserverManager.spaObserver = setupSPAObserver(debouncedSpaObserverCallback);

    // 광고 감지 시작
    initAdWatcher();

    if (!detectionObserverManager.videoElementObserver) {
      detectionObserverManager.videoElementObserver = setupVideoElementObserver();
    }

    isDetectionActive = true;
  };
  // 감지 시스템 완전 비활성화
  const disableDetection = () => {
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

  // 앱 초기화
  const initializeApp = async () => {
    console.log('content app initializeApp 시작');
    try {
      await initializeI18n();

      chrome.storage.sync.get([STORAGE_KEYS.CONTENT_ENABLED], (result) => {
        contentEnabled = result[STORAGE_KEYS.CONTENT_ENABLED] ?? false;
      });

      // 루트 컨테이너 준비 및 렌더링
      const rootElement = document.getElementById(DOM_IDS.ROOT_CONTAINER) || createRootElement();
      const root = createRoot(rootElement);
      root.render(
        <ErrorBoundary FallbackComponent={ErrorFallback} onReset={handleReset}>
          <I18nextProvider i18n={i18nInstance}>
            <App />
          </I18nextProvider>
        </ErrorBoundary>,
      );

      initListenersAndState();
      setupMiniToBasicTransitionObserver();
      setupBasicToMiniTransitionObserver();
      runInitialDetection();

      // 감지 시스템 활성/비활성 상태 동기화
      chrome.storage.sync.get(STORAGE_KEYS.CONTENT_ENABLED, (result) => {
        const enabled = result[STORAGE_KEYS.CONTENT_ENABLED] ?? true;
        if (enabled) enableDetection();
        else disableDetection();
      });
    } catch (error) {
      // fallback UI 렌더링
      const rootElement = document.getElementById(DOM_IDS.ROOT_CONTAINER) || createRootElement();
      const root = createRoot(rootElement);
      root.render(<ErrorFallback error={error} resetErrorBoundary={handleReset} />);
    }
  };

  initializeApp();
})();
