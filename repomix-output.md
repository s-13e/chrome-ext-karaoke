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
background/api/youtubePlayerController.ts
background/background.ts
components/common/BackButton.tsx
components/common/ErrorFallback.tsx
components/common/LoadingOverlay.tsx
components/common/styles.module.css
components/common/ToggleSwitch.tsx
components/icons/ArrowIcon.tsx
components/icons/DisplayIcon.tsx
components/icons/FontIcon.tsx
components/icons/IconLyricsSync.tsx
components/karaoke-player-settings/AdvancedSettingsMenu.tsx
components/karaoke-player-settings/FontStyleMenu.tsx
components/karaoke-player-settings/LyricsDisplayMenu.tsx
components/karaoke-player-settings/LyricsOffsetControl.tsx
components/karaoke-player-settings/LyricsOffsetMenu.tsx
components/karaoke-player-settings/MainMenu.module.css
components/karaoke-player-settings/MainMenu.tsx
components/karaoke-player-settings/MusicNoteButton.tsx
components/karaoke-player-settings/styles.module.css
components/lyrics/FullLyrics/FullLyrics.tsx
components/lyrics/FullLyrics/styles.module.css
components/lyrics/LyricsOverlayRoot.module.css
components/lyrics/LyricsOverlayRoot.tsx
components/lyrics/PronunciationLyrics/usePronunciation.ts
components/lyrics/SingleLineLyrics/SingleLineLyrics.tsx
components/lyrics/SingleLineLyrics/styles.module.css
components/lyrics/SyncLyrics/DualHighlightLyrics.tsx
components/lyrics/SyncLyrics/styles.module.css
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
lib/types/kuroshiro-modules.d.ts
lib/types/lyrics.ts
lib/types/message.ts
lib/types/svg.d.ts
lib/types/translationKeys.ts
lib/types/video.ts
lib/types/youtube.d.ts
lib/utils/audio/audio.ts
lib/utils/audio/audioAnalysis.ts
lib/utils/audio/audioProcessor.ts
lib/utils/audio/musicDetection.ts
lib/utils/audio/vad.ts
lib/utils/cache/lyricsCache.ts
lib/utils/common/common.ts
lib/utils/common/time.ts
lib/utils/common/typeGuards.ts
lib/utils/dom/domUtils.ts
lib/utils/dom/styleInjection.ts
lib/utils/infra/adWatcher.ts
lib/utils/infra/listenerManager.ts
lib/utils/infra/registerAllListeners.ts
lib/utils/infra/singletonListener.ts
lib/utils/infra/uiResourceManager.ts
lib/utils/lyrics/detection/languageDetectorSimple.ts
lib/utils/lyrics/detection/languageSpanSplitter.ts
lib/utils/lyrics/detection/languageTransliterator.ts
lib/utils/lyrics/display/fontUtils.ts
lib/utils/lyrics/display/lyricsDisplay.ts
lib/utils/lyrics/display/lyricsOffset.ts
lib/utils/lyrics/lyrics.ts
lib/utils/lyrics/meta/artistTitle.ts
lib/utils/lyrics/meta/getLyricsFromCacheOrFetch.ts
lib/utils/lyrics/meta/queryNormalizer.ts
lib/utils/lyrics/parsers/lyricsParser.ts
lib/utils/lyrics/parsers/stringUtils.ts
lib/utils/lyrics/romanizers/chineseRomanizer.ts
lib/utils/lyrics/romanizers/japaneseRomanizer.ts
lib/utils/lyrics/romanizers/koreanRomanizer.ts
lib/utils/platform/contentGuard.ts
lib/utils/platform/playbackUtils.ts
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
popup/components/Contact.tsx
popup/components/FAQ.module.css
popup/components/FAQ.tsx
popup/components/LanguageSettings.tsx
popup/components/LicenseInfo.tsx
popup/components/LyricsSettings.tsx
popup/components/popupSettingsPanel.module.css
popup/components/PopupSettingsPanel.tsx
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
export async function fetchLyricsByArtistAndTrack(artist: string, title: string): Promise<LrcLibLyricsResult | null> {
  async function searchWithParams(artistParam: string, titleParam: string): Promise<LrcLibLyricsResult | null> {
    const endpoint = `https://lrclib.net/api/search?artist_name=${encodeURIComponent(artistParam)}&track_name=${encodeURIComponent(titleParam)}`;
    const searchRes = await fetch(endpoint);
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();

    let fallbackResult: LrcLibLyricsResult | null = null;
    const normalizedReqTitle = titleParam.trim().toLowerCase();

    for (const candidate of searchData) {
      const detailRes = await fetch(`https://lrclib.net/api/get/${candidate.id}`);
      if (!detailRes.ok) continue;
      const detail = await detailRes.json();

      const lyrics = detail.syncedLyrics || detail.plainLyrics;
      if (!lyrics) continue;

      const candidateTitle = detail.title?.trim().toLowerCase() ?? '';

      // strict ver
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
      // alternative ver
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
  if (result1 !== null) return result1;

  // 2차 시도: 아티스트와 곡명을 뒤바꿔서 검색
  if (artist.toLowerCase() !== title.toLowerCase()) {
    const result2 = await searchWithParams(title, artist);
    if (result2 !== null) return result2;
  }

  return null;
}
```

## File: background/api/lyrics.ts
```typescript
import { isEnglishText } from '@lib/utils/lyrics/parsers/stringUtils';
import { fetchLyricsByArtistAndTrack, LrcLibLyricsResult } from './lrclib';
import { extractEnglishAliasFromArtists, fetchEnglishAliasForArtist, searchArtistByFreeText } from './musicBrainz';
export async function fetchLyricsWithAliasFallback(artist: string, title: string): Promise<LrcLibLyricsResult> {
  const processedArtist = artist;
  const processedTitle = title;

  const areBothEnglish = isEnglishText(processedArtist) && isEnglishText(processedTitle);

  async function doubleLookup(a: string, t: string) {
    const res = await fetchLyricsByArtistAndTrack(a, t);
    return res ?? null;
  }

  if (areBothEnglish) {
    // 1차 시도
    const firstResult = await doubleLookup(processedArtist, processedTitle);
    if (firstResult !== null) return firstResult;

    // 2차 alias 시도 (실패해도 흐름 계속)
    try {
      const englishArtist = await fetchEnglishAliasForArtist(processedArtist);
      if (englishArtist && englishArtist !== processedArtist) {
        const aliasResult = await doubleLookup(englishArtist, processedTitle);
        if (aliasResult !== null) {
          console.log(`[Info] 영어 alias (${englishArtist})로 가사 검색 성공: ${englishArtist} - ${processedTitle}`);
          return aliasResult;
        }
      }
    } catch (e) {
      console.warn('[fetchLyricsWithAliasFallback] 영어 alias 검색 실패:', e);
    }

    // 3차 freeText alias 시도 (실패해도 무시)
    try {
      const candidates = await searchArtistByFreeText(processedArtist);
      if (candidates && candidates.length > 0) {
        const extractedAlias = extractEnglishAliasFromArtists(candidates);
        if (extractedAlias && extractedAlias !== processedArtist) {
          const freeTextResult = await doubleLookup(extractedAlias, processedTitle);
          if (freeTextResult !== null) {
            console.log(
              `[Info] FreeText 검색에서 영어 alias (${extractedAlias})로 가사 검색 성공: ${extractedAlias} - ${processedTitle}`,
            );
            return freeTextResult;
          }
        }
      }
    } catch (e) {
      console.warn('[fetchLyricsWithAliasFallback] FreeText alias 검색 실패:', e);
    }

    // 모든 시도 실패 시 예외 던짐
    throw new Error('LRCLIB에서 가사 정보를 찾을 수 없습니다! (영문 공식/별칭 모두 실패)');
  } else {
    // 비영어권: 한 번만 시도
    const result = await doubleLookup(processedArtist, processedTitle);
    if (result === null) {
      throw new Error('LRCLIB에서 가사 정보를 찾을 수 없습니다! (비영어권)');
    }
    return result;
  }
}
```

## File: background/api/musicBrainz.ts
```typescript
import { isEnglishText } from '@lib/utils/lyrics/parsers/stringUtils';

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

## File: background/api/youtubePlayerController.ts
```typescript
// background/api/youtubePlayerController.ts
// YouTube IFrame API 사용한 플레이어 제어 모듈

// 자동 재생 실행 함수
export async function skipPreviewSegment(
  player: YT.Player, // YouTubePlayer 대신 YT.Player 사용
  segmentStart: number,
  segmentEnd: number,
  maxDuration = 5,
): Promise<void> {
  if (!player) throw new Error('YouTube Player 객체가 필요합니다.');

  const originalTime = player.getCurrentTime();
  const playStart = Math.max(0, segmentStart);
  const playEnd = Math.min(segmentEnd, playStart + maxDuration);

  return new Promise((resolve, _reject) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      player.pauseVideo();
      player.seekTo(originalTime, true);

      if (!player.removeEventListener) throw new Error('removeEventListener 함수가 없습니다');
      player.removeEventListener('onStateChange', onStateChange);
    };

    const onStateChange = () => {
      const currentTime = player.getCurrentTime();
      if (currentTime >= playEnd) {
        cleanup();
        resolve();
      }
    };

    player.seekTo(playStart, true);
    player.playVideo();

    if (!player.addEventListener) throw new Error('addEventListener 함수가 없습니다');
    player.addEventListener('onStateChange', onStateChange);

    // 만약 재생이 maxDuration 초가 넘도록 끝나지 않는 경우 강제 종료
    timeoutId = setTimeout(
      () => {
        cleanup();
        resolve();
      },
      (playEnd - playStart) * 1000 + 1000,
    );
  });
}
```

## File: background/background.ts
```typescript
import { MESSAGE_TYPES } from '@constants/messageTypes';
import { YOUTUBE_HOST } from '@constants/youtubeSelectors';
import { PATHS } from '@constants/paths';
import { YOUTUBE_CONFIG } from '@constants/platforms';
import { DetectionConfig } from '@lib/types/config';
import { Line } from '@lib/types/lyrics';

const activeTabs = new Set<number>();
let lastInjectedUrl = '';

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

// 확장에서 쓰는 모든 메시지 타입 유니온
type ExtensionMessage = LyricsReadyMessage | GetLatestLyricsMessage | SetOffsetMessage;

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
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  console.log(`[background] onMessage 수신`, msg);

  // --- LYRICS_READY: content → background → 모든 context 방송 ---
  if (msg.type === 'LYRICS_READY') {
    console.log('[background] LYRICS_READY 수신 - 길이:', msg.length);
    // MainMenu, popup, 같은 탭의 다른 content 등 모든 컨텍스트로 전달
    chrome.runtime.sendMessage(msg);
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
});
```

## File: components/common/BackButton.tsx
```typescript
import React from 'react';
import { ArrowIcon } from '@components/icons/ArrowIcon';

interface BackButtonProps {
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
  flip?: boolean;
  arrowColor?: string;
  transparentBackground?: boolean;
  style?: React.CSSProperties;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  ariaLabel = '뒤로',
  className = '',
  flip = false,
  arrowColor = '#fff',
  transparentBackground = false,
  style,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        width: 16,
        height: 16,
        padding: 0,
        marginLeft: 10,
        marginRight: 10,
        border: 'none',
        background: transparentBackground ? 'transparent' : undefined,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: flip ? 'scaleX(-1)' : undefined,
        ...style,
      }}
      className={`backButton ${className}`.trim()}
    >
      <ArrowIcon color={arrowColor} direction="left" />
    </button>
  );
};
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

## File: components/common/styles.module.css
```css
/* toggle switch css */
.toggleWrap {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1em;
}
.toggleInput {
  display: none;
}
.toggleSlider {
  width: 36px;
  height: 15px;
  background: #888;
  border-radius: 24px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
}
.toggleInput:checked + .toggleSlider {
  background: #3fa6ff;
}
/* 동그란 버튼(핸들)을 더 크게 */
.toggleSlider:before {
  content: '';
  position: absolute;
  width: 20px; /* ← width/height 모두 키움 */
  height: 20px;
  left: -1px;
  top: -3px;
  background: #bbb;
  border-radius: 50%;
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.3),
    0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
}

/* 토글 ON일 때 위치 이동 */
.toggleInput:checked + .toggleSlider:before {
  background: #fff;
  transform: translateX(20px);
}
.toggleLabel {
  margin-left: 6px;
  font-size: 1em;
}

/* Tooltip */
/* Tooltip.module.css */

.tooltip {
  position: fixed; /* body 기준 절대 위치 */
  background: rgba(32, 32, 32, 0.95);
  color: #fff;
  padding: 4px 10px;
  border-radius: 5px;
  font-size: 0.96em;
  line-height: 1.2;
  white-space: nowrap;
  pointer-events: none; /* 툴팁 자체 클릭 막음 */
  box-shadow: 0 3px 14px rgba(0, 0, 0, 0.13);
  z-index: 10000;
  user-select: none;
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
  opacity: 0.95;
}
```

## File: components/common/ToggleSwitch.tsx
```typescript
import React from 'react';
import styles from './styles.module.css';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  className?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, label, className = '' }) => (
  <label className={`${styles.toggleWrap} ${className}`.trim()}>
    {label && <span className={styles.toggleLabel}>{label}</span>}
    <input type="checkbox" checked={checked} onChange={onChange} className={styles.toggleInput} />
    <span className={styles.toggleSlider}></span>
  </label>
);
```

## File: components/icons/ArrowIcon.tsx
```typescript
// src/components/icons/ArrowIcon.tsx
import React from 'react';

interface ArrowIconProps {
  direction?: 'right' | 'left' | 'up' | 'down';
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const ArrowIcon: React.FC<ArrowIconProps> = ({
  direction = 'right',
  size = 16,
  color = '#fff',
  className = '',
  style = {},
}) => {
  let transform = '';
  switch (direction) {
    case 'left':
      transform = 'scaleX(-1)';
      break;
    case 'up':
      transform = 'rotate(-90deg)';
      break;
    case 'down':
      transform = 'rotate(90deg)';
      break;
    case 'right':
    default:
      transform = '';
      break;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ verticalAlign: 'middle', display: 'block', transform, ...style }}
      aria-hidden="true"
    >
      <path d="M8 4l8 8-8 8" />
    </svg>
  );
};
```

## File: components/icons/DisplayIcon.tsx
```typescript
import React from 'react';

