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
background/api/lrclib.ts
background/api/lyrics.ts
background/api/musicBrainz.ts
background/api/youtube.ts
background/background.ts
components/common/ErrorFallback.tsx
components/common/LoadingOverlay.tsx
components/karaoke-player-settings/AdvancedSettingsMenu.tsx
components/karaoke-player-settings/FontStyleMenu.tsx
components/karaoke-player-settings/LyricsDisplayMenu.tsx
components/karaoke-player-settings/MainMenu.module.css
components/karaoke-player-settings/MainMenu.tsx
components/karaoke-player-settings/MusicNoteButton.tsx
components/karaoke-player-settings/styles.module.css
components/lyrics/DualHighlightSubtitle.tsx
components/lyrics/KaraokePlayerContainer/index.tsx
components/lyrics/KaraokePlayerContainer/styles.module.css
components/lyrics/LyricsOverlayRoot.tsx
components/lyrics/LyricsSidebar/index.tsx
components/lyrics/LyricsSidebar/LyricsPanel.tsx
components/lyrics/styles.module.css
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
lib/types/audio-worklet.d.ts
lib/types/config.ts
lib/types/cssmodules.d.ts
lib/types/errors.ts
lib/types/global.d.ts
lib/types/i18next.d.ts
lib/types/lyrics.ts
lib/types/message.ts
lib/types/translationKeys.ts
lib/types/video.ts
lib/types/wasm-js.d.ts
lib/utils/audio/audio.ts
lib/utils/audio/audioAnalysis.ts
lib/utils/audio/audioProcessor.ts
lib/utils/audio/musicDetection.ts
lib/utils/audio/vad.ts
lib/utils/cache/lyricsCache.ts
lib/utils/common/common.ts
lib/utils/common/stringUtils.ts
lib/utils/common/time.ts
lib/utils/common/typeGuards.ts
lib/utils/dom/domUtils.ts
lib/utils/dom/styleInjection.ts
lib/utils/infra/adWatcher.ts
lib/utils/infra/listenerManager.ts
lib/utils/infra/registerAllListeners.ts
lib/utils/infra/singletonListener.ts
lib/utils/infra/uiResourceManager.ts
lib/utils/lyrics/artistTitle.ts
lib/utils/lyrics/getLyricsFromCacheOrFetch.ts
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

## File: background/api/lrclib.ts
```typescript
// background/api/lrclib.ts
import { Line } from '@lib/types/lyrics';
export interface LrcLibLyricsResult {
  lyrics: string | Line[];
  duration?: number;
  artist?: string;
  title?: string;
  id?: string;
  etag?: string;
}

// artist_name과 track_name으로 한정 검색: 오탐지를 줄이기 위한 별도 함수
export async function fetchLyricsByArtistAndTrack(
  artist: string,
  title: string,
): Promise<LrcLibLyricsResult | undefined> {
  async function searchWithParams(artistParam: string, titleParam: string) {
    const endpoint = `https://lrclib.net/api/search?artist_name=${encodeURIComponent(artistParam)}&track_name=${encodeURIComponent(titleParam)}`;
    const searchRes = await fetch(endpoint);
    if (!searchRes.ok) return undefined;
    const searchData = await searchRes.json();

    let fallbackResult: LrcLibLyricsResult | undefined = undefined;
    const normalizedReqTitle = titleParam.trim().toLowerCase();

    for (const candidate of searchData) {
      const detailRes = await fetch(`https://lrclib.net/api/get/${candidate.id}`);
      if (!detailRes.ok) continue;
      const detail = await detailRes.json();

      const lyrics = detail.syncedLyrics || detail.plainLyrics;
      if (!lyrics) continue;

      const candidateTitle = detail.title?.trim().toLowerCase() ?? '';

      if (candidateTitle === normalizedReqTitle) {
        console.log('가사:', lyrics);
        return {
          lyrics,
          duration: detail.duration,
          artist: detail.artist,
          title: detail.title,
          id: candidate.id,
        };
      }

      if (!fallbackResult) {
        console.log('2nd 가사:', lyrics);
        fallbackResult = {
          lyrics,
          duration: detail.duration,
          artist: detail.artist,
          title: detail.title,
          id: candidate.id,
        };
      }
    }
    return fallbackResult;
  }

  // 1차 시도: 정상 아티스트-곡명 순서
  const result1 = await searchWithParams(artist, title);
  if (result1) return result1;

  // 2차 시도: 아티스트와 곡명을 뒤바꿔서 검색
  if (artist.toLowerCase() !== title.toLowerCase()) {
    const result2 = await searchWithParams(title, artist);
    if (result2) return result2;
  }

  return undefined;
}
```

## File: background/api/lyrics.ts
```typescript
import { isEnglishText, replaceAmpersand } from '@lib/utils/common/stringUtils';
import { fetchLyricsByArtistAndTrack, LrcLibLyricsResult } from './lrclib';
import { extractEnglishAliasFromArtists, fetchEnglishAliasForArtist, searchArtistByFreeText } from './musicBrainz';

export async function fetchLyricsWithAliasFallback(artist: string, title: string): Promise<LrcLibLyricsResult> {
  let artistForSearch = replaceAmpersand(artist, 'and');
  let titleForSearch = replaceAmpersand(title, 'and');
  console.log('artist:', artistForSearch, 'title:', titleForSearch);

  const areBothEnglish = isEnglishText(artistForSearch) && isEnglishText(titleForSearch);

  let result = null;

  // 둘 다 영어일 경우
  if (areBothEnglish) {
    // 1차: 기존 아티스트명으로 먼저 시도
    result = await fetchLyricsByArtistAndTrack(artistForSearch, titleForSearch);
    if (result) return result;

    // 2차: 영문 alias 조회 및 재시도
    const englishArtist = await fetchEnglishAliasForArtist(artistForSearch);
    if (englishArtist && englishArtist !== artistForSearch) {
      result = await fetchLyricsByArtistAndTrack(englishArtist, titleForSearch);
      if (result) {
        console.log(`[Info] 영어 alias (${englishArtist})로 가사 검색 성공: ${englishArtist} - ${titleForSearch}`);
        return result;
      }
    }

    // 3차: alias 실패하면 freeText 검색 시도
    const candidates = await searchArtistByFreeText(artist);
    if (candidates && candidates.length > 0) {
      const extractedAlias = extractEnglishAliasFromArtists(candidates);
      console.log(`[Info] FreeText 검색에서 추출된 영어 별칭: ${extractedAlias}`);

      if (extractedAlias && extractedAlias !== artist) {
        result = await fetchLyricsByArtistAndTrack(extractedAlias, title);
        if (result) {
          console.log(
            `[Info] FreeText 검색에서 영어 alias (${extractedAlias})로 가사 검색 성공: ${extractedAlias} - ${title}`,
          );
          return result;
        }
      }
    }

    // 모두 실패 시 에러
    throw new Error('LRCLIB에서 가사 정보를 찾을 수 없습니다! (영문 공식/별칭 모두 실패)');
  } else {
    let englishArtist = await fetchEnglishAliasForArtist(artist);

    // 1차 alias 실패 시 freeText 시도
    if (!englishArtist) {
      const candidates = await searchArtistByFreeText(artist);
      if (candidates && candidates.length > 0) {
        englishArtist = extractEnglishAliasFromArtists(candidates);
      }
    }

    if (englishArtist && englishArtist !== artist) {
      result = await fetchLyricsByArtistAndTrack(englishArtist, title);
      if (result) {
        console.log(`[Info] 영어 공식명 (${englishArtist})로 가사 검색 성공: ${englishArtist} - ${title}`);
        return result;
      }
    }
    throw new Error('LRCLIB에서 가사 정보를 찾을 수 없습니다! (공식 영어명 매핑 실패)');
  }
}
```

## File: background/api/musicBrainz.ts
```typescript
import { isEnglishText } from '@lib/utils/common/stringUtils';

