// src/content/index.tsx
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { i18nInstance, initializeI18n } from '@services/i18n';
import { ErrorFallback } from '@components/common/ErrorFallback';
import { I18nextProvider } from 'react-i18next';
import { ErrorBoundary } from 'react-error-boundary';
import { detectYouTubeVideo, setupSPAObserver, setupPlayerReadyObserver } from '@lib/youtube';
import { debounce } from '@lib/utils/common';
import { STORAGE_KEYS } from '@constants/storageKeys';
import { MESSAGE_TYPES } from '@constants/messageTypes';
import { DOM_IDS } from '@constants/doomIds';
import { KaraokePlayerContainer } from '@components/lyrics/KaraokePlayerContainer';
import { fetchYouTubeVideoMeta } from '@background/api/youtube';
import { isMusicVideo } from '@lib/utils/musicDetection';
import { UIResourceManager } from '@lib/utils/uiResourceManager';
import { YOUTUBE_WATCH_PATH } from '@constants/youtubeSelectors';
import { extractArtistAndTitle } from '@lib/utils/artistTitle';
import { cleanUp, extractArtistAndTitleCustom, removeEmptyBrackets } from '@lib/utils/stringUtils';
import { listenerManager } from '@lib/utils/listenerManager';
import { registerAllListeners } from '@lib/utils/registerAllListeners';
import { fetchLrclibLyrics } from '@background/api/lrclib';
import { withContentEnabled } from '@lib/utils/contentGuard';
import 'normalize.css';
import { injectLyricsOverlayRoot } from '@components/lyrics/LyricsOverlayRoot';
import { SyncSubtitle } from '@components/lyrics/SyncSubtitle';

// 타입 명시적 정의
interface DetectionController {
  spaObserver: MutationObserver | null;
  videoDetection: (() => void) | null;
}

let detectionController: DetectionController = {
  spaObserver: null,
  videoDetection: null,
};

// 2. 초기값을 chrome.storage에서 읽어옴
chrome.storage.sync.get([STORAGE_KEYS.CONTENT_ENABLED], (result) => {
  contentEnabled = result[STORAGE_KEYS.CONTENT_ENABLED] ?? false;
});

let contentEnabled = false;
const getContentEnabled = () => contentEnabled; // 전역 변수 접근

const isObserverActive = false;

const uiManager = new UIResourceManager();

// 2. 초기값을 chrome.storage에서 읽어옴
chrome.storage.sync.get([STORAGE_KEYS.CONTENT_ENABLED], (result) => {
  contentEnabled = result[STORAGE_KEYS.CONTENT_ENABLED] ?? false;
});

