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
import { parseLyrics } from '@lib/utils/lyrics/parsers/lyricsParser';
import { Line } from '@lib/types/lyrics';
import { extractVideoIdFromUrl, tryDetectVideoChange } from '@lib/utils/platform/videoDetection';
import { clearLyricsCache, setToLyricsCache } from '@lib/utils/cache/lyricsCache';
import { normalizeLyricsQuery } from '@lib/utils/lyrics/meta/queryNormalizer';
import { getLyricsFromCacheOrFetch } from '@lib/utils/lyrics/meta/getLyricsFromCacheOrFetch';
import { fetchLyricsWithAliasFallback } from '@background/api/lyrics';
import { LyricsError, LyricsErrorCode } from '@lib/types/lyricsError';
import { LyricsErrorDisplay } from './components/lyrics/common/LyricsErrorDisplay';
// normalize.css 제거 - content script에서 불필요 (YouTube 페이지에 스타일 충돌 방지)
import { cleanupMediaElementSource } from '@lib/utils/audio/audio';
import { checkIfMiniPlayerActive } from '@lib/utils/platform/playerUtils';
import { isWatchPage as checkIsWatchPage } from '@lib/utils/common/urlUtils';
import { hasUrlChanged } from '@lib/utils/platform/navigation';
import { SongInfoOverlay } from './components/song-info/SongInfoOverlay';
import { overlayManager } from '@lib/utils/infra/overlayManager';

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

  // 노래 정보 렌더링
  function renderSongInfo(title: string, artist: string) {
    overlayManager.setVisibility('songInfo', true);
    overlayManager.renderOverlay('songInfo', <SongInfoOverlay title={title} artist={artist} lyricsSource="LRCLIB" />);
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

    console.log(`[collectMetadataAndLyrics] 시도 ${attempt}/${API_RETRY_MAX_ATTEMPTS + 1} - videoId: ${videoId}`);

    try {
      // 1) 메타데이터 및 기본 정보 수집
      const meta = await fetchYouTubeVideoMeta(videoId, process.env.YOUTUBE_API_KEY!);
      if (!meta) throw new Error('메타 정보 없음');
      if (!isMusicVideo(meta)) throw new Error('음악 영상 아님');
      const videoDurationSec = meta.durationSec ?? 0;

      // 제목 정제: 이모지 + 콜론 앞부분 제거
      const cleanedTitle = stripEmojiAndBeforeColon(meta.title);

      // 아티스트, 타이틀 파싱(기존 처리 로직 사용)
      let parsed = extractArtistAndTitle(cleanedTitle);

      if (!parsed) {
        const fallback = fallbackArtistAndTitle(meta);
        if (!fallback) throw new Error('곡명/아티스트 파싱 실패');

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

      // 2) 가사 캐시 초기화 및 캐시 또는 서버에서 가사 조회
      clearLyricsCache();

      // 가사 캐시 혹은 서버에서 가사 fetch
      const lyricsResult = await getLyricsFromCacheOrFetch(artist, title, {
        fetch: async () => fetchLyricsWithAliasFallback(artist, title, videoDurationSec),
      });
      if (!lyricsResult) throw new Error('가사 없음');

      // 캐시 저장
      setToLyricsCache(normalizeLyricsQuery(artist, title, {}), {
        lyrics: lyricsResult.lyrics,
        duration: lyricsResult.duration,
        artist: lyricsResult.artist,
        title: lyricsResult.title,
        id: lyricsResult.id,
      });

      // 3) 가사 파싱 및 상태 업데이트 (UI 렌더링)
      const { lyrics, duration: lyricsDuration } = lyricsResult;
      const parsedLyrics: Line[] = typeof lyrics === 'string' ? parseLyrics(lyrics) : lyrics;

      chrome.runtime.sendMessage({ type: 'LYRICS_READY', length: parsedLyrics.length }, () => {
        if (chrome.runtime.lastError) {
          // 에러 무시 - 수신자가 없을 수 있음
        }
      });
      onLyricsUpdated(parsedLyrics);

      const effectiveLyricsDuration =
        lyricsDuration ?? (parsedLyrics.length > 0 ? (parsedLyrics[parsedLyrics.length - 1]?.time ?? 0) : 0);
      const durationDiff = videoDurationSec - effectiveLyricsDuration;

      if (durationDiff > 0 && durationDiff < 4) {
        console.log('싱크 오류 가능성 있음, 추가 분석 진행');
      } else {
        console.debug(
          `영상 길이 (${videoDurationSec}s)와 가사 길이 (${effectiveLyricsDuration}s) 차이: ${durationDiff}s`,
        );
      }
      renderSongInfo(title, artist);

      // 5) 광고 재생 시 가사 UI 숨김, 광고 종료 후 다시 렌더링
      let attempt = 0;
      while (isAdPlaying() && attempt < 30) {
        console.log('[fetchAnalyzeAndRenderLyrics] 광고 중. 가사 렌더 대기...');
        await delay(500); // 최대 15초 대기
        attempt++;
      }
      if (attempt >= 30) {
        console.warn('[Lyrics] 광고 대기 초과, 렌더링 스킵');
        return null;
      }

      // 6) 광고 중이 아니면 영상 분석 및 가사 렌더링 진행
      await analyzeAudioAndRender(videoElem, meta, lyricsDuration, parsedLyrics);
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
    if (isAdPlaying()) {
      console.warn('[analyzeAudioAndRender] 광고 중 분석 스킵');
      return;
    }

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

    chrome.runtime.sendMessage({ type: 'getTimerStatus' }, (response) => {
      const isTimerPlaying = response.isPlaying ?? false;
      chrome.storage.sync.set({ [STORAGE_KEYS.CONTENT_ENABLED]: isTimerPlaying }, () => {
        // 이제 실질적으로 isPlaying 상태와 storage 상태 동기화 완료
        contentEnabled = isTimerPlaying;
        if (!contentEnabled) {
          console.log('[Content] 콘텐츠 비활성 상태 - UI 렌더링 및 리스너 초기화 건너뜀');
          return;
        }
      });
    });

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
    const adPlaying = isAdPlaying();

    // readyState 2 이상 체크(HAVE_CURRENT_DATA), 광고 안 재생 중인지 명확히 체크
    const ready = player && player.readyState >= 2 && !adPlaying;

    console.log(
      `[isReadyForDetection] player: ${!!player}, readyState: ${player?.readyState}, adPlaying: ${adPlaying}, ready: ${ready}`,
    );
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
    const observer = new MutationObserver(() => {
      const videoElem = document.querySelector('video');
      if (videoElem) {
        handleVideoDetectionGuarded();

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

      chrome.runtime.sendMessage({ type: 'getTimerStatus' }, (response) => {
        const isTimerPlaying = response.isPlaying ?? false;
        chrome.storage.sync.set({ [STORAGE_KEYS.CONTENT_ENABLED]: isTimerPlaying }, () => {
          // 이제 실질적으로 isPlaying 상태와 storage 상태 동기화 완료
          contentEnabled = isTimerPlaying;
          if (!contentEnabled) {
            console.log('[Content] 콘텐츠 비활성 상태 - UI 렌더링 및 리스너 초기화 건너뜀');
            return;
          }
          setupUIResources();
          startDetectionWorkflow();
        });
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