// background/api/musicBrainz.ts
const BASE_URL = 'https://musicbrainz.org/ws/2';
const USER_AGENT = process.env.MUSICBRAINZ_USER_AGENT!;

type Alias = {
  name: string;
  locale?: string;
  primary?: boolean;
  type?: string;
};

type Artist = {
  name: string;
  aliases?: Alias[];
};

type MusicBrainzResponse = {
  artists?: Artist[];
};

/**
 * MusicBrainz API 호출 시 반드시 User-Agent 헤더를 포함해야 함
 * 아티스트명에 대한 영문명(alias) 자동 추출 함수
 */
export async function fetchEnglishAliasForArtist(artistName: string): Promise<string | null> {
  if (!artistName) {
    console.warn('[MusicBrainz] artistName is empty or falsy');
    return null;
  }
  const query = encodeURIComponent(artistName);
  const url = `${BASE_URL}/artist?query=artist:${query}&fmt=json&limit=3`;

  try {
    if (!USER_AGENT) {
      throw new Error('MUSICBRAINZ_USER_AGENT 환경변수가 설정되어 있지 않습니다.');
    }

    console.log(`[MusicBrainz] Requesting artist alias for: "${artistName}"`);
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    if (!res.ok) {
      console.error(`[MusicBrainz] API 응답 실패: ${res.status} ${res.statusText}`);
      return null;
    }

    const data: MusicBrainzResponse = await res.json();
    console.log(`[MusicBrainz] API 응답 JSON 아티스트 수: ${data.artists?.length || 0}`);

    if (!data.artists || data.artists.length === 0) {
      console.warn('[MusicBrainz] artists 배열이 빈 배열이거나 없음');
      return null;
    }

    return extractEnglishAliasFromArtists(data.artists);
  } catch (error) {
    console.error('[MusicBrainz] API 호출 중 오류 발생:', error);
    return null;
  }
}

/**
 * 프리텍스트로 MusicBrainz에서 아티스트를 검색
 *
 * @param queryStr 검색어 (비영문, 오타, 별칭 등 포함 가능)
 * @returns Artist[] | null
 */
export async function searchArtistByFreeText(queryStr: string): Promise<Artist[] | null> {
  if (!queryStr) return null;

  const query = encodeURIComponent(queryStr);
  const url = `${BASE_URL}/artist?query=${query}&fmt=json&limit=5`;

  try {
    if (!USER_AGENT) {
      throw new Error('MUSICBRAINZ_USER_AGENT 환경변수가 설정되어 있지 않습니다.');
    }

    console.log(`[MusicBrainz] [FreeText] 프리텍스트 artist 검색: "${queryStr}"`);
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
    });

    if (!res.ok) {
      console.error(`[MusicBrainz] [FreeText] API 응답 실패: ${res.status} ${res.statusText}`);
      return null;
    }

    const data: MusicBrainzResponse = await res.json();
    console.log(`[MusicBrainz] [FreeText] 결과 artist 수: ${data.artists?.length || 0}`);

    if (!data.artists || data.artists.length === 0) {
      return null;
    }

    // 결과로 Artist[] 반환 (alias 추출은 호출부에서 담당)
    return data.artists;
  } catch (error) {
    console.error('[MusicBrainz] [FreeText] API 호출 중 오류 발생:', error);
    return null;
  }
}

// 기존 fetchEnglishAliasForArtist 내부에 있던 alias 파싱 로직을 따로 함수로
export function extractEnglishAliasFromArtists(artists: Artist[]): string | null {
  for (const artist of artists) {
    if (artist.aliases && artist.aliases.length > 0) {
      let englishAlias = artist.aliases.find(
        (alias) => typeof alias.locale === 'string' && alias.locale.toLowerCase() === 'en',
      );
      if (!englishAlias) {
        englishAlias = artist.aliases.find((alias) => alias.primary === true && isEnglishText(alias.name));
      }
      if (englishAlias?.name) {
        console.log(`[MusicBrainz] 영어 alias 발견: ${englishAlias.name}`);
        return englishAlias.name;
      }
    }

    if (isEnglishText(artist.name)) {
      console.log(`[MusicBrainz] 아티스트명이 이미 영어로 추정됨: ${artist.name}`);
      return artist.name;
    }
  }
  return null;
}

/**
 * 곡명에 대한 영문명 변환 함수 (work, recording 검색) - 필요시 구현 가능
 */
//export async function fetchEnglishAliasForTitle(title: string): Promise<string | null> {
// MusicBrainz는 곡명 검색이 아티스트 검색보다 약간 복잡
// ws/2/recording 또는 ws/2/work를 활용해야 함
// 구현 필요 시 알려주세요
// return null;
//}
```

## File: background/api/youtube.ts
```typescript
import { parseISO8601Duration } from '@lib/utils/common/time';
import { getFromLyricsCache, setToLyricsCache } from '@lib/utils/cache/lyricsCache';

