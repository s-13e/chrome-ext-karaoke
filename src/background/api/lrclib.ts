import { Line } from '@lib/types/lyrics';
import { LyricsError, LyricsErrorCode } from '@lib/types/lyricsError';
import { validateLyrics, cleanLyrics } from '@lib/utils/lyrics/validators';

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
const CACHE_TIMEOUT_MS = 3000; // API 서버 캐시 (Redis 전용): 3초
const LYRICS_PROXY_TIMEOUT_MS = 8000; // API 서버 프록시 (서버→LRCLib 외부 호출 포함): 8초
const LRCLIB_TIMEOUT_MS = 10000; // LRCLib API 직접 호출: 10초

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

/** 서버 오프셋 캐시 조회 결과 */
export interface ServerOffsetResult {
  offset: number;
  lineAdjustments?: Record<number, number>;
  lyricsLineCount?: number;
}

/**
 * 서버 오프셋 캐시 조회
 * - videoId에 대한 서버 저장 오프셋(초) + 구간 보정을 반환
 * - 없으면 null 반환
 */
export async function fetchServerOffset(videoId: string): Promise<ServerOffsetResult | null> {
  try {
    const res = await fetchWithTimeout(
      `${API_SERVER_URL}/api/v1/youtube/offset/${encodeURIComponent(videoId)}`,
      {},
      CACHE_TIMEOUT_MS,
    );

    if (res.ok) {
      const data = await res.json();
      const offset = data?.offset;

      if (typeof offset === 'number') {
        const result: ServerOffsetResult = { offset };
        if (data.lineAdjustments && typeof data.lineAdjustments === 'object') {
          // 서버에서 string key로 전달됨 → number key로 변환
          const converted: Record<number, number> = {};
          for (const [key, val] of Object.entries(data.lineAdjustments)) {
            if (typeof val === 'number') {
              converted[Number(key)] = val;
            }
          }
          if (Object.keys(converted).length > 0) {
            result.lineAdjustments = converted;
          }
        }
        if (typeof data.lyricsLineCount === 'number') {
          result.lyricsLineCount = data.lyricsLineCount;
        }
        return result;
      }
    }
    return null;
  } catch (error) {
    console.warn('[fetchServerOffset] 조회 실패:', error);
    return null;
  }
}

/**
 * YouTube videoId로 가사 직접 조회 (통합 엔드포인트, 최고속)
 * - videoId → lrclibId → 가사를 서버 내부에서 한 번에 처리
 * - 네트워크 왕복 1회로 단축
 * - 캐시에서 조회한 가사도 validation/cleaning 적용
 * - 타임아웃/네트워크 에러 시 1회 자체 재시도 후 LyricsError throw
 */
export async function fetchYouTubeLyrics(videoId: string): Promise<LrcLibLyricsResult | null> {
  try {
    console.log(`[fetchYouTubeLyrics] 통합 엔드포인트 호출: ${videoId}`);

    const response = await fetchWithTimeout(
      `${API_SERVER_URL}/api/v1/youtube/lyrics/${encodeURIComponent(videoId)}`,
      {},
      LYRICS_PROXY_TIMEOUT_MS,
    );

    if (response.ok) {
      const responseData = await response.json();
      const data = responseData?.data;

      if (!data) {
        console.error('[fetchYouTubeLyrics] 응답 데이터 없음');
        return null;
      }

      let lyrics = data.syncedLyrics || data.plainLyrics;

      if (!lyrics) {
        console.error('[fetchYouTubeLyrics] 가사 데이터 없음');
        return null;
      }

      // 가사 유효성 검증 및 정제 (캐시된 가사도 검증 필요)
      const validation = validateLyrics(lyrics);
      if (validation.issues.includes('romanized')) {
        console.warn('[fetchYouTubeLyrics] 로마자 표기 가사, 반환하지만 경고');
      }
      if (validation.cleanable) {
        lyrics = cleanLyrics(lyrics, validation.issues);
        console.log(
          `[fetchYouTubeLyrics] 가사 정제 완료 (${validation.issues.filter((i) => i !== 'none').join(', ')})`,
        );
      }

      const result = {
        lyrics,
        duration: data.duration,
        artist: data.artistName,
        title: data.trackName,
        id: String(data.lrclibId),
      };

      console.log(`[fetchYouTubeLyrics] 가사 조회 성공 (길이: ${result.lyrics.length}자)`);
      return result;
    }

    if (response.status === 404) {
      console.log('[fetchYouTubeLyrics] videoId 매핑 없음 (캐시 미스)');
      return null;
    }

    console.warn(`[fetchYouTubeLyrics] API 응답 실패: ${response.status}`);
    return null;
  } catch (error) {
    // 타임아웃/네트워크 에러: content script에서 재시도하므로 구조화된 에러로 throw
    console.error('[fetchYouTubeLyrics] 조회 실패:', error);
    throw LyricsError.fromNetworkError(error instanceof Error ? error : new Error(String(error)), {
      videoId,
    });
  }
}

