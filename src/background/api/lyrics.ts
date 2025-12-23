import { isEnglishText } from '@lib/utils/lyrics/parsers/stringUtils';
import { fetchLyricsByArtistAndTrack, LrcLibLyricsResult } from './lrclib';
import { LyricsError, LyricsErrorCode } from '@lib/types/lyricsError';

const API_SERVER_URL = process.env.API_SERVER_URL!;
const CACHE_TIMEOUT_MS = 2000; // 2초 타임아웃 (빠른 실패)

/**
 * Negative Cache 저장 (검색 실패 기록)
 * 7일 TTL로 저장하여 같은 영상에 대한 불필요한 재검색 방지
 */
async function saveNegativeCacheForVideo(videoId: string, artist: string, title: string): Promise<void> {
  try {
    const response = await fetch(`${API_SERVER_URL}/api/v1/youtube/lrclib/not-found`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoId,
        artist,
        title,
        status: 'not_found',
        timestamp: Date.now(),
      }),
      signal: AbortSignal.timeout(CACHE_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.warn(`[Negative Cache] 저장 실패 - HTTP ${response.status}`);
    } else {
      console.log(`[Negative Cache] ✅ 저장 완료: ${videoId} (${artist} - ${title})`);
    }
  } catch (error) {
    // Fire-and-forget이므로 에러는 로그만 남김
    console.warn(`[Negative Cache] 저장 실패:`, error);
  }
}

/**
 * artistVariants에서 성공한 아티스트를 기준으로 나머지 variants를 reverse 캐시에 저장
 * @param successfulArtist 성공한 아티스트명 (예: "YOUNHA")
 * @param artistVariants 모든 variants (예: ["YOUNHA", "윤하"])
 */
