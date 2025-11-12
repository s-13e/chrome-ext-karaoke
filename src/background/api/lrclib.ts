import { Line } from '@lib/types/lyrics';
import { RequestLimiter } from '@lib/utils/common/requestLimiter';
import { LyricsError, LyricsErrorCode } from '@lib/types/lyricsError';
import { searchSpotifyTrack } from './spotify';
import { isEnglishText } from '@lib/utils/lyrics/parsers/stringUtils';

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
const RAILWAY_API_URL = process.env.RAILWAY_API_URL!;

// API 타임아웃 설정
const CACHE_TIMEOUT_MS = 5000; // Railway 캐시: 5초 (Railway 응답 대기)
const LRCLIB_TIMEOUT_MS = 20000; // LRCLib API: 20초 (네트워크 지연 고려)

/**
 * AbortController를 사용한 타임아웃 fetch 유틸리티
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Duration을 5초 단위로 반올림하여 캐시 효율과 정확도 균형
 * 예: 207초 → 205초, 209초 → 210초, 212초 → 210초
 *
 * 이유:
 * - 같은 곡이 duration 1~2초 차이로 여러 캐시 생성되는 문제 해결
 * - 5초 단위면 최대 ±2.5초 오차 발생 (예: 207초 → 205초로 저장, 실제 208초 가사 반환)
 * - evaluateCandidatesByDuration이 ±2초 허용하므로 대부분 범위 내
 * - 싱크 정확도: 5초 차이는 사용자가 크게 체감하지 않음
 * - 캐시 절감: 206, 207, 208, 209초 → 모두 210초로 통합 (75% 절감)
 */
function normalizeDuration(duration: number): number {
  return Math.round(duration / 5) * 5;
}

