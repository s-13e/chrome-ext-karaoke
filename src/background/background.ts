import { MESSAGE_TYPES } from '@constants/messageTypes';
import { YOUTUBE_HOST } from '@constants/youtubeSelectors';
import { PATHS } from '@constants/paths';
import { YOUTUBE_CONFIG } from '@constants/platforms';
import { DetectionConfig } from '@lib/types/config';
import { Line } from '@lib/types/lyrics';

// ===== 전역 변수 및 상태 =====
const activeTabs = new Set<number>();
let lastInjectedUrl = '';

// ===== 타입 정의 =====
interface GetLatestLyricsResponse {
  lyrics: Line[];
}

interface LyricsReadyMessage {
  type: 'LYRICS_READY';
  lyrics: Line[];
}

interface GetLatestLyricsMessage {
  type: 'GET_LATEST_LYRICS';
}

interface SetOffsetMessage {
  type: 'SET_OFFSET';
  offset: number;
}

interface ApplyOffsetLyricsMessage {
  type: 'APPLY_OFFSET_LYRICS';
  offset?: number;
}

interface FetchYouTubeLRCLibCacheMessage {
  type: 'FETCH_YOUTUBE_LRCLIB_CACHE';
  videoId: string;
}

interface FetchLyricsByIdMessage {
  type: 'FETCH_LYRICS_BY_ID';
  lrclibId: number;
}

interface FetchYouTubeLyricsMessage {
  type: 'FETCH_YOUTUBE_LYRICS';
  videoId: string;
}

interface FetchYouTubeMetaMessage {
  type: 'FETCH_YOUTUBE_META';
  videoId: string;
}

interface FetchPlaylistItemsMessage {
  type: 'FETCH_PLAYLIST_ITEMS';
  playlistId: string;
  maxResults?: number;
}

export type ExtensionMessage =
  | LyricsReadyMessage
  | GetLatestLyricsMessage
  | SetOffsetMessage
  | ApplyOffsetLyricsMessage
  | FetchYouTubeLRCLibCacheMessage
  | FetchLyricsByIdMessage
  | FetchYouTubeLyricsMessage
  | FetchYouTubeMetaMessage
  | FetchPlaylistItemsMessage;

// ===== Chrome 확장 이벤트 리스너 =====

// 초기 로드 감지
chrome.webNavigation.onCompleted.addListener(
  (details) => injectContentScript(details.tabId, details.url, YOUTUBE_CONFIG),
  { url: [{ hostSuffix: YOUTUBE_HOST }] },
);

// SPA 네비게이션 감지
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

// 탭 닫힘 시 상태 제거
chrome.tabs.onRemoved.addListener((tabId) => {
  activeTabs.delete(tabId);
});

// ===== 유틸리티 함수 =====

// Content Script 주입
function injectContentScript(tabId: number, url: string, config: DetectionConfig) {
  console.log(`[injectContentScript] 호출됨 - tabId: ${tabId}, url: ${url}`);

  if (activeTabs.has(tabId)) {
    console.log(`[injectContentScript] 이미 주입됨 - tabId: ${tabId}`);
    return;
  }

  if (!config.urlRegex.test(url)) {
    console.log(`[injectContentScript] URL 패턴 불일치 - 주입 안 함`);
    return;
  }

  if (url === lastInjectedUrl) {
    console.log(`[injectContentScript] 마지막 주입 URL과 동일 - 주입 생략`);
    return;
  }

  activeTabs.add(tabId);
  lastInjectedUrl = url;

  console.log(`[injectContentScript] Content Script 주입 시작 - ${PATHS.CONTENT_SCRIPT}`);
  chrome.scripting
    .executeScript({
      target: { tabId },
      files: [PATHS.CONTENT_SCRIPT],
    })
    .then(() => console.log(`[injectContentScript] 주입 성공 - tabId: ${tabId}`))
    .catch((err) => console.error(`[injectContentScript] 주입 실패:`, err));
}

// 활성 탭에 메시지 전송
function sendMessageToActiveTab(msg: ExtensionMessage, maxRetries = 3): Promise<GetLatestLyricsResponse> {
  let tries = 0;
  console.log(`[sendMessageToActiveTab] 요청 시작`, msg);

  function trySend(resolve: (value: GetLatestLyricsResponse) => void, reject: (reason?: unknown) => void) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      console.log(`[sendMessageToActiveTab] 활성 탭 조회:`, tabId);

      if (!tabId) {
        console.error('[background] 활성 탭 ID 없음');
        reject(new Error('No active tab'));
        return;
      }

      console.log(`[sendMessageToActiveTab] content로 메시지 전송 시도 (${tries + 1}/${maxRetries}) - tabId: ${tabId}`);
      chrome.tabs.sendMessage(tabId, msg, (res: GetLatestLyricsResponse) => {
        if (chrome.runtime.lastError) {
          console.warn(`[background] 메시지 전송 실패(${tries + 1}):`, chrome.runtime.lastError.message);
          if (++tries < maxRetries) {
            console.log(`[sendMessageToActiveTab] 재시도 예정...`);
            setTimeout(() => trySend(resolve, reject), 500);
          } else {
            reject(new Error('Could not establish connection'));
          }
          return;
        }
        console.log(`[sendMessageToActiveTab] 전송 성공. 응답:`, res);
        resolve(res);
      });
    });
  }

  return new Promise<GetLatestLyricsResponse>(trySend);
}

