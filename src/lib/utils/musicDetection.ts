import { MUSIC_KEYWORDS } from '@constants/keywords';

// lib/utils/musicDetection.ts
export interface MusicDetectionInput {
  categoryId?: string;
  title?: string;
  description?: string;
  tags?: string[];
  channelTitle?: string;
  durationSec?: number;
}
const specialMusicPattern = /([^A-Za-z]|^)(OP|ED|OST|MV)([^A-Za-z]|$)/i;

export function scoreMusicVideo(meta: MusicDetectionInput): number {
  let score = 0;
  if (meta.categoryId === '10') score += 3;

  if (meta.title && MUSIC_KEYWORDS.some((k) => meta.title?.toLowerCase().includes(k))) score += 2;
  if (meta.description && MUSIC_KEYWORDS.some((k) => meta.description?.toLowerCase().includes(k))) score += 1;
  if (meta.tags && meta.tags.some((tag) => MUSIC_KEYWORDS.some((k) => tag.toLowerCase().includes(k)))) score += 1;
  if (meta.durationSec && meta.durationSec >= 60 && meta.durationSec <= 600) score += 1;
  // 채널명 등 추가 휴리스틱 가능

  // OP/ED/OST/MV가 앞뒤 영어 없이 등장할 때 추가 가산점
  if (meta.title && specialMusicPattern.test(meta.title)) score += 1;
  if (meta.description && specialMusicPattern.test(meta.description)) score += 1;
  if (meta.tags && meta.tags.some((tag) => specialMusicPattern.test(tag))) score += 1;

  return score;
}

export function isMusicVideo(meta: MusicDetectionInput, threshold = 3): boolean {
  return scoreMusicVideo(meta) >= threshold;
}
