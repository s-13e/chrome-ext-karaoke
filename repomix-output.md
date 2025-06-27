This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
background/api/genius.ts
background/background.ts
components/common/ErrorFallback.tsx
components/common/LoadingOverlay.tsx
constants/api.ts
constants/doomIds.ts
constants/errorCodes.ts
constants/errorMessages.ts
constants/languages.ts
constants/messageTypes.ts
constants/paths.ts
constants/storageKeys.ts
constants/time.ts
constants/youtubeSelectors.ts
content/App.tsx
content/components/LyricsContainer.tsx
content/components/SyncSubtitle.tsx
content/index.tsx
hooks/useChromeStorage.ts
hooks/useLangLoader.ts
lib/types/errors.ts
lib/types/i18next.d.ts
lib/types/message.ts
lib/types/translationKeys.ts
lib/utils/common.ts
lib/utils/time.ts
lib/utils/typeGuards.ts
lib/youtube.ts
locales/en.json
locales/ko.json
options/App.tsx
options/index.tsx
options/Options.css
options/options.html
payment/pay.txt
popup/App.tsx
popup/index.tsx
popup/popup.css
popup/popup.html
services/i18n.ts
styles/GlobalStyle.ts
```

# Files

## File: background/api/genius.ts
```typescript
import { GENIUS_API_URL } from '@constants/api';

export const fetchGeniusLyrics = async (title: string): Promise<string> => {
  console.log('[GENIUS] 가사 요청 시작', { title });
  const searchUrl = `${GENIUS_API_URL}/search?q=${encodeURIComponent(title)}`;
  const headers = {
    Authorization: `Bearer ${process.env.GENIUS_ACCESS_TOKEN}`,
  };

  // 1. 검색을 통해 트랙 ID 획득
  const searchRes = await fetch(searchUrl, { headers });
  const searchData = await searchRes.json();
  const trackId = searchData.response.hits[0]?.result.id;

  if (!trackId) throw new Error('No lyrics found');

  // 2. 트랙 ID로 가사 조회
  const lyricsUrl = `${GENIUS_API_URL}/songs/${trackId}`;
  const lyricsRes = await fetch(lyricsUrl, { headers });
  const lyricsData = await lyricsRes.json();

  return lyricsData.response.song.lyrics;
};
```

## File: background/background.ts
```typescript
import { MESSAGE_TYPES } from '@constants/messageTypes';
import { fetchGeniusLyrics } from './api/genius';
import { YOUTUBE_HOST, YOUTUBE_REGEX } from '@constants/youtubeSelectors';
import { PATHS } from '@constants/paths';


interface DetectionConfig {
  hostSuffix: string;
  urlRegex: RegExp;
}

const YOUTUBE_CONFIG: DetectionConfig = {
  hostSuffix: YOUTUBE_HOST,
  urlRegex: YOUTUBE_REGEX,
};

const activeTabs = new Set<number>();
let lastInjectedUrl = '';

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed!');
});

// 초기 로드 감지
chrome.webNavigation.onCompleted.addListener(
  (details) => injectContentScript(details.tabId, details.url, YOUTUBE_CONFIG),
  { url: [{ hostSuffix: YOUTUBE_HOST }] }
);

