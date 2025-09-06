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
components/common/TimerPrickerUI.tsx
components/common/ToggleSwitch.tsx
components/icons/ArrowIcon.tsx
components/icons/DisplayIcon.tsx
components/icons/FontIcon.tsx
components/icons/IconLyricsSync.tsx
components/icons/PauseIcon.tsx
components/icons/PlayIcon.tsx
components/icons/ResetIcon.tsx
components/react-bits/BlurText.tsx
components/react-bits/FallingText.tsx
components/react-bits/FuzzyText.tsx
components/react-bits/GlitchText.tsx
components/react-bits/SplitText.tsx
components/react-bits/styles.module.css
components/react-bits/TextType.tsx
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
content/components/karaoke-player-settings/AdvancedSettingsMenu.tsx
content/components/karaoke-player-settings/FontStyleMenu.tsx
content/components/karaoke-player-settings/LyricsDisplayMenu.tsx
content/components/karaoke-player-settings/LyricsOffsetControl.tsx
content/components/karaoke-player-settings/LyricsOffsetMenu.tsx
content/components/karaoke-player-settings/MainMenu.module.css
content/components/karaoke-player-settings/MainMenu.tsx
content/components/karaoke-player-settings/MusicNoteButton.tsx
content/components/karaoke-player-settings/styles.module.css
content/components/lyrics/common/LyricLine.tsx
content/components/lyrics/common/styles.module.css
content/components/lyrics/common/usePronunciation.ts
content/components/lyrics/FullLyrics/FullLyrics.tsx
content/components/lyrics/FullLyrics/styles.module.css
content/components/lyrics/infra/LyricsOverlayRoot.module.css
content/components/lyrics/infra/LyricsOverlayRoot.tsx
content/components/lyrics/SingleLineLyrics/SingleLineLyrics.tsx
content/components/lyrics/SingleLineLyrics/styles.module.css
content/components/lyrics/SyncLyrics/DualHighlightLyrics.tsx
content/components/lyrics/SyncLyrics/styles.module.css
content/components/song-info/SongInfoOverlay.tsx
content/components/song-info/styles.module.css
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
lib/types/react-scroll-picker.d.ts
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
lib/utils/common/concurrencyLimiter.ts
lib/utils/common/limitedFetchLyrics.ts
lib/utils/common/requestLimiter.ts
lib/utils/common/time.ts
lib/utils/common/typeGuards.ts
lib/utils/common/urlUtils.ts
lib/utils/dom/domUtils.ts
lib/utils/dom/styleInjection.ts
lib/utils/infra/adWatcher.ts
lib/utils/infra/listenerManager.ts
lib/utils/infra/overlayManager.ts
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
lib/utils/platform/navigation.ts
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
popup/components/history/History.tsx
popup/components/settings/Contact.tsx
popup/components/settings/FAQ.module.css
popup/components/settings/FAQ.tsx
popup/components/settings/LanguageSettings.tsx
popup/components/settings/License/ExtensionLicense.tsx
popup/components/settings/License/LicenseInfo.tsx
popup/components/settings/License/OpenSourceLicenseList.tsx
popup/components/settings/License/styles.module.css
popup/components/settings/LyricsSettings.tsx
popup/components/settings/PopupSettingsPanel.tsx
popup/components/settings/styles.module.css
popup/components/timer/styles.modules.css
popup/components/timer/Timer.tsx
popup/index.tsx
popup/popup.css
popup/popup.html
services/i18n.ts
styles/GlobalStyle.ts
```

# Files

## File: background/api/lrclib.ts
```typescript
import { Line } from '@lib/types/lyrics';
import { RequestLimiter } from '@lib/utils/common/requestLimiter';

export interface LrcLibLyricsResult {
  lyrics: string | Line[];
  duration?: number;
  artist?: string;
  title?: string;
  id?: string;
  etag?: string;
}

export interface SearchCandidate {
  id: string;
  title?: string;
  artist_name?: string;
}

const requestLimiter = new RequestLimiter(5); // 최대 동시 5개 요청 제한

export async function fetchLyricsByArtistAndTrack(artist: string, title: string): Promise<LrcLibLyricsResult | null> {
  async function searchWithParams(
    artistParam: string,
    titleParam: string,
    _attemptNumber: number,
  ): Promise<LrcLibLyricsResult | null> {
    const endpoint = `https://lrclib.net/api/search?artist_name=${encodeURIComponent(
      artistParam,
    )}&track_name=${encodeURIComponent(titleParam)}`;

    const searchRes = await fetch(endpoint);
    if (!searchRes.ok) {
      console.warn(`Search API response not OK, status: ${searchRes.status}`);
      return null;
    }

    const searchData: SearchCandidate[] = await searchRes.json();
    const limitedCandidates = searchData.slice(0, 10);

    const normalizedReqTitle = titleParam.trim().toLowerCase();

    let fallbackSynced: LrcLibLyricsResult | null = null;
    let fallbackPlain: LrcLibLyricsResult | null = null;

    // 타임아웃을 구현하기 위한 Promise
    const timeoutMs = 7000; // 7초 타임아웃
    let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;

    // 타임아웃 Promise
    const timeoutPromise = new Promise<null>((resolve) => {
      timeoutId = setTimeout(() => {
        console.warn(`Timeout after ${timeoutMs} ms waiting for lyric details`);
        resolve(null);
      }, timeoutMs);
    });

    async function fetchLyricDetail(candidate: SearchCandidate): Promise<
      | (LrcLibLyricsResult & {
          hasSynced: boolean;
          isStrictMatch: boolean;
        })
      | null
    > {
      try {
        const detailRes = await fetch(`https://lrclib.net/api/get/${candidate.id}`);
        if (!detailRes.ok) {
          console.warn(`Detail API response not OK for candidate id ${candidate.id}, status: ${detailRes.status}`);
          return null;
        }
        const detail = (await detailRes.json()) as {
          syncedLyrics?: string | Line[];
          plainLyrics?: string | Line[];
          duration?: number;
          artist?: string;
          title?: string;
        };

        const lyrics = detail.syncedLyrics || detail.plainLyrics;
        if (!lyrics) {
          return null;
        }

        const candidateTitle = (detail.title ?? '').trim().toLowerCase();
        const isStrictMatch = candidateTitle === normalizedReqTitle;

        if (detail.syncedLyrics && !isStrictMatch && !fallbackSynced) {
          fallbackSynced = {
            lyrics,
            duration: detail.duration,
            artist: detail.artist,
            title: detail.title,
            id: candidate.id,
          };
        } else if (!detail.syncedLyrics && !fallbackPlain) {
          fallbackPlain = {
            lyrics,
            duration: detail.duration,
            artist: detail.artist,
            title: detail.title,
            id: candidate.id,
          };
        }

        return {
          lyrics,
          duration: detail.duration,
          artist: detail.artist,
          title: detail.title,
          id: candidate.id,
          hasSynced: !!detail.syncedLyrics,
          isStrictMatch,
        };
      } catch (err) {
        console.error(`Error fetching lyric detail ${candidate.id}:`, err);
        return null;
      }
    }

    // 요청 배치
    const resultsPromise = Promise.all(
      limitedCandidates.map((candidate) => requestLimiter.enqueue(() => fetchLyricDetail(candidate))),
    );

    // 타임아웃 또는 모두 완료 중 먼저 도착하는 것을 선택
    const results = (await Promise.race([resultsPromise, timeoutPromise])) || [];
    clearTimeout(timeoutId);

    // 타임아웃시에도 결과가 부분적으로 나올 수 있으니 validResults 구성
    const validResults = Array.isArray(results)
      ? (results.filter((res) => res !== null) as (LrcLibLyricsResult & {
          hasSynced: boolean;
          isStrictMatch: boolean;
        })[])
      : [];

    if (!validResults.length && (fallbackSynced || fallbackPlain)) {
      console.log('No valid results, returning fallback');
      return fallbackSynced || fallbackPlain;
    }
    if (!validResults.length) {
      console.log('No results found');
      return null;
    }

    const strictSynced = validResults.find((res) => res.hasSynced && res.isStrictMatch);
    if (strictSynced) {
      console.log('Returning strict matched synced lyrics');
      return strictSynced;
    }

    if (fallbackSynced) {
      console.log('Returning fallback synced lyrics');
      return fallbackSynced;
    }

    const strictPlain = validResults.find((res) => !res.hasSynced && res.isStrictMatch);
    if (strictPlain) {
      console.log('Returning strict matched plain lyrics');
      return strictPlain;
    }

    if (fallbackPlain) {
      console.log('Returning fallback plain lyrics');
      return fallbackPlain;
    }

    console.log('Returning first valid result as fallback');
    return validResults[0] || null;
  }

  // 1차 시도: 정상 아티스트-곡명 순서
  const result1 = await searchWithParams(artist, title, 1);
  if (result1 !== null) return result1;

  // 2차 시도: 곡명-아티스트 순서
  if (artist.toLowerCase() !== title.toLowerCase()) {
    const result2 = await searchWithParams(title, artist, 2);
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

// 확장 메시지 타입 유니온에 포함
type TimerMessage = StartTimerMessage | StopTimerMessage | GetStatusMessage | TickMessage;

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
        chrome.runtime.sendMessage({ type: 'tick', totalSeconds });
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
  return true;
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

## File: components/common/TimerPrickerUI.tsx
```typescript
import { Picker } from '@web-lite/scroll-picker';

interface TimerPickerUIProps {
  hours: number;
  minutes: number;
  seconds: number;
  onChange: (h: number, m: number, s: number) => void;
}

export function TimerPickerUI({ hours, minutes, seconds, onChange }: TimerPickerUIProps) {
  const hourList = Array.from({ length: 7 }, (_, i) => i.toString().padStart(2, '0'));
  const minuteList = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  const secondList = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const values = [
    {
      selectedIndex: hours,
      items: hourList,
      onUpdate: (idx: number) => onChange(idx, minutes, seconds),
    },
    {
      selectedIndex: minutes,
      items: minuteList,
      onUpdate: (idx: number) => onChange(hours, idx, seconds),
    },
    {
      selectedIndex: seconds,
      items: secondList,
      onUpdate: (idx: number) => onChange(hours, minutes, idx),
    },
  ];

  return (
    <div style={{ margin: '24px auto', width: 'fit-content' }}>
      <Picker values={values} />
    </div>
  );
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

## File: components/icons/PauseIcon.tsx
```typescript
import React from 'react';

export function PauseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="6" y="5" width="4" height="14" fill="currentColor" />
      <rect x="14" y="5" width="4" height="14" fill="currentColor" />
    </svg>
  );
}
```

## File: components/icons/PlayIcon.tsx
```typescript
import React from 'react';

export function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M8 5v14l11-7-11-7z" fill="currentColor" />
    </svg>
  );
}
```

## File: components/icons/ResetIcon.tsx
```typescript
import React from 'react';

export function ResetIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={props.width || 48}
      height={props.height || 48}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* 원형의 회전 경로 */}
      <path
        d="M24 5
           a19 19 0 1 1 -16 9"
        stroke="currentColor"
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />
      {/* 두껍고 넓은 (좌방향) 화살표 머리 */}
      <polyline
        points="13,7 13,13 19,13"
        fill="none"
        stroke="currentColor"
        strokeWidth={5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
```

## File: components/react-bits/BlurText.tsx
```typescript
import { motion } from 'motion/react';
import { useEffect, useRef, useState, useMemo, FC } from 'react';

type Keyframes = Record<string, Array<string | number>>;

type AnimationStep = Record<string, string | number>;

type EasingFunction = (t: number) => number;

interface BlurTextProps {
  text?: string;
  delay?: number;
  className?: string;
  color?: string;
  fontFamily?: string;
  fontWeight?: string | number;
  animateBy?: 'words' | 'chars';
  direction?: 'top' | 'bottom';
  threshold?: number;
  rootMargin?: string;
  animationFrom?: AnimationStep;
  animationTo?: AnimationStep[];
  easing?: EasingFunction;
  onAnimationComplete?: () => void;
  stepDuration?: number;
}

const buildKeyframes = (from: AnimationStep, steps: AnimationStep[]): Keyframes => {
  const keys = new Set([...Object.keys(from), ...steps.flatMap((s) => Object.keys(s))]);
  const keyframes: Keyframes = {};
  keys.forEach((k) => {
    const values = [from[k], ...steps.map((s) => s[k])].filter((v) => v !== undefined);
    keyframes[k] = values;
  });
  return keyframes;
};

export const BlurText: FC<BlurTextProps> = ({
  text = '',
  delay = 200,
  className = '',
  color,
  fontFamily,
  fontWeight,
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  animationFrom,
  animationTo,
  easing = (t: number) => t,
  onAnimationComplete,
  stepDuration = 0.35,
}) => {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const defaultFrom = useMemo(
    () =>
      direction === 'top' ? { filter: 'blur(10px)', opacity: 0, y: -50 } : { filter: 'blur(10px)', opacity: 0, y: 50 },
    [direction],
  );

  const defaultTo = useMemo(
    () => [
      {
        filter: 'blur(5px)',
        opacity: 0.5,
        y: direction === 'top' ? 5 : -5,
      },
      { filter: 'blur(0px)', opacity: 1, y: 0 },
    ],
    [direction],
  );

  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshots = animationTo ?? defaultTo;

  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, i) => (stepCount === 1 ? 0 : i / (stepCount - 1)));

  return (
    <p ref={ref} className={className} style={{ display: 'flex', flexWrap: 'wrap' }}>
      {elements.map((segment, index) => {
        const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);

        const spanTransition = {
          duration: totalDuration,
          times,
          delay: (index * delay) / 1000,
          ease: easing,
        };

        return (
          <motion.span
            className="inline-block will-change-[transform,filter,opacity]"
            key={index}
            style={{
              display: 'inline-block',
              marginRight: '0.2em',
              color,
              fontFamily,
              fontWeight,
            }}
            initial={fromSnapshot}
            animate={inView ? animateKeyframes : fromSnapshot}
            transition={spanTransition}
            onAnimationComplete={index === elements.length - 1 ? onAnimationComplete : undefined}
          >
            {segment === ' ' ? '\u00A0' : segment}
            {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
          </motion.span>
        );
      })}
    </p>
  );
};
```

## File: components/react-bits/FallingText.tsx
```typescript
import React, { useRef, useState, useEffect } from 'react';
import Matter from 'matter-js';
import './styles.module.css';

interface FallingTextProps {
  className?: string;
  text?: string;
  highlightWords?: string[];
  highlightClass?: string;
  trigger?: 'auto' | 'scroll' | 'click' | 'hover';
  backgroundColor?: string;
  wireframes?: boolean;
  gravity?: number;
  mouseConstraintStiffness?: number;
  fontSize?: string | number;
}

