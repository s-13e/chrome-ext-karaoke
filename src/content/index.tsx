// src/content/index.tsx
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { i18nInstance, initializeI18n } from '@services/i18n';
import { ErrorFallback } from '@components/common/ErrorFallback';
import { I18nextProvider } from 'react-i18next';
import { ErrorBoundary } from 'react-error-boundary';
import { detectYouTubeVideo, setupSPAObserver } from '@lib/youtube';
import { initLyricsContainer } from './components/LyricsContainer';
import { debounce } from '@lib/utils/common';
import 'normalize.css';
import { STORAGE_KEYS } from '@constants/storageKeys';
import { MESSAGE_TYPES } from '@constants/messageTypes';
import { DOM_IDS } from '@constants/doomIds';
import { KaraokePlayerContainer } from '@components/lyrics/KaraokePlayerContainer';

// 타입 명시적 정의
interface DetectionController {
  spaObserver: MutationObserver | null;
  videoDetection: (() => void) | null;
}

let detectionController: DetectionController = {
  spaObserver: null,
  videoDetection: null,
};

// ✅ UI 요소들을 완전히 정리하는 함수
const cleanupAllUIElements = () => {
  // 1. 카라오케 컨테이너 제거
  const karaokeRoot = document.getElementById('karaoke-root');
  if (karaokeRoot) {
    karaokeRoot.remove();
    console.log('[Cleanup] Karaoke container removed');
  }

  // 2. 가사 컨테이너 제거
  const lyricsRoot = document.getElementById('lyrics-root');
  if (lyricsRoot) {
    lyricsRoot.remove();
    console.log('[Cleanup] Lyrics container removed');
  }

  // 3. 주입된 스타일 제거
  const injectedStyles = document.querySelectorAll('#karaoke-player-styles, #karaoke-styles');
  injectedStyles.forEach((style) => style.remove());

  // 4. body 클래스 정리
  document.body.classList.remove('karaoke-mode');

  console.log('[Cleanup] UI cleanup completed');
};

// ✅ UI 요소들을 생성하는 함수
const createUIElements = () => {
  console.log('[UI] Creating UI elements for watch page');

  // 카라오케 컨테이너 생성
  let karaokeRoot = document.getElementById('karaoke-root');
  if (!karaokeRoot) {
    karaokeRoot = document.createElement('div');
    karaokeRoot.id = 'karaoke-root';
    document.body.appendChild(karaokeRoot);

    const karaokeRootInstance = createRoot(karaokeRoot);
    karaokeRootInstance.render(<KaraokePlayerContainer />);
    console.log('[UI] Karaoke container created');
  }
};

// ✅ URL 변경 핸들러 개선
const handleUrlChange = (url: string) => {
  const isWatchPage = url.includes('/watch');

  console.log(`[URL Change] ${url}, isWatchPage: ${isWatchPage}`);

  if (isWatchPage) {
    // Watch 페이지 - UI 요소 생성
    createUIElements();

    // 비디오 감지 실행
    if (detectionController.videoDetection) {
      detectionController.videoDetection();
    }
  } else {
    // Watch 페이지가 아님 - 모든 UI 요소 제거
    cleanupAllUIElements();
  }
};

// 영상 감지 핸들러 (순수 로직)
const handleVideoDetection = () => {
  const videoData = detectYouTubeVideo();
  if (!videoData) return;

  console.log('[VIDEO DETECTED]', videoData.videoId, videoData.title);

  chrome.runtime.sendMessage({
    type: MESSAGE_TYPES.VIDEO_DETECTED,
    payload: videoData,
  });
};

// 감지 시스템 활성화
const enableDetection = () => {
  // 기존 리소스 정리
  if (detectionController.spaObserver) {
    detectionController.spaObserver.disconnect();
  }

  // 새로운 감지 시스템 설정
  const debouncedDetection = debounce(handleVideoDetection, 1000);
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
    cleanupAllUIElements(); // ✅ 비활성화 시 UI도 정리
    console.log('[STATUS] 감지 시스템 비활성화');
  }
};

chrome.storage.onChanged.addListener((changes) => {
  // 변경사항이 존재하고, 값이 boolean 타입인지 확인
  const contentEnabledChange = changes[STORAGE_KEYS.CONTENT_ENABLED];

  if (contentEnabledChange && typeof contentEnabledChange.newValue === 'boolean') {
    setDetectionState(contentEnabledChange.newValue);
  }
});

// 가사 수신 처리
const setupLyricsListener = () => {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'LYRICS_DATA') {
      initLyricsContainer(message.payload);
    }
  });
};

// 루트 엘리먼트 생성
const createRootElement = () => {
  const root = document.createElement('div');
  root.id = DOM_IDS.ROOT_CONTAINER;
  document.body.appendChild(root);
  return root;
};

// 에러 바운더리 리셋 핸들러
const handleReset = () => {
  window.location.reload();
};
const injectCSS = () => {
  const cssId = 'karaoke-styles';
  if (document.getElementById(cssId)) return;

  const link = document.createElement('link');
  link.id = cssId;
  link.rel = 'stylesheet';
  link.href = chrome.runtime.getURL('content/style.css'); // 확장자원 URL
  document.head.appendChild(link);
};
// 앱 초기화
const initializeApp = async () => {
  try {
    injectCSS();
    await initializeI18n();
    const rootElement = document.getElementById(DOM_IDS.ROOT_CONTAINER) || createRootElement();
    const root = createRoot(rootElement);
    root.render(
      <ErrorBoundary FallbackComponent={ErrorFallback} onReset={handleReset}>
        <I18nextProvider i18n={i18nInstance}>
          <App />
        </I18nextProvider>
      </ErrorBoundary>,
    );

    // ✅ 가사/플레이어 컨테이너를 별도로 렌더링
    let karaokeRoot = document.getElementById('karaoke-root');
    if (!karaokeRoot) {
      karaokeRoot = document.createElement('div');
      karaokeRoot.id = 'karaoke-root';
      document.body.appendChild(karaokeRoot);
    }
    const karaokeRootInstance = createRoot(karaokeRoot);
    karaokeRootInstance.render(<KaraokePlayerContainer />);

    setupLyricsListener();
    console.log('[DEBUG] 초기 영상 감지 시도');

    handleUrlChange(window.location.href);

    // 초기 감지 상태 설정
    chrome.storage.sync.get(STORAGE_KEYS.CONTENT_ENABLED, (result) => {
      const enabled = result[STORAGE_KEYS.CONTENT_ENABLED] ?? true;
      setDetectionState(enabled);
    });
  } catch (error) {
    const rootElement = document.getElementById(DOM_IDS.ROOT_CONTAINER) || createRootElement();
    const root = createRoot(rootElement);
    root.render(<ErrorFallback error={error} resetErrorBoundary={handleReset} />);
  }
};

initializeApp();

// SPA 네비게이션 메시지 핸들러
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === MESSAGE_TYPES.SPA_NAVIGATION_DETECTED) {
    const { url, isWatchPage } = message.payload;
    console.log(`[SPA Navigation] ${url}, isWatchPage: ${isWatchPage}`);

    // URL 변경 처리
    handleUrlChange(url);
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
    handleUrlChange(window.location.href);
  }
});
