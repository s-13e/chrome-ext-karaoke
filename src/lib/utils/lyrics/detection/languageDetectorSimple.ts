// src/lib/utils/lyrics/languageDetectorSimple.ts
export type DetectedLanguageCode = 'ko' | 'ja' | 'th' | 'ar' | 'he' | 'deva' | 'cyrl' | 'other';

type LanguageScriptDetector = {
  lang: DetectedLanguageCode;
  test: (char: string) => boolean;
};

const detectors: LanguageScriptDetector[] = [
  {
    lang: 'ko', // 한국어
    test: (c) => /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7A3]/.test(c),
  },
  {
    lang: 'ja', // 일본어
    test: (c) => /[\u3040-\u309F\u30A0-\u30FF]/.test(c), // 히라가나, 가타카나
  },
  { lang: 'th', test: (c) => /[\u0E00-\u0E7F]/.test(c) }, // 태국어
  { lang: 'ar', test: (c) => /[\u0600-\u06FF]/.test(c) }, // 아랍어
  { lang: 'he', test: (c) => /[\u0590-\u05FF]/.test(c) }, // 히브리어
  { lang: 'deva', test: (c) => /[\u0900-\u097F]/.test(c) }, // 데바나가리
  { lang: 'cyrl', test: (c) => /[\u0400-\u04FF]/.test(c) }, // 키릴문자,
];

export function detectScript(char: string): DetectedLanguageCode {
  const found = detectors.find((d) => d.test(char));
  return found ? found.lang : 'other';
}
