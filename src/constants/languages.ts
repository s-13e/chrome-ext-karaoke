// 언어 관련 상수
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
export const SUPPORTED_LANGUAGES = ['en', 'ko', 'ja', 'zh-CN', 'zh-TW', 'es', 'pt'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const MAX_RETRIES = 3;
export const INITIAL_DELAY = 1000; // 1초

export const NATIVE_LANGUAGE_NAMES = {
  en: 'English',
  ko: '한국어',
  ja: '日本語',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  es: 'Español',
  pt: 'Português',
} as const;

// i18next 네임스페이스
export const I18N_NAMESPACE = 'translation' as const;
