import { MESSAGE_TYPES } from '@constants/messageTypes';
import { fetchGeniusLyrics } from './api/genius';
import { YOUTUBE_HOST, YOUTUBE_REGEX } from '@constants/youtubeSelectors';
import { PATHS } from '@constants/paths';

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed!');
});

// 초기 로드 감지
chrome.webNavigation.onCompleted.addListener((details) => injectContentScript(details.tabId, details.url), {
  url: [{ hostSuffix: YOUTUBE_HOST }],
});

// SPA 네비게이션 감지
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => injectContentScript(details.tabId, details.url), {
  url: [{ hostSuffix: YOUTUBE_HOST }],
});

// 스크립트 주입 함수
const injectContentScript = (tabId: number, url: string) => {
  if (!YOUTUBE_REGEX.test(url)) return;

  chrome.scripting
    .executeScript({
      target: { tabId },
      files: [PATHS.CONTENT_SCRIPT],
    })
    .catch((err) => console.error(`Content script injection failed for tab ${tabId}:`, err));
};

// 영상 감지 시 가사 요청
chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.type === MESSAGE_TYPES.TOGGLE_CONTENT) {
    console.log('Toggle received:', request.enabled);
    return true; // 비동기 처리 활성화
  }

  if (request.type === MESSAGE_TYPES.VIDEO_DETECTED) {
    const { videoId, title } = request.payload;

    fetchGeniusLyrics(title)
      .then((lyrics) => {
        chrome.tabs.sendMessage(sender.tab!.id!, {
          type: 'LYRICS_DATA',
          payload: { videoId, lyrics },
        });
      })
      .catch((error) => {
        // 가사 없음 안내 메시지 전송
        chrome.tabs.sendMessage(sender.tab!.id!, {
          type: 'NO_LYRICS_FOUND',
          payload: { videoId, title },
        });
        console.error('Lyrics fetch error:', error);
      });
    return true;
  }
});