// SPA 네비게이션 감지
chrome.webNavigation.onHistoryStateUpdated.addListener(
  (details) => injectContentScript(details.tabId, details.url, YOUTUBE_CONFIG),
  { url: [{ hostSuffix: YOUTUBE_HOST }] }
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


// 탭 닫힘 시 상태 제거
chrome.tabs.onRemoved.addListener((tabId) => {
  activeTabs.delete(tabId);
});
```

## File: components/common/ErrorFallback.tsx
```typescript
import { FallbackProps } from 'react-error-boundary';

export function ErrorFallback({
  error,
  resetErrorBoundary, // 필수 프로퍼티 추가
}: FallbackProps) {
  return (
    <div>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>재시도</button>
    </div>
  );
}
```

## File: components/common/LoadingOverlay.tsx
```typescript
// src/components/common/LoadingOverlay.tsx
import styled from '@emotion/styled';
import React from 'react';

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export const LoadingOverlay = React.memo(() => (
  <Container role="alert" aria-live="polite">
    <Spinner />
    <span className="visually-hidden">로딩 중입니다</span>
  </Container>
));
LoadingOverlay.displayName = 'LoadingOverlay';
```

## File: constants/api.ts
```typescript
// src/constants/api.ts
export const GENIUS_API_URL = 'https://api.genius.com';
```

## File: constants/doomIds.ts
```typescript
export const DOM_IDS = {
  ROOT_CONTAINER: 'chrome-extension-root',
  LYRICS_CONTAINER: 'lyrics-root',
} as const;
```

## File: constants/errorCodes.ts
```typescript
// src/constants/errorCodes.ts
export const ERROR_CODES = {
  NETWORK_FAILURE: 1001,
  AUTH_EXPIRED: 2001,
  RATE_LIMIT: 3001,
} as const;
```

## File: constants/errorMessages.ts
```typescript
export const ERROR_MESSAGES = {
  LYRIC_FETCH_FAILED: '가사 조회 실패',
  VIDEO_DETECTION_FAILED: '영상 감지 실패',
  INJECTION_FAILED: '스크립트 주입 실패',
} as const;
```

## File: constants/languages.ts
```typescript
// 언어 관련 상수
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
export const SUPPORTED_LANGUAGES = ['en', 'ko'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const MAX_RETRIES = 3;
export const INITIAL_DELAY = 1000; // 1초

export const NATIVE_LANGUAGE_NAMES = {
  en: 'English',
  ko: '한국어',
} as const;

// i18next 네임스페이스
export const I18N_NAMESPACE = 'translation' as const;
```

## File: constants/messageTypes.ts
```typescript
export const MESSAGE_TYPES = {
  TOGGLE_CONTENT: 'TOGGLE_CONTENT',
  LANGUAGE_CHANGED: 'LANGUAGE_CHANGED',
  VIDEO_DETECTED: 'VIDEO_DETECTED',
  LYRICS_DATA: 'LYRICS_DATA',
  NO_LYRICS_FOUND: 'NO_LYRICS_FOUND',
  SPA_NAVIGATION_DETECTED: 'SPA_NAVIGATION_DETECTED',
} as const;

export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];
```

## File: constants/paths.ts
```typescript
export const PATHS = {
  CONTENT_SCRIPT: 'content/content.js',
  OPTIONS_HTML: 'options.html',
  ICON_SETTING: '@assets/icons/setting.png',
};
```

## File: constants/storageKeys.ts
```typescript
export const STORAGE_KEYS = {
  CONTENT_ENABLED: 'contentEnabled',
  LANGUAGE: 'language',
  LAST_VIDEO_ID: 'lastVideoId',
} as const;
```

## File: constants/time.ts
```typescript
export const DEBOUNCE_DELAY = 1000; // ms
export const SYNC_OFFSET_THRESHOLD = 0.5; // seconds
export const EXECUTION_COOLDOWN = 10000; // 10초
```

## File: constants/youtubeSelectors.ts
```typescript
// constants/youtubeSelectors.ts
export const YOUTUBE_HOST = 'youtube.com';

export const YOUTUBE_PLAYER_SELECTOR = '#movie_player';
export const YOUTUBE_PLAYER_CONTAINER = 'ytd-player';
export const YOUTUBE_VIDEO_SELECTOR = 'video.html5-main-video';
export const YOUTUBE_AD_SELECTOR = '.ad-showing, .ad-interrupting';

// 유튜브 URL 관련 상수
export const YOUTUBE_WATCH_PATH = '/watch';
export const YOUTUBE_VIDEO_ID_PARAM = 'v';

// DOM 선택자 관련 상수
export const YOUTUBE_TITLE_SELECTOR = 'h1.ytd-watch-metadata > yt-formatted-string';

export const YOUTUBE_REGEX = /youtube\.com\/watch\?v=[\w-]{11}/;
```

## File: content/App.tsx
```typescript
// src/content/App.tsx
import { useEffect } from 'react';
import { i18nInstance } from '@services/i18n';
import { isToggleContentMessage } from '@lib/utils/typeGuards';
import { ContentScriptMessage } from '@lib/types/message';
import { STORAGE_KEYS } from '@constants/storageKeys';
// import { LyricsContainer } from './components/LyricsContainer';

export function App() {
  useEffect(() => {
    console.log('[Content] Setting up storage listener');

    const handleStorageChange = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes[STORAGE_KEYS.LANGUAGE]?.newValue) {
        const newLang = changes[STORAGE_KEYS.LANGUAGE]?.newValue;
        console.log(`[Content] Storage change detected: ${newLang}`);

        // ✅ 실제 언어 변경 적용
        if (i18nInstance.language !== newLang) {
          console.log(`[Content] Changing language: ${i18nInstance.language} -> ${newLang}`);
          i18nInstance.changeLanguage(newLang);
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  useEffect(() => {
    // 콘텐츠 제어 함수
    const updateContent = (enabled: boolean) => {
      console.log(enabled ? '콘텐츠 활성화' : '콘텐츠 비활성화');
    };
    // 언어 변경 감지 리스너
    const handleLanguageChange = () => {
      console.log('Language changed to:', i18nInstance.language);
    };

    // 1. 초기 상태 불러오기
    chrome.storage.sync.get(STORAGE_KEYS.CONTENT_ENABLED, (result) => {
      updateContent(result.contentEnabled ?? false);
    });

    // 2. 메시지 리스너 등록
    const messageListener = (request: ContentScriptMessage) => {
      if (isToggleContentMessage(request)) {
        updateContent(request.enabled); // ✅ 정확한 타입 추론
      }
    };

    i18nInstance.on('languageChanged', handleLanguageChange);
    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      i18nInstance.off('languageChanged', handleLanguageChange);
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  return null;
}
```

## File: content/components/LyricsContainer.tsx
```typescript
import React, { useEffect, useState } from 'react';
import { SyncSubtitle } from './SyncSubtitle';
import { createRoot } from 'react-dom/client';

export const LyricsContainer: React.FC<{ lyrics: string }> = ({ lyrics }) => {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const video = document.querySelector('video');
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    video.addEventListener('timeupdate', updateTime);

    return () => video.removeEventListener('timeupdate', updateTime);
  }, []);

  return (
    <div className="lyrics-container">
      <SyncSubtitle lyrics={lyrics} currentTime={currentTime} />
    </div>
  );
};

// DOM에 컨테이너 초기화
export const initLyricsContainer = (data: { lyrics: string }) => {
  let container = document.getElementById('lyrics-root');
  if (!container) {
    container = document.createElement('div');
    container.id = 'lyrics-root';
    document.body.appendChild(container);
  }

  const root = createRoot(container);
  root.render(<LyricsContainer lyrics={data.lyrics} />);
};
```

## File: content/components/SyncSubtitle.tsx
```typescript
import React from 'react';
import { parseTimeToSeconds } from '@lib/utils/time';

// 가사 파싱 인터페이스
interface LyricLine {
  time: number;
  text: string;
}

export const SyncSubtitle: React.FC<{
  lyrics: string;
  currentTime: number;
}> = ({ lyrics, currentTime }) => {
  // 가사 파싱
  const parsedLyrics: LyricLine[] = lyrics.split('\n').reduce<LyricLine[]>((acc, line) => {
    const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
    if (!match) return acc;

    const [, min, sec, text] = match;
    // text가 undefined일 경우 빈 문자열로 대체
    const safeText = (text ?? '').trim();
    if (safeText === '') return acc; // 빈 줄은 제외

    const time = parseTimeToSeconds(`${min}:${sec}`);
    acc.push({ time, text: safeText });
    return acc;
  }, []);

  // 현재 시간에 해당하는 가사 찾기
  const currentLineIndex = parsedLyrics.findIndex((line, index) => {
    const nextLine = parsedLyrics[index + 1];
    return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
  });

  return (
    <div className="subtitle-display">
      {currentLineIndex >= 0 && parsedLyrics[currentLineIndex] && (
        <div className="current-line">{parsedLyrics[currentLineIndex].text}</div>
      )}
    </div>
  );
};
```

## File: content/index.tsx
```typescript
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

// 타입 명시적 정의
interface DetectionController {
  spaObserver: MutationObserver | null;
  videoDetection: (() => void) | null;
}

let detectionController: DetectionController = {
  spaObserver: null,
  videoDetection: null,
};

// 영상 감지 핸들러 (순수 로직)
const handleVideoDetection = () => {
  const videoData = detectYouTubeVideo();
  if (!videoData) return;

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
  if (message.type === MESSAGE_TYPES.SPA_NAVIGATION_DETECTED && detectionController.videoDetection) {
    detectionController.videoDetection();
  }
});
```

## File: hooks/useChromeStorage.ts
```typescript
// src/hooks/useChromeStorage.ts
import { useState, useEffect } from 'react';

export function useChromeStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  // 저장된 값 불러오기
  useEffect(() => {
    chrome.storage.sync.get([key], (result) => {
      const storedValue = result[key] ?? defaultValue;
      setValue(storedValue);
      setIsLoading(false);
    });
  }, [key, defaultValue]);

  // 값 저장하기
  const setStoredValue = (newValue: T) => {
    setValue(newValue);
    chrome.storage.sync.set({ [key]: newValue });
  };

  return [value, setStoredValue, isLoading] as const;
}
```

## File: hooks/useLangLoader.ts
```typescript
// src/hooks/useLangLoader.ts
import { useEffect, useState } from 'react';
import { i18nInstance } from '@services/i18n';
import { I18nError } from '@lib/types/errors';

type I18nStatus = {
  phase: 'idle' | 'initializing' | 'ready' | 'error';
  error?: I18nError;
  retryCount: number;
};
export const useLangLoader = (): I18nStatus => {
  const [status, setStatus] = useState<I18nStatus>({
    phase: i18nInstance.isInitialized ? 'ready' : 'idle',
    retryCount: 0,
  });

  useEffect(() => {
    const handlers = {
      initialized: () => setStatus({ phase: 'ready', retryCount: 0 }),
      failed: (error: I18nError) =>
        setStatus((prev) => ({
          phase: 'error',
          error,
          retryCount: prev.retryCount + 1,
        })),
    };

    i18nInstance.on('initialized', handlers.initialized);
    i18nInstance.on('failed', handlers.failed);

    return () => {
      i18nInstance.off('initialized', handlers.initialized);
      i18nInstance.off('failed', handlers.failed);
    };
  }, []);

  return status;
};
```

## File: lib/types/errors.ts
```typescript
// src/types/errors.ts
export class ResourceLoadError extends Error {
  constructor(public readonly language: string) {
    super(`리소스 로드 실패: ${language}`);
    this.name = 'ResourceLoadError';
  }
}

export class I18nError extends Error {
  constructor(
    public readonly code: 'TRANSIENT' | 'PERMANENT',
    message: string,
  ) {
    super(message);
    this.name = 'I18nError';
    Object.setPrototypeOf(this, I18nError.prototype);
  }
}

// 타입 가드 함수 추가
export function isI18nError(error: unknown): error is I18nError {
  return error instanceof I18nError;
}
```

## File: lib/types/i18next.d.ts
```typescript
// src/types/i18next.d.ts
import 'i18next';

declare module 'i18next' {
  interface CustomTypeOptions {
    returnNull: false;
    resources: typeof import('@locales/en.json');
  }

  interface i18n {
    initializePromise?: Promise<boolean>;
  }
}
```

## File: lib/types/message.ts
```typescript
// types/message.ts
import { MESSAGE_TYPES } from '@constants/messageTypes';

export type ToggleContentMessage = {
  type: typeof MESSAGE_TYPES.TOGGLE_CONTENT;
  enabled: boolean;
};

// 2. 확장 가능한 유니온 타입
export type ContentScriptMessage = ToggleContentMessage;
// | AnotherMessageType
```

## File: lib/types/translationKeys.ts
```typescript
// types/translationKeys.ts
export const TRANSLATION_KEYS = ['extName', 'extDescription', 'extLanguage'] as const;

export type TranslationKey = (typeof TRANSLATION_KEYS)[number];
```

## File: lib/utils/common.ts
```typescript
// 디바운싱
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// 스로틀링
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      func(...args);
      lastCall = now;
    }
  };
};
```

## File: lib/utils/time.ts
```typescript
/**
 * 시간 문자열 파싱 (MM:SS.ms → 초 단위)
 * @param timeStr - [분:초.밀리초] 형식 문자열
 * @returns 초 단위 시간 (파싱 실패 시 0 반환)
 */
