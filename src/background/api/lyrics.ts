import { isEnglishText, replaceAmpersand } from '@lib/utils/common/stringUtils';
import { fetchLyricsByArtistAndTrack, LrcLibLyricsResult } from './lrclib';
import { extractEnglishAliasFromArtists, fetchEnglishAliasForArtist, searchArtistByFreeText } from './musicBrainz';

export async function fetchLyricsWithAliasFallback(artist: string, title: string): Promise<LrcLibLyricsResult> {
  const artistForSearch = replaceAmpersand(artist, 'and');
  const titleForSearch = replaceAmpersand(title, 'and');

  console.log('artist:', artistForSearch, 'title:', titleForSearch);

  const areBothEnglish = isEnglishText(artistForSearch) && isEnglishText(titleForSearch);

  let result: LrcLibLyricsResult | null = null;

  // Function to perform double lookup (artist/title and title/artist)
  async function doubleLookup(a: string, t: string) {
    let res = await fetchLyricsByArtistAndTrack(a, t);
    if (res) return res;

    if (a.toLowerCase() !== t.toLowerCase()) {
      res = await fetchLyricsByArtistAndTrack(t, a);
      if (res) return res;
    }
    return null;
  }

  // 둘 다 영어일 경우
  if (areBothEnglish) {
    // 1차: 기존 아티스트명으로 먼저 시도
    result = await doubleLookup(artistForSearch, titleForSearch);
    if (result) return result;

    // 2차: 영문 alias 조회 및 재시도
    const englishArtist = await fetchEnglishAliasForArtist(artistForSearch);
    if (englishArtist && englishArtist !== artistForSearch) {
      result = await doubleLookup(englishArtist, titleForSearch);
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
        result = await doubleLookup(extractedAlias, title);
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
      result = await doubleLookup(artistForSearch, titleForSearch);
      if (result) {
        console.log(`[Info] 영어 공식명 (${englishArtist})로 가사 검색 성공: ${englishArtist} - ${title}`);
        return result;
      }
    }
    throw new Error('LRCLIB에서 가사 정보를 찾을 수 없습니다! (공식 영어명 매핑 실패)');
  }
}
