/**
 * Spotify API 통합
 * Railway API 서버를 통해 Spotify에서 곡 메타데이터 조회
 */

const RAILWAY_API_URL = 'https://karaoke-api-server-production.up.railway.app';

export interface SpotifyTrackResult {
  name: string; // 영문 트랙명
  artist: string; // 영문 아티스트명
  album: string;
  spotifyId: string;
}

/**
 * Spotify에서 곡 검색
 * @param artist 아티스트명 (한글 가능)
 * @param title 곡명 (한글 가능)
 * @returns 영문 곡명/아티스트명 또는 null
 */
export async function searchSpotifyTrack(artist: string, title: string): Promise<SpotifyTrackResult | null> {
  try {
    console.log(`[Spotify] 검색 시도: "${artist}" - "${title}"`);

    const response = await fetch(`${RAILWAY_API_URL}/api/spotify/search`, {
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

    console.log(`[Spotify] 검색 성공: ${data.data.artist} - ${data.data.name}`);
    return data.data;
  } catch (error) {
    console.error('[Spotify] 검색 실패:', error);
    return null;
  }
}