interface IconDisplayProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export const IconDisplay: React.FC<IconDisplayProps> = ({
  width = 24,
  height = 24,
  color = '#000',
  className = '',
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Display Icon"
    className={className}
  >
    <rect x="8" y="12" width="32" height="24" stroke={color} strokeWidth="4" rx="2" ry="2" />
    <rect x="16" y="20" width="16" height="8" fill={color} />
    <line x1="24" y1="36" x2="24" y2="40" stroke={color} strokeWidth="4" strokeLinecap="round" />
  </svg>
);
```

## File: components/icons/FontIcon.tsx
```typescript
import React from 'react';

interface IconFontProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export const IconFont: React.FC<IconFontProps> = ({ width = 24, height = 24, color = '#000', className = '' }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Font Icon"
    className={className}
  >
    <rect width="48" height="48" fill="none" />
    <path d="M9 8h30M24 8v32M17 40h14" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
```

## File: components/icons/IconLyricsSync.tsx
```typescript
import React from 'react';

interface IconLyricsSyncProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export const IconLyricsSync: React.FC<IconLyricsSyncProps> = ({
  width = 24,
  height = 24,
  color = '#222', // 기본 색상
  className = '',
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Lyrics Sync Icon"
    className={className}
  >
    {/* 바깥 원 테두리 */}
    <circle cx="24" cy="24" r="20" stroke={color} strokeWidth="3" fill="none" />
    {/* 상단 슬라이더 */}
    <line x1="14" y1="18" x2="32" y2="18" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <circle cx="32" cy="18" r="4" stroke={color} strokeWidth="3" fill="none" />
    {/* 하단 슬라이더 */}
    <line x1="14" y1="30" x2="32" y2="30" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <circle cx="14" cy="30" r="4" stroke={color} strokeWidth="3" fill="none" />
  </svg>
);
```

## File: components/karaoke-player-settings/AdvancedSettingsMenu.tsx
```typescript
// 기타 메뉴
// src/components/karaoke-player-settings/AdvancedSettingsMenu.tsx
import React from 'react';
import { BackButton } from '@components/common/BackButton';
import styles from './MainMenu.module.css';

interface AdvancedSettingsMenuProps {
  onBack: () => void;
}

export const AdvancedSettingsMenu: React.FC<AdvancedSettingsMenuProps> = ({ onBack }) => {
  return (
    <div>
      <div className={styles.horizontalHeader}>
        <BackButton onClick={onBack} />
        <h3>기타 설정</h3>
      </div>
      <hr className={styles.divider} />
    </div>
  );
};
```

## File: components/karaoke-player-settings/FontStyleMenu.tsx
```typescript
import React, { useEffect, useState } from 'react';
import { BackButton } from '@components/common/BackButton';
import styles from './MainMenu.module.css';

interface FontStyleMenuProps {
  onBack: () => void;
}

export const FontStyleMenu: React.FC<FontStyleMenuProps> = ({ onBack }) => {
  const [lyricsFontColorCurrent, setLyricsFontColorCurrent] = useState('#FFFFFF');
  const [lyricsFontColorPronunciation, setLyricsFontColorPronunciation] = useState('#FFFFFF');

  const handleFontColorChangeCurrent = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLyricsFontColorCurrent(e.target.value);
  };
  const handleFontColorChangePronunciation = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLyricsFontColorPronunciation(e.target.value);
  };

  const handleFontColorCommitCurrent = () => {
    chrome.storage.sync.set({ lyricsFontColorCurrent });
  };
  const handleFontColorCommitPronunciation = () => {
    chrome.storage.sync.set({ lyricsFontColorPronunciation });
  };

  useEffect(() => {
    chrome.storage.sync.get(['lyricsFontColorCurrent', 'lyricsFontColorPronunciation'], (items) => {
      if (items.lyricsFontColorCurrent) setLyricsFontColorCurrent(items.lyricsFontColorCurrent);
      if (items.lyricsFontColorPronunciation) setLyricsFontColorPronunciation(items.lyricsFontColorPronunciation);
    });
  }, []);

  return (
    <>
      <div className={styles.horizontalHeader}>
        <BackButton onClick={onBack} />
        <h2 className={styles.menuTitle}>글꼴 스타일</h2>
      </div>
      <hr className={styles.divider} />

      <div className={styles.subSectionScrollable}>
        {/* 현재 가사 */}
        <div className={styles.subSection}>
          <h3 className={styles.subSectionTitle}>현재 가사</h3>
          <div className={styles.settingItem}>
            <span className={styles.settingLabel}>글꼴 종류</span>
            <select className={styles.settingSelect}>
              <option>기본</option>
              <option>세리프</option>
              <option>모노스페이스</option>
            </select>
          </div>
          <div className={styles.settingItem}>
            <span className={styles.settingLabel}>글꼴 크기</span>
            <select className={styles.settingSelect}>
              <option>작게</option>
              <option>보통</option>
              <option>크게</option>
            </select>
          </div>
          <div className={styles.settingItem}>
            <span className={styles.settingLabel}>글꼴 색상</span>
            <input
              id="fontColorPickerCurrent"
              type="color"
              className={styles.colorPicker}
              value={lyricsFontColorCurrent}
              onChange={handleFontColorChangeCurrent}
              onBlur={handleFontColorCommitCurrent}
              onMouseUp={handleFontColorCommitCurrent}
            />
          </div>
        </div>

        {/* 발음 가사 */}
        <div className={styles.subSection}>
          <h3 className={styles.subSectionTitle}>발음 가사</h3>
          <div className={styles.settingItem}>
            <span className={styles.settingLabel}>글꼴 종류</span>
            <select className={styles.settingSelect}>
              <option>기본</option>
              <option>세리프</option>
              <option>모노스페이스</option>
            </select>
          </div>
          <div className={styles.settingItem}>
            <span className={styles.settingLabel}>글꼴 크기</span>
            <select className={styles.settingSelect}>
              <option>작게</option>
              <option>보통</option>
              <option>크게</option>
            </select>
          </div>
          <div className={styles.settingItem}>
            <span className={styles.settingLabel}>글꼴 색상</span>
            <input
              id="fontColorPickerPronunciation"
              type="color"
              className={styles.colorPicker}
              value={lyricsFontColorPronunciation}
              onChange={handleFontColorChangePronunciation}
              onBlur={handleFontColorCommitPronunciation}
              onMouseUp={handleFontColorCommitPronunciation}
            />
          </div>
        </div>
      </div>
    </>
  );
};
```

## File: components/karaoke-player-settings/LyricsDisplayMenu.tsx
```typescript
// 가사 디스플레이 상세 메뉴
// src/components/karaoke-player-settings/LyricsDisplayMenu.tsx
import React, { useEffect, useState } from 'react';
import { BackButton } from '@components/common/BackButton';
import styles from './MainMenu.module.css';
import { ToggleSwitch } from '@components/common/ToggleSwitch';

const STORAGE_KEYS = {
  realtimeLyrics: 'realtimeLyrics',
  announceLyrics: 'announceLyrics',
  skipFirstLyrics: 'skipFirstLyrics',
};

const LYRICS_MODE_KEY = 'lyricsMode';
const LYRICS_MODE = {
  SYNC: 'sync',
  FULL: 'full',
};
const labelToMode = {
  기본: LYRICS_MODE.SYNC,
  전체: LYRICS_MODE.FULL,
} as const;

type LyricsMode = (typeof LYRICS_MODE)[keyof typeof LYRICS_MODE];

interface LyricsDisplayMenuProps {
  onBack: () => void;
}

export const LyricsDisplayMenu: React.FC<LyricsDisplayMenuProps> = ({ onBack }) => {
  // 기본 토글 상태 (false = off)
  const [isRealtimeLyricsOn, setIsRealtimeLyricsOn] = useState(true);
  const [isAnnounceLyricsOn, setIsAnnounceLyricsOn] = useState(true);
  const [skipFirstLyrics, setSkipFirstLyrics] = useState(false);

  // 가사 모드
  const [lyricsMode, setLyricsMode] = useState<LyricsMode>('sync');

  // 마운트시 스토리지에서 상태 불러오기
  useEffect(() => {
    chrome.storage.sync.get(
      [STORAGE_KEYS.realtimeLyrics, STORAGE_KEYS.announceLyrics, STORAGE_KEYS.skipFirstLyrics, LYRICS_MODE_KEY],
      (items) => {
        if (items[STORAGE_KEYS.realtimeLyrics] !== undefined) setIsRealtimeLyricsOn(items[STORAGE_KEYS.realtimeLyrics]);
        if (items[STORAGE_KEYS.announceLyrics] !== undefined) setIsAnnounceLyricsOn(items[STORAGE_KEYS.announceLyrics]);
        if (items[STORAGE_KEYS.skipFirstLyrics] !== undefined) setSkipFirstLyrics(items[STORAGE_KEYS.skipFirstLyrics]);
        if (items[LYRICS_MODE_KEY]) setLyricsMode(items[LYRICS_MODE_KEY]);
      },
    );
  }, []);

  // 체크박스 토글 상태 변화 핸들러
  const handleToggleRealtimeLyrics = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsRealtimeLyricsOn(checked);
    chrome.storage.sync.set({ realtimeLyrics: checked });
  };

  // 발음 On/Off
  const handleToggleAnnounceLyrics = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsAnnounceLyricsOn(checked);
    chrome.storage.sync.set({ [STORAGE_KEYS.announceLyrics]: checked });
  };

  // 전주 건너뛰기
  const skipFirstLyricsToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSkipFirstLyrics(checked);
    chrome.storage.sync.set({ [STORAGE_KEYS.skipFirstLyrics]: checked });
  };

  // select value 변경 핸들러
  // 가사 모드 변경 + 두 자막 기본 ON 세팅
  const handleLyricsModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = labelToMode[e.target.value as keyof typeof labelToMode];
    setLyricsMode(value);

    // 현재 상태 유지: 기존 토글값을 그대로 저장
    chrome.storage.sync.set({
      [LYRICS_MODE_KEY]: value,
      [STORAGE_KEYS.realtimeLyrics]: isRealtimeLyricsOn,
      [STORAGE_KEYS.announceLyrics]: isAnnounceLyricsOn,
    });
  };

  return (
    <>
      <div className={styles.horizontalHeader}>
        <BackButton onClick={onBack} />
        <h2 className={styles.menuTitle}>가사 디스플레이</h2>
      </div>

      <hr className={styles.divider} />

      <div className={styles.subSectionScrollable}>
        <div className={styles.subSection}>
          <div className={styles.lyricsMenuItem}>
            <span>현재 가사</span>
            <ToggleSwitch checked={isRealtimeLyricsOn} onChange={handleToggleRealtimeLyrics} />
          </div>

          <div className={styles.lyricsMenuItem}>
            <span>발음 표시</span>
            <ToggleSwitch checked={isAnnounceLyricsOn} onChange={handleToggleAnnounceLyrics} />
          </div>

          <div className={styles.lyricsMenuItem}>
            <span>가사 방식</span>
            <select
              className={styles.settingSelect}
              value={lyricsMode === 'full' ? '전체' : '기본'}
              onChange={handleLyricsModeChange}
            >
              <option>기본</option>
              <option>전체</option>
            </select>
          </div>

          <div className={styles.lyricsMenuItem}>
            <span>전주 자동 건너뛰기</span>
            <ToggleSwitch checked={skipFirstLyrics} onChange={skipFirstLyricsToggle} />
          </div>
        </div>
      </div>
    </>
  );
};
```

## File: components/karaoke-player-settings/LyricsOffsetControl.tsx
```typescript
import React, { useState, useRef, useEffect } from 'react';
import styles from './MainMenu.module.css';

interface LyricsOffsetControlProps {
  initialOffset?: number;
  min?: number;
  max?: number;
  step?: number;
  onCommit?: (value: number) => void;
  onChange?: (value: number) => void; // ✅ 추가: 드래그 중 값 변경 전달
}

export const LyricsOffsetControl: React.FC<LyricsOffsetControlProps> = ({
  initialOffset = 0,
  min = -15,
  max = 15,
  step = 1,
  onCommit,
  onChange,
}) => {
  const [offset, setOffset] = useState(initialOffset);
  const sliderRef = useRef<HTMLInputElement | null>(null);
  const [thumbPos, setThumbPos] = useState(0);

  useEffect(() => {
    // initialOffset이 내부 상태와 다를 때만 업데이트
    if (initialOffset !== offset) {
      setOffset(initialOffset);
    }
  }, [offset, initialOffset]);

  const updateOffset = (newOffset: number) => {
    const bounded = Math.max(min, Math.min(max, newOffset));
    setOffset(bounded);
    onChange?.(bounded);
  };

  const reset = () => updateOffset(0);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateOffset(Number(e.target.value));
  };

  // 마우스 업 및 터치 종료 시점에 onCommit 호출
  const handleMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    console.log('[LyricsOffsetControl] 마우스 업 발생 - onCommit 호출, 값:', e.currentTarget.value);
    if (onCommit) onCommit(Number(e.currentTarget.value));
  };
  const handleTouchEnd = (e: React.TouchEvent<HTMLInputElement>) => {
    console.log('[LyricsOffsetControl] 터치 종료 발생 - onCommit 호출, 값:', e.currentTarget.value);
    if (onCommit) onCommit(Number(e.currentTarget.value));
  };

  // 썸 위치 계산
  useEffect(() => {
    if (sliderRef.current) {
      const slider = sliderRef.current;
      const minVal = Number(slider.min);
      const maxVal = Number(slider.max);
      const ratio = (offset - minVal) / (maxVal - minVal);
      const width = slider.offsetWidth;
      setThumbPos(ratio * width);
    }
  }, [offset, min, max]);

  return (
    <div className={styles.lyricsOffsetContainer} style={{ padding: '12px 16px', position: 'relative' }}>
      <span>가사 싱크 조절</span>
      {/* 슬라이더 */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={offset}
        onChange={handleSliderChange}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleTouchEnd}
        ref={sliderRef}
        className={styles.slider}
        style={{ width: '100%', marginTop: 35, marginBottom: 5 }}
        aria-label="가사 싱크 조절 슬라이더"
      />

      {/* 슬라이더 아래 눈금 및 값 표시 */}
      <div className={styles.sliderTicks} style={{ position: 'relative', width: '100%', height: 28 }}>
        {/* 왼쪽: -10 */}
        <span style={{ position: 'absolute', left: 0, top: 8, color: '#bbb', fontSize: 13 }}>{min}</span>
        {/* 중앙: 0 */}
        <span
          style={{
            position: 'absolute',
            left: '50%',
            top: 8,
            transform: 'translateX(-50%)',
            color: '#bbb',
            fontSize: 13,
            pointerEvents: 'none',
          }}
        >
          0
        </span>
        {/* 오른쪽: 15 */}
        <span style={{ position: 'absolute', right: 0, top: 8, color: '#bbb', fontSize: 13 }}>{max}</span>
        {/* 현재값 표시 (버튼, 썸 위치에 고정) */}
        <button
          type="button"
          onClick={reset}
          style={{
            position: 'absolute',
            left: thumbPos,
            top: -45,
            transform: 'translateX(-50%)',
            background: '#fff',
            color: '#666',
            boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
            border: 'none',
            borderRadius: 8,
            padding: '3px 8px',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: 13,
            zIndex: 2,
            transition: 'background 0.1s',
          }}
          aria-label="가사 싱크 0초로 초기화"
        >
          {offset > 0 ? `+${offset}` : offset}
        </button>
      </div>
    </div>
  );
};
```

## File: components/karaoke-player-settings/LyricsOffsetMenu.tsx
```typescript
// 가사 싱크
// src/components/karaoke-player-settings/LyricsOffsetMenuMenu.tsx
import { BackButton } from '@components/common/BackButton';
import React, { useEffect, useRef, useState } from 'react';
import styles from './MainMenu.module.css';
import { LyricsOffsetControl } from './LyricsOffsetControl';
import { Line } from '@lib/types/lyrics';
import { applyOffsetToLyrics } from '@lib/utils/lyrics/display/lyricsOffset';
import { SingleLineLyrics } from '@components/lyrics/SingleLineLyrics/SingleLineLyrics';