export interface YouTubeVideoMetaCacheValue {
  categoryId: string;
  title: string;
  description: string;
  tags: string[];
  channelTitle: string;
  durationSec: number;
}

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
    const result: YouTubeVideoMetaCacheValue = {
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

## File: components/karaoke-player-settings/AdvancedSettingsMenu.tsx
```typescript
// 기타 메뉴
// src/components/karaoke-player-settings/AdvancedSettingsMenu.tsx
import React from 'react';

interface AdvancedSettingsMenuProps {
  onBack: () => void;
}

export const AdvancedSettingsMenu: React.FC<AdvancedSettingsMenuProps> = ({ onBack }) => {
  return (
    <div>
      <button onClick={onBack}>← 뒤로</button>
      <h3>기타 설정</h3>
      <ul>
        <li>
          <button onClick={() => alert('설정 초기화 완료!')}>설정 초기화</button>
        </li>
        <li>
          {/* 필요 시 추가 고급 옵션 */}
          {/* <button>고급 동기화</button> */}
        </li>
      </ul>
    </div>
  );
};
```

## File: components/karaoke-player-settings/FontStyleMenu.tsx
```typescript
// 글꼴 스타일 메뉴 2차// src/components/karaoke-player-settings/FontStyleMenu.tsx
import React from 'react';

interface FontStyleMenuProps {
  onBack: () => void;
}

export const FontStyleMenu: React.FC<FontStyleMenuProps> = ({ onBack }) => {
  return (
    <div>
      <button onClick={onBack}>← 뒤로</button>
      <h3>글자(자막 스타일) 설정</h3>
      <ul>
        <li>
          <label>
            폰트 종류
            <select defaultValue="default">
              <option value="default">기본</option>
              <option value="serif">세리프</option>
              <option value="monospace">모노스페이스</option>
            </select>
          </label>
        </li>
        <li>
          <label>
            글자 크기
            <input type="range" min="10" max="40" defaultValue="16" />
          </label>
        </li>
        <li>
          <label>
            글자 색상
            <input type="color" defaultValue="#ffffff" />
          </label>
        </li>
        <li>
          <label>
            <input type="checkbox" /> 테두리 효과
          </label>
        </li>
      </ul>
    </div>
  );
};
```

## File: components/karaoke-player-settings/LyricsDisplayMenu.tsx
```typescript
// 가사 디스플레이 상세 메뉴
// src/components/karaoke-player-settings/LyricsDisplayMenu.tsx
import React from 'react';

interface LyricsDisplayMenuProps {
  onBack: () => void;
}

export const LyricsDisplayMenu: React.FC<LyricsDisplayMenuProps> = ({ onBack }) => {
  return (
    <div>
      <button onClick={onBack}>← 뒤로</button>
      <h3>가사 디스플레이 설정</h3>
      <ul>
        <li>
          {/* 여기서부터는 ToggleItem 등 재사용 UI 컴포넌트로 대체 가능 */}
          <label>
            <input type="checkbox" /> 실시간 가사 On/Off
          </label>
        </li>
        <li>
          <label>
            <input type="checkbox" /> 발음 가사 On/Off
          </label>
        </li>
        <li>
          가사 표시 방식
          <select defaultValue="adjacent">
            <option value="adjacent">인접 가사만 보기</option>
            <option value="full">전체 가사 보기</option>
          </select>
        </li>
        <li>
          <label>
            <input type="checkbox" /> 전주(첫 가사까지) 건너뛰기 On/Off
          </label>
        </li>
      </ul>
    </div>
  );
};
```

## File: components/karaoke-player-settings/MainMenu.module.css
```css
/* MainMenu.module.css */
.container {
  width: 220px;
  height: 200px;
  background: rgba(28, 28, 28, 0.85);
  box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 24px;
  min-width: 230px;
  min-height: 100px;
  border-radius: 10px;
  border: 1px solid rgba(72, 72, 72, 0.5);
  backdrop-filter: blur(8px); /* 일부 브라우저 지원 */
  /* position, left, top, z-index는 인라인스타일로만! */
}
.menuList {
  list-style: none;
  padding: 4px 0;
  margin: 0;
}
.menuItem + .menuItem {
  margin-top: 6px;  /* 항목 사이 간격 */
}
.menuButton {
  all: unset;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center; /* 텍스트 중앙 정렬 */
  padding: 12px 0; /* 버튼 위아래 여유 */
  border-radius: 4px;
  font-size: 1rem;
  color: #fff;
  background: none;
  transition: background 0.13s;
}
.menuButton:hover,
.menuButton:focus-visible {
  background: rgba(255, 255, 255, 0.13);
}
.menuButton:active {
  background: rgba(255, 255, 255, 0.22);
}
```

## File: components/karaoke-player-settings/MainMenu.tsx
```typescript
// 1차 메뉴

import React, { useEffect, useRef, useState } from 'react';
import { LyricsDisplayMenu } from './LyricsDisplayMenu';
import { FontStyleMenu } from './FontStyleMenu';
import { AdvancedSettingsMenu } from './AdvancedSettingsMenu';
import styles from './MainMenu.module.css';

interface Position {
  top: number;
  left: number;
}

interface MainMenuProps {
  visible: boolean;
  position?: Position;
  onClose: () => void; // 외부 클릭시 호출하기 위해 onClose 필수
}

// MainMenu.tsx (메뉴 컨테이너 및 1차 메뉴 관리)
export const MainMenu: React.FC<MainMenuProps> = ({ visible, position, onClose }) => {
  const [currentSubMenu, setCurrentSubMenu] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // visible false 시 드릴다운 상태 초기화
  useEffect(() => {
    if (!visible) {
      setCurrentSubMenu(null);
    }
  }, [visible]);

  // 메뉴 외부 클릭 감지해서 닫기
  useEffect(() => {
    if (!visible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  // 드릴다운: 하위 메뉴가 있으면 그 컴포넌트로 전환
  if (currentSubMenu === 'lyrics') {
    return <LyricsDisplayMenu onBack={() => setCurrentSubMenu(null)} />;
  }
  if (currentSubMenu === 'font') {
    return <FontStyleMenu onBack={() => setCurrentSubMenu(null)} />;
  }
  if (currentSubMenu === 'advanced') {
    return <AdvancedSettingsMenu onBack={() => setCurrentSubMenu(null)} />;
  }

  return (
    <div
      ref={menuRef}
      className={styles.container}
      style={{
        position: 'absolute',
        left: position?.left ?? 100,
        top: position?.top ?? 100,
        transform: 'translate(-50%, 0)',
      }}
    >
      <h2 className={styles.title}>설정</h2>
      <ul className={styles.menuList}>
        <li className={styles.menuItem}>
          <button className={styles.menuButton} onClick={() => setCurrentSubMenu('lyrics')}>
            가사 디스플레이
          </button>
        </li>
        <li className={styles.menuItem}>
          <button className={styles.menuButton} onClick={() => setCurrentSubMenu('font')}>
            글자(자막 스타일)
          </button>
        </li>
        <li className={styles.menuItem}>
          <button className={styles.menuButton} onClick={() => setCurrentSubMenu('advanced')}>
            기타
          </button>
        </li>
      </ul>
    </div>
  );
};
```

## File: components/karaoke-player-settings/MusicNoteButton.tsx
```typescript
// MusicNoteButton.tsx
import React from 'react';
import { useEffect } from 'react';
import styles from './styles.module.css';

interface Props {
  iconPath: string;
  contentEnabled: boolean;
  onClick?: () => void;
}

export const MusicNoteButton: React.FC<Props> = ({ iconPath, contentEnabled, onClick }) => {
  useEffect(() => {
    const rightControls = document.querySelector('.ytp-right-controls');
    if (!rightControls || !contentEnabled) return;

    if (document.querySelector(`.${styles.musicNoteButton}`)) return;

    const autonavBtn = rightControls.querySelector('button[data-tooltip-target-id="ytp-autonav-toggle-button"]');

    const btn = document.createElement('button');
    btn.className = `${styles.musicNoteButton} ytp-button ytp-music-note-button`;
    btn.title = '노트';
    btn.setAttribute('aria-label', '노트');
    btn.tabIndex = 0;

    const iconImg = document.createElement('img');
    iconImg.src = iconPath;
    iconImg.alt = 'music note';
    iconImg.width = 24;
    iconImg.height = 24;
    iconImg.style.pointerEvents = 'none';
    iconImg.className = styles.icon || '';

    btn.appendChild(iconImg);

    btn.setAttribute('data-title', '노트');

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      onClick?.();
    });

    if (autonavBtn) {
      rightControls.insertBefore(btn, autonavBtn);
    } else {
      rightControls.insertBefore(btn, rightControls.firstChild);
    }

    return () => {
      btn.remove();
    };
  }, [iconPath, contentEnabled, onClick]);

  return null;
};
```

## File: components/karaoke-player-settings/styles.module.css
```css
/* styles.module.css */

.musicNoteButton {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin: 0 4px;
  display: inline-flex;
  align-items: center;
  height: 36px;      /* 유튜브 컨트롤러 높이와 맞춤 */
  width: 36px;       /* 버튼 클릭 영역 확대 */
  justify-content: center;
  box-sizing: border-box;
  opacity: 0.8;
  transition: opacity 0.15s;
}
.musicNoteButton:hover {
  opacity: 1;
}
.icon {
  width: 24px;      /* 유튜브 기본 아이콘 크기 */
  height: 24px;
  pointer-events: none;
  filter: brightness(0) invert(1); /* 흰색 아이콘 효과 */
  transition: filter 0.15s;
}
#my-custom-music-menu {
  position: absolute;
  background: #222;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.5);
  z-index: 10000;
  font-size: 14px;
  user-select: none;
}

#my-custom-music-menu div {
  padding: 6px 10px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  transition: background 0.2s;
}

#my-custom-music-menu div:last-child {
  border-bottom: none;
}

#my-custom-music-menu div:hover {
  background: rgba(255,255,255,0.1);
}
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
  'League of Legends',
  'kbs',
  'sbs',
  'mbc',
  'jtbc',
  'music bank',
  'inkigayo',
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
import { useEffect, useState } from 'react';
import { i18nInstance } from '@services/i18n';
import { isToggleContentMessage } from '@lib/utils/common/typeGuards';
import { ContentScriptMessage } from '@lib/types/message';
import { STORAGE_KEYS } from '@constants/storageKeys';
import { useChromeStorage } from '@hooks/useChromeStorage';
import { MusicNoteButton } from '@components/karaoke-player-settings/MusicNoteButton';
import { MainMenu } from '@components/karaoke-player-settings/MainMenu';
// import { LyricsContainer } from './components/LyricsContainer';

export function App() {
  // 버튼 클릭 핸들러(토글)
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

  const [contentEnabled] = useChromeStorage('contentEnabled', true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const MENU_HEIGHT = 200; // 원하는 메뉴 높이(px)

  const handleMusicNoteClick = () => {
    const btn = document.querySelector('.ytp-music-note-button');
    if (btn) {
      const rect = btn.getBoundingClientRect();
      console.log('Button rect:', rect); // 꼭 찍어서 확인해보세요.

      setMenuPosition({
        left: rect.left + rect.width / 2 + window.scrollX, // 수평 중앙
        top: rect.bottom + window.scrollY - MENU_HEIGHT - 100,
      });
    }
    setMenuVisible((v) => !v);
  };

  return (
    <>
      {contentEnabled && (
        <MusicNoteButton
          iconPath={chrome.runtime.getURL('assets/icons/music_note.png')}
          contentEnabled={contentEnabled}
          onClick={handleMusicNoteClick}
        />
      )}

      <MainMenu visible={menuVisible} position={menuPosition} onClose={() => setMenuVisible(false)} />
    </>
  );
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
import { extractArtistAndTitle, fallbackArtistAndTitle } from '@lib/utils/lyrics/artistTitle';
import { cleanTopicName, extractArtistAndTitleCustom, preprocessArtistOrTitle } from '@lib/utils/common/stringUtils';
import { listenerManager } from '@lib/utils/infra/listenerManager';
import { withContentEnabled } from '@lib/utils/platform/contentGuard';
import { injectLyricsOverlayRoot } from '@components/lyrics/LyricsOverlayRoot';
import { DualHighlightSubtitle } from '@components/lyrics/DualHighlightSubtitle';
import { isAdPlaying } from '@lib/utils/dom/domUtils';
import { parseLyrics } from '@lib/utils/lyrics/lyricsParser';
import { Line } from '@lib/types/lyrics';
import { tryDetectVideoChange } from '@lib/utils/platform/videoDetection';
import { clearLyricsCache, setToLyricsCache } from '@lib/utils/cache/lyricsCache';
import { normalizeLyricsQuery } from '@lib/utils/lyrics/queryNormalizer';
import { getLyricsFromCacheOrFetch } from '@lib/utils/lyrics/getLyricsFromCacheOrFetch';
import { fetchLyricsWithAliasFallback } from '@background/api/lyrics';
import 'normalize.css';
// import { detectMusicStart } from '@lib/utils/audio/audioAnalysis';
import { cleanupMediaElementSource } from '@lib/utils/audio/audio';
import { startAdWatcher } from '@lib/utils/infra/adWatcher';
//import { detectLyricsLanguage } from '@lib/utils/lyrics/languageDetector';

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
  let stopAdWatcher: (() => void) | null = null;

  // 중복 가사 호출 방지
  let lastCollectedVideoId: string | null = null;
  let isCollecting = false;

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
  function shiftFirstLyricEarlier(lyrics: Line[], advanceSec: number): Line[] {
    if (!lyrics || lyrics.length === 0) return lyrics;
    const [first, ...rest] = lyrics;
    if (!first) return lyrics;
    const newFirstLine: Line = {
      ...first,
      time: Math.max(0, first.time - advanceSec),
      text: first.text ?? '',
    };
    return [newFirstLine, ...rest];
  }

  // ✅ URL 변경 핸들러 개선
  const handleUrlChange = (url: string) => {
    if (url === lastUrl) return; // URL이 실제로 바뀌었을 때만 실행
    lastUrl = url;

    const isWatchPage = url.includes(YOUTUBE_WATCH_PATH);

    console.log(`[URL Change] ${url}, isWatchPage: ${isWatchPage}`);

    if (isWatchPage) {
      const videoData = detectYouTubeVideo();
      tryDetectVideoChange(videoData?.videoId || null, debouncedDetection);
    }
  };
  const handleUrlChangeGuarded = withContentEnabled(getContentEnabled, handleUrlChange);

  // 1. 영상과 크게 무관한 메타데이터, 가사 정보를 확보하는 함수
  async function collectMetadataAndLyrics(videoId: string) {
    // YouTube Video Meta 호출
    const meta = await fetchYouTubeVideoMeta(videoId, process.env.YOUTUBE_API_KEY!);
    if (!meta) {
      console.log('[collectMetadataAndLyrics] 메타 정보 없음');
      throw new Error('메타 정보 없음');
    }

    if (!isMusicVideo(meta)) {
      console.log('[collectMetadataAndLyrics] 음악 영상 아님');
      throw new Error('음악 영상 아님');
    }
    // 아티스트, 타이틀 파싱(기존 처리 로직 사용)
    let parsed = extractArtistAndTitle(meta.title);
    if (!parsed) {
      const fallback = fallbackArtistAndTitle(meta);
      if (!fallback) {
        throw new Error('곡명/아티스트 파싱 실패');
      }
      fallback.title = cleanTopicName(fallback.title);
      fallback.artist = cleanTopicName(fallback.artist);
      parsed = fallback;
    }

    const refined = extractArtistAndTitleCustom(`${parsed.artist} - ${parsed.title}`);
    if (!refined) {
      throw new Error('정제된 곡명/아티스트 파싱 실패');
    }

    const artist = preprocessArtistOrTitle(refined.artist);
    const title = preprocessArtistOrTitle(refined.title);

    clearLyricsCache();

    // 가사 캐시 혹은 서버에서 가사 fetch
    const lyricsResult = await getLyricsFromCacheOrFetch(artist, title, {
      fetch: async () => fetchLyricsWithAliasFallback(artist, title),
    });

    if (!lyricsResult) {
      throw new Error('가사 없음');
    }
    // ----------- 여기서 캐시 저장 추가 -----------
    setToLyricsCache(normalizeLyricsQuery(artist, title, {}), {
      lyrics: lyricsResult.lyrics,
      duration: lyricsResult.duration,
      artist: lyricsResult.artist,
      title: lyricsResult.title,
      id: lyricsResult.id,
    });

    const { lyrics, duration: lyricsDuration } = lyricsResult;

    // 가사 파싱, 기본 전처리 + 앞당기기(3초 예시)
    const parsedLyrics: Line[] = typeof lyrics === 'string' ? parseLyrics(lyrics) : lyrics;
    const shiftedLyrics = shiftFirstLyricEarlier(parsedLyrics, 3);

    latestLyrics = shiftedLyrics;

    // shiftedLyrics: Line[] 배열 (각 원소에 'text'가 있다고 가정)
    //const lyricsText = shiftedLyrics.map((line) => line.text).join('\n');
    //const lyricsLang = await detectLyricsLanguage(lyricsText, 2);

    // 이 함수는 성공시 meta 및 shiftedLyrics 반환 (후속 분석용)
    return { meta, lyricsDuration, shiftedLyrics };
  }

  // 2. 영상 엘리먼트가 준비된 후, 실제 분석 및 렌더링 수행하는 함수
  async function analyzeAudioAndRenderLyrics(
    meta: { durationSec?: number },
    lyricsDuration: number | undefined,
    videoElem: HTMLMediaElement,
    shiftedLyrics: Line[],
  ) {
    if (!videoElem) {
      console.log('[analyzeAudioAndRenderLyrics] 비디오 엘리먼트가 없음');
      return;
    }

    const videoDurationSec = meta.durationSec ?? 0;
    const effectiveLyricsDuration =
      lyricsDuration ?? (shiftedLyrics.length > 0 ? (shiftedLyrics[shiftedLyrics.length - 1]?.time ?? 0) : 0);

    const durationSec = videoDurationSec - effectiveLyricsDuration;

    if (durationSec <= 0) {
      console.warn(
        `[analyzeAudioAndRenderLyrics] 분석 스킵: 영상 길이(${videoDurationSec}s) - 가사 길이(${effectiveLyricsDuration}s) <= 0`,
      );
      hideLyricsOverlay();
      return;
    }

    if (isAdPlaying()) {
      console.warn('[analyzeAudioAndRenderLyrics] 광고 중이므로 분석 스킵');
      hideLyricsOverlay();
      return;
    }

    // 중복 audio source 연결 방지 및 안전한 초기화
    cleanupMediaElementSource(videoElem);

    try {
      // // detectMusicStart 호출 -> 음악 시작 offset 탐지
      // const analysisResult = await detectMusicStart(videoElem, {
      //   threshold: 0.07,
      //   requiredContinuousFrames: 6,
      // });

      // const musicStartOffset = analysisResult?.timestamp ?? 0;
      // console.log('[detectMusicStart] 음악 시작점 offset:', musicStartOffset, '초');

      // // 가사 타임에 offset 적용
      // const applyOffsetToLyrics = (lyrics: Line[], offset: number): Line[] =>
      //   lyrics.map((line) => ({
      //     ...line,
      //     time: Math.max(0, line.time + offset),
      //   }));

      // const offsettedLyrics = applyOffsetToLyrics(shiftedLyrics, musicStartOffset);

      latestLyrics = shiftedLyrics;
      renderLyricsOverlay(shiftedLyrics);
    } catch (error) {
      console.warn('[analyzeAudioAndRenderLyrics] 분석 실패:', error);
      // 실패 시 자막 감춤 또는 기본 렌더로 유지할 수 있음
    }
  }

  async function tryCollectMetadataAndLyrics(videoId: string) {
    if (isCollecting) {
      console.log('[Lyrics] 수집 중복 방지 중...');
      return; // 필요시 캐시된 데이터 반환하도록 개선 가능
    }
    if (videoId === lastCollectedVideoId) {
      console.log('[Lyrics] 이미 처리한 videoId, 수집 스킵:', videoId);
      return;
    }
    try {
      isCollecting = true;
      const data = await collectMetadataAndLyrics(videoId);
      lastCollectedVideoId = videoId;
      return data;
    } finally {
      isCollecting = false;
    }
  }

  // 영상 감지 핸들러 (순수 로직)
  const handleVideoDetection = async () => {
    console.log('handleVideoDetection 실행');
    if (isDetecting) {
      console.log('[SKIP] 감지 함수 실행 중 (동시 실행 방지)');
      return;
    }

    try {
      isDetecting = true;

      const videoData = detectYouTubeVideo();
      if (!videoData || !videoData.videoId) {
        console.log('[handleVideoDetection] 비디오 감지 실패');
        return;
      }

      if (videoData.videoId === lastVideoId) {
        console.log('[handleVideoDetection] 이미 처리한 videoId');
        return;
      }

      // 새 영상이 들어왔으므로 이전 자막 제거
      hideLyricsOverlay();
      latestLyrics = [];

      lastVideoId = videoData.videoId;

      // 1. 메타데이터 및 가사 수집 (영상 로드 여부 무관)
      const collected = await tryCollectMetadataAndLyrics(videoData.videoId);
      if (!collected) {
        console.warn('가사 수집 데이터 없음');
        return;
      }
      const { meta, lyricsDuration, shiftedLyrics } = collected;

      // 2. 비디오 엘리먼트가 준비되었으면 본 분석 및 렌더링 실행
      const videoElem = document.querySelector('video');

      if (!videoElem) {
        console.log('[handleVideoDetection] video element 미존재, 렌더링 생략');
        return;
      }
      await analyzeAudioAndRenderLyrics(meta, lyricsDuration, videoElem, shiftedLyrics);
    } catch (error) {
      console.error('[handleVideoDetection] 에러 발생:', error);
    } finally {
      isDetecting = false;
    }
  };
  const handleVideoDetectionGuarded = withContentEnabled(getContentEnabled, handleVideoDetection);
  const debouncedDetection = debounce(handleVideoDetectionGuarded, RETRY_DELAY);

  // 1) 광고 종료 감지 콜백용 별도 함수 (가사/메타 수집에 집중)
  async function prefetchMetadataAndLyricsOnAdEnd() {
    const videoData = detectYouTubeVideo();
    if (!videoData?.videoId) {
      console.log('[AdWatcher] videoId 미존재, 수집 중단');
      return;
    }
    try {
      // 광고 중이라도 가사/메타 데이터는 미리 가져오기 가능
      await tryCollectMetadataAndLyrics(videoData.videoId);
      console.log('[AdWatcher] 광고 종료 후 메타/가사 선수집 완료');
    } catch (error) {
      console.warn('[AdWatcher] 광고 종료 후 메타/가사 선수집 실패:', error);
    }
  }

  // 2) 광고 감시 초기화 함수, 광고 종료 시 prefetch 후 handleVideoDetection 호출
  function initAdWatcher() {
    if (stopAdWatcher) return; // 중복 실행 방지
    stopAdWatcher = startAdWatcher(async () => {
      console.log('[AdWatcher] 광고 종료 감지, 선수집 -> 본 감지 순서 시작');
      lastVideoId = null;

      await prefetchMetadataAndLyricsOnAdEnd();
      await handleVideoDetectionGuarded();
    });
  }

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
  const enableDetection = async () => {
    if (isDetectionActive) {
      console.log('[SKIP] 감지 시스템 이미 활성화됨');
      return;
    }

    // 기존 자원 모두 정리
    cleanupAllResources();

    // spa observer 설정
    detectionObserverManager.spaObserver = setupSPAObserver(() => {
      const videoData = detectYouTubeVideo();
      tryDetectVideoChange(videoData?.videoId || null, debouncedDetection);
    });

    // 광고 감지 시작
    initAdWatcher();

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

## File: lib/types/audio-worklet.d.ts
```typescript
declare const currentTime: number;

declare class AudioWorkletProcessor {
  port: MessagePort;
  constructor();
  process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): boolean;
}

