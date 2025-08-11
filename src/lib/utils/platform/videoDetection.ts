// lib/utils/videoDetection.ts
const lastDetectTimes: Map<string, number> = new Map();
let lastVideoId: string | null = null;
const DETECTION_COOLDOWN = 3000; // 3초

// 새로운, 더 활용도 높은 형태
export function tryDetectVideoChange(videoId: string | null, trigger: () => void, cooldown = DETECTION_COOLDOWN): void {
  if (!videoId) return;
  if (videoId === lastVideoId) {
    return;
  }

  if (!shouldDetect(videoId, cooldown)) {
    // 호출 제한 중, 로그 생략 혹은 필요시 아주 간단히 기록
    return;
  }

  lastVideoId = videoId;
  console.log('[tryDetectVideoChange] videoId 변경 감지:', videoId);
  trigger();
}

function shouldDetect(videoId: string, cooldown: number): boolean {
  const now = Date.now();
  const lastTime = lastDetectTimes.get(videoId) ?? 0;
  if (now - lastTime < cooldown) {
    // 너무 잦은 호출, 감지 차단
    return false;
  }
  lastDetectTimes.set(videoId, now);
  return true;
}
