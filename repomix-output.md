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
background/api/ksoftsi.ts
background/api/lrclib.ts
background/api/youtube.ts
background/background.ts
components/common/ErrorFallback.tsx
components/common/LoadingOverlay.tsx
components/lyrics/DualHighlightSubtitle.tsx
components/lyrics/KaraokePlayerContainer/index.tsx
components/lyrics/KaraokePlayerContainer/styles.module.css
components/lyrics/LyricsOverlayRoot.tsx
components/lyrics/LyricsSidebar/index.tsx
components/lyrics/LyricsSidebar/LyricsPanel.tsx
components/lyrics/styles.module.css
constants/api.ts
constants/doomIds.ts
constants/errorCodes.ts
constants/errorMessages.ts
constants/keywords.ts
constants/languages.ts
constants/messageTypes.ts
constants/paths.ts
constants/platforms.ts
constants/storageKeys.ts
constants/time.ts
constants/youtubeSelectors.ts
content/App.tsx
content/components/LyricsContainer.tsx
content/components/SyncSubtitle.tsx
content/index.tsx
hooks/useChromeStorage.ts
hooks/useCurrentTime.ts
hooks/useLangLoader.ts
lib/types/config.ts
lib/types/errors.ts
lib/types/global.d.ts
lib/types/i18next.d.ts
lib/types/lyrics.ts
lib/types/message.ts
lib/types/translationKeys.ts
lib/types/video.ts
lib/utils/audio/audio.ts
lib/utils/audio/audioAnalysis.ts
lib/utils/audio/audioUtils.ts
lib/utils/audio/musicDetection.ts
lib/utils/audio/vad.ts
lib/utils/cache/lyricsCache.ts
lib/utils/common/common.ts
lib/utils/common/stringUtils.ts
lib/utils/common/time.ts
lib/utils/common/typeGuards.ts
lib/utils/dom/domUtils.ts
lib/utils/dom/styleInjection.ts
lib/utils/infra/listenerManager.ts
lib/utils/infra/registerAllListeners.ts
lib/utils/infra/singletonListener.ts
lib/utils/infra/uiResourceManager.ts
lib/utils/lyrics/artistTitle.ts
lib/utils/lyrics/getLyricsFromCacheOrFetch.ts
lib/utils/lyrics/languageDetector.ts
lib/utils/lyrics/lyrics.ts
lib/utils/lyrics/lyricsDisplay.ts
lib/utils/lyrics/lyricsParser.ts
lib/utils/lyrics/queryNormalizer.ts
lib/utils/platform/contentGuard.ts
lib/utils/platform/playerUtils.ts
lib/utils/platform/videoDetection.ts
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

## File: background/api/ksoftsi.ts
```typescript
// src/lib/api/ksoftsi.ts
import axios from 'axios';

const KSOFT_API_KEY = process.env.KSOFT_API_KEY; // 환경변수로 관리 권장

const KSOFT_BASE_URL = 'https://api.ksoft.si/lyrics/search';

export interface KSoftLyricsResult {
  name: string;
  artist: string;
  lyrics: string;
  url: string;
  // 기타 필요한 필드 추가
}

export async function fetchKSoftLyrics(artist: string, title: string): Promise<KSoftLyricsResult | null> {
  try {
    const response = await axios.get(KSOFT_BASE_URL, {
      params: { q: `${artist} ${title}` },
      headers: { Authorization: `Bearer ${KSOFT_API_KEY}` },
    });

    if (response.data && response.data.data && response.data.data.length > 0) {
      const result = response.data.data[0];
      return {
        name: result.name,
        artist: result.artist,
        lyrics: result.lyrics,
        url: result.url,
      };
    }
    return null;
  } catch (error) {
    console.error('KSoft.Si API error:', error);
    return null;
  }
}
```

## File: background/api/lrclib.ts
```typescript
import { Line } from '@lib/types/lyrics';
export interface LrcLibLyricsResult {
  lyrics: string | Line[];
  duration?: number;
  artist?: string;
  title?: string;
  id?: string;
}

// background/api/lrclib.ts
export async function fetchLrclibLyrics(artist: string, title: string): Promise<string | null> {
  const endpoint = `https://lrclib.net/api/get?artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(title)}`;
  const res = await fetch(endpoint);
  if (!res.ok) return null;
  const data = await res.json();
  return data?.syncedLyrics || data?.plainLyrics || null;
}

export async function fetchLyricsBySearchFirst(artist: string, title: string): Promise<LrcLibLyricsResult | undefined> {
  const query = `${artist} ${title}`;
  const searchRes = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(query)}`);
  const searchData = await searchRes.json();

  for (const candidate of searchData) {
    const detailRes = await fetch(`https://lrclib.net/api/get/${candidate.id}`);
    const detail = await detailRes.json();
    const lyrics = detail.syncedLyrics || detail.plainLyrics;
    const duration = detail.duration; // LRCLIB에서 제공하는 초 단위 곡 길이(없을 수도 있으니 ?로)

    console.log('길이', duration, '가사:', lyrics);

    if (lyrics) {
      return {
        lyrics,
        duration,
        artist: detail.artist,
        title: detail.title,
        id: candidate.id,
      };
    }
  }
  return undefined;
}
```

## File: background/api/youtube.ts
```typescript
import { parseISO8601Duration } from '@lib/utils/common/time';
import { getFromLyricsCache, setToLyricsCache } from '@lib/utils/cache/lyricsCache';

// 만료시간 기본 1일(YouTube 메타는 update가 드물어서 넉넉히 잡을 것)
const YT_META_CACHE_TTL = 24 * 60 * 60 * 1000;

