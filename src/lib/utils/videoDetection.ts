// lib/utils/videoDetection.ts
let lastVideoId: string | null = null;
let lastDetection = 0;
export function shouldDetect(videoId: string, cooldown = 10000): boolean {
  const now = Date.now();
  if (videoId === lastVideoId && now - lastDetection < cooldown) return false;
  lastVideoId = videoId;
  lastDetection = now;
  return true;
}