export const parseTimeToSeconds = (timeStr: string): number => {
  const parts = timeStr.split(':');

  // 파트 검증 및 기본값 설정
  const minutesStr = parts[0] || '0';
  const secondsStr = parts[1]?.split('.')[0] || '0'; // 밀리초 제거

  const minutes = parseFloat(minutesStr);
  const seconds = parseFloat(secondsStr);

  // 유효성 검사
  if (isNaN(minutes) || isNaN(seconds)) return 0;

  return minutes * 60 + seconds;
};

/**
 * 초 단위 시간을 [MM:SS] 형식으로 변환
 * @param seconds - 초 단위 시간
 * @returns 포맷된 문자열 (예: "03:45")
 */
export const formatSecondsToTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * 싱크 오차 보정 (±500ms 이내 조정)
 * @param currentTime - 현재 시간
 * @param targetTime - 목표 시간
 * @returns 보정된 시간
 */
export const adjustSyncOffset = (currentTime: number, targetTime: number): number => {
  return Math.abs(targetTime - currentTime) <= 0.5 ? targetTime : currentTime;
};
```

## File: lib/utils/typeGuards.ts
```typescript
// src/utils/typeGuards.ts
import { ToggleContentMessage } from '@lib/types/message';
import { MESSAGE_TYPES } from '@constants/messageTypes';

