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

// background/api/youtube.ts
export async function fetchYouTubeVideoMeta(
  videoId: string,
  apiKey: string,
): Promise<YouTubeVideoMetaFullValue | null> {
  // YouTube API 직접 호출 (캐시 제거: Chrome Extension 환경에서 타임아웃 미작동)
  const ytApiStartTime = performance.now();
  console.log('[YouTube API] 직접 호출 시작:', videoId);

  // 필요한 필드만 요청하여 JSON 크기 최소화 (응답 속도 향상)
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}&fields=items(id,snippet(categoryId,title,description,tags,channelTitle),contentDetails/duration)`;
  const res = await fetch(url);

  console.log(
    `[YouTube API] 직접 호출 완료 (${(performance.now() - ytApiStartTime).toFixed(0)}ms, 상태: ${res.status})`,
  );

  const jsonStartTime = performance.now();
  const data = await res.json();
  console.log(`[Performance] YouTube API JSON 파싱 완료 (${(performance.now() - jsonStartTime).toFixed(0)}ms)`);

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
    console.log(`[YouTube API] ✅ 메타데이터 조회 성공 (총 ${(performance.now() - ytApiStartTime).toFixed(0)}ms)`);

    return fullResult;
  }
  console.log('[YouTube API] ❌ 메타데이터 없음');
  return null;
}

// saveYouTubeMetaToCache 함수 제거 (캐시 미사용)