// 메인 엔트리: 캐시 우선, 없을 때 get fallback
export async function fetchLyricsByArtistAndTrack(
  artist: string,
  title: string,
  durationSeconds: number,
): Promise<LrcLibLyricsResult> {
  if (!artist?.trim() || !title?.trim()) {
    throw new LyricsError(LyricsErrorCode.ARTIST_TITLE_EXTRACT_FAILED, undefined, { artist, title });
  }

  if (durationSeconds <= 0) {
    throw new LyricsError(LyricsErrorCode.INVALID_VIDEO_DURATION, undefined, { durationSeconds });
  }

  // 0. 먼저 Railway 캐시에서 아티스트 영문 alias 확인 (빠른 캐시 조회만)
  // 비영어 아티스트명이면 영문명으로 변환된 캐시가 있을 수 있음
  let effectiveArtist = artist;
  try {
    const { fetchEnglishAliasFromCache } = await import('./musicBrainz');
    const cachedAlias = await fetchEnglishAliasFromCache(artist);
    if (cachedAlias) {
      console.log(`[LRCLib] 아티스트 alias 캐시 히트: "${artist}" → "${cachedAlias}"`);
      effectiveArtist = cachedAlias;
    }
  } catch (error) {
    // alias 조회 실패해도 원본 아티스트명으로 계속 진행
    console.warn('[LRCLib] alias 캐시 조회 실패, 원본 아티스트명 사용:', error);
  }

  // Redis 캐시 키: 소문자 변환 + duration 반올림
  // preprocessArtistOrTitle이 이미 공백/특수문자 정리 완료
  const cacheKeyArtist = effectiveArtist.toLowerCase();
  const cacheKeyTitle = title.toLowerCase();
  const cacheKeyDuration = normalizeDuration(durationSeconds);

  console.log(`[LRCLib] Redis 캐시 키: "${cacheKeyArtist}" - "${cacheKeyTitle}" - ${cacheKeyDuration}s`);

  // 1. Railway Redis 캐시에서 LRCLib ID 조회 시도 (2초 타임아웃, 빠르게 실패)
  try {
    const cacheRes = await fetchWithTimeout(
      `${RAILWAY_API_URL}/api/v1/lrclib/id?artist=${encodeURIComponent(cacheKeyArtist)}&title=${encodeURIComponent(
        cacheKeyTitle,
      )}&duration=${cacheKeyDuration}`,
      {},
      CACHE_TIMEOUT_MS,
    );

    if (cacheRes.ok) {
      const cachedData = await cacheRes.json();
      console.log('[LRCLib API] Railway 캐시 응답:', cachedData);

      // Railway API 응답 구조: {cached: true, data: {lrclibId: number}}
      const lrclibId = cachedData?.data?.lrclibId || cachedData?.id;

      // ID 유효성 검증
      if (lrclibId && typeof lrclibId === 'number' && lrclibId > 0) {
        console.log('[LRCLib API] Railway 캐시 히트 - ID:', lrclibId);

        // ID로 가사 직접 조회 (10초 타임아웃)
        const lyricsRes = await fetchWithTimeout(`https://lrclib.net/api/get/${lrclibId}`, {}, LRCLIB_TIMEOUT_MS);
        if (lyricsRes.ok) {
          const lyricsData = await lyricsRes.json();
          return {
            lyrics: lyricsData.syncedLyrics || lyricsData.plainLyrics,
            duration: lyricsData.duration,
            artist: lyricsData.artistName,
            title: lyricsData.trackName,
            id: String(lrclibId),
          };
        }
      } else {
        console.warn('[LRCLib API] Railway 캐시에 유효한 ID 없음, 검색 API로 폴백', { cachedData, lrclibId });
      }
    } else {
      console.warn('[LRCLib API] Railway 캐시 응답 실패 - HTTP', cacheRes.status);
    }
  } catch (error) {
    // AbortError는 타임아웃, 나머지는 네트워크 에러
    const errorType = (error as Error).name === 'AbortError' ? '타임아웃' : '네트워크 에러';
    console.warn(`[LRCLib API] Railway 캐시 조회 실패 (${errorType}), 검색 API로 폴백:`, error);
  }

  // 2. 캐시 미스 → LRCLib API 호출 (원본 값 사용, 대소문자 구분 없음)
  const getEndpoint = 'https://lrclib.net/api/get';
  const result = await fetchLyricsWithEndpoint(getEndpoint, artist, title, durationSeconds);

  if (!result) {
    throw new LyricsError(LyricsErrorCode.LRCLIB_NOT_FOUND, undefined, { artist, title, durationSeconds });
  }

  // 3. Railway Redis 캐시에 ID 저장 (LRCLib 응답값 사용 - 더 정확함)
  // 유효한 데이터만 캐싱 (빈 객체, null, undefined 방지)
  console.log('[LRCLib API] 저장 조건 확인:', { id: result.id, artist: result.artist, title: result.title });

  // ID는 반드시 유효한 숫자여야 함
  const isValidId = typeof result.id === 'number' && result.id > 0;
  const hasArtist = result.artist && result.artist.trim().length > 0;
  const hasTitle = result.title && result.title.trim().length > 0;

  if (isValidId && hasArtist && hasTitle && result.artist && result.title) {
    // Non-blocking cache save: 백그라운드에서 저장, 실패해도 무시
    const cacheKeyLrcArtist = result.artist.toLowerCase();
    const cacheKeyLrcTitle = result.title.toLowerCase();

    // Promise를 await 없이 실행 (fire-and-forget)
    fetchWithTimeout(
      `${RAILWAY_API_URL}/api/v1/lrclib/id`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artist: cacheKeyLrcArtist,
          title: cacheKeyLrcTitle,
          duration: cacheKeyDuration,
          lrclibId: result.id,
        }),
      },
      CACHE_TIMEOUT_MS,
    )
      .then((saveResponse) => {
        if (!saveResponse.ok) {
          console.warn('[LRCLib API] Railway 캐시 저장 실패 - HTTP', saveResponse.status);
        } else {
          console.log(
            '[LRCLib API] Railway 캐시 저장 완료:',
            result.id,
            `(${cacheKeyLrcArtist} - ${cacheKeyLrcTitle} - ${cacheKeyDuration}s)`,
          );
        }
      })
      .catch((error) => {
        const errorType = (error as Error).name === 'AbortError' ? '타임아웃' : '네트워크 에러';
        console.warn(`[LRCLib API] Railway 캐시 저장 실패 (${errorType}):`, error);
      });
  } else {
    console.warn('[LRCLib API] Railway 캐시 저장 스킵: 유효하지 않은 데이터', {
      isValidId,
      hasArtist,
      hasTitle,
      id: result.id,
      artist: result.artist,
      title: result.title,
    });
  }

  return result;
}

