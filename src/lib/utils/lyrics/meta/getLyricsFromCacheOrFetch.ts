// lib/utils/lyrics/getLyricsFromCacheOrFetch.ts

import { LrcLibLyricsResult } from '@background/api/lrclib';
import { normalizeLyricsQuery } from './queryNormalizer';
import { getFromLyricsCache, setToLyricsCache } from '@lib/utils/cache/lyricsCache';

export async function getLyricsFromCacheOrFetch(
  artist: string,
  title: string,
  options: {
    lang?: string;
    fetch: (apiOpts: { etag?: string }) => Promise<LrcLibLyricsResult>;
  },
): Promise<LrcLibLyricsResult | undefined> {
  const key = normalizeLyricsQuery(artist, title, { lang: options.lang });

  // 1. 캐시 시도
  const cached = getFromLyricsCache(key);
  if (cached) {
    console.log('[LYRICS APPLY] 캐시사용:', cached);
    return cached;
  }
  console.log('[LYRICS APPLY] 캐시없음, fetch진행');

  // fetch
  const fetchResult = await options.fetch({});
  setToLyricsCache(key, fetchResult);

  return fetchResult;
}
