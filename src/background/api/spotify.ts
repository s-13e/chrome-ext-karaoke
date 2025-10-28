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
 * 비영어 아티스트명 → 영문명 매핑을 Forward 캐시에 저장
 * @param originalArtist 원본 아티스트명 (예: "윤하")
 * @param englishArtist 영문 아티스트명 (예: "YOUNHA")
 */
async function cacheArtistNameMapping(originalArtist: string, englishArtist: string): Promise<void> {
  try {
    const normalized = originalArtist.toLowerCase();
    const englishNormalized = englishArtist.toLowerCase();

    // 이미 같은 값이면 저장 불필요
    if (normalized === englishNormalized) {
      return;
    }

    await fetch(`${RAILWAY_API_URL}/api/musicbrainz/alias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originalArtist: normalized,
        englishAlias: englishNormalized,
      }),
    });

    console.log(`[Cache] Forward 매핑 저장: "${originalArtist}" → "${englishArtist}"`);
  } catch (error) {
    console.warn('[Cache] Forward 매핑 저장 실패:', error);
  }
}

/**
 * 영문 아티스트명 → variants 역방향 매핑에 추가
 * @param englishArtist 영문 아티스트명 (예: "YOUNHA")
 * @param variant 원본 아티스트명 (예: "윤하", "ユンナ")
 */
async function addToReverseMapping(englishArtist: string, variant: string): Promise<void> {
  try {
    const englishNormalized = englishArtist.toLowerCase();
    const variantNormalized = variant.toLowerCase();

    // 이미 같은 값이면 저장 불필요
    if (englishNormalized === variantNormalized) {
      return;
    }

    await fetch(`${RAILWAY_API_URL}/api/musicbrainz/reverse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        englishArtist: englishNormalized,
        variant: variantNormalized,
      }),
    });

    console.log(`[Cache] Reverse 매핑 추가: "${englishArtist}" variants ← "${variant}"`);
  } catch (error) {
    console.warn('[Cache] Reverse 매핑 저장 실패:', error);
  }
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

    const result: SpotifyTrackResult = data.data;
    console.log(`[Spotify] 검색 성공: ${result.artist} - ${result.name}`);

    // 양방향 캐싱: Forward + Reverse 매핑 저장
    await Promise.all([cacheArtistNameMapping(artist, result.artist), addToReverseMapping(result.artist, artist)]);

    return result;
  } catch (error) {
    console.error('[Spotify] 검색 실패:', error);
    return null;
  }
}
