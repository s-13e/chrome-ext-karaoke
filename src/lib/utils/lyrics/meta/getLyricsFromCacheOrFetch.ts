// lib/utils/lyrics/getLyricsFromCacheOrFetch.ts

import { LrcLibLyricsResult } from '@background/api/lrclib';

/**
 * 가사를 Railway Redis 캐시 또는 API에서 가져옵니다.
 * localStorage 캐시는 제거되었으며, Railway API 내부에서 Redis 캐시를 처리합니다.
 */
export async function getLyricsFromCacheOrFetch(
  artist: string,
  title: string,
  options: {
    lang?: string;
    fetch: (apiOpts: { etag?: string }) => Promise<LrcLibLyricsResult>;
  },
): Promise<LrcLibLyricsResult | undefined> {
  console.log(`[LYRICS FETCH] ${artist} - ${title} 조회 시작`);

  // Railway API 호출 (내부적으로 Redis 캐시 확인 후 LRCLib API 호출)
  const fetchResult = await options.fetch({});

  console.log('[LYRICS FETCH] 가사 조회 완료');
  return fetchResult;
}