// background/api/youtube.ts
export async function fetchYouTubeVideoMeta(videoId: string, apiKey: string) {
  const cacheKey = `videoMeta:${videoId}`;
  const cached = getFromLyricsCache(cacheKey);
  if (cached) return cached;

  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`;
  const res = await fetch(url);

  const data = await res.json();
  if (data.items && data.items.length > 0) {
    const snippet = data.items[0].snippet;
    const contentDetails = data.items[0].contentDetails;
    let durationSec = 0;
    if (contentDetails && contentDetails.duration) {
      durationSec = parseISO8601Duration(contentDetails.duration);
    }
    const result = {
      categoryId: snippet.categoryId,
      title: snippet.title,
      description: snippet.description,
      tags: snippet.tags,
      channelTitle: snippet.channelTitle,
      durationSec,
    };
    setToLyricsCache(cacheKey, result, { ttl: YT_META_CACHE_TTL });
    return result;
  }
  return null;
}
```

## File: background/background.ts
```typescript
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

## File: components/lyrics/DualHighlightSubtitle.tsx
```typescript
import React from 'react';
// import { parseLyrics } from '@lib/utils/lyricsParser';
import { useCurrentTime } from '@hooks/useCurrentTime';
import { getDisplayLines } from '@lib/utils/lyrics/lyricsDisplay';
import styles from './styles.module.css';
import { Line } from '@lib/types/lyrics';

interface DualHighlightSubtitleProps {
  lyrics: Line[];
  offset?: number;
}

export const DualHighlightSubtitle: React.FC<DualHighlightSubtitleProps> = ({ lyrics, offset }) => {
  const currentTime = useCurrentTime();
  const adjustedTime = currentTime - (offset ?? 0); // offset 사용!
  const { top, bottom, highlightTop, highlightBottom } = getDisplayLines(lyrics, adjustedTime);

  return (
    <div className={styles.dualHighlightSubtitle}>
      <div className={highlightTop ? styles.highlight : ''}>{top}</div>
      <div className={highlightBottom ? styles.highlight : ''}>{bottom}</div>
    </div>
  );
};
```

## File: components/lyrics/KaraokePlayerContainer/index.tsx
```typescript
// // components/lyrics/KaraokePlayerContainer/index.tsx
// import { useEffect, useRef } from 'react';
// import styles from './styles.module.css';

// const KARAOKE_STYLES = `
//   ytd-app { padding-top: 0 !important; }
//   ytd-watch-flexy {
//     width: 75% !important;
//     height: calc(100vh - var(--header-height, 56px)) !important; /* 헤더 높이 고려 */
//     position: fixed !important;
//     top: var(--header-height, 56px) !important; /* 헤더 아래 시작 */
//     left: 0 !important;
//     z-index: 1000 !important;
//     margin: 0 !important;
//     padding: 0 !important;
//   }

//   #movie_player {
//     width: 100% !important;
//     height: 100% !important;
//     position: relative !important;
//   }
//   #secondary { display: none !important; }
//   body { overflow: hidden !important; }
// `;

// export const KaraokePlayerContainer = () => {
//   const styleRef = useRef<HTMLStyleElement | null>(null);

//   useEffect(() => {
//     // 1. 기존 스타일 제거 (중복 주입 방지)
//     if (styleRef.current) {
//       document.head.removeChild(styleRef.current);
//     }

//     // 2. 새 스타일 요소 생성
//     const style = document.createElement('style');
//     style.id = 'karaoke-player-styles';
//     style.textContent = KARAOKE_STYLES;
//     document.head.appendChild(style);
//     styleRef.current = style;

//     // 3. YouTube DOM 변경 감지 (SPA 대응)
//     const observer = new MutationObserver(() => {
//       if (!document.querySelector('ytd-watch-flexy')) return;

//       // 스타일 재주입
//       if (style.parentNode !== document.head) {
//         document.head.appendChild(style);
//       }
//     });

//     observer.observe(document.body, {
//       childList: true,
//       subtree: true,
//     });

//     return () => {
//       // 4. 정리 함수에서 스타일 제거 및 관찰 중지
//       if (styleRef.current) {
//         document.head.removeChild(styleRef.current);
//       }
//       observer.disconnect();
//     };
//   }, []);

//   return <div className={styles.lyricsContainer}>가사 컨테이너</div>;
// };
```

## File: components/lyrics/KaraokePlayerContainer/styles.module.css
```css
/* styles.module.css */
.karaokePlayerContainer {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 1500 !important; /* YouTube보다 낮게 */
  background: transparent !important; /* ✅ 투명 배경 */
  pointer-events: none !important; /* ✅ 기본적으로 클릭 차단 해제 */
}

.lyricsContainer {
  position: fixed !important;
  top: 0 !important;
  right: 0 !important; /* ✅ 오른쪽 고정 */
  width: 25% !important;
  height: 100vh !important;
  background: RED !important;
  pointer-events: auto !important; /* ✅ 가사 영역만 클릭 가능 */
  z-index: 2000 !important;
}
```

## File: components/lyrics/LyricsOverlayRoot.tsx
```typescript
import { YOUTUBE_PLAYER_SELECTOR } from '@constants/youtubeSelectors';
import styles from './styles.module.css';

export function injectLyricsOverlayRoot() {
  let overlay = document.getElementById('lyrics-cc-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'lyrics-cc-overlay';
    overlay.className = styles.overlayRoot!;

    const player = document.querySelector(YOUTUBE_PLAYER_SELECTOR);
    if (player) {
      player.appendChild(overlay);
      console.log('[LyricsOverlayRoot] 오버레이 루트 DOM 삽입 성공');
    } else {
      console.warn('[LyricsOverlayRoot] 유튜브 플레이어 컨테이너를 찾지 못함');
    }
  } else {
    console.log('[LyricsOverlayRoot] 기존 오버레이 루트 DOM 재사용');
  }
  return overlay;
}
```

## File: components/lyrics/LyricsSidebar/index.tsx
```typescript
// components/lyrics/LyricsSidebar/index.tsx
// import React from 'react';
// import MenuTabs from './MenuTabs';
// import LyricsPanel from './LyricsPanel';

// export const LyricsSidebar: React.FC = () => {
//   return (
//     <div className="lyrics-sidebar">
//       {/* <MenuTabs />
//       <LyricsPanel /> */}
//     </div>
//   );
// };
```

## File: components/lyrics/LyricsSidebar/LyricsPanel.tsx
```typescript
// // components/lyrics/LyricsSidebar/LyricsPanel.tsx
// import React from 'react';
// import LyricsItem from '../../LyricsItem';

// type LyricsType = { text: string; id: string };

// const LyricsPanel: React.FC<{ lyrics?: LyricsType[] }> = ({ lyrics = [] }) => {
//   return (
//     <div className="lyrics-panel">
//       {lyrics.map((line) => (
//         <LyricsItem key={line.id} text={line.text} />
//       ))}
//     </div>
//   );
// };

// export default LyricsPanel;
```

## File: components/lyrics/styles.module.css
```css
#lyrics-cc-overlay {
  position: absolute !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 10% !important;
  width: 100% !important;
  pointer-events: none !important;
  z-index: 3000 !important;
  display: flex !important;
  justify-content: center !important;
}
.dual-highlight-subtitle {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 2em;
  font-size: 2vw;
  line-height: 1.4;
  color: #fff;
  text-shadow:
    2px 2px 8px rgba(0, 0, 0, 0.8),
    0 0 2px #000,
    0 0 1px #000;
}
.dual-highlight-subtitle > div {
  min-height: 2em;
  white-space: nowrap;
  text-align: center;
  transition: all 0.3s ease;
  font-weight: bold; /* 굵게 */
}