interface LyricsOffsetMenuProps {
  originalLyrics: Line[];
  offset: number;
  onBack: () => void;
  onOffsetChange?: (offset: number, offsetLyrics: Line[]) => void;
  currentTime?: number;
}

export const LyricsOffsetMenu: React.FC<LyricsOffsetMenuProps> = ({
  originalLyrics, // baseLyrics가 전달됨
  offset: initialOffset,
  onBack,
  onOffsetChange,
  currentTime = 0,
}) => {
  const [offset, setOffset] = useState(initialOffset ?? 0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [offsetLyrics, setOffsetLyrics] = useState<Line[]>(originalLyrics);
  const videoRef = useRef<HTMLVideoElement>(null); // 부모에서 비디오 엘리먼트 ref를 props로 전달받거나 별도 관리 필요
  // const lastCommittedOffset = useRef<number | null>(null);

  useEffect(() => {
    setOffset(initialOffset ?? 0);
    setOffsetLyrics(applyOffsetToLyrics(originalLyrics, initialOffset ?? 0, 0));
  }, [initialOffset, originalLyrics]);

  // 현재 video 요소 가져오기
  useEffect(() => {
    const vid = document.querySelector('video');
    if (vid instanceof HTMLVideoElement) {
      videoRef.current = vid;
      console.log('[LyricsOffsetMenu] video element 참조 성공:', vid);
    } else {
      console.warn('[LyricsOffsetMenu] video element를 찾지 못했습니다.');
    }
  }, []);
  /*
  // 슬라이더 드래그 끝났을 때 — 자동 재생 테스트
  const handleOffsetCommit = async (finalOffset: number) => {
    if (!videoRef.current || isAutoPlaying) return;

    const appliedLyrics = applyOffsetToLyrics(originalLyrics, finalOffset, 0);
    setOffset(finalOffset);
    setOffsetLyrics(appliedLyrics);

    // 부모 콜백 호출
    onOffsetChange?.(finalOffset, appliedLyrics);
    setIsAutoPlaying(true);

    // YouTube IFrame API player 객체 얻기 (content script에서 전역 YT 플레이어 참조)
    const rawPlayerElement = document.querySelector('#movie_player');
    const getPlayerMethod =
      rawPlayerElement &&
      typeof (rawPlayerElement as unknown as { getPlayer?: () => YT.Player }).getPlayer === 'function'
        ? (rawPlayerElement as unknown as { getPlayer: () => YT.Player }).getPlayer
        : undefined;

    const player: YT.Player | undefined =
      window.ytPlayer ?? (getPlayerMethod ? getPlayerMethod.call(rawPlayerElement) : undefined);

    try {
      if (player) {
        console.log('[LyricsOffsetMenu] IFrame API player 사용');
        // 현재 시간에서 가장 가까운 가사 찾기
        const adjCurrentTime = player.getCurrentTime() - finalOffset;

        let currentIndex = appliedLyrics.findIndex((line, idx) => {
          const next = appliedLyrics[idx + 1];
          return adjCurrentTime >= line.time && (!next || adjCurrentTime < next.time);
        });
        if (currentIndex === -1) currentIndex = 0;

        const currentLine = appliedLyrics[currentIndex];
        const nextLine = appliedLyrics[currentIndex + 1];
        if (!currentLine) return;

        const segmentStart = currentLine.time + finalOffset;
        const segmentEnd = nextLine ? Math.min(nextLine.time + finalOffset, segmentStart + 5) : segmentStart + 2;

        await skipPreviewSegment(player, segmentStart, segmentEnd, 5);
      } else {
        console.warn('[LyricsOffsetMenu] IFrame API player 없음 → video element 사용');
        await playOffsetTestSegment(
          videoRef,
          appliedLyrics,
          finalOffset,
          () => setIsAutoPlaying(false), // 재생 종료 시점
          5,
        );
      }
    } catch (e) {
      console.warn('[handleOffsetCommit] 자동재생 실패:', e);
    } finally {
      setIsAutoPlaying(false);
    }
  };
*/

  /** 적용 버튼 — 영상 위치는 그대로 두고 가사만 offset 반영 */
  const handleApplyOffset = () => {
    // 항상 원본(originalLyrics) 기준으로 적용
    const appliedLyrics = applyOffsetToLyrics(originalLyrics, offset, 0);
    setOffsetLyrics(appliedLyrics);

    // 부모에게 적용된 값 알림
    onOffsetChange?.(offset, appliedLyrics);

    // content script에 메시지 전송하여 즉시 반영
    chrome.runtime.sendMessage(
      {
        type: 'APPLY_OFFSET_LYRICS',
        payload: { offset, lyrics: appliedLyrics },
      },
      () => {
        if (chrome.runtime.lastError) {
          console.warn('[LyricsOffsetMenu] APPLY_OFFSET_LYRICS 전송 오류:', chrome.runtime.lastError.message);
        } else {
          console.log('[LyricsOffsetMenu] APPLY_OFFSET_LYRICS 전송 완료');
        }
      },
    );

    setIsAutoPlaying(false);
  };
  // 미세 조정 버튼
  /*
  const adjustOffset = (delta: number) => {
    const newOffset = parseFloat((offset + delta).toFixed(2));
    handleOffsetCommit(newOffset);
  };
  */

  return (
    <div className="submenuContainer">
      <div className={styles.horizontalHeader}>
        <BackButton onClick={onBack} />
        <h2 className={styles.menuTitle}>가사 오프셋 설정</h2>
      </div>
      <hr className={styles.divider} />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px', // 버튼과 슬라이더 간 간격
          margin: '20px 0',
        }}
      >
        <LyricsOffsetControl
          initialOffset={offset}
          min={-15}
          max={15}
          step={1}
          onChange={(val) => setOffset(val)}
          onCommit={(val) => setOffset(val)}
        />
        <button
          onClick={handleApplyOffset}
          style={{
            height: '36px',
            marginLeft: 'auto', // 오른쪽에 붙이기 원할 때 사용
          }}
        >
          적용
        </button>
      </div>

      {isAutoPlaying && (
        <div
          style={{
            position: 'absolute',
            bottom: '15%',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        >
          <SingleLineLyrics
            lyrics={offsetLyrics} // 최신 offset 적용된 가사
            offset={0} // ✅ offsetLyrics에 이미 offset 적용됨
            currentTime={videoRef.current?.currentTime ?? currentTime}
            fontColor="#fff"
          />
        </div>
      )}

      <hr className={styles.divider} />
      <p style={{ padding: '12px 16px', color: '#ccc', fontSize: 14 }}>
        가사 자막의 타이밍이 맞지 않을 때, 여기서 미세 조절하세요.
      </p>
    </div>
  );
};
```

## File: components/karaoke-player-settings/MainMenu.module.css
```css
.container {
  min-width: 266px;
  min-height: 200px;
  max-width: 300px;
  max-height: 300px;
  background: rgba(28, 28, 28, 0.9);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 0;
  border-radius: 12px;
  border: 1px solid rgba(72, 72, 72, 0.5);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  user-select: none;
}
.submenuContainer {
  width: 100%;
  max-width: 100%;
  max-height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.submenuContainer .menuTitle {
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
  align-items: center; /* flex 안에서 수직 정렬 */
}
.horizontalHeader {
  display: flex;
  align-items: center; /* 수직 가운데 정렬 */
  gap: 8px; /* 아이콘과 제목 사이 간격 */
  height: 50px;
}
.menuTitle {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
  padding: 0;
  line-height: 1.2;
  /* 왼쪽 정렬 */
  text-align: left;
}

.menuList {
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 1;
}
/* 하위 메뉴 공통 스타일 */
.menuItem {
  display: flex;
  max-width: 100%;
  height: 48px;
  justify-content: space-between; /* 좌우 분리 */
  align-items: center; /* 수직 중앙정렬 */
  padding: 0; /* 위아래 여백 */
}
.menuButton {
  all: unset;
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  max-width: 100%;
  justify-content: space-between; /* 텍스트는 왼쪽, 아이콘은 오른쪽 끝 */
  text-align: center;
  cursor: pointer;
  color: #fff;
  font-size: 1rem;
  background: transparent;
  transition: background-color 0.15s ease;
}
.menuButton:hover,
.menuButton:focus-visible {
  background-color: rgba(255, 255, 255, 0.13);
}
.menuButton:active {
  background-color: rgba(255, 255, 255, 0.22);
}
.menuIcon {
  width: 1em;
  height: 1em;
}
.arrowIcon {
  width: 1em;
  height: 1em;
  margin-left: 8px; /* 텍스트와 화살표 간격 */
}
.menuButtonText {
  font-size: 130%;
  font-weight: 500;
}
.menuButtonLeft {
  display: flex;
  align-items: center;
}
.menuButtonLeft svg {
  padding: 0 12px;
}
.menuToggle {
  margin-right: 26px; /* 원하는 만큼 여백 */
}

.menuItem label {
  cursor: pointer;
  user-select: none;
}
.menuItem select {
  margin-top: 4px;
  margin-right: 26px;
  width: 30%;
  height: 20px;
  justify-content: space-between;
  background: #444;
  border: none;
  color: #fff;
  border-radius: 4px;
  padding-left: 6px;
  font-size: 0.95rem;
  cursor: pointer;
}

.menuItem select:focus {
  outline: 2px solid #fff;
}
.divider {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.17); /* 또는 원하는 색상 */
  margin: 8px 0; /* 상하 여백 */
  width: 100%;
}

/**/
.lyricsOffsetContainer {
  color: #fff;
  font-size: 1rem;
}

.controlButton {
  background: rgba(255 255 255 / 0.1);
  border: none;
  border-radius: 4px;
  font-size: 1.5rem;
  color: #fff;
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: background-color 0.15s;
}

.controlButton:hover {
  background: rgba(255 255 255 / 0.2);
}

.slider {
  height: 6px;
  border-radius: 3px;
  background: rgba(255 255 255 / 0.25);
  cursor: pointer;
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  transition: background-color 0.15s;
}

.slider::-webkit-slider-thumb:hover {
  background: #ddd;
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  transition: background-color 0.15s;
}

.slider::-moz-range-thumb:hover {
  background: #ddd;
}

.subSectionScrollable {
  max-height: 190px;
  overflow-y: auto;
  padding-right: 8px;
}

/* 일반 섹션 */
.subSection {
  margin-left: 16px;
  margin-bottom: 16px;
}

.subSectionTitle {
  margin-left: 8px;
  margin-bottom: 6px;
  font-size: 1.25rem;
  font-weight: 600;
}

.settingItem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 3px 10px 15px;
  font-size: 1rem;
}

.settingLabel {
  flex: 1 0 60px;
  min-width: 60px;
  font-size: 0.98em;
}

.settingSelect {
  flex: 0 0 46%;
  min-width: 95px;
  max-width: 146px;
  background: #444;
  color: #fff;
  border-radius: 5px;
  border: none;
  padding: 6px 10px;
  font-size: 1em;
  margin-left: 10px;
  outline: none;
  cursor: pointer;
}
.settingSelect:focus {
  outline: 2px solid #fff;
}

/* color picker (input[type=color]) */
.colorPicker {
  margin-left: 10px;
  width: 40px;
  height: 30px;
  border-radius: 6px;
  border: none;
  padding: 0;
  background: transparent;
  cursor: pointer;
  box-shadow: none;
}
.colorPicker::-webkit-color-swatch {
  border-radius: 6px;
  border: none;
  background: transparent;
}
.colorPicker::-moz-color-swatch {
  border-radius: 6px;
  border: none;
  background: transparent;
}
.colorPicker::-ms-color-swatch {
  border-radius: 6px;
  border: none;
  background: transparent;
} /* MainMenu.module.css */

.lyricsMenuItem {
  /* 기존 menuItem과 유사하되 padding만 달리 조정 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 10px 10px 15px;
  font-size: 1.25rem;
  /* 필요한 스타일 추가 가능 */
}
```

## File: components/karaoke-player-settings/MainMenu.tsx
```typescript
// 1차 메뉴

import React, { useEffect, useRef, useState } from 'react';
import { LyricsDisplayMenu } from './LyricsDisplayMenu';
import { FontStyleMenu } from './FontStyleMenu';
import { AdvancedSettingsMenu } from './AdvancedSettingsMenu';
import { LyricsOffsetMenu } from './LyricsOffsetMenu';
import { ArrowIcon } from '@components/icons/ArrowIcon';
import styles from './MainMenu.module.css';
import { IconFont } from '@components/icons/FontIcon';
import { IconDisplay } from '@components/icons/DisplayIcon';
import { IconLyricsSync } from '@components/icons/IconLyricsSync';
import { Line } from '@lib/types/lyrics';

interface Position {
  top: number;
  left: number;
}

interface MainMenuProps {
  visible: boolean;
  position?: Position;
  onClose: () => void;
  offset: number;
  setOffset: React.Dispatch<React.SetStateAction<number>>;
}