export const isToggleContentMessage = (request: { type: string }): request is ToggleContentMessage => {
  return request.type === MESSAGE_TYPES.TOGGLE_CONTENT;
};
// 배열 타입 검사
// 고급 버전 (타입 안전성 극대화)
export const isArrayOfType = <T>(arr: unknown, guard: (item: unknown) => item is T): arr is T[] => {
  if (!Array.isArray(arr)) return false;

  // 타입 가드가 모든 요소를 검사하도록 강제
  for (const item of arr) {
    if (!guard(item)) return false;
  }
  return true;
};
```

## File: lib/youtube.ts
```typescript
import { YOUTUBE_TITLE_SELECTOR, YOUTUBE_VIDEO_ID_PARAM, YOUTUBE_WATCH_PATH } from '@constants/youtubeSelectors';

// 유튜브 영상 감지 및 메타데이터 추출
export const detectYouTubeVideo = (): { videoId: string; title: string } | null => {
  if (!location.pathname.includes(YOUTUBE_WATCH_PATH)) return null;

  const urlParams = new URLSearchParams(location.search);
  const videoId = urlParams.get(YOUTUBE_VIDEO_ID_PARAM);
  const titleElement = document.querySelector(YOUTUBE_TITLE_SELECTOR) as HTMLHeadingElement;

  return videoId && titleElement
    ? {
        videoId,
        title: titleElement.innerText.trim(),
      }
    : null;
};