.animated {
  /* 왼쪽에서 오른쪽으로 빨간색이 채워지는 효과 */
  background: linear-gradient(to right, red 50%, #fff 50%);
  background-size: 200% 100%;
  background-position: left bottom;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: revealText 1.5s linear forwards;
}

@keyframes revealText {
  0% { background-position: right bottom; }
  100% { background-position: left bottom; }
}

/* 이미 부른 줄 (전체 빨간색) */
.past {
  color: red;
}

.overlayRoot {
  position: absolute !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 10% !important;
  width: 100% !important;
  pointer-events: none !important;
  z-index: 3000 !important;
  display: flex !important;
  justify-content: center !important;
}
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

## File: constants/keywords.ts
```typescript
export const SPECIAL_MUSIC_KEYWORDS = ['ed', 'op', 'mv', 'ost'];
export const INTRO_OUTRO_KEYWORDS = ['mv', 'remix', 'stage', 'full cam', '직캠', 'fan cam', 'stage mix', '최초 공개'];
export const MUSIC_KEYWORDS = [
  // 영어
  'official',
  'official video',
  'performance video',
  'Official Lyric Video',
  'mv',
  'm/v',
  'music video',
  'lyric',
  'lyrics',
  'cover',
  'remix',
  'instrumental',
  'karaoke',
  'tj karaoke',
  'ky karaoke',
  // 한국어
  '노래방',
  '가사',
  '커버',
  '노래',
  '뮤직비디오',
  '뮤비',
  // 일본어
  '歌ってみた',
];
export const EXTRA_KEYWORDS = [
  ...MUSIC_KEYWORDS,
  // 영어
  'animation',
  'kbs',
  'sbs',
  'mbc',
  'jtbc',
  'music bank',
  // 'live',
  'full cam',
  'clean ver.',
  'Show! MusicCore',
  // 한국어
  '뮤직뱅크',
  '음악중심',
  '인기가요',
  '쇼챔피언',
  '방송',
  '직캠',
  '원테이크',
  '교차편집',
  '풀캠',
  '안방1열',
  '직캠4k',
  'stage mix',
];
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

## File: constants/platforms.ts
```typescript
// src/constants/platforms.ts
import { DetectionConfig } from '@lib/types/config';
import { YOUTUBE_HOST, YOUTUBE_REGEX } from './youtubeSelectors';

export const YOUTUBE_CONFIG: DetectionConfig = {
  hostSuffix: YOUTUBE_HOST,
  urlRegex: YOUTUBE_REGEX,
};

// 추후 다른 플랫폼 설정 추가 가능
// export const NETFLIX_CONFIG: DetectionConfig = { ... };
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
import { isToggleContentMessage } from '@lib/utils/common/typeGuards';
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
import { parseTimeToSeconds } from '@lib/utils/common/time';
import { Line } from '@lib/types/lyrics';

export const SyncSubtitle: React.FC<{
  lyrics: string;
  currentTime: number;
}> = ({ lyrics, currentTime }) => {
  // 가사 파싱
  const parsedLyrics: Line[] = lyrics.split('\n').reduce<Line[]>((acc, line) => {
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
import { createRoot, Root } from 'react-dom/client';
import { App } from './App';
import { i18nInstance, initializeI18n } from '@services/i18n';
import { ErrorFallback } from '@components/common/ErrorFallback';
import { I18nextProvider } from 'react-i18next';
import { ErrorBoundary } from 'react-error-boundary';
import { detectYouTubeVideo, setupSPAObserver } from '@lib/youtube';
import { debounce } from '@lib/utils/common/common';
import { STORAGE_KEYS } from '@constants/storageKeys';
import { MESSAGE_TYPES } from '@constants/messageTypes';
import { DOM_IDS } from '@constants/doomIds';
import { fetchYouTubeVideoMeta } from '@background/api/youtube';
import { isMusicVideo } from '@lib/utils/audio/musicDetection';
import { UIResourceManager } from '@lib/utils/infra/uiResourceManager';
import { YOUTUBE_PLAYER_SELECTOR, YOUTUBE_WATCH_PATH } from '@constants/youtubeSelectors';
import { extractArtistAndTitle } from '@lib/utils/lyrics/artistTitle';
import {
  cleanUp,
  extractArtistAndTitleCustom,
  extractEnglishOnly,
  removeEmptyBrackets,
} from '@lib/utils/common/stringUtils';
import { listenerManager } from '@lib/utils/infra/listenerManager';
import { withContentEnabled } from '@lib/utils/platform/contentGuard';
import { injectLyricsOverlayRoot } from '@components/lyrics/LyricsOverlayRoot';
import { DualHighlightSubtitle } from '@components/lyrics/DualHighlightSubtitle';
import { isAdPlaying } from '@lib/utils/dom/domUtils';
import { parseLyrics } from '@lib/utils/lyrics/lyricsParser';
import { Line } from '@lib/types/lyrics';
import { tryDetectVideoChange } from '@lib/utils/platform/videoDetection';
import { analyzeAudioFeatures } from '@lib/utils/audio/audioAnalysis';
import { fetchLyricsBySearchFirst } from '@background/api/lrclib';

import 'normalize.css';
import { setToLyricsCache } from '@lib/utils/cache/lyricsCache';
import { normalizeLyricsQuery } from '@lib/utils/lyrics/queryNormalizer';

(() => {
  // 새로고침 시 contentscript 내 중복 실행 방지
  if (window.__LYRICS_OVERLAY_INITED) {
    console.log('[LyricsExt] Already initialized. Skipping...');
    return;
  }
  window.__LYRICS_OVERLAY_INITED = true;

  // --- 플래그 및 관리 객체 ---
  let isDetectionActive = false; // 감지 시스템 활성화 여부
  let isDetecting = false; // 영상 감지 함수 진입 여부(동시 실행 방지)
  let lastVideoId: string | null = null;
  let lastRenderedLyrics = '';
  let latestLyrics: Line[] = [];
  let contentEnabled = false;
  let lyricsOverlayRoot: Root | null = null; // 렌더링된 root 인스턴스 보관
  let lyricsOverlayElement: HTMLElement | null = null;
  let lastUrl = window.location.href;

  const getContentEnabled = () => contentEnabled;
  const uiManager = new UIResourceManager();
  const RETRY_DELAY = 300;

  interface DetectionObserverManager {
    spaObserver: MutationObserver | null;
    lyricsObserver: MutationObserver | null;
  }
  const detectionObserverManager: DetectionObserverManager = {
    spaObserver: null,
    lyricsObserver: null,
    // ...other observers
  };

  // --- Observer 및 리스너 관리 함수 ---
  const removeAllObservers = (): void => {
    Object.values(detectionObserverManager).forEach((obs) => obs?.disconnect && obs.disconnect());
    detectionObserverManager.spaObserver = null;
    detectionObserverManager.lyricsObserver = null;
  };
  const cleanupAllResources = (): void => {
    listenerManager.removeAll();
    removeAllObservers();
    cleanupAllUIElements();
  };

  // 2. 초기값을 chrome.storage에서 읽어옴
  chrome.storage.sync.get([STORAGE_KEYS.CONTENT_ENABLED], (result) => {
    contentEnabled = result[STORAGE_KEYS.CONTENT_ENABLED] ?? false;
  });

  // ✅ UI 요소들을 완전히 정리하는 함수
  const cleanupAllUIElements = () => {
    uiManager.cleanup();

    // 3. 주입된 스타일 제거
    const injectedStyles = document.querySelectorAll('#karaoke-player-styles, #karaoke-styles');
    injectedStyles.forEach((style) => {
      console.log('[cleanupAllUIElements] 스타일 제거:', style.id || style);
      style.remove();
    });

    // 4. body 클래스 정리
    document.body.classList.remove('karaoke-mode');
    console.log('[Cleanup] UI cleanup completed, karaoke-mode class removed');
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

  function hideLyricsOverlay() {
    const overlay = document.getElementById('lyrics-cc-overlay');
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay); // 1. 오버레이 DOM 완전 제거
      console.log('[hideLyricsOverlay] lyrics-cc-overlay 제거');
    }
    lyricsOverlayRoot = null; // 2. React Root 인스턴스 해제
    lyricsOverlayElement = null; // 3. 전역 DOM 참조 변수 초기화
  }

  function showLyricsOverlay(lyrics: Line[], offset?: number) {
    if (!lyricsOverlayElement) {
      injectCSS();
      console.log('[showLyricsOverlay] injectCSS 호출');
      lyricsOverlayElement = injectLyricsOverlayRoot();
      lyricsOverlayElement.style.display = '';
    }
    // React Root 인스턴스도 한 번만 생성
    if (!lyricsOverlayRoot) {
      lyricsOverlayRoot = createRoot(lyricsOverlayElement);
    }

    lyricsOverlayRoot.render(<DualHighlightSubtitle lyrics={lyrics} offset={offset} />);
  }

  function showLyricsIfNotAd(lyrics: Line[], offset?: number) {
    if (isAdPlaying()) {
      hideLyricsOverlay();
    } else {
      showLyricsOverlay(lyrics, offset);
    }
  }

  function renderLyricsOverlay(lyrics: Line[]) {
    const player = document.querySelector(YOUTUBE_PLAYER_SELECTOR);
    if (!player) return;

    latestLyrics = lyrics;

    const lyricsStr = JSON.stringify(lyrics);
    if (lastRenderedLyrics === lyricsStr) return;
    lastRenderedLyrics = lyricsStr;

    // Observer 중복 생성 방지
    if (detectionObserverManager.lyricsObserver) {
      detectionObserverManager.lyricsObserver.disconnect();
      detectionObserverManager.lyricsObserver = null;
    }
    // 최신 lyrics를 클로저로 안전하게 캡처
    detectionObserverManager.lyricsObserver = new MutationObserver(() => {
      showLyricsIfNotAd(latestLyrics);
    });

    detectionObserverManager.lyricsObserver.observe(player, { attributes: true, attributeFilter: ['class'] });
    showLyricsIfNotAd(lyrics);
  }

  // ✅ URL 변경 핸들러 개선
  const handleUrlChange = (url: string) => {
    if (url === lastUrl) return; // URL이 실제로 바뀌었을 때만 실행
    lastUrl = url;

    const isWatchPage = url.includes(YOUTUBE_WATCH_PATH);

    console.log(`[URL Change] ${url}, isWatchPage: ${isWatchPage}`);
    console.log(`[URL Change] ${url}, isWatchPage: ${isWatchPage}`);
    if (isWatchPage) {
      const videoData = detectYouTubeVideo();
      tryDetectVideoChange(videoData?.videoId || null, debouncedDetection);
    }
  };
  const handleUrlChangeGuarded = withContentEnabled(getContentEnabled, handleUrlChange);

  // 영상 감지 핸들러 (순수 로직)
  const handleVideoDetection = async () => {
    console.log('handleVideoDetection 실행');
    if (isDetecting) {
      console.log('[SKIP] 감지 함수 실행 중 (동시 실행 방지)');
      return;
    }

    try {
      const videoData = detectYouTubeVideo();
      if (!videoData) {
        console.log('[SKIP] 비디오 감지 실패');
        setTimeout(debouncedDetection, RETRY_DELAY);
        return;
      }
      if (videoData.videoId === lastVideoId) {
        console.log('[SKIP] 같은 videoId에 대해 이미 실행됨');
        return;
      }
      isDetecting = true;
      lastVideoId = videoData.videoId;

      // 1. YouTube Data API로 메타데이터 요청
      const meta = await fetchYouTubeVideoMeta(videoData.videoId, process.env.YOUTUBE_API_KEY!);
      if (!meta) {
        console.log('fetchYouTubeVideoMeta 실패');
        return;
      }
      hideLyricsOverlay();

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

      let artist = cleanUp(refined.artist);
      let title = cleanUp(refined.title);
      title = removeEmptyBrackets(title);

      artist = extractEnglishOnly(artist);
      title = extractEnglishOnly(title);

      console.log('아티스트:', artist, '곡명:', title);

      // 1. 비디오 엘리먼트 선택
      const videoElem = document.querySelector('video');
      if (!videoElem) return;
      const result = await fetchLyricsBySearchFirst(artist, title);

      // 다음 영상에 이전 가사 나오는 거 방지
      if (!result) {
        console.log('가사 없음');
        hideLyricsOverlay();
        latestLyrics = [];
        return;
      }
      setToLyricsCache(normalizeLyricsQuery(artist, title, {}), {
        lyrics: result.lyrics,
        duration: result.duration,
        artist: result.artist, // 정답 artist
        title: result.title, // 정답 title
        id: result.id, // (선택) LRCLIB id
      });
      const { lyrics, duration: lyricsDuration } = result;
      const parsedLyrics: Line[] = typeof lyrics === 'string' ? parseLyrics(lyrics) : lyrics;
      const lastLine = parsedLyrics[parsedLyrics.length - 1];
      const lyricsLengthSec = lastLine?.time ?? 0;

      // duration 필드가 존재하면 우선적으로 사용, 없으면 마지막 가사줄 기준
      const effectiveLyricsDuration = lyricsDuration ?? lyricsLengthSec;
      if ((typeof lyricsDuration === 'number' && lyricsDuration <= 2) || lyricsLengthSec <= 10) {
        console.warn(
          `[audioAnalysis] 분석 스킵: duration(${lyricsDuration ?? '-'}) < 2초 또는 lyricsLengthSec(${lyricsLengthSec}) ≤ 10초`,
        );
        return; // 분석 생략, 이후 정상 흐름만 계속
      }

      if (!parsedLyrics || parsedLyrics.length === 0) {
        console.log('parsedLyrics is empty or undefined');
        hideLyricsOverlay();
        return;
      }

      if (!isMusicVideo(meta, lyricsLengthSec)) {
        console.log('isMusicVideo 판별 실패');
        hideLyricsOverlay();
        return;
      }

      const videoDurationSec = meta.durationSec ?? 0;
      const durationSec = videoDurationSec - effectiveLyricsDuration;

      if (durationSec <= 0) {
        console.warn(
          `[audioAnalysis] 분석 스킵: 영상 길이(${videoDurationSec}s) - 가사 길이(${effectiveLyricsDuration}s) <= 0`,
        );
      } else {
        if (!isAdPlaying()) {
          // const analysisResult = await analyzeAudioFeatures(videoElem, { durationSec });
          console.warn(`[audioAnalysis] 분석: 영상 길이(${videoDurationSec}s), 가사 길이(${effectiveLyricsDuration}s)`);
          // console.log('durationSec:', durationSec, '[audioAnalysis] 성공:', analysisResult);
        }
      }

      latestLyrics = parsedLyrics;
      renderLyricsOverlay(parsedLyrics);

      chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.VIDEO_DETECTED,
        payload: videoData,
      });
    } finally {
      isDetecting = false;
    }
  };
  const handleVideoDetectionGuarded = withContentEnabled(getContentEnabled, handleVideoDetection);
  const debouncedDetection = debounce(handleVideoDetectionGuarded, RETRY_DELAY);

  // --- 스토리지, UI, SPA 이벤트, visibility 이벤트 일괄 관리 ---
  // SPA 네비게이션 메시지 핸들러
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === MESSAGE_TYPES.SPA_NAVIGATION_DETECTED) {
      if (!contentEnabled) return; // 비활성화 시 아무 동작도 하지 않음
      const { url, isWatchPage } = message.payload;
      console.log(`[SPA Navigation] ${url}, isWatchPage: ${isWatchPage}`);
      if (url !== lastUrl) {
        handleUrlChangeGuarded(url);
      }
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
      const videoData = detectYouTubeVideo();
      tryDetectVideoChange(videoData?.videoId || null, debouncedDetection);
    }
  });

  // --- 감지 시스템 상태에 따라 enable/disable 제어 ---
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

  // 감지 시스템 활성화
  const enableDetection = () => {
    if (isDetectionActive) {
      console.log('[SKIP] 감지 시스템 이미 활성화됨');
      return;
    }

    // 기존 자원 모두 정리
    cleanupAllResources();

    detectionObserverManager.spaObserver = setupSPAObserver(() => {
      const videoData = detectYouTubeVideo();
      tryDetectVideoChange(videoData?.videoId || null, debouncedDetection);
    });

    isDetectionActive = true;

    // 초기 감지 실행
    debouncedDetection();
    console.log('[Detection] 감지 시스템 활성화 및 observer/이벤트 등록 완료');
  };
  // 감지 시스템 완전 비활성화
  const disableDetection = () => {
    cleanupAllResources();

    if (!isDetectionActive) {
      console.log('[SKIP] 감지 시스템 이미 비활성화됨');
      return;
    }

    isDetectionActive = false;
    lastVideoId = null;
    lastRenderedLyrics = '';
    latestLyrics = [];
    console.log('[Detection] 감지 시스템 완전 비활성화');
  };

  // function setupKaraokeContainer() {
  //   let karaokeRoot = document.getElementById('karaoke-root');
  //   if (!karaokeRoot) {
  //     karaokeRoot = document.createElement('div');
  //     karaokeRoot.id = 'karaoke-root';
  //     document.body.appendChild(karaokeRoot);
  //     uiManager.register(karaokeRoot);
  //   }
  //   const karaokeRootInstance = createRoot(karaokeRoot);
  //   //karaokeRootInstance.render(<KaraokePlayerContainer />);
  // }

  // 에러 바운더리 리셋 핸들러
  const handleReset = () => {
    window.location.reload();
  };

  // 앱 초기화
  const initializeApp = async () => {
    console.log('content app initializeApp 시작');
    try {
      await initializeI18n();

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
      // setupKaraokeContainer();

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
})();
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