export const FallingText: React.FC<FallingTextProps> = ({
  className = '',
  text = '',
  highlightWords = [],
  highlightClass = 'highlighted',
  trigger = 'auto',
  backgroundColor = 'transparent',
  wireframes = false,
  gravity = 1,
  mouseConstraintStiffness = 0.2,
  fontSize = '1rem',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const [effectStarted, setEffectStarted] = useState(false);

  useEffect(() => {
    if (!textRef.current) return;
    const words = text.split(' ');
    const newHTML = words
      .map((word) => {
        const isHighlighted = highlightWords.some((hw) => word.startsWith(hw));
        return `<span class="word ${isHighlighted ? highlightClass : ''}">${word}</span>`;
      })
      .join(' ');
    textRef.current.innerHTML = newHTML;
  }, [text, highlightWords, highlightClass]);

  useEffect(() => {
    if (trigger === 'auto') {
      setEffectStarted(true);
      return;
    }
    if (trigger === 'scroll' && containerRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry && entry.isIntersecting) {
            setEffectStarted(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 },
      );

      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [trigger]);

  useEffect(() => {
    if (!effectStarted) return;
    if (!containerRef.current || !textRef.current || !canvasContainerRef.current) return;

    const { Engine, Render, World, Bodies, Runner, Mouse, MouseConstraint, Body } = Matter;

    const containerRect = containerRef.current.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;
    if (width <= 0 || height <= 0) {
      return;
    }

    const engine = Engine.create();
    engine.world.gravity.y = gravity;

    const render = Render.create({
      element: canvasContainerRef.current,
      engine,
      options: {
        width,
        height,
        background: backgroundColor,
        wireframes,
      },
    });

    const boundaryOptions = {
      isStatic: true,
      render: { fillStyle: 'transparent' },
    };

    const floor = Bodies.rectangle(width / 2, height + 25, width, 50, boundaryOptions);
    const leftWall = Bodies.rectangle(-25, height / 2, 50, height, boundaryOptions);
    const rightWall = Bodies.rectangle(width + 25, height / 2, 50, height, boundaryOptions);
    const ceiling = Bodies.rectangle(width / 2, -25, width, 50, boundaryOptions);

    const wordSpans = textRef.current.querySelectorAll<HTMLSpanElement>('.word');

    const wordBodies = Array.from(wordSpans).map((elem) => {
      const rect = elem.getBoundingClientRect();
      const x = rect.left - containerRect.left + rect.width / 2;
      const y = rect.top - containerRect.top + rect.height / 2;
      const body = Bodies.rectangle(x, y, rect.width, rect.height, {
        render: { fillStyle: 'transparent' },
        restitution: 0.8,
        frictionAir: 0.01,
        friction: 0.2,
      });
      Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 5,
        y: 0,
      });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.05);
      return { elem, body };
    });

    wordBodies.forEach(({ elem, body }) => {
      elem.style.position = 'absolute';
      elem.style.left = `${body.position.x - body.bounds.max.x + body.bounds.min.x / 2}px`;
      elem.style.top = `${body.position.y - body.bounds.max.y + body.bounds.min.y / 2}px`;
      elem.style.transform = 'none';
    });

    const mouse = Mouse.create(containerRef.current);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: mouseConstraintStiffness,
        render: { visible: false },
      },
    });

    render.mouse = mouse;

    World.add(engine.world, [floor, leftWall, rightWall, ceiling, mouseConstraint, ...wordBodies.map((wb) => wb.body)]);

    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);

    const updateLoop = () => {
      wordBodies.forEach(({ body, elem }) => {
        const { x, y } = body.position;
        elem.style.left = `${x}px`;
        elem.style.top = `${y}px`;
        elem.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`;
      });
      Matter.Engine.update(engine);
      requestAnimationFrame(updateLoop);
    };

    updateLoop();

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      if (render.canvas && canvasContainerRef.current) {
        canvasContainerRef.current.removeChild(render.canvas);
      }
      World.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, [effectStarted, gravity, wireframes, backgroundColor, mouseConstraintStiffness]);

  const handleTrigger = () => {
    if (!effectStarted && (trigger === 'click' || trigger === 'hover')) {
      setEffectStarted(true);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`falling-text-container ${className}`}
      onClick={trigger === 'click' ? handleTrigger : undefined}
      onMouseEnter={trigger === 'hover' ? handleTrigger : undefined}
      style={{
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        ref={textRef}
        className="falling-text-target"
        style={{
          fontSize,
          lineHeight: 1.4,
        }}
      />
      <div ref={canvasContainerRef} className="falling-text-canvas" />
    </div>
  );
};
```

## File: components/react-bits/FuzzyText.tsx
```typescript
import React, { useEffect, useRef } from 'react';

interface FuzzyTextProps {
  children: React.ReactNode;
  fontSize?: string | number;
  fontWeight?: number | string;
  fontFamily?: string;
  color?: string;
  enableHover?: boolean;
  baseIntensity?: number;
  hoverIntensity?: number;
  className?: string;
}

export const FuzzyText: React.FC<FuzzyTextProps> = ({
  children,
  fontSize = 'clamp(2rem, 10vw, 10rem)',
  fontWeight = 900,
  fontFamily = 'inherit',
  color = '#fff',
  enableHover = true,
  baseIntensity = 0.18,
  hoverIntensity = 0.5,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animationFrameId: number;
    let isCancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const init = async () => {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      if (isCancelled) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const computedFontFamily =
        fontFamily === 'inherit' ? window.getComputedStyle(canvas).fontFamily || 'sans-serif' : fontFamily;

      const fontSizeStr = typeof fontSize === 'number' ? `${fontSize}px` : fontSize;
      let numericFontSize: number;
      if (typeof fontSize === 'number') {
        numericFontSize = fontSize;
      } else {
        const temp = document.createElement('span');
        temp.style.fontSize = fontSize;
        document.body.appendChild(temp);
        const computedSize = window.getComputedStyle(temp).fontSize;
        numericFontSize = parseFloat(computedSize);
        document.body.removeChild(temp);
      }

      const text = React.Children.toArray(children).join('');

      const offscreen = document.createElement('canvas');
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return;

      offCtx.font = `${fontWeight} ${fontSizeStr} ${computedFontFamily}`;
      offCtx.textBaseline = 'alphabetic';
      const metrics = offCtx.measureText(text);

      const actualLeft = metrics.actualBoundingBoxLeft ?? 0;
      const actualRight = metrics.actualBoundingBoxRight ?? metrics.width;
      const actualAscent = metrics.actualBoundingBoxAscent ?? numericFontSize;
      const actualDescent = metrics.actualBoundingBoxDescent ?? numericFontSize * 0.2;

      const textBoundingWidth = Math.ceil(actualLeft + actualRight);
      const tightHeight = Math.ceil(actualAscent + actualDescent);

      const extraWidthBuffer = 10;
      const offscreenWidth = textBoundingWidth + extraWidthBuffer;

      offscreen.width = offscreenWidth;
      offscreen.height = tightHeight;

      const xOffset = extraWidthBuffer / 2;
      offCtx.font = `${fontWeight} ${fontSizeStr} ${computedFontFamily}`;
      offCtx.textBaseline = 'alphabetic';
      offCtx.fillStyle = color;
      offCtx.fillText(text, xOffset - actualLeft, actualAscent);

      const horizontalMargin = 50;
      const verticalMargin = 0;
      canvas.width = offscreenWidth + horizontalMargin * 2;
      canvas.height = tightHeight + verticalMargin * 2;
      ctx.translate(horizontalMargin, verticalMargin);

      const interactiveLeft = horizontalMargin + xOffset;
      const interactiveTop = verticalMargin;
      const interactiveRight = interactiveLeft + textBoundingWidth;
      const interactiveBottom = interactiveTop + tightHeight;

      let isHovering = false;
      const fuzzRange = 30;

      const run = () => {
        if (isCancelled) return;
        ctx.clearRect(-fuzzRange, -fuzzRange, offscreenWidth + 2 * fuzzRange, tightHeight + 2 * fuzzRange);
        const intensity = isHovering ? hoverIntensity : baseIntensity;
        for (let j = 0; j < tightHeight; j++) {
          const dx = Math.floor(intensity * (Math.random() - 0.5) * fuzzRange);
          ctx.drawImage(offscreen, 0, j, offscreenWidth, 1, dx, j, offscreenWidth, 1);
        }
        animationFrameId = window.requestAnimationFrame(run);
      };

      run();

      const isInsideTextArea = (x: number, y: number): boolean => {
        return x >= interactiveLeft && x <= interactiveRight && y >= interactiveTop && y <= interactiveBottom;
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!enableHover) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        isHovering = isInsideTextArea(x, y);
      };

      const handleMouseLeave = () => {
        isHovering = false;
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (!enableHover) return;
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        if (!touch) return;
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        isHovering = isInsideTextArea(x, y);
      };

      const handleTouchEnd = () => {
        isHovering = false;
      };

      if (enableHover) {
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd);
      }

      const cleanup = () => {
        window.cancelAnimationFrame(animationFrameId);
        if (enableHover) {
          canvas.removeEventListener('mousemove', handleMouseMove);
          canvas.removeEventListener('mouseleave', handleMouseLeave);
          canvas.removeEventListener('touchmove', handleTouchMove);
          canvas.removeEventListener('touchend', handleTouchEnd);
        }
      };

      (canvas as any).cleanupFuzzyText = cleanup;
    };

    init();

    return () => {
      isCancelled = true;
      window.cancelAnimationFrame(animationFrameId);
      if (canvas && (canvas as any).cleanupFuzzyText) {
        (canvas as any).cleanupFuzzyText();
      }
    };
  }, [children, fontSize, fontWeight, fontFamily, color, enableHover, baseIntensity, hoverIntensity]);

  return <canvas ref={canvasRef} className={className} />;
};
```

## File: components/react-bits/GlitchText.tsx
```typescript
import { CSSProperties, FC, ReactNode } from 'react';
import styles from './styles.module.css';

interface GlitchTextProps {
  children: ReactNode;
  speed?: number;
  enableShadows?: boolean;
  enableOnHover?: boolean;
  className?: string;
}

export const GlitchText: FC<GlitchTextProps> = ({
  children,
  speed = 1,
  enableShadows = true,
  //enableOnHover = false,
  className = '',
}) => {
  const inlineStyles: CSSProperties & { [key: string]: string } = {
    '--after-duration': `${speed * 3}s`,
    '--before-duration': `${speed * 2}s`,
    '--after-shadow': enableShadows ? '-5px 0 red' : 'none',
    '--before-shadow': enableShadows ? '5px 0 cyan' : 'none',
  };

  //const hoverClass = enableOnHover ? 'enable-on-hover' : '';

  return (
    <div
      className={`${styles.glitch} ${className}`}
      style={inlineStyles}
      data-text={typeof children === 'string' ? children : undefined}
    >
      {children}
    </div>
  );
};
```

## File: components/react-bits/SplitText.tsx
```typescript
import { useRef, useEffect, CSSProperties, FC } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText as GSAPSplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, GSAPSplitText);

type TweenValue =
  | number
  | string
  | boolean
  | ((target: unknown, index?: number, targets?: unknown[]) => number | string | boolean);
type Ease = string | ((t: number) => number);

interface TweenVars {
  [key: string]: TweenValue | TweenValue[] | undefined;
}

interface SplitTextProps {
  text: string;
  className?: string;
  color?: string;
  fontFamily?: string;
  fontWeight?: string | number;
  delay?: number;
  duration?: number;
  ease?: Ease | string;
  splitType?: 'chars' | 'words' | 'lines';
  from?: Partial<TweenVars>;
  to?: Partial<TweenVars>;

  threshold?: number;
  rootMargin?: string;
  textAlign?: CSSProperties['textAlign'];
  onLetterAnimationComplete?: () => void;
}

export const SplitText: FC<SplitTextProps> = ({
  text,
  className = '',
  color,
  fontFamily,
  fontWeight,
  delay = 100,
  duration = 0.6,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  onLetterAnimationComplete,
}) => {
  const ref = useRef(null);
  const animationCompletedRef = useRef(false);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !ref.current || !text) return;

    const el = ref.current as HTMLElement | null;
    if (!el) return;

    animationCompletedRef.current = false;

    const absoluteLines = splitType === 'lines';
    if (absoluteLines) el.style.position = 'relative';

    let splitter;
    try {
      splitter = new GSAPSplitText(el, {
        type: splitType,
        absolute: absoluteLines,
        linesClass: 'split-line',
      });
    } catch (error) {
      console.error('Failed to create SplitText:', error);
      return;
    }

    let targets: HTMLElement[] = [];
    switch (splitType) {
      case 'lines':
        targets = splitter.lines as HTMLElement[];
        break;
      case 'words':
        targets = splitter.words as HTMLElement[];
        break;
      case 'chars':
        targets = splitter.chars as HTMLElement[];
        break;
      default:
        targets = splitter.chars as HTMLElement[];
    }

    if (!targets || targets.length === 0) {
      console.warn('No targets found for SplitText animation');
      splitter.revert();
      return;
    }

    targets.forEach((t) => {
      t.style.willChange = 'transform, opacity';
      if (color) t.style.color = color;
      if (fontFamily) t.style.fontFamily = fontFamily;
      if (fontWeight) t.style.fontWeight = fontWeight.toString();
    });

    const startPct = (1 - threshold) * 100;
    const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
    const marginValue = marginMatch && marginMatch[1] !== undefined ? parseFloat(marginMatch[1]) : 0;
    const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
    const sign = marginValue < 0 ? `-=${Math.abs(marginValue)}${marginUnit}` : `+=${marginValue}${marginUnit}`;
    const start = `top ${startPct}%${sign}`;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start,
        toggleActions: 'play none none none',
        once: true,
        onToggle: (self) => {
          scrollTriggerRef.current = self;
        },
      },
      smoothChildTiming: true,
      onComplete: () => {
        animationCompletedRef.current = true;
        gsap.set(targets, {
          ...to,
          clearProps: 'willChange',
          immediateRender: true,
        });
        onLetterAnimationComplete?.();
      },
    });

    tl.set(targets, { ...from, immediateRender: false, force3D: true });
    tl.to(targets, {
      ...to,
      duration,
      ease,
      stagger: delay / 1000,
      force3D: true,
    });

    return () => {
      tl.kill();
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }
      gsap.killTweensOf(targets);
      if (splitter) {
        splitter.revert();
      }
    };
  }, [
    text,
    color,
    fontFamily,
    fontWeight,
    delay,
    duration,
    ease,
    splitType,
    from,
    to,
    threshold,
    rootMargin,
    onLetterAnimationComplete,
  ]);

  return (
    <p
      ref={ref}
      className={`split-parent ${className}`}
      style={{
        textAlign,
        overflow: 'hidden',
        display: 'inline-block',
        whiteSpace: 'normal',
        wordWrap: 'break-word',
      }}
    >
      {text}
    </p>
  );
};
```

## File: components/react-bits/styles.module.css
```css
/* TextType */
.text-type {
  display: inline-block;
  white-space: pre-wrap;
}

.text-type__cursor {
  margin-left: 0.25rem;
  display: inline-block;
  opacity: 1;
}

.text-type__cursor--hidden {
  display: none;
}

/* GlitchType */
.glitch {
  color: #fff;
  font-size: 0.9rem;
  white-space: nowrap;
  font-weight: 900;
  position: relative;
  margin: 0 auto;
  user-select: none;
  cursor: pointer;
}

.glitch::after,
.glitch::before {
  content: attr(data-text);
  position: absolute;
  top: 0;
  color: #fff;
  background-color: #060010;
  overflow: hidden;
  clip-path: inset(0 0 0 0);
}

.glitch:not(.enable-on-hover)::after {
  left: 10px;
  text-shadow: var(--after-shadow, -10px 0 red);
  animation: animate-glitch var(--after-duration, 3s) infinite linear alternate-reverse;
}
.glitch:not(.enable-on-hover)::before {
  left: -10px;
  text-shadow: var(--before-shadow, 10px 0 cyan);
  animation: animate-glitch var(--before-duration, 2s) infinite linear alternate-reverse;
}

.glitch.enable-on-hover::after,
.glitch.enable-on-hover::before {
  content: '';
  opacity: 0;
  animation: none;
}

.glitch.enable-on-hover:hover::after {
  content: attr(data-text);
  opacity: 1;
  left: 10px;
  text-shadow: var(--after-shadow, -10px 0 red);
  animation: animate-glitch var(--after-duration, 3s) infinite linear alternate-reverse;
}
.glitch.enable-on-hover:hover::before {
  content: attr(data-text);
  opacity: 1;
  left: -10px;
  text-shadow: var(--before-shadow, 10px 0 cyan);
  animation: animate-glitch var(--before-duration, 2s) infinite linear alternate-reverse;
}

@keyframes animate-glitch {
  0%   { clip-path: inset(20% 0 50% 0); }
  5%   { clip-path: inset(10% 0 60% 0); }
  10%  { clip-path: inset(15% 0 55% 0); }
  15%  { clip-path: inset(25% 0 35% 0); }
  20%  { clip-path: inset(30% 0 40% 0); }
  25%  { clip-path: inset(40% 0 20% 0); }
  30%  { clip-path: inset(10% 0 60% 0); }
  35%  { clip-path: inset(15% 0 55% 0); }
  40%  { clip-path: inset(25% 0 35% 0); }
  45%  { clip-path: inset(30% 0 40% 0); }
  50%  { clip-path: inset(20% 0 50% 0); }
  55%  { clip-path: inset(10% 0 60% 0); }
  60%  { clip-path: inset(15% 0 55% 0); }
  65%  { clip-path: inset(25% 0 35% 0); }
  70%  { clip-path: inset(30% 0 40% 0); }
  75%  { clip-path: inset(40% 0 20% 0); }
  80%  { clip-path: inset(20% 0 50% 0); }
  85%  { clip-path: inset(10% 0 60% 0); }
  90%  { clip-path: inset(15% 0 55% 0); }
  95%  { clip-path: inset(25% 0 35% 0); }
  100% { clip-path: inset(30% 0 40% 0); }
}

/* Falling Text */
.falling-text-container {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  cursor: pointer;
  text-align: center;
  padding-top: 2em;
}

.falling-text-target {
  display: inline-block;
}

.word {
  display: inline-block;
  margin: 0 2px;
  user-select: none;
}

.highlighted {
  color: cyan;
  font-weight: bold;
}

.falling-text-canvas {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
}
/**/
```

## File: components/react-bits/TextType.tsx
```typescript
'use client';
import { useEffect, useRef, useState, createElement, useMemo, useCallback, ElementType } from 'react';
import { gsap } from 'gsap';
import './styles.module.css';

type TextTypeProps = {
  text: string | string[];
  as?: ElementType;
  typingSpeed?: number;
  initialDelay?: number;
  pauseDuration?: number;
  deletingSpeed?: number;
  loop?: boolean;
  className?: string;
  showCursor?: boolean;
  hideCursorWhileTyping?: boolean;
  cursorCharacter?: string;
  cursorClassName?: string;
  cursorBlinkDuration?: number;
  textColors?: string[];
  variableSpeed?: { min: number; max: number };
  onSentenceComplete?: (sentence: string, index: number) => void;
  startOnVisible?: boolean;
  reverseMode?: boolean;
  [key: string]: any;
};

export const TextType = ({
  text,
  as: Component = 'div',
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 2000,
  deletingSpeed = 30,
  loop = true,
  className = '',
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = '|',
  cursorClassName = '',
  cursorBlinkDuration = 0.5,
  textColors = [],
  variableSpeed,
  onSentenceComplete,
  startOnVisible = false,
  reverseMode = false,
  ...props
}: TextTypeProps) => {
  const [displayedText, setDisplayedText] = useState<string>('');
  const [currentCharIndex, setCurrentCharIndex] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(!startOnVisible);

  const cursorRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  const textArray = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);

  const getRandomSpeed = useCallback(() => {
    if (!variableSpeed) return typingSpeed;
    const { min, max } = variableSpeed;
    return Math.random() * (max - min) + min;
  }, [variableSpeed, typingSpeed]);

  const getCurrentTextColor = () => {
    if (textColors.length === 0) return '#ffffff'; // 혹은 기본색
    return textColors[currentTextIndex % textColors.length];
  };

  useEffect(() => {
    if (!startOnVisible || !containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 },
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [startOnVisible]);

  useEffect(() => {
    if (showCursor && cursorRef.current) {
      gsap.set(cursorRef.current, { opacity: 1 });
      gsap.to(cursorRef.current, {
        opacity: 0,
        duration: cursorBlinkDuration,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
      });
    }
  }, [showCursor, cursorBlinkDuration]);

  useEffect(() => {
    if (!isVisible) return;
    let timeout: ReturnType<typeof setTimeout>;

    const currentText = textArray[currentTextIndex] ?? '';
    const processedText = reverseMode ? currentText.split('').reverse().join('') : currentText;

    const executeTypingAnimation = () => {
      if (isDeleting) {
        if (displayedText === '') {
          setIsDeleting(false);
          if (currentTextIndex === textArray.length - 1 && !loop) {
            return;
          }
          if (onSentenceComplete) {
            onSentenceComplete(currentText, currentTextIndex);
          }
          setCurrentTextIndex((prev) => (prev + 1) % textArray.length);
          setCurrentCharIndex(0);
          timeout = setTimeout(() => {}, pauseDuration);
        } else {
          timeout = setTimeout(() => {
            setDisplayedText((prev) => prev.slice(0, -1));
          }, deletingSpeed);
        }
      } else {
        if (processedText && currentCharIndex < processedText.length) {
          timeout = setTimeout(
            () => {
              setDisplayedText((prev) => prev + processedText[currentCharIndex]);
              setCurrentCharIndex((prev) => prev + 1);
            },
            variableSpeed ? getRandomSpeed() : typingSpeed,
          );
        } else if (textArray.length > 1) {
          timeout = setTimeout(() => {
            setIsDeleting(true);
          }, pauseDuration);
        }
      }
    };

    if (currentCharIndex === 0 && !isDeleting && displayedText === '') {
      timeout = setTimeout(executeTypingAnimation, initialDelay);
    } else {
      executeTypingAnimation();
    }
    return () => clearTimeout(timeout);
  }, [
    currentCharIndex,
    displayedText,
    isDeleting,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    textArray,
    currentTextIndex,
    loop,
    initialDelay,
    isVisible,
    reverseMode,
    variableSpeed,
    onSentenceComplete,
  ]);

  const shouldHideCursor =
    hideCursorWhileTyping && (currentCharIndex < (textArray[currentTextIndex]?.length ?? 0) || isDeleting);

  return createElement(
    Component,
    {
      ref: containerRef,
      className: `text-type ${className}`,
      style: { color: getCurrentTextColor() }, // 여기서 색상 적용
      ...props,
    },
    displayedText,
    showCursor &&
      !shouldHideCursor &&
      createElement('span', { ref: cursorRef, className: cursorClassName }, cursorCharacter),
  );
};
```

## File: constants/doomIds.ts
```typescript
export const DOM_IDS = {
  ROOT_CONTAINER: 'chrome-extension-root',
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

// 유튜브 미니플레이어 관련 클래스명 및 셀렉터
export const YOUTUBE_MINI_PLAYER_CONTAINER_SELECTOR = '.html5-video-player';
export const YOUTUBE_MINI_PLAYER_CLASSES = ['ytp-miniplayer', 'ytp-small-mode'];

// (선택적) 미니플레이어 UI 표시 여부 확인용 셀렉터
export const YOUTUBE_MINI_PLAYER_UI_SELECTOR = '.ytp-miniplayer-ui';

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
import { MusicNoteButton } from './components/karaoke-player-settings/MusicNoteButton';
import { MainMenu } from './components/karaoke-player-settings/MainMenu';
import { RiMusicAiLine } from 'react-icons/ri';
// import { LyricsContainer } from './components/LyricsContainer';
import musicNoteStyles from './components/karaoke-player-settings/styles.module.css';

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
          icon={<RiMusicAiLine className={musicNoteStyles.icon} size={24} color="white" />}
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

## File: content/components/karaoke-player-settings/AdvancedSettingsMenu.tsx
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

## File: content/components/karaoke-player-settings/FontStyleMenu.tsx
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

## File: content/components/karaoke-player-settings/LyricsDisplayMenu.tsx
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

## File: content/components/karaoke-player-settings/LyricsOffsetControl.tsx
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

## File: content/components/karaoke-player-settings/LyricsOffsetMenu.tsx
```typescript
// 가사 싱크
// src/components/karaoke-player-settings/LyricsOffsetMenuMenu.tsx
import { BackButton } from '@components/common/BackButton';
import React, { useEffect, useRef, useState } from 'react';
import styles from './MainMenu.module.css';
import { LyricsOffsetControl } from './LyricsOffsetControl';
import { Line } from '@lib/types/lyrics';
import { applyOffsetToLyrics } from '@lib/utils/lyrics/display/lyricsOffset';
import { SingleLineLyrics } from '../lyrics/SingleLineLyrics/SingleLineLyrics';

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

## File: content/components/karaoke-player-settings/MainMenu.module.css
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

## File: content/components/karaoke-player-settings/MainMenu.tsx
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

## File: content/components/karaoke-player-settings/MusicNoteButton.tsx
```typescript
// MusicNoteButton.tsx
import React, { ReactNode, useRef } from 'react';
import { useEffect } from 'react';
import styles from './styles.module.css';
import ReactDOM from 'react-dom/client';

interface Props {
  icon: ReactNode;
  contentEnabled: boolean;
  menuVisible: boolean;
  onClick?: () => void;
}
export const MusicNoteButton: React.FC<Props> = ({ icon, contentEnabled, menuVisible, onClick }) => {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const iconRootRef = useRef<ReactDOM.Root | null>(null);

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
    btn.setAttribute('data-tooltip', '노트');
    btn.tabIndex = 0;

    iconRootRef.current = ReactDOM.createRoot(btn);
    iconRootRef.current.render(icon);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
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
      iconRootRef.current?.unmount();
      btn.remove();
      document.body.removeEventListener('click', handleBodyClick);
    };
  }, [icon, contentEnabled, onClick]);

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

## File: content/components/karaoke-player-settings/styles.module.css
```css
/* styles.module.css */
.musicNoteButton {
  background: none;
  border: none;
  box-sizing: border-box;
  cursor: pointer;
  display: flex; /* 변경! */
  align-items: center; /* 중앙 정렬 추가 */
  justify-content: center; /* 중앙 정렬 추가 */
  padding: 0;
  height: 36px;   /* ⇐ 48px → 36px 권장, 유튜브 기본 컨트롤바 버튼 높이와 맞춰줌 */
  width: 36px;    /* ⇐ 48px → 36px */
  opacity: 0.8;
  transition: opacity 0.15s;
  position: relative; /* 툴팁 Absolute 위치에 필요하면 추가 */
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

## File: content/components/lyrics/common/LyricLine.tsx
```typescript
import React from 'react';
import styles from './styles.module.css';

export const LyricLine: React.FC<{
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
```

## File: content/components/lyrics/common/styles.module.css
```css
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
  font-weight: bold;
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
```

## File: content/components/lyrics/common/usePronunciation.ts
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

## File: content/components/lyrics/FullLyrics/FullLyrics.tsx
```typescript
// src/components/lyrics/FullLyricsView/FullLyricsView.tsx
import React, { useRef, useEffect, useMemo } from 'react';
import styles from './styles.module.css';
import { Line } from '@lib/types/lyrics';
import { useCurrentTime } from '@hooks/useCurrentTime';
import { shiftFirstLyricEarlier } from '@lib/utils/lyrics/display/lyricsOffset';
import { usePronunciations } from '../common/usePronunciation';

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

## File: content/components/lyrics/FullLyrics/styles.module.css
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

## File: content/components/lyrics/infra/LyricsOverlayRoot.module.css
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

## File: content/components/lyrics/infra/LyricsOverlayRoot.tsx
```typescript
import { YOUTUBE_PLAYER_SELECTOR } from '@constants/youtubeSelectors';
import styles from './LyricsOverlayRoot.module.css';

export function injectLyricsOverlayRoot() {
  let overlay = document.getElementById('lyrics-cc-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'lyrics-cc-overlay';
    overlay.className = styles.overlayRoot!;
    overlay.style.visibility = 'hidden'; // CSS 로드 전 깜빡임 방지용 숨김 처리 추가

    const player = document.querySelector(YOUTUBE_PLAYER_SELECTOR) as HTMLElement | null;
    if (player) {
      // 부모 요소 position 체크 및 relative 지정 (필수)
      const computedStyle = getComputedStyle(player);
      if (computedStyle.position === 'static' || !computedStyle.position) {
        player.style.position = 'relative';
        console.log('[LyricsOverlayRoot] #movie_player에 position: relative 설정');
      }

      player.appendChild(overlay);
      console.log(
        'injectLyricsRoot: #lyrics-cc-overlay element exists?',
        !!document.getElementById('lyrics-cc-overlay'),
      );
    } else {
      console.warn('[LyricsOverlayRoot] 유튜브 플레이어 컨테이너를 찾지 못함');
    }
  } else {
    console.log('[LyricsOverlayRoot] 기존 오버레이 루트 DOM 재사용');
  }
  return overlay;
}
```

## File: content/components/lyrics/SingleLineLyrics/SingleLineLyrics.tsx
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

## File: content/components/lyrics/SingleLineLyrics/styles.module.css
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

## File: content/components/lyrics/SyncLyrics/DualHighlightLyrics.tsx
```typescript
import React, { useMemo } from 'react';
import { useCurrentTime } from '@hooks/useCurrentTime';
import { getDisplayLines } from '@lib/utils/lyrics/display/lyricsDisplay';
import { shiftFirstLyricEarlier } from '@lib/utils/lyrics/display/lyricsOffset';
import { usePronunciations } from '../common/usePronunciation';
import { Line } from '@lib/types/lyrics';
import { LyricLine } from '../common/LyricLine';
import styles from './styles.module.css';

interface DualHighlightLyricsProps {
  lyrics: Line[];
  offset?: number;
  fontColor?: string;
  pronunciationColor?: string;
  showRealtimeLyrics: boolean;
  showPronunciationLyrics: boolean;
}
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

  // 원본 타임 라인 기준
  const highlightIndex = useMemo(() => {
    return shiftedLyrics.findLastIndex((line) => adjustedTime >= line.time);
  }, [lyrics, adjustedTime]);

  return (
    <div className={styles.dualHighlightSubtitle} style={{ color: fontColor }}>
      <LyricLine
        text={top}
        pron={topPron}
        showText={showRealtimeLyrics}
        showPron={showPronunciationLyrics}
        fontColor={
          lyrics.findIndex((l) => l.text === top) <= highlightIndex
            ? 'blue' // 하이라이트 색상
            : fontColor
        }
        pronunciationColor={pronunciationColor}
      />
      <LyricLine
        text={bottom}
        pron={bottomPron}
        showText={showRealtimeLyrics}
        showPron={showPronunciationLyrics}
        fontColor={lyrics.findIndex((l) => l.text === bottom) <= highlightIndex ? 'blue' : fontColor}
        pronunciationColor={pronunciationColor}
      />
    </div>
  );
};
```

## File: content/components/lyrics/SyncLyrics/styles.module.css
```css
.dual-highlight-subtitle {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 70px;
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
```

## File: content/components/song-info/SongInfoOverlay.tsx
```typescript
// src/components/song-info/SongInfoOverlay.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.css';

interface SongInfoOverlayProps {
  title: string;
  artist: string;
  composer?: string;
  lyricist?: string;
  key?: string;
  lyricsSource?: string;
}

export const SongInfoOverlay: React.FC<SongInfoOverlayProps> = ({ title, artist, lyricsSource = 'LRCLIB' }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.overlayContainer}>
      <h1 className={styles.title}>{title}</h1>

      {artist && (
        <h2 className={styles.artist}>
          {t('extArtist')} {artist}
        </h2>
      )}

      <div className={styles.source}>
        {t('extLyricsSourceLabel')} {lyricsSource || t('extUnknownSourceText')}
      </div>

      <div className={styles.copyrightNotice}>{t('extSongCopyrightWarning')}</div>
    </div>
  );
};
```

## File: content/components/song-info/styles.module.css
```css
.overlayContainer {
  position: relative;
  background: rgba(0, 0, 0, 0.75);
  color: white;
  border-radius: 12px;
  padding: 24px 32px;
  height: 30%;
  max-width: 70%;
  width: 70%;
  top: 10%;
  margin: auto;
  box-shadow: 0 2px 14px rgba(0, 0, 0, 0.2);
  font-family: 'Noto Sans KR', sans-serif;
}

.title {
  font-size: 3rem;
  margin: 0;
  font-weight: 700;
  line-height: 1.2;
}

.artist {
  font-size: 1.5rem;
  margin: 10px 0 0 0;
  font-weight: 400;
}

.infoBlock {
  font-size: 1rem;
  margin: 10px 0;
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.lyricist {
  color: #96a7ec; /* 부드러운 파란색 */
}

.composer {
  color: #8ac3b8; /* 소프트 그린 */
}

.key {
  color: #eccc6b; /* 따뜻한 옐로우 */
}

.source {
  font-size: 1rem;
  margin-top: 25px;
  color: #b2bdd4; /* 연한 블루 그레이 */
}

.copyrightNotice {
  font-size: 0.9rem;
  margin-top: 6px;
  padding-top: 8px;
  border-top: 1px solid #375189; /* 진한 파란색 */
  color: #b2bdd4;
  line-height: 1.4;
}
```

## File: content/index.tsx
```typescript
// ./index.tsx
import { App } from './App';
import { i18nInstance, initializeI18n } from '@services/i18n';
import { ErrorFallback } from '@components/common/ErrorFallback';
import { I18nextProvider } from 'react-i18next';
import { ErrorBoundary } from 'react-error-boundary';
import { detectYouTubeVideo, setupSPAObserver } from '@lib/youtube';
import { debounce } from '@lib/utils/common/common';
import { STORAGE_KEYS } from '@constants/storageKeys';
import { fetchYouTubeVideoMeta } from '@background/api/youtube';
import { isMusicVideo } from '@lib/utils/audio/musicDetection';
import { UIResourceManager } from '@lib/utils/infra/uiResourceManager';
import { YOUTUBE_MINI_PLAYER_CLASSES, YOUTUBE_MINI_PLAYER_CONTAINER_SELECTOR } from '@constants/youtubeSelectors';
import { extractArtistAndTitle, fallbackArtistAndTitle } from '@lib/utils/lyrics/meta/artistTitle';
import {
  cleanTopicName,
  extractArtistAndTitleCustom,
  preprocessArtistOrTitle,
} from '@lib/utils/lyrics/parsers/stringUtils';
import { listenerManager } from '@lib/utils/infra/listenerManager';
import { withContentEnabled } from '@lib/utils/platform/contentGuard';
import { DualHighlightLyrics } from './components/lyrics/SyncLyrics/DualHighlightLyrics';
import { FullLyrics } from './components/lyrics/FullLyrics/FullLyrics';
import { isAdPlaying } from '@lib/utils/dom/domUtils';
import { parseLyrics } from '@lib/utils/lyrics/parsers/lyricsParser';
import { Line } from '@lib/types/lyrics';
import { extractVideoIdFromUrl, tryDetectVideoChange } from '@lib/utils/platform/videoDetection';
import { clearLyricsCache, setToLyricsCache } from '@lib/utils/cache/lyricsCache';
import { normalizeLyricsQuery } from '@lib/utils/lyrics/meta/queryNormalizer';
import { getLyricsFromCacheOrFetch } from '@lib/utils/lyrics/meta/getLyricsFromCacheOrFetch';
import { fetchLyricsWithAliasFallback } from '@background/api/lyrics';
import 'normalize.css';
import { cleanupMediaElementSource } from '@lib/utils/audio/audio';
import { checkIfMiniPlayerActive } from '@lib/utils/platform/playerUtils';
import { isWatchPage as checkIsWatchPage } from '@lib/utils/common/urlUtils';
import { hasUrlChanged } from '@lib/utils/platform/navigation';
import { SongInfoOverlay } from './components/song-info/SongInfoOverlay';
import { overlayManager } from '@lib/utils/infra/overlayManager';

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
  let lastUrl = window.location.href;

  let latestLyrics: Line[] = [];
  let contentEnabled = false;

  let spaObserverShouldTriggerDetection = true;
  let isRetryingDetection = false; // 재시도 중복 제어 플래그
  let isFirstMutation = true;

  // font
  let lyricsFontColorCurrent = '#FFFFFF';
  let lyricsFontColorPronunciation = '#FFFFFF';

  let showRealtimeLyrics = true; // 현재 가사 ui 보이게
  let showPronunciationLyrics = true;

  let lyricsMode: 'sync' | 'full' = 'sync';

  // let analyzeLyricsAfterAd: (() => Promise<void>) | null = null;

  // 중복 가사 호출 방지
  let isCollecting = false;

  // 가사 모드
  const getContentEnabled = () => contentEnabled;
  const uiManager = new UIResourceManager();
  const RETRY_DELAY = 300;
  const isMiniToFullTransitioning = false;

  function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // current video id를 얻는 헬퍼
  function getCurrentVideoId(): string | null {
    return extractVideoIdFromUrl(window.location.href);
  }

  interface DetectionObserverManager {
    spaObserver: MutationObserver | null;
    lyricsObserver: MutationObserver | null;
    videoElementObserver: MutationObserver | null;
  }
  const detectionObserverManager: DetectionObserverManager = {
    spaObserver: null,
    lyricsObserver: null,
    videoElementObserver: null,
    // ...other observers
  };

  //
  // clear, clean logic
  /**
   * 모든 리스너와 옵저버, UI 리소스, 오버레이, 가사 상태 데이터를 포함해
   * 콘텐츠 관련 전반적인 리소스를 정리하는 최상위 클린업 함수
   */
  const cleanupAllResources = (): void => {
    console.log('cleanupAllResources 실행');

    listenerManager.removeAll();
    removeAllObservers();
    uiManager.cleanup();
    resetLyricsData();
  };

  // --- Observer 및 리스너 관리 함수 ---
  const removeAllObservers = (): void => {
    Object.values(detectionObserverManager).forEach((obs) => obs?.disconnect && obs.disconnect());
    detectionObserverManager.spaObserver = null;
    detectionObserverManager.lyricsObserver = null;
    detectionObserverManager.videoElementObserver = null;
  };

  /**
   * 렌더링된 가사 데이터를 초기화하고,
   * 화면에 표시된 가사 렌더링을 초기 상태로 재실행하는 함수
   */
  function resetLyricsData() {
    latestLyrics = [];
    console.log('[resetLyricsData] 가사 상태 초기화 완료');

    // 최신 상태 반영 위해 화면 재렌더링
    renderLyricsOverlay(latestLyrics);
  }

  /**
   * UI 관련해서 직접 관리하는 DOM/스타일 등 리소스를 삭제하고,
   * 오버레이 React Root(가사, 노래정보)를 unmount 및 DOM에서 제거하는 함수
   */
  function cleanupOverlayUI() {
    console.log('[cleanupOverlayUI] 실행');
    uiManager.cleanup();
    overlayManager.cleanupOverlay('lyrics');
    overlayManager.cleanupOverlay('songInfo');
  }

  /**
   * 가사 상태 초기화와 UI 오버레이 클린업을 한번에 실행하는 통합 클린업 함수.
   * 기본적으로 대부분의 리소스 정리를 위해 호출됨
   */
  // function resetAllUI() {
  //   console.log('[resetAllUI] 실행');
  //   resetLyricsData();
  //   cleanupOverlayUI();
  // }

  // 가사 렌더링 함수
  async function renderLyricsOverlay(lyrics: Line[], offset = 0) {
    if (lyricsMode === 'full') {
      overlayManager.renderOverlay(
        'lyrics',
        <FullLyrics
          lyrics={lyrics}
          offset={offset}
          fontColor={lyricsFontColorCurrent}
          pronunciationColor={lyricsFontColorPronunciation}
          showRealtimeLyrics={showRealtimeLyrics}
          showPronunciationLyrics={showPronunciationLyrics}
        />,
      );
    } else if (lyricsMode === 'sync') {
      overlayManager.renderOverlay(
        'lyrics',
        <DualHighlightLyrics
          lyrics={lyrics}
          offset={offset}
          fontColor={lyricsFontColorCurrent}
          pronunciationColor={lyricsFontColorPronunciation}
          showRealtimeLyrics={showRealtimeLyrics}
          showPronunciationLyrics={showPronunciationLyrics}
        />,
      );
    } else {
      console.log('[renderLyricsOverlay] else 문으로 overlay cleanup 실행');
      overlayManager.cleanupOverlay('lyrics');
    }
  }

  // 노래 정보 렌더링
  function renderSongInfo(title: string, artist: string) {
    overlayManager.renderOverlay('songInfo', <SongInfoOverlay title={title} artist={artist} lyricsSource="LRCLIB" />);
  }

  // Storage 상태 관리 및 초기값 설정
  function initStorageState(): Promise<void> {
    return new Promise((resolve) => {
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

          // 최초 렌더 호출 (초기 상태 반영)
          if (latestLyrics.length > 0) {
            renderLyricsOverlay(latestLyrics);
          }
          resolve();
        },
      );
    });
  }
  // 다른 이벤트 리스너 등록
  function setupOtherListeners(): void {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      switch (message.type) {
        case 'SPA_NAVIGATION_DETECTED':
          handleSpaUrlChange(message.payload);
          sendResponse({ status: 'ok' });
          break;

        case 'GET_LATEST_LYRICS':
          console.log('[content] GET_LATEST_LYRICS 요청 - 가사 수:', latestLyrics.length);
          sendResponse({ lyrics: latestLyrics });
          break;
        case 'APPLY_OFFSET_LYRICS':
          const { offset, lyrics } = message.payload;
          console.log(`[content] APPLY_OFFSET_LYRICS 수신 → offset: ${offset}, 가사 길이: ${lyrics.length}`);
          onLyricsUpdated(lyrics);
          break;
      }
    });
  }
  // 스토리지 변경 리스너 등록
  function setupStorageChangeListener() {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'sync') return;
      let needRerender = false;

      if ('lyricsFontColorCurrent' in changes) {
        const newColor = changes.lyricsFontColorCurrent.newValue;
        if (typeof newColor === 'string' && newColor !== lyricsFontColorCurrent) {
          lyricsFontColorCurrent = newColor;
          needRerender = true;
        }
      }
      if ('lyricsFontColorPronunciation' in changes) {
        const newColor = changes.lyricsFontColorPronunciation.newValue;
        if (typeof newColor === 'string' && newColor !== lyricsFontColorPronunciation) {
          lyricsFontColorPronunciation = newColor;
          needRerender = true;
        }
      }
      if ('realtimeLyrics' in changes) {
        showRealtimeLyrics = !!changes.realtimeLyrics.newValue;
        needRerender = true;
      }
      if ('announceLyrics' in changes) {
        showPronunciationLyrics = !!changes.announceLyrics.newValue;
        needRerender = true;
      }
      if ('lyricsMode' in changes) {
        const m = changes.lyricsMode.newValue;
        if (m === 'sync' || m === 'full') {
          lyricsMode = m;
          needRerender = true;
        }
      }

      if (needRerender && latestLyrics.length) {
        renderLyricsOverlay(latestLyrics);
      }
    });
  }

  async function initListenersAndState(): Promise<void> {
    await initStorageState();
    setupStorageChangeListener();
    setupOtherListeners();
  }

  function onLyricsUpdated(newLyrics: Line[]) {
    latestLyrics = newLyrics;
    console.log('[Lyrics] 가사 상태 업데이트 완료');

    renderLyricsOverlay(latestLyrics);
  }

  function isLyricsOverlayMounted(): boolean {
    return overlayManager.isOverlayMounted('lyrics');
  }

  // ✅ URL 변경 핸들러 개선, 변화에 따른 상세 후처리(UI 초기화, 중복 방지 등)**를 담당하는 하위 레벨 함수
  const handleUrlChange = (url: string) => {
    console.log('handleUrlChange가 실행됨.');
    const isMini = checkIfMiniPlayerActive();
    const currentVideoId = getCurrentVideoId();
    console.log('currentVideoId:', currentVideoId, 'lastVideoId:', lastVideoId);

    // 영상 id가 같으면 cleanup 스킵
    if (currentVideoId && currentVideoId === lastVideoId) {
      console.log('[handleUrlChange] 같은 videoId 확인됨 → cleanup 건너뜀');
      return;
    }

    if (isMini) {
      console.log('[handleUrlChange] 미니플레이어 → cleanup 안 함');
      lastUrl = url;
      console.log('lastUrl:', lastUrl);
      return;
    }

    if (url === lastUrl) {
      // URL이 같아도 페이지 새로고침인지 판단하여 감지 호출
      console.log('[handleUrlChange] URL 동일, 새로고침 또는 동작 보장용 감지 실행');

      lastVideoId = null;
      cleanupOverlayUI();
      handleVideoDetectionGuarded();
      return;
    }

    cleanupOverlayUI();
    console.log('handleUrlChange 내부의 cleanupOverlayUI 실행!');
    lastVideoId = null;
    console.log(`lastUrl: ${lastUrl}, currentUrl: ${url}`);

    lastUrl = url;
    console.log(`lastUrl: ${lastUrl}, currentUrl: ${url}`);

    const isWatchPage = checkIsWatchPage(url);

    console.log(`[URL Change] ${url}, isWatchPage: ${isWatchPage}`);

    if (isWatchPage) {
      const videoData = detectYouTubeVideo();
      tryDetectVideoChange(videoData?.videoId || null, debouncedDetection);
    }
  };
  const handleUrlChangeGuarded = withContentEnabled(getContentEnabled, handleUrlChange);

  // 1. 영상과 크게 무관한 메타데이터, 가사 정보를 확보하는 함수
  async function collectMetadataAndLyrics(videoId: string, videoElem: HTMLMediaElement): Promise<boolean | null> {
    if (isCollecting) {
      console.log('[Lyrics] 수집 중복 방지 중...');
      return null;
    }
    isCollecting = true;

    try {
      // 1) 메타데이터 및 기본 정보 수집
      const meta = await fetchYouTubeVideoMeta(videoId, process.env.YOUTUBE_API_KEY!);
      if (!meta) throw new Error('메타 정보 없음');
      if (!isMusicVideo(meta)) throw new Error('음악 영상 아님');

      // 아티스트, 타이틀 파싱(기존 처리 로직 사용)
      let parsed = extractArtistAndTitle(meta.title);

      if (!parsed) {
        const fallback = fallbackArtistAndTitle(meta);
        if (!fallback) throw new Error('곡명/아티스트 파싱 실패');

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

      // 2) 가사 캐시 초기화 및 캐시 또는 서버에서 가사 조회
      clearLyricsCache();

      // 가사 캐시 혹은 서버에서 가사 fetch
      const lyricsResult = await getLyricsFromCacheOrFetch(artist, title, {
        fetch: async () => fetchLyricsWithAliasFallback(artist, title),
      });
      if (!lyricsResult) throw new Error('가사 없음');

      // 캐시 저장
      setToLyricsCache(normalizeLyricsQuery(artist, title, {}), {
        lyrics: lyricsResult.lyrics,
        duration: lyricsResult.duration,
        artist: lyricsResult.artist,
        title: lyricsResult.title,
        id: lyricsResult.id,
      });

      // 3) 가사 파싱 및 상태 업데이트 (UI 렌더링)
      const { lyrics, duration: lyricsDuration } = lyricsResult;
      const parsedLyrics: Line[] = typeof lyrics === 'string' ? parseLyrics(lyrics) : lyrics;

      chrome.runtime.sendMessage({ type: 'LYRICS_READY', length: parsedLyrics.length });
      onLyricsUpdated(parsedLyrics);

      // 4) 영상 길이 대비 가사 길이 비교 후 싱크 오류 여부 판단
      const videoDurationSec = meta.durationSec ?? 0;
      const effectiveLyricsDuration =
        lyricsDuration ?? (parsedLyrics.length > 0 ? (parsedLyrics[parsedLyrics.length - 1]?.time ?? 0) : 0);
      const durationDiff = videoDurationSec - effectiveLyricsDuration;

      if (durationDiff > 0 && durationDiff < 4) {
        console.log('싱크 오류 가능성 있음, 추가 분석 진행');
      } else {
        console.debug(
          `영상 길이 (${videoDurationSec}s)와 가사 길이 (${effectiveLyricsDuration}s) 차이: ${durationDiff}s`,
        );
      }
      renderSongInfo(title, artist);

      // 5) 광고 재생 시 가사 UI 숨김, 광고 종료 후 다시 렌더링

      let attempt = 0;
      while (isAdPlaying() && attempt < 30) {
        console.log('[fetchAnalyzeAndRenderLyrics] 광고 중. 가사 렌더 대기...');
        await delay(500); // 최대 15초 대기
        attempt++;
      }
      if (attempt >= 30) {
        console.warn('[Lyrics] 광고 대기 초과, 렌더링 스킵');
        return null;
      }

      // 6) 광고 중이 아니면 영상 분석 및 가사 렌더링 진행
      await analyzeAudioAndRender(videoElem, meta, lyricsDuration, parsedLyrics);
      return true;
    } catch (error) {
      console.error('[fetchAnalyzeAndRenderLyrics] 에러:', error);
      return null;
    } finally {
      isCollecting = false;
    }
  }

  // 실제 영상 분석 + 가사 동기화 렌더링 분리 함수. 후에 meta와 lyricsDuration을 매개변수로 추가할 수 있음
  async function analyzeAudioAndRender(
    videoElem: HTMLMediaElement,
    _meta: { durationSec?: number },
    _lyricsDuration: number | undefined,
    parsedLyrics: Line[],
  ) {
    if (isAdPlaying()) {
      console.warn('[analyzeAudioAndRender] 광고 중 분석 스킵');
      return;
    }

    // 중복 audio source 연결 방지 및 안전한 초기화
    cleanupMediaElementSource(videoElem);

    latestLyrics = parsedLyrics;
    onLyricsUpdated(parsedLyrics);

    // 추가적인 싱크 조정 로직이나 렌더링 로직이 들어갈 수 있음
  }

  // 영상 감지 핸들러 (순수 로직)
  const handleVideoDetection = async () => {
    console.log('handleVideoDetection 실행');
    if (isDetecting) {
      console.log('[handleVideoDetection] 이미 실행되고 있음');
      return;
    }
    isDetecting = true;

    //const videoIdFromUrl = getCurrentVideoId();
    const videoElem = document.querySelector('video');
    if (!videoElem) {
      console.log('[handleVideoDetection] video element 미존재, 렌더링 생략');
      return;
    }

    let videoData;
    try {
      videoData = detectYouTubeVideo();

      if (!videoData || !videoData.videoId) {
        console.log('[handleVideoDetection] 비디오 감지 실패');
        return;
      }

      if (videoData.videoId === lastVideoId && isLyricsOverlayMounted()) {
        console.log('[handleVideoDetection] 이미 처리한 videoId, 오버레이도 실제로 화면에 있음 -> skip');
        return;
      }

      // 미니플레이어 전환 중엔 클린업 안 하도록 처리
      if (isMiniToFullTransitioning) {
        console.log('[handleVideoDetection] 미니 -> 일반 플레이어 전환 중, 클린업 생략');
        return;
      }
      // 이제 감지 성공했을 경우만 갱신
      lastVideoId = videoData.videoId;
      const collected = await collectMetadataAndLyrics(videoData.videoId, videoElem);

      if (!collected) {
        console.warn('[handleVideoDetection] 가사 수집 실패 또는 데이터 없음');
        return;
      }
    } catch (error) {
      console.error('[handleVideoDetection] 에러 발생:', error);
    } finally {
      isDetecting = false;

      if (videoData && videoData.videoId) {
        lastVideoId = videoData.videoId;
      }
    }
  };
  // --- wrapper ---
  const handleVideoDetectionGuarded = withContentEnabled(getContentEnabled, handleVideoDetection);
  const debouncedDetection = debounce(handleVideoDetectionGuarded, RETRY_DELAY);

  // --- 스토리지, UI, SPA 이벤트, visibility 이벤트 일괄 관리 ---
  // SPA URL 변화 처리 공통 함수, URL 변화의 감지와 상태 판단을 담당하는 상위 레벨 함수
  function handleSpaUrlChange(url: string) {
    if (!contentEnabled) return;
    const currentVideoId = getCurrentVideoId();
    const currentIsWatchPage = checkIsWatchPage(url);

    const videoIdChanged = currentVideoId !== lastVideoId;
    const urlChanged = hasUrlChanged(url, lastUrl);
    const watchPageChanged = currentIsWatchPage !== checkIsWatchPage(lastUrl);

    console.log(
      `[SPA] url: ${url} videoIdChanged: ${videoIdChanged} urlChanged: ${urlChanged} watchPageChanged: ${watchPageChanged}`,
    );

    if (isMiniToFullTransitioning) {
      console.log('[SPA] 미니-일반 전환 중 감지 호출 스킵');
      return;
    }
    // 영상 -> 영상, videoId가 있는 곳으로 url 변경된 상황
    if (videoIdChanged || (urlChanged && watchPageChanged)) {
      spaObserverShouldTriggerDetection = false;
      resetLyricsData();
      handleUrlChangeGuarded(url);
      setTimeout(() => {
        spaObserverShouldTriggerDetection = true;
      }, 5000);
    } else {
      console.log('[SPA] 영상 및 페이지 변동 없음, 감지 생략');
    }
  }

  // 재시도 함수: 현재 시도 횟수, 최대 시도 횟수, 인터벌(ms)
  function tryDetectionWithRetry(attempt: number, maxAttempts: number, interval: number) {
    if (attempt >= maxAttempts) {
      console.warn('[visibilitychange] 감지 재시도 최대횟수 도달, 종료');
      return;
    }

    if (isReadyForDetection()) {
      handleVideoDetectionGuarded();
    } else {
      // 준비 안 됐다면 interval ms 후 다시 시도
      setTimeout(() => {
        tryDetectionWithRetry(attempt + 1, maxAttempts, interval);
      }, interval);
    }
  }

  function isReadyForDetection() {
    const player = document.querySelector('video');
    const adPlaying = isAdPlaying();

    // readyState 2 이상 체크(HAVE_CURRENT_DATA), 광고 안 재생 중인지 명확히 체크
    const ready = player && player.readyState >= 2 && !adPlaying;

    console.log(
      `[isReadyForDetection] player: ${!!player}, readyState: ${player?.readyState}, adPlaying: ${adPlaying}, ready: ${ready}`,
    );
    return ready;
  }

  async function detectVideoWithRetry(maxRetries = 15, retryInterval = 2000) {
    if (isDetecting || isRetryingDetection) return;
    isRetryingDetection = true;

    try {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        if (!isReadyForDetection()) {
          await delay(retryInterval);
          continue;
        }
        const detected = await detectAndProcessVideo();
        if (detected) break;
        await delay(retryInterval);
      }
    } finally {
      isRetryingDetection = false;
    }
  }
  async function detectAndProcessVideo() {
    const videoId = getCurrentVideoId();
    if (!videoId) return false;

    if (videoId === lastVideoId) return true;

    // 영상 변경 대응 및 데이터 처리
    await handleVideoDetectionGuarded();

    return true;
  }

  // --- video DOM 등장 관찰용 MutationObserver 등록 함수 ---
  function setupVideoElementObserver() {
    const observer = new MutationObserver(() => {
      const videoElem = document.querySelector('video');
      if (videoElem) {
        handleVideoDetectionGuarded();

        observer.disconnect();
        detectionObserverManager.videoElementObserver = null;
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return observer;
  }

  // 미니 -> 기본 감지
  function setupMiniToBasicTransitionObserver() {
    const player = document.querySelector(YOUTUBE_MINI_PLAYER_CONTAINER_SELECTOR);
    if (!player) return;

    let lastIsMini = YOUTUBE_MINI_PLAYER_CLASSES.some((c) => player.classList.contains(c));
    const observer = new MutationObserver(() => {
      if (isFirstMutation) {
        isFirstMutation = false;
        lastIsMini = YOUTUBE_MINI_PLAYER_CLASSES.some((c) => player.classList.contains(c));
        return;
      }
      const isMini = YOUTUBE_MINI_PLAYER_CLASSES.some((c) => player.classList.contains(c));
      if (lastIsMini && !isMini) {
        console.log('[Transition] 미니 -> 기본 유지');
        renderLyricsOverlay(latestLyrics);
      }
      lastIsMini = isMini;
    });
    observer.observe(player, { attributes: true, attributeFilter: ['class'] });
    return observer;
  }
  // 기본 -> 미니 감지
  function setupBasicToMiniTransitionObserver() {
    const player = document.querySelector(YOUTUBE_MINI_PLAYER_CONTAINER_SELECTOR);
    if (!player) return null;

    let lastIsMini = YOUTUBE_MINI_PLAYER_CLASSES.some((c) => player.classList.contains(c));

    const observer = new MutationObserver(() => {
      const isMini = YOUTUBE_MINI_PLAYER_CLASSES.some((c) => player.classList.contains(c));

      if (!lastIsMini && isMini) {
        console.log('[Transition] 기본 → 미니 플레이어 전환 감지');
        // 미니플레이어 전환 시 UI 유지 또는 재렌더링 처리
        renderLyricsOverlay(latestLyrics); // 필요 시 상태 동기화 및 감지 조작 수행
      }

      lastIsMini = isMini;
    });

    observer.observe(player, { attributes: true, attributeFilter: ['class'] });

    return observer;
  }

  // 감지 활성화 및 옵저버 등록 전담 함수
  const enableDetection = async () => {
    console.log('[enableDetection] cleanupAllResources 실행');
    if (isDetectionActive) {
      console.log('[SKIP] 감지 시스템 이미 활성화됨');
      return;
    }
    cleanupAllResources();

    const debouncedSpaObserverCallback = debounce(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        if (spaObserverShouldTriggerDetection) {
          handleSpaUrlChange(currentUrl);
          console.log(`lastUrl: ${lastUrl}, currentUrl: ${currentUrl}`);
          lastUrl = currentUrl;
          console.log(`lastUrl: ${lastUrl}, currentUrl: ${currentUrl}`);
        } else {
          console.log('[SPA Observer] 감지 호출 스킵 (메시지 리스너 우선)');
        }
      }
    }, 200); // debounce delay can be tuned, example 200ms

    detectionObserverManager.spaObserver = setupSPAObserver(debouncedSpaObserverCallback);

    if (!detectionObserverManager.videoElementObserver) {
      detectionObserverManager.videoElementObserver = setupVideoElementObserver();
    }

    isDetectionActive = true;
  };
  // 감지 시스템 완전 비활성화
  const disableDetection = () => {
    console.log('[disableDetection] cleanupAllResources 실행');

    cleanupAllResources();

    if (detectionObserverManager.videoElementObserver) {
      detectionObserverManager.videoElementObserver.disconnect();
      detectionObserverManager.videoElementObserver = null;
    }

    if (!isDetectionActive) {
      console.log('[SKIP] 감지 시스템 이미 비활성화됨');
      return;
    }

    isDetectionActive = false;
    lastVideoId = null;

    console.log('[Detection] 감지 시스템 완전 비활성화');
  };

  // 에러 바운더리 리셋 핸들러
  const handleReset = () => {
    window.location.reload();
  };

  function setupUIResources() {
    if (!overlayManager.isInitialized('lyrics')) {
      console.log('[setupUIResources] 오버레이 초기화 진행');
      overlayManager.createOverlayRoot('lyrics');
      overlayManager.createOverlayRoot('songInfo');

      overlayManager.renderOverlay(
        'lyrics',
        <ErrorBoundary FallbackComponent={ErrorFallback} onReset={handleReset}>
          <I18nextProvider i18n={i18nInstance}>
            <App />
          </I18nextProvider>
        </ErrorBoundary>,
      );
    }
    // 다른 오버레이 타입들(예: songInfo)도 여기에 포함 가능
  }
  function startDetectionWorkflow() {
    console.log('[startDetectionWorkflow] 시작');
    initListenersAndState(); // Storage 초기값 및 이벤트 등록
    setupMiniToBasicTransitionObserver();
    setupBasicToMiniTransitionObserver();
    enableDetection(); // 감지 시스템 활성화 및 옵저버 등록
    detectVideoWithRetry();
  }

  // 앱 초기화. 맨 처음, 새로고침 할 경우.
  const initializeApp = async () => {
    console.log('content app initializeApp 시작');
    try {
      await initializeI18n();

      chrome.storage.sync.get([STORAGE_KEYS.CONTENT_ENABLED], (result) => {
        contentEnabled = result[STORAGE_KEYS.CONTENT_ENABLED] ?? false;
        if (!contentEnabled) {
          console.log('[Content] 콘텐츠 비활성 상태 - UI 렌더링 및 리스너 초기화 건너뜀');
          return;
        }
        setupUIResources();
        startDetectionWorkflow();
      });

      // 저장소 변경 감지 등록 - 활성화 상태 변하면 처리
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'sync' && STORAGE_KEYS.CONTENT_ENABLED in changes) {
          const newValue = changes[STORAGE_KEYS.CONTENT_ENABLED]?.newValue;
          console.log(`[storage.onChanged] contentEnabled 변경 감지: ${newValue}`);
          contentEnabled = newValue;
          if (contentEnabled) {
            console.log('[storage.onChanged] 콘텐츠 활성화 - setupUIResources/startDetectionWorkflow 호출');
            setupUIResources();
            startDetectionWorkflow();
          } else {
            console.log('[storage.onChanged] 콘텐츠 비활성화 - 감지 시스템 비활성화 및 정리');
            disableDetection();
            cleanupAllResources();
          }
        }
      });
    } catch (error) {
      console.log(error);
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

## File: lib/types/react-scroll-picker.d.ts
```typescript
declare module 'react-scroll-picker';
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

## File: lib/utils/common/concurrencyLimiter.ts
```typescript
import pLimit from 'p-limit';

export function createConcurrencyLimiter(concurrency: number) {
  const limit = pLimit(concurrency);

  return async function limitedConcurrency<T, R>(items: T[], fn: (item: T) => Promise<R>): Promise<R[]> {
    const tasks = items.map((item) => limit(() => fn(item)));
    return Promise.all(tasks);
  };
}
```

## File: lib/utils/common/limitedFetchLyrics.ts
```typescript
// limitedFetchLyrics.ts (또는 utils/limitedFetchLyrics.ts)
import { createConcurrencyLimiter } from './concurrencyLimiter';

export const limitedFetchLyrics = createConcurrencyLimiter(5);
```

## File: lib/utils/common/requestLimiter.ts
```typescript
// src/lib/utils/common/requestLimiter.ts
type PendingRequest<T = unknown> = {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason: unknown) => void;
  fn: () => Promise<T>;
};