// SPA 네비게이션 대응
export const setupSPAObserver = (callback: () => void): MutationObserver => {
  const observer = new MutationObserver(() => {
    if (detectYouTubeVideo()) callback();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true
  });

  return observer; // MutationObserver 반환
};
```

## File: locales/en.json
```json
{
  "extName": "Youtube Karaoke",
  "extDescription": "jot that down description",
  "extLanguage": "Language"
}
```

## File: locales/ko.json
```json
{
  "extName": "유튜브 노래방",
  "extDescription": "앱 설명",
  "extLanguage": "언어"
}
```

## File: options/App.tsx
```typescript
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLangLoader } from '@hooks/useLangLoader';
import { ErrorFallback } from '@components/common/ErrorFallback';
import { LoadingOverlay } from '@components/common/LoadingOverlay';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, SupportedLanguage, NATIVE_LANGUAGE_NAMES } from '@constants/languages';
import { syncLanguage } from '@services/i18n';
import { MESSAGE_TYPES } from '@constants/messageTypes';
import { STORAGE_KEYS } from '@constants/storageKeys';

export function App() {
  const { t, i18n } = useTranslation();
  const { phase, error } = useLangLoader();
  const [isChanging, setIsChanging] = React.useState(false);
  const [currentLang, setCurrentLang] = React.useState<SupportedLanguage>(DEFAULT_LANGUAGE);

  // ✅ i18n이 준비된 후 현재 언어 상태 동기화
  React.useEffect(() => {
    console.log(`[Options] i18n phase: ${phase}, current language: ${i18n.language}`);
    if (phase === 'ready' && i18n.language) {
      console.log(`[Options] Setting currentLang to: ${i18n.language}`);
      setCurrentLang(i18n.language as SupportedLanguage);
    }
  }, [phase, i18n.language]);

  // 상태별 UI 처리
  if (phase === 'error') return <ErrorFallback error={error!} resetErrorBoundary={() => window.location.reload()} />;
  if (phase !== 'ready') return null;

  // 언어 변경 핸들러 (실시간 반영 강화)
  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as SupportedLanguage;
    console.log(`[Options] Language change requested: ${newLang}`);

    try {
      console.log('handleChange 핸들러 실행');
      setIsChanging(true);
      setCurrentLang(newLang); // 즉시 UI 업데이트

      await chrome.storage.sync.set({ [STORAGE_KEYS.LANGUAGE]: newLang });
      await syncLanguage(newLang);

      // 3. 다른 컨텍스트에 메시지 전송
      chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.LANGUAGE_CHANGED,
        language: newLang,
      });
    } catch (error) {
      console.error('Language change failed:', error);
      setCurrentLang(i18n.language as SupportedLanguage); // 롤백
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="language-selector">
      <h2>{t('extLanguage')}</h2>
      <select value={currentLang} onChange={handleChange} disabled={isChanging} aria-busy={isChanging}>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {NATIVE_LANGUAGE_NAMES[lang]}
          </option>
        ))}
      </select>
      {isChanging && <LoadingOverlay />}
    </div>
  );
}
```

## File: options/index.tsx
```typescript
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { I18nextProvider } from 'react-i18next';
import { initializeI18n, i18nInstance } from '@services/i18n';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@components/common/ErrorFallback';
import { LoadingOverlay } from '@components/common/LoadingOverlay';
import 'normalize.css';

