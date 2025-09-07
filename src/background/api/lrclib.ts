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

// 메인 엔트리: 캐시 우선, 없을 때 get fallback
export async function fetchLyricsByArtistAndTrack(
  artist: string,
  title: string,
  durationSeconds: number,
): Promise<LrcLibLyricsResult | null> {
  // 1. 캐시 버전 endpoint 사용
  const getCachedEndpoint = 'https://lrclib.net/api/get-cached';
  const cachedResult = await fetchLyricsWithEndpoint(getCachedEndpoint, artist, title, durationSeconds);
  if (cachedResult && cachedResult.lyrics) {
    return cachedResult;
  }

  // 2. 캐시에 없으면 일반 get endpoint로 fallback
  const getEndpoint = 'https://lrclib.net/api/get';
  return await fetchLyricsWithEndpoint(getEndpoint, artist, title, durationSeconds);
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
    const searchEndpoint = `https://lrclib.net/api/search?artist_name=${encodeURIComponent(
      artistParam,
    )}&track_name=${encodeURIComponent(titleParam)}`;

    const searchRes = await fetch(searchEndpoint);
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

    async function fetchLyricDetail(
      candidate: SearchCandidate,
      durationSeconds: number,
    ): Promise<
      | (LrcLibLyricsResult & {
          hasSynced: boolean;
          isStrictMatch: boolean;
        })
      | null
    > {
      try {
        const detailRes = await fetch(`${endpoint}/${candidate.id}?duration=${encodeURIComponent(durationSeconds)}`);
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
          return null;
        }
        /*  console.log(
          '[LrcLib] API 받은 원본 lyrics:',
          lyrics,
          `candidate.id: ${candidate.id} 응답 duration: ${detail.duration}`,
        ); */

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
      limitedCandidates.map((candidate) => requestLimiter.enqueue(() => fetchLyricDetail(candidate, durationSeconds))),
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

    const filteredByDuration = evaluateCandidatesByDuration(validResults, durationSeconds, 2);

    if (!filteredByDuration.length && (fallbackSynced || fallbackPlain)) {
      console.log('No valid results after duration filter, returning fallback');
      return fallbackSynced || fallbackPlain;
    }

    if (!filteredByDuration.length) {
      console.log('No results found after duration filter');
      return null;
    }

    const strictSynced = filteredByDuration.find((res) => res.hasSynced && res.isStrictMatch);
    if (strictSynced) {
      console.log('Returning strict matched synced lyrics');
      return strictSynced;
    }

    const fallbackSyncedCandidate = filteredByDuration.find((res) => res.hasSynced);
    if (fallbackSyncedCandidate) {
      console.log('Returning fallback synced lyrics');
      return fallbackSyncedCandidate;
    }

    const strictPlain = filteredByDuration.find((res) => !res.hasSynced && res.isStrictMatch);
    if (strictPlain) {
      console.log('Returning strict matched plain lyrics');
      return strictPlain;
    }

    const fallbackPlainCandidate = filteredByDuration.find((res) => !res.hasSynced);
    if (fallbackPlainCandidate) {
      console.log('Returning fallback plain lyrics');
      return fallbackPlainCandidate;
    }

    console.log('Returning first valid result as fallback');
    return filteredByDuration[0] || null;
  }

  // 1차 시도: 정상 아티스트-곡명 순서
  const result1 = await searchWithParams(artist, title, 1, durationSeconds);
  if (result1 !== null) return result1;

  // 2차 시도: 곡명-아티스트 순서
  if (artist.toLowerCase() !== title.toLowerCase()) {
    const result2 = await searchWithParams(title, artist, 2, durationSeconds);
    if (result2 !== null) return result2;
  }
  return null;
}

// validResults는 여러 후보 가사 리스트
// videoDurationSec은 영상 길이(초) - collectMetadataAndLyrics에서 인자로 전달

function evaluateCandidatesByDuration(
  candidates: (LrcLibLyricsResult & {
    hasSynced: boolean;
    isStrictMatch: boolean;
  })[],
  videoDurationSec: number,
  maxAllowedDiffSec = 3,
) {
  return candidates.filter((candidate) => {
    if (!candidate.duration) return false; // duration 정보 없는 후보 제거
    const diff = Math.abs(videoDurationSec - candidate.duration);
    return diff <= maxAllowedDiffSec;
  });
}
