// src/lib/utils/lyrics/languageTransliterator.ts

import { japaneseRomanizer } from '../romanizers/japaneseRomanizer';
import { koreanRomanizer } from '../romanizers/koreanRomanizer';
import type { ScriptSpan } from './languageSpanSplitter';

// 변환 불필요 언어나 미지원 스크립트는 그대로 반환
const transliterators: Record<string, (text: string) => Promise<string>> = {
  ko: async (text) => Promise.resolve(koreanRomanizer(text)),
  ja: (text) => japaneseRomanizer(text),
  zh: async (text) => Promise.resolve(text), // 중국어는 변환 없이 그대로
  th: async (text) => Promise.resolve(text),
  ar: async (text) => Promise.resolve(text),
  he: async (text) => Promise.resolve(text),
  deva: async (text) => Promise.resolve(text),
  cyrl: async (text) => Promise.resolve(text),
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