const root = document.getElementById('root');
if (root) {
  initializeI18n()
    .then((initSuccess) => {
      createRoot(root).render(
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <I18nextProvider i18n={i18nInstance}>{initSuccess ? <App /> : <LoadingOverlay />}</I18nextProvider>
        </ErrorBoundary>,
      );
    })
    .catch((error) => {
      // ✅ error 객체 받기
      createRoot(root).render(
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <I18nextProvider i18n={i18nInstance}>
            <App /> {/* ✅ 의도적으로 에러 발생 */}
          </I18nextProvider>
        </ErrorBoundary>,
      );
      throw error; // ✅ 에러 바운더리가 포착하도록 throw
    });
}
```

## File: options/Options.css
```css
.custom-select {
  border: none;
  background: transparent;
  font-size: 1rem;
  padding: 4px 8px;
  outline: none;
  /* 필요하다면 width, color 등도 추가 */
}
css
/* 팝업, 옵션 공통 CSS */
body:not([data-lang-loaded]) {
  opacity: 0;
}

body[data-lang-loaded] {
  opacity: 1;
  transition: opacity 0.3s;
}
```

## File: options/options.html
```html
<!-- options.html -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Options</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

## File: payment/pay.txt
```
나중에 하셈.
ExtensionPay 로 구현할 예정
추후 사용자 모이면 그때 구현 시도해보기
```

## File: popup/App.tsx
```typescript
// poup/App.tsx
import React, { useEffect } from 'react';
import { useLangLoader } from '@hooks/useLangLoader';
import { useTranslation } from 'react-i18next';
import { useChromeStorage } from '@hooks/useChromeStorage';
import { MESSAGE_TYPES } from '@constants/messageTypes';
import { ErrorFallback } from '@components/common/ErrorFallback';
import { LoadingOverlay } from '@components/common/LoadingOverlay';
import './popup.css';
import { STORAGE_KEYS } from '@constants/storageKeys';

interface LanguageChangeMessage {
  type: typeof MESSAGE_TYPES.LANGUAGE_CHANGED;
  language: string;
}
export function App() {
  const { t, i18n } = useTranslation();
  const { phase } = useLangLoader();
  const [enabled, setEnabled] = useChromeStorage(STORAGE_KEYS.CONTENT_ENABLED, false);

  useEffect(() => {
    console.log('[Popup] Setting up language listeners');

    // ✅ 스토리지 변경과 메시지 둘 다 처리
    const handleStorageChange = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes[STORAGE_KEYS.LANGUAGE]?.newValue) {
        const newLang = changes[STORAGE_KEYS.LANGUAGE]?.newValue;
        console.log(`[Popup] Storage change detected: ${newLang}`);

        if (i18n.language !== newLang) {
          console.log(`[Popup] Changing language: ${i18n.language} -> ${newLang}`);
          i18n.changeLanguage(newLang);
        }
      }
    };

    const handleMessage = (message: LanguageChangeMessage) => {
      console.log('[Popup] Received message:', message);
      if (message.type === MESSAGE_TYPES.LANGUAGE_CHANGED && message.language) {
        console.log(`[Popup] Language change message: ${message.language}`);
        if (i18n.language !== message.language) {
          i18n.changeLanguage(message.language);
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [i18n]);

  if (phase === 'error')
    return (
      <ErrorFallback
        error={undefined}
        resetErrorBoundary={function (): void {
          throw new Error('Function not implemented.');
        }}
      />
    );
  if (phase !== 'ready') return <LoadingOverlay />;

  // 설정 버튼 클릭 시 옵션 페이지 열기
  const handleOpenOptions = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      // 구버전 브라우저 호환
      window.open(chrome.runtime.getURL('options.html'));
    }
  };
  // 스위치 상태 변경 핸들러
  const handleToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setEnabled(newValue);

    // 현재 활성 탭에 메시지 전송
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id)
        chrome.tabs.sendMessage(tabs[0].id, {
          type: MESSAGE_TYPES.TOGGLE_CONTENT,
          enabled: newValue,
        });
    });
  };

  return (
    <div>
      <div className="popup-header">
        <h2>{t('extName')}</h2>
        <button id="go-to-options" className="icon-button" onClick={handleOpenOptions}>
          <img src="../assets/icons/setting.png" alt="설정" width={24} height={24} />
        </button>
      </div>
      <div>
        <label className="switch">
          <input type="checkbox" checked={enabled} onChange={handleToggle} />
          <span className="slider"></span>
        </label>
      </div>
    </div>
  );
}
```

