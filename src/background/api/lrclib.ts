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
}

const requestLimiter = new RequestLimiter(5); // 최대 동시 5개 요청 제한

export async function fetchLyricsByArtistAndTrack(artist: string, title: string): Promise<LrcLibLyricsResult | null> {
  async function searchWithParams(
    artistParam: string,
    titleParam: string,
    _attemptNumber: number,
  ): Promise<LrcLibLyricsResult | null> {
    const endpoint = `https://lrclib.net/api/search?artist_name=${encodeURIComponent(
      artistParam,
    )}&track_name=${encodeURIComponent(titleParam)}`;

    const searchRes = await fetch(endpoint);
    if (!searchRes.ok) {
      console.warn(`Search API response not OK, status: ${searchRes.status}`);
      return null;
    }

    const searchData: SearchCandidate[] = await searchRes.json();
    const limitedCandidates = searchData.slice(0, 10);

    const normalizedReqTitle = titleParam.trim().toLowerCase();

    let fallbackSynced: LrcLibLyricsResult | null = null;
    let fallbackPlain: LrcLibLyricsResult | null = null;

    // 타임아웃을 구현하기 위한 Promise
    const timeoutMs = 7000; // 7초 타임아웃
    let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;

    // 타임아웃 Promise
    const timeoutPromise = new Promise<null>((resolve) => {
      timeoutId = setTimeout(() => {
        console.warn(`Timeout after ${timeoutMs} ms waiting for lyric details`);
        resolve(null);
      }, timeoutMs);
    });

    async function fetchLyricDetail(candidate: SearchCandidate): Promise<
      | (LrcLibLyricsResult & {
          hasSynced: boolean;
          isStrictMatch: boolean;
        })
      | null
    > {
      try {
        const detailRes = await fetch(`https://lrclib.net/api/get/${candidate.id}`);
        if (!detailRes.ok) {
          console.warn(`Detail API response not OK for candidate id ${candidate.id}, status: ${detailRes.status}`);
          return null;
        }
        const detail = (await detailRes.json()) as {
          syncedLyrics?: string | Line[];
          plainLyrics?: string | Line[];
          duration?: number;
          artist?: string;
          title?: string;
        };

        const lyrics = detail.syncedLyrics || detail.plainLyrics;
        if (!lyrics) {
          console.warn(`No lyrics found for candidate id ${candidate.id}`);
          return null;
        }

        const candidateTitle = (detail.title ?? '').trim().toLowerCase();
        const isStrictMatch = candidateTitle === normalizedReqTitle;

        if (detail.syncedLyrics && !isStrictMatch && !fallbackSynced) {
          fallbackSynced = {
            lyrics,
            duration: detail.duration,
            artist: detail.artist,
            title: detail.title,
            id: candidate.id,
          };
        } else if (!detail.syncedLyrics && !fallbackPlain) {
          fallbackPlain = {
            lyrics,
            duration: detail.duration,
            artist: detail.artist,
            title: detail.title,
            id: candidate.id,
          };
        }

        return {
          lyrics,
          duration: detail.duration,
          artist: detail.artist,
          title: detail.title,
          id: candidate.id,
          hasSynced: !!detail.syncedLyrics,
          isStrictMatch,
        };
      } catch (err) {
        console.error(`Error fetching lyric detail ${candidate.id}:`, err);
        return null;
      }
    }

    // 요청 배치
    const resultsPromise = Promise.all(
      limitedCandidates.map((candidate) => requestLimiter.enqueue(() => fetchLyricDetail(candidate))),
    );

    // 타임아웃 또는 모두 완료 중 먼저 도착하는 것을 선택
    const results = (await Promise.race([resultsPromise, timeoutPromise])) || [];
    clearTimeout(timeoutId);

    // 타임아웃시에도 결과가 부분적으로 나올 수 있으니 validResults 구성
    const validResults = Array.isArray(results)
      ? (results.filter((res) => res !== null) as (LrcLibLyricsResult & {
          hasSynced: boolean;
          isStrictMatch: boolean;
        })[])
      : [];

    if (!validResults.length && (fallbackSynced || fallbackPlain)) {
      console.log('No valid results, returning fallback');
      return fallbackSynced || fallbackPlain;
    }
    if (!validResults.length) {
      console.log('No results found');
      return null;
    }

    const strictSynced = validResults.find((res) => res.hasSynced && res.isStrictMatch);
    if (strictSynced) {
      console.log('Returning strict matched synced lyrics');
      return strictSynced;
    }

    if (fallbackSynced) {
      console.log('Returning fallback synced lyrics');
      return fallbackSynced;
    }

    const strictPlain = validResults.find((res) => !res.hasSynced && res.isStrictMatch);
    if (strictPlain) {
      console.log('Returning strict matched plain lyrics');
      return strictPlain;
    }

    if (fallbackPlain) {
      console.log('Returning fallback plain lyrics');
      return fallbackPlain;
    }

    console.log('Returning first valid result as fallback');
    return validResults[0] || null;
  }

  // 1차 시도: 정상 아티스트-곡명 순서
  const result1 = await searchWithParams(artist, title, 1);
  if (result1 !== null) return result1;

  // 2차 시도: 곡명-아티스트 순서
  if (artist.toLowerCase() !== title.toLowerCase()) {
    const result2 = await searchWithParams(title, artist, 2);
    if (result2 !== null) return result2;
  }
  return null;
}