export async function fetchLyricsWithEndpoint(
  endpoint: string,
  artist: string,
  title: string,
  durationSeconds: number,
): Promise<LrcLibLyricsResult | null> {
  async function searchWithParams(
    artistParam: string,
    titleParam: string,
    _attemptNumber: number,
    durationSeconds: number,
  ): Promise<LrcLibLyricsResult | null> {
    const searchEndpoint = `https://lrclib.net/api/search?artist_name=${encodeURIComponent(
      artistParam,
    )}&track_name=${encodeURIComponent(titleParam)}`;

    let searchRes: Response;
    try {
      searchRes = await fetchWithTimeout(searchEndpoint, {}, LRCLIB_TIMEOUT_MS);
    } catch (error) {
      throw LyricsError.fromNetworkError(error as Error, { endpoint: searchEndpoint });
    }

    if (!searchRes.ok) {
      console.warn(`Search API response not OK, status: ${searchRes.status}`);
      throw LyricsError.fromHttpStatus(searchRes.status, { endpoint: searchEndpoint });
    }

    let searchData: SearchCandidate[];
    try {
      searchData = await searchRes.json();
    } catch (error) {
      throw new LyricsError(LyricsErrorCode.INVALID_RESPONSE, `Invalid JSON response: ${error}`, {
        endpoint: searchEndpoint,
      });
    }

    if (!Array.isArray(searchData) || searchData.length === 0) {
      throw new LyricsError(LyricsErrorCode.EMPTY_SEARCH_RESULTS, undefined, { artistParam, titleParam });
    }

    const limitedCandidates = searchData.slice(0, 10);

    const normalizedReqTitle = titleParam.trim().toLowerCase();

    let fallbackSynced: LrcLibLyricsResult | null = null;
    let fallbackPlain: LrcLibLyricsResult | null = null;

    async function fetchLyricDetail(
      candidate: SearchCandidate,
      durationSeconds: number,
    ): Promise<
      | (LrcLibLyricsResult & {
          hasSynced: boolean;
          isStrictMatch: boolean;
        })
      | null
    > {
      try {
        const detailRes = await fetchWithTimeout(
          `${endpoint}/${candidate.id}?duration=${encodeURIComponent(durationSeconds)}`,
          {},
          LRCLIB_TIMEOUT_MS,
        );
        if (!detailRes.ok) {
          console.warn(`Detail API response not OK for candidate id ${candidate.id}, status: ${detailRes.status}`);
          return null;
        }

        let detail: {
          syncedLyrics?: string | Line[];
          plainLyrics?: string | Line[];
          duration?: number;
          artistName?: string;
          trackName?: string;
        };

        try {
          detail = await detailRes.json();
        } catch (error) {
          console.warn(`Invalid JSON response for candidate ${candidate.id}:`, error);
          return null;
        }

        const lyrics = detail.syncedLyrics || detail.plainLyrics;
        if (!lyrics) {
          return null;
        }

        // 가사가 비어있는지 확인
        if (typeof lyrics === 'string' && lyrics.trim().length === 0) {
          return null;
        }
        if (Array.isArray(lyrics) && lyrics.length === 0) {
          return null;
        }
        /*  console.log(
          '[LrcLib] API 받은 원본 lyrics:',
          lyrics,
          `candidate.id: ${candidate.id} 응답 duration: ${detail.duration}`,
        ); */

        const candidateTitle = (detail.trackName ?? '').trim().toLowerCase();
        const isStrictMatch = candidateTitle === normalizedReqTitle;

        if (detail.syncedLyrics && !isStrictMatch && !fallbackSynced) {
          fallbackSynced = {
            lyrics,
            duration: detail.duration,
            artist: detail.artistName,
            title: detail.trackName,
            id: candidate.id,
          };
        } else if (!detail.syncedLyrics && !fallbackPlain) {
          fallbackPlain = {
            lyrics,
            duration: detail.duration,
            artist: detail.artistName,
            title: detail.trackName,
            id: candidate.id,
          };
        }

        return {
          lyrics,
          duration: detail.duration,
          artist: detail.artistName,
          title: detail.trackName,
          id: candidate.id,
          hasSynced: !!detail.syncedLyrics,
          isStrictMatch,
        };
      } catch (err) {
        console.error(`Error fetching lyric detail ${candidate.id}:`, err);
        return null;
      }
    }
    // 요청 배치 - 각 fetch는 개별적으로 LRCLIB_TIMEOUT_MS 타임아웃을 가짐
    const results = await Promise.all(
      limitedCandidates.map((candidate) => requestLimiter.enqueue(() => fetchLyricDetail(candidate, durationSeconds))),
    );

    // validResults 구성
    const validResults = results.filter((res) => res !== null) as (LrcLibLyricsResult & {
      hasSynced: boolean;
      isStrictMatch: boolean;
    })[];

    if (!validResults.length && (fallbackSynced || fallbackPlain)) {
      console.log('No valid results, returning fallback');
      return fallbackSynced || fallbackPlain;
    }
    if (!validResults.length) {
      console.log('No results found');
      return null;
    }

    const filteredByDuration = evaluateCandidatesByDuration(validResults, durationSeconds, 2);

    if (!filteredByDuration.length && (fallbackSynced || fallbackPlain)) {
      console.log('No valid results after duration filter, returning fallback');
      return fallbackSynced || fallbackPlain;
    }

    if (!filteredByDuration.length) {
      console.log('No results found after duration filter');
      return null;
    }

    const strictSynced = filteredByDuration.find((res) => res.hasSynced && res.isStrictMatch);
    if (strictSynced) {
      console.log('Returning strict matched synced lyrics');
      return strictSynced;
    }

    const fallbackSyncedCandidate = filteredByDuration.find((res) => res.hasSynced);
    if (fallbackSyncedCandidate) {
      console.log('Returning fallback synced lyrics');
      return fallbackSyncedCandidate;
    }

    const strictPlain = filteredByDuration.find((res) => !res.hasSynced && res.isStrictMatch);
    if (strictPlain) {
      console.log('Returning strict matched plain lyrics');
      return strictPlain;
    }

    const fallbackPlainCandidate = filteredByDuration.find((res) => !res.hasSynced);
    if (fallbackPlainCandidate) {
      console.log('Returning fallback plain lyrics');
      return fallbackPlainCandidate;
    }

    console.log('Returning first valid result as fallback');
    return filteredByDuration[0] || null;
  }

  // 1차 시도: 정상 아티스트-곡명 순서
  try {
    const result1 = await searchWithParams(artist, title, 1, durationSeconds);
    if (result1 !== null) return result1;
  } catch (error) {
    // EMPTY_SEARCH_RESULTS는 정상적인 "검색 결과 없음"이므로 계속 진행
    if (error instanceof LyricsError && error.code === LyricsErrorCode.EMPTY_SEARCH_RESULTS) {
      console.log('[LRCLib] 1차 시도 결과 없음, 2차 시도로 진행');
    } else {
      // 네트워크 오류 등 다른 예외는 상위로 전파
      throw error;
    }
  }

  // 2차 시도: 곡명-아티스트 순서
  if (artist.toLowerCase() !== title.toLowerCase()) {
    try {
      const result2 = await searchWithParams(title, artist, 2, durationSeconds);
      if (result2 !== null) return result2;
    } catch (error) {
      // EMPTY_SEARCH_RESULTS는 정상적인 "검색 결과 없음"이므로 계속 진행
      if (error instanceof LyricsError && error.code === LyricsErrorCode.EMPTY_SEARCH_RESULTS) {
        console.log('[LRCLib] 2차 시도 결과 없음, freeText 시도로 진행');
      } else {
        // 네트워크 오류 등 다른 예외는 상위로 전파
        throw error;
      }
    }
  }

  // 3차 시도: 비영어 타이틀이면 Spotify 우선, 영어면 freeText 우선
  const isNonEnglishTitle = !isEnglishText(title);

  if (isNonEnglishTitle) {
    // 비영어 타이틀: Spotify 우선
    try {
      console.log('[Spotify] 비영어 타이틀 감지, Spotify 검색 시도');
      const spotifyResult = await searchSpotifyTrack(artist, title);

      if (spotifyResult) {
        console.log(`[Spotify] 영문명 발견: ${spotifyResult.artist} - ${spotifyResult.name}`);

        // Spotify에서 받은 영문명으로 LRCLib 재검색
        try {
          const retryResult = await searchWithParams(spotifyResult.artist, spotifyResult.name, 3, durationSeconds);
          if (retryResult !== null) {
            console.log(`[Spotify fallback] 성공: ${spotifyResult.artist} - ${spotifyResult.name}`);
            return retryResult;
          }
        } catch (retryError) {
          // 재검색 실패해도 무시
          console.warn('[Spotify fallback] LRCLib 재검색 실패:', retryError);
        }
      }
    } catch (error) {
      console.warn('[Spotify] fallback 실패:', error);
    }
  }

  // 4차 시도: freeText 검색 (q 파라미터) - 아티스트 + 타이틀로 검색
  try {
    const freeTextQuery = `${artist} ${title}`;
    console.log(`[LRCLib] freeText 검색 시도: "${freeTextQuery}"`);
    const freeTextEndpoint = `https://lrclib.net/api/search?q=${encodeURIComponent(freeTextQuery)}`;
    const freeTextRes = await fetchWithTimeout(freeTextEndpoint, {}, LRCLIB_TIMEOUT_MS);

    if (freeTextRes.ok) {
      const freeTextData: SearchCandidate[] = await freeTextRes.json();
      if (Array.isArray(freeTextData) && freeTextData.length > 0) {
        console.log(`[LRCLib] freeText 검색 결과: ${freeTextData.length}개 발견`);

        // 검색 결과 중에서 가사 가져오기 (기존 로직 재사용)
        const limitedCandidates = freeTextData.slice(0, 10);

        for (const candidate of limitedCandidates) {
          try {
            const detailRes = await fetchWithTimeout(
              `${endpoint}/${candidate.id}?duration=${encodeURIComponent(durationSeconds)}`,
              {},
              LRCLIB_TIMEOUT_MS,
            );
            if (!detailRes.ok) continue;

            const detail: {
              syncedLyrics?: string | Line[];
              plainLyrics?: string | Line[];
              duration?: number;
              artistName?: string;
              trackName?: string;
            } = await detailRes.json();

            const lyrics = detail.syncedLyrics || detail.plainLyrics;
            if (!lyrics) continue;

            // Duration 체크 (±2초)
            if (detail.duration && Math.abs(durationSeconds - detail.duration) <= 2) {
              console.log(`[LRCLib] freeText 검색 성공: ${detail.artistName} - ${detail.trackName}`);
              return {
                lyrics,
                duration: detail.duration,
                artist: detail.artistName,
                title: detail.trackName,
                id: candidate.id,
              };
            }
          } catch (err) {
            console.warn(`[LRCLib] freeText 결과 처리 실패 (id: ${candidate.id}):`, err);
            continue;
          }
        }
      }
    }
  } catch (error) {
    console.warn('[LRCLib] freeText 검색 실패:', error);
  }

  // 5차 시도: 영어 타이틀이었는데 freeText도 실패한 경우 Spotify 시도
  if (!isNonEnglishTitle) {
    try {
      console.log('[Spotify] 영어 타이틀이지만 freeText 실패, Spotify 검색 시도');
      const spotifyResult = await searchSpotifyTrack(artist, title);

      if (spotifyResult) {
        console.log(`[Spotify] 영문명 발견: ${spotifyResult.artist} - ${spotifyResult.name}`);

        // Spotify에서 받은 영문명으로 LRCLib 재검색
        try {
          const retryResult = await searchWithParams(spotifyResult.artist, spotifyResult.name, 5, durationSeconds);
          if (retryResult !== null) {
            console.log(`[Spotify fallback] 성공: ${spotifyResult.artist} - ${spotifyResult.name}`);
            return retryResult;
          }
        } catch (retryError) {
          // 재검색 실패해도 무시
          console.warn('[Spotify fallback] LRCLib 재검색 실패:', retryError);
        }
      }
    } catch (error) {
      console.warn('[Spotify] fallback 실패:', error);
    }
  }

  return null;
}

// validResults는 여러 후보 가사 리스트
// videoDurationSec은 영상 길이(초) - collectMetadataAndLyrics에서 인자로 전달

function evaluateCandidatesByDuration(
  candidates: (LrcLibLyricsResult & {
    hasSynced: boolean;
    isStrictMatch: boolean;
  })[],
  videoDurationSec: number,
  maxAllowedDiffSec = 3,
) {
  return candidates.filter((candidate) => {
    if (!candidate.duration) return false; // duration 정보 없는 후보 제거
    const diff = Math.abs(videoDurationSec - candidate.duration);
    return diff <= maxAllowedDiffSec;
  });
}