export class RequestLimiter {
  private maxConcurrent: number;
  private runningCount: number;
  private queue: PendingRequest[];

  constructor(maxConcurrent = 5) {
    this.maxConcurrent = maxConcurrent;
    this.runningCount = 0;
    this.queue = [];
  }

  public async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      // 타입 단언으로 queue에 넣을 때 타입 불일치 해소
      const request = { resolve, reject, fn } as PendingRequest<unknown>;
      this.queue.push(request);
      this.runNext();
    });
  }

  private runNext() {
    if (this.runningCount >= this.maxConcurrent) return;
    const request = this.queue.shift();
    if (!request) return;

    this.runningCount++;
    request
      .fn()
      .then((result) => {
        request.resolve(result);
      })
      .catch((err) => {
        request.reject(err);
      })
      .finally(() => {
        this.runningCount--;
        this.runNext();
      });
  }
}

// 싱글톤 인스턴스 생성 예시
export const defaultRequestLimiter = new RequestLimiter(5);
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

## File: lib/utils/common/urlUtils.ts
```typescript
import { YOUTUBE_WATCH_PATH } from '@constants/youtubeSelectors';

/**
 * URL이 유튜브 영상 페이지인지 판단
 * 보통 '/watch' 경로 포함 여부로 판단
 * @param url - 검사할 URL 문자열
 * @returns boolean 영상 페이지 여부
 */
export function isWatchPage(url: string): boolean {
  return url.includes(YOUTUBE_WATCH_PATH);
}
```

