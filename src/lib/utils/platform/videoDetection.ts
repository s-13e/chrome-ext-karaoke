// lib/utils/videoDetection.ts
let lastVideoId: string | null = null;
const DETECTION_COOLDOWN = 10000; // 10초
let lastDetection = 0;

export function shouldDetect(videoId: string, cooldown = DETECTION_COOLDOWN): boolean {
  const now = Date.now();
  if (videoId === lastVideoId && now - lastDetection < cooldown) return false;
  lastVideoId = videoId;
  lastDetection = now;
  return true;
}

// 새로운, 더 활용도 높은 형태
export function tryDetectVideoChange(videoId: string | null, trigger: () => void, cooldown = 10000) {
  if (!videoId) return;
  if (shouldDetect(videoId, cooldown)) {
    trigger();
  }
}

/**
 * URL에서 videoId 추출
 * @param url - 검사할 URL 문자열
 * @returns videoId 문자열 또는 null (추출 실패 시)
 */
export function extractVideoIdFromUrl(url: string): string | null {
  const match = url.match(/[?&]v=([^&]+)/);
  return match && match[1] !== undefined ? match[1] : null;
}
