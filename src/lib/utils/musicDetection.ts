// lib/utils/musicDetection.ts
export interface MusicDetectionInput {
  categoryId?: string;
  title?: string;
  description?: string;
  tags?: string[];
  channelTitle?: string;
  durationSec?: number;
}

const MUSIC_KEYWORDS = [
  // 영어
  'official',
  'mv',
  'm/v',
  'lyric',
  'cover',
  'remix',
  'ost',
  'op',
  'ed',
  'instrumental',
  'karaoke',
  // 한국어
  '가사',
  '커버',
  '노래',
  // 일본어
  '歌ってみた',
];

export function scoreMusicVideo(meta: MusicDetectionInput): number {
  let score = 0;
  if (meta.categoryId === '10') score += 3;

  if (meta.title && MUSIC_KEYWORDS.some((k) => meta.title?.toLowerCase().includes(k))) score += 2;
  if (meta.description && MUSIC_KEYWORDS.some((k) => meta.description?.toLowerCase().includes(k))) score += 1;
  if (meta.tags && meta.tags.some((tag) => MUSIC_KEYWORDS.some((k) => tag.toLowerCase().includes(k)))) score += 1;
  if (meta.durationSec && meta.durationSec >= 60 && meta.durationSec <= 600) score += 1;
  // 채널명 등 추가 휴리스틱 가능

  return score;
}

export function isMusicVideo(meta: MusicDetectionInput, threshold = 3): boolean {
  return scoreMusicVideo(meta) >= threshold;
}
