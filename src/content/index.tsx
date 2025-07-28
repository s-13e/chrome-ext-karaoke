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
import { MESSAGE_TYPES } from '@constants/messageTypes';
import { DOM_IDS } from '@constants/doomIds';
import { fetchYouTubeVideoMeta } from '@background/api/youtube';
import { isMusicVideo } from '@lib/utils/audio/musicDetection';
import { UIResourceManager } from '@lib/utils/infra/uiResourceManager';
import { YOUTUBE_PLAYER_SELECTOR, YOUTUBE_WATCH_PATH } from '@constants/youtubeSelectors';
import { extractArtistAndTitle, fallbackArtistAndTitle } from '@lib/utils/lyrics/artistTitle';
import { cleanTopicName, extractArtistAndTitleCustom, preprocessArtistOrTitle } from '@lib/utils/common/stringUtils';
import { listenerManager } from '@lib/utils/infra/listenerManager';
import { withContentEnabled } from '@lib/utils/platform/contentGuard';
import { injectLyricsOverlayRoot } from '@components/lyrics/LyricsOverlayRoot';
import { DualHighlightSubtitle } from '@components/lyrics/DualHighlightSubtitle';
import { isAdPlaying } from '@lib/utils/dom/domUtils';
import { parseLyrics } from '@lib/utils/lyrics/lyricsParser';
import { Line } from '@lib/types/lyrics';
import { tryDetectVideoChange } from '@lib/utils/platform/videoDetection';
// import { analyzeAudioFeatures } from '@lib/utils/audio/audioAnalysis';
import { fetchLyricsByArtistAndTrack } from '@background/api/lrclib';
import { clearLyricsCache, setToLyricsCache } from '@lib/utils/cache/lyricsCache';
import { normalizeLyricsQuery } from '@lib/utils/lyrics/queryNormalizer';
import { getLyricsFromCacheOrFetch } from '@lib/utils/lyrics/getLyricsFromCacheOrFetch';