## File: hooks/useCurrentTime.ts
```typescript
// YouTube 비디오의 현재 재생 시간을 React 상태로 실시간 추적하여,
// 가사 오버레이, 전체 가사 하이라이트 등에서 재사용할 수 있도록 합니다.

import { useEffect, useState } from 'react';

/**
 * 유튜브 비디오의 현재 재생 시간을 반환하는 커스텀 훅
 */
export function useCurrentTime(): number {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const video = document.querySelector('video');
    if (!video) {
      console.warn('[useCurrentTime] video 엘리먼트 없음');
      return;
    }
    const update = () => setCurrentTime(video.currentTime);
    video.addEventListener('timeupdate', update);

    // 초기값 동기화
    setCurrentTime(video.currentTime);

    return () => video.removeEventListener('timeupdate', update);
  }, []);

  return currentTime;
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

## File: lib/types/config.ts
```typescript
// lib/types/config.ts
export interface DetectionConfig {
  hostSuffix: string;
  urlRegex: RegExp;
}

export interface PlatformConfig extends DetectionConfig {
  name: string;
  contentSelector: string;
  // 추후 확장 가능한 설정들
}
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

## File: lib/types/global.d.ts
```typescript
// src/types/global.d.ts
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
interface Window {
  [key: string]: unknown;
  __LYRICS_OVERLAY_INITED?: boolean;
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

## File: lib/types/lyrics.ts
```typescript
export interface Line {
  time: number;
  text: string;
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

## File: lib/types/video.ts
```typescript
// interface VideoData {
//   videoId: string;
//   title: string;
// }
// interface VideoMeta {
//   categoryId?: string;
//   title?: string;
//   description?: string;
//   tags?: string[];
//   channelTitle?: string;
//   durationSec?: number;
// }
```

## File: lib/utils/audio/audio.ts
```typescript
import { getSharedAudioContext } from "./audioUtils";

/**
 * HTMLMediaElement에서 Mono PCM 추출 (Singleton AudioContext 활용)
 */
export async function extractPCMFromMediaElement(
  elem: HTMLMediaElement,
  durationSec = 15,
  sampleRate = 44100,
): Promise<{ pcm: Float32Array; sampleRate: number }> {
  const audioCtx = getSharedAudioContext();
  const analyser = audioCtx.createAnalyser();

  // 단일 SourceNode 재사용: 기존 연결이 있을 경우 분리
  let sourceNode = (extractPCMFromMediaElement as any)._sourceNode as MediaElementAudioSourceNode | null;
  if (sourceNode) {
    try {
      sourceNode.disconnect();
    } catch (_) {}
  }
  sourceNode = audioCtx.createMediaElementSource(elem);
  (extractPCMFromMediaElement as any)._sourceNode = sourceNode;

  sourceNode.connect(analyser);
  analyser.connect(audioCtx.destination);

  const frameSize = analyser.fftSize;
  const framesNeeded = Math.ceil((sampleRate * durationSec) / frameSize);
  const pcmResult = new Float32Array(sampleRate * durationSec);

  let written = 0;
  for (let i = 0; i < framesNeeded; i++) {
    await new Promise((res) => setTimeout(res, (frameSize / sampleRate) * 1000));
    const buf = new Float32Array(frameSize);
    analyser.getFloatTimeDomainData(buf);
    const slice = buf.slice(0, Math.min(frameSize, pcmResult.length - written));
    pcmResult.set(slice, written);
    written += slice.length;
    if (written >= pcmResult.length) break;
  }

  return { pcm: pcmResult, sampleRate };
}

/**
 * AudioBuffer를 받아서 지정 채널의 PCM(mono) 추출
 */
export function stereoToMono(buffer: AudioBuffer, channelIndex = 0): Float32Array {
  return buffer.getChannelData(channelIndex);
}
```

## File: lib/utils/audio/audioAnalysis.ts
```typescript
import Meyda, { MeydaFeaturesObject } from 'meyda';
import { getSharedAudioContext } from './audioUtils';

/**
 * 고수준 오디오 특징 분석 – Meyda 기반, Worklet 싱글톤 관리 및 예외/자원 처리 반영
 */
export async function analyzeAudioFeatures(
  videoEl: HTMLMediaElement,
  options: { durationSec?: number; bufferSize?: number; threshold?: number } = {},
) {
  const { durationSec = 15, bufferSize = 1024, threshold = 0.04 } = options;
  const audioContext = getSharedAudioContext();
  let source: MediaElementAudioSourceNode | null = null;
  let analyzer: ReturnType<typeof Meyda.createMeydaAnalyzer> | null = null;

  try {
    source = audioContext.createMediaElementSource(videoEl);

    const rms: number[] = [];
    const spectralCentroid: number[] = [];
    const timestamps: number[] = [];

    analyzer = Meyda.createMeydaAnalyzer({
      audioContext,
      source,
      bufferSize,
      featureExtractors: ['rms', 'spectralCentroid'],
      callback: (features: MeydaFeaturesObject) => {
        rms.push(features.rms ?? 0);
        spectralCentroid.push(features.spectralCentroid ?? 0);
        timestamps.push(videoEl.currentTime);
      },
    });

    // 영상상태 백업 및 play
    const wasPaused = videoEl.paused;
    const prevTime = videoEl.currentTime;
    if (wasPaused) await videoEl.play();
    analyzer.start();

    // 분석 타임아웃 및 자원 정리만 실행 (싱글톤 audioContext는 close하지 않음)
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        try {
          analyzer?.stop();
        } catch {}
        if (source) {
          try {
            source.disconnect();
          } catch {}
        }
        resolve();
      }, durationSec * 1000);
    });

    // 영상상태 복구
    if (wasPaused) videoEl.pause();
    videoEl.currentTime = prevTime;

    // threshold 값 기준으로 onset index 탐색
    const onsetIdx = rms.findIndex((value) => value > threshold);


    return {
      rms,
      spectralCentroid,
      rmsTimestamps: timestamps,
      centroidTimestamps: timestamps,
      onsetTime: onsetIdx !== -1 ? timestamps[onsetIdx] : undefined,
    };
  } catch (error) {
    // 분석 실패 및 자원 안전 정리
    console.error('오디오 분석 중 오류 발생:', error);
    try {
      analyzer?.stop();
    } catch {}
    if (source) {
      try {
        source.disconnect();
      } catch {}
    }
    // audioContext는 싱글톤이라 close하지 않음
    return null;
  }
}
```

## File: lib/utils/audio/audioUtils.ts
```typescript
// audioUtils.ts
let sharedAudioContext: AudioContext | null = null;

export function getSharedAudioContext(): AudioContext {
  if (!sharedAudioContext) sharedAudioContext = new AudioContext();
  return sharedAudioContext;
}
```

## File: lib/utils/audio/musicDetection.ts
```typescript
// src/lib/utils/musicDetection.ts
import { MUSIC_KEYWORDS } from '@constants/keywords';

export interface MusicDetectionInput {
  categoryId?: string;
  title?: string;
  description?: string;
  tags?: string[];
  channelTitle?: string;
  durationSec?: number;
}
const specialMusicPattern = /([^A-Za-z]|^)(OP|ED|OST|MV)([^A-Za-z]|$)/i;

export function scoreMusicVideo(meta: MusicDetectionInput): number {
  let score = 0;
  if (meta.categoryId === '10') score += 3;

  if (meta.title && MUSIC_KEYWORDS.some((k) => meta.title?.toLowerCase().includes(k))) score += 2;
  if (meta.description && MUSIC_KEYWORDS.some((k) => meta.description?.toLowerCase().includes(k))) score += 1;
  if (meta.tags && meta.tags.some((tag) => MUSIC_KEYWORDS.some((k) => tag.toLowerCase().includes(k)))) score += 1;
  if (meta.durationSec && meta.durationSec >= 60 && meta.durationSec <= 600) score += 1;
  // 채널명 등 추가 휴리스틱 가능

  // OP/ED/OST/MV가 앞뒤 영어 없이 등장할 때 추가 가산점
  if (meta.title && specialMusicPattern.test(meta.title)) score += 1;
  if (meta.description && specialMusicPattern.test(meta.description)) score += 1;
  if (meta.tags && meta.tags.some((tag) => specialMusicPattern.test(tag))) score += 1;

  return score;
}

export function isMusicVideo(meta: MusicDetectionInput, lyricsLengthSec?: number, threshold = 3): boolean {
  const score = scoreMusicVideo(meta);

  if (
    lyricsLengthSec &&
    meta.durationSec &&
    Math.abs(lyricsLengthSec - meta.durationSec) / Math.max(lyricsLengthSec, meta.durationSec) > 0.35
  ) {
    return false;
  }
  return score >= threshold;
}

// // 음악 인트로 감지/온셋 계산 유틸
// export async function detectMusicIntro(
//   videoElem: HTMLVideoElement,
//   introDurationSec = 15,
//   introThresholdSec = 3,
// ): Promise<{
//   introOnsetSec: number | null;
//   isMusicInIntro: boolean;
//   onsetOffset: number | null; // ✅ 수정됨
// }> {
//   const { pcm, sampleRate } = await extractPCMFromMediaElement(videoElem, introDurationSec);
//   //const onsetOffset = getFirstOnsetOffset(pcm, sampleRate); // ✅ 단일 값 (number | null)

//   const introOnsetSec = onsetOffset !== null ? onsetOffset : null;
//   const isMusicInIntro = introOnsetSec !== null && introOnsetSec < introThresholdSec;

//   return {
//     introOnsetSec,
//     isMusicInIntro,
//     onsetOffset,
//   };
// }
```

## File: lib/utils/audio/vad.ts
```typescript
// import { VAD } from '@ricky0123/vad';

// let vadInstance: VAD | null = null;

// // 음성 구간을 프레임(30ms) 단위로 감지하여 결과(음성: true/무음: false) 배열을 반환
// export async function runVAD(audioBuffer: Float32Array): Promise<boolean[]> {
//   if (!vadInstance) {
//     vadInstance = new VAD();
//     await vadInstance.init();
//   }

//   const sampleRate = 16000; // 표준 VAD 입력 샘플레이트
//   const frameDurationMs = 30;
//   const frameSize = (sampleRate * frameDurationMs) / 1000; // 480개 샘플 (30ms @16kHz)

//   const vadResults: boolean[] = [];
//   const totalFrames = Math.floor(audioBuffer.length / frameSize);

//   for (let i = 0; i < totalFrames; i++) {
//     const start = i * frameSize;
//     const end = start + frameSize;
//     const frame = audioBuffer.subarray(start, end);
//     // VAD가 이 프레임에서 음성이 감지되면 true 반환
//     const isSpeech = await vadInstance.isSpeech(frame as Float32Array);
//     vadResults.push(isSpeech);
//   }
//   return vadResults;
// }
```

## File: lib/utils/cache/lyricsCache.ts
```typescript
// lib/utils/cache/lyricsCache.ts

const MEMORY_CACHE: Record<string, { value: any; expire: number; etag?: string }> = {};
const DEFAULT_TTL = 6 * 60 * 60 * 1000; // 6시간

export function getFromLyricsCache(key: string) {
  // 1. localStorage 우선 체크
  const ls = localStorage.getItem(key);
  if (ls) {
    try {
      const obj = JSON.parse(ls);
      if (obj.expire > Date.now()) {
        console.log(`[LyricsCache] 캐시 히트 (localStorage): key=${key}`);
        return obj.value;
      } else {
        localStorage.removeItem(key);
        console.log(`[LyricsCache] 캐시 만료 (localStorage): key=${key}`);
      }
    } catch {
      // 파싱 에러 등은 무시하고 계속 진행
    }
  }
  // 2. in-memory fallback
  const item = MEMORY_CACHE[key];
  if (item) {
    if (item.expire > Date.now()) {
      console.log(`[LyricsCache] 캐시 히트 (memory): key=${key}`);
      return item.value;
    } else {
      delete MEMORY_CACHE[key];
      console.log(`[LyricsCache] 캐시 만료 (memory): key=${key}`);
    }
  }
  // 3. 완전 miss
  console.log(`[LyricsCache] 캐시 미스: key=${key}`);
  return null;
}

export function setToLyricsCache(
  key: string,
  value: any,
  { ttl = DEFAULT_TTL, etag }: { ttl?: number; etag?: string } = {},
) {
  const expire = Date.now() + ttl;
  // 메모리 저장
  MEMORY_CACHE[key] = { value, expire, etag };
  // localStorage 동기화
  try {
    localStorage.setItem(key, JSON.stringify({ value, expire, etag }));
    console.log(`[LyricsCache] 캐시 저장됨(localStorage): key=${key}, 만료=${ttl / 1000}s`);
  } catch {
    // localStorage 용량 초과 등 무시 (메모리 캐시만 보허)
    console.warn(`[LyricsCache] localStorage 저장 실패: key=${key}`);
  }
}

export function getETagForLyrics(key: string): string | undefined {
  return MEMORY_CACHE[key]?.etag;
}
```

## File: lib/utils/common/common.ts
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

## File: lib/utils/common/stringUtils.ts
```typescript
// src/lib/utils/stringUtils.ts
import { EXTRA_KEYWORDS } from '@constants/keywords';

/**
 * 문자열에서 부가정보(괄호, 대괄호, 파이프 등)를 제거합니다.
 */
export function cleanUp(str: string): string {
  return str
    .replace(/\[.*?\]/g, '') // 대괄호 제거
    .replace(/\\s{2,}/g, ' ') // 이중 공백 정리
    .trim();
}

function cleanMusicKeyword(str: string): string {
  return str
    .replace(/([^A-Za-z]|^)(OP|ED|OST|MV)([^A-Za-z]|$)/gi, (_match, p1, _p2, p3) => {
      return `${p1}${p3}`.replace(/\s{2,}/g, ' ');
    })
    .trim();
}
export function removeExtraInfo(title: string): string {
  const extraKeywords = EXTRA_KEYWORDS.slice().sort((a, b) => b.length - a.length); // 긴 키워드 우선
  let result = title;

  // 1. 복합 키워드(공백/특수문자 포함) 전체 제거
  for (const kw of extraKeywords) {
    // 키워드가 특수문자 포함 가능하므로 escape 처리
    const regex = new RegExp(`(\\s*${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    result = result.replace(regex, '').trim();
  }

  // 2. 기존 구분자 분할(남아있는 경우만)
  const parts = result.split(/\s*[-/|]\s*/);
  while (parts.length > 1 && extraKeywords.some((kw) => parts[parts.length - 1]?.toLowerCase().includes(kw))) {
    parts.pop();
  }
  result = parts.join(' - ');

  // 3. 끝에 남아있는 부가정보 반복 제거
  let found = true;
  while (found) {
    found = false;
    for (const kw of extraKeywords) {
      const regex = new RegExp(`(\\s*${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})$`, 'i');
      if (regex.test(result)) {
        result = result.replace(regex, '').trim();
        found = true;
      }
    }
  }

  result = parts.filter(Boolean).join(' - '); // 빈 값 제거 후 합치기
  result = result.replace(/[-/|]+$/, '').trim(); // 끝에 남은 구분자 제거

  return result;
}

export function removeTrailingHashtags(title: string): string {
  // 곡명 끝에 연속된 해시태그만 제거
  return title.replace(/(\s*#[\p{L}\p{N}._-]+)+\s*$/gu, '').trim();
}

export function removeDatePattern(str: string): string {
  return str.replace(/\b\d{2}[01]\d(?:3[0-2]|[0-2][0-9])\b/g, '').trim();
}

export function extractArtistAndTitleCustom(rawTitle: string): { artist: string; title: string } | null {
  const cleaned = cleanUp(rawTitle);

  // 1. 쌍따옴표(“ ” 또는 " ") 패턴 우선 적용
  const match = cleaned.match(/^(.+?)\s*[“"](.+?)[”"]/);
  let artist = '',
    title = '';
  if (match) {
    artist = match[1]?.trim() ?? '';
    title = match[2]?.trim() ?? '';
  } else {
    // 2. 구분자(split) 기반 추출
    const delimiters = [' - ', ' / ', ' | '];
    for (const delim of delimiters) {
      if (cleaned.includes(delim)) {
        const parts = cleaned.split(delim);
        if (parts.length >= 2) {
          artist = parts[0]?.trim() ?? '';
          title = parts.slice(1).join(delim).trim();
          break;
        }
      }
    }
  }

  // 2. remove extra info
  title = removeExtraInfo(title);
  artist = cleanMusicKeyword(artist);
  title = cleanMusicKeyword(title);

  // 3. 추가 패턴: "아티스트 '곡명'" 또는 "아티스트 \"곡명\""
  if (!artist || !title) {
    // 따옴표
    const match = cleaned.match(/^(.+?)\s*['"](.+?)['"]/);
    if (match) {
      artist = match[1]?.trim() ?? '';
      title = match[2]?.trim() ?? '';
    }
  }

  // 4. 추가 패턴: 괄호
  if (!artist || !title) {
    const match = cleaned.match(/^(.+?)\s*\((.+?)\)/);
    if (match) {
      artist = match[1]?.trim() ?? '';
      title = match[2]?.trim() ?? '';
    }
  }

  // 5. 추가 패턴: 아티스트와 곡명이 모두 영문/숫자/공백으로만 구성된 경우
  if (!artist || !title) {
    // 대문자로 시작하는 두 단어 이상이면 첫 단어를 아티스트, 나머지를 곡명으로 추정
    const match = cleaned.match(/^([A-Za-z가-힣0-9]+)\s+(.+)$/);
    if (match) {
      artist = match[1]?.trim() ?? '';
      title = match[2]?.trim() ?? '';
    }
  }

  // 6. 곡명에서 부가정보 추가 제거
  title = removeExtraInfo(title);
  title = removeTrailingHashtags(title);
  title = removeDatePattern(title);
  title = title.replace(/[-/|]+$/, '').trim(); // 끝에 남은 구분자도 제거

  if (!artist || !title) return null;
  artist = removeEmptyBrackets(removeExtraInfo(artist));

  return { artist, title };
}
export function extractEnglishOnly(str: string): string {
  // 연속 영어 단어와 공백, 일부 특수문자만 추출
  const match = str.match(/([A-Za-z][A-Za-z\s'’&.-]*)/g);
  return match ? match.join(' ').trim() : '';
}

export function removeEmptyBrackets(title: string): string {
  return title
    .replace(/\(\s*\)/g, '')
    .replace(/\[\s*\]/g, '')
    .replace(/\{\s*\}/g, '')
    .trim();
}
```

## File: lib/utils/common/time.ts
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
 * ISO 8601 duration (예: "PT4M13S")를 초 단위(숫자)로 변환
 * @param isoString ISO 8601 duration 문자열 (예: "PT1H2M10S", "PT3M5S", "PT22S")
 * @returns 초 단위 숫자 (실패시 0)
 */
export function parseISO8601Duration(isoString: string): number {
  if (!isoString || typeof isoString !== 'string') return 0;
  // 정규식: PT#H#M#S 각 단위 별 추출 (H, M, S는 생략 가능함)
  const match = isoString.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseFloat(match[3] || '0');

  return hours * 3600 + minutes * 60 + seconds;
}

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

## File: lib/utils/common/typeGuards.ts
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

## File: lib/utils/dom/domUtils.ts
```typescript
// src/lib/utils/domUtils.ts

import { YOUTUBE_PLAYER_SELECTOR } from '@constants/youtubeSelectors';

// 요소 대기 함수
export const waitForElement = <T extends Element>(selector: string, timeout = 5000): Promise<T> => {
  return new Promise((resolve, reject) => {
    const element = document.querySelector<T>(selector);
    if (element) return resolve(element);

    const observer = new MutationObserver(() => {
      const found = document.querySelector<T>(selector);
      if (found) {
        cleanup();
        resolve(found);
      }
    });

    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error(`Element ${selector} not found in ${timeout}ms`));
    }, timeout);

    const cleanup = () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};

// 요소 생성 함수
export const createElement = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options?: ElementCreationOptions,
): HTMLElementTagNameMap[K] => {
  return document.createElement(tagName, options);
};

// 안전한 요소 삽입
export const safeAppendChild = (parent: Node, child: Node): boolean => {
  try {
    parent.appendChild(child);
    return true;
  } catch (error) {
    console.error('DOM append failed:', error);
    return false;
  }
};
// 요소 제거 유틸리티
export const removeElement = (selector: string): boolean => {
  const element = document.querySelector(selector);
  if (!element) return false;
  element.remove();
  return true;
};

// CSS 클래스 토글
export const toggleClass = (element: Element, className: string, force?: boolean): boolean => {
  if (!element) return false;
  element.classList.toggle(className, force);
  return true;
};

export function isAdPlaying() {
  const player = document.querySelector(YOUTUBE_PLAYER_SELECTOR);
  return player && (player.classList.contains('ad-showing') || player.classList.contains('ad-interrupting'));
}
```

## File: lib/utils/dom/styleInjection.ts
```typescript
// utils/styleInjection.ts
export const injectGlobalStyles = () => {
  const styleId = 'karaoke-global-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* YouTube 기본 요소 숨기기 */
    ytd-watch-flexy[theater] #player-wide-container,
    ytd-watch-flexy #player-wide-container {
      display: none !important;
    }

    /* 스크롤 방지 */
    body.karaoke-mode {
      overflow: hidden !important;
    }
  `;
  document.head.appendChild(style);
};

injectGlobalStyles();
```

## File: lib/utils/infra/listenerManager.ts
```typescript
// src/lib/utils/listenerManager.ts

type UnregisterFn = () => void;

class ListenerManager {
  private unregisterFns: UnregisterFn[] = [];

  /**
   * 리스너 등록 함수
   * @param register 등록 함수 (리스너 등록 시 호출, 해제 함수 반환)
   */
  public add(register: () => UnregisterFn): void {
    const unregister = register();
    this.unregisterFns.push(unregister);
  }

  /**
   * 모든 리스너 해제 (cleanup)
   */
  public removeAll(): void {
    this.unregisterFns.forEach((unregister) => {
      try {
        unregister();
      } catch {
        // 해제 중 에러 무시
      }
    });
    this.unregisterFns = [];
  }
}

// 싱글 인스턴스 export (프로젝트 전체에서 공유)
export const listenerManager = new ListenerManager();
```

## File: lib/utils/infra/registerAllListeners.ts
```typescript
import { listenerManager } from './listenerManager';
import { STORAGE_KEYS } from '@constants/storageKeys';

// 필요한 핸들러 함수도 이 파일에서 선언하거나 import
export function registerAllListeners(setDetectionState: (enabled: boolean) => void) {
  // 1. chrome.storage.onChanged 리스너
  listenerManager.add(() => {
    const handler = (
      changes: { [key: string]: chrome.storage.StorageChange },
      // areaName?: 'sync' | 'local' | 'managed' | 'session'
    ) => {
      const contentEnabledChange = changes[STORAGE_KEYS.CONTENT_ENABLED];
      if (contentEnabledChange && typeof contentEnabledChange.newValue === 'boolean') {
        setDetectionState(contentEnabledChange.newValue);
      }
    };
    chrome.storage.onChanged.addListener(handler);
    return () => chrome.storage.onChanged.removeListener(handler);
  });

  // 2. window resize 리스너
  listenerManager.add(() => {
    const onResize = (/*event: UIEvent*/) => {
      // 예: 가사 UI 레이아웃 동기화 등
      // updateLyricsContainerLayout();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  });

  // 3. 필요한 다른 리스너도 이곳에 추가
}
```

## File: lib/utils/infra/singletonListener.ts
```typescript
// src/lib/utils/singletonListener.ts
// 공통 리스너 관리 모듈
export function registerSingletonListener(flagName: string, registerFn: () => void) {
  // 타입 안전하게 window에 동적 속성 부여
  const win = window as unknown as Record<string, unknown>;
  if (!win[flagName]) {
    registerFn();
    win[flagName] = true;
  }
}
```

## File: lib/utils/infra/uiResourceManager.ts
```typescript
// src/lib/utils/uiResourceManager.ts
type RemovableElement = HTMLElement | HTMLStyleElement;

export class UIResourceManager {
  private elements: RemovableElement[] = [];

  register(el: RemovableElement) {
    this.elements.push(el);
  }

  cleanup() {
    this.elements.forEach((el) => {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
    this.elements = [];
  }
}
```

## File: lib/utils/lyrics/artistTitle.ts
```typescript
import getArtistTitle from 'get-artist-title';

/**
 * 유튜브 영상 제목에서 [아티스트, 타이틀] 추출
 */
export function extractArtistAndTitle(title: string): { artist: string; title: string } | null {
  const [artist, songTitle] = getArtistTitle(title) || [];
  if (artist && songTitle) {
    return { artist, title: songTitle };
  }
  return null;
}
```

## File: lib/utils/lyrics/getLyricsFromCacheOrFetch.ts
```typescript
// lib/utils/lyrics/getLyricsFromCacheOrFetch.ts

import { normalizeLyricsQuery } from './queryNormalizer';
import { getFromLyricsCache, setToLyricsCache } from '@lib/utils/cache/lyricsCache';

export async function getLyricsFromCacheOrFetch(
  artist: string,
  title: string,
  options: {
    lang?: string;
    fetch: (apiOpts: {
      etag?: string;
    }) => Promise<{ lyrics: string; artist?: string; title?: string; duration?: number; id?: string; etag?: string }>;
  },
): Promise<{ lyrics: string; artist?: string; title?: string; duration?: number }> {
  const key = normalizeLyricsQuery(artist, title, { lang: options.lang });

  // 1. 캐시 시도
  const cached = getFromLyricsCache(key);
  if (cached) return cached;

  // fetch
  const fetchResult = await options.fetch({});
  setToLyricsCache(key, fetchResult);

  return fetchResult;
}
```

## File: lib/utils/lyrics/languageDetector.ts
```typescript
// 가사의 언어 감지
```

## File: lib/utils/lyrics/lyrics.ts
```typescript
import { Line } from '@lib/types/lyrics';

// src/lib/utils/lyrics.ts
export function extractFirstLrcTimestamp(lyrics: string | Line[]): number {
  // 1. 배열(파싱된 LRC)인 경우:
  if (Array.isArray(lyrics)) {
    if (!lyrics.length) return 0;
    const firstLine = lyrics[0];
    if (!firstLine || typeof firstLine.time !== 'number') return 0;
    return firstLine.time;
  }

  // 2. string(LRC 원문)인 경우, 정규식으로 파싱
  const match = lyrics.match(/\[(\d+):(\d+[.\d+]*)\]/);
  if (!match || typeof match[1] !== 'string' || typeof match[2] !== 'string') return 0;

  const min = parseInt(match[1], 10);
  const sec = parseFloat(match[2]);

  if (isNaN(min) || isNaN(sec)) return 0;
  return min * 60 + sec;
}
```

## File: lib/utils/lyrics/lyricsDisplay.ts
```typescript
// utils/lyricsDisplay.ts
import { Line } from '@lib/types/lyrics';

export interface DisplayIndices {
  top: string;
  bottom: string;
  highlightTop: boolean;
  highlightBottom: boolean;
}

export function getDisplayLines(lines: Line[], currentTime: number): DisplayIndices {
  if (lines.length === 0) {
    return { top: '', bottom: '', highlightTop: false, highlightBottom: false };
  }

  let activeIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const cur = lines[i];
    const next = lines[i + 1];
    if (!cur) continue;

    const endTime = next?.time ?? Infinity;
    const previewTime = cur.time + (endTime - cur.time) * 0.5;

    if (currentTime >= cur.time && currentTime < previewTime) {
      activeIndex = i;
      break;
    } else if (currentTime >= previewTime && currentTime < endTime) {
      activeIndex = i + 1;
      break;
    }
  }

  if (activeIndex === -1) {
    const firstLine = lines[0];
    if (firstLine && currentTime < firstLine.time) {
      // 첫 타임스탬프 전: 아무 자막도 출력하지 않음
      return { top: '', bottom: '', highlightTop: false, highlightBottom: false };
    }
    activeIndex = lines.length - 1; // 곡이 끝난 뒤, 마지막 가사 유지
  }

  // 위치는 교대로: 0번째는 bottom, 1번째는 top, 2번째는 bottom, 3번째는 top ...
  const isEven = activeIndex % 2 === 0;

  const topIdx = isEven ? activeIndex - 1 : activeIndex;
  const bottomIdx = isEven ? activeIndex : activeIndex - 1;

  return {
    top: topIdx >= 0 ? (lines[topIdx]?.text ?? '') : '',
    bottom: bottomIdx >= 0 ? (lines[bottomIdx]?.text ?? '') : '',
    highlightTop: !isEven, // 홀수 번째 줄이면 top 강조
    highlightBottom: isEven, // 짝수 번째 줄이면 bottom 강조
  };
}
```

## File: lib/utils/lyrics/lyricsParser.ts
```typescript
// LRC 등 싱크 가사 포맷을 파싱해, [time, text] 배열로 변환합니다.
// 싱크 자막, 전체 가사, 하이라이트 등 다양한 곳에서 재사용할 수 있습니다.

import { Line } from '@lib/types/lyrics';
import { parseTimeToSeconds } from '@lib/utils/common/time';

/**
 * LRC 형식의 가사 문자열을 파싱하여 [{ time, text }] 배열로 반환
 */ export function parseLyrics(lyrics: string): Line[] {
  if (!lyrics || lyrics.trim() === '') {
    console.warn('[lyricsParser] 입력된 lyrics가 비어 있음');
    return [];
  }
  const result = lyrics.split('\n').reduce<Line[]>((acc, line) => {
    const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
    if (!match) return acc;
    const [, min, sec, text] = match;
    const safeText = (text ?? '').trim();
    if (safeText === '') return acc;
    acc.push({ time: parseTimeToSeconds(`${min}:${sec}`), text: safeText });
    return acc;
  }, []);
  if (!result.length) {
    console.warn('[lyricsParser] LRC 파싱 결과가 없음');
  }
  return result;
}
```

## File: lib/utils/lyrics/queryNormalizer.ts
```typescript
// lib/utils/lyrics/queryNormalizer.ts

/**
 * 가사 검색 쿼리를 유니크한 캐시 키로 정규화합니다.
 * artist, title, lang, 기타 옵션까지 모두 key에 포함.
 */
export function normalizeLyricsQuery(
  artist: string,
  title: string,
  options?: { lang?: string; [key: string]: any },
): string {
  const normArtist = artist.trim().toLowerCase().replace(/\s+/g, ' ');
  const normTitle = title.trim().toLowerCase().replace(/\s+/g, ' ');
  let key = `${normArtist}::${normTitle}`;

  if (options?.lang) {
    key += `::${options.lang.toLowerCase()}`;
  }

  // 필요시 기타 옵션 정규화 추가
  // (예: 키워드, 정렬 순서 등)
  if (options) {
    Object.entries(options)
      .filter(([k]) => k !== 'lang')
      .sort()
      .forEach(([k, v]) => {
        key += `::${k}=${String(v).toLowerCase()}`;
      });
  }
  return key;
}
```

## File: lib/utils/platform/contentGuard.ts
```typescript
// lib/utils/contentGuard.ts
// contents 비활성화/활성화 여부에 따라 진행되는 함수의 경우 해당 함수 사용
// 함수 실행 전 콘텐츠 활성화 여부를 검사하는 함수
export function withContentEnabled<Args extends unknown[], R>(
  getContentEnabled: () => boolean,
  fn: (...args: Args) => R,
): (...args: Args) => R | undefined {
  return function (...args: Args): R | undefined {
    if (!getContentEnabled()) return;
    return fn(...args);
  };
}
```

## File: lib/utils/platform/playerUtils.ts
```typescript
// src/utils/playerUtils.ts

// YouTube 플레이어 이동 유틸리티
export const moveYouTubePlayer = (targetContainer: HTMLElement, playerSelector = '#movie_player'): boolean => {
  const player = document.querySelector(playerSelector) as HTMLElement;
  if (!player || !targetContainer) {
    console.error('[moveYouTubePlayer] 플레이어 또는 컨테이너를 찾을 수 없음');
    return false;
  }

  try {
    console.log('[moveYouTubePlayer] 플레이어 이동 시작');

    // // 플레이어 스타일 백업
    // const originalStyles = {
    //   position: player.style.position,
    //   zIndex: player.style.zIndex,
    //   opacity: player.style.opacity,
    //   visibility: player.style.visibility
    // };

    // 플레이어 강제 표시
    player.style.opacity = '1';
    player.style.visibility = 'visible';
    player.style.display = 'block';
    player.style.position = 'relative';
    player.style.zIndex = '1000';

    // 플레이어 이동
    targetContainer.appendChild(player);

    console.log('[moveYouTubePlayer] 플레이어 이동 완료');

    // 리사이즈 트리거
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);

    return true;
  } catch (error) {
    console.error('[moveYouTubePlayer] 플레이어 이동 실패:', error);
    return false;
  }
};

// 플레이어 상태 체크
export const isPlayerReady = (): boolean => {
  return !!document.querySelector('video');
};
```

## File: lib/utils/platform/videoDetection.ts
```typescript
// lib/utils/videoDetection.ts
let lastVideoId: string | null = null;
let lastDetection = 0;
export function shouldDetect(videoId: string, cooldown = 10000): boolean {
  const now = Date.now();
  if (videoId === lastVideoId && now - lastDetection < cooldown) return false;
  lastVideoId = videoId;
  lastDetection = now;
  return true;
}

// 새로운, 더 활용도 높은 형태
export function tryDetectVideoChange(videoId: string | null, trigger: () => void, cooldown = 10000) {
  if (!videoId) return;
  if (shouldDetect(videoId, cooldown)) {
    trigger();
  }
}
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
    attributes: true,
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
