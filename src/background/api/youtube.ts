import { parseISO8601Duration } from '@lib/utils/common/time';

// 캐시 저장용 최소 메타데이터 (Redis에 저장)
export interface YouTubeVideoMetaCacheValue {
  videoId: string;
  title: string;
  durationSec: number;
}

// 음악 판별용 전체 메타데이터 (YouTube API 응답, isMusicVideo()에 필요)
export interface YouTubeVideoMetaFullValue {
  categoryId: string;
  title: string;
  description: string;
  tags: string[];
  channelTitle: string;
  durationSec: number;
}

const RAILWAY_API_URL = process.env.RAILWAY_API_URL!;

// background/api/youtube.ts
export async function fetchYouTubeVideoMeta(
  videoId: string,
  apiKey: string,
): Promise<YouTubeVideoMetaFullValue | null> {
  // 1. Railway 캐시 서버에서 조회 시도
  try {
    const cacheRes = await fetch(`${RAILWAY_API_URL}/api/youtube/${videoId}/meta`);
    if (cacheRes.ok) {
      const cachedData: YouTubeVideoMetaCacheValue = await cacheRes.json();
      console.log('[YouTube API] Railway 캐시 히트:', videoId);

      // 캐시된 최소 데이터를 전체 형식으로 변환
      // (이미 isMusicVideo() 통과한 데이터이므로 음악 영상 확정)
      return {
        categoryId: '10', // 음악 카테고리 (캐시된 영상은 이미 음악으로 확정됨)
        title: cachedData.title,
        description: '',
        tags: [],
        channelTitle: '',
        durationSec: cachedData.durationSec,
      };
    }
  } catch (error) {
    console.warn('[YouTube API] Railway 캐시 조회 실패, YouTube API로 폴백:', error);
  }

  // 2. 캐시 없으면 YouTube API 직접 호출
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

    // YouTube API에서는 전체 메타데이터 반환 (isMusicVideo() 판별용)
    const fullResult: YouTubeVideoMetaFullValue = {
      categoryId: snippet.categoryId,
      title: snippet.title,
      description: snippet.description,
      tags: snippet.tags || [],
      channelTitle: snippet.channelTitle,
      durationSec,
    };

    return fullResult;
  }
  return null;
}

/**
 * YouTube 메타데이터를 Railway 캐시에 저장
 * (isMusicVideo() 통과 후에만 호출해야 함)
 */
export async function saveYouTubeMetaToCache(videoId: string, meta: YouTubeVideoMetaFullValue): Promise<void> {
  const minimalCache: YouTubeVideoMetaCacheValue = {
    videoId,
    title: meta.title,
    durationSec: meta.durationSec,
  };

  try {
    await fetch(`${RAILWAY_API_URL}/api/youtube/${videoId}/meta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(minimalCache),
    });
    console.log('[YouTube API] Railway 캐시 저장 완료:', videoId);
  } catch (error) {
    console.warn('[YouTube API] Railway 캐시 저장 실패:', error);
  }
}
