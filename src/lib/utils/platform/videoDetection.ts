// lib/utils/videoDetection.ts
let lastVideoId: string | null = null;
const DETECTION_COOLDOWN = 10000; // 3초
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
