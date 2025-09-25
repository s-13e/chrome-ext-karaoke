import { MESSAGE_TYPES } from '@constants/messageTypes';
import { YOUTUBE_HOST } from '@constants/youtubeSelectors';
import { PATHS } from '@constants/paths';
import { YOUTUBE_CONFIG } from '@constants/platforms';
import { DetectionConfig } from '@lib/types/config';
import { Line } from '@lib/types/lyrics';

// ===== 전역 변수 및 상태 =====
const activeTabs = new Set<number>();
let lastInjectedUrl = '';

// 타이머 상태 관리
interface TimerState {
  startTime?: number; // 타이머 시작 시각 (Date.now())
  duration: number; // 총 지속 시간 (초)
  isActive: boolean;
}

const timerState: TimerState = {
  duration: 0,
  isActive: false,
};

let badgeUpdateInterval: ReturnType<typeof setInterval> | null = null;

// ===== 타이머 배지 관리 =====
function updateBadge() {
  const currentTime = Date.now();

  if (timerState.isActive && timerState.startTime) {
    const elapsedSeconds = Math.floor((currentTime - timerState.startTime) / 1000);
    const remainingSeconds = Math.max(0, timerState.duration - elapsedSeconds);

    if (remainingSeconds <= 0) {
      // 타이머 완료
      timerState.isActive = false;
      timerState.startTime = undefined;
      chrome.action.setBadgeText({ text: '✓' });
      chrome.action.setBadgeBackgroundColor({ color: '#28a745' });

      // 배지 업데이트 중지
      if (badgeUpdateInterval) {
        clearInterval(badgeUpdateInterval);
        badgeUpdateInterval = null;
      }

      // 3초 후 배지 초기화
      setTimeout(() => {
        chrome.action.setBadgeText({ text: '' });
      }, 3000);

      return;
    }

    // 남은 시간을 hh:mm 형태로 표시
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const badgeText = hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}` : `${minutes}m`;

    // 남은 시간에 따른 배지 색상 변경
    let badgeColor: string;
    if (remainingSeconds < 60) {
      badgeColor = '#dc3545'; // 빨간색 - 1분 미만 (긴급)
    } else if (remainingSeconds < 300) {
      badgeColor = '#fd7e14'; // 주황색 - 5분 미만 (주의)
    } else {
      badgeColor = '#007bff'; // 파란색 - 일반 상태 (여유)
    }

    chrome.action.setBadgeText({ text: badgeText });
    chrome.action.setBadgeBackgroundColor({ color: badgeColor });
    chrome.action.setBadgeTextColor({ color: '#ffffff' });
  } else {
    // 타이머 비활성 상태
    chrome.action.setBadgeText({ text: '' });
  }
}

function startBadgeUpdate() {
  if (badgeUpdateInterval) {
    clearInterval(badgeUpdateInterval);
  }

  updateBadge(); // 즉시 업데이트
  badgeUpdateInterval = setInterval(updateBadge, 1000);
}

function stopBadgeUpdate() {
  if (badgeUpdateInterval) {
    clearInterval(badgeUpdateInterval);
    badgeUpdateInterval = null;
  }
  updateBadge(); // 마지막 상태 반영
}

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

interface GetTimerStateMessage {
  type: 'getTimerState';
}

interface GetTimerStatusMessage {
  type: 'getTimerStatus';
}

interface TickMessage {
  type: 'tick';
  totalSeconds: number;
}

type TimerMessage =
  | StartTimerMessage
  | StopTimerMessage
  | GetStatusMessage
  | GetTimerStateMessage
  | GetTimerStatusMessage
  | TickMessage;

export type ExtensionMessage =
  | LyricsReadyMessage
  | GetLatestLyricsMessage
  | SetOffsetMessage
  | ApplyOffsetLyricsMessage
  | TimerMessage;

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

  // 타이머 시작
  if (msg.type === 'startTimer') {
    timerState.startTime = Date.now();
    timerState.duration = msg.totalSeconds;
    timerState.isActive = true;

    startBadgeUpdate();

    console.log('[background] 타이머 시작:', { duration: msg.totalSeconds, startTime: timerState.startTime });
    sendResponse({ status: 'started' });
  }

  // 타이머 정지
  if (msg.type === 'stopTimer') {
    timerState.isActive = false;
    timerState.startTime = undefined;

    stopBadgeUpdate();

    console.log('[background] 타이머 정지');
    sendResponse({ status: 'stopped' });
  }

  // 타이머 상태 조회
  if (msg.type === 'getTimerState') {
    const currentTime = Date.now();
    let remainingSeconds = 0;

    if (timerState.isActive && timerState.startTime) {
      const elapsedSeconds = Math.floor((currentTime - timerState.startTime) / 1000);
      remainingSeconds = Math.max(0, timerState.duration - elapsedSeconds);

      if (remainingSeconds <= 0) {
        timerState.isActive = false;
        timerState.startTime = undefined;
      }
    }

    sendResponse({
      isActive: timerState.isActive,
      remainingSeconds,
      totalDuration: timerState.duration,
    });
    return true;
  }

  // 레거시 상태 조회 (하위 호환성)
  if (msg.type === 'getStatus') {
    const currentTime = Date.now();
    let remainingSeconds = 0;

    if (timerState.isActive && timerState.startTime) {
      const elapsedSeconds = Math.floor((currentTime - timerState.startTime) / 1000);
      remainingSeconds = Math.max(0, timerState.duration - elapsedSeconds);
    }

    sendResponse({
      totalSeconds: remainingSeconds,
      isPlaying: timerState.isActive,
    });
  }

  return true;
});