## File: popup/index.tsx
```typescript
// src/content/index.tsx
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { i18nInstance, initializeI18n } from '@services/i18n';
import 'normalize.css';
import { ErrorBoundary } from 'react-error-boundary';
import { I18nextProvider } from 'react-i18next';
import { ErrorFallback } from '@components/common/ErrorFallback';

const root = document.getElementById('root');
if (root) {
  const handleReset = () => {
    window.location.reload(); // 페이지 새로고침으로 초기화
  };
  initializeI18n()
    .then(() => {
      createRoot(root).render(
        <ErrorBoundary FallbackComponent={ErrorFallback} onReset={handleReset}>
          <I18nextProvider i18n={i18nInstance}>
            <App />
          </I18nextProvider>
        </ErrorBoundary>,
      );
    })
    .catch((error) => {
      createRoot(root).render(
        <ErrorFallback
          error={error}
          resetErrorBoundary={handleReset} // 리셋 함수 전달
        />,
      );
    });
}
```

## File: popup/popup.css
```css
body {
  width: 300px;
  height: 500px;
  padding: 10px;
}
.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 또는 button에 margin-left: auto */
}
.icon-button {
  background: transparent;
  border: none;
  cursor: pointer;           /* 마우스 오버 시 포인터 */
  outline: none;             /* 포커스 테두리 제거 (접근성 필요시 조정) */
  display: inline-flex;      /* 아이콘 정렬에 유리 */
  align-items: center;
  justify-content: center;
}
/* switch button */
.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
}
.switch input { display: none; }
.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #ccc;
  border-radius: 22px;
  transition: .4s;
}
.slider:before {
  position: absolute;
  content: "";
  height: 18px; width: 18px;
  left: 2px; bottom: 2px;
  background-color: white;
  border-radius: 50%;
  transition: .4s;
}
input:checked + .slider {
  background-color: #2196F3;
}
input:checked + .slider:before {
  transform: translateX(18px);
}
```

## File: popup/popup.html
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body>
    <div id="root"></div>