import 'normalize.css';

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
  let lastRenderedLyrics = '';
  let latestLyrics: Line[] = [];
  let contentEnabled = false;
  let lyricsOverlayRoot: Root | null = null; // 렌더링된 root 인스턴스 보관
  let lyricsOverlayElement: HTMLElement | null = null;
  let lastUrl = window.location.href;

  const getContentEnabled = () => contentEnabled;
  const uiManager = new UIResourceManager();
  const RETRY_DELAY = 300;

  interface DetectionObserverManager {
    spaObserver: MutationObserver | null;
    lyricsObserver: MutationObserver | null;
  }
  const detectionObserverManager: DetectionObserverManager = {
    spaObserver: null,
    lyricsObserver: null,
    // ...other observers
  };

  // --- Observer 및 리스너 관리 함수 ---
  const removeAllObservers = (): void => {
    Object.values(detectionObserverManager).forEach((obs) => obs?.disconnect && obs.disconnect());
    detectionObserverManager.spaObserver = null;
    detectionObserverManager.lyricsObserver = null;
  };
  const cleanupAllResources = (): void => {
    listenerManager.removeAll();
    removeAllObservers();
    cleanupAllUIElements();
  };

  // 2. 초기값을 chrome.storage에서 읽어옴
  chrome.storage.sync.get([STORAGE_KEYS.CONTENT_ENABLED], (result) => {
    contentEnabled = result[STORAGE_KEYS.CONTENT_ENABLED] ?? false;
  });

  // ✅ UI 요소들을 완전히 정리하는 함수
  const cleanupAllUIElements = () => {
    uiManager.cleanup();

    // 3. 주입된 스타일 제거
    const injectedStyles = document.querySelectorAll('#karaoke-player-styles, #karaoke-styles');
    injectedStyles.forEach((style) => {
      console.log('[cleanupAllUIElements] 스타일 제거:', style.id || style);
      style.remove();
    });

    // 4. body 클래스 정리
    document.body.classList.remove('karaoke-mode');
    console.log('[Cleanup] UI cleanup completed, karaoke-mode class removed');
  };

  // 루트 엘리먼트 생성
  const createRootElement = () => {
    const root = document.createElement('div');
    root.id = DOM_IDS.ROOT_CONTAINER;
    document.body.appendChild(root);
    return root;
  };

  const injectCSS = () => {
    const cssId = 'karaoke-styles';
    if (document.getElementById(cssId)) return;

    const link = document.createElement('link');
    link.id = cssId;
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('content/style.css');
    document.head.appendChild(link);
  };

  function hideLyricsOverlay() {
    const overlay = document.getElementById('lyrics-cc-overlay');
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay); // 1. 오버레이 DOM 완전 제거
      console.log('[hideLyricsOverlay] lyrics-cc-overlay 제거');
    }
    lyricsOverlayRoot = null; // 2. React Root 인스턴스 해제
    lyricsOverlayElement = null; // 3. 전역 DOM 참조 변수 초기화
  }

  function showLyricsOverlay(lyrics: Line[], offset?: number) {
    if (!lyricsOverlayElement) {
      injectCSS();
      console.log('[showLyricsOverlay] injectCSS 호출');
      lyricsOverlayElement = injectLyricsOverlayRoot();
      lyricsOverlayElement.style.display = '';
    }
    // React Root 인스턴스도 한 번만 생성
    if (!lyricsOverlayRoot) {
      lyricsOverlayRoot = createRoot(lyricsOverlayElement);
    }

    lyricsOverlayRoot.render(<DualHighlightSubtitle lyrics={lyrics} offset={offset} />);
  }

  function showLyricsIfNotAd(lyrics: Line[], offset?: number) {
    if (isAdPlaying()) {
      hideLyricsOverlay();
    } else {
      showLyricsOverlay(lyrics, offset);
    }
  }

  function renderLyricsOverlay(lyrics: Line[]) {
    const player = document.querySelector(YOUTUBE_PLAYER_SELECTOR);
    if (!player) return;

    latestLyrics = lyrics;

    const lyricsStr = JSON.stringify(lyrics);
    if (lastRenderedLyrics === lyricsStr) return;
    lastRenderedLyrics = lyricsStr;

    // Observer 중복 생성 방지
    if (detectionObserverManager.lyricsObserver) {
      detectionObserverManager.lyricsObserver.disconnect();
      detectionObserverManager.lyricsObserver = null;
    }
    // 최신 lyrics를 클로저로 안전하게 캡처
    detectionObserverManager.lyricsObserver = new MutationObserver(() => {
      showLyricsIfNotAd(latestLyrics);
    });

    detectionObserverManager.lyricsObserver.observe(player, { attributes: true, attributeFilter: ['class'] });
    showLyricsIfNotAd(lyrics);
  }
  function shiftFirstLyricEarlier(lyrics: Line[], advanceSec: number): Line[] {
    if (!lyrics || lyrics.length === 0) return lyrics;
    const [first, ...rest] = lyrics;
    if (!first) return lyrics;
    const newFirstLine: Line = {
      ...first,
      time: Math.max(0, first.time - advanceSec),
      text: first.text ?? '',
    };
    return [newFirstLine, ...rest];
  }

  // ✅ URL 변경 핸들러 개선
  const handleUrlChange = (url: string) => {
    if (url === lastUrl) return; // URL이 실제로 바뀌었을 때만 실행
    lastUrl = url;

    const isWatchPage = url.includes(YOUTUBE_WATCH_PATH);

    console.log(`[URL Change] ${url}, isWatchPage: ${isWatchPage}`);
    console.log(`[URL Change] ${url}, isWatchPage: ${isWatchPage}`);
    if (isWatchPage) {
      const videoData = detectYouTubeVideo();
      tryDetectVideoChange(videoData?.videoId || null, debouncedDetection);
    }
  };
  const handleUrlChangeGuarded = withContentEnabled(getContentEnabled, handleUrlChange);

  // 영상 감지 핸들러 (순수 로직)
  const handleVideoDetection = async () => {
    console.log('handleVideoDetection 실행');
    if (isDetecting) {
      console.log('[SKIP] 감지 함수 실행 중 (동시 실행 방지)');
      return;
    }

    try {
      const videoData = detectYouTubeVideo();
      if (!videoData) {
        console.log('[SKIP] 비디오 감지 실패');
        setTimeout(debouncedDetection, RETRY_DELAY);
        return;
      }
      if (videoData.videoId === lastVideoId) {
        console.log('[SKIP] 같은 videoId에 대해 이미 실행됨');
        return;
      }
      isDetecting = true;
      lastVideoId = videoData.videoId;

      // 1. YouTube Data API로 메타데이터 요청
      const meta = await fetchYouTubeVideoMeta(videoData.videoId, process.env.YOUTUBE_API_KEY!);
      if (!meta) {
        console.log('fetchYouTubeVideoMeta 실패');
        return;
      }
      hideLyricsOverlay();
      latestLyrics = [];
      clearLyricsCache();

      if (!isMusicVideo(meta)) {
        console.log('isMusicVideo 판별 실패');
        return;
      }

      let parsed = extractArtistAndTitle(meta.title);
      if (!parsed) {
        // 아티스트-타이틀 추출 실패 시 fallback 시도
        const fallback = fallbackArtistAndTitle(meta);
        if (!fallback) {
          console.log('extractArtistAndTitle 및 fallback 모두 실패', meta.title);
          return;
        }
        // fallback으로 추출한 artist/title 사용
        fallback.title = cleanTopicName(fallback.title);
        fallback.artist = cleanTopicName(fallback.artist);
        parsed = fallback;
      }

      const refined = extractArtistAndTitleCustom(`${parsed.artist} - ${parsed.title}`);

      if (!refined) {
        console.log('extractArtistAndTitleCustom 실패', meta.title);
        return;
      }

      const artist = preprocessArtistOrTitle(refined.artist);
      const title = preprocessArtistOrTitle(refined.title);

      console.log('아티스트:', artist, '곡명:', title);

      // 1. 비디오 엘리먼트 선택
      const videoElem = document.querySelector('video');
      if (!videoElem) return;

      const lyricsResult = await getLyricsFromCacheOrFetch(artist, title, {
        fetch: async () => {
          const result = await fetchLyricsByArtistAndTrack(artist, title);
          if (!result) throw new Error('LRCLIB에서 가사 정보를 찾을 수 없습니다!');
          return result;
        },
      });

      // 다음 영상에 이전 가사 나오는 거 방지
      if (!lyricsResult) {
        console.log('가사 없음');
        hideLyricsOverlay();
        latestLyrics = [];
        return;
      }
      setToLyricsCache(normalizeLyricsQuery(artist, title, {}), {
        lyrics: lyricsResult.lyrics,
        duration: lyricsResult.duration,
        artist: lyricsResult.artist, // 정답 artist
        title: lyricsResult.title, // 정답 title
        id: lyricsResult.id, // (선택) LRCLIB id
      });
      const { lyrics, duration: lyricsDuration } = lyricsResult;
      const parsedLyrics: Line[] = typeof lyrics === 'string' ? parseLyrics(lyrics) : lyrics;

      const ADVANCE_SEC = 3; // 앞당길 초(3초 예시)
      const shiftedLyrics = shiftFirstLyricEarlier(parsedLyrics, ADVANCE_SEC);
      const lastLine = parsedLyrics[parsedLyrics.length - 1];
      const lyricsLengthSec = lastLine?.time ?? 0;

      // duration 필드가 존재하면 우선적으로 사용, 없으면 마지막 가사줄 기준
      const effectiveLyricsDuration = lyricsDuration ?? lyricsLengthSec;
      if ((typeof lyricsDuration === 'number' && lyricsDuration <= 2) || lyricsLengthSec <= 10) {
        console.warn(
          `[audioAnalysis] 분석 스킵: duration(${lyricsDuration ?? '-'}) < 2초 또는 lyricsLengthSec(${lyricsLengthSec}) ≤ 10초`,
        );
        return; // 분석 생략, 이후 정상 흐름만 계속
      }

      if (!parsedLyrics || parsedLyrics.length === 0) {
        console.log('parsedLyrics is empty or undefined');
        hideLyricsOverlay();
        return;
      }

      if (!isMusicVideo(meta, lyricsLengthSec)) {
        console.log('isMusicVideo 판별 실패');
        hideLyricsOverlay();
        return;
      }

      const videoDurationSec = meta.durationSec ?? 0;
      const durationSec = videoDurationSec - effectiveLyricsDuration;

      if (durationSec <= 0) {
        console.warn(
          `[audioAnalysis] 분석 스킵: 영상 길이(${videoDurationSec}s) - 가사 길이(${effectiveLyricsDuration}s) <= 0`,
        );
      } else {
        if (!isAdPlaying()) {
          // const analysisResult = await analyzeAudioFeatures(videoElem, { durationSec });
          console.warn(`[audioAnalysis] 분석: 영상 길이(${videoDurationSec}s), 가사 길이(${effectiveLyricsDuration}s)`);
          // console.log('durationSec:', durationSec, '[audioAnalysis] 성공:', analysisResult);
        }
      }

      latestLyrics = shiftedLyrics;
      renderLyricsOverlay(shiftedLyrics);

      if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({
          type: MESSAGE_TYPES.VIDEO_DETECTED,
          payload: videoData,
        });
      }
    } finally {
      isDetecting = false;
    }
  };
  const handleVideoDetectionGuarded = withContentEnabled(getContentEnabled, handleVideoDetection);
  const debouncedDetection = debounce(handleVideoDetectionGuarded, RETRY_DELAY);

  // --- 스토리지, UI, SPA 이벤트, visibility 이벤트 일괄 관리 ---
  // SPA 네비게이션 메시지 핸들러
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === MESSAGE_TYPES.SPA_NAVIGATION_DETECTED) {
      if (!contentEnabled) return; // 비활성화 시 아무 동작도 하지 않음
      const { url, isWatchPage } = message.payload;
      console.log(`[SPA Navigation] ${url}, isWatchPage: ${isWatchPage}`);
      if (url !== lastUrl) {
        handleUrlChangeGuarded(url);
      }
    }
  });
  // ✅ 페이지 언로드 시 정리
  window.addEventListener('beforeunload', () => {
    cleanupAllUIElements();
    disableDetection();
  });

  // ✅ Visibility API를 통한 추가 감지
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // 페이지가 다시 보이면 현재 URL 확인
      const videoData = detectYouTubeVideo();
      tryDetectVideoChange(videoData?.videoId || null, debouncedDetection);
    }
  });

  // --- 감지 시스템 상태에 따라 enable/disable 제어 ---
  // 저장소 상태에 따른 감지 시스템 제어
  const setDetectionState = (enabled: boolean) => {
    if (enabled) {
      enableDetection();
      console.log('[STATUS] 감지 시스템 활성화');
    } else {
      disableDetection();
      cleanupAllUIElements();
      console.log('[STATUS] 감지 시스템 비활성화');
    }
  };

  // 감지 시스템 활성화
  const enableDetection = () => {
    if (isDetectionActive) {
      console.log('[SKIP] 감지 시스템 이미 활성화됨');
      return;
    }

    // 기존 자원 모두 정리
    cleanupAllResources();

    detectionObserverManager.spaObserver = setupSPAObserver(() => {
      const videoData = detectYouTubeVideo();
      tryDetectVideoChange(videoData?.videoId || null, debouncedDetection);
    });

    isDetectionActive = true;

    // 초기 감지 실행
    debouncedDetection();
    console.log('[Detection] 감지 시스템 활성화 및 observer/이벤트 등록 완료');
  };
  // 감지 시스템 완전 비활성화
  const disableDetection = () => {
    cleanupAllResources();

    if (!isDetectionActive) {
      console.log('[SKIP] 감지 시스템 이미 비활성화됨');
      return;
    }

    isDetectionActive = false;
    lastVideoId = null;
    lastRenderedLyrics = '';
    latestLyrics = [];
    console.log('[Detection] 감지 시스템 완전 비활성화');
  };

  // function setupKaraokeContainer() {
  //   let karaokeRoot = document.getElementById('karaoke-root');
  //   if (!karaokeRoot) {
  //     karaokeRoot = document.createElement('div');
  //     karaokeRoot.id = 'karaoke-root';
  //     document.body.appendChild(karaokeRoot);
  //     uiManager.register(karaokeRoot);
  //   }
  //   const karaokeRootInstance = createRoot(karaokeRoot);
  //   //karaokeRootInstance.render(<KaraokePlayerContainer />);
  // }

  // 에러 바운더리 리셋 핸들러
  const handleReset = () => {
    window.location.reload();
  };

  // 앱 초기화
  const initializeApp = async () => {
    console.log('content app initializeApp 시작');
    try {
      await initializeI18n();

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

      // 가라오케/가사 컨테이너 준비 및 렌더링
      // setupKaraokeContainer();

      // 초기 URL 감지 및 UI/감지 시스템 활성화
      handleUrlChangeGuarded(window.location.href);

      // 감지 시스템 활성/비활성 상태 동기화
      chrome.storage.sync.get(STORAGE_KEYS.CONTENT_ENABLED, (result) => {
        const enabled = result[STORAGE_KEYS.CONTENT_ENABLED] ?? true;
        setDetectionState(enabled);
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
