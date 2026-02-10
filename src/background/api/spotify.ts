/**
 * Spotify API 통합
 * API 서버를 통해 Spotify에서 곡 메타데이터 조회
 */

const API_SERVER_URL = process.env.API_SERVER_URL!;

export interface SpotifyTrackResult {
  name: string; // 영문 트랙명
  artist: string; // 영문 아티스트명
  album: string;
  spotifyId: string;
}

/**
 * Spotify 검색 결과의 신뢰도 검증 (영어 입력 전용)
 * artist 또는 title 중 하나라도 토큰 겹침이 있으면 통과, 둘 다 없으면 거부
 */
export function validateSpotifyResult(
  originalArtist: string,
  originalTitle: string,
  spotifyResult: SpotifyTrackResult,
): boolean {
  const MIN_TOKEN_LENGTH = 3;

  const tokenize = (str: string): Set<string> => {
    return new Set(
      str
        .toLowerCase()
        .trim()
        .split(/[\s-]+/)
        .filter((token) => token.length >= MIN_TOKEN_LENGTH),
    );
  };

  const hasOverlap = (setA: Set<string>, setB: Set<string>): boolean => {
    for (const token of setA) {
      if (setB.has(token)) return true;
    }
    return false;
  };

  const originalArtistTokens = tokenize(originalArtist);
  const originalTitleTokens = tokenize(originalTitle);
  const spotifyArtistTokens = tokenize(spotifyResult.artist);
  const spotifyTitleTokens = tokenize(spotifyResult.name);

  const artistMatch = hasOverlap(originalArtistTokens, spotifyArtistTokens);
  const titleMatch = hasOverlap(originalTitleTokens, spotifyTitleTokens);

  return artistMatch || titleMatch;
}

/**
 * Spotify에서 곡 검색
 * @param artist 아티스트명 (한글 가능)
 * @param title 곡명 (한글 가능)
 * @param isNonEnglish 비영어 입력 여부 (true면 출력 검증 건너뜀)
 * @returns 영문 곡명/아티스트명 또는 null
 */
export async function searchSpotifyTrack(
  artist: string,
  title: string,
  isNonEnglish: boolean = false,
): Promise<SpotifyTrackResult | null> {
  try {
    console.log(`[Spotify] 검색 시도: "${artist}" - "${title}"`);

    const response = await fetch(`${API_SERVER_URL}/api/v1/spotify/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ artist, title }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log('[Spotify] 검색 결과 없음');
        return null;
      }
      throw new Error(`Spotify search failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success || !data.data) {
      return null;
    }

    const result: SpotifyTrackResult = data.data;
    console.log(`[Spotify] 검색 성공: ${result.artist} - ${result.name}`);

    // 영어 입력일 때만 결과 신뢰도 검증
    if (!isNonEnglish && !validateSpotifyResult(artist, title, result)) {
      console.warn(
        `[Spotify] 검증 실패: 원본("${artist}" - "${title}")과 결과("${result.artist}" - "${result.name}")의 토큰 겹침 없음`,
      );
      return null;
    }

    return result;
  } catch (error) {
    console.error('[Spotify] 검색 실패:', error);
    return null;
  }
}