## File: lib/utils/dom/domUtils.ts
```typescript
// src/lib/utils/domUtils.ts
import { YOUTUBE_AD_SELECTOR, YOUTUBE_PLAYER_SELECTOR } from '@constants/youtubeSelectors';

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
  const adElement = document.querySelector(YOUTUBE_AD_SELECTOR);

  return player != null && !!adElement;
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

## File: lib/utils/infra/overlayManager.ts
```typescript
// src/lib/utils/infra/overlayManager.ts
import { createRoot, Root } from 'react-dom/client';
import { injectLyricsOverlayRoot } from '@content/components/lyrics/infra/LyricsOverlayRoot';
import { ReactNode } from 'react';

/**
 * OverlayManager는 가사 오버레이, 노래 정보 오버레이 등
 * 여러 React Root 및 관련 DOM 컨테이너를 중앙에서 관리하는 싱글톤 클래스입니다.
 * 내부 DOM 엘리먼트 및 Root 중복생성 방지, 상태 확인, 렌더, 클린업 기능을 제공합니다.
 *
 * 낮은 수준의 DOM 생성/조작은 필요하면 src/lib/utils/dom 등으로 위임할 수 있습니다.
 */
export type OverlayType = 'lyrics' | 'songInfo' | string;

export interface OverlayInstance {
  root: Root;
  container: HTMLElement;
}

