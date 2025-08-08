import { isEnglishText } from '@lib/utils/common/stringUtils';
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
