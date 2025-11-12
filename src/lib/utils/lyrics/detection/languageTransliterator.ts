// src/lib/utils/lyrics/languageTransliterator.ts

import { chineseRomanizer } from '../romanizers/chineseRomanizer';
import { japaneseRomanizer } from '../romanizers/japaneseRomanizer';
import { koreanRomanizer } from '../romanizers/koreanRomanizer';
import { universalRomanizer } from '../romanizers/universalRomanizer';
import { thaiRomanizer } from '../romanizers/thaiRomanizer';
import { arabicRomanizer } from '../romanizers/arabicRomanizer';
import { hindiRomanizer } from '../romanizers/hindiRomanizer';
import type { ScriptSpan } from './languageSpanSplitter';

/**
 * Language code to romanization function mapping
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
const transliterators: Record<string, (text: string) => Promise<string>> = {
  // Category A: Dedicated libraries (high accuracy)
  ko: async (text) => Promise.resolve(koreanRomanizer(text)),
  ja: async (text) => japaneseRomanizer(text),
  zh: (text) => chineseRomanizer(text),
  th: async (text) => Promise.resolve(thaiRomanizer(text)), // Thai RTGS
  ar: async (text) => Promise.resolve(arabicRomanizer(text)), // Arabic IJMES
  hi: async (text) => Promise.resolve(hindiRomanizer(text)), // Hindi IAST

  // Category B: 직접 구현 매핑 테이블 (high accuracy)
  el: async (text) => Promise.resolve(universalRomanizer(text)), // Greek
  he: async (text) => Promise.resolve(universalRomanizer(text)), // Hebrew
  ka: async (text) => Promise.resolve(universalRomanizer(text)), // Georgian
  hy: async (text) => Promise.resolve(universalRomanizer(text)), // Armenian

  // Fallback
  other: async (text) => Promise.resolve(text),
};

export async function transliterateSpans(spans: ScriptSpan[]): Promise<ScriptSpan[]> {
  return Promise.all(
    spans.map(async (span) => {
      const langKey = span.lang ?? 'other';

      // 변환 함수가 없으면 기본 async 함수로 원래 텍스트 반환
      const converter = transliterators[langKey] ?? (async (txt: string) => txt);

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
