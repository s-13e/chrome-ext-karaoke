import { Line } from '@lib/types/lyrics';
import { LyricsError, LyricsErrorCode } from '@lib/types/lyricsError';
import { isRomanizedLyrics } from '@lib/utils/lyrics/validators/romanizationDetector';

export interface LrcLibLyricsResult {
  lyrics: string | Line[];
  duration?: number;
  artist?: string;
  title?: string;
  id?: string | number;
  etag?: string;
}

/**
 * LRCLib Search API 응답 항목 타입
 */
interface LrcLibSearchResultItem {
  id: number;
  trackName: string;
  artistName: string;
  duration: number;
  syncedLyrics?: string | null;
  plainLyrics?: string | null;
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
 * YouTube videoId로 가사 직접 조회 (통합 엔드포인트, 최고속)
 * - videoId → lrclibId → 가사를 서버 내부에서 한 번에 처리
 * - 네트워크 왕복 1회로 단축
 */
export async function fetchYouTubeLyrics(videoId: string): Promise<LrcLibLyricsResult | null> {
  try {
    console.log(`[fetchYouTubeLyrics] 통합 엔드포인트 호출: ${videoId}`);

    const response = await fetchWithTimeout(
      `${API_SERVER_URL}/api/v1/youtube/lyrics/${encodeURIComponent(videoId)}`,
      {},
      CACHE_TIMEOUT_MS,
    );

    if (response.ok) {
      const responseData = await response.json();
      const data = responseData?.data;

      if (!data) {
        console.error('[fetchYouTubeLyrics] 응답 데이터 없음');
        return null;
      }

      const result = {
        lyrics: data.syncedLyrics || data.plainLyrics,
        duration: data.duration,
        artist: data.artistName,
        title: data.trackName,
        id: String(data.lrclibId),
      };

      if (!result.lyrics) {
        console.error('[fetchYouTubeLyrics] 가사 데이터 없음');
        return null;
      }

      console.log(`[fetchYouTubeLyrics] ✅ 가사 조회 성공 (길이: ${result.lyrics.length}자)`);
      return result;
    }

    if (response.status === 404) {
      console.log('[fetchYouTubeLyrics] videoId 매핑 없음 (캐시 미스)');
      return null;
    }

    console.warn(`[fetchYouTubeLyrics] API 응답 실패: ${response.status}`);
    return null;
  } catch (error) {
    console.error('[fetchYouTubeLyrics] 조회 실패:', error);
    return null;
  }
}

/**
 * LRCLib ID로 가사 조회 (API 서버 프록시 사용)
 */
export async function fetchLyricsById(lrclibId: number): Promise<LrcLibLyricsResult | null> {
  try {
    console.log(`[fetchLyricsById] API 서버 호출 시작: ${lrclibId}`);

    // API 서버를 통한 프록시 호출 (캐싱 + 빠른 응답)
    const lyricsRes = await fetchWithTimeout(
      `${API_SERVER_URL}/api/v1/lrclib/lyrics/${lrclibId}`,
      {},
      CACHE_TIMEOUT_MS,
    );

    console.log(`[fetchLyricsById] API 응답 상태: ${lyricsRes.status}`);

    if (lyricsRes.ok) {
      const lyricsData = await lyricsRes.json();
      console.log('[fetchLyricsById] 원본 응답:', JSON.stringify(lyricsData).substring(0, 200));

      const data = lyricsData?.data || lyricsData;
      console.log('[fetchLyricsById] 파싱된 data:', {
        hasSyncedLyrics: !!data.syncedLyrics,
        hasPlainLyrics: !!data.plainLyrics,
        duration: data.duration,
        artistName: data.artistName,
        trackName: data.trackName,
      });

      const result = {
        lyrics: data.syncedLyrics || data.plainLyrics,
        duration: data.duration,
        artist: data.artistName,
        title: data.trackName,
        id: String(lrclibId),
      };

      if (!result.lyrics) {
        console.error('[fetchLyricsById] ❌ 가사 데이터 없음!');
        return null;
      }

      console.log(`[fetchLyricsById] ✅ 가사 조회 성공 (길이: ${result.lyrics.length}자)`);
      return result;
    }

    console.warn(`[fetchLyricsById] API 응답 실패: ${lyricsRes.status}`);
    return null;
  } catch (error) {
    console.error('[fetchLyricsById] 조회 실패:', error);
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
        const status = ytCachedData?.status;

        // Negative cache 체크: 이전에 가사를 찾지 못한 영상
        if (status === 'not_found') {
          console.log(`[LRCLib] ⚠️ YouTube videoId Negative Cache 히트: ${videoId} (이전 검색 실패)`);
          throw new LyricsError(LyricsErrorCode.LRCLIB_NOT_FOUND, '가사를 찾을 수 없습니다 (캐시됨)', {
            videoId,
            cached: true,
          });
        }

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
      // Negative cache에서 LyricsError 던진 경우 상위로 전파
      if (error instanceof LyricsError) {
        throw error;
      }
      // 기타 YouTube videoId 캐시 실패는 다음 단계로 진행
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
  const result = await fetchLyricsWithEndpoint(artist, title, durationSeconds);

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
    let searchData: LrcLibSearchResultItem[];
    try {
      searchData = await searchRes.json();
      console.log(
        `[LRCLib API] ✅ JSON 파싱 완료 (소요: ${(performance.now() - startTime).toFixed(0)}ms, 후보: ${searchData.length}개)`,
      );
      console.log(`[LRCLib API] 📦 검색 API 응답 상세 (처음 5개):`);
      searchData.slice(0, 5).forEach((item: LrcLibSearchResultItem, idx: number) => {
        console.log(`  후보 ${idx + 1}:`, {
          id: item.id,
          trackName: item.trackName,
          artistName: item.artistName,
          duration: item.duration,
          hasSyncedLyrics: 'syncedLyrics' in item,
          syncedLyricsType:
            item.syncedLyrics === undefined
              ? 'undefined'
              : item.syncedLyrics === null
                ? 'null'
                : typeof item.syncedLyrics,
          syncedLyricsLength: item.syncedLyrics ? item.syncedLyrics.length : 0,
          hasPlainLyrics: 'plainLyrics' in item,
          plainLyricsLength: item.plainLyrics ? item.plainLyrics.length : 0,
        });
      });
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
      `[LRCLib API] ⏱️ Search 결과 처리 시작 (${(performance.now() - startTime).toFixed(0)}ms, 후보: ${limitedCandidates.length}개)`,
    );

    const normalizedReqTitle = titleParam.trim().toLowerCase();

    // 🚀 Search API 응답 직접 사용 (Detail API 호출 제거)
    let perfectMatch: LrcLibLyricsResult | null = null;
    let fallbackSynced: LrcLibLyricsResult | null = null;
    let closestCandidate: { result: LrcLibLyricsResult; durationDiff: number } | null = null;

    for (const [index, candidate] of limitedCandidates.entries()) {
      try {
        // Search API 응답에서 직접 가사 데이터 추출
        const lyrics = candidate.syncedLyrics;
        if (!lyrics) {
          console.log(`[LRCLib API] ⚠️ 후보 ${index + 1}: Synced 가사 없음`);
          continue;
        }

        // 가사가 비어있는지 확인
        if (typeof lyrics === 'string' && lyrics.trim().length === 0) {
          console.log(`[LRCLib API] ⚠️ 후보 ${index + 1}: 빈 Synced 가사`);
          continue;
        }
        if (Array.isArray(lyrics) && lyrics.length === 0) {
          console.log(`[LRCLib API] ⚠️ 후보 ${index + 1}: 빈 Synced 가사 배열`);
          continue;
        }

        // 🔍 Duration 검증
        const responseDuration = candidate.duration ?? 0;
        const durationDiff = Math.abs(durationSeconds - responseDuration);
        console.log(
          `[LRCLib API] 📊 후보 ${index + 1} (ID: ${candidate.id}): Duration ${durationDiff.toFixed(1)}s 차이 ${durationDiff > 2 ? '❌' : '✅'}`,
        );

        // 🚫 로마자 표기 가사 필터링 (duration 체크 전에 수행)
        if (isRomanizedLyrics(lyrics)) {
          console.log(`[LRCLib API] ⚠️ 후보 ${index + 1}: 로마자 표기 가사, 스킵`);
          continue;
        }

        const candidateTitle = (candidate.trackName ?? '').trim().toLowerCase();
        const isStrictMatch = candidateTitle === normalizedReqTitle;

        const result: LrcLibLyricsResult = {
          lyrics,
          duration: candidate.duration,
          artist: candidate.artistName,
          title: candidate.trackName,
          id: candidate.id,
        };

        // Duration 차이가 2초 초과인 경우, 최근접 후보로 추적만 하고 스킵
        if (durationDiff > 2) {
          console.log(`[LRCLib API] ⚠️ 후보 ${index + 1}: Duration 차이 초과, 최근접 후보로 저장`);
          if (!closestCandidate || durationDiff < closestCandidate.durationDiff) {
            closestCandidate = { result, durationDiff };
          }
          continue;
        }

        // 🎯 Perfect Match 발견 시 즉시 반환
        if (isStrictMatch && durationDiff <= 1) {
          console.log(
            `[LRCLib API] 🎯 Perfect Match 발견! 후보 ${index + 1}/${limitedCandidates.length} (${(performance.now() - startTime).toFixed(0)}ms)`,
          );
          perfectMatch = result;
          break;
        }

        // Fallback 후보로 저장 (첫 번째만)
        if (!fallbackSynced) {
          console.log(`[LRCLib API] 💾 Fallback 후보 ${index + 1} (Duration ${durationDiff.toFixed(1)}s)`);
          fallbackSynced = result;
        }
      } catch (candidateError) {
        // 개별 후보 처리 실패 시 다음 후보로 진행
        console.warn(
          `[LRCLib API] ❌ 후보 ${index + 1} (ID: ${candidate.id}) 처리 실패, 다음 후보 시도:`,
          candidateError,
        );
        continue;
      }
    }

    console.log(
      `[LRCLib API] ✅ Search 결과 처리 완료 (소요: ${(performance.now() - startTime).toFixed(0)}ms, 검사: ${limitedCandidates.length}개)`,
    );

    // Perfect Match 우선, 없으면 Fallback 반환, 최종적으로 최근접 후보 반환
    if (perfectMatch) {
      console.log(
        `[LRCLib Search] ✅ ${_attemptNumber}차 시도 성공 (Perfect Match, 총 소요: ${(performance.now() - startTime).toFixed(0)}ms): ${perfectMatch.artist} - ${perfectMatch.title}`,
      );
      return perfectMatch;
    }

    if (fallbackSynced) {
      console.log(
        `[LRCLib Search] ✅ ${_attemptNumber}차 시도 성공 (Fallback Synced, 총 소요: ${(performance.now() - startTime).toFixed(0)}ms): ${fallbackSynced.artist} - ${fallbackSynced.title}`,
      );
      return fallbackSynced;
    }

    // 2초 이내 후보가 없었지만, 최근접 후보가 있으면 반환
    if (closestCandidate) {
      console.log(
        `[LRCLib Search] ⚠️ ${_attemptNumber}차 시도 성공 (최근접 후보, Duration ${closestCandidate.durationDiff.toFixed(1)}s 차이, 총 소요: ${(performance.now() - startTime).toFixed(0)}ms): ${closestCandidate.result.artist} - ${closestCandidate.result.title}`,
      );
      return closestCandidate.result;
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
      const lrclibFreeTextData: LrcLibSearchResultItem[] = await lrclibFreeTextRes.json();
      if (Array.isArray(lrclibFreeTextData) && lrclibFreeTextData.length > 0) {
        console.log(`[LRCLib FreeText] 통합 검색 결과: ${lrclibFreeTextData.length}개 발견`);

        // Search API 응답에서 직접 가사 추출 (Detail API 호출 제거)
        const limitedCandidates = lrclibFreeTextData.slice(0, 10);

        // Duration 우선순위별 후보 저장
        let exactMatch: (typeof limitedCandidates)[0] | null = null;
        let closeMatch: (typeof limitedCandidates)[0] | null = null;

        for (const candidate of limitedCandidates) {
          const lyrics = candidate.syncedLyrics || candidate.plainLyrics;
          if (!lyrics) continue;

          // 🚫 로마자 표기 가사 필터링
          if (isRomanizedLyrics(lyrics)) {
            console.log(
              `[LRCLib FreeText] ⚠️ 후보 스킵 (로마자 표기): ${candidate.artistName} - ${candidate.trackName}`,
            );
            continue;
          }

          // 🔍 타이틀 매칭 검증 (FreeText 검색은 관련 없는 곡도 반환할 수 있음)
          const candidateTitle = (candidate.trackName ?? '').trim().toLowerCase();
          const searchTitle = title.trim().toLowerCase();
          const titleMatch =
            candidateTitle.includes(searchTitle) ||
            searchTitle.includes(candidateTitle) ||
            candidateTitle === searchTitle;

          if (!titleMatch) {
            console.log(`[LRCLib FreeText] ⚠️ 후보 스킵 (타이틀 불일치): "${candidate.trackName}" vs "${title}"`);
            continue;
          }

          // Duration 체크 - 우선순위: 정확히 일치 > ±1초 > ±2초
          if (candidate.duration) {
            const durationDiff = Math.abs(durationSeconds - candidate.duration);

            if (durationDiff === 0) {
              // 정확히 일치하는 경우 즉시 반환
              console.log(
                `[LRCLib Search] ✅ 4차 시도 성공 (LRCLib FreeText, 정확히 일치): ${candidate.artistName} - ${candidate.trackName}`,
              );
              return {
                lyrics: lyrics || '',
                duration: candidate.duration,
                artist: candidate.artistName,
                title: candidate.trackName,
                id: candidate.id,
              };
            } else if (durationDiff <= 1 && !exactMatch) {
              // ±1초 이내 (정확한 일치 다음 우선순위)
              exactMatch = candidate;
            } else if (durationDiff <= 2 && !closeMatch) {
              // ±2초 이내 (가장 낮은 우선순위)
              closeMatch = candidate;
            }
          }
        }

        // 정확히 일치하는 항목이 없으면 우선순위에 따라 반환
        const selectedCandidate = exactMatch || closeMatch;
        if (selectedCandidate) {
          const lyrics = selectedCandidate.syncedLyrics || selectedCandidate.plainLyrics;
          const durationDiff = Math.abs(durationSeconds - selectedCandidate.duration);
          console.log(
            `[LRCLib Search] ✅ 4차 시도 성공 (LRCLib FreeText, ±${durationDiff}초): ${selectedCandidate.artistName} - ${selectedCandidate.trackName}`,
          );
          return {
            lyrics: lyrics || '',
            duration: selectedCandidate.duration,
            artist: selectedCandidate.artistName,
            title: selectedCandidate.trackName,
            id: selectedCandidate.id,
          };
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
