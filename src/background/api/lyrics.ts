import { isEnglishText } from '@lib/utils/lyrics/parsers/stringUtils';
import { fetchLyricsByArtistAndTrack, LrcLibLyricsResult } from './lrclib';
import { extractEnglishAliasFromArtists, fetchEnglishAliasForArtist, searchArtistByFreeText } from './musicBrainz';
import { LyricsError, LyricsErrorCode } from '@lib/types/lyricsError';

const RAILWAY_API_URL = process.env.RAILWAY_API_URL!;

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
      await fetch(`${RAILWAY_API_URL}/api/v1/musicbrainz/alias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalArtist: variantNormalized,
          englishAlias: englishNormalized,
        }),
      });

      // Reverse 매핑: successful → variants에 variant 추가
      await fetch(`${RAILWAY_API_URL}/api/v1/musicbrainz/reverse`, {
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
): Promise<LrcLibLyricsResult> {
  const processedArtist = artist;
  const processedTitle = title;

  const areBothEnglish = isEnglishText(processedArtist) && isEnglishText(processedTitle);
  console.log(`Artist: ${processedArtist}, Title: ${processedTitle}`);

  async function doubleLookup(a: string, t: string) {
    try {
      const res = await fetchLyricsByArtistAndTrack(a, t, durationSeconds);
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

    // 3차 alias 시도 (실패해도 흐름 계속)
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
      if (e instanceof LyricsError) {
        // LyricsError는 상위로 전파
        throw e;
      }
      console.warn('[fetchLyricsWithAliasFallback] 영어 alias 검색 실패:', e);
    }

    // 4차 freeText alias 시도 (실패해도 무시)
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
      if (e instanceof LyricsError) {
        // LyricsError는 상위로 전파
        throw e;
      }
      console.warn('[fetchLyricsWithAliasFallback] FreeText alias 검색 실패:', e);
    }

    // 모든 시도 실패 시 예외 던짐
    throw new LyricsError(LyricsErrorCode.LRCLIB_NOT_FOUND, undefined, {
      artist: processedArtist,
      title: processedTitle,
      language: 'english',
      attemptedMethods: ['direct', 'artistVariants', 'englishAlias', 'freeTextAlias'],
    });
  } else {
    // 비영어권: 아티스트 variants 시도
    // 1차 시도: 원본 아티스트명
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

    // 모든 시도 실패
    throw new LyricsError(LyricsErrorCode.LRCLIB_NOT_FOUND, undefined, {
      artist: processedArtist,
      title: processedTitle,
      language: 'non-english',
      attemptedMethods: artistVariants && artistVariants.length > 1 ? ['direct', 'artistVariants'] : ['direct'],
    });
  }
}
