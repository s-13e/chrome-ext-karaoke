// lib/types/config.ts
export interface DetectionConfig {
  hostSuffix: string;
  urlRegex: RegExp;
}

export interface PlatformConfig extends DetectionConfig {
  name: string;
  contentSelector: string;
  // 추후 확장 가능한 설정들
}