// ===== 메시지 처리 =====
chrome.runtime.onMessage.addListener((msg: ExtensionMessage, _sender, sendResponse) => {
  console.log(`[background] onMessage 수신`, msg);

  // 가사 준비 완료 브로드캐스트
  if (msg.type === 'LYRICS_READY') {
    const lyricsLength = Array.isArray(msg.lyrics) ? msg.lyrics.length : 0;
    console.log('[background] LYRICS_READY 수신 - 길이:', lyricsLength);
    chrome.runtime.sendMessage(msg, () => {
      if (chrome.runtime.lastError) {
        // 에러 무시 - 수신자가 없을 수 있음
      }
    });
  }

  // 최신 가사 요청
  if (msg.type === 'GET_LATEST_LYRICS') {
    console.log('[background] GET_LATEST_LYRICS 요청 수신 - content로 중계');

    sendMessageToActiveTab(msg)
      .then((response) => {
        console.log(`[background] GET_LATEST_LYRICS 응답 성공`, response);
        sendResponse(response);
      })
      .catch((err) => {
        console.error(`[background] GET_LATEST_LYRICS 응답 실패`, err);
        sendResponse({ lyrics: [] });
      });
    return true;
  }

  // 가사 오프셋 적용
  if (msg.type === 'APPLY_OFFSET_LYRICS') {
    console.log('[background] APPLY_OFFSET_LYRICS 수신, active tab에 전달');

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) return;

      chrome.tabs.sendMessage(tabId, msg, () => {
        if (chrome.runtime.lastError) {
          console.warn('[background] APPLY_OFFSET_LYRICS 전송 오류:', chrome.runtime.lastError.message);
        } else {
          console.log('[background] APPLY_OFFSET_LYRICS content로 전송 성공');
        }
      });
    });
  }

  // YouTube-LRCLib 캐시 조회 (API 프록시)
  if (msg.type === 'FETCH_YOUTUBE_LRCLIB_CACHE') {
    console.log('[background] FETCH_YOUTUBE_LRCLIB_CACHE 요청 수신 - videoId:', msg.videoId);

    (async () => {
      try {
        const { fetchYouTubeLRCLibCache } = await import('./api/lrclib');
        const result = await fetchYouTubeLRCLibCache(msg.videoId);
        console.log('[background] FETCH_YOUTUBE_LRCLIB_CACHE 응답:', result);
        sendResponse({ success: true, data: result });
      } catch (error) {
        console.error('[background] FETCH_YOUTUBE_LRCLIB_CACHE 실패:', error);
        sendResponse({ success: false, error: String(error) });
      }
    })();

    return true; // 비동기 응답
  }

  // LRCLib ID로 가사 조회 (API 프록시)
  if (msg.type === 'FETCH_LYRICS_BY_ID') {
    console.log('[background] FETCH_LYRICS_BY_ID 요청 수신 - lrclibId:', msg.lrclibId);

    (async () => {
      try {
        const { fetchLyricsById } = await import('./api/lrclib');
        const result = await fetchLyricsById(msg.lrclibId);
        console.log('[background] FETCH_LYRICS_BY_ID 응답:', result ? '성공' : '실패');
        sendResponse({ success: true, data: result });
      } catch (error) {
        console.error('[background] FETCH_LYRICS_BY_ID 실패:', error);
        sendResponse({ success: false, error: String(error) });
      }
    })();

    return true; // 비동기 응답
  }

  // YouTube videoId로 가사 직접 조회 (통합 엔드포인트)
  if (msg.type === 'FETCH_YOUTUBE_LYRICS') {
    console.log('[background] FETCH_YOUTUBE_LYRICS 요청 수신 - videoId:', msg.videoId);

    (async () => {
      try {
        const { fetchYouTubeLyrics } = await import('./api/lrclib');
        const result = await fetchYouTubeLyrics(msg.videoId);
        console.log('[background] FETCH_YOUTUBE_LYRICS 응답:', result ? '성공' : '실패');
        sendResponse({ success: true, data: result });
      } catch (error) {
        console.error('[background] FETCH_YOUTUBE_LYRICS 실패:', error);
        sendResponse({ success: false, error: String(error) });
      }
    })();

    return true; // 비동기 응답
  }

  // YouTube 비디오 메타데이터 조회
  if (msg.type === 'FETCH_YOUTUBE_META') {
    console.log('[background] FETCH_YOUTUBE_META 요청 수신 - videoId:', msg.videoId);

    (async () => {
      try {
        const { fetchYouTubeVideoMeta } = await import('./api/youtube');
        const apiKey = process.env.YOUTUBE_API_KEY;
        if (!apiKey) {
          throw new Error('YouTube API key not configured');
        }
        const result = await fetchYouTubeVideoMeta(msg.videoId, apiKey);
        console.log('[background] FETCH_YOUTUBE_META 응답:', result ? '성공' : '메타데이터 없음');
        sendResponse({ success: true, data: result });
      } catch (error) {
        console.error('[background] FETCH_YOUTUBE_META 실패:', error);
        sendResponse({ success: false, error: String(error) });
      }
    })();

    return true; // 비동기 응답
  }

  // YouTube 플레이리스트 항목 조회
  if (msg.type === 'FETCH_PLAYLIST_ITEMS') {
    console.log('[background] FETCH_PLAYLIST_ITEMS 요청 수신 - playlistId:', msg.playlistId);

    (async () => {
      try {
        const { fetchPlaylistItems } = await import('./api/youtube');
        const apiKey = process.env.YOUTUBE_API_KEY;
        console.log('[background] API 키 확인:', apiKey ? `존재 (길이: ${apiKey.length})` : '없음');
        if (!apiKey) {
          throw new Error('YouTube API key not configured');
        }
        const result = await fetchPlaylistItems(msg.playlistId, apiKey, msg.maxResults);
        console.log('[background] FETCH_PLAYLIST_ITEMS 응답:', result.length, '개 항목');
        sendResponse({ success: true, data: result });
      } catch (error) {
        console.error('[background] FETCH_PLAYLIST_ITEMS 실패:', error);
        sendResponse({ success: false, error: String(error) });
      }
    })();

    return true; // 비동기 응답
  }

  return true;
});

