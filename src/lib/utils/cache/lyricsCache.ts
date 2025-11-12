// lib/utils/cache/lyricsCache.ts
// localStorage 캐시 제거 - API 서버 Redis만 사용
// 이 파일은 이제 사용되지 않으며, API 서버를 통한 캐시만 사용합니다.

/**
 * @deprecated localStorage 캐시는 더 이상 사용하지 않습니다.
 * API 서버 Redis의 캐시를 사용하세요.
 * - LRCLib: fetchLyricsByArtistAndTrack() 내부에서 API 서버 사용
 * - MusicBrainz: fetchEnglishAliasForArtist() 내부에서 API 서버 사용
 * - YouTube: fetchYouTubeVideoMeta() 내부에서 API 서버 사용
 */
export function getFromLyricsCache(_key: string): null {
  console.warn('[LyricsCache] localStorage 캐시는 더 이상 사용되지 않습니다. API 서버 Redis를 사용하세요.');
  return null;
}

/**
 * @deprecated localStorage 캐시는 더 이상 사용하지 않습니다.
 */
export function setToLyricsCache<T>(_key: string, _value: T): void {
  console.warn('[LyricsCache] localStorage 캐시는 더 이상 사용되지 않습니다. API 서버 Redis를 사용하세요.');
}

/**
 * @deprecated localStorage 캐시는 더 이상 사용하지 않습니다.
 */
export function getETagForLyrics(_key: string): undefined {
  return undefined;
}

/**
 * @deprecated localStorage 캐시는 더 이상 사용하지 않습니다.
 */
export function clearLyricsCache(): void {
  console.log('[LyricsCache] localStorage 캐시 정리 - 더 이상 사용되지 않음');
}
