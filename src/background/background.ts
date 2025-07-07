import { MESSAGE_TYPES } from '@constants/messageTypes';
import { YOUTUBE_HOST } from '@constants/youtubeSelectors';
import { PATHS } from '@constants/paths';
import { YOUTUBE_CONFIG } from '@constants/platforms';
import { DetectionConfig } from '@lib/types/config';

const activeTabs = new Set<number>();
let lastInjectedUrl = '';

// 초기 로드 감지
chrome.webNavigation.onCompleted.addListener(
  (details) => injectContentScript(details.tabId, details.url, YOUTUBE_CONFIG),
  { url: [{ hostSuffix: YOUTUBE_HOST }] },
);

// ✅ SPA 네비게이션 감지 추가
chrome.webNavigation.onHistoryStateUpdated.addListener(
  (details) => {
    console.log('[SPA Navigation]', details.url);

    // Content script에 URL 변경 알림
    chrome.tabs
      .sendMessage(details.tabId, {
        type: MESSAGE_TYPES.SPA_NAVIGATION_DETECTED,
        payload: {
          url: details.url,
          isWatchPage: details.url.includes('/watch'),
        },
      })
      .catch(() => {
        // Content script가 아직 주입되지 않은 경우 무시
      });

    // Watch 페이지로 이동한 경우에만 스크립트 주입
    if (details.url.includes('/watch')) {
      injectContentScript(details.tabId, details.url, YOUTUBE_CONFIG);
    }
  },
  { url: [{ hostSuffix: YOUTUBE_HOST }] },
);

// 스크립트 주입 함수
const injectContentScript = (tabId: number, url: string, config: DetectionConfig) => {
  // ✅ 이미 주입된 탭 체크
  if (activeTabs.has(tabId) || !config.urlRegex.test(url) || url === lastInjectedUrl) return;

  activeTabs.add(tabId);
  lastInjectedUrl = url;

  chrome.scripting
    .executeScript({
      target: { tabId },
      files: [PATHS.CONTENT_SCRIPT],
    })
    .catch(console.error);
};

// 탭 닫힘 시 상태 제거
chrome.tabs.onRemoved.addListener((tabId) => {
  activeTabs.delete(tabId);
});
