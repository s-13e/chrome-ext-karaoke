import { Line } from '@lib/types/lyrics';
import { LyricsError, LyricsErrorCode } from '@lib/types/lyricsError';

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

const API_SERVER_URL = process.env.API_SERVER_URL!;

// API 타임아웃 설정
const CACHE_TIMEOUT_MS = 5000; // API 서버 캐시: 5초 (서버 응답 대기)
const LRCLIB_TIMEOUT_MS = 20000; // LRCLib API: 20초 (네트워크 지연 고려)

/**
 * YouTube videoId로 LRCLib ID 캐시 조회 (독립 함수)
 */
export async function fetchYouTubeLRCLibCache(videoId: string): Promise<{ lrclibId: number } | null> {
  try {
    const ytCacheRes = await fetchWithTimeout(
      `${API_SERVER_URL}/api/v1/youtube/lrclib/${encodeURIComponent(videoId)}`,
      {},
      CACHE_TIMEOUT_MS,
    );

    if (ytCacheRes.ok) {
      const ytCachedData = await ytCacheRes.json();
      const lrclibId = ytCachedData?.data?.lrclibId ?? ytCachedData?.lrclibId;

      if (lrclibId && (typeof lrclibId === 'number' || typeof lrclibId === 'string')) {
        const numericId = typeof lrclibId === 'string' ? parseInt(lrclibId, 10) : lrclibId;
        if (numericId > 0 && !isNaN(numericId)) {
          return { lrclibId: numericId };
        }
      }
    }
    return null;
  } catch (error) {
    console.warn('[fetchYouTubeLRCLibCache] 조회 실패:', error);
    return null;
  }
}

/**
 * LRCLib ID로 가사 직접 조회 (독립 함수)
 */
