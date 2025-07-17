import { Line } from '@lib/types/lyrics';

// src/lib/utils/lyrics.ts
export function extractFirstLrcTimestamp(lyrics: string | Line[]): number {
  // 1. 배열(파싱된 LRC)인 경우:
  if (Array.isArray(lyrics)) {
    if (!lyrics.length) return 0;
    const firstLine = lyrics[0];
    if (!firstLine || typeof firstLine.time !== 'number') return 0;
    return firstLine.time;
  }

  // 2. string(LRC 원문)인 경우, 정규식으로 파싱
  const match = lyrics.match(/\[(\d+):(\d+[.\d+]*)\]/);
  if (!match || typeof match[1] !== 'string' || typeof match[2] !== 'string') return 0;

  const min = parseInt(match[1], 10);
  const sec = parseFloat(match[2]);

  if (isNaN(min) || isNaN(sec)) return 0;
  return min * 60 + sec;
}