declare function registerProcessor(name: string, processorCtor: typeof AudioWorkletProcessor): void;
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

## File: lib/types/cssmodules.d.ts
```typescript
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
export {}; // 모듈 확장

declare global {
  interface Window {
    [key: string]: unknown;
    __LYRICS_OVERLAY_INITED?: boolean;
    ModuleFactory?: MediaPipeModuleFactory;
  }

  var ModuleFactory: MediaPipeModuleFactory | undefined;
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

## File: lib/types/wasm-js.d.ts
```typescript
declare module '@assets/wasm/*.js' {
  const value: any;
  export default value;
}
```

## File: lib/utils/audio/audio.ts
```typescript
let sharedAudioContext: AudioContext | null = null;

// MediaElementAudioSourceNode 캐시: 비디오 엘리먼트별 저장 (WeakMap 사용해 GC 최적화)
const sourceNodeCache = new WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>();

/**
 * 싱글톤 AudioContext 반환
 */
export function getSharedAudioContext(): AudioContext {
  if (!sharedAudioContext) {
    sharedAudioContext = new AudioContext();
  }
  return sharedAudioContext;
}
/**
 * MediaElementAudioSourceNode를 비디오 엘리먼트별로 캐싱 후 재사용
 *
 * 이미 존재하면 재활용, 없으면 새로 생성 후 저장
 */