// ✅ UI 요소들을 완전히 정리하는 함수
const cleanupAllUIElements = () => {
  uiManager.cleanup();

  // 3. 주입된 스타일 제거
  const injectedStyles = document.querySelectorAll('#karaoke-player-styles, #karaoke-styles');
  injectedStyles.forEach((style) => style.remove());

  // 4. body 클래스 정리
  document.body.classList.remove('karaoke-mode');

  console.log('[Cleanup] UI cleanup completed');
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

function renderLyricsOverlay(lyrics: string) {
  const overlay = injectLyricsOverlayRoot();
  const root = createRoot(overlay);
  root.render(<SyncSubtitle lyrics={lyrics} />);
}

let lastUrl = window.location.href;

// ✅ URL 변경 핸들러 개선
const handleUrlChange = (url: string) => {
  if (url === lastUrl) return; // URL이 실제로 바뀌었을 때만 실행
  lastUrl = url;

  const isWatchPage = url.includes(YOUTUBE_WATCH_PATH);

  console.log(`[URL Change] ${url}, isWatchPage: ${isWatchPage}`);

  if (isWatchPage) {
    // 비디오 감지 실행
    if (detectionController.videoDetection) {
      detectionController.videoDetection();
    }
  }
};
const handleUrlChangeGuarded = withContentEnabled(getContentEnabled, handleUrlChange);

let lastVideoId: string | null = null;

// 영상 감지 핸들러 (순수 로직)
const handleVideoDetection = async () => {
  console.log('handleVideoDetection 실행');

  const videoData = detectYouTubeVideo();
  if (!videoData) {
    console.log('detectYouTubeVideo 실패');
    return;
  }
  if (videoData.videoId === lastVideoId) return; // 같은 영상이면 실행하지 않음
  lastVideoId = videoData.videoId;

  // 1. YouTube Data API로 메타데이터 요청
  const meta = await fetchYouTubeVideoMeta(videoData.videoId, process.env.YOUTUBE_API_KEY!);
  if (!meta) {
    console.log('fetchYouTubeVideoMeta 실패');
    return;
  }
  if (!isMusicVideo(meta)) {
    console.log('isMusicVideo 판별 실패');
    return;
  }

  const parsed = extractArtistAndTitle(meta.title);
  if (!parsed) {
    console.log('extractArtistAndTitle 실패', meta.title);
    return;
  }

  const refined = extractArtistAndTitleCustom(`${parsed.artist} - ${parsed.title}`);
  if (!refined) {
    console.log('extractArtistAndTitleCustom 실패', meta.title);
    return;
  }

  const artist = cleanUp(refined.artist);
  let title = cleanUp(refined.title);
  title = removeEmptyBrackets(title);

  console.log('아티스트:', artist, '곡명:', title);

  let lyrics = await fetchLrclibLyrics(artist, title);

  if (!lyrics) {
    lyrics = await fetchLrclibLyrics(title, artist);
    if (!lyrics) {
      const searchRes = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(artist + ' ' + title)}`);
      const searchData = await searchRes.json();
      for (const candidate of searchData) {
        const detailRes = await fetch(`https://lrclib.net/api/get/${candidate.id}`);
        const detail = await detailRes.json();
        lyrics = detail.syncedLyrics || detail.plainLyrics;
        if (lyrics) break;
      }
    }
  }
  console.log('가사:', lyrics);

  // 가사 획득 성공 시 오버레이 렌더링 호출
  if (lyrics) {
    renderLyricsOverlay(lyrics);
  }

  chrome.runtime.sendMessage({
    type: MESSAGE_TYPES.VIDEO_DETECTED,
    payload: videoData,
  });
};
const handleVideoDetectionGuarded = withContentEnabled(getContentEnabled, handleVideoDetection);

const debouncedDetection = debounce(handleVideoDetectionGuarded, 300);

// 감지 시스템 활성화
const enableDetection = () => {
  if (isObserverActive) return; // 이미 활성화된 경우 중복 방지

  // 기존 리소스 정리
  if (detectionController.spaObserver) {
    detectionController.spaObserver.disconnect();
  }
  // 리스너 재등록
  registerAllListeners(setDetectionState);

  // 새로운 감지 시스템 설정
  const newObserver = setupSPAObserver(debouncedDetection);

  detectionController = {
    spaObserver: newObserver,
    videoDetection: debouncedDetection,
  };

  // 초기 감지 실행
  debouncedDetection();
};
// 감지 시스템 완전 비활성화
const disableDetection = () => {
  if (detectionController.spaObserver) {
    detectionController.spaObserver.disconnect();
  }
  listenerManager.removeAll(); // 등록된 모든 리스너 해제

  detectionController = {
    spaObserver: null,
    videoDetection: null,
  };
};

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

function setupKaraokeContainer() {
  let karaokeRoot = document.getElementById('karaoke-root');
  if (!karaokeRoot) {
    karaokeRoot = document.createElement('div');
    karaokeRoot.id = 'karaoke-root';
    document.body.appendChild(karaokeRoot);
    uiManager.register(karaokeRoot);
  }
  const karaokeRootInstance = createRoot(karaokeRoot);
  karaokeRootInstance.render(<KaraokePlayerContainer />);
}

// SPA 네비게이션 메시지 핸들러
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === MESSAGE_TYPES.SPA_NAVIGATION_DETECTED) {
    if (!contentEnabled) return; // 비활성화 시 아무 동작도 하지 않음

    const { url, isWatchPage } = message.payload;
    console.log(`[SPA Navigation] ${url}, isWatchPage: ${isWatchPage}`);

    // URL 변경 처리
    handleUrlChangeGuarded(url);
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
    handleUrlChangeGuarded(window.location.href);
  }
});

// 에러 바운더리 리셋 핸들러
const handleReset = () => {
  window.location.reload();
};

// 앱 초기화
const initializeApp = async () => {
  try {
    injectCSS();
    await initializeI18n();
    // 플레이어 등장 즉시 가사 감지 트리거
    setupPlayerReadyObserver(() => {
      console.log('[Observer] 유튜브 플레이어 등장 감지, 가사 감지 실행');
      handleVideoDetectionGuarded();
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

    // 가라오케/가사 컨테이너 준비 및 렌더링
    setupKaraokeContainer();

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