class OverlayManager {
  private overlays: Map<OverlayType, OverlayInstance> = new Map();
  private isInitializedFlags: Map<OverlayType, boolean> = new Map();

  // 내부: 타입별 컨테이너 생성 - 필요시 외부 API 호출
  private createContainer(type: OverlayType): HTMLElement {
    let container: HTMLElement | null = null;

    if (type === 'lyrics') {
      container = injectLyricsOverlayRoot();
      if (!container) {
        // 재시도 또는 기본 생성 시도 로직 추가 가능
        container = document.createElement('div');
        container.id = 'lyrics-cc-overlay';
        document.body.appendChild(container);
        console.warn('[OverlayManager] fallback: 기본 overlay container 생성');
      }
      console.log('[OverlayManager] lyrics container connected to DOM?', document.body.contains(container));
    } else if (type === 'songInfo') {
      container = document.getElementById('song-info-overlay-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'song-info-overlay-container';
        container.style.width = '100%';
        container.style.height = '100%';

        const lyricsOverlayRoot = document.getElementById('lyrics-cc-overlay');
        if (!lyricsOverlayRoot) {
          throw new Error('[OverlayManager] Lyrics overlay root not found');
        }
        lyricsOverlayRoot.appendChild(container);
      }
    } else {
      container = document.getElementById(`${type}-overlay-container`);
      if (!container) {
        container = document.createElement('div');
        container.id = `${type}-overlay-container`;

        document.body.appendChild(container);
        console.log(`[OverlayManager] created and appended container for type ${type}`);
      }
      console.log(`[OverlayManager] container connected to DOM?`, document.body.contains(container));
    }

    // 가시성 보장
    container.style.visibility = 'visible';
    console.log(`[OverlayManager] returning container for type ${type}:`, container);
    return container;
  }

