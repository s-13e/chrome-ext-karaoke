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
  // 필요시 추가 필드 작성
}

export async function fetchLyricsByArtistAndTrack(artist: string, title: string): Promise<LrcLibLyricsResult | null> {
  const requestLimiter = new RequestLimiter(5); // 최대 동시 5개 요청 제한

  async function searchWithParams(artistParam: string, titleParam: string): Promise<LrcLibLyricsResult | null> {
    const endpoint = `https://lrclib.net/api/search?artist_name=${encodeURIComponent(
      artistParam,
    )}&track_name=${encodeURIComponent(titleParam)}`;

    const searchRes = await fetch(endpoint);
    if (!searchRes.ok) return null;

    const searchData = await searchRes.json();
    const limitedCandidates = searchData.slice(0, 10);
    const normalizedReqTitle = titleParam.trim().toLowerCase();

    let fallbackSynced: LrcLibLyricsResult | null = null;
    let fallbackPlain: LrcLibLyricsResult | null = null;

    async function fetchLyricDetail(candidate: (typeof limitedCandidates)[number]): Promise<
      | (LrcLibLyricsResult & {
          hasSynced: boolean;
          isStrictMatch: boolean;
        })
      | null
    > {
      try {
        const detailRes = await fetch(`https://lrclib.net/api/get/${candidate.id}`);
        if (!detailRes.ok) return null;

        const detail = (await detailRes.json()) as {
          syncedLyrics?: string | Line[];
          plainLyrics?: string | Line[];
          duration?: number;
          artist?: string;
          title?: string;
        };

        const lyrics = detail.syncedLyrics || detail.plainLyrics;
        if (!lyrics) return null;

        const candidateTitle = detail.title?.trim().toLowerCase() ?? '';

        // fallback 저장 (우선순위에 맞게 따로 저장)
        if (detail.syncedLyrics && candidateTitle !== normalizedReqTitle) {
          // fallback syncedLyrics
          if (!fallbackSynced) {
            fallbackSynced = {
              lyrics,
              duration: detail.duration,
              artist: detail.artist,
              title: detail.title,
              id: candidate.id,
            };
          }
        } else if (!detail.syncedLyrics) {
          if (!fallbackPlain) {
            fallbackPlain = {
              lyrics,
              duration: detail.duration,
              artist: detail.artist,
              title: detail.title,
              id: candidate.id,
            };
          }
        }

        return {
          lyrics,
          duration: detail.duration,
          artist: detail.artist,
          title: detail.title,
          id: candidate.id,
          hasSynced: !!detail.syncedLyrics,
          isStrictMatch: candidateTitle === normalizedReqTitle,
        };
      } catch (err) {
        console.error(`Error fetching lyric detail ${candidate.id}:`, err);
        return null;
      }
    }

    // 병렬 요청
    const results = await Promise.all(
      limitedCandidates.map((candidate: SearchCandidate) => requestLimiter.enqueue(() => fetchLyricDetail(candidate))),
    );

    const validResults = results.filter((res) => res !== null) as (LrcLibLyricsResult & {
      hasSynced: boolean;
      isStrictMatch: boolean;
    })[];

    if (validResults.length === 0 && (fallbackSynced || fallbackPlain)) {
      return fallbackSynced || fallbackPlain;
    }
    if (validResults.length === 0) return null;

    // 1. 엄격 매칭 + syncedLyrics 우선 반환
    const strictSynced = validResults.find((res) => res.hasSynced && res.isStrictMatch);
    if (strictSynced) return strictSynced;

    // 2. fallback 중 syncedLyrics
    if (fallbackSynced) return fallbackSynced;

    // 3. 엄격 매칭 + plainLyrics 반환
    const strictPlain = validResults.find((res) => !res.hasSynced && res.isStrictMatch);
    if (strictPlain) return strictPlain;

    // 4. fallback 중 plainLyrics
    if (fallbackPlain) return fallbackPlain;

    // fallback 없을 시 - 결과 배열에서 첫 번째 반환
    return validResults[0] || null;
  }

  // 1차 시도: 아티스트-곡명 순서
  const result1 = await searchWithParams(artist, title);
  if (result1 !== null) return result1;

  // 2차 시도: 곡명-아티스트 순서
  if (artist.toLowerCase() !== title.toLowerCase()) {
    const result2 = await searchWithParams(title, artist);
    if (result2 !== null) return result2;
  }

  return null;
}