export async function fetchLyricsById(lrclibId: number): Promise<LrcLibLyricsResult | null> {
  try {
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
    return null;
  } catch (error) {
    console.warn('[fetchLyricsById] 조회 실패:', error);
    return null;
  }
}

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
  videoId?: string, // YouTube videoId (optional, 최고속 캐시용)
): Promise<LrcLibLyricsResult> {
  if (!artist?.trim() || !title?.trim()) {
    throw new LyricsError(LyricsErrorCode.ARTIST_TITLE_EXTRACT_FAILED, undefined, { artist, title });
  }

  if (durationSeconds <= 0) {
    throw new LyricsError(LyricsErrorCode.INVALID_VIDEO_DURATION, undefined, { durationSeconds });
  }

  // 0. [최우선] YouTube videoId → LRCLib ID 직접 매핑 캐시 확인 (가장 빠른 경로)
  if (videoId) {
    try {
      const ytCacheStartTime = performance.now();
      console.log(`[LRCLib] YouTube videoId 캐시 확인: ${videoId}`);
      const ytCacheRes = await fetchWithTimeout(
        `${API_SERVER_URL}/api/v1/youtube/lrclib/${encodeURIComponent(videoId)}`,
        {},
        CACHE_TIMEOUT_MS,
      );
      console.log(
        `[Performance] YouTube-LRCLib 캐시 조회 완료 (${(performance.now() - ytCacheStartTime).toFixed(0)}ms, 상태: ${ytCacheRes.status})`,
      );

      if (ytCacheRes.ok) {
        const ytCachedData = await ytCacheRes.json();
        const lrclibId = ytCachedData?.lrclibId;

        if (lrclibId && typeof lrclibId === 'number' && lrclibId > 0) {
          console.log(`[LRCLib] YouTube videoId 캐시 히트: ${videoId} → LRCLib ID ${lrclibId}`);

          // LRCLib ID로 가사 직접 조회
          const lyricsRes = await fetchWithTimeout(`https://lrclib.net/api/get/${lrclibId}`, {}, LRCLIB_TIMEOUT_MS);
          if (lyricsRes.ok) {
            const lyricsData = await lyricsRes.json();
            console.log(`[LRCLib] YouTube videoId 캐시로 가사 로드 완료 (가장 빠른 경로)`);
            return {
              lyrics: lyricsData.syncedLyrics || lyricsData.plainLyrics,
              duration: lyricsData.duration,
              artist: lyricsData.artistName,
              title: lyricsData.trackName,
              id: String(lrclibId),
            };
          }
        }
      }
    } catch (error) {
      // YouTube videoId 캐시 실패해도 다음 단계로 진행
      console.warn('[LRCLib] YouTube videoId 캐시 조회 실패, 다음 단계로 진행:', error);
    }
  }

  // 1. 아티스트 영문 alias 확인 (빠른 캐시 조회만)
  // 비영어 아티스트명이면 영문명으로 변환된 캐시가 있을 수 있음
  let effectiveArtist = artist;

  // 영어 텍스트 체크 - 이미 영문이면 alias 조회 스킵 (2초 타임아웃 방지)
  const { isEnglishText, toTitleCase } = await import('@lib/utils/lyrics/parsers/stringUtils');
  const isArtistEnglish = isEnglishText(artist);

  if (!isArtistEnglish) {
    try {
      const { fetchEnglishAliasFromCache } = await import('./musicBrainz');
      const cachedAlias = await fetchEnglishAliasFromCache(artist);
      if (cachedAlias) {
        console.log(`[LRCLib] 아티스트 alias 캐시 히트: "${artist}" → "${cachedAlias}"`);
        effectiveArtist = cachedAlias;
      }
    } catch (error) {
      // alias 조회 실패해도 원본 아티스트명으로 계속 진행
      if ((error as Error).name === 'AbortError') {
        console.warn(`[LRCLib] alias 캐시 타임아웃 (2초 초과), 원본 아티스트명 사용: "${artist}"`);
      } else {
        console.warn('[LRCLib] alias 캐시 조회 실패, 원본 아티스트명 사용:', error);
      }
    }
  } else {
    console.log(`[LRCLib] 아티스트가 이미 영문이므로 alias 조회 스킵: "${artist}"`);
    // 영어인 경우 Title Case로 자동 변환 (대소문자 정규화)
    // 예: "aimyon" → "Aimyon", "rick astley" → "Rick Astley"
    const titleCased = toTitleCase(artist);
    if (titleCased !== artist) {
      console.log(`[LRCLib] 영문 아티스트명 Title Case 변환: "${artist}" → "${titleCased}"`);
      effectiveArtist = titleCased;
    }
  }

  // Redis 캐시 키: 소문자 변환 + duration 반올림
  // preprocessArtistOrTitle이 이미 공백/특수문자 정리 완료
  const cacheKeyArtist = effectiveArtist.toLowerCase();
  const cacheKeyTitle = title.toLowerCase();
  const cacheKeyDuration = normalizeDuration(durationSeconds);

  console.log(`[LRCLib] 🔍 가사 검색 시작`);
  console.log(
    `[LRCLib]   Artist: "${effectiveArtist}" (원본: "${artist}"), Title: "${title}, Duration: ${cacheKeyDuration}s"`,
  );
  console.log(`[LRCLib]   Redis 캐시 키: "${cacheKeyArtist}" - "${cacheKeyTitle}" - ${cacheKeyDuration}s`);

  // 1. API 서버 Redis 캐시에서 LRCLib ID 조회 시도 (2초 타임아웃, 빠르게 실패)
  try {
    const redisCacheStartTime = performance.now();
    const cacheRes = await fetchWithTimeout(
      `${API_SERVER_URL}/api/v1/lrclib/id?artist=${encodeURIComponent(cacheKeyArtist)}&title=${encodeURIComponent(
        cacheKeyTitle,
      )}&duration=${cacheKeyDuration}`,
      {},
      CACHE_TIMEOUT_MS,
    );
    console.log(
      `[Performance] Redis 캐시 조회 완료 (${(performance.now() - redisCacheStartTime).toFixed(0)}ms, 상태: ${cacheRes.status})`,
    );

    if (cacheRes.ok) {
      const cachedData = await cacheRes.json();
      console.log('[LRCLib API] 캐시 응답:', cachedData);

      // API 서버 응답 구조: {cached: true, data: {lrclibId: number}}
      const lrclibId = cachedData?.data?.lrclibId || cachedData?.id;

      // ID 유효성 검증 (문자열도 허용)
      const numericId = typeof lrclibId === 'string' ? parseInt(lrclibId, 10) : lrclibId;
      if (numericId && typeof numericId === 'number' && numericId > 0 && !isNaN(numericId)) {
        console.log('[LRCLib API] 캐시 히트 - ID:', numericId);

        // ID로 가사 직접 조회 (10초 타임아웃)
        const lyricsDetailStartTime = performance.now();
        const lyricsRes = await fetchWithTimeout(`https://lrclib.net/api/get/${numericId}`, {}, LRCLIB_TIMEOUT_MS);
        console.log(
          `[Performance] LRCLib Detail API 조회 완료 (${(performance.now() - lyricsDetailStartTime).toFixed(0)}ms, 상태: ${lyricsRes.status})`,
        );
        if (lyricsRes.ok) {
          const lyricsData = await lyricsRes.json();
          const result = {
            lyrics: lyricsData.syncedLyrics || lyricsData.plainLyrics,
            duration: lyricsData.duration,
            artist: lyricsData.artistName,
            title: lyricsData.trackName,
            id: String(numericId),
          };

          // 캐시 히트 시에도 videoId 매핑 저장 (fire-and-forget)
          if (videoId && lyricsData.artistName && lyricsData.trackName) {
            console.log('[LRCLib API] 캐시 히트 - YouTube-LRCLib 매핑 저장 시도:', videoId, '→', numericId);
            fetchWithTimeout(
              `${API_SERVER_URL}/api/v1/youtube/lrclib`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  videoId,
                  lrclibId: numericId,
                  artist: lyricsData.artistName,
                  title: lyricsData.trackName,
                }),
              },
              CACHE_TIMEOUT_MS,
            )
              .then((saveResponse) => {
                if (!saveResponse.ok) {
                  console.warn('[LRCLib API] YouTube-LRCLib 매핑 저장 실패 - HTTP', saveResponse.status);
                } else {
                  console.log('[LRCLib API] YouTube-LRCLib 매핑 저장 완료:', videoId, '→', lrclibId);
                }
              })
              .catch((error) => {
                const errorType = (error as Error).name === 'AbortError' ? '타임아웃' : '네트워크 에러';
                console.warn(`[LRCLib API] YouTube-LRCLib 매핑 저장 실패 (${errorType}):`, error);
              });
          }

          return result;
        }
      } else {
        console.warn('[LRCLib API] 캐시에 유효한 ID 없음, 검색 API로 폴백', { cachedData, lrclibId });
      }
    } else {
      console.warn('[LRCLib API] 캐시 응답 실패 - HTTP', cacheRes.status);
    }
  } catch (error) {
    // AbortError는 타임아웃, 나머지는 네트워크 에러
    const errorType = (error as Error).name === 'AbortError' ? '타임아웃' : '네트워크 에러';
    console.warn(`[LRCLib API] 캐시 조회 실패 (${errorType}), 검색 API로 폴백:`, error);
  }

  // 2. 캐시 미스 → LRCLib API 호출 (원본 값 사용, 대소문자 구분 없음)
  const getEndpoint = 'https://lrclib.net/api/get';
  const result = await fetchLyricsWithEndpoint(getEndpoint, artist, title, durationSeconds);

  if (!result) {
    throw new LyricsError(LyricsErrorCode.LRCLIB_NOT_FOUND, undefined, { artist, title, durationSeconds });
  }

  // 3. API 서버 Redis 캐시에 ID 저장 (LRCLib 응답값 사용 - 더 정확함)
  // 유효한 데이터만 캐싱 (빈 객체, null, undefined 방지)
  console.log('[LRCLib API] 저장 조건 확인:', {
    id: result.id,
    idType: typeof result.id,
    artist: result.artist,
    title: result.title,
    duration: result.duration,
    videoId,
  });

  // ID는 반드시 유효한 숫자(또는 숫자 문자열)여야 함
  const numericId = typeof result.id === 'string' ? parseInt(result.id, 10) : result.id;
  const isValidId = typeof numericId === 'number' && numericId > 0 && !isNaN(numericId);
  const hasArtist = result.artist && result.artist.trim().length > 0;
  const hasTitle = result.title && result.title.trim().length > 0;

  // Duration 검증: 영상 길이와 10초 이내 차이만 허용
  const hasValidDuration = result.duration !== undefined && typeof result.duration === 'number';
  const durationDiff = hasValidDuration ? Math.abs(durationSeconds - result.duration!) : Infinity;
  const isDurationValid = durationDiff <= 10;

  console.log('[LRCLib API] 검증 결과:', {
    isValidId,
    hasArtist,
    hasTitle,
    isDurationValid,
    durationDiff: durationDiff === Infinity ? 'N/A' : `${durationDiff.toFixed(1)}s`,
    numericId,
  });

  if (isValidId && hasArtist && hasTitle && isDurationValid && result.artist && result.title) {
    // Non-blocking cache save: 백그라운드에서 저장, 실패해도 무시
    const cacheKeyLrcArtist = result.artist.toLowerCase();
    const cacheKeyLrcTitle = result.title.toLowerCase();

    // 1. artist+title+duration → lrclibId 캐시 저장 (fire-and-forget)
    fetchWithTimeout(
      `${API_SERVER_URL}/api/v1/lrclib/id`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artist: cacheKeyLrcArtist,
          title: cacheKeyLrcTitle,
          duration: cacheKeyDuration,
          lrclibId: numericId,
        }),
      },
      CACHE_TIMEOUT_MS,
    )
      .then((saveResponse) => {
        if (!saveResponse.ok) {
          console.warn('[LRCLib API] 캐시 저장 실패 - HTTP', saveResponse.status);
        } else {
          console.log(
            '[LRCLib API] 캐시 저장 완료:',
            numericId,
            `(${cacheKeyLrcArtist} - ${cacheKeyLrcTitle} - ${cacheKeyDuration}s)`,
          );
        }
      })
      .catch((error) => {
        const errorType = (error as Error).name === 'AbortError' ? '타임아웃' : '네트워크 에러';
        console.warn(`[LRCLib API] 캐시 저장 실패 (${errorType}):`, error);
      });

    // 2. YouTube videoId → lrclibId 직접 매핑 캐시 저장 (가장 빠른 경로, fire-and-forget)
    if (videoId) {
      console.log('[LRCLib API] YouTube-LRCLib 매핑 저장 시도:', videoId, '→', numericId);
      fetchWithTimeout(
        `${API_SERVER_URL}/api/v1/youtube/lrclib`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoId,
            lrclibId: numericId,
            artist: result.artist,
            title: result.title,
          }),
        },
        CACHE_TIMEOUT_MS,
      )
        .then((saveResponse) => {
          if (!saveResponse.ok) {
            console.warn('[LRCLib API] YouTube-LRCLib 매핑 저장 실패 - HTTP', saveResponse.status);
          } else {
            console.log('[LRCLib API] YouTube-LRCLib 매핑 저장 완료:', videoId, '→', numericId);
          }
        })
        .catch((error) => {
          const errorType = (error as Error).name === 'AbortError' ? '타임아웃' : '네트워크 에러';
          console.warn(`[LRCLib API] YouTube-LRCLib 매핑 저장 실패 (${errorType}):`, error);
        });
    }
  } else {
    console.warn('[LRCLib API] 캐시 저장 스킵: 유효하지 않은 데이터', {
      isValidId,
      hasArtist,
      hasTitle,
      isDurationValid,
      durationDiff: durationDiff === Infinity ? 'N/A' : `${durationDiff.toFixed(1)}s`,
      id: result.id,
      artist: result.artist,
      title: result.title,
      duration: result.duration,
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
    const startTime = performance.now();
    console.log(`[LRCLib API] 📡 LRCLib API 직접 호출 (시작: ${startTime.toFixed(0)}ms)`);
    console.log(`[LRCLib API]   Artist: "${artistParam}"`);
    console.log(`[LRCLib API]   Title: "${titleParam}"`);
    console.log(`[LRCLib API]   Duration: ${durationSeconds}s`);

    const searchEndpoint = `https://lrclib.net/api/search?artist_name=${encodeURIComponent(
      artistParam,
    )}&track_name=${encodeURIComponent(titleParam)}`;

    console.log(`[LRCLib API] ⏱️ 검색 API 호출 시작 (${(performance.now() - startTime).toFixed(0)}ms)`);
    let searchRes: Response;
    try {
      searchRes = await fetchWithTimeout(searchEndpoint, {}, LRCLIB_TIMEOUT_MS);
      console.log(
        `[LRCLib API] ✅ 검색 API 응답 받음 (소요: ${(performance.now() - startTime).toFixed(0)}ms, 상태: ${searchRes.status})`,
      );
    } catch (error) {
      console.error(`[LRCLib API] ❌ 검색 API 실패 (소요: ${(performance.now() - startTime).toFixed(0)}ms)`);
      throw LyricsError.fromNetworkError(error as Error, { endpoint: searchEndpoint });
    }

    if (!searchRes.ok) {
      console.warn(`Search API response not OK, status: ${searchRes.status}`);
      throw LyricsError.fromHttpStatus(searchRes.status, { endpoint: searchEndpoint });
    }

    console.log(`[LRCLib API] ⏱️ JSON 파싱 시작 (${(performance.now() - startTime).toFixed(0)}ms)`);
    let searchData: SearchCandidate[];
    try {
      searchData = await searchRes.json();
      console.log(
        `[LRCLib API] ✅ JSON 파싱 완료 (소요: ${(performance.now() - startTime).toFixed(0)}ms, 후보: ${searchData.length}개)`,
      );
    } catch (error) {
      throw new LyricsError(LyricsErrorCode.INVALID_RESPONSE, `Invalid JSON response: ${error}`, {
        endpoint: searchEndpoint,
      });
    }

    if (!Array.isArray(searchData) || searchData.length === 0) {
      throw new LyricsError(LyricsErrorCode.EMPTY_SEARCH_RESULTS, undefined, { artistParam, titleParam });
    }

    const limitedCandidates = searchData.slice(0, 10);
    console.log(
      `[LRCLib API] ⏱️ Detail API 순차 호출 시작 (조기 종료 방식) (${(performance.now() - startTime).toFixed(0)}ms, 최대: ${limitedCandidates.length}개)`,
    );

    const normalizedReqTitle = titleParam.trim().toLowerCase();

    // Plain 가사 제외: Synced 가사만 사용
    let fallbackSynced: LrcLibLyricsResult | null = null;

    // 🚀 순차 처리 + 진짜 조기 종료 (Perfect Match 발견 시 즉시 중단)
    let checkedCount = 0;
    for (const candidate of limitedCandidates) {
      checkedCount++;
      console.log(
        `[LRCLib API] ⏱️ Detail API 호출 중 (${checkedCount}/${limitedCandidates.length}) - ID: ${candidate.id} (${(performance.now() - startTime).toFixed(0)}ms)`,
      );

      try {
        const detailRes = await fetchWithTimeout(
          `${endpoint}/${candidate.id}?duration=${encodeURIComponent(durationSeconds)}`,
          {},
          LRCLIB_TIMEOUT_MS,
        );
        if (!detailRes.ok) {
          console.warn(`Detail API response not OK for candidate id ${candidate.id}, status: ${detailRes.status}`);
          continue;
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
          continue;
        }

        // 🚀 Plain 가사 완전 제외: Synced 가사만 사용
        const lyrics = detail.syncedLyrics;
        if (!lyrics) {
          console.log(`[LRCLib API] ⚠️ 후보 ${checkedCount}: Synced 가사 없음, 다음 후보 검색`);
          continue;
        }

        // 가사가 비어있는지 확인
        if (typeof lyrics === 'string' && lyrics.trim().length === 0) {
          console.log(`[LRCLib API] ⚠️ 후보 ${checkedCount}: 빈 Synced 가사, 다음 후보 검색`);
          continue;
        }
        if (Array.isArray(lyrics) && lyrics.length === 0) {
          console.log(`[LRCLib API] ⚠️ 후보 ${checkedCount}: 빈 Synced 가사 배열, 다음 후보 검색`);
          continue;
        }

        // 🔍 Duration 검증 로그
        const responseDuration = detail.duration ?? 0;
        const durationDiff = Math.abs(durationSeconds - responseDuration);
        console.log(
          `[LRCLib API] 📊 Duration 검증 - 후보 ${candidate.id}: 요청=${durationSeconds}s, 응답=${responseDuration}s, 차이=${durationDiff.toFixed(1)}s ${durationDiff > 2 ? '❌ (>2초)' : '✅ (≤2초)'}`,
        );

        // Duration이 2초 초과 차이나면 스킵
        if (durationDiff > 2) {
          console.log(
            `[LRCLib API] ⚠️ 후보 ${checkedCount}: Duration 차이 ${durationDiff.toFixed(1)}s 초과, 다음 후보 검색`,
          );
          continue;
        }

        const candidateTitle = (detail.trackName ?? '').trim().toLowerCase();
        const isStrictMatch = candidateTitle === normalizedReqTitle;

        const result: LrcLibLyricsResult = {
          lyrics,
          duration: detail.duration,
          artist: detail.artistName,
          title: detail.trackName,
          id: candidate.id,
        };

        // 🎯 조기 종료: Strict Match + Duration 1초 이내면 즉시 반환
        if (isStrictMatch && durationDiff <= 1) {
          console.log(
            `[LRCLib API] 🎯 조기 종료! Perfect Match 발견 (${checkedCount}/${limitedCandidates.length}번째, Title 일치 + Duration ${durationDiff.toFixed(1)}s, 총 소요: ${(performance.now() - startTime).toFixed(0)}ms)`,
          );
          console.log(
            `[LRCLib Search] ✅ ${_attemptNumber}차 시도 성공 (Strict Synced, 총 소요: ${(performance.now() - startTime).toFixed(0)}ms): ${result.artist} - ${result.title}`,
          );
          return result;
        }

        // Fallback 저장 (Strict Match는 아니지만 Duration 일치)
        if (!fallbackSynced) {
          fallbackSynced = result;
          console.log(`[LRCLib API] 💾 Fallback 저장 (${checkedCount}번째, Duration ${durationDiff.toFixed(1)}s)`);
        }
      } catch (err) {
        console.error(`Error fetching lyric detail ${candidate.id}:`, err);
        continue;
      }
    }

    console.log(
      `[LRCLib API] ✅ Detail API 순차 호출 완료 (소요: ${(performance.now() - startTime).toFixed(0)}ms, 검사: ${checkedCount}/${limitedCandidates.length}개)`,
    );

    // Perfect Match 못 찾았지만 Fallback 있으면 반환
    if (fallbackSynced) {
      console.log(
        `[LRCLib Search] ✅ ${_attemptNumber}차 시도 성공 (Fallback Synced, 총 소요: ${(performance.now() - startTime).toFixed(0)}ms): ${fallbackSynced.artist} - ${fallbackSynced.title}`,
      );
      return fallbackSynced;
    }

    // 아무것도 못 찾음
    console.log('No synced lyrics found');
    return null;
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
  const { isEnglishText } = await import('@lib/utils/lyrics/parsers/stringUtils');
  const isNonEnglishTitle = !isEnglishText(title);

  if (isNonEnglishTitle) {
    // 비영어 타이틀: Spotify 우선
    try {
      console.log('[Spotify] 비영어 타이틀 감지, Spotify 검색 시도');
      const { searchSpotifyTrack } = await import('./spotify');
      const spotifyResult = await searchSpotifyTrack(artist, title);

      if (spotifyResult) {
        console.log(`[Spotify] 영문명 발견: ${spotifyResult.artist} - ${spotifyResult.name}`);

        // Spotify에서 받은 영문명으로 LRCLib 재검색
        try {
          const retryResult = await searchWithParams(spotifyResult.artist, spotifyResult.name, 3, durationSeconds);
          if (retryResult !== null) {
            console.log(`[LRCLib Search] ✅ 3차 시도 성공 (Spotify): ${spotifyResult.artist} - ${spotifyResult.name}`);
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

  // 4차 시도: LRCLib FreeText 검색 (q 파라미터) - artist+title 통합 검색
  try {
    const lrclibFreeTextQuery = `${artist} ${title}`;
    console.log(`[LRCLib FreeText] 통합 검색 시도: "${lrclibFreeTextQuery}"`);
    const lrclibFreeTextEndpoint = `https://lrclib.net/api/search?q=${encodeURIComponent(lrclibFreeTextQuery)}`;
    const lrclibFreeTextRes = await fetchWithTimeout(lrclibFreeTextEndpoint, {}, LRCLIB_TIMEOUT_MS);

    if (lrclibFreeTextRes.ok) {
      const lrclibFreeTextData: SearchCandidate[] = await lrclibFreeTextRes.json();
      if (Array.isArray(lrclibFreeTextData) && lrclibFreeTextData.length > 0) {
        console.log(`[LRCLib FreeText] 통합 검색 결과: ${lrclibFreeTextData.length}개 발견`);

        // 검색 결과 중에서 가사 가져오기 (기존 로직 재사용)
        const limitedCandidates = lrclibFreeTextData.slice(0, 10);

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
              console.log(
                `[LRCLib Search] ✅ 4차 시도 성공 (LRCLib FreeText): ${detail.artistName} - ${detail.trackName}`,
              );
              return {
                lyrics,
                duration: detail.duration,
                artist: detail.artistName,
                title: detail.trackName,
                id: candidate.id,
              };
            }
          } catch (err) {
            console.warn(`[LRCLib FreeText] 결과 처리 실패 (id: ${candidate.id}):`, err);
            continue;
          }
        }
      }
    }
  } catch (error) {
    console.warn('[LRCLib FreeText] 통합 검색 실패:', error);
  }

  // 5차 시도: MusicBrainz FreeText Artist 검색 → 영문 alias 추출 → LRCLib 재검색
  try {
    console.log(`[MusicBrainz FreeText] 아티스트 검색 시도: "${artist}"`);
    const { searchArtistByFreeText, extractEnglishAliasFromArtists } = await import('./musicBrainz');
    const mbFreeTextCandidates = await searchArtistByFreeText(artist);

    if (mbFreeTextCandidates && mbFreeTextCandidates.length > 0) {
      const extractedAlias = extractEnglishAliasFromArtists(mbFreeTextCandidates);
      if (extractedAlias && extractedAlias !== artist) {
        console.log(`[MusicBrainz FreeText] 영문 alias 발견: "${artist}" → "${extractedAlias}"`);
        const mbFreeTextResult = await searchWithParams(extractedAlias, title, 5, durationSeconds);
        if (mbFreeTextResult !== null) {
          console.log(`[MusicBrainz FreeText] 성공: ${extractedAlias} - ${title}`);
          return mbFreeTextResult;
        }
      }
    }
  } catch (error) {
    console.warn('[MusicBrainz FreeText] 검색 실패:', error);
  }

  // 6차 시도: 영어 타이틀이었는데 모든 시도 실패한 경우 Spotify 시도
  if (!isNonEnglishTitle) {
    try {
      console.log('[Spotify] 영어 타이틀이지만 모든 시도 실패, Spotify 검색 시도');
      const { searchSpotifyTrack } = await import('./spotify');
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

  // 모든 LRCLib 검색 실패
  return null;
}
