import { LrcLibLyricsResult } from '@background/api/lrclib';

// lib/utils/cache/lyricsCache.ts
interface MemoryCacheItem<T = unknown> {
  value: T;
  expire: number;
  etag?: string;
}
const MEMORY_CACHE: Record<string, MemoryCacheItem<LrcLibLyricsResult>> = {};

const DEFAULT_TTL = 6 * 60 * 60 * 1000; // 6시간

export function getFromLyricsCache(key: string) {
  // 1. localStorage 우선 체크
  const ls = localStorage.getItem(key);
  if (ls) {
    try {
      const obj = JSON.parse(ls);
      if (obj.expire > Date.now()) {
        console.log(`[LyricsCache] 캐시 히트 (localStorage): key=${key}`);
        return obj.value;
      } else {
        localStorage.removeItem(key);
        console.log(`[LyricsCache] 캐시 만료 (localStorage): key=${key}`);
      }
    } catch {
      // 파싱 에러 등은 무시하고 계속 진행
    }
  }
  // 2. in-memory fallback
  const item = MEMORY_CACHE[key];
  if (item) {
    if (item.expire > Date.now()) {
      console.log(`[LyricsCache] 캐시 히트 (memory): key=${key}`);
      return item.value;
    } else {
      delete MEMORY_CACHE[key];
      console.log(`[LyricsCache] 캐시 만료 (memory): key=${key}`);
    }
  }
  // 3. 완전 miss
  console.log(`[LyricsCache] 캐시 미스: key=${key}`);
  return null;
}

export function setToLyricsCache<T>(
  key: string,
  value: T,
  { ttl = DEFAULT_TTL, etag }: { ttl?: number; etag?: string } = {},
) {
  const expire = Date.now() + ttl;

  // localStorage 동기화
  try {
    localStorage.setItem(key, JSON.stringify({ value, expire, etag }));
    console.log(`[LyricsCache] 캐시 저장됨(localStorage): key=${key}, 만료=${ttl / 1000}s`);
  } catch {
    // localStorage 용량 초과 등 무시 (메모리 캐시만 보허)
    console.warn(`[LyricsCache] localStorage 저장 실패: key=${key}`);
  }
}

export function getETagForLyrics(key: string): string | undefined {
  return MEMORY_CACHE[key]?.etag;
}