// MainMenu.tsx (메뉴 컨테이너 및 1차 메뉴 관리)
export const MainMenu: React.FC<MainMenuProps> = ({ visible, position, onClose, offset, setOffset }) => {
  const [baseLyrics, setBaseLyrics] = useState<Line[]>([]); // 원본 가사
  const [, setOriginalLyrics] = useState<Line[]>([]); // 현재 반영 중인 가사
  const [currentSubMenu, setCurrentSubMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const lastOffset = useRef<number | null>(null);

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

  // visible false 시 드릴다운 상태 초기화
  useEffect(() => {
    if (!visible) {
      setCurrentSubMenu(null);
    }
  }, [visible]);

  // 메시지 방식: visible 상태가 true 될 때 가사 최신 데이터 요청
  useEffect(() => {
    function handleLyricsReady(msg: { type?: string }) {
      if (msg.type === 'LYRICS_READY') {
        if (visible) {
          requestLatestLyrics();
        }
      }
    }
    chrome.runtime.onMessage.addListener(handleLyricsReady);
    return () => chrome.runtime.onMessage.removeListener(handleLyricsReady);
  }, [visible]);

  // 최신 가사 요청 함수
  const requestLatestLyrics = () => {
    chrome.runtime.sendMessage({ type: 'GET_LATEST_LYRICS' }, (res) => {
      if (chrome.runtime.lastError) {
        console.warn('[MainMenu] GET_LATEST_LYRICS 실패:', chrome.runtime.lastError.message);
        return;
      }
      const lyrics = res?.lyrics || [];
      setBaseLyrics(lyrics);
      setOriginalLyrics(lyrics);
    });
  };

  // 메뉴가 열릴 때 항상 최신 상태 확보
  useEffect(() => {
    if (visible) {
      requestLatestLyrics();
    }
  }, [visible]);

  return (
    <div
      ref={menuRef}
      className={styles.container}
      style={{
        position: 'absolute',
        top: position?.top,
        left: position?.left,
        transform: 'translate(-50%, -100%)',
      }}
    >
      {currentSubMenu === null && (
        <ul className={styles.menuList}>
          <li className={styles.menuItem}>
            <button className={styles.menuButton} onClick={() => setCurrentSubMenu('lyricsOffset')}>
              <span className={styles.menuButtonLeft}>
                <IconLyricsSync className="menuIcon" width={20} height={20} color="white" />
                <span className={styles.menuButtonText}>가사 싱크</span>
              </span>
              <ArrowIcon size={14} className="arrowIcon" direction="right" style={{ marginRight: 12 }} />
            </button>
          </li>
          <li className={styles.menuItem}>
            <button className={styles.menuButton} onClick={() => setCurrentSubMenu('lyrics')}>
              <span className={styles.menuButtonLeft}>
                <IconDisplay className="menuIcon" width={20} height={20} color="white" />
                <span className={styles.menuButtonText}>가사 표시</span>
              </span>
              <ArrowIcon size={14} className="arrowIcon" direction="right" style={{ marginRight: 12 }} />
            </button>
          </li>
          <li className={styles.menuItem}>
            <button className={styles.menuButton} onClick={() => setCurrentSubMenu('font')}>
              <span className={styles.menuButtonLeft}>
                <IconFont className="menuIcon" width={20} height={20} color="white" />
                <span className={styles.menuButtonText}>글꼴</span>
              </span>
              <ArrowIcon size={14} className="arrowIcon" direction="right" style={{ marginRight: 12 }} />
            </button>
          </li>
          <li className={styles.menuItem}>
            <button className={styles.menuButton} onClick={() => setCurrentSubMenu('advanced')}>
              <span className={styles.menuButtonLeft}>
                <span className={styles.menuButtonText}>기타</span>
              </span>
              <ArrowIcon size={14} className="arrowIcon" direction="right" style={{ marginRight: 12 }} />
            </button>
          </li>
        </ul>
      )}
      {currentSubMenu === 'lyricsOffset' && (
        <LyricsOffsetMenu
          originalLyrics={baseLyrics} // 항상 원본을 전달
          offset={offset} // 저장된 값 내려줌
          onBack={() => setCurrentSubMenu(null)}
          onOffsetChange={(newOffset, offsetLyrics) => {
            if (lastOffset.current === newOffset) return; // 같은 값이면 무시
            lastOffset.current = newOffset;

            setOffset(newOffset); // ✅ offset state 반영
            setOriginalLyrics(offsetLyrics); // dual/full 가사도 즉시 반영
          }}
        />
      )}
      {currentSubMenu === 'lyrics' && <LyricsDisplayMenu onBack={() => setCurrentSubMenu(null)} />}
      {currentSubMenu === 'font' && <FontStyleMenu onBack={() => setCurrentSubMenu(null)} />}
      {currentSubMenu === 'advanced' && <AdvancedSettingsMenu onBack={() => setCurrentSubMenu(null)} />}
    </div>
  );
};
```

## File: components/karaoke-player-settings/MusicNoteButton.tsx
```typescript
// MusicNoteButton.tsx
import React, { useRef } from 'react';
import { useEffect } from 'react';
import styles from './styles.module.css';

interface Props {
  iconPath: string;
  contentEnabled: boolean;
  menuVisible: boolean; // 추가된 prop
  onClick?: () => void;
}
export const MusicNoteButton: React.FC<Props> = ({ iconPath, contentEnabled, menuVisible, onClick }) => {
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const rightControls = document.querySelector('.ytp-right-controls');
    if (!rightControls || !contentEnabled) return;
    if (document.querySelector(`.${styles.musicNoteButton}`)) return;

    const captionsBtn = rightControls.querySelector('.ytp-subtitles-button');
    const settingsBtn = rightControls.querySelector('.ytp-settings-button');
    const btn = document.createElement('button');
    btnRef.current = btn;

    btn.className = `${styles.musicNoteButton} ytp-button ytp-music-note-button`;
    btn.setAttribute('aria-label', '노트');
    btn.tabIndex = 0;

    const iconImg = document.createElement('img');
    iconImg.src = iconPath;
    iconImg.alt = 'music note';
    iconImg.className = styles.icon || '';
    btn.appendChild(iconImg);

    btn.setAttribute('data-tooltip', '노트');

    // 클릭 이벤트: toggle clicked 클래스 + onClick 호출
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      // 클릭 시 클래스 토글은 지금 상태와 메뉴 상태 때문에 불필요, 아래 useEffect로 상태 반영 권장
      onClick?.();
    });

    // 외부 클릭 시 clicked 클래스 제거 (툴팁 숨김 해제용)
    const handleBodyClick = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Node && !btn.contains(target)) {
        btn.classList.remove('clicked');
      }
    };

    document.body.addEventListener('click', handleBodyClick);

    // 버튼 위치 지정
    if (captionsBtn) {
      captionsBtn.after(btn);
    } else if (settingsBtn) {
      settingsBtn.after(btn);
    } else {
      rightControls.appendChild(btn);
    }

    // Cleanup
    return () => {
      btn.remove();
      document.body.removeEventListener('click', handleBodyClick);
    };
  }, [iconPath, contentEnabled, onClick]);

  // menuVisible 상태에 따라 클래스와 data 속성 조절
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    btn.classList.toggle('clicked', menuVisible);
    btn.setAttribute('data-menu-visible', menuVisible ? 'true' : 'false');
  }, [menuVisible]);

  return null;
};
```

## File: components/karaoke-player-settings/styles.module.css
```css
/* styles.module.css */

.musicNoteButton {
  background: none;
  border: none;
  box-sizing: border-box;
  cursor: pointer;
  display: inline-flex;
  padding: 0;
  height: 48px;
  width: 48px;
  opacity: 0.8;
  transition: opacity 0.15s;
}
.musicNoteButton:hover {
  opacity: 1;
}
.musicNoteButton[data-tooltip]:hover:after {
  /* 기본 툴팁 스타일 */
  content: attr(data-tooltip);
  position: absolute;
  bottom: 130%;
  left: 68%;
  transform: translateX(-50%);
  background: rgba(32, 32, 32, 0.95);
  color: #fff;
  padding: 4px 10px;
  border-radius: 5px;
  font-size: 0.96em;
  line-height: 1.2;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 3px 14px rgba(0, 0, 0, 0.13);
  z-index: 10;
}

/* 클릭됐거나 메뉴 뜬 상태에서는 툴팁 숨김 */
.musicNoteButton.clicked[data-tooltip]:after,
.musicNoteButton[data-menu-visible="true"][data-tooltip]:after {
  display: none !important;
}

.icon {
  width: 24px;
  height: 24px;
  margin: auto;
  display: block;
  pointer-events: none;
  filter: brightness(0) invert(1) drop-shadow(0 1px 0 rgba(32, 32, 32, 0.4)) drop-shadow(0 0px 2px #323232);
  transition: filter 0.15s;
}
#my-custom-music-menu {
  position: absolute;
  background: #222;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  z-index: 10000;
  font-size: 14px;
  user-select: none;
}

#my-custom-music-menu div {
  padding: 6px 10px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: background 0.2s;
}

#my-custom-music-menu div:last-child {
  border-bottom: none;
}

#my-custom-music-menu div:hover {
  background: rgba(255, 255, 255, 0.1);
}
```

## File: components/lyrics/FullLyrics/FullLyrics.tsx
```typescript
// src/components/lyrics/FullLyricsView/FullLyricsView.tsx
import React, { useRef, useEffect, useMemo } from 'react';
import styles from './styles.module.css';
import { Line } from '@lib/types/lyrics';
import { useCurrentTime } from '@hooks/useCurrentTime';
import { shiftFirstLyricEarlier } from '@lib/utils/lyrics/display/lyricsOffset';
import { usePronunciations } from '../PronunciationLyrics/usePronunciation';

interface FullLyricsProps {
  lyrics: Line[];
  offset?: number;
  scrollToCurrent?: boolean;
  fontColor?: string;
  pronunciationColor?: string;
  showRealtimeLyrics?: boolean;
  showPronunciationLyrics?: boolean;
}

