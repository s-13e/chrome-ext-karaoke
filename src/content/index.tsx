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
import 'normalize.css';
import { cleanupMediaElementSource } from '@lib/utils/audio/audio';
import { startAdWatcher } from '@lib/utils/infra/adWatcher';
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

  let stopAdWatcher: (() => void) | null = null;
  let analyzeLyricsAfterAd: (() => Promise<void>) | null = null;

  // 중복 가사 호출 방지
  let lastCollectedVideoId: string | null = null;
  let isCollecting = false;
  //
  let storedMetaForLastCollected: { durationSec?: number } | null = null;
  let storedLyricsDurationForLastCollected: number | undefined = undefined;

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
    latestLyrics = [];
    console.log('[resetLyricsData] 가사 상태 초기화 완료');

    // 최신 상태 반영 위해 화면 재렌더링
    renderLyricsOverlay(latestLyrics);
  }

  /**
   * UI 관련해서 직접 관리하는 DOM/스타일 등 리소스를 삭제하고,
   * 오버레이 React Root(가사, 노래정보)를 unmount 및 DOM에서 제거하는 함수
   */
  function cleanupOverlayUI() {
    console.log('[cleanupOverlayUI] 실행');
    uiManager.cleanup();
    overlayManager.cleanupOverlay('lyrics');
    overlayManager.cleanupOverlay('songInfo');
  }

  /**
   * 가사 상태 초기화와 UI 오버레이 클린업을 한번에 실행하는 통합 클린업 함수.
   * 기본적으로 대부분의 리소스 정리를 위해 호출됨
   */
  // function resetAllUI() {
  //   console.log('[resetAllUI] 실행');
  //   resetLyricsData();
  //   cleanupOverlayUI();
  // }

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
    overlayManager.renderOverlay('songInfo', <SongInfoOverlay title={title} artist={artist} lyricsSource="LRCLIB" />);
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
          renderLyricsOverlay(latestLyrics);
        }
      },
    );

    // 2. 저장소 변경 감지 - 실시간 업데이트
    setupStorageListeners();

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

        onLyricsUpdated(lyrics);
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

    renderLyricsOverlay(latestLyrics);
  }

  function isLyricsOverlayMounted(): boolean {
    return overlayManager.isOverlayMounted('lyrics');
  }

  // 스토리지 변경 리스너 등록
  function setupStorageListeners() {
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

    cleanupOverlayUI();
    console.log('handleUrlChange 내부의 cleanupOverlayUI 실행!');
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

  // 1. 영상과 크게 무관한 메타데이터, 가사 정보를 확보하는 함수
  async function collectMetadataAndLyrics(videoId: string) {
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

    renderSongInfo(title, artist);

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

    chrome.runtime.sendMessage({ type: 'LYRICS_READY', length: parsedLyrics.length });
    onLyricsUpdated(parsedLyrics);

    // 이 함수는 성공시 meta 및 shiftedLyrics 반환 (후속 분석용)
    return { meta, lyricsDuration, parsedLyrics };
  }

  // 2. 영상 엘리먼트가 준비된 후, 실제 분석 및 렌더링 수행하는 함수
  async function analyzeAudioAndRenderLyrics(
    meta: { durationSec?: number },
    lyricsDuration: number | undefined,
    videoElem: HTMLMediaElement,
    shiftedLyrics: Line[],
  ) {
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
      return;
    }

    // 중복 audio source 연결 방지 및 안전한 초기화
    cleanupMediaElementSource(videoElem);

    latestLyrics = shiftedLyrics;
    onLyricsUpdated(shiftedLyrics);
  }

  async function analyzeAudioAndRenderLyricsWithAdCheck(
    meta: { durationSec?: number },
    lyricsDuration: number | undefined,
    videoElem: HTMLMediaElement,
    shiftedLyrics: Line[],
  ) {
    if (isAdPlaying()) {
      console.log('[analyzeAudioAndRenderLyricsWithAdCheck] 광고 중, 분석-렌더 대기');

      analyzeLyricsAfterAd = async () => {
        await analyzeAudioAndRenderLyrics(meta, lyricsDuration, videoElem, shiftedLyrics);
        analyzeLyricsAfterAd = null;
      };
      return;
    }
    await analyzeAudioAndRenderLyrics(meta, lyricsDuration, videoElem, shiftedLyrics);
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

    isCollecting = true;
    try {
      const data = await collectMetadataAndLyrics(videoId);
      lastCollectedVideoId = videoId;

      // 성공 시 전역 상태에 저장
      storedMetaForLastCollected = data.meta;
      storedLyricsDurationForLastCollected = data.lyricsDuration;

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

    // 비디오 엘리먼트가 준비되었으면 본 분석 및 렌더링 실행
    const videoElem = document.querySelector('video');
    if (!videoElem) {
      console.log('[handleVideoDetection] video element 미존재, 렌더링 생략');
      return;
    }

    // 광고 중이면 가사 숨김 실행 후 종료 또는 조기 리턴
    if (isAdPlaying()) {
      console.log('[handleVideoDetection] 광고 재생 중, 가사 숨김 실행');
      resetLyricsData();
      // analyzeLyricsAfterAd = async () => {
      //   await pauseVideoAndDelay(videoElem, 6000); // 예: 6초 대기
      //   analyzeLyricsAfterAd = null;
      // };
      isDetecting = false;
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

      // console.time('beforePause');
      // await pauseVideoAndDelay(videoElem, 6000);
      // console.timeEnd('beforePause');

      // 새 영상이 들어왔으므로 이전 자막 제거
      lastVideoId = videoData.videoId;

      let collected = null;
      if (isCollecting) {
        console.log('[handleVideoDetection] 가사 수집 중복 방지, 기존 최신 가사로 분석·렌더 바로 실행');

        // 최신 가사와 메타 등 준비됐을 때만 실행하도록 체크
        if (latestLyrics.length > 0) {
          await analyzeAudioAndRenderLyricsWithAdCheck(
            storedMetaForLastCollected ?? {},
            storedLyricsDurationForLastCollected ?? undefined,
            videoElem,
            latestLyrics,
          );
        }
        return;
      } else {
        // 가사 수집 시도
        collected = await tryCollectMetadataAndLyrics(videoData.videoId);
        if (!collected) {
          console.warn('[handleVideoDetection] 가사 수집 실패 또는 데이터 없음');
          return;
        }
        await analyzeAudioAndRenderLyrics(collected.meta, collected.lyricsDuration, videoElem, collected.parsedLyrics);
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

  // 1) 광고 종료 감지 콜백용 별도 함수 (가사/메타 수집에 집중)
  async function prefetchMetadataAndLyricsOnAdEnd() {
    const currentVideoId = extractVideoIdFromUrl(window.location.href);
    if (!currentVideoId) {
      console.log('[AdWatcher] videoId 미존재, 수집 중단');
      return;
    }
    try {
      // 광고 중이라도 가사/메타 데이터는 미리 가져오기 가능
      await tryCollectMetadataAndLyrics(currentVideoId);
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

      // 실제로 광고 종료 후 영상 아이디가 바뀌었는지 확인 후 초기화
      lastVideoId = null;
      await prefetchMetadataAndLyricsOnAdEnd();

      // 광고 종료 후 대기 중인 가사 렌더링 함수 실행
      if (analyzeLyricsAfterAd) {
        await analyzeLyricsAfterAd();
      }

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
      resetLyricsData();
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
        const currentVideoId = extractVideoIdFromUrl(window.location.href);

        if (videoData && currentVideoId) {
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

  // 감지 시스템 활성화
  const enableDetection = async () => {
    console.log('[enableDetection] cleanupAllResources 실행');
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

  // 앱 UI 및 감지 초기화 함수
  function setupAppResources() {
    if (!overlayManager.isInitialized('lyrics')) {
      overlayManager.createOverlayRoot('lyrics');
    }

    overlayManager.renderOverlay(
      'lyrics',
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

    enableDetection();
  }

  // 앱 초기화
  const initializeApp = async () => {
    console.log('content app initializeApp 시작');
    try {
      await initializeI18n();

      chrome.storage.sync.get([STORAGE_KEYS.CONTENT_ENABLED], (result) => {
        contentEnabled = result[STORAGE_KEYS.CONTENT_ENABLED] ?? false;
        if (!contentEnabled) {
          console.log('[Content] 콘텐츠 비활성 상태 - UI 렌더링 및 리스너 초기화 건너뜀');
          return;
        }
        setupAppResources();
      });

      // 저장소 변경 감지 등록 - 활성화 상태 변하면 처리
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'sync' && STORAGE_KEYS.CONTENT_ENABLED in changes) {
          contentEnabled = changes[STORAGE_KEYS.CONTENT_ENABLED]?.newValue;
          console.log('[Content] 저장소 변경 감지, 활성화 상태:', contentEnabled);

          if (contentEnabled) {
            setupAppResources();
          } else {
            disableDetection();
            console.log('[initialize App] cleanupAllResources 실행');

            cleanupAllResources();
            // 필요 시 UI 클린업 등도 수행
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  initializeApp();
})();
