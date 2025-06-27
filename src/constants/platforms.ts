// src/constants/platforms.ts
import { DetectionConfig } from '@lib/types/config';
import { YOUTUBE_HOST, YOUTUBE_REGEX } from './youtubeSelectors';

export const YOUTUBE_CONFIG: DetectionConfig = {
  hostSuffix: YOUTUBE_HOST,
  urlRegex: YOUTUBE_REGEX,
};

// 추후 다른 플랫폼 설정 추가 가능
// export const NETFLIX_CONFIG: DetectionConfig = { ... };
