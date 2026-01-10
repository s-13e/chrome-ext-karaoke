// src/lib/utils/lyrics/languageTransliterator.ts

import type { ScriptSpan } from './languageSpanSplitter';

// 로마나이저 캐시 (한 번 로드된 라이브러리는 재사용)
const romanizerCache: Record<string, (text: string) => Promise<string>> = {};

/**
 * Language code to romanization function mapping (Lazy Loading)
 *
 * Supported languages:
 * - ko: Korean (dedicated library: @daun_jung/korean-romanizer)
 * - ja: Japanese (dedicated library: kuroshiro)
 * - zh: Chinese Mandarin (dedicated library: pinyin)
 * - th: Thai (dedicated library: @dehoist/romanize-thai - RTGS)
 * - ar: Arabic (dedicated library: arabic-transliterate - IJMES)
 * - hi: Hindi (dedicated library: @indic-transliteration/sanscript - IAST)
 * - el: Greek (직접 구현 매핑 테이블)
 * - ka: Georgian (직접 구현 매핑 테이블)
 * - he: Hebrew (직접 구현 매핑 테이블)
 * - hy: Armenian (직접 구현 매핑 테이블)
 */
const getRomanizer = async (langKey: string): Promise<(text: string) => Promise<string>> => {
  // 이미 로드된 romanizer가 있으면 캐시에서 반환
  if (romanizerCache[langKey]) {
    return romanizerCache[langKey];
  }

  // 언어별 동적 import (메모리 최적화: 필요한 언어만 로드)
  let romanizer: (text: string) => Promise<string>;

  switch (langKey) {
    case 'ko': {
      const { koreanRomanizer } = await import('../romanizers/koreanRomanizer');
      romanizer = async (text) => Promise.resolve(koreanRomanizer(text));
      break;
    }
    case 'ja': {
      const { japaneseRomanizer } = await import('../romanizers/japaneseRomanizer');
      romanizer = async (text) => japaneseRomanizer(text);
      break;
    }
    case 'zh': {
      const { chineseRomanizer } = await import('../romanizers/chineseRomanizer');
      romanizer = (text) => chineseRomanizer(text);
      break;
    }
    case 'th': {
      const { thaiRomanizer } = await import('../romanizers/thaiRomanizer');
      romanizer = async (text) => Promise.resolve(thaiRomanizer(text));
      break;
    }
    case 'ar': {
      const { arabicRomanizer } = await import('../romanizers/arabicRomanizer');
      romanizer = async (text) => Promise.resolve(arabicRomanizer(text));
      break;
    }
    case 'hi': {
      const { hindiRomanizer } = await import('../romanizers/hindiRomanizer');
      romanizer = async (text) => Promise.resolve(hindiRomanizer(text));
      break;
    }
    case 'el':
    case 'he':
    case 'ka':
    case 'hy': {
      const { universalRomanizer } = await import('../romanizers/universalRomanizer');
      romanizer = async (text) => Promise.resolve(universalRomanizer(text));
      break;
    }
    default:
      // Fallback: 원본 텍스트 반환
      romanizer = async (text) => Promise.resolve(text);
  }

  // 캐시에 저장
  romanizerCache[langKey] = romanizer;
  return romanizer;
};

export async function transliterateSpans(spans: ScriptSpan[]): Promise<ScriptSpan[]> {
  return Promise.all(
    spans.map(async (span) => {
      const langKey = span.lang ?? 'other';

      // 언어별 romanizer를 동적으로 로드
      const converter = await getRomanizer(langKey);

      return {
        lang: span.lang,
        text: await converter(span.text),
      };
    }),
  );
}

export function mergeSpans(spans: ScriptSpan[]) {
  return spans.map((s) => s.text).join('');
}

export async function transliterateAndMerge(spans: ScriptSpan[]) {
  const converted = await transliterateSpans(spans);
  return mergeSpans(converted);
}