  /**
   * Overlay React Root 생성 및 초기 마운트
   * 중복 생성 방지
   */
  public createOverlayRoot(type: OverlayType): Root {
    if (this.overlays.has(type)) {
      return this.overlays.get(type)!.root;
    }

    const container = this.createContainer(type);
    const root = createRoot(container);

    this.overlays.set(type, { root, container });
    this.isInitializedFlags.set(type, true);

    return root;
  }

  /** 특정 타입 Overlay React Root가 마운트되었는지 확인 */
  public isOverlayMounted(type: OverlayType): boolean {
    if (!this.overlays.has(type)) return false;
    const instance = this.overlays.get(type)!;
    return document.body.contains(instance.container);
  }

  /** 특정 타입 Overlay React Root에 렌더링 수행 */
  public renderOverlay(type: OverlayType, element: ReactNode): void {
    if (!this.overlays.has(type)) {
      this.createOverlayRoot(type);
    }
    this.overlays.get(type)?.root.render(element);
  }

  /** 특정 타입 Overlay 클린업 (React Root unmount + DOM 제거) */
  public cleanupOverlay(type: OverlayType): void {
    if (!this.overlays.has(type)) return;
    const { root, container } = this.overlays.get(type)!;
    try {
      root.unmount();
    } catch (e) {
      console.warn(`[OverlayManager] unmount error for ${type}:`, e);
    }
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    this.overlays.delete(type);
    this.isInitializedFlags.delete(type);
  }

  /** 모든 관리 중인 오버레이 일괄 클린업 */
  public cleanupAll(): void {
    this.overlays.forEach((_instance, type) => {
      this.cleanupOverlay(type);
    });
  }

  /** 특정 타입 Overlay container 반환(없으면 null) */
  public getContainer(type: OverlayType): HTMLElement | null {
    return this.overlays.get(type)?.container || null;
  }

  /** 오버레이 타입별 초기화 상태 반환 */
  public isInitialized(type: OverlayType): boolean {
    return this.isInitializedFlags.get(type) ?? false;
  }

  /** 특정 타입 Overlay container visibility 조절 */
  public setVisibility(type: OverlayType, visible: boolean): void {
    const container = this.getContainer(type);
    if (!container) return;
    container.style.display = visible ? '' : 'none';
  }

  // 싱글톤 인스턴스
  private static instance: OverlayManager;

  public static getInstance(): OverlayManager {
    if (!OverlayManager.instance) {
      OverlayManager.instance = new OverlayManager();
    }
    return OverlayManager.instance;
  }
}

// 싱글톤 객체 export
export const overlayManager = OverlayManager.getInstance();
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
  // 추가: elements 수를 반환하는 메서드
  public getRegisteredElementCount(): number {
    return this.elements.length;
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

const isKorean = (c: string) => /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7A3]/.test(c); // 한글(초중종성, 호환, 완성)
const isJapaneseKana = (c: string) => /[\u3040-\u309F\u30A0-\u30FF]/.test(c); // 히라가나, 가타카나
const isKanji = (c: string) => /[\u4E00-\u9FFF]/.test(c);

function detectLanguage(char: string): string {
  if (isKorean(char)) return 'ko';
  if (isJapaneseKana(char)) return 'ja';
  if (isKanji(char)) return 'kanji';
  // 여기에 다른 문자 감지 함수 추가 가능
  return 'other';
}