async function cacheArtistVariantsToReverse(successfulArtist: string, artistVariants: string[]): Promise<void> {
  if (!artistVariants || artistVariants.length <= 1) {
    return; // variants가 없거나 1개뿐이면 캐싱 불필요
  }

  const englishNormalized = successfulArtist.toLowerCase();

  for (const variant of artistVariants) {
    const variantNormalized = variant.toLowerCase();

    // 자기 자신이거나 이미 같은 값이면 스킵
    if (variantNormalized === englishNormalized) {
      continue;
    }

    try {
      // Forward 매핑: variant → successful
      await fetch(`${API_SERVER_URL}/api/v1/musicbrainz/alias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalArtist: variantNormalized,
          englishAlias: englishNormalized,
        }),
      });

      // Reverse 매핑: successful → variants에 variant 추가
      await fetch(`${API_SERVER_URL}/api/v1/musicbrainz/reverse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          englishArtist: englishNormalized,
          variant: variantNormalized,
        }),
      });

      console.log(`[Cache] Variants 양방향 저장: "${variant}" ↔ "${successfulArtist}"`);
    } catch (error) {
      console.warn(`[Cache] Variants 캐싱 실패 (${variant}):`, error);
    }
  }
}
export async function fetchLyricsWithAliasFallback(
  artist: string,
  title: string,
  durationSeconds: number,
  artistVariants?: string[],
  videoId?: string, // YouTube videoId (optional, 최고속 캐시용)
): Promise<LrcLibLyricsResult> {
  const processedArtist = artist;
  const processedTitle = title;

  const areBothEnglish = isEnglishText(processedArtist) && isEnglishText(processedTitle);
  console.log(`Artist: ${processedArtist}, Title: ${processedTitle}`);

  async function doubleLookup(a: string, t: string) {
    try {
      // videoId는 첫 번째 시도에만 전달 (이후 fallback은 다른 아티스트명이므로 videoId 무효)
      const res = await fetchLyricsByArtistAndTrack(a, t, durationSeconds, a === processedArtist ? videoId : undefined);
      return res ?? null;
    } catch (error) {
      // EMPTY_SEARCH_RESULTS나 NOT_FOUND 등은 정상적인 "가사 없음" 응답이므로 null 반환
      if (error instanceof LyricsError && error.code === LyricsErrorCode.LRCLIB_NOT_FOUND) {
        return null;
      }
      if (error instanceof LyricsError && error.code === LyricsErrorCode.EMPTY_SEARCH_RESULTS) {
        return null;
      }
      // 네트워크 오류 등 다른 예외는 상위로 전파
      throw error;
    }
  }

  if (areBothEnglish) {
    // 1차 시도: 원본 아티스트명 (variants[0], 영어)
    const firstResult = await doubleLookup(processedArtist, processedTitle);
    if (firstResult !== null) {
      // 성공 시 variants 양방향 캐싱
      await cacheArtistVariantsToReverse(processedArtist, artistVariants || []);
      return firstResult;
    }

    // 2차 시도: artistVariants가 있으면 나머지 variants 시도
    if (artistVariants && artistVariants.length > 1) {
      for (let i = 1; i < artistVariants.length; i++) {
        const variant = artistVariants[i];
        if (variant && variant !== processedArtist) {
          console.log(`[Info] artistVariants[${i}] (${variant})로 가사 검색 시도`);
          const variantResult = await doubleLookup(variant, processedTitle);
          if (variantResult !== null) {
            console.log(`[Info] artistVariants[${i}] (${variant})로 가사 검색 성공: ${variant} - ${processedTitle}`);
            // 성공 시 variants 양방향 캐싱 (성공한 variant 기준)
            await cacheArtistVariantsToReverse(variant, artistVariants);
            return variantResult;
          }
        }
      }
    }

    // 3차 시도: lrclib.ts에서 모든 검색 시도 (LRCLib FreeText, MusicBrainz FreeText 포함)
    // 추가 시도 없음 - lrclib.ts가 모든 fallback 처리

    // 모든 시도 실패 시 negative cache 저장 (fire-and-forget)
    if (videoId) {
      console.log(`[Negative Cache] 검색 실패 기록 저장: ${videoId}`);
      saveNegativeCacheForVideo(videoId, processedArtist, processedTitle);
    }

    // 모든 시도 실패 시 예외 던짐
    throw new LyricsError(LyricsErrorCode.LRCLIB_NOT_FOUND, undefined, {
      artist: processedArtist,
      title: processedTitle,
      language: 'english',
      attemptedMethods: ['direct', 'artistVariants', 'freeTextAlias'],
    });
  } else {
    // 비영어권: MusicBrainz alias 우선 → LRCLib 검색
    // 주의: lrclib.ts에서 이미 alias 캐시를 조회하므로, 여기서는 API만 호출

    // 1단계: 원본 아티스트명으로 LRCLib 직접 시도
    // (lrclib.ts 내부에서 alias 캐시 조회 완료: あいみょん → aimyon)
    const firstResult = await doubleLookup(processedArtist, processedTitle);
    if (firstResult !== null) {
      await cacheArtistVariantsToReverse(processedArtist, artistVariants || []);
      return firstResult;
    }

    // 2단계: artistVariants 시도
    if (artistVariants && artistVariants.length > 1) {
      for (let i = 1; i < artistVariants.length; i++) {
        const variant = artistVariants[i];
        if (variant && variant !== processedArtist) {
          const variantResult = await doubleLookup(variant, processedTitle);
          if (variantResult !== null) {
            console.log(`[Lyrics] artistVariants[${i}] (${variant})로 가사 발견: ${variant} - ${processedTitle}`);
            await cacheArtistVariantsToReverse(variant, artistVariants);
            return variantResult;
          }
        }
      }
    }

    // 3단계: lrclib.ts에서 모든 검색 시도 (Spotify, LRCLib FreeText, MusicBrainz FreeText 포함)
    // 추가 시도 없음 - lrclib.ts가 모든 fallback 처리

    // 모든 시도 실패 시 negative cache 저장 (fire-and-forget)
    if (videoId) {
      console.log(`[Negative Cache] 검색 실패 기록 저장: ${videoId}`);
      saveNegativeCacheForVideo(videoId, processedArtist, processedTitle);
    }

    // 모든 시도 실패
    throw new LyricsError(LyricsErrorCode.LRCLIB_NOT_FOUND, undefined, {
      artist: processedArtist,
      title: processedTitle,
      language: 'non-english',
      attemptedMethods: ['direct', 'artistVariants', 'freeText'],
    });
  }
}
