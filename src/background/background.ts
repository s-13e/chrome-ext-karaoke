import { MESSAGE_TYPES } from '@constants/messageTypes';
import { YOUTUBE_HOST } from '@constants/youtubeSelectors';
import { PATHS } from '@constants/paths';
import { YOUTUBE_CONFIG } from '@constants/platforms';
import { DetectionConfig } from '@lib/types/config';
import { Line } from '@lib/types/lyrics';

const activeTabs = new Set<number>();
let lastInjectedUrl = '';

let timerId: ReturnType<typeof setInterval> | null = null;
let totalSeconds = 0;
let isPlaying = false;

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
// popup 메시지
interface StartTimerMessage {
  type: 'startTimer';
  totalSeconds: number;
}

interface StopTimerMessage {
  type: 'stopTimer';
}

interface GetStatusMessage {
  type: 'getStatus';
}

interface TickMessage {
  type: 'tick';
  totalSeconds: number;
}
interface GetTimerStatusMessage {
  type: 'getTimerStatus';
}

// 확장 메시지 타입 유니온에 포함
type TimerMessage = StartTimerMessage | StopTimerMessage | GetStatusMessage | TickMessage | GetTimerStatusMessage;

// 확장에서 쓰는 모든 메시지 타입 유니온
export type ExtensionMessage =
  | LyricsReadyMessage
  | GetLatestLyricsMessage
  | SetOffsetMessage
  | ApplyOffsetLyricsMessage
  | TimerMessage;

// ===== 1. 초기 로드 감지 =====
chrome.webNavigation.onCompleted.addListener(
  (details) => injectContentScript(details.tabId, details.url, YOUTUBE_CONFIG),
  { url: [{ hostSuffix: YOUTUBE_HOST }] },
);

// ===== 2. SPA 네비게이션 감지 =====
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

// ===== 3. 스크립트 주입 =====
const injectContentScript = (tabId: number, url: string, config: DetectionConfig) => {
  // ✅ 이미 주입된 탭 체크
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
};

// 탭 닫힘 시 상태 제거
chrome.tabs.onRemoved.addListener((tabId) => {
  activeTabs.delete(tabId);
});

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

// ===== 4. 메시지 중계 로직 =====
chrome.runtime.onMessage.addListener((msg: ExtensionMessage, _sender, sendResponse) => {
  console.log(`[background] onMessage 수신`, msg);

  // --- LYRICS_READY: content → background → 모든 context 방송 ---
  if (msg.type === 'LYRICS_READY') {
    const lyricsLength = Array.isArray(msg.lyrics) ? msg.lyrics.length : 0;
    console.log('[background] LYRICS_READY 수신 - 길이:', lyricsLength);
    // MainMenu, popup, 같은 탭의 다른 content 등 모든 컨텍스트로 전달
    chrome.runtime.sendMessage(msg, () => {
      if (chrome.runtime.lastError) {
        // 에러 무시 - 수신자가 없을 수 있음
      }
    });
  }

  // --- GET_LATEST_LYRICS: MainMenu(또는 popup) → background → content ---
  if (msg.type === 'GET_LATEST_LYRICS') {
    console.log('[background] GET_LATEST_LYRICS 요청 수신 - content로 중계');

    sendMessageToActiveTab(msg)
      .then((response) => {
        console.log(`[background] GET_LATEST_LYRICS 응답 성공`, response);
        sendResponse(response); // 성공 응답
      })
      .catch((err) => {
        console.error(`[background] GET_LATEST_LYRICS 응답 실패`, err);
        sendResponse({ lyrics: [] }); // 실패 시 빈 배열 응답
      });
    return true; // 비동기 응답 유지!
  }

  // --- APPLY_OFFSET_LYRICS: popup/메뉴 → background → content ---
  if (msg.type === 'APPLY_OFFSET_LYRICS') {
    console.log('[background] APPLY_OFFSET_LYRICS 수신, active tab에 전달');

    // 현재 활성 탭에 보내기
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

    // 필요시 다른 context에도 전달 가능
  }
  // --- popup 타이머 기능
  if (msg.type === 'startTimer') {
    totalSeconds = msg.totalSeconds;
    isPlaying = true;
    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => {
      if (totalSeconds <= 0) {
        clearInterval(timerId!);
        isPlaying = false;
      } else {
        totalSeconds--;
        chrome.runtime.sendMessage({ type: 'tick', totalSeconds }, () => {
          if (chrome.runtime.lastError) {
            // 에러 무시 - 수신자가 없을 수 있음
          }
        });
      }
    }, 1000);
    sendResponse({ status: 'started' });
  } else if (msg.type === 'stopTimer') {
    if (timerId) clearInterval(timerId);
    isPlaying = false;
    sendResponse({ status: 'stopped' });
  } else if (msg.type === 'getStatus') {
    sendResponse({ totalSeconds, isPlaying });
  }

  if (msg.type === 'getTimerStatus') {
    // background 스크립트가 관리하는 현재 타이머 상태를 반환
    sendResponse({ isPlaying, totalSeconds });
    return true; // 비동기 응답 유지
  }

  return true;
});
