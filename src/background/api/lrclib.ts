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
export async function fetchLyricsByArtistAndTrack(
  artist: string,
  title: string,
): Promise<LrcLibLyricsResult | undefined> {
  async function searchWithParams(artistParam: string, titleParam: string) {
    const endpoint = `https://lrclib.net/api/search?artist_name=${encodeURIComponent(artistParam)}&track_name=${encodeURIComponent(titleParam)}`;
    const searchRes = await fetch(endpoint);
    if (!searchRes.ok) return undefined;
    const searchData = await searchRes.json();

    let fallbackResult: LrcLibLyricsResult | undefined = undefined;
    const normalizedReqTitle = titleParam.trim().toLowerCase();

    for (const candidate of searchData) {
      const detailRes = await fetch(`https://lrclib.net/api/get/${candidate.id}`);
      if (!detailRes.ok) continue;
      const detail = await detailRes.json();

      const lyrics = detail.syncedLyrics || detail.plainLyrics;
      if (!lyrics) continue;

      const candidateTitle = detail.title?.trim().toLowerCase() ?? '';

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
  if (result1) return result1;

  // 2차 시도: 아티스트와 곡명을 뒤바꿔서 검색
  if (artist.toLowerCase() !== title.toLowerCase()) {
    const result2 = await searchWithParams(title, artist);
    if (result2) return result2;
  }

  return undefined;
}
