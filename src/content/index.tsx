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

// 영상 감지 핸들러
const handleVideoDetection = () => {
  console.log('[DEBUG] handleVideoDetection 호출');

  const videoData = detectYouTubeVideo();
  if (!videoData) {
    console.log('[DEBUG] 영상 데이터 없음: YouTube 영상 페이지가 아님');
    return;
  }
  console.log('[DEBUG] 영상 감지 성공', {
    videoId: videoData.videoId,
    title: videoData.title,
  });
  chrome.runtime.sendMessage({ type: 'VIDEO_DETECTED', payload: videoData });
};

// 가사 수신 처리
const setupLyricsListener = () => {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'LYRICS_DATA') {
      initLyricsContainer(message.payload);
    }
  });
};
const debouncedHandleVideoDetection = debounce(handleVideoDetection, 500);

// SPA 감지 설정
const setupSPADetection = () => {
  setupSPAObserver(debouncedHandleVideoDetection);
};

// ✅ SPA 네비게이션 메시지 핸들러 통합
chrome.runtime.onMessage.addListener((message) => {
  // 백그라운드에서 전송한 SPA 감지 메시지 처리
  if (message.type === 'SPA_NAVIGATION_DETECTED') {
    console.log('SPA navigation detected');
    debouncedHandleVideoDetection(); // 디바운싱 적용된 영상 감지
  }

  // 가사 데이터 수신 처리 (기존 유지)
  if (message.type === 'LYRICS_DATA') {
    initLyricsContainer(message.payload);
  }
});

// 루트 엘리먼트 생성
const createRootElement = () => {
  const root = document.createElement('div');
  root.id = 'chrome-extension-root';
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
    const rootElement = document.getElementById('chrome-extension-root') || createRootElement();
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
    const rootElement = document.getElementById('chrome-extension-root') || createRootElement();
    const root = createRoot(rootElement);
    root.render(<ErrorFallback error={error} resetErrorBoundary={handleReset} />);
  }
};

initializeApp();