export function getOrCreateMediaElementSource(el: HTMLMediaElement): MediaElementAudioSourceNode {
  const context = getSharedAudioContext();

  const cachedNode = sourceNodeCache.get(el);
  if (cachedNode) return cachedNode;

  const newNode = context.createMediaElementSource(el);
  sourceNodeCache.set(el, newNode);
  return newNode;
}

/**
 * MediaElementAudioSourceNode가 필요없어졌을 때 캐시 및 연결 해제
 */
export function cleanupMediaElementSource(el: HTMLMediaElement): void {
  const cachedNode = sourceNodeCache.get(el);
  if (cachedNode) {
    cachedNode.disconnect();
    sourceNodeCache.delete(el);
  }
}

/**
 * HTMLMediaElement로부터 MediaElementAudioSourceNode 생성
 * (YouTube video 등 오디오 입력 스트림 연결용)
 */
export function createMediaElementSource(el: HTMLMediaElement): MediaElementAudioSourceNode {
  const context = getSharedAudioContext();
  return context.createMediaElementSource(el);
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
import { getOrCreateMediaElementSource, getSharedAudioContext } from './audio';
import { isAdPlaying } from '@lib/utils/dom/domUtils';

export async function detectMusicStart(
  el: HTMLMediaElement,
  options?: { threshold?: number; requiredContinuousFrames?: number },
): Promise<{ timestamp: number }> {
  if (isAdPlaying()) {
    // 광고 재생 중에는 분석하지 않고 reject 혹은 즉시 종료
    return Promise.reject(new Error('광고 재생 중 - 분석 건너뜀'));
  }
  console.log('detectMusicStart 실행 시작!');
  const context = getSharedAudioContext();

  if (!context.audioWorklet) {
    throw new Error('AudioWorklet not supported in this environment');
  }

  if (context.state === 'suspended') {
    await context.resume();
  }

  await context.audioWorklet.addModule(chrome.runtime.getURL('content/audioProcessor.js'));

  // 캐시된 source 노드 재사용
  const source = getOrCreateMediaElementSource(el);
  const node = new AudioWorkletNode(context, 'onset-rms-processor');

  if (options) {
    node.port.postMessage({ type: 'setOptions', options });
  }

  // 분석용 경로 연결(출력 경로와 분리)
  source.connect(node);

  return new Promise<{ timestamp: number }>((resolve, reject) => {
    const cleanup = () => {
      try {
        source.disconnect(node);
        node.disconnect();
      } catch {
        /* 무시 */
      }
    };

    node.port.onmessage = (event) => {
      if (event.data.type === 'musicStart') {
        cleanup();
        resolve({ timestamp: event.data.timestamp });
      }
    };

    node.port.onmessageerror = (e) => {
      cleanup();
      reject(e);
    };

    // const timeoutId = setTimeout(() => {
    //   cleanup();
    //   reject(new Error('detectMusicStart: 분석 timeout'));
    // }, 10_000);

    // Promise 내부에 clearTimeout 추가하여 깔끔히 종료
  });
}
```

## File: lib/utils/audio/audioProcessor.ts
```typescript
class OnsetRMSProcessor extends AudioWorkletProcessor {
  threshold: number = 0.07;
  detected: boolean = false;
  continuousCount: number = 0;
  requiredContinuousFrames: number = 6;

  constructor() {
    super();
    this.port.onmessage = (event) => {
      if (event.data.type === 'setOptions') {
        const opts = event.data.options;
        if (typeof opts.threshold === 'number') this.threshold = opts.threshold;
        if (typeof opts.requiredContinuousFrames === 'number')
          this.requiredContinuousFrames = opts.requiredContinuousFrames;
      }
    };
  }

  calculateRMS(input: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < input.length; i++) {
      sum += input[i]! * input[i]!;
    }
    return Math.sqrt(sum / input.length);
  }

  process(inputs: Float32Array[][], _outputs: Float32Array[][], _parameters: Record<string, Float32Array>): boolean {
    if (!inputs || inputs.length === 0 || !inputs[0] || inputs[0].length === 0) return true;
    const input = inputs[0][0];
    if (!input) return true;

    const rms = this.calculateRMS(input);

    if (rms > this.threshold) {
      this.continuousCount++;
      if (!this.detected && this.continuousCount >= this.requiredContinuousFrames) {
        this.detected = true;
        this.port.postMessage({ type: 'musicStart', timestamp: currentTime });
      }
    } else {
      this.continuousCount = 0;
      this.detected = false;
    }
    return true;
  }
}

