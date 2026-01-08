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

  try {
    const res = await fetch(url);

    console.log(
      `[YouTube API] 직접 호출 완료 (${(performance.now() - ytApiStartTime).toFixed(0)}ms, 상태: ${res.status})`,
    );

    // HTTP 에러 상태 체크
    if (!res.ok) {
      const errorText = await res.text();
      const error = new Error(`YouTube API HTTP ${res.status}: ${errorText}`);

      // 에러 추적 (background script에서는 import 필요)
      console.error('[YouTube API] HTTP Error:', {
        videoId,
        status: res.status,
        statusText: res.statusText,
        responseTime: performance.now() - ytApiStartTime,
      });

      throw error;
    }

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
  } catch (error) {
    // 네트워크 에러 또는 기타 fetch 실패
    console.error('[YouTube API] Fetch 실패:', error);
    throw error;
  }
}

// saveYouTubeMetaToCache 함수 제거 (캐시 미사용)

/**
 * YouTube Playlist Item 인터페이스
 */
export interface YouTubePlaylistItem {
  videoId: string;
  title: string;
  artist: string; // channelTitle로부터 추출
  thumbnailUrl: string;
  position: number; // 플레이리스트 내 순서 (0부터 시작)
}

/**
 * YouTube API playlistItems 응답 타입
 */
interface YouTubePlaylistApiResponse {
  items: Array<{
    snippet: {
      position: number;
      title: string;
      videoOwnerChannelTitle?: string;
      resourceId: {
        videoId: string;
      };
      thumbnails?: {
        medium?: {
          url: string;
        };
      };
    };
  }>;
}

/**
 * YouTube Data API - playlistItems.list
 * 플레이리스트의 동영상 목록을 가져옵니다.
 *
 * @param playlistId - YouTube 플레이리스트 ID
 * @param apiKey - YouTube Data API 키
 * @param maxResults - 가져올 최대 항목 수 (기본: 50, 최대: 50)
 * @returns 플레이리스트 아이템 배열
 */
export async function fetchPlaylistItems(
  playlistId: string,
  apiKey: string,
  maxResults: number = 50,
): Promise<YouTubePlaylistItem[]> {
  const startTime = performance.now();
  console.log(`[YouTube Playlist API] 플레이리스트 조회 시작: ${playlistId}`);

  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&key=${apiKey}&maxResults=${maxResults}&fields=items(snippet(position,title,videoOwnerChannelTitle,resourceId/videoId,thumbnails/medium/url))`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      // 에러 응답의 상세 내용 확인
      const errorData = await res.json().catch(() => ({}));
      console.error(`[YouTube Playlist API] ❌ HTTP ${res.status}: ${res.statusText}`);
      console.error('[YouTube Playlist API] 에러 상세:', errorData);
      return [];
    }

    const data: YouTubePlaylistApiResponse = await res.json();
    console.log(
      `[YouTube Playlist API] 응답 받음 (${(performance.now() - startTime).toFixed(0)}ms, 항목 수: ${data.items?.length || 0})`,
    );

    if (!data.items || data.items.length === 0) {
      console.log('[YouTube Playlist API] ❌ 플레이리스트 항목 없음');
      return [];
    }

    const items: YouTubePlaylistItem[] = data.items.map((item) => ({
      videoId: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      artist: item.snippet.videoOwnerChannelTitle || 'Unknown Artist',
      thumbnailUrl: item.snippet.thumbnails?.medium?.url || '',
      position: item.snippet.position,
    }));

    console.log(
      `[YouTube Playlist API] ✅ 플레이리스트 조회 성공 (${items.length}개 항목, ${(performance.now() - startTime).toFixed(0)}ms)`,
    );

    return items;
  } catch (error) {
    console.error('[YouTube Playlist API] ❌ 네트워크 오류:', error);
    return [];
  }
}
