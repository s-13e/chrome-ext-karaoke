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
import { clearLyricsCache, setToLyricsCache } from '@lib/utils/cache/lyricsCache';
import { normalizeLyricsQuery } from '@lib/utils/lyrics/queryNormalizer';
import { getLyricsFromCacheOrFetch } from '@lib/utils/lyrics/getLyricsFromCacheOrFetch';
import { fetchLyricsWithAliasFallback } from '@background/api/lyrics';
import 'normalize.css';
// import { detectMusicStart } from '@lib/utils/audio/audioAnalysis';
import { cleanupMediaElementSource } from '@lib/utils/audio/audio';
import { startAdWatcher } from '@lib/utils/infra/adWatcher';
//import { detectLyricsLanguage } from '@lib/utils/lyrics/languageDetector';

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
  let stopAdWatcher: (() => void) | null = null;

  // 중복 가사 호출 방지
  let lastCollectedVideoId: string | null = null;
  let isCollecting = false;

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

    if (isWatchPage) {
      const videoData = detectYouTubeVideo();
      tryDetectVideoChange(videoData?.videoId || null, debouncedDetection);
    }
  };
  const handleUrlChangeGuarded = withContentEnabled(getContentEnabled, handleUrlChange);

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
    const shiftedLyrics = shiftFirstLyricEarlier(parsedLyrics, 3);

    latestLyrics = shiftedLyrics;

    // shiftedLyrics: Line[] 배열 (각 원소에 'text'가 있다고 가정)
    //const lyricsText = shiftedLyrics.map((line) => line.text).join('\n');
    //const lyricsLang = await detectLyricsLanguage(lyricsText, 2);

    // 이 함수는 성공시 meta 및 shiftedLyrics 반환 (후속 분석용)
    return { meta, lyricsDuration, shiftedLyrics };
  }

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

    if (durationSec <= 0) {
      console.warn(
        `[analyzeAudioAndRenderLyrics] 분석 스킵: 영상 길이(${videoDurationSec}s) - 가사 길이(${effectiveLyricsDuration}s) <= 0`,
      );
      hideLyricsOverlay();
      return;
    }

    if (isAdPlaying()) {
      console.warn('[analyzeAudioAndRenderLyrics] 광고 중이므로 분석 스킵');
      hideLyricsOverlay();
      return;
    }

    // 중복 audio source 연결 방지 및 안전한 초기화
    cleanupMediaElementSource(videoElem);

    try {
      // // detectMusicStart 호출 -> 음악 시작 offset 탐지
      // const analysisResult = await detectMusicStart(videoElem, {
      //   threshold: 0.07,
      //   requiredContinuousFrames: 6,
      // });

      // const musicStartOffset = analysisResult?.timestamp ?? 0;
      // console.log('[detectMusicStart] 음악 시작점 offset:', musicStartOffset, '초');

      // // 가사 타임에 offset 적용
      // const applyOffsetToLyrics = (lyrics: Line[], offset: number): Line[] =>
      //   lyrics.map((line) => ({
      //     ...line,
      //     time: Math.max(0, line.time + offset),
      //   }));

      // const offsettedLyrics = applyOffsetToLyrics(shiftedLyrics, musicStartOffset);

      latestLyrics = shiftedLyrics;
      renderLyricsOverlay(shiftedLyrics);
    } catch (error) {
      console.warn('[analyzeAudioAndRenderLyrics] 분석 실패:', error);
      // 실패 시 자막 감춤 또는 기본 렌더로 유지할 수 있음
    }
  }

  async function tryCollectMetadataAndLyrics(videoId: string) {
    if (isCollecting) {
      console.log('[Lyrics] 수집 중복 방지 중...');
      return; // 필요시 캐시된 데이터 반환하도록 개선 가능
    }
    if (videoId === lastCollectedVideoId) {
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
      console.log('[SKIP] 감지 함수 실행 중 (동시 실행 방지)');
      return;
    }

    try {
      isDetecting = true;

      const videoData = detectYouTubeVideo();
      if (!videoData || !videoData.videoId) {
        console.log('[handleVideoDetection] 비디오 감지 실패');
        return;
      }

      if (videoData.videoId === lastVideoId) {
        console.log('[handleVideoDetection] 이미 처리한 videoId');
        return;
      }

      // 새 영상이 들어왔으므로 이전 자막 제거
      hideLyricsOverlay();
      latestLyrics = [];

      lastVideoId = videoData.videoId;

      // 1. 메타데이터 및 가사 수집 (영상 로드 여부 무관)
      const collected = await tryCollectMetadataAndLyrics(videoData.videoId);
      if (!collected) {
        console.warn('가사 수집 데이터 없음');
        return;
      }
      const { meta, lyricsDuration, shiftedLyrics } = collected;

      // 2. 비디오 엘리먼트가 준비되었으면 본 분석 및 렌더링 실행
      const videoElem = document.querySelector('video');

      if (!videoElem) {
        console.log('[handleVideoDetection] video element 미존재, 렌더링 생략');
        return;
      }
      await analyzeAudioAndRenderLyrics(meta, lyricsDuration, videoElem, shiftedLyrics);
    } catch (error) {
      console.error('[handleVideoDetection] 에러 발생:', error);
    } finally {
      isDetecting = false;
    }
  };
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
    if (stopAdWatcher) return; // 중복 실행 방지
    stopAdWatcher = startAdWatcher(async () => {
      console.log('[AdWatcher] 광고 종료 감지, 선수집 -> 본 감지 순서 시작');
      lastVideoId = null;

      await prefetchMetadataAndLyricsOnAdEnd();
      await handleVideoDetectionGuarded();
    });
  }

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
  const enableDetection = async () => {
    if (isDetectionActive) {
      console.log('[SKIP] 감지 시스템 이미 활성화됨');
      return;
    }

    // 기존 자원 모두 정리
    cleanupAllResources();

    // spa observer 설정
    detectionObserverManager.spaObserver = setupSPAObserver(() => {
      const videoData = detectYouTubeVideo();
      tryDetectVideoChange(videoData?.videoId || null, debouncedDetection);
    });

    // 광고 감지 시작
    initAdWatcher();

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
