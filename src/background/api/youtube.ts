import { parseISO8601Duration } from '@lib/utils/common/time';
import { getFromLyricsCache, setToLyricsCache } from '@lib/utils/cache/lyricsCache';

export interface YouTubeVideoMetaCacheValue {
  categoryId: string;
  title: string;
  description: string;
  tags: string[];
  channelTitle: string;
  durationSec: number;
}

// 만료시간 기본 1일(YouTube 메타는 update가 드물어서 넉넉히 잡을 것)
const YT_META_CACHE_TTL = 24 * 60 * 60 * 1000;

// background/api/youtube.ts
export async function fetchYouTubeVideoMeta(videoId: string, apiKey: string) {
  const cacheKey = `videoMeta:${videoId}`;
  const cached = getFromLyricsCache(cacheKey);
  if (cached) return cached;

  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`;
  const res = await fetch(url);

  const data = await res.json();
  if (data.items && data.items.length > 0) {
    const snippet = data.items[0].snippet;
    const contentDetails = data.items[0].contentDetails;
    let durationSec = 0;
    if (contentDetails && contentDetails.duration) {
      durationSec = parseISO8601Duration(contentDetails.duration);
    }
    const result: YouTubeVideoMetaCacheValue = {
      categoryId: snippet.categoryId,
      title: snippet.title,
      description: snippet.description,
      tags: snippet.tags,
      channelTitle: snippet.channelTitle,
      durationSec,
    };

    setToLyricsCache(cacheKey, result, { ttl: YT_META_CACHE_TTL });
    return result;
  }
  return null;
}