/**
 * 텍스트를 언어별로 스팬으로 분리(일본어와 중국어는 한자 구분을 위해 별도 처리)
 * @param text 분리 대상 문자열
 */ export function splitIntoLangGroups(text: string): ScriptSpan[] {
  if (!text) return [];

  const spans: ScriptSpan[] = [];
  let buffer = '';
  let currentLang: string | null = null;

  // 한자 포함 스팬에선 일본어와 중국어 구분을 나중에 할 예정
  // 스팬 내에서 한자 포함 여부 검사용
  let hasJapaneseKanaInSpan = false;

  for (const char of text) {
    const lang = detectLanguage(char);

    if (currentLang === null) {
      // 새 스팬 시작
      buffer = char;
      currentLang = lang;

      hasJapaneseKanaInSpan = lang === 'ja';
    } else if (lang === currentLang) {
      // 같은 언어 스팬 계속 추가
      buffer += char;

      if (lang === 'ja') hasJapaneseKanaInSpan = true;
    } else {
      // 스팬 종료 전 일본어/중국어 구간 분리 처리
      if (currentLang === 'ja' || currentLang === 'kanji') {
        // 한자 포함 여부에 따라 스팬 언어 결정
        const effectiveLang = hasJapaneseKanaInSpan ? 'ja' : 'zh'; // 'zh'는 한자만 있을 때
        spans.push({ lang: effectiveLang, text: buffer });
      } else {
        spans.push({ lang: currentLang, text: buffer });
      }

      // 새 스팬 초기화
      buffer = char;
      currentLang = lang;
      hasJapaneseKanaInSpan = lang === 'ja';
    }
  }

  // 마지막 스팬 처리
  if (buffer) {
    if (currentLang === 'ja' || currentLang === 'kanji') {
      const effectiveLang = hasJapaneseKanaInSpan ? 'ja' : 'zh';
      spans.push({ lang: effectiveLang, text: buffer });
    } else {
      spans.push({ lang: currentLang, text: buffer });
    }
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
      mode: 'spaced',
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

## File: lib/utils/platform/navigation.ts
```typescript
/**
 * SPA 네비 및 URL 변경 감지용
 * @param currentUrl 현재 URL
 * @param lastUrl 이전 URL
 * @returns boolean URL 변경 여부
 */
export function hasUrlChanged(currentUrl: string, lastUrl: string): boolean {
  console.log(`[hasUrlChanged] current Url: ${currentUrl}, last Url: ${lastUrl}`);
  return currentUrl !== lastUrl;
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
import { YOUTUBE_MINI_PLAYER_CLASSES, YOUTUBE_MINI_PLAYER_CONTAINER_SELECTOR } from '@constants/youtubeSelectors';

export function checkIfMiniPlayerActive(): boolean {
  // 예시 1: 플레이어 루트 엘리먼트 확인
  const player = document.querySelector(YOUTUBE_MINI_PLAYER_CONTAINER_SELECTOR) as HTMLElement | null;
  if (!player) return false;

  // 예시 2: 미니 플레이어 관련 클래스 체크
  // YOUTUBE_MINI_PLAYER_CLASSES에 포함된 클래스를 하나라도 가지고 있으면 true 반환
  if (YOUTUBE_MINI_PLAYER_CLASSES.some((cls) => player.classList.contains(cls))) {
    if (
      player.offsetParent !== null &&
      player.getBoundingClientRect().width > 0 &&
      player.getBoundingClientRect().height > 0
    ) {
      return true;
    }
  }
  // 미니플레이어 UI 엘리먼트 기반 추가 탐지 (필요 시 활성화)
  const miniUI = document.querySelector('.ytp-miniplayer-ui') as HTMLElement | null;
  if (miniUI && miniUI.offsetParent !== null) {
    return true;
  }

  return false;
}
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

/**
 * URL에서 videoId 추출
 * @param url - 검사할 URL 문자열
 * @returns videoId 문자열 또는 null (추출 실패 시)
 */
export function extractVideoIdFromUrl(url: string): string | null {
  const match = url.match(/[?&]v=([^&]+)/);
  return match && match[1] !== undefined ? match[1] : null;
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

// 유튜브 영상 페이지 진입(또는 변화) 시점을 감지
export function setupSPAObserver(callback: () => void): MutationObserver {
  const targetNode = document.querySelector('#page-manager') || document.body;

  const config: MutationObserverInit = {
    childList: true,
    subtree: true,
    attributes: false,
  };

  const observer = new MutationObserver(() => {
    callback();
  });

  observer.observe(targetNode, config);

  return observer;
}
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
  "extOpenSourceList": "OpenSourceList",
  "extOpenSourceDetail": "OpenSourceDetail",
  "extContact": "Contact",
  "extContactUs": "Contact Us",
  "extPersonalSettings": "Personal Settings",
  "extGeneralSettings": "General Settings",
  "extLyricsMode": "Lyrics Mode",
  "extCurrentLyrics": "Current Lyrics",
  "extFullLyrics": "Full Lyrics",
  "extSingleLyrics": "Single Lyrics",
  "extSongs": "Title",
  "extArtist": "Artist",
  "extLyricist": "Lyricist",
  "extComposer": "Composer",
  "extLyricsSourceLabel": "Lyrics Source",
  "extUnknownSourceText": "Unknown Information",
  "extSongCopyrightWarning": "Displayed lyrics may be immediately removed at the request of the copyright owner. All rights belong to the original creators (lyricist, composer) or relevant copyright agencies."
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
  "extOpenSourceList": "OpenSourceList",
  "extOpenSourceDetail": "OpenSourceDetail",
  "extContact": "문의",
  "extContactUs": "문의하기",
  "extPersonalSettings": "개인 설정",
  "extGeneralSettings": "일반 설정",
  "extLyricsMode": "가사 모드",
  "extCurrentLyrics": "현재 가사",
  "extFullLyrics": "전체 가사",
  "extSingleLyrics": "한 줄 가사",
  "extSongs": "노래",
  "extArtist": "가수",
  "extLyricist": "작곡가",
  "extComposer": "작사가",
  "extLyricsSourceLabel": "가사 출처",
  "extUnknownSourceText": "정보 없음",
  "extSongCopyrightWarning": "제공 가사는 저작권자의 요청 시 즉시 삭제됩니다. 저작권은 해당 권리자(작사가/작곡가/등록협회 등)에 있습니다."
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
import { useEffect, useState } from 'react';
import { useLangLoader } from '@hooks/useLangLoader';
import { useTranslation } from 'react-i18next';
// import { useChromeStorage } from '@hooks/useChromeStorage';
import { MESSAGE_TYPES } from '@constants/messageTypes';
import { ErrorFallback } from '@components/common/ErrorFallback';
import { LoadingOverlay } from '@components/common/LoadingOverlay';
import { STORAGE_KEYS } from '@constants/storageKeys';
import { PopupSettingsPanel } from './components/settings/PopupSettingsPanel';
import './popup.css';
import { Timer } from './components/timer/Timer';
import { History } from './components/history/History';
import { IoSettingsOutline } from 'react-icons/io5';
import { useChromeStorage } from '@hooks/useChromeStorage';

interface LanguageChangeMessage {
  type: typeof MESSAGE_TYPES.LANGUAGE_CHANGED;
  language: string;
}
export function App() {
  const { t, i18n } = useTranslation();
  const { phase } = useLangLoader();

  const [, setEnabled] = useChromeStorage(STORAGE_KEYS.CONTENT_ENABLED, false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'timer' | 'history'>('timer');

  // Timer의 재생 상태를 App에서 관리
  const [, setTimerPlaying] = useState(false);

  // Timer 재생 상태 변경 시 호출되는 콜백
  const handleTimerPlayChange = (playing: boolean) => {
    setTimerPlaying(playing);
    setEnabled(playing);
    if (!playing) {
      chrome.storage.sync.set({ [STORAGE_KEYS.CONTENT_ENABLED]: false }, () => {
        console.log('contentEnabled가 false로 변경됨');
      });
    }
  };

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
  // const handleToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const newValue = e.target.checked;
  //   // setEnabled(newValue);

  //   // 현재 활성 탭에 메시지 전송
  //   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  //     if (tabs[0]?.id)
  //       chrome.tabs.sendMessage(tabs[0].id, {
  //         type: MESSAGE_TYPES.TOGGLE_CONTENT,
  //         enabled: newValue,
  //       });
  //   });
  // };

  if (showSettings) {
    return <PopupSettingsPanel onBack={() => setShowSettings(false)} />;
  }

  return (
    <div>
      <div className="popup-header">
        <h2>{t('extName')}</h2>
        <button id="go-to-options" className="icon-button" onClick={() => setShowSettings(true)}>
          <IoSettingsOutline size={16} />
        </button>
      </div>
      <div className="popup-wrapper">
        <div className="popup-tabs">
          <div className="slider" style={{ transform: activeTab === 'timer' ? 'translateX(0)' : 'translateX(100%)' }} />
          <button
            className={`tab ${activeTab === 'timer' ? 'active' : ''}`}
            onClick={() => setActiveTab('timer')}
            type="button"
          >
            타이머 설정
          </button>
          <button
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
            type="button"
          >
            히스토리
          </button>
        </div>
        <div>{activeTab === 'timer' ? <Timer onPlayStateChange={handleTimerPlayChange} /> : <History />}</div>
      </div>
    </div>
  );
}
```

## File: popup/components/history/History.tsx
```typescript
export function History() {
  return (
    <div className="history-panel">
      {/* 히스토리 UI 내용 작성 */}
      <p>히스토리 탭 컨텐츠입니다.</p>
    </div>
  );
}
```

## File: popup/components/settings/Contact.tsx
```typescript
import { useTranslation } from 'react-i18next';
import styles from './styles.module.css';

const GOOGLE_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSfVhvBVQBG5kfS3npBTMBlTfR1t5uYTg73iRJJG612MmdNhKw/viewform?usp=header';

export function Contact() {
  const { t } = useTranslation();
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
        {t('extContactUs')}
      </button>
    </div>
  );
}
```

## File: popup/components/settings/FAQ.module.css
```css
.faqContent {
  margin: 16px 0;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow-y: scroll;
  padding: 0;
  box-sizing: border-box;
}

.faqItem {
  border-bottom: 1px solid #eee;
}

.faqQuestion {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 14px;
  font-weight: 500;
  font-size: 15px;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.faqQuestion:focus {
  outline: 2px solid #4a90e2;
}

.faqIcon {
  font-size: 18px;
  font-weight: bold;
}

.faqAnswer {
  padding: 15px;
  font-size: 13px;
  color: #555;
  animation: fadeIn 0.2s;
  line-height: 1.8;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 500px;
  }
}
```

## File: popup/components/settings/FAQ.tsx
```typescript
import { useState } from 'react';
import faqStyles from './FAQ.module.css';
import styles from './styles.module.css';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };
  return (
    <div className={styles.menuSection}>
      <h3> {t('extFAQ')}</h3>
      <div className={faqStyles.faqContent}>
        {faqList.map((item, idx) => (
          <div key={idx} className={faqStyles.faqItem}>
            <button
              className={faqStyles.faqQuestion}
              onClick={() => handleToggle(idx)}
              aria-expanded={openIndex === idx}
              aria-controls={`faq-answer-${idx}`}
            >
              {item.question}
              <span className={faqStyles.faqIcon}>{openIndex === idx ? '−' : '+'}</span>
            </button>
            {openIndex === idx && (
              <div id={`faq-answer-${idx}`} className={faqStyles.faqAnswer}>
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## File: popup/components/settings/LanguageSettings.tsx
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
import styles from './styles.module.css';

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
    <div className={styles.menuSection}>
      <h2>{t('extLanguage')}</h2>
      <p>사용자 인터페이스가 해당 언어로 제공합니다.</p>
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

## File: popup/components/settings/License/ExtensionLicense.tsx
```typescript
import React from 'react';
import styles from './styles.module.css';

export const ExtensionLicense: React.FC = () => {
  return (
    <div className={styles.openSourceList}>
      <h2>Extension licenses</h2>
      <p></p>
    </div>
  );
};
```

## File: popup/components/settings/License/LicenseInfo.tsx
```typescript
import React from 'react';
import styles from '@popup/components/settings/styles.module.css';
import { ComponentKey } from '../PopupSettingsPanel';

// LicenseInfo.tsx props
interface LicenseInfoProps {
  onNavigate: (key: ComponentKey) => void;
}

export const LicenseInfo: React.FC<LicenseInfoProps> = ({ onNavigate }) => {
  const handleOpenSourceList = () => onNavigate('openSourceList');
  const handleShowExtensionLicense = () => onNavigate('extensionLicense');
  return (
    <div className={styles.menuSection}>
      <div className={styles.sectionLabel}>라이선스 정보</div>
      <div>
        <button onClick={handleShowExtensionLicense}>크롬 확장 라이선스</button>
        <button onClick={handleOpenSourceList}>오픈소스 라이선스</button>
      </div>
    </div>
  );
};
```

## File: popup/components/settings/License/OpenSourceLicenseList.tsx
```typescript
import React from 'react';
import styles from '@popup/components/settings/styles.module.css';
import licenseStyles from './styles.module.css';

const OPEN_SOURCE_LIBS = [
  {
    name: 'get-artist-title',
    author: 'James Kyburz',
    license: 'MIT',
    link: 'https://github.com/goto-bus-stop/get-artist-title/blob/HEAD/LICENSE',
  },
  {
    name: '@daun_jung/korean-romanizer',
    author: 'Daun Jung',
    license: 'MIT',
    link: 'https://github.com/daunJung-dev/korean-romanizer/blob/master/LICENSE',
  },
  {
    name: 'Kuroshiro',
    author: 'Hexen Qi',
    license: 'MIT',
    link: 'https://github.com/hexenq/kuroshiro/blob/master/LICENSE',
  },
  {
    name: 'kuroshiro-analyzer-kuromoji',
    author: 'Hexen Qi',
    license: 'MIT',
    link: 'https://github.com/hexenq/kuroshiro-analyzer-kuromoji/blob/master/LICENSE',
  },
  {
    name: 'pinyin',
    author: 'hotoo',
    license: 'MIT',
    link: 'https://hotoo.mit-license.org/',
  },
  {
    name: 'p-limit',
    author: 'sindresorhus',
    license: 'MIT',
    link: 'https://github.com/sindresorhus/p-limit/blob/main/license',
  },
  {
    name: '@emotion/react',
    author: 'EMOTION TEAM',
    license: 'MIT',
    link: 'https://github.com/emotion-js/emotion/blob/main/LICENSE',
  },
  {
    name: '@emotion/styled',
    author: 'EMOTION TEAM',
    license: 'MIT',
    link: 'https://github.com/emotion-js/emotion/blob/main/LICENSE',
  },
  {
    name: '@mui/material',
    author: 'MUI TEAM',
    license: 'MIT',
    link: 'https://github.com/mui/material-ui/blob/master/LICENSE',
  },
  {
    name: 'react-icons',
    author: 'kamijin_fanta',
    license: 'MIT',
    link: 'https://github.com/react-icons/react-icons/blob/master/LICENSE',
  },
  {
    name: 'react-bits',
    author: 'David Haz',
    license: 'MIT + Commons Clause',
    link: 'https://github.com/davidhdev/react-bits/blob/main/LICENSE.md)',
  },
  {
    name: 'motion',
    author: 'Motion B.V',
    license: 'MIT',
    link: 'https://github.com/motiondivision/motion/blob/main/LICENSE.md',
  },
  {
    name: 'matter-js',
    author: 'Liam Brummitt and contributors',
    license: 'MIT',
    link: 'https://github.com/liabru/matter-js/blob/master/LICENSE',
  },
  {
    name: 'axios',
    author: 'Matt Zabriskie & Collaborators',
    license: 'MIT',
    link: 'https://github.com/axios/axios/blob/v1.x/LICENSE',
  },
  // 필요시 README.md와 package.json 기반 라이브러리 추가
];

export const OpenSourceLicenseList: React.FC = () => {
  return (
    <div className={styles.menuSection}>
      <h4>Open Source Libraries</h4>
      <ul className={licenseStyles.libraryList}>
        {OPEN_SOURCE_LIBS.map((lib, idx) => (
          <li key={idx} className={licenseStyles.libraryItem}>
            <div>
              <strong>{lib.name}</strong> <span style={{ color: '#888' }}>({lib.license} License)</span>
            </div>
            <div style={{ fontSize: '0.93em' }}>
              Author: {lib.author} <br />
              <a href={lib.link} target="_blank" rel="noopener noreferrer">
                License / Project Link
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

## File: popup/components/settings/License/styles.module.css
```css
.libraryList {
  max-height: 350px;
  overflow-y: scroll;
  box-sizing: border-box;
  padding: 0 16px;
  line-height: 1.8;
}
.libraryItem{
  padding: 5px 0;
}
```

## File: popup/components/settings/LyricsSettings.tsx
```typescript
import React, { useState } from 'react';
import { useChromeStorage } from '@hooks/useChromeStorage';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.css';
import { SplitText } from '@components/react-bits/SplitText';
import { BlurText } from '@components/react-bits/BlurText';
import { TextType } from '@components/react-bits/TextType';
import { FuzzyText } from '@components/react-bits/FuzzyText';
import { GlitchText } from '@components/react-bits/GlitchText';

export const LyricsSettings: React.FC = () => {
  const { t } = useTranslation();

  // 스토리지에 저장된 설정 불러오기, 기본값 지정
  const [showRealtimeLyrics, setShowRealtimeLyrics] = useChromeStorage('realtimeLyrics', true);
  const [showPronunciationLyrics, setShowPronunciationLyrics] = useChromeStorage('announceLyrics', true);
  const [lyricsFontColorCurrent, setLyricsFontColorCurrent] = useChromeStorage('lyricsFontColorCurrent', '#FFFFFF');
  const [lyricsFontColorPronunciation, setLyricsFontColorPronunciation] = useChromeStorage(
    'lyricsFontColorPronunciation',
    '#AAAAAA',
  );
  const [lyricsMode, setLyricsMode] = useChromeStorage('lyricsMode', 'sync'); // 'sync' | 'full' | 'single'

  const [fontEffect, setFontEffect] = useState<string>(''); // 효과 타입 저장

  // 폰트 모드 옵션
  const modeOptions = [
    { label: t('extCurrentLyrics'), value: 'sync' },
    { label: t('extFullLyrics'), value: 'full' },
    { label: t('extSingleLyrics'), value: 'single' },
  ];
  const fontEffectOptions = [
    { label: 'SplitText', value: 'splitType' },
    { label: 'BlurText', value: 'blurType' },
    { label: 'TextType', value: 'textType' },
    { label: 'FuzzyText', value: 'fuzzyType' },
    { label: 'GlitchText', value: 'glitchType' },
  ];

  const previewLyrics: { main: string; sub: string }[] =
    lyricsMode === 'single'
      ? [{ main: 'Set ’em on fire', sub: 'Set ’em on fire' }]
      : lyricsMode === 'sync'
        ? [
            { main: '스스로 밝혀', sub: 'Seuseuro Balkyeo' },
            { main: 'Set ’em on fire', sub: 'Set ’em on fire' },
          ]
        : [
            { main: `And I don't really care if you`, sub: `앤드 아이 돈 리얼리 케어 이프 유` },
            { main: `like me, like me`, sub: `라이크 미, 라이크 미` },
            { main: `I don't really wanna`, sub: `아이 돈 리얼리 워너` },
            { main: `know if you like me`, sub: `노우 이프 유 라이크 미` },
          ];

  // 자막 효과별 메인 텍스트 렌더링 처리 (확장용)
  const renderMainText = (text: string, idx: number) => {
    const baseClass = styles.lyricsText;

    switch (fontEffect) {
      case 'splitType':
        return <SplitText key={idx} text={text} color={lyricsFontColorCurrent} className={baseClass} />;
      case 'blurType':
        return <BlurText key={idx} text={text} color={lyricsFontColorCurrent} className={baseClass} />;
      case 'textType':
        return <TextType key={idx} text={text} textColors={[lyricsFontColorCurrent]} className={baseClass} />;
      case 'fuzzyType':
        return (
          <FuzzyText key={idx} fontSize={12} color={lyricsFontColorCurrent} className={baseClass}>
            {text}
          </FuzzyText>
        );
      case 'glitchType':
        return (
          <GlitchText key={idx} className={baseClass}>
            {text}
          </GlitchText>
        );
      default:
        return (
          <div key={idx} style={{ color: lyricsFontColorCurrent, fontWeight: 'bold', margin: 0 }}>
            {text}
          </div>
        );
    }
  };
  // 컴포넌트 초기 마운트 시 chrome.storage에서 상태 불러오기
  React.useEffect(() => {
    chrome.storage.sync.get(
      [
        'realtimeLyrics',
        'announceLyrics',
        'lyricsFontColorCurrent',
        'lyricsFontColorPronunciation',
        'lyricsMode',
        'lyricsFontEffect',
      ],
      (items) => {
        if (typeof items.realtimeLyrics === 'boolean') setShowRealtimeLyrics(items.realtimeLyrics);
        if (typeof items.announceLyrics === 'boolean') setShowPronunciationLyrics(items.announceLyrics);
        if (typeof items.lyricsFontColorCurrent === 'string') setLyricsFontColorCurrent(items.lyricsFontColorCurrent);
        if (typeof items.lyricsFontColorPronunciation === 'string')
          setLyricsFontColorPronunciation(items.lyricsFontColorPronunciation);
        if (typeof items.lyricsMode === 'string') setLyricsMode(items.lyricsMode);
        if (typeof items.lyricsFontEffect === 'string') setFontEffect(items.lyricsFontEffect);
      },
    );
  }, []);
  // 적용 버튼 클릭 시 현재 상태 저장
  const handleApply = () => {
    chrome.storage.sync.set(
      {
        realtimeLyrics: showRealtimeLyrics,
        announceLyrics: showPronunciationLyrics,
        lyricsFontColorCurrent,
        lyricsFontColorPronunciation,
        lyricsMode,
        lyricsFontEffect: fontEffect,
      },
      () => {
        // 저장 완료 후 알림 혹은 상태 표시 추가 가능
        console.log('Lyrics settings saved');
      },
    );
  };

  return (
    <div className={styles.menuSection}>
      <div className={styles.previewBox}>
        {previewLyrics.map((line, idx) => (
          <div
            key={idx}
            className={`${styles.previewLine} ${
              lyricsMode === 'single' ? styles.singleMode : lyricsMode === 'sync' ? styles.syncMode : styles.fullMode
            }`}
          >
            {showRealtimeLyrics && renderMainText(line.main, idx)}
            {showPronunciationLyrics && <div style={{ color: lyricsFontColorPronunciation }}>{line.sub}</div>}
          </div>
        ))}
      </div>
      <div className={styles.settingsScrollable}>
        <div className={styles.checkboxRow}>
          <label className={styles.settingItem}>
            <input
              type="checkbox"
              checked={showRealtimeLyrics}
              onChange={(e) => setShowRealtimeLyrics(e.target.checked)}
            />
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
        </div>
        <div className={styles.settingMenu}>
          <label htmlFor="lyricsModeSelect" className={styles.settingLabel}>
            {t('extLyricsMode')}
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

        <div className={styles.settingMenu}>
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

        <div className={styles.settingMenu}>
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
        <div className={styles.settingMenu}>
          <label htmlFor="fontEffectSelect" className={styles.settingLabel}>
            자막 효과
          </label>
          <select
            id="fontEffectSelect"
            className={styles.settingSelect}
            value={fontEffect}
            onChange={(e) => setFontEffect(e.target.value)}
          >
            <option value="">기본 (효과 없음)</option>
            {fontEffectOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <button className={styles.applyButton} onClick={handleApply}>
          {t('apply')}
        </button>
      </div>
    </div>
  );
};
```

## File: popup/components/settings/PopupSettingsPanel.tsx
```typescript
import React, { useState } from 'react';
import { BackButton } from '@components/common/BackButton';
import styles from './styles.module.css';
import { FAQ } from './FAQ';
import { useTranslation } from 'react-i18next';
import { Contact } from './Contact';
import { LanguageSettings } from './LanguageSettings';
import { LyricsSettings } from './LyricsSettings';
import { LicenseInfo } from './License/LicenseInfo';
import { OpenSourceLicenseList } from './License/OpenSourceLicenseList';
import { ExtensionLicense } from './License/ExtensionLicense';

export type ComponentKey =
  | 'main'
  | 'faq'
  | 'contact'
  | 'license'
  | 'openSourceList'
  | 'extensionLicense'
  | 'language'
  | 'lyricsSettings';

interface PopupSettingsPanelProps {
  onBack: () => void;
}
interface MainMenuProps {
  onNavigate: (key: ComponentKey) => void;
}

export const PopupSettingsPanel: React.FC<PopupSettingsPanelProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [history, setHistory] = useState<ComponentKey[]>(['main']);
  const activeComponent = history[history.length - 1] as ComponentKey;

  const handleNavigate = (key: ComponentKey) => {
    setHistory((prev) => [...prev, key]);
  };

  const titles: Record<ComponentKey, string> = {
    main: t('extSetting'),
    faq: t('extFAQ'),
    contact: t('extContact'),
    license: t('extLicense'),
    language: t('extLanguage'),
    lyricsSettings: t('extLyrics'),
    openSourceList: t('extOpenSourceList'),
    extensionLicense: t(''),
  };

  let ContentComponent;
  if (activeComponent === 'faq') ContentComponent = FAQ;
  else if (activeComponent === 'contact') ContentComponent = Contact;
  else if (activeComponent === 'language') ContentComponent = LanguageSettings;
  else if (activeComponent === 'lyricsSettings') ContentComponent = LyricsSettings;
  else if (activeComponent === 'license') ContentComponent = LicenseInfo;
  else if (activeComponent === 'openSourceList') ContentComponent = OpenSourceLicenseList;
  else if (activeComponent === 'extensionLicense') ContentComponent = ExtensionLicense;
  else ContentComponent = MainMenu; // 초기 메뉴

  // BackButton 클릭 핸들러 분리
  const handleBackButtonClick = () => {
    if (history.length <= 1) {
      onBack(); // 최상위 화면에서 상위 콜백 호출
    } else {
      setHistory((prev) => prev.slice(0, prev.length - 1));
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
      <ContentComponent onNavigate={handleNavigate} />
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
        <button className={styles.settingsButton} onClick={() => onNavigate('license')}>
          {t('extLicense')}
        </button>
      </div>
    </div>
  );
}
```

## File: popup/components/settings/styles.module.css
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
.checkboxRow {
  display: flex;
  gap: 24px; /* 라벨 간 간격 조정 */
  align-items: center; /* 세로 중앙 정렬 */
  padding: 10px 0;
}

.settingItem {
  display: flex;
  align-items: center;
  gap: 8px; /* 체크박스와 라벨 사이 간격 */
}

.menuSection {
  padding: 10px 15px;
  height: 100vh; /* 또는 적합한 고정 높이 */
  display: flex;
  flex-direction: column;
}
.menuSection h4 {
  margin: 10px 0;
}
.settingMenu {
  padding: 10px 0;
  flex-wrap: wrap;
}
.settingMenu label {
  padding: 0 20px 0 0;
}
.previewBox {
  display: flex;
  flex: none;
  flex-direction: column;
  aspect-ratio: 16 / 9;
  align-items: center;
  justify-content: center;
  min-width: 260px;
  min-height: 90px;
  max-width: 350px;
  padding: 20px 16px;
  border-radius: 12px;
  background: rgba(25, 25, 30, 0.9);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  margin-bottom: 24px; /* 설정 메뉴와 구분 */
  gap: 8px;
  transition:
    background 0.25s,
    box-shadow 0.25s;
  position: relative; /* 기준 컨테이너로 명시 */
}

.previewBox > div {
  width: 100%;
  text-align: center;
  line-height: 1.55;
  word-break: keep-all;
}

@media (max-width: 400px) {
  .previewBox {
    min-width: 180px;
    padding: 14px 6px;
  }
}
.settingsScrollable {
  flex-grow: 1;
  flex: 1 1 0; /* 남은 공간을 모두 차지 */
  min-height: 0; /* 스크롤 가능하게 해주는 flexbox 속성 */
  max-height: 600px; /* 필요에 따라 조절 */
  overflow-y: auto;
  padding-right: 10px; /* 스크롤바 간섭 방지 선택 사항 */
}

/* 가사의 세 모드 */
.singleMode {
  position: absolute;
  bottom: 15%;
  font-size: 0.8rem;
}

.syncMode {
  position: relative;
  font-size: 0.7rem;
  top: 20%;
}

.fullMode {
  position: static;
  /* full 모드 스타일 */
  font-size: 0.6rem;
  /* 라인 간격, 줄 높이 등 세부조절 */
}

/* 드롭다운 */
select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 8px 36px 8px 16px; /* 오른쪽 공간 확보 */
  font-size: 14px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  cursor: pointer;
  min-width: 160px;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
  position: relative;
  background-image: url('data:image/svg+xml;utf8,<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg"><polyline points="4,6 8,10 12,6" fill="none" stroke="%23666" stroke-width="2" stroke-linecap="round"/></svg>');
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px 16px;
}

/* 포커스 시 테두리 강조 */
select:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 8px rgba(74, 144, 226, 0.2);
}

/* 비활성화 */
select:disabled {
  background-color: #f5f5f5;
  color: #999;
  border-color: #ddd;
}

/**/
.lyricsText {
  display: inline-block;
  font-weight: bold;
  margin: 0;
  justify-content: center;
  font-size: 0.7rem;
}
```

## File: popup/components/timer/styles.modules.css
```css
/* 가사 정보 */
.songInfo {
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  color: #222;
  margin: 12px 0 8px 0;
  letter-spacing: 0.5px;
  animation: fadeIn 0.9s;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
/* 타이머 */
.timer {
  text-align: center;
  font-size: 48px;
  font-weight: bold;
  letter-spacing: 6px;
  margin: 69px 0 69px 0;
  color: #111;
}
.timeSelect {
  border: none;
  /* Firefox */
  -moz-appearance: none;
  /* Chrome, Safari, Edge */
  -webkit-appearance: none;
  appearance: none;
}
.timerControls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  background: gray;
  box-sizing: border-box;
  width: 60%;
  margin-left: auto;
  margin-right: auto;
  border-radius: 15px;
  height: 30px;
}

/* 부가 설명 */
.popupGuide {
  text-align: center;
  margin-top: 4px;
  font-size: 15px;
  color: #222;
  opacity: 0.7;
  letter-spacing: 0.5px;
}
.iconButton {
  background: transparent;
  border: none;
  cursor: pointer; /* 마우스 오버 시 포인터 */
  outline: none; /* 포커스 테두리 제거 (접근성 필요시 조정) */
  display: inline-flex; /* 아이콘 정렬에 유리 */
  align-items: center;
  justify-content: center;
}
```

## File: popup/components/timer/Timer.tsx
```typescript
import { useEffect, useState } from 'react';
import styles from './styles.modules.css';
import { CiPause1 } from 'react-icons/ci';
import { TimerPickerUI } from '@components/common/TimerPrickerUI';
import { ExtensionMessage } from '@background/background';
import { RiResetRightLine } from 'react-icons/ri';
import { FiPlay } from 'react-icons/fi';
import { MdAccessAlarm } from 'react-icons/md';
import { FaMaxcdn } from 'react-icons/fa';
import Tooltip from '@mui/material/Tooltip';

const ICON_SIZE = 18;
interface TimerProps {
  onPlayStateChange?: (playing: boolean) => void;
}
export function Timer({ onPlayStateChange }: TimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false); // 재생 중인지
  const [isEditing, setIsEditing] = useState(true); // 재생 중일 때 style 변경
  const [showToast, setShowToast] = useState(false);

  // totalSeconds를 시/분/초로 분리 계산
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // 타이머 재생 상태 변화 시 부모 콜백 호출
  useEffect(() => {
    if (onPlayStateChange) {
      onPlayStateChange(isPlaying);
    }
  }, [isPlaying, onPlayStateChange]);

  // 사용자가 시/분/초 변경 시
  const handleTimeChange = (h: number, m: number, s: number) => {
    setTotalSeconds(h * 3600 + m * 60 + s);
  };

  // 타이머 작동 처리
  useEffect(() => {
    if (!isPlaying) return;

    if (totalSeconds <= 0) {
      setIsPlaying(false);
      setIsEditing(true);
      return;
    }
    const intervalId = setInterval(() => {
      setTotalSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isPlaying, totalSeconds]);

  // 초기화
  const resetTimer = () => {
    setTotalSeconds(0);
    setIsPlaying(false);
    setIsEditing(true);
  };

  // 최대치 설정
  const maxTimer = () => {
    const maxSeconds = 6 * 3600 + 59 * 60 + 59;
    setTotalSeconds(maxSeconds);
    setIsPlaying(false);
    setIsEditing(true);
  };

  // 2초 후 토스트 자동 사라지기
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'getStatus' }, (response) => {
      setTotalSeconds(response.totalSeconds);
      setIsPlaying(response.isPlaying);
      setIsEditing(!response.isPlaying);
    });

    const listener = (message: ExtensionMessage) => {
      if (message.type === 'tick') {
        setTotalSeconds(message.totalSeconds);
        setIsEditing(false);
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  // 재생 버튼 토글
  const togglePlay = () => {
    if (totalSeconds === 0) {
      setShowToast(true);
      return;
    }
    if (isPlaying) {
      chrome.runtime.sendMessage({ type: 'stopTimer' });
      setIsPlaying(false);
    } else {
      chrome.runtime.sendMessage({ type: 'startTimer', totalSeconds });
      setIsPlaying(true);
    }
  };

  return (
    <>
      {/* 현재 곡 정보 */}
      <div className={styles.songInfo}>
        <span>✨ 아티스트 - 타이틀곡 ✨</span>
      </div>

      {/* 시간/분 타이머 */}
      {isEditing ? (
        <TimerPickerUI
          hours={hours}
          minutes={minutes}
          seconds={seconds}
          onChange={handleTimeChange} // (h, m, s) => setTotalSeconds(...)
        />
      ) : (
        <div className={styles.timer}>
          {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:
          {seconds.toString().padStart(2, '0')}
        </div>
      )}

      {/* 타이머 컨트롤 아이콘 버튼 */}
      <div className={styles.timerControls}>
        <Tooltip title="초기화" arrow>
          <button
            className={styles.iconButton}
            aria-label="초기화"
            onClick={resetTimer}
            disabled={isPlaying}
            data-tip
            data-for="resetTip"
          >
            <RiResetRightLine size={ICON_SIZE} color={isPlaying ? '#c1c1c1cf' : 'white'} />
          </button>
        </Tooltip>

        <Tooltip title="타이머 시작" arrow>
          <button className={styles.iconButton} aria-label={isPlaying ? '일시정지' : '재생'} onClick={togglePlay}>
            {isPlaying ? (
              <CiPause1 size={ICON_SIZE} style={{ color: 'white' }} />
            ) : (
              <FiPlay size={ICON_SIZE} style={{ color: 'white' }} />
            )}
          </button>
        </Tooltip>
        <Tooltip title="알림" arrow>
          <button className={styles.iconButton} aria-label="알림">
            <MdAccessAlarm size={ICON_SIZE} style={{ color: 'white' }} />
          </button>
        </Tooltip>
        <Tooltip title="최대치" arrow>
          <button className={styles.iconButton} aria-label="최대치" onClick={maxTimer}>
            <FaMaxcdn size={ICON_SIZE} style={{ color: 'white' }} />
          </button>
        </Tooltip>
      </div>

      {/* 설명 문구 */}
      <div className={styles.popupGuide}>타이머를 설정하고, 유튜브에서 신나게 노래해보세요!</div>
      {/* 토스트 메시지 */}
      {showToast && <div className={styles.toast}>시간 설정 후 다시 눌러주세요</div>}
    </>
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
  width: 350px;
  height: 450px;
  max-width: 360px;
  margin: 0 auto;
  background: #ffffff;
  box-sizing: border-box;
  padding: 0;
}
.popup-wrapper {
  width: 100%;
  height: 100%;
  font-family: 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
  box-sizing: border-box;
  padding: 15px;
}
.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 15px;
  background: #f5f5f5;
  font-size: 12px;
  font-weight: bold;
}
.popup-header h2 {
  padding: 0;
  margin: 10px 0;
  font-size: 15px;
}
.icon-button {
  background: transparent;
  border: none;
  cursor: pointer; /* 마우스 오버 시 포인터 */
  outline: none; /* 포커스 테두리 제거 (접근성 필요시 조정) */
  display: inline-flex; /* 아이콘 정렬에 유리 */
  align-items: center;
  justify-content: center;
}

input:checked + .slider {
  background-color: #2196f3;
}
input:checked + .slider:before {
  transform: translateX(18px);
}

/* 토글 스위치 */
.popup-tabs {
  position: relative;
  display: flex;
  width: 200px;
  height: 32px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 20px;
  margin-bottom: 20px;
  background: #f4f4f4;
  border-radius: 5px;
  box-shadow:
    1px 1px 3px 1px rgba(0, 0, 0, 0.1),
    inset 0 -2px 4px rgba(255, 255, 255, 0.6);
  overflow: hidden;
}

.popup-tabs .slider {
  position: absolute;
  top: 2px;
  bottom: 2px;
  width: 50%; /* 버튼 2개니 50% */
  background: #fff0fa;
  border-radius: 5px;
  box-shadow:
    0px 14px 8px rgba(235, 145, 175, 0.15),
    inset 1px 0px 3px rgba(255, 255, 255, 0.8);
  transition: transform 0.3s ease;
  z-index: 0;
}

.popup-tabs .tab {
  position: relative;
  flex: 1;
  z-index: 1;
  background: transparent;
  border: none;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  color: #444;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  transition: color 0.18s;
}

.popup-tabs .tab.active {
  color: #222;
  font-weight: bold;
}

.popup-tabs .tab:hover:not(.active) {
  color: #eebbc3;
}
.tab-content {
  margin-top: 12px; /* popup-tabs와 떨어지도록 여백 */
  /* 필요하다면 높이 지정 및 overflow 조정 가능 */
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
        setupPlugins();

        // ✅ 스토리지 언어 확인 (null 허용)
        const savedLang = await getSavedLanguage();

        // ✅ 브라우저 언어 감지 (스토리지 없을 때만)
        const browserLang = savedLang ? null : await detectBrowserLanguage();
        const finalLang = savedLang || browserLang || DEFAULT_LANGUAGE;

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

        console.log(`[i18n] Using language: ${finalLang}`);
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