registerProcessor('onset-rms-processor', OnsetRMSProcessor);
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
import { LrcLibLyricsResult } from '@background/api/lrclib';

// lib/utils/cache/lyricsCache.ts
interface MemoryCacheItem<T = unknown> {
  value: T;
  expire: number;
  etag?: string;
}
const MEMORY_CACHE: Record<string, MemoryCacheItem<LrcLibLyricsResult>> = {};

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

export function setToLyricsCache<T>(
  key: string,
  value: T,
  { ttl = DEFAULT_TTL, etag }: { ttl?: number; etag?: string } = {},
) {
  const expire = Date.now() + ttl;

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

export function clearLyricsCache() {
  // localStorage 내 캐시 키가 '::'를 포함하는 경우 모두 삭제
  Object.keys(localStorage).forEach((key) => {
    if (key.includes('::') || key.startsWith('videoMeta:')) {
      localStorage.removeItem(key);
      console.log(`[LyricsCache] localStorage 캐시 삭제: key=${key}`);
    }
  });

  // 메모리 캐시 비우기
  for (const key in MEMORY_CACHE) {
    delete MEMORY_CACHE[key];
  }

  console.log('[LyricsCache] 전체 캐시 초기화 완료');
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

const TRAILING_DELIMITERS_REGEX = /[\s\-/|]+$/;

// -----------------------------
// Exported utility functions
// -----------------------------

// 영어 여부 판단 함수 (공백, 하이픈, 작은따옴표 포함)
export function isEnglishText(text: string): boolean {
  return /^[A-Za-z\s\-'/]+$/.test(text); // 슬래시(/)도 허용
}
// &를 and로 대체
export function replaceAmpersand(str: string, replacement: string = 'and') {
  // 양쪽 공백을 유지하며 &를 " and "로 치환 (또는 필요시 ',')
  return str
    .replace(/\s*&\s*/g, ` ${replacement} `)
    .replace(/\s{2,}/g, ' ')
    .trim();
}
// 유튜브 DATA API를 통해 나온 음악 타이틀에서 Topic을 제거함
export function cleanTopicName(name: string): string {
  let result = name;

  // 앞쪽 접두사 "Topic - "
  result = result.replace(/^topic\s*-\s*/i, '');

  // 뒤쪽 접미사 " - Topic"
  result = result.replace(/\s*-\s*topic$/i, '');

  return result.trim();
}
/**
 * 문자열에서 부가정보(괄호, 대괄호, 파이프 등)를 제거합니다.
 */
export function cleanUp(str: string): string {
  return str
    .replace(/\[.*?\]/g, '') // 대괄호 제거
    .replace(/\\s{2,}/g, ' ') // 이중 공백 정리
    .trim();
}

// 실질적 실행
export function extractArtistAndTitleCustom(rawTitle: string): { artist: string; title: string } | null {
  if (!rawTitle || typeof rawTitle !== 'string') return null;

  // 1. 기본 정돈 (괄호/대괄호 제거, 중복 공백 정리 등)
  const cleaned = cleanUp(rawTitle);

  // 2. 쌍따옴표 등으로 감싼 부분 우선 파싱 예: Artist "Title"
  const quotePattern = /^(.+?)\s+(?:'|“|”|‘|’|")([^'“”‘’"]+)(?:'|“|”|‘|’)?(?:\s|$)/;
  const quoteMatch = cleaned.match(quotePattern);

  let artist = '';
  let title = '';

  if (
    quoteMatch &&
    quoteMatch[1] !== undefined &&
    quoteMatch[2] !== undefined &&
    !/\w'$/.test(quoteMatch[1].trim()) && // 아티스트 단어 끝 ' 소유격 제외
    quoteMatch[2].trim().length > 0
  ) {
    artist = quoteMatch[1]?.trim() ?? '';
    title = quoteMatch[2]?.trim() ?? '';
  } else {
    // 3. 구분자 기준 추출 (하이픈, 슬래시, 파이프)
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
    const match = cleaned.match(/^([A-Za-z0-9]+|[^A-Za-z0-9\s]+)\s+(.+)$/);
    if (match) {
      artist = match[1]?.trim() ?? '';
      title = match[2]?.trim() ?? '';
    }
  }

  // 6. 곡명에서 부가정보 추가 제거
  title = removeExtraInfo(title);
  title = removeTrailingHashtags(title);
  title = removeDatePattern(title);

  if (!artist || !title) return null;
  artist = removeEmptyBrackets(removeExtraInfo(artist));
  return { artist, title };
}

// preprocessing for artist or title string: clean up + extract English only + trim trailing delimiters
export function preprocessArtistOrTitle(str: string): string {
  let s = cleanUp(str);
  console.log('cleanup:', s);
  s = removeEmptyBrackets(s);
  s = preprocessTitleOrArtist(s);
  s = trimTrailingDelimiters(s);
  return s;
}

// -----------------------------
// Internal helper functions (non-exported)
// -----------------------------

// 괄호 안 내용 중에 피처링 키워드 포함시 괄호 포함 제거
// 예: (ft. Madison Beer), (feat Artist), (featuring Someone)
function removeFeaturingParentheses(str: string): string {
  const stack: number[] = [];
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '(') {
      stack.push(i);
    } else if (str[i] === ')') {
      if (stack.length > 0) {
        const start = stack.pop()!;
        const content = str.slice(start + 1, i);
        // 피처링 키워드 여부 검사
        if (/(ft\.|feat\.?|featuring)/i.test(content)) {
          // 삭제: start부터 i까지를 빈 문자열로 replace 할 수 있게 큐에 기록
          // 삭제 처리는 후순위에서 수행하도록 함
          str = str.slice(0, start) + str.slice(i + 1);
          i = start - 1; // 인덱스 조정
        }
      }
    }
  }
  return str.trim();
}
// 키워드 정제, 부가정보 제거
function removeExtraInfo(str: string): string {
  const extraKeywords = EXTRA_KEYWORDS.slice().sort((a, b) => b.length - a.length); // 긴 키워드 우선
  let result = str;

  // 1. 괄호 안 피처링 정보(ft., feat, featuring)만 제거
  result = removeFeaturingParentheses(result);

  // 1. 복합 키워드(공백/특수문자 포함) 전체 제거
  for (const kw of extraKeywords) {
    const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // 키워드가 특수문자 포함 가능하므로 escape 처리
    const regex = new RegExp(`(\\s*${escapedKw})`, 'gi');
    result = result.replace(regex, '').trim();
  }

  // 2. 구분자(-, /, |) 기준 분할 후, 끝부분 부가 키워드 포함 파트 제거
  const parts = result.split(/\s[-/|]\s/);
  while (
    parts.length > 1 &&
    extraKeywords.some((kw) => parts[parts.length - 1]?.toLowerCase().includes(kw.toLowerCase()))
  ) {
    parts.pop();
  }

  // 3. 조합한 결과 문자열로 재설정
  result = parts.join(' - ');

  // 4. 반복적으로 문자열 끝에 부가 키워드 남아있는지 검사해서 제거
  let found = true;
  while (found) {
    found = false;
    for (const kw of extraKeywords) {
      const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(\\s*${escapedKw})$`, 'i'); // 끝에 위치한 키워드 제거
      if (regex.test(result)) {
        result = result.replace(regex, '').trim();
        found = true;
      }
    }
  }
  return result;
}

// op, ed, ost, mv는 해당 단어만 삭제해 예를 들어 open the door -> en the door이 되지 않게끔
function cleanMusicKeyword(str: string): string {
  return str
    .replace(/([^A-Za-z]|^)(OP|ED|OST|MV)([^A-Za-z]|$)/gi, (_match, p1, _p2, p3) => {
      return `${p1}${p3}`.replace(/\s{2,}/g, ' ');
    })
    .trim();
}
// 곡명 끝에 연속된 해시태그만 제거
function removeTrailingHashtags(title: string): string {
  return title.replace(/(\s*#[\p{L}\p{N}._-]+)+\s*$/gu, '').trim();
}
// 방송 날짜 기재된 경우 제거 (YYMMDD 형식)
function removeDatePattern(str: string): string {
  return str.replace(/\b\d{2}[01]\d(?:3[0-2]|[0-2][0-9])\b/g, '').trim();
}
// 빈 괄호 제거
function removeEmptyBrackets(str: string): string {
  return str
    .replace(/\(\s*\)/g, '')
    .replace(/\[\s*\]/g, '')
    .replace(/\{\s*\}/g, '')
    .trim();
}
// 문자열 끝의 불필요한 구분자(공백, -, /, |) 제거
function trimTrailingDelimiters(str: string): string {
  return str.replace(TRAILING_DELIMITERS_REGEX, '').trim();
}

function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// 최상위 전처리 파이프라인 함수
function preprocessTitleOrArtist(str: string): string {
  // 1) 합성문자 NFC 통일
  const normalized = str.normalize('NFC');

  // 2) 악센트 제거
  const noDiacritics = removeDiacritics(normalized);

  // 3) 악센트 제거된 문자열 넘겨서 영어 추출 및 특수문자 정리
  return extractEnglishOnly(noDiacritics);
}

function extractEnglishOnly(str: string): string {
  const LETTERS = 'A-Za-z'; // 악센트 제거 후라 기본 알파벳만 사용
  const hasEnglish = new RegExp(`[${LETTERS}]`).test(str);
  // 악센트 제거 후 비교를 위해 미리 처리
  const strNoDiacritics = removeDiacritics(str);

  // 비영문자 검사 - 악센트 제거 전 원본에서 처리
  const hasNonEnglish = new RegExp(`[^\\s${LETTERS}0-9'’&.,-]`).test(strNoDiacritics);

  if (hasEnglish && hasNonEnglish) {
    // 원본에서 악센트 제거한 문자를 토큰화 (공백, 특수문자 포함)
    const processedStr = removeDiacritics(str);
    const match = processedStr.match(new RegExp(`([${LETTERS}][${LETTERS}\\s'’./-]*|&|,)`, 'g'));
    let result = match ? match.join(' ').trim() : '';

    // 쉼표 앞뒤 공백 정리
    result = result.replace(/\s+,/g, ',');
    result = result.replace(/,\s+/g, ', ');

    return result;
  }
  return str;
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

## File: lib/utils/infra/adWatcher.ts
```typescript
import { isAdPlaying } from '../dom/domUtils';

// adWatcher.ts
let lastAdPlaying = isAdPlaying();

/**
 * 광고 종료시 콜백 실행하는 광고 상태 감지자
 * @param onAdEndCallback 광고 종료 시 실행할 함수 (예: handleVideoDetection)
 */
export function startAdWatcher(onAdEndCallback: () => void) {
  // 광고 상태를 주기적으로 확인
  const intervalId = setInterval(() => {
    const nowAd = isAdPlaying();
    // 상태 변화: 광고 종료?
    if (lastAdPlaying && !nowAd) {
      console.log('[adWatcher] 광고 종료 감지, 감지 재시도');
      onAdEndCallback();
    }
    lastAdPlaying = nowAd;
  }, 1000); // 1초 간격

  return () => clearInterval(intervalId);
}
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

export function fallbackArtistAndTitle(meta: {
  title: string;
  channelTitle?: string;
  description?: string;
  artist?: string;
}): { artist: string; title: string } | null {
  // 1. 곡명만 title로 일단 설정
  const title = meta.title?.trim();
  if (!title) return null;

  // 2. 아티스트 추정 우선순위:
  //    (1) YouTube 제공 artist 필드 > (2) 채널명 > (3) 설명문에서 탐색 > (4) 기타

  // (1) meta.artist가 있으면(YouTube Music/자동 생성 영상)
  if (meta.artist && meta.artist.trim() && meta.artist.trim().toLowerCase() !== title.toLowerCase()) {
    return { artist: meta.artist.trim(), title };
  }

  // (2) 채널명이 아티스트명일 확률이 높음. (ex, "aimyon" 등)
  if (meta.channelTitle && meta.channelTitle.trim().toLowerCase() !== title.toLowerCase()) {
    return { artist: meta.channelTitle.trim(), title };
  }

  // (3) description에서 by/작곡/노래/歌/MUSIC BY/Performer/Produced by 등 패턴 찾기
  if (meta.description) {
    // 아주 간단한 예시: "by XXX", "performed by XXX", "作詞：", "歌：", "アーティスト："
    // 더 똑똑한 정규식으로 패턴 추가 필요
    const patterns = [
      /by\s+([^\n\r,]+)/i,
      /Performed\s+by\s+([^\n\r,]+)/i,
      /歌[:：]\s*([^\n\r,]+)/,
      /アーティスト[:：]\s*([^\n\r,]+)/,
      /artist[:：]\s*([^\n\r,]+)/i,
      /作曲[:：]\s*([^\n\r,]+)/,
      /作詞[:：]\s*([^\n\r,]+)/,
    ];
    for (const regex of patterns) {
      const m = meta.description.match(regex);
      if (m && m[1]) {
        return { artist: m[1].trim(), title };
      }
    }
  }
  return null;
}
```

## File: lib/utils/lyrics/getLyricsFromCacheOrFetch.ts
```typescript
// lib/utils/lyrics/getLyricsFromCacheOrFetch.ts

import { LrcLibLyricsResult } from '@background/api/lrclib';
import { normalizeLyricsQuery } from './queryNormalizer';
import { getFromLyricsCache, setToLyricsCache } from '@lib/utils/cache/lyricsCache';

export async function getLyricsFromCacheOrFetch(
  artist: string,
  title: string,
  options: {
    lang?: string;
    fetch: (apiOpts: { etag?: string }) => Promise<LrcLibLyricsResult>;
  },
): Promise<LrcLibLyricsResult | undefined> {
  const key = normalizeLyricsQuery(artist, title, { lang: options.lang });

  // 1. 캐시 시도
  const cached = getFromLyricsCache(key);
  if (cached) {
    console.log('[LYRICS APPLY] 캐시사용:', cached);
    return cached;
  }
  console.log('[LYRICS APPLY] 캐시없음, fetch진행');

  // fetch
  const fetchResult = await options.fetch({});
  setToLyricsCache(key, fetchResult);

  return fetchResult;
}
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
export interface NormalizeLyricsQueryOptions {
  lang?: string;
  [key: string]: string | undefined;
}

/**
 * 가사 검색 쿼리를 유니크한 캐시 키로 정규화합니다.
 * artist, title, lang, 기타 옵션까지 모두 key에 포함.
 */
export function normalizeLyricsQuery(artist: string, title: string, options?: NormalizeLyricsQueryOptions): string {
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