export const FullLyrics: React.FC<FullLyricsProps> = ({
  lyrics,
  scrollToCurrent = true,
  fontColor = '#FFFFFF',
  pronunciationColor = '#AAAAAA',
  showRealtimeLyrics = true,
  showPronunciationLyrics = true,
}) => {
  const shiftedLyrics = useMemo(() => shiftFirstLyricEarlier(lyrics, 3), [lyrics]);
  const currentTime = useCurrentTime();
  const containerRef = useRef<HTMLDivElement>(null);

  const activeLineIndex = shiftedLyrics.findIndex((line, i) => {
    const next = shiftedLyrics[i + 1];
    return currentTime >= line.time && (!next || currentTime < next.time);
  });

  const lyricTexts = useMemo(() => shiftedLyrics.map((line) => line.text), [shiftedLyrics]);
  const pronList = usePronunciations(lyricTexts);

  // 현재 줄로 스크롤 (선택사항)
  useEffect(() => {
    if (!scrollToCurrent || activeLineIndex < 0) return;
    const el = containerRef.current?.querySelector(`[data-lyric-idx="${activeLineIndex}"]`);
    if (el && el instanceof HTMLElement) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [activeLineIndex, scrollToCurrent]);

  return (
    <div className={styles.fullLyricsContainer} ref={containerRef}>
      {shiftedLyrics.map((line, idx) => {
        const pron = pronList[idx];
        const isActive = idx === activeLineIndex;

        // 현재/발음이 둘 다 OFF면 렌더 안 함
        if (!showRealtimeLyrics && !showPronunciationLyrics) return null;

        return (
          <div key={idx} data-lyric-idx={idx} className={`${styles.lyricItem} ${isActive ? styles.active : ''}`}>
            {showRealtimeLyrics && (
              <div className={`${styles.lyricLine} ${isActive ? styles.active : ''}`} style={{ color: fontColor }}>
                {line.text}
              </div>
            )}

            {showPronunciationLyrics && (
              <div className={styles.pronunciation} style={{ color: pronunciationColor }}>
                {pron && pron.trim() !== '' ? pron : ' '}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
```

## File: components/lyrics/FullLyrics/styles.module.css
```css
.fullLyricsContainer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: -webkit-fill-available;
  pointer-events: none; /* 클릭은 통과 */
  overflow-y: auto;
  background: rgba(24, 24, 24, 0.6);
  border-radius: 16px;
  padding: 32px 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE, Edge */
}
.fullLyricsContainer::-webkit-scrollbar {
  /* Chrome/Safari */
  display: none;
}
.lyricItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px; /* 세트(한 줄) 간격 */
}
.lyricLine {
  font-size: clamp(14px, calc(0.8vw + 0.8vh), 28px);
  line-height: 1.5;
  color: #f3f3f3;
  font-weight: 500;
  transition:
    color 0.15s,
    font-size 0.15s;
  /* 기타 spacing, margin, etc */
  margin-bottom: 0; /* 줄 간 여백 없애기 */
  padding: 0;
}
.active .lyricLine {
  color: #fff;
  font-size: clamp(18px, calc(1vw + 1vh), 32px);
  font-weight: 700;
  background: linear-gradient(90deg, #357aff, #e91e63 80%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.pronunciation {
  font-size: clamp(10px, calc(0.6vw + 0.6vh), 20px);
  opacity: 0.6;
}
/* 부모 .active의 투명 텍스트 처리 무시 */
.active .pronunciation {
  -webkit-text-fill-color: initial; /* 투명 처리 해제 */
  background: none; /* 그라데이션 배경 제거 */
  color: inherit; /* props로 넘어온 색상 적용 */
  opacity: 0.85;
  font-weight: 600; /* 약간 굵게 */
  font-size: clamp(11px, calc(0.65vw + 0.65vh), 22px); /* 5~10% 크기 업 */
}
```

## File: components/lyrics/LyricsOverlayRoot.module.css
```css
.overlayRoot {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%; width: 100%;
  pointer-events: none;
  z-index: 20;
  display: flex;
  justify-content: center;
}
```

## File: components/lyrics/LyricsOverlayRoot.tsx
```typescript
import { YOUTUBE_PLAYER_SELECTOR } from '@constants/youtubeSelectors';
import styles from './LyricsOverlayRoot.module.css';

export function injectLyricsOverlayRoot() {
  console.log('[injectLyricsOverlayRoot] 실행, 기존 root:', document.getElementById('lyrics-cc-overlay'));

  let overlay = document.getElementById('lyrics-cc-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'lyrics-cc-overlay';
    overlay.className = styles.overlayRoot!;

    const player = document.querySelector(YOUTUBE_PLAYER_SELECTOR) as HTMLElement | null;

    if (player) {
      // 부모 요소 position 체크 및 relative 지정 (필수)
      const computedStyle = getComputedStyle(player);
      if (computedStyle.position === 'static' || !computedStyle.position) {
        player.style.position = 'relative';
        console.log('[LyricsOverlayRoot] #movie_player에 position: relative 설정');
      }

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

## File: components/lyrics/PronunciationLyrics/usePronunciation.ts
```typescript
import { useEffect, useState } from 'react';
import { splitIntoLangGroups } from '@lib/utils/lyrics/detection/languageSpanSplitter';
import { transliterateAndMerge } from '@lib/utils/lyrics/detection/languageTransliterator';

// 여러 줄의 가사를 한 번에 변환
export function usePronunciations(lines: string[]) {
  const [list, setList] = useState<string[]>(() => Array(lines.length).fill(''));

  useEffect(() => {
    let cancelled = false;

    async function processInBatches(batchSize = 10) {
      const results: string[] = Array(lines.length).fill('');

      for (let start = 0; start < lines.length; start += batchSize) {
        const end = Math.min(start + batchSize, lines.length);
        const batch = lines.slice(start, end);

        // batch 변환 병렬 처리
        const batchResults = await Promise.all(
          batch.map(async (text) => {
            if (!text) return '';
            try {
              const spans = splitIntoLangGroups(text);
              return await transliterateAndMerge(spans);
            } catch (err) {
              console.error('[usePronunciations] 변환 오류:', err);
              return '';
            }
          }),
        );

        // 결과 갱신
        for (let i = 0; i < batchResults.length; i++) {
          results[start + i] = batchResults[i] ?? '';
        }

        // 이미 변환된 일부 리스트를 UI에 반영해서 "점진적"으로 표시
        if (!cancelled) {
          setList((prev) => {
            // 🔹 변환된 부분이 달라진 경우에만 반영
            const updated = [...prev];
            let changed = false;
            for (let i = start; i < end; i++) {
              if (updated[i] !== results[i]) {
                updated[i] = results[i] ?? '';
                changed = true;
              }
            }
            return changed ? updated : prev;
          });
        }

        // 브라우저 쉬게 하기 — 다음 batch로 넘어가기 전에 이벤트 루프를 비움
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    processInBatches();

    return () => {
      cancelled = true;
    };
  }, [lines]);

  return list;
}
```

## File: components/lyrics/SingleLineLyrics/SingleLineLyrics.tsx
```typescript
import React, { useMemo } from 'react';
import { Line } from '@lib/types/lyrics';
import styles from './styles.module.css';

interface SingleLineLyricsProps {
  lyrics: Line[];
  offset?: number; // 가사 전체 시간 보정(offset), default 0
  fontColor?: string;
  className?: string;
}

/**
 * 현재 재생 시간(currentTime)은 내부에서 useCurrentTime 훅처럼 별도로 다룰 수도 있지만,
 * 이 컴포넌트는 오로지 props 기반으로 현재 보여줄 가사를 계산해 렌더링합니다.
 *
 * (외부에서 currentTime을 변수로 넘기거나, 필요시 useCurrentTime 훅으로 별도 캡슐화 가능)
 */
export const SingleLineLyrics: React.FC<SingleLineLyricsProps & { currentTime: number }> = ({
  lyrics,
  currentTime,
  offset = 0,
  fontColor = '#fff',
  className = '',
}) => {
  // 현재 오프셋 적용된 시간
  const adjustedTime = currentTime - offset;

  // 현재 가사 한 줄 계산: adjustedTime에 맞춰 현재 표시할 줄 찾기
  // lyrics 배열은 time 오름차순 정렬되어 있다고 가정
  const currentLine = useMemo(() => {
    if (!lyrics.length) return null;
    for (let i = lyrics.length - 1; i >= 0; i--) {
      const line = lyrics[i];
      if (line && line.time !== undefined && adjustedTime >= line.time) {
        return lyrics[i];
      }
    }
    return null;
  }, [lyrics, adjustedTime]);

  if (!currentLine) return null;

  return (
    <div
      className={`${styles.singleLineSubtitle} ${className}`}
      style={{ color: fontColor }}
      aria-live="assertive"
      role="textbox"
    >
      {currentLine.text}
    </div>
  );
};
```

## File: components/lyrics/SingleLineLyrics/styles.module.css
```css
.singleLineSubtitle {
  position: absolute;
  bottom: 80px; /* 유튜브 플레이어 하단 바 위쪽 적절 위치, 필요시 조정 */
  width: 100%;
  text-align: center;
  font-size: 2vw;
  font-weight: 600;
  text-shadow:
    2px 2px 4px rgba(0, 0, 0, 0.75);
  pointer-events: none;
  user-select: none;
  white-space: nowrap;
  color: #fff;
  z-index: 100;
}
```

## File: components/lyrics/SyncLyrics/DualHighlightLyrics.tsx
```typescript
import React, { useMemo } from 'react';
import { useCurrentTime } from '@hooks/useCurrentTime';
import { getDisplayLines } from '@lib/utils/lyrics/display/lyricsDisplay';
import { shiftFirstLyricEarlier } from '@lib/utils/lyrics/display/lyricsOffset';
import { usePronunciations } from '../PronunciationLyrics/usePronunciation';
import { Line } from '@lib/types/lyrics';

import styles from './styles.module.css';

interface DualHighlightLyricsProps {
  lyrics: Line[];
  offset?: number;
  fontColor?: string;
  pronunciationColor?: string;
  showRealtimeLyrics: boolean;
  showPronunciationLyrics: boolean;
}

const LyricLine: React.FC<{
  text?: string;
  pron?: string;
  showText: boolean;
  showPron: boolean;
  fontColor?: string;
  pronunciationColor?: string;
}> = ({ text, pron, showText, showPron, fontColor, pronunciationColor }) => {
  if (!showText && !showPron) return null;

  return (
    <div className={styles.lyricItem}>
      {showText && text && (
        <div className={styles.lyricLine} style={{ color: fontColor }}>
          {text}
        </div>
      )}
      {showPron && pron && (
        <div className={styles.pronunciation} style={{ color: pronunciationColor }}>
          {pron}
        </div>
      )}
    </div>
  );
};

export const DualHighlightLyrics: React.FC<DualHighlightLyricsProps> = ({
  lyrics,
  offset,
  fontColor,
  pronunciationColor,
  showRealtimeLyrics,
  showPronunciationLyrics,
}) => {
  // 오프셋 보정 적용
  const shiftedLyrics = useMemo(() => shiftFirstLyricEarlier(lyrics, 3), [lyrics]);
  const currentTime = useCurrentTime();
  const adjustedTime = currentTime - (offset ?? 0);

  const { top, bottom } = getDisplayLines(shiftedLyrics, adjustedTime);

  // 발음 변환
  const lyricTexts = useMemo(() => shiftedLyrics.map((line) => line.text), [shiftedLyrics]);
  const pronList = usePronunciations(lyricTexts);

  const topPron = top ? pronList[shiftedLyrics.findIndex((l) => l.text === top)] : '';
  const bottomPron = bottom ? pronList[shiftedLyrics.findIndex((l) => l.text === bottom)] : '';

  return (
    <div className={styles.dualHighlightSubtitle} style={{ color: fontColor }}>
      <LyricLine
        text={top}
        pron={topPron}
        showText={showRealtimeLyrics}
        showPron={showPronunciationLyrics}
        fontColor={fontColor}
        pronunciationColor={pronunciationColor}
      />
      <LyricLine
        text={bottom}
        pron={bottomPron}
        showText={showRealtimeLyrics}
        showPron={showPronunciationLyrics}
        fontColor={fontColor}
        pronunciationColor={pronunciationColor}
      />
    </div>
  );
};
```

## File: components/lyrics/SyncLyrics/styles.module.css
```css
.dual-highlight-subtitle {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 70px; /* 하단바 위에 적절한 거리만큼 (조정 가능: 60~96px 등) */
  display: flex;
  height: 2em;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: calc(1.2rem + 1vw);

  /* 너무 크게/작게 변하지 않게 clamp로 제한 */
  font-size: clamp(1rem, calc(1.2rem + 1vw), 2.2rem);

  line-height: 1.4;
  color: #fff;
  text-shadow:
    2px 2px 8px rgba(0, 0, 0, 0.8),
    0 0 2px #000,
    0 0 1px #000;
}
:fullscreen .dual-highlight-subtitle,
:-webkit-full-screen .dual-highlight-subtitle {
  /* 전체화면에서는 더 크게! */
  font-size: clamp(2rem, calc(2.5rem + 2vw), 4rem);
}

/* 한 세트(현재+발음) 묶음 */
.lyricItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px; /* 세트 간 간격 */
}

/* 현재 가사 라인 */
.lyricLine {
  margin-bottom: 0; /* 발음이 있으면 붙이고 */
}

/* 발음 가사 라인 */
.pronunciation {
  font-size: clamp(17px, calc(0.6vw + 0.6vh), 28px);
  opacity: 0.85;
  font-weight: 400;
  transition:
    font-size 0.15s ease,
    font-weight 0.15s ease,
    opacity 0.15s ease;
}

/* 현재 줄 전체 강조
.active .lyricLine {
}
*/
/* 발음만 있는 경우 */
.lyricItem:not(:has(.lyricLine)) .pronunciation {
  font-size: clamp(20px, calc(1vw + 1vh), 36px);
  font-weight: 600; /* 단독일 때 굵게 */
}

/* 전체화면 - 발음 가사 */
:fullscreen .pronunciation,
:-webkit-full-screen .pronunciation {
  font-size: clamp(22px, calc(1.6vw + 1.6vh), 36px);
}

/* 전체화면 - 발음만 있는 경우 */
:fullscreen .lyricItem:not(:has(.lyricLine)) .pronunciation,
:-webkit-full-screen .lyricItem:not(:has(.lyricLine)) .pronunciation {
  font-size: clamp(28px, calc(2vw + 2vh), 52px);
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
  0% {
    background-position: right bottom;
  }
  100% {
    background-position: left bottom;
  }
}

/* 이미 부른 줄 (전체 빨간색) */
.past {
  color: red;
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
  ICON_SETTING: '@public_assets/icons/setting.png',
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

  const [offset, setOffset] = useState(0);
  const [contentEnabled] = useChromeStorage('contentEnabled', true);

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const handleMusicNoteClick = () => {
    const btn = document.querySelector('.ytp-music-note-button');
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setMenuPosition({
        left: rect.left + rect.width / 2 + window.scrollX,
        top: rect.bottom + window.scrollY - 60,
      });

      setMenuVisible((v) => !v);
    }
  };

  return (
    <>
      {contentEnabled && (
        <MusicNoteButton
          iconPath={chrome.runtime.getURL('assets/icons/music_note.png')}
          contentEnabled={contentEnabled}
          menuVisible={menuVisible}
          onClick={handleMusicNoteClick}
        />
      )}
      {menuVisible && (
        <MainMenu
          position={menuPosition}
          visible={true}
          onClose={() => setMenuVisible(false)}
          offset={offset}
          setOffset={setOffset}
        />
      )}
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
import { extractArtistAndTitle, fallbackArtistAndTitle } from '@lib/utils/lyrics/meta/artistTitle';
import {
  cleanTopicName,
  extractArtistAndTitleCustom,
  preprocessArtistOrTitle,
} from '@lib/utils/lyrics/parsers/stringUtils';
import { listenerManager } from '@lib/utils/infra/listenerManager';
import { withContentEnabled } from '@lib/utils/platform/contentGuard';
import { injectLyricsOverlayRoot } from '@components/lyrics/LyricsOverlayRoot';
import { DualHighlightLyrics } from '@components/lyrics/SyncLyrics/DualHighlightLyrics';
import { FullLyrics } from '@components/lyrics/FullLyrics/FullLyrics';
import { isAdPlaying } from '@lib/utils/dom/domUtils';
import { parseLyrics } from '@lib/utils/lyrics/parsers/lyricsParser';
import { Line } from '@lib/types/lyrics';
import { tryDetectVideoChange } from '@lib/utils/platform/videoDetection';
import { clearLyricsCache, setToLyricsCache } from '@lib/utils/cache/lyricsCache';
import { normalizeLyricsQuery } from '@lib/utils/lyrics/meta/queryNormalizer';
import { getLyricsFromCacheOrFetch } from '@lib/utils/lyrics/meta/getLyricsFromCacheOrFetch';
import { fetchLyricsWithAliasFallback } from '@background/api/lyrics';
import 'normalize.css';
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

  // font
  let lyricsFontColorCurrent = '#FFFFFF';
  let lyricsFontColorPronunciation = '#FFFFFF';
  let isOverlayInitializing = false;

  let showRealtimeLyrics = true; // 현재 가사 ui 보이게
  let showPronunciationLyrics = true;

  let lyricsMode: 'sync' | 'full' = 'sync';
  let lastLyricsMode: 'sync' | 'full' | null = null;
  let lastShowRealtimeLyrics: boolean | null = null;
  let lastShowPronunciationLyrics: boolean | null = null;

  let stopAdWatcher: (() => void) | null = null;

  // 중복 가사 호출 방지
  let lastCollectedVideoId: string | null = null;
  let isCollecting = false;

  // 가사 모드
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

  // DOM 및 React root 생성 함수, 호출 시 existing overlay DOM 체크
  function createOverlayRoot(): void {
    injectCSS(); // CSS 한번만 주입

    lyricsOverlayElement = injectLyricsOverlayRoot();

    if (!lyricsOverlayRoot) {
      lyricsOverlayRoot = createRoot(lyricsOverlayElement);
      console.log('[createOverlayRoot] React Root 생성 완료');
    }
  }

  function initListenersAndState() {
    // 초기값 읽기
    chrome.storage.sync.get(
      ['lyricsFontColorCurrent', 'lyricsFontColorPronunciation', 'realtimeLyrics', 'announceLyrics', 'lyricsMode'],
      (items) => {
        if (typeof items.lyricsFontColorCurrent === 'string') {
          lyricsFontColorCurrent = items.lyricsFontColorCurrent;
        }
        if (typeof items.lyricsFontColorPronunciation === 'string') {
          lyricsFontColorPronunciation = items.lyricsFontColorPronunciation;
        }
        if (typeof items.realtimeLyrics === 'boolean') {
          showRealtimeLyrics = items.realtimeLyrics;
        }
        if (typeof items.announceLyrics === 'boolean') {
          showPronunciationLyrics = items.announceLyrics;
        }
        if (['sync', 'full'].includes(items.lyricsMode)) {
          lyricsMode = items.lyricsMode;
        }
        // 최초 렌더 호출
        if (latestLyrics.length > 0) {
          rerenderLyricsOverlay();
        }
      },
    );
    // 2. 저장소 변경 감지 - 실시간 업데이트
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'sync') return;
      let needRerender = false;
      console.log('[storage.onChanged] 변경 감지됨:', changes);

      if ('lyricsFontColorCurrent' in changes) {
        const newColor = changes.lyricsFontColorCurrent.newValue;
        console.log('[storage.onChanged] lyricsFontColorCurrent 변경:', newColor);

        if (typeof newColor === 'string' && newColor !== lyricsFontColorCurrent) {
          lyricsFontColorCurrent = newColor;
          needRerender = true;
        }
      }
      if ('lyricsFontColorPronunciation' in changes) {
        const newColor = changes.lyricsFontColorPronunciation.newValue;
        console.log('[storage.onChanged] lyricsFontColorPronunciation 변경:', newColor);

        if (typeof newColor === 'string' && newColor !== lyricsFontColorPronunciation) {
          lyricsFontColorPronunciation = newColor;
          needRerender = true;
        }
      }
      if ('realtimeLyrics' in changes) {
        showRealtimeLyrics = changes.realtimeLyrics.newValue;
        console.log('[storage.onChanged] realtimeLyrics 변경:', showRealtimeLyrics);
        needRerender = true;
      }
      if ('announceLyrics' in changes) {
        showPronunciationLyrics = changes.announceLyrics.newValue;
        console.log('[storage.onChanged] announceLyrics 변경:', showPronunciationLyrics);
        needRerender = true;
      }
      if ('lyricsMode' in changes) {
        lyricsMode = changes.lyricsMode.newValue;
        console.log('[storage.onChanged] lyricsMode 변경:', lyricsMode);
        needRerender = true;
      }

      if (needRerender) {
        rerenderLyricsOverlay();
      }
    });
  }
  function onLyricsUpdated(newLyrics: Line[]) {
    latestLyrics = newLyrics;
    rerenderLyricsOverlay();
  }

  function hideLyricsOverlay() {
    const overlay = document.getElementById('lyrics-cc-overlay');
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay); // 1. 오버레이 DOM 완전 제거
      console.log('[hideLyricsOverlay] lyrics-cc-overlay 제거');
      lyricsOverlayRoot = null; // 2. React Root 인스턴스 해제
      lyricsOverlayElement = null; // 3. 전역 DOM 참조 변수 초기화
    }
  }

  // sync 가사만 랜더링 함.
  function showLyricsOverlay(lyrics: Line[], offset?: number) {
    if (!lyricsOverlayElement || !lyricsOverlayRoot) {
      createOverlayRoot();
    }

    if (!lyricsOverlayElement) {
      console.warn('[showLyricsOverlay] lyricsOverlayElement가 없음, 함수 종료');
      return;
    }
    lyricsOverlayElement.style.display = '';

    if (lyricsMode !== 'sync') {
      return;
    }
    if (!showRealtimeLyrics && !showPronunciationLyrics) {
      console.log('[showLyricsOverlay] 현재가사/발음가사 모두 꺼짐 → hide');
      hideLyricsOverlay();
      return;
    }
    // React Root 인스턴스가 없으면 (예외 상황) 생성 (평상시 createOverlayRoot에서 처리되어야 함)
    if (!lyricsOverlayRoot && lyricsOverlayElement) {
      lyricsOverlayRoot = createRoot(lyricsOverlayElement);
    }

    if (!lyricsOverlayRoot) {
      console.warn('[showLyricsOverlay] lyricsOverlayRoot가 없음, 렌더링 불가');
      return;
    }

    lyricsOverlayRoot.render(
      <DualHighlightLyrics
        lyrics={lyrics}
        offset={offset}
        fontColor={lyricsFontColorCurrent}
        pronunciationColor={lyricsFontColorPronunciation}
        showRealtimeLyrics={showRealtimeLyrics}
        showPronunciationLyrics={showPronunciationLyrics}
      />,
    );
  }
  // 현재 가사/전체 가사의 분기 함수
  // full 모드 전용
  function rerenderLyricsOverlay() {
    console.log('[rerenderLyricsOverlay] 호출됨, 상태:', {
      lyricsOverlayElement,
      lyricsOverlayRoot,
      showRealtimeLyrics,
      showPronunciationLyrics,
      lyricsMode,
      latestLyricsLength: latestLyrics.length,
      lyricsFontColorCurrent,
      lyricsFontColorPronunciation,
    });

    // [1] overlay, root 둘 중 하나라도 없으면 반드시 비동기 fetch-storage 후 render!
    if (!lyricsOverlayElement || !lyricsOverlayRoot) {
      if (isOverlayInitializing) {
        console.log('[rerenderLyricsOverlay] 초기화 중 중복 호출 무시');
        return;
      }
      isOverlayInitializing = true;

      injectCSS();
      createOverlayRoot();

      chrome.storage.sync.get(['lyricsFontColorCurrent', 'lyricsFontColorPronunciation'], (items) => {
        console.log('[rerenderLyricsOverlay] storage.get 결과:', items);

        if (typeof items.lyricsFontColorCurrent === 'string') {
          lyricsFontColorCurrent = items.lyricsFontColorCurrent;
        } else {
          console.log(
            '[rerenderLyricsOverlay] lyricsFontColorCurrent가 저장소에 없음, 디폴트 사용:',
            lyricsFontColorCurrent,
          );
        }

        if (typeof items.lyricsFontColorPronunciation === 'string') {
          lyricsFontColorPronunciation = items.lyricsFontColorPronunciation;
        } else {
          console.log(
            '[rerenderLyricsOverlay] lyricsFontColorPronunciation가 저장소에 없음, 디폴트 사용:',
            lyricsFontColorPronunciation,
          );
        }
        realOverlayRender(); // storage fetch 완료 후 렌더 호출
        isOverlayInitializing = false;
      });
      return;
    }
    realOverlayRender();
  }

  function realOverlayRender() {
    if (!showRealtimeLyrics && !showPronunciationLyrics) {
      hideLyricsOverlay();
      return;
    }
    if (!lyricsOverlayRoot) return;

    if (lyricsMode === 'full') {
      lyricsOverlayRoot.render(
        <FullLyrics
          lyrics={latestLyrics}
          fontColor={lyricsFontColorCurrent}
          pronunciationColor={lyricsFontColorPronunciation}
          showRealtimeLyrics={showRealtimeLyrics}
          showPronunciationLyrics={showPronunciationLyrics}
        />,
      );
    } else if (lyricsMode === 'sync') {
      lyricsOverlayRoot.render(
        <DualHighlightLyrics
          lyrics={latestLyrics}
          offset={0} // 필요 시 offset 변수
          fontColor={lyricsFontColorCurrent}
          pronunciationColor={lyricsFontColorPronunciation}
          showRealtimeLyrics={showRealtimeLyrics}
          showPronunciationLyrics={showPronunciationLyrics}
        />,
      );
    } else {
      console.warn('[realOverlayRender] 알 수 없는 lyricsMode:', lyricsMode);
      hideLyricsOverlay();
    }
  }

  //rerenderLyricsOverlay() 호출해서 현재 모드에 맞게 "무엇을 보여줄지" 판단.
  function renderLyricsOverlay(lyrics: Line[]) {
    const player = document.querySelector(YOUTUBE_PLAYER_SELECTOR);
    if (!player) return;

    console.log('[renderLyricsOverlay] 호출됨, lyrics 길이:', lyrics.length);

    latestLyrics = lyrics;
    rerenderLyricsOverlay();

    const lyricsStr = JSON.stringify(lyrics);
    if (lastRenderedLyrics === lyricsStr) return;
    lastRenderedLyrics = lyricsStr;

    // Observer 중복 생성 방지
    if (detectionObserverManager.lyricsObserver) {
      detectionObserverManager.lyricsObserver.disconnect();
      detectionObserverManager.lyricsObserver = null;
    }

    if (!showRealtimeLyrics && !showPronunciationLyrics) {
      hideLyricsOverlay();
      return;
    }
    // 최신 lyrics를 클로저로 안전하게 캡처
    detectionObserverManager.lyricsObserver = new MutationObserver(() => {
      if (
        lyricsMode !== lastLyricsMode ||
        showRealtimeLyrics !== lastShowRealtimeLyrics ||
        showPronunciationLyrics !== lastShowPronunciationLyrics
      ) {
        lastLyricsMode = lyricsMode;
        lastShowRealtimeLyrics = showRealtimeLyrics;
        lastShowPronunciationLyrics = showPronunciationLyrics; // 추가 상태 저장

        console.log('[MutationObserver] lyricsMode or showRealtimeLyrics changed, updating UI');

        if (lyricsMode === 'sync' && (showRealtimeLyrics || showPronunciationLyrics)) {
          showLyricsIfNotAd(latestLyrics);
        } else {
          rerenderLyricsOverlay();
        }
      }
    });

    detectionObserverManager.lyricsObserver.observe(player, {
      attributes: true,
      attributeFilter: ['class'],
      attributeOldValue: true,
    });
    showLyricsIfNotAd(lyrics);
  }

  function showLyricsIfNotAd(lyrics: Line[], offset?: number) {
    if (isAdPlaying()) {
      hideLyricsOverlay();
    } else {
      if (lyricsMode === 'sync' && (showRealtimeLyrics || showPronunciationLyrics)) {
        showLyricsOverlay(lyrics, offset);
      } else if (lyricsMode === 'full') {
        rerenderLyricsOverlay();
      }
    }
  }

  // ✅ URL 변경 핸들러 개선
  const handleUrlChange = (url: string) => {
    console.log('handleUrlChange가 실행됨. 근데 곧 리턴됨.');
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

  function finishParsingLyrics(lyricsArray: Line[]) {
    latestLyrics = lyricsArray; // 원본만 저장

    // background로 가사 준비 완료 신호 전송
    chrome.runtime.sendMessage({ type: 'LYRICS_READY', length: lyricsArray.length });
    console.log('finishParsingLyrics 실행 끝!');
  }

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

    finishParsingLyrics(parsedLyrics);
    onLyricsUpdated(parsedLyrics);

    // shiftedLyrics: Line[] 배열 (각 원소에 'text'가 있다고 가정)
    //const lyricsText = shiftedLyrics.map((line) => line.text).join('\n');
    //const lyricsLang = await detectLyricsLanguage(lyricsText, 2);

    // 이 함수는 성공시 meta 및 shiftedLyrics 반환 (후속 분석용)
    return { meta, lyricsDuration, parsedLyrics };
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

    if (durationSec <= 0 || durationSec >= 4) {
      console.log(`영상 길이(${videoDurationSec}s) - 가사 길이(${effectiveLyricsDuration}s) 얼마 차이 안 남.`);
    } else {
      console.log('싱크 오류 가능성 높음.');
    }

    if (isAdPlaying()) {
      console.warn('[analyzeAudioAndRenderLyrics] 광고 중이므로 분석 스킵');
      hideLyricsOverlay();
      return;
    }

    // 중복 audio source 연결 방지 및 안전한 초기화
    cleanupMediaElementSource(videoElem);

    latestLyrics = shiftedLyrics;
    renderLyricsOverlay(shiftedLyrics);
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
    isDetecting = true;

    try {
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
      const { meta, lyricsDuration, parsedLyrics } = collected;

      // 2. 비디오 엘리먼트가 준비되었으면 본 분석 및 렌더링 실행
      const videoElem = document.querySelector('video');

      if (!videoElem) {
        console.log('[handleVideoDetection] video element 미존재, 렌더링 생략');
        return;
      }
      await analyzeAudioAndRenderLyrics(meta, lyricsDuration, videoElem, parsedLyrics);
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
      } else {
        // URL 변동 없으면 감지 호출 안 함
        console.log('[SPA Navigation] URL 변경 없음, 감지 생략:', url);
      }
    }
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    console.log('[content] onMessage 수신:', message);

    if (message.type === 'GET_LATEST_LYRICS') {
      console.log('[content] GET_LATEST_LYRICS 요청 수신 - latestLyrics 길이:', latestLyrics.length);
      sendResponse({ lyrics: latestLyrics });
    }

    // ✅ 오프셋 적용 반영 처리
    if (message.type === 'APPLY_OFFSET_LYRICS') {
      const { offset, lyrics } = message.payload;
      console.log(`[content] APPLY_OFFSET_LYRICS 수신 → offset: ${offset}, 가사 길이: ${lyrics.length}`);

      latestLyrics = lyrics; // 전역 최신 가사 교체
      rerenderLyricsOverlay(); // full / sync 모드에 즉시 적용
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

      // 호출 전 반드시 한 번 실행 필요! (예: index.tsx 엔트리 포인트 초기에 호출)
      initListenersAndState();

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
interface Window {
  [key: string]: unknown;
  ytPlayer?: YT.Player;
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

## File: lib/types/kuroshiro-modules.d.ts
```typescript
// src/lib/types/kuroshiro-modules.d.ts

declare module 'kuroshiro' {
  import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';

  export interface KuroshiroOptions {
    to?: 'hiragana' | 'katakana' | 'romaji';
    romajiSystem?: 'hepburn' | 'kunrei' | 'nippon';
    delimiter?: string;
    mode?: 'normal' | 'spaced' | 'okurigana' | 'furigana';
  }

  export interface KuroshiroInstance {
    init(analyzer: KuromojiAnalyzer): Promise<void>;
    convert(input: string, options?: KuroshiroOptions): Promise<string>;
    // 기타 필요한 메서드/옵션이 있으면 추가 가능
  }

  const Kuroshiro: {
    new (): KuroshiroInstance;
  };

  export default Kuroshiro;
}

declare module 'kuroshiro-analyzer-kuromoji' {
  export interface KuromojiAnalyzerOptions {
    dictPath?: string;
  }

  export default class KuromojiAnalyzer {
    constructor(options?: KuromojiAnalyzerOptions);
    init(): Promise<void>; // 일부 버전에서는 init 함수 있음
    // 기타 필요한 메서드가 있다면 추가 가능
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

## File: lib/types/svg.d.ts
```typescript
declare module '*.svg' {
  const content: string;
  export default content;
}
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

## File: lib/types/youtube.d.ts
```typescript
// src/types/youtube.d.ts (또는 global.d.ts에 추가)
declare namespace YT {
  interface Player {
    getCurrentTime(): number;
    seekTo(seconds: number, allowSeekAhead?: boolean): void;
    playVideo(): void;
    pauseVideo(): void;

    // YouTubePlayer 타입의 메서드 추가
    getPlayerState(): PlayerState;
    addEventListener?(event: string, listener: () => void): void;
    removeEventListener?(event: string, listener: () => void): void;
  }
}

type PlayerState = 'unstarted' | 'ended' | 'playing' | 'paused' | 'buffering' | 'cued';
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

## File: lib/utils/lyrics/detection/languageDetectorSimple.ts
```typescript
// src/lib/utils/lyrics/languageDetectorSimple.ts
export type DetectedLanguageCode = 'ko' | 'ja' | 'th' | 'ar' | 'he' | 'deva' | 'cyrl' | 'other';

type LanguageScriptDetector = {
  lang: DetectedLanguageCode;
  test: (char: string) => boolean;
};

const detectors: LanguageScriptDetector[] = [
  {
    lang: 'ko', // 한국어
    test: (c) => /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7A3]/.test(c),
  },
  {
    lang: 'ja', // 일본어
    test: (c) => /[\u3040-\u309F\u30A0-\u30FF]/.test(c), // 히라가나, 가타카나
  },
  { lang: 'th', test: (c) => /[\u0E00-\u0E7F]/.test(c) }, // 태국어
  { lang: 'ar', test: (c) => /[\u0600-\u06FF]/.test(c) }, // 아랍어
  { lang: 'he', test: (c) => /[\u0590-\u05FF]/.test(c) }, // 히브리어
  { lang: 'deva', test: (c) => /[\u0900-\u097F]/.test(c) }, // 데바나가리
  { lang: 'cyrl', test: (c) => /[\u0400-\u04FF]/.test(c) }, // 키릴문자,
];

export function detectScript(char: string): DetectedLanguageCode {
  const found = detectors.find((d) => d.test(char));
  return found ? found.lang : 'other';
}
```

## File: lib/utils/lyrics/detection/languageSpanSplitter.ts
```typescript
export type ScriptSpan = {
  lang: string | null;
  text: string;
};

// 한자를 포함하여 “일본어 문자 집합” 판단 함수
const isJapaneseKana = (c: string) => /[\u3040-\u309F\u30A0-\u30FF]/.test(c); // 히라가나, 가타카나
const isKanji = (c: string) => /[\u4E00-\u9FFF]/.test(c);

// 문자열을 일본어/비일본어 구간으로 분리
export function splitIntoLangGroups(text: string): ScriptSpan[] {
  const spans: ScriptSpan[] = [];
  let buffer = '';
  let currentIsJaCandidate: boolean | null = null; // ‘일본어(히라가나/가타카나/한자)’ 후보
  const hasKanaInSpan = (span: string) => [...span].some(isJapaneseKana);

  for (const char of text) {
    const isJaChar = isJapaneseKana(char) || isKanji(char);

    if (currentIsJaCandidate === null) {
      buffer = char;
      currentIsJaCandidate = isJaChar;
    } else if (isJaChar === currentIsJaCandidate) {
      buffer += char;
    } else {
      // 스팬 종료: lang 결정
      const lang = currentIsJaCandidate
        ? hasKanaInSpan(buffer)
          ? 'ja' // 히라가나/가타카나가 있으면 일본어
          : 'zh' // 한자만 있으면 중국어
        : 'other';

      spans.push({ lang, text: buffer });
      buffer = char;
      currentIsJaCandidate = isJaChar;
    }
  }

  if (buffer) {
    const lang = currentIsJaCandidate ? (hasKanaInSpan(buffer) ? 'ja' : 'zh') : 'other';
    spans.push({ lang, text: buffer });
  }
  return spans;
}
```

## File: lib/utils/lyrics/detection/languageTransliterator.ts
```typescript
// src/lib/utils/lyrics/languageTransliterator.ts

import { chineseRomanizer } from '../romanizers/chineseRomanizer';
import { japaneseRomanizer } from '../romanizers/japaneseRomanizer';
import { koreanRomanizer } from '../romanizers/koreanRomanizer';
import type { ScriptSpan } from './languageSpanSplitter';

// 변환 불필요 언어나 미지원 스크립트는 그대로 반환
const transliterators: Record<string, (text: string) => Promise<string>> = {
  ko: async (text) => Promise.resolve(koreanRomanizer(text)),
  ja: (text) => japaneseRomanizer(text),
  zh: (text) => chineseRomanizer(text), // 여기에 병음 변환 연결
  th: async (text) => Promise.resolve(text),
  ar: async (text) => Promise.resolve(text),
  he: async (text) => Promise.resolve(text),
  deva: async (text) => Promise.resolve(text),
  cyrl: async (text) => Promise.resolve(text),
  other: async (text) => Promise.resolve(text),
};

export async function transliterateSpans(spans: ScriptSpan[]): Promise<ScriptSpan[]> {
  return Promise.all(
    spans.map(async (span) => {
      const langKey = span.lang ?? 'other';

      // 변환 함수가 없으면 기본 async 함수로 원래 텍스트 반환
      const converter = transliterators[langKey] ?? (async (txt: string) => txt);

      return {
        lang: span.lang,
        text: await converter(span.text),
      };
    }),
  );
}

export function mergeSpans(spans: ScriptSpan[]) {
  return spans.map((s) => s.text).join('');
}

export async function transliterateAndMerge(spans: ScriptSpan[]) {
  const converted = await transliterateSpans(spans);
  return mergeSpans(converted);
}
```

## File: lib/utils/lyrics/display/fontUtils.ts
```typescript
// lib/utils/lyrics/fontUtils.ts
/**
 * 가사 전체 중 가장 긴 줄을 기준으로 폰트 크기를 자동 계산
 * @param lyricsLines 문자열 배열 (싱크/비싱크 상관 없이 한 줄씩)
 * @param containerWidth px 단위 컨테이너 가로폭
 * @param baseFontSize 기준 폰트(px)
 * @returns 계산된 폰트 px 값 (정수)
 */
export function calculateAutoFontSize(lyricsLines: string[], containerWidth: number, baseFontSize = 32): number {
  if (!lyricsLines.length || containerWidth <= 0) return baseFontSize;

  let maxLength = 0;
  const tempSpan = document.createElement('span');
  tempSpan.style.visibility = 'hidden';
  tempSpan.style.whiteSpace = 'nowrap';
  document.body.appendChild(tempSpan);

  for (const line of lyricsLines) {
    tempSpan.innerText = line;
    const lineWidth = tempSpan.offsetWidth;
    if (lineWidth > maxLength) {
      maxLength = lineWidth;
    }
  }

  tempSpan.remove();

  if (maxLength === 0) return baseFontSize;

  const scale = containerWidth / maxLength;
  return Math.floor(baseFontSize * scale);
}
```

## File: lib/utils/lyrics/display/lyricsDisplay.ts
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

## File: lib/utils/lyrics/display/lyricsOffset.ts
```typescript
import { Line } from '@lib/types/lyrics';

/**
 * 가사 배열에 offset 보정 적용
 * @param lyrics 원본 가사 배열 (time기준 정렬되어 있다고 가정)
 * @param offset 초 단위 오프셋 (음수 가능)
 * @param minOffsetLimit 첫 가사의 시간이 minOffsetLimit보다 작아지지 않도록 제한 (예: 0)
 * @returns offset이 적용된 새로운 가사 배열
 */
export function applyOffsetToLyrics(lyrics: Line[], offset: number, minOffsetLimit = 0): Line[] {
  if (!lyrics || lyrics.length === 0) return lyrics;

  const firstLine = lyrics[0];
  if (!firstLine || firstLine.time === undefined) {
    return lyrics; // 그냥 원본 배열 반환 또는 다른 처리
  }
  // 첫 가사의 시간, offset 적용 후 최소값 제한 (minOffsetLimit 이상)
  const firstTimeAfterOffset = firstLine.time + offset;
  const offsetLimited = firstTimeAfterOffset < minOffsetLimit ? minOffsetLimit - firstLine.time : offset;

  // 1차 적용
  const adjusted = lyrics.map((line) => ({
    ...line,
    time: line.time + offsetLimited,
  }));

  // 2차 전역 보정: 모든 time >= 0
  return adjusted.map((line) => ({
    ...line,
    time: line.time < 0 ? 0 : line.time,
  }));
}

export function shiftFirstLyricEarlier(lyrics: Line[], advanceSec: number): Line[] {
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

## File: lib/utils/lyrics/meta/artistTitle.ts
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

## File: lib/utils/lyrics/meta/getLyricsFromCacheOrFetch.ts
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

## File: lib/utils/lyrics/meta/queryNormalizer.ts
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

## File: lib/utils/lyrics/parsers/lyricsParser.ts
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

## File: lib/utils/lyrics/parsers/stringUtils.ts
```typescript
// src/lib/utils/stringUtils.ts
// 문자열 전처리
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
  s = removeEmptyBrackets(s);
  s = preprocessTitleOrArtist(s);
  s = trimTrailingDelimiters(s);
  s = replaceAmpersand(s, 'and');
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
function replaceAmpersand(str: string, replacement: string = 'and') {
  // 양쪽 공백을 유지하며 &를 " and "로 치환 (또는 필요시 ',')
  return str
    .replace(/\s*&\s*/g, ` ${replacement} `)
    .replace(/\s{2,}/g, ' ')
    .trim();
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

## File: lib/utils/lyrics/romanizers/chineseRomanizer.ts
```typescript
// src/lib/utils/lyrics/romanizers/chineseRomanizer.ts
import pinyin from 'pinyin';

/**
 * 중국어 텍스트를 병음(로마자)으로 변환하는 함수
 * @param text 변환할 중국어 텍스트 (주로 한자 포함)
 * @returns 변환된 병음 문자열
 */
export async function chineseRomanizer(text: string): Promise<string> {
  try {
    // pinyin 옵션:
    // - STYLE_NORMAL : 성조 없는 순수 로마자
    // - segment true : 문맥 단어 분리하여 정확도 향상
    const result = pinyin(text, {
      style: pinyin.STYLE_NORMAL,
      segment: true,
    });

    // 이중 배열 형태를 평탄화하여 문자열로 결합 (공백 구분)
    return result.flat().join(' ');
  } catch (error) {
    console.error('Chinese romanizer error:', error);
    // 변환 실패 시 원본 텍스트 그대로 반환
    return text;
  }
}
```

## File: lib/utils/lyrics/romanizers/japaneseRomanizer.ts
```typescript
import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';

// 싱글톤 인스턴스를 모듈 전역에 선언
let kuroshiroInstance: InstanceType<typeof Kuroshiro> | null = null;
let initializationPromise: Promise<void> | null = null;

// 단 하나의 초기화 함수만 제공 (동시에 여러 번 호출되어도 안전)
async function ensureKuroshiroInitialized(): Promise<InstanceType<typeof Kuroshiro>> {
  if (kuroshiroInstance) return kuroshiroInstance;
  if (initializationPromise) {
    await initializationPromise;
    return kuroshiroInstance!;
  }
  initializationPromise = (async () => {
    const dictPath = chrome.runtime.getURL('kuroshiro_dict/');
    console.log('dictPath for analyzer:', dictPath);

    try {
      const analyzer = new KuromojiAnalyzer({ dictPath });
      const instance = new Kuroshiro();
      await instance.init(analyzer);
      kuroshiroInstance = instance;
    } catch (e) {
      console.error('KuromojiAnalyzer/Kuroshiro init error:', e);
    }
  })();
  await initializationPromise;
  initializationPromise = null;
  return kuroshiroInstance!;
}

// 변환 함수는 항상 싱글톤을 await 받아서 사용
export async function japaneseRomanizer(text: string): Promise<string> {
  const kuroshiro = await ensureKuroshiroInitialized();
  try {
    const result = await kuroshiro.convert(text, {
      to: 'romaji',
      romajiSystem: 'hepburn',
      mode: 'normal',
    });
    return result;
  } catch (err) {
    console.error('Kuroshiro convert error:', err);
    throw err; // 변환 실패 시 caller가 알 수 있게 예외를 던짐
  }
}
```

## File: lib/utils/lyrics/romanizers/koreanRomanizer.ts
```typescript
import { romanize } from '@daun_jung/korean-romanizer';

export function koreanRomanizer(text: string): string {
  return romanize(text);
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

## File: lib/utils/platform/playbackUtils.ts
```typescript
// videoRef는 비디오 엘리먼트, currentTime은 현재 재생시간 상태,
// offsetLyrics: offset된 가사 리스트, offset: 보정값, onAutoPlayEnd: 종료 콜백

import { Line } from '@lib/types/lyrics';
import { RefObject } from 'react';

export async function playOffsetTestSegment(
  videoRef: RefObject<HTMLVideoElement | null>,
  offsetLyrics: Line[],
  offset: number,
  onAutoPlayEnd?: () => void,
  maxDurationSec = 5,
) {
  const video = videoRef.current;
  console.log('[playOffsetTestSegment] 시작');
  if (!video) {
    console.warn('[playOffsetTestSegment] videoRef.current가 없습니다.');
    return;
  }

  if (offsetLyrics.length === 0) {
    console.warn('[playOffsetTestSegment] offsetLyrics가 비어 있습니다.');
    return;
  }
  console.log('[playOffsetTestSegment] 현재 video.currentTime:', video.currentTime, 'offset:', offset);

  // 현재 영상 상태 저장
  const wasPlaying = !video.paused;
  const originalTime = video.currentTime;
  let isInternalSeek = false; // 내부 자동 재생 시크 여부 플래그

  // 현재 가사 찾기 (offset 적용된 시간 기준)
  const adjustedTime = video.currentTime - offset;

  let currentIndex = offsetLyrics.findIndex((line, idx) => {
    const next = offsetLyrics[idx + 1];
    return adjustedTime >= line.time && (!next || adjustedTime < next.time);
  });

  if (currentIndex === -1) currentIndex = 0;

  const currentLine = offsetLyrics[currentIndex];
  if (!currentLine) return; // ✅ 안전 처리

  // 구간 재생 시작 시간 (offset 적용된 가사 기준)
  const segmentStart = currentLine.time + offset;
  const nextLine = offsetLyrics[currentIndex + 1];

  // 구간 종료 시간 (다음 가사 등장 전)
  const segmentEnd = nextLine
    ? Math.min(nextLine.time + offset, segmentStart + maxDurationSec)
    : segmentStart + Math.min(2, maxDurationSec);

  // 자동 재생 구간이 음수이거나 기존 시간보다 뒤에 있으면 보정
  const playStartTime = Math.max(segmentStart, 0);

  // 영상 일시정지 + 재생 위치 이동
  if (wasPlaying) {
    video.pause();
  }
  video.currentTime = playStartTime;

  // 자동 재생 완료를 Promise로 대기
  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      video.pause();
      isInternalSeek = true; // 내부 seek로 표시
      video.currentTime = originalTime; // 원래 위치로 돌아가기
      if (wasPlaying) {
        video.play().catch((err) => console.warn('[playOffsetTestSegment] 재생 복원 실패:', err));
      }
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('seeking', onSeeking);
      onAutoPlayEnd?.();
    };

    const onTimeUpdate = () => {
      if (video.currentTime >= segmentEnd) {
        cleanup();
        resolve();
      }
    };

    const onSeeking = () => {
      if (isInternalSeek) {
        // 내부 이동은 무시, 플래그 되돌림
        // isInternalSeek = false;
        return;
      }
      console.warn('[playOffsetTestSegment] 사용자 시크 감지 → 조기 종료');
      cleanup();
      reject(new Error('사용자가 영상 위치를 변경함'));
    };

    isInternalSeek = true;
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('seeking', onSeeking);

    video.pause();
    video.currentTime = segmentStart;

    // 위치 이동 후 일정 시간 후에 플래그 해제 (예: 1초 후)
    setTimeout(() => {
      isInternalSeek = false;
    }, 1000);

    video.play().catch((err) => {
      cleanup();
      reject(err);
    });
  });
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
const DETECTION_COOLDOWN = 10000; // 3초
let lastDetection = 0;

export function shouldDetect(videoId: string, cooldown = DETECTION_COOLDOWN): boolean {
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
  "extLanguage": "Language",
  "extSetting": "setting",
  "extLyrics": "lyrics",
  "extPronunciation": "Pronunciation",
  "extFAQ": "FAQ",
  "extLicense": "License",
  "extContact": "Contact",
  "extPersonalSettings": "Personal Settings",
  "extGeneralSettings": "General Settings"
}
```

## File: locales/ko.json
```json
{
  "extName": "유튜브 노래방",
  "extDescription": "앱 설명",
  "extLanguage": "언어",
  "extSetting": "설정",
  "extLyrics": "가사",
  "extPronunciation": "발음",
  "extFAQ": "많이 묻는 질문",
  "extLicense": "라이센스",
  "extContact": "문의",
  "extPersonalSettings": "개인 설정",
  "extGeneralSettings": "일반 설정"
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
import React, { useEffect, useState } from 'react';
import { useLangLoader } from '@hooks/useLangLoader';
import { useTranslation } from 'react-i18next';
import { useChromeStorage } from '@hooks/useChromeStorage';
import { MESSAGE_TYPES } from '@constants/messageTypes';
import { ErrorFallback } from '@components/common/ErrorFallback';
import { LoadingOverlay } from '@components/common/LoadingOverlay';
import { STORAGE_KEYS } from '@constants/storageKeys';
import { PopupSettingsPanel } from './components/PopupSettingsPanel';
import './popup.css';

interface LanguageChangeMessage {
  type: typeof MESSAGE_TYPES.LANGUAGE_CHANGED;
  language: string;
}
export function App() {
  const { t, i18n } = useTranslation();
  const { phase } = useLangLoader();

  const [enabled, setEnabled] = useChromeStorage(STORAGE_KEYS.CONTENT_ENABLED, false);
  const [showSettings, setShowSettings] = useState(false);

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

  if (showSettings) {
    return <PopupSettingsPanel onBack={() => setShowSettings(false)} />;
  }

  return (
    <div>
      <div className="popup-header">
        <h2>{t('extName')}</h2>
        <button id="go-to-options" className="icon-button" onClick={() => setShowSettings(true)}>
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

## File: popup/components/Contact.tsx
```typescript
import styles from './popupSettingsPanel.module.css';

const GOOGLE_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSfVhvBVQBG5kfS3npBTMBlTfR1t5uYTg73iRJJG612MmdNhKw/viewform?usp=header';

export function Contact() {
  const handleClick = () => {
    window.open(GOOGLE_FORM_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={styles.settingsContent} style={{ textAlign: 'center', padding: '40px 20px' }}>
      <button
        className={styles.settingsButton}
        type="button"
        onClick={handleClick}
        style={{ fontSize: '1.1rem', padding: '12px 24px' }}
      >
        문의하기
      </button>
    </div>
  );
}
```

## File: popup/components/FAQ.module.css
```css
.faqContent {
  padding: 22px 22px; /* 상하좌우 여백 조절 */
}

.faqTitle {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 18px;
  margin-left: 2px;
}

.faqItem {
  margin-bottom: 20px;
}

.faqQuestion {
  color: #888;
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 7px;
}

.faqAnswer {
  color: #222;
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 2px;
}
```

## File: popup/components/FAQ.tsx
```typescript
// FAQ.tsx
import styles from './FAQ.module.css';

const faqList = [
  {
    question: '외국어 가사를 번역하는 기능은 없나요?',
    answer: '네. 현재 번역 기능은 없으며, 앞으로도 구현할 예정은 없습니다.',
  },
  {
    question: '싱크가 안 맞아요.',
    answer:
      '불편을 드려서 죄송합니다. 현재 영상에서 가사 싱크 최적화 작업을 진행하고 있으며, 현재로서는 커스텀 싱크 조절 기능을 이용하여 조절해주세요. 다시 한번 불편을 드려서 죄송합니다!',
  },
  // ... 더 많은 FAQ 항목을 추가할 수 있습니다
];

export function FAQ() {
  return (
    <div className={styles.faqContent}>
      {faqList.map((item, idx) => (
        <div key={idx} className={styles.faqItem}>
          <div className={styles.faqQuestion}>{item.question}</div>
          <div className={styles.faqAnswer}>{item.answer}</div>
        </div>
      ))}
    </div>
  );
}
```

## File: popup/components/LanguageSettings.tsx
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

export function LanguageSettings() {
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

## File: popup/components/LicenseInfo.tsx
```typescript
import React from 'react';
import styles from './popupSettingsPanel.module.css';

export const LicenseInfo: React.FC = () => {
  return (
    <div className={styles.sectionGroup}>
      <div className={styles.sectionLabel}>라이선스 정보</div>
      <p>본 확장 프로그램은 MIT 라이선스에 따라 배포됩니다. 소스 코드는 자유롭게 사용, 수정, 배포가 가능합니다.</p>
      <p>본 확장 프로그램은 다음 오픈소스 라이브러리를 사용하며, 각각의 라이선스 조건을 준수합니다.</p>
      <ul>
        <li>라이브러리 A - Apache 2.0 License</li>
        <li>라이브러리 B - MIT License</li>
        {/* 필요한 경우 추가 명시 */}
      </ul>
      <p>프로그램은 “있는 그대로” 제공되며, 사용 중 발생하는 문제에 대해서 개발자는 법적 책임을 지지 않습니다.</p>
      <p>개인정보 처리에 관한 자세한 내용은 개인정보처리방침 페이지를 참고하시기 바랍니다.</p>
      <p>저작권 © 2025 [개발자명 또는 회사명]. All rights reserved.</p>
    </div>
  );
};
```

## File: popup/components/LyricsSettings.tsx
```typescript
import React from 'react';
import { useChromeStorage } from '@hooks/useChromeStorage';
import styles from './popupSettingsPanel.module.css';

export const LyricsSettings: React.FC = () => {
  // 스토리지에 저장된 설정 불러오기, 기본값 지정
  const [showRealtimeLyrics, setShowRealtimeLyrics] = useChromeStorage('realtimeLyrics', true);
  const [showPronunciationLyrics, setShowPronunciationLyrics] = useChromeStorage('announceLyrics', true);
  const [lyricsFontColorCurrent, setLyricsFontColorCurrent] = useChromeStorage('lyricsFontColorCurrent', '#FFFFFF');
  const [lyricsFontColorPronunciation, setLyricsFontColorPronunciation] = useChromeStorage(
    'lyricsFontColorPronunciation',
    '#AAAAAA',
  );
  const [lyricsMode, setLyricsMode] = useChromeStorage('lyricsMode', 'sync'); // 'sync' | 'full'

  // 폰트 모드 옵션
  const modeOptions = [
    { label: '기본(싱크)', value: 'sync' },
    { label: '전체가사', value: 'full' },
  ];

  return (
    <div className={styles.sectionGroup}>
      <div className={styles.sectionLabel}>가사 설정</div>

      <label className={styles.settingItem}>
        <input type="checkbox" checked={showRealtimeLyrics} onChange={(e) => setShowRealtimeLyrics(e.target.checked)} />
        현재 가사 표시
      </label>

      <label className={styles.settingItem}>
        <input
          type="checkbox"
          checked={showPronunciationLyrics}
          onChange={(e) => setShowPronunciationLyrics(e.target.checked)}
        />
        발음 가사 표시
      </label>

      <div className={styles.settingItem}>
        <label htmlFor="lyricsModeSelect" className={styles.settingLabel}>
          가사 모드
        </label>
        <select
          id="lyricsModeSelect"
          value={lyricsMode}
          onChange={(e) => setLyricsMode(e.target.value)}
          className={styles.settingSelect}
        >
          {modeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.settingItem}>
        <label htmlFor="fontColorCurrent" className={styles.settingLabel}>
          가사 글꼴 색상
        </label>
        <input
          id="fontColorCurrent"
          type="color"
          value={lyricsFontColorCurrent}
          onChange={(e) => setLyricsFontColorCurrent(e.target.value)}
          className={styles.colorPicker}
        />
        <label htmlFor="fontColorCurrent" className={styles.settingLabel}>
          가사 하이라이트 색상
        </label>
      </div>

      <div className={styles.settingItem}>
        <label htmlFor="fontColorPronunciation" className={styles.settingLabel}>
          발음 가사 색상
        </label>
        <input
          id="fontColorPronunciation"
          type="color"
          value={lyricsFontColorPronunciation}
          onChange={(e) => setLyricsFontColorPronunciation(e.target.value)}
          className={styles.colorPicker}
        />
      </div>
    </div>
  );
};
```

## File: popup/components/popupSettingsPanel.module.css
```css
.settingsPanel {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-color: #f9f9fb;
  box-shadow: -3px 0 16px rgba(0, 0, 0, 0.12);
  border-radius: 12px 0 0 12px;
  display: flex;
  flex-direction: column;
  z-index: 1000;
}
.settingsHeader {
  display: flex;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #ececec;
  padding: 10px 12px 10px 12px;
}

.settingsHeader h2 {
  font-size: 15px;
  margin: 5px;
  font-weight: 700;
  margin-left: 7px;
  user-select: none;
  color: #222;
}

.settingsContent {
  flex-grow: 1;
  overflow-y: auto;
  padding: 18px 0;
}
/* 개인 설정, 일반 섹션 묶음 */
.sectionGroup {
  margin-bottom: 24px;
}

.sectionLabel {
  color: #9c9c9c;
  font-weight: 600;
  margin-bottom: 8px;
  margin-left: 15px;
  font-size: 12px;
  user-select: none;
}

/* 메뉴 버튼 스타일 */
.settingsButton {
  width: 100%;
  background: #fff;
  padding: 15px 15px;
  border: none;
  border-bottom: 1px solid #ececec;
  font-weight: 600;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  transition:
    background-color 0.2s,
    box-shadow 0.2s;
  text-align: left;
}
.settingsButton:last-child {
  border-bottom: none;
}

/* hover 시 버튼 배경 및 그림자 표시 */
.settingsButton:hover {
  background-color: #f0f0f0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  outline: none;
}
/* 구분선 */
.divider {
  border: none;
  border-top: 1px solid #ececec;
  margin: 16px 0;
  width: 100%;
  background: transparent;
}
```

## File: popup/components/PopupSettingsPanel.tsx
```typescript
import React, { useState } from 'react';
import { BackButton } from '@components/common/BackButton';
import styles from './popupSettingsPanel.module.css';
import { FAQ } from './FAQ';
import { useTranslation } from 'react-i18next';
import { Contact } from './Contact';
import { LanguageSettings } from './LanguageSettings';
import { LyricsSettings } from './LyricsSettings';
import { LicenseInfo } from './LicenseInfo';

type ComponentKey = 'main' | 'faq' | 'contact' | 'license' | 'language' | 'lyricsSettings';
interface PopupSettingsPanelProps {
  onBack: () => void;
}
interface MainMenuProps {
  onNavigate: (key: ComponentKey) => void;
}

export const PopupSettingsPanel: React.FC<PopupSettingsPanelProps> = ({ onBack }) => {
  const { t } = useTranslation();

  const titles: Record<ComponentKey, string> = {
    main: t('extSetting'),
    faq: t('extFAQ'),
    contact: t('extContact'),
    license: t('extLicense'),
    language: t('extLanguage'),
    lyricsSettings: t('extLyrics'),
  };
  const [activeComponent, setActiveComponent] = useState<ComponentKey>('main');

  let ContentComponent;
  if (activeComponent === 'faq') ContentComponent = FAQ;
  else if (activeComponent === 'contact') ContentComponent = Contact;
  else if (activeComponent === 'language') ContentComponent = LanguageSettings;
  else if (activeComponent === 'lyricsSettings') ContentComponent = LyricsSettings;
  else if (activeComponent === 'license') ContentComponent = LicenseInfo;
  else ContentComponent = MainMenu; // 초기 메뉴

  // BackButton 클릭 핸들러 분리
  const handleBackButtonClick = () => {
    if (activeComponent === 'main') {
      // 현재 초기 메뉴면 부모(onBack) 콜백 호출 -> App.tsx 등 상위로 이동
      onBack();
    } else {
      // FAQ 등 상세화면이면 초기 메뉴로 변경
      setActiveComponent('main');
    }
  };

  return (
    <div className={styles.settingsPanel}>
      <div className={styles.settingsHeader}>
        <BackButton
          onClick={handleBackButtonClick}
          className={styles.popupBackButton}
          arrowColor="#000"
          transparentBackground
          style={{ marginLeft: 0 }}
        />
        <h2>{titles[activeComponent] || t('extSetting')}</h2>
      </div>
      <ContentComponent onNavigate={setActiveComponent} />
    </div>
  );
};
function MainMenu({ onNavigate }: MainMenuProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.settingsContent}>
      <div className={styles.sectionGroup}>
        <div className={styles.sectionLabel}>{t('extPersonalSettings')}</div>
        <button className={styles.settingsButton} onClick={() => onNavigate('lyricsSettings')}>
          {t('extLyrics')}
        </button>
        <button className={styles.settingsButton}>싱크 조절</button>
        <button className={styles.settingsButton}>스타일 변경</button>
        <button className={styles.settingsButton} onClick={() => onNavigate('language')}>
          {t('extLanguage')}
        </button>
      </div>

      <div className={styles.sectionGroup}>
        <div className={styles.sectionLabel}>{t('extGeneralSettings')}</div>
        <button className={styles.settingsButton}>캐시 초기화</button>
        <button className={styles.settingsButton} onClick={() => onNavigate('faq')}>
          {t('extFAQ')}
        </button>
        <button className={styles.settingsButton} onClick={() => onNavigate('contact')}>
          {t('extContact')}
        </button>
        <button className={styles.settingsButton}>{t('extLicense')}</button>
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
  height: 450px;
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