// ===== 확장 프로그램 설치/업데이트 시 content script 재주입 =====
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('[Background] Extension installed');
  } else if (details.reason === 'update') {
    console.log('[Background] Extension updated, reinjecting content scripts to existing tabs...');

    try {
      // 모든 YouTube watch 페이지 탭 찾기
      const tabs = await chrome.tabs.query({ url: 'https://www.youtube.com/watch*' });

      console.log(`[Background] Found ${tabs.length} YouTube watch tabs`);

      for (const tab of tabs) {
        if (tab.id) {
          try {
            // 이미 주입되어 있는지 확인
            const results = await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: () => {
                return (
                  (window as typeof window & { __LYRICS_OVERLAY_INITED?: boolean }).__LYRICS_OVERLAY_INITED === true
                );
              },
            });

            const alreadyInjected = results && results[0] && results[0].result;

            if (alreadyInjected) {
              console.log(`[Background] Tab ${tab.id} already has content script, skipping reinject`);
              continue;
            }

            // Content script 재주입
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['content/content.js'],
            });
            console.log(`[Background] Successfully reinjected content script to tab ${tab.id}`);
          } catch (error) {
            // 탭이 이미 닫혔거나 접근 권한이 없는 경우 무시
            console.warn(`[Background] Failed to reinject to tab ${tab.id}:`, error);
          }
        }
      }

      console.log('[Background] Content script reinjection completed');
    } catch (error) {
      console.error('[Background] Error during content script reinjection:', error);
    }
  }
});

// ===== Service Worker Keep-Alive (Alarms API 사용) =====
/**
 * Service Worker를 활성 상태로 유지하는 함수
 * - Chrome은 30초간 유휴 상태면 Service Worker를 자동으로 종료함
 * - Chrome Alarms API를 사용하여 24초마다 Service Worker를 깨움
 * - setInterval보다 배터리 효율적이고 Chrome이 권장하는 방식
 * - Content Script와의 메시지 통신이 항상 즉시 처리되도록 보장
 */
const KEEP_ALIVE_ALARM = 'keep-alive';

// 24초마다 알람 생성 (30초 타임아웃보다 짧게)
chrome.alarms.create(KEEP_ALIVE_ALARM, {
  periodInMinutes: 0.4, // 0.4분 = 24초
});

// 알람 이벤트 리스너
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === KEEP_ALIVE_ALARM) {
    console.log('[Service Worker] Keep-alive ping');
  }
});
