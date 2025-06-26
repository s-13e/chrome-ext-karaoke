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

let contentEnabled = true;

// 저장소 상태 초기화 및 감지
chrome.storage.sync.get(STORAGE_KEYS.CONTENT_ENABLED, (result) => {
  contentEnabled = result[STORAGE_KEYS.CONTENT_ENABLED] ?? true;
});

chrome.storage.onChanged.addListener((changes) => {
  // 안전한 접근 방식
  const contentEnabledChange = changes[STORAGE_KEYS.CONTENT_ENABLED];

  if (contentEnabledChange && typeof contentEnabledChange.newValue === 'boolean') {
    contentEnabled = contentEnabledChange.newValue;
    console.log(`[STATUS] 콘텐츠 상태 변경: ${contentEnabled ? '활성화' : '비활성화'}`);
  }
});

// 영상 감지 핸들러
const handleVideoDetection = () => {
  console.log('[DEBUG] handleVideoDetection 호출');
  if (!contentEnabled) {
    console.log('[DEBUG] 콘텐츠 비활성화 상태 - 영상 감지 건너뜀');
    return;
  }

  const videoData = detectYouTubeVideo();
  if (!videoData) {
    console.log('[DEBUG] 영상 데이터 없음: YouTube 영상 페이지가 아님');
    return;
  }
  console.log('[DEBUG] 영상 감지 성공', {
    videoId: videoData.videoId,
    title: videoData.title,
  });
  chrome.runtime.sendMessage({ type: MESSAGE_TYPES.VIDEO_DETECTED, payload: videoData });
};

// 가사 수신 처리
const setupLyricsListener = () => {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'LYRICS_DATA') {
      initLyricsContainer(message.payload);
    }
  });
};
const debouncedHandleVideoDetection = debounce(handleVideoDetection, 1000);

// SPA 감지 설정
const setupSPADetection = () => {
  setupSPAObserver(debouncedHandleVideoDetection);
};

// ✅ SPA 네비게이션 메시지 핸들러 통합
chrome.runtime.onMessage.addListener((message) => {
  // 백그라운드에서 전송한 SPA 감지 메시지 처리
  if (message.type === MESSAGE_TYPES.SPA_NAVIGATION_DETECTED) {
    console.log('SPA navigation detected');
    debouncedHandleVideoDetection(); // 디바운싱 적용된 영상 감지
  }

  // 가사 데이터 수신 처리 (기존 유지)
  if (message.type === MESSAGE_TYPES.LYRICS_DATA) {
    initLyricsContainer(message.payload);
  }
});

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

// 앱 초기화
const initializeApp = async () => {
  try {
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
    setupLyricsListener();

    console.log('[DEBUG] 초기 영상 감지 시도');
    debouncedHandleVideoDetection(); // 디바운싱 버전 사용

    console.log('[DEBUG] SPA 감지 설정 시작');
    setupSPADetection();
  } catch (error) {
    const rootElement = document.getElementById(DOM_IDS.ROOT_CONTAINER) || createRootElement();
    const root = createRoot(rootElement);
    root.render(<ErrorFallback error={error} resetErrorBoundary={handleReset} />);
  }
};

initializeApp();