/**
 * LRCLib ID로 가사 조회 (API 서버 프록시 사용)
 * 캐시에서 조회한 가사도 validation/cleaning 적용
 */
export async function fetchLyricsById(lrclibId: number): Promise<LrcLibLyricsResult | null> {
  try {
    console.log(`[fetchLyricsById] API 서버 호출 시작: ${lrclibId}`);

    // API 서버를 통한 프록시 호출 (서버→LRCLib 외부 호출 포함)
    const lyricsRes = await fetchWithTimeout(
      `${API_SERVER_URL}/api/v1/lrclib/lyrics/${lrclibId}`,
      {},
      LYRICS_PROXY_TIMEOUT_MS,
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

      let lyrics = data.syncedLyrics || data.plainLyrics;

      if (!lyrics) {
        console.error('[fetchLyricsById] ❌ 가사 데이터 없음!');
        return null;
      }

      // 🔍 가사 유효성 검증 및 정제 (캐시된 가사도 검증 필요)
      const validation = validateLyrics(lyrics);
      if (validation.issues.includes('romanized')) {
        console.warn('[fetchLyricsById] ⚠️ 로마자 표기 가사, 반환하지만 경고');
      }
      if (validation.cleanable) {
        lyrics = cleanLyrics(lyrics, validation.issues);
        console.log(
          `[fetchLyricsById] 🧹 가사 정제 완료 (${validation.issues.filter((i) => i !== 'none').join(', ')})`,
        );
      }

      const result = {
        lyrics,
        duration: data.duration,
        artist: data.artistName,
        title: data.trackName,
        id: String(lrclibId),
      };

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

// ===== 통합 스코어링 시스템 =====

/** 검색 출처 태그 */
type CandidateSource = 'forward' | 'swap' | 'freetext';

/** 스코어링된 후보 */
interface ScoredCandidate {
  result: LrcLibLyricsResult;
  score: number;
  source: CandidateSource;
}

/** 출처별 가중치 (정방향 > 역방향 > FreeText) */
const SOURCE_SCORE: Record<CandidateSource, number> = {
  forward: 10,
  swap: 5,
  freetext: 0,
};

/**
 * 단일 후보의 매칭 점수 계산
 * 점수 구성: 타이틀 일치도(30) + Duration 정확도(30) + 출처 가중치(10) + 가사 품질(10)
 * 최고 점수: 80 (정방향 + 타이틀 정확 + Duration 0초 + synced)
 */
function calculateCandidateScore(
  candidate: LrcLibSearchResultItem,
  source: CandidateSource,
  requestTitle: string,
  durationSeconds: number,
): number {
  const candidateTitle = (candidate.trackName ?? '').trim().toLowerCase();
  const searchTitle = requestTitle.trim().toLowerCase();

  // 타이틀 일치도
  const isExactMatch = candidateTitle === searchTitle;
  const isPartialMatch = candidateTitle.includes(searchTitle) || searchTitle.includes(candidateTitle);

  let titleScore: number;
  if (isExactMatch) {
    titleScore = 30;
  } else if (isPartialMatch) {
    titleScore = 10;
  } else if (source === 'freetext') {
    // FreeText는 타이틀 불일치 시 제외 (관련 없는 곡 반환 방지)
    return -Infinity;
  } else {
    // 정방향/역방향은 LRCLib이 track_name으로 필터링하므로 낮은 점수 부여
    titleScore = 0;
  }

  // Duration 정확도 (차이가 클수록 감점, >2초 구간도 세분화)
  const durationDiff = Math.abs(durationSeconds - (candidate.duration ?? 0));
  let durationScore: number;
  if (durationDiff === 0) {
    durationScore = 30;
  } else if (durationDiff <= 1) {
    durationScore = 20;
  } else if (durationDiff <= 2) {
    durationScore = 10;
  } else {
    // >2초: 기본 -20에서 초당 -1씩 추가 감점 (6초=-26, 8초=-28)
    durationScore = -20 - Math.floor(durationDiff);
  }

  // 출처 가중치 + 가사 품질
  return titleScore + durationScore + SOURCE_SCORE[source] + (candidate.syncedLyrics ? 10 : 0);
}

// 메인 엔트리: 캐시 우선, 없을 때 get fallback
export async function fetchLyricsByArtistAndTrack(
  artist: string,
  title: string,
  durationSeconds: number,
  videoId?: string, // YouTube videoId (optional, 최고속 캐시용)
  skipSwap: boolean = false, // true면 artist/title 순서 뒤집기 시도 스킵
  skipVideoIdCacheRead: boolean = false, // true면 Stage 0 videoId 캐시 조회 스킵 (content script에서 이미 확인한 경우)
): Promise<LrcLibLyricsResult> {
  if (!artist?.trim() || !title?.trim()) {
    throw new LyricsError(LyricsErrorCode.ARTIST_TITLE_EXTRACT_FAILED, undefined, { artist, title });
  }

  if (durationSeconds <= 0) {
    throw new LyricsError(LyricsErrorCode.INVALID_VIDEO_DURATION, undefined, { durationSeconds });
  }

  // 0. [최우선] YouTube videoId → LRCLib ID 직접 매핑 캐시 확인 (가장 빠른 경로)
  // skipVideoIdCacheRead=true인 경우: content script에서 이미 캐시 MISS 확인했으므로 중복 요청 스킵
  if (videoId && !skipVideoIdCacheRead) {
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
            let lyrics = lyricsData.syncedLyrics || lyricsData.plainLyrics;

            // 🔍 가사 유효성 검증 및 정제 (캐시된 가사도 검증 필요)
            if (lyrics) {
              const validation = validateLyrics(lyrics);
              if (validation.issues.includes('romanized')) {
                console.warn('[LRCLib] ⚠️ YouTube 캐시 가사: 로마자 표기, 반환하지만 경고');
              }
              if (validation.cleanable) {
                lyrics = cleanLyrics(lyrics, validation.issues);
                console.log(
                  `[LRCLib] 🧹 YouTube 캐시 가사 정제 완료 (${validation.issues.filter((i) => i !== 'none').join(', ')})`,
                );
              }
            }

            console.log(`[LRCLib] YouTube videoId 캐시로 가사 로드 완료 (가장 빠른 경로)`);
            return {
              lyrics,
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
          let lyrics = lyricsData.syncedLyrics || lyricsData.plainLyrics;

          // 🔍 가사 유효성 검증 및 정제 (캐시된 가사도 검증 필요)
          if (lyrics) {
            const validation = validateLyrics(lyrics);
            if (validation.issues.includes('romanized')) {
              console.warn('[LRCLib API] ⚠️ Redis 캐시 가사: 로마자 표기, 반환하지만 경고');
            }
            if (validation.cleanable) {
              lyrics = cleanLyrics(lyrics, validation.issues);
              console.log(
                `[LRCLib API] 🧹 Redis 캐시 가사 정제 완료 (${validation.issues.filter((i) => i !== 'none').join(', ')})`,
              );
            }
          }

          const result = {
            lyrics,
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
  const result = await fetchLyricsWithEndpoint(artist, title, durationSeconds, skipSwap);

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

  // 1. artist+title+duration → lrclibId 캐시 저장 (duration 검증 필수 — 캐시 키에 duration 포함)
  if (isValidId && hasArtist && hasTitle && isDurationValid && result.artist && result.title) {
    const cacheKeyLrcArtist = result.artist.toLowerCase();
    const cacheKeyLrcTitle = result.title.toLowerCase();

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
  } else {
    console.warn('[LRCLib API] artist+title+duration 캐시 저장 스킵:', {
      isValidId,
      hasArtist,
      hasTitle,
      isDurationValid,
      durationDiff: durationDiff === Infinity ? 'N/A' : `${durationDiff.toFixed(1)}s`,
    });
  }

  // 2. YouTube videoId → lrclibId 직접 매핑 저장 (duration 무관 — videoId는 고유 키)
  if (isValidId && hasArtist && hasTitle && videoId && result.artist && result.title) {
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
  } else if (!isValidId || !hasArtist || !hasTitle) {
    console.warn('[LRCLib API] 매핑 저장 스킵: 유효하지 않은 데이터', {
      isValidId,
      hasArtist,
      hasTitle,
      id: result.id,
      artist: result.artist,
      title: result.title,
      duration: result.duration,
    });
  }

  return result;
}

/**
 * LRCLib 가사 검색 (병렬 실행 + 통합 스코어링)
 *
 * 그룹 A: LRCLib 직접 검색 3종 병렬 (정방향 + 역방향 + FreeText)
 * 그룹 B: 외부 API 폴백 병렬 (Spotify + MusicBrainz) — 그룹 A 전패 시에만 실행
 *
 * 모든 후보를 통합 스코어링으로 평가하여 최적 결과 선택
 */
export async function fetchLyricsWithEndpoint(
  artist: string,
  title: string,
  durationSeconds: number,
  skipSwap: boolean = false,
): Promise<LrcLibLyricsResult | null> {
  /**
   * LRCLib에서 후보를 검색하고, 검증/정제 후 스코어링하여 반환
   */
  async function fetchSearchCandidates(
    artistParam: string,
    titleParam: string,
    source: CandidateSource,
  ): Promise<ScoredCandidate[]> {
    const startTime = performance.now();
    const isFreetextSearch = source === 'freetext';
    const endpoint = isFreetextSearch
      ? `https://lrclib.net/api/search?q=${encodeURIComponent(`${artistParam} ${titleParam}`)}`
      : `https://lrclib.net/api/search?artist_name=${encodeURIComponent(artistParam)}&track_name=${encodeURIComponent(titleParam)}`;

    console.log(`[LRCLib ${source}] 📡 검색 시작 — Artist: "${artistParam}", Title: "${titleParam}"`);

    let searchRes: Response;
    try {
      searchRes = await fetchWithTimeout(endpoint, {}, LRCLIB_TIMEOUT_MS);
      console.log(
        `[LRCLib ${source}] ✅ 응답 (${(performance.now() - startTime).toFixed(0)}ms, 상태: ${searchRes.status})`,
      );
    } catch (error) {
      console.warn(`[LRCLib ${source}] ❌ 검색 실패 (${(performance.now() - startTime).toFixed(0)}ms):`, error);
      return [];
    }

    if (!searchRes.ok) {
      console.warn(`[LRCLib ${source}] 응답 실패: HTTP ${searchRes.status}`);
      return [];
    }

    let searchData: LrcLibSearchResultItem[];
    try {
      searchData = await searchRes.json();
    } catch {
      console.warn(`[LRCLib ${source}] JSON 파싱 실패`);
      return [];
    }

    if (!Array.isArray(searchData) || searchData.length === 0) {
      console.log(`[LRCLib ${source}] 검색 결과 없음`);
      return [];
    }

    console.log(`[LRCLib ${source}] 📦 후보 ${searchData.length}개 발견, 상위 10개 평가`);
    const limitedCandidates = searchData.slice(0, 10);
    const scored: ScoredCandidate[] = [];

    for (const [index, candidate] of limitedCandidates.entries()) {
      // synced 가사 확인 (FreeText는 plainLyrics도 허용)
      const lyrics = isFreetextSearch ? candidate.syncedLyrics || candidate.plainLyrics : candidate.syncedLyrics;
      if (!lyrics) continue;
      if (typeof lyrics === 'string' && lyrics.trim().length === 0) continue;
      if (Array.isArray(lyrics) && lyrics.length === 0) continue;

      // 가사 유효성 검증
      const validation = validateLyrics(lyrics);
      if (validation.issues.includes('romanized')) {
        console.log(`[LRCLib ${source}] ⚠️ 후보 ${index + 1}: 로마자 표기, 스킵`);
        continue;
      }

      let cleanedLyrics = lyrics;
      if (validation.cleanable) {
        cleanedLyrics = cleanLyrics(lyrics, validation.issues);
        console.log(
          `[LRCLib ${source}] 🧹 후보 ${index + 1}: 정제 완료 (${validation.issues.filter((i) => i !== 'none').join(', ')})`,
        );
      }

      // 스코어링
      const score = calculateCandidateScore(candidate, source, title, durationSeconds);
      if (score === -Infinity) {
        console.log(
          `[LRCLib ${source}] ⚠️ 후보 ${index + 1}: 타이틀 불일치, 스킵 ("${candidate.trackName}" vs "${title}")`,
        );
        continue;
      }

      const durationDiff = Math.abs(durationSeconds - (candidate.duration ?? 0));
      console.log(
        `[LRCLib ${source}] 📊 후보 ${index + 1} (ID: ${candidate.id}): score=${score}, duration차이=${durationDiff.toFixed(1)}s`,
      );

      scored.push({
        result: {
          lyrics: cleanedLyrics,
          duration: candidate.duration,
          artist: candidate.artistName,
          title: candidate.trackName,
          id: candidate.id,
        },
        score,
        source,
      });
    }

    console.log(
      `[LRCLib ${source}] ✅ 평가 완료 (${(performance.now() - startTime).toFixed(0)}ms, 유효 후보: ${scored.length}개)`,
    );
    return scored;
  }

  // ===== 그룹 A: LRCLib 직접 검색 (병렬) =====
  console.log('[LRCLib] 🚀 그룹 A 병렬 검색 시작 (정방향 + 역방향 + FreeText)');
  const groupAStartTime = performance.now();

  const groupASearches: Promise<ScoredCandidate[]>[] = [
    fetchSearchCandidates(artist, title, 'forward'),
    fetchSearchCandidates(artist, title, 'freetext'),
  ];

  if (!skipSwap && artist.toLowerCase() !== title.toLowerCase()) {
    groupASearches.splice(1, 0, fetchSearchCandidates(title, artist, 'swap'));
  } else if (skipSwap) {
    console.log('[LRCLib] skipSwap=true, 역방향 검색 스킵');
  }

  const groupAResults = await Promise.allSettled(groupASearches);
  const groupACandidates: ScoredCandidate[] = [];

  for (const result of groupAResults) {
    if (result.status === 'fulfilled') {
      groupACandidates.push(...result.value);
    }
  }

  console.log(
    `[LRCLib] 그룹 A 완료 (${(performance.now() - groupAStartTime).toFixed(0)}ms, 총 후보: ${groupACandidates.length}개)`,
  );

  if (groupACandidates.length > 0) {
    groupACandidates.sort((a, b) => b.score - a.score);
    const best = groupACandidates[0] as ScoredCandidate;
    console.log(
      `[LRCLib] ✅ 그룹 A 최적 후보 (source: ${best.source}, score: ${best.score}): ${best.result.artist} - ${best.result.title}`,
    );
    return best.result;
  }

  // ===== 그룹 A-2: title 내 부제목(' - ' 뒤) 제거 후 재시도 — 그룹 A 전패 시에만 실행 =====
  // 예: "Cuando No Era Cantante - Como Antes" → "Cuando No Era Cantante"
  const titleDashIndex = title.indexOf(' - ');
  if (titleDashIndex > 0) {
    const shortenedTitle = title.slice(0, titleDashIndex).trim();
    if (shortenedTitle.length > 0) {
      console.log(`[LRCLib] 🔄 부제목 제거 재시도: "${shortenedTitle}"`);
      const retryResults = await Promise.allSettled([
        fetchSearchCandidates(artist, shortenedTitle, 'forward'),
        fetchSearchCandidates(artist, shortenedTitle, 'freetext'),
      ]);

      const retryCandidates: ScoredCandidate[] = [];
      for (const result of retryResults) {
        if (result.status === 'fulfilled') {
          retryCandidates.push(...result.value);
        }
      }

      if (retryCandidates.length > 0) {
        retryCandidates.sort((a, b) => b.score - a.score);
        const best = retryCandidates[0] as ScoredCandidate;
        console.log(
          `[LRCLib] ✅ 부제목 제거 재시도 성공 (source: ${best.source}, score: ${best.score}): ${best.result.artist} - ${best.result.title}`,
        );
        return best.result;
      }

      console.log('[LRCLib] 부제목 제거 재시도도 실패');
    }
  }

  // ===== 그룹 B: 외부 API 폴백 (병렬) — 그룹 A 전패 시에만 실행 =====
  console.log('[LRCLib] ⚠️ 그룹 A 실패, 그룹 B 외부 API 폴백 시작');
  const groupBStartTime = performance.now();

  const { isEnglishText } = await import('@lib/utils/lyrics/parsers/stringUtils');
  const isNonEnglishTitle = !isEnglishText(title);

  const groupBSearches: Promise<ScoredCandidate[]>[] = [
    // Spotify 폴백
    (async (): Promise<ScoredCandidate[]> => {
      try {
        console.log('[Spotify] 검색 시도');
        const { searchSpotifyTrack } = await import('./spotify');
        const spotifyResult = await searchSpotifyTrack(artist, title, isNonEnglishTitle);
        if (spotifyResult) {
          console.log(`[Spotify] 발견: ${spotifyResult.artist} - ${spotifyResult.name}`);
          return fetchSearchCandidates(spotifyResult.artist, spotifyResult.name, 'forward');
        }
      } catch (error) {
        console.warn('[Spotify] 폴백 실패:', error);
      }
      return [];
    })(),

    // MusicBrainz 폴백
    (async (): Promise<ScoredCandidate[]> => {
      try {
        console.log(`[MusicBrainz FreeText] 아티스트 검색: "${artist}"`);
        const { searchArtistByFreeText, extractEnglishAliasFromArtists } = await import('./musicBrainz');
        const mbCandidates = await searchArtistByFreeText(artist);
        if (mbCandidates && mbCandidates.length > 0) {
          const alias = extractEnglishAliasFromArtists(mbCandidates);
          if (alias && alias !== artist) {
            console.log(`[MusicBrainz FreeText] 영문 alias: "${artist}" → "${alias}"`);
            return fetchSearchCandidates(alias, title, 'forward');
          }
        }
      } catch (error) {
        console.warn('[MusicBrainz FreeText] 검색 실패:', error);
      }
      return [];
    })(),
  ];

  const groupBResults = await Promise.allSettled(groupBSearches);
  const groupBCandidates: ScoredCandidate[] = [];

  for (const result of groupBResults) {
    if (result.status === 'fulfilled') {
      groupBCandidates.push(...result.value);
    }
  }

  console.log(
    `[LRCLib] 그룹 B 완료 (${(performance.now() - groupBStartTime).toFixed(0)}ms, 총 후보: ${groupBCandidates.length}개)`,
  );

  if (groupBCandidates.length > 0) {
    groupBCandidates.sort((a, b) => b.score - a.score);
    const best = groupBCandidates[0] as ScoredCandidate;
    console.log(
      `[LRCLib] ✅ 그룹 B 최적 후보 (source: ${best.source}, score: ${best.score}): ${best.result.artist} - ${best.result.title}`,
    );
    return best.result;
  }

  // 모든 검색 실패
  console.log('[LRCLib] ❌ 모든 검색 실패 (그룹 A + B)');
  return null;
}