</body>
</html>
```

## File: services/i18n.ts
```typescript
// src/services/i18n.ts
import i18next, { InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { I18nError, ResourceLoadError } from '@lib/types/errors';
import {
  DEFAULT_LANGUAGE,
  I18N_NAMESPACE,
  INITIAL_DELAY,
  MAX_RETRIES,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
} from '@constants/languages';
import { STORAGE_KEYS } from '@constants/storageKeys';
import { MESSAGE_TYPES } from '@constants/messageTypes';
import enTranslations from '@locales/en.json';
import koTranslations from '@locales/ko.json';

const resources = {
  en: { [I18N_NAMESPACE]: enTranslations },
  ko: { [I18N_NAMESPACE]: koTranslations },
};

// 1. 싱글톤 인스턴스 생성
export const i18nInstance = i18next.createInstance();

// 1. 플러그인 설정 전용 함수
const setupPlugins = () => {
  i18nInstance.use(LanguageDetector).use(initReactI18next);
};

// 2. 인스턴스 구성 함수
const configureInstance = async (lang: SupportedLanguage | null) => {
  const config: InitOptions = {
    resources, // ✅ 정적 리소스 한 번에 로딩
    detection: {
      order: ['navigator', 'htmlTag'],
      caches: [],
    },
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: { escapeValue: false },
    supportedLngs: SUPPORTED_LANGUAGES,
    react: {
      bindI18n: 'languageChanged', // 언어 변경 시 리렌더링 트리거
      bindI18nStore: '', // 스토어 바인딩 비활성화
      useSuspense: false, // Suspense 미사용
      transSupportBasicHtmlNodes: true, // 기본 HTML 노드 지원
    },
  };
  // ✅ null이 아닐 때만 lng 설정
  if (lang) {
    config.lng = lang;
  }
  // initialLang이 null이면 LanguageDetector가 자동으로 언어 감지

  await i18nInstance.init(config);
};

// 3. 스토리지 리스너 분리
const setupStorageListeners = () => {
  chrome.storage.onChanged.addListener((changes) => {
    const newLang = changes?.[STORAGE_KEYS.LANGUAGE]?.newValue;
    if (newLang && SUPPORTED_LANGUAGES.includes(newLang)) {
      i18nInstance.changeLanguage(newLang);
    }
  });
};

// 4. 초기 리소스 로드

const detectBrowserLanguage = (): Promise<SupportedLanguage> => {
  return new Promise((resolve) => {
    chrome.i18n.getAcceptLanguages((languages) => {
      console.log('[i18n] Browser languages:', languages);

      // 지원 언어 중 첫 번째 일치 항목 찾기
      for (const lang of languages) {
        const langCode = lang.split('-')[0] as SupportedLanguage;
        if (SUPPORTED_LANGUAGES.includes(langCode)) {
          console.log(`[i18n] Detected valid language: ${langCode}`);
          resolve(langCode);
          return;
        }
      }

      // 일치 없을 시 기본값 반환
      console.log('[i18n] No valid browser language, using default');
      resolve(DEFAULT_LANGUAGE);
    });
  });
};
const getSavedLanguage = async (): Promise<SupportedLanguage | null> => {
  return new Promise<SupportedLanguage | null>((resolve) => {
    chrome.storage.sync.get(STORAGE_KEYS.LANGUAGE, (result) => {
      const lang = result[STORAGE_KEYS.LANGUAGE];
      const isValid = lang && SUPPORTED_LANGUAGES.includes(lang);
      resolve(isValid ? lang : null);
    });
  });
};

// 전역 상태 관리 (SPA 재주입 시 유지)
declare global {
  interface Window {
    __i18n_initialized?: boolean;
  }
}

// 2. 초기화 함수
let initializationPromise: Promise<boolean> | null = null;

export const initializeI18n = (): Promise<boolean> => {
  // ✅ 윈도우 상태 체크 (SPA 재주입 방어)
  if (typeof window !== 'undefined' && window.__i18n_initialized) {
    return Promise.resolve(true);
  }

  if (!initializationPromise) {
    initializationPromise = retryWithBackoff(async () => {
      try {
        console.log('[i18n] Initialization started');
        setupPlugins();

        // ✅ 스토리지 언어 확인 (null 허용)
        const savedLang = await getSavedLanguage();

        // ✅ 브라우저 언어 감지 (스토리지 없을 때만)
        const browserLang = savedLang ? null : await detectBrowserLanguage();
        const finalLang = savedLang || browserLang || DEFAULT_LANGUAGE;
        console.log(`[i18n] Using language: ${finalLang}`);

        // ✅ null 처리된 configureInstance 호출
        await configureInstance(finalLang);

        // ✅ 스토리지 업데이트 (신규 감지 시)
        if (!savedLang && browserLang) {
          console.log(`[i18n] Saving detected language to storage: ${browserLang}`);
          await chrome.storage.sync.set({ [STORAGE_KEYS.LANGUAGE]: browserLang });
        }

        setupStorageListeners();
        // ✅ 윈도우 상태 업데이트
        if (typeof window !== 'undefined') {
          window.__i18n_initialized = true;
        }

        console.log('[i18n] Initialization completed successfully');
        return true;
      } catch (error) {
        if (error instanceof ResourceLoadError) {
          throw new I18nError('PERMANENT', `리소스 누락: ${error.language}`);
        }
        throw new I18nError('TRANSIENT', `초기화 실패: ${error instanceof Error ? error.message : String(error)}`);
      }
    }, isTransientError);
  }
  return initializationPromise;
};
// 1. 지수 백오프 재시도 함수 구현
const retryWithBackoff = async <T>(fn: () => Promise<T>, isRetriableError: (error: unknown) => boolean): Promise<T> => {
  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (!isRetriableError(error) || attempt >= MAX_RETRIES) throw error;
      const delay = INITIAL_DELAY * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempt++;
    }
  }
};
// 2. 재시도 가능 에러 판별 함수
const isTransientError = (error: unknown): boolean => {
  return error instanceof I18nError && error.code === 'TRANSIENT';
};

// 7. 언어 변경 핸들러 (기존과 동일)
export const syncLanguage = async (newLang: SupportedLanguage) => {
  try {
    // Chrome API로 언어 변경 처리
    await chrome.storage.sync.set({ [STORAGE_KEYS.LANGUAGE]: newLang });
    document.documentElement.lang = newLang;
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.LANGUAGE_CHANGED,
      payload: newLang,
    });
  } catch (error) {
    console.error('Language sync failed:', error);
  }
};
```

## File: styles/GlobalStyle.ts
```typescript
// src/styles/GlobalStyle.ts
import { createGlobalStyle } from 'styled-components';
import { normalize } from 'styled-normalize';

export const GlobalStyle = createGlobalStyle`
  ${normalize}

  html, body {
    font-family: 'Pretendard', sans-serif;
    background: #fff;
    color: #222;
  }
  /* 추가 전역 스타일 */
`;
```
