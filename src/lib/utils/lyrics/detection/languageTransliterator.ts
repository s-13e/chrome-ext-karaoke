// src/lib/utils/lyrics/languageTransliterator.ts

import { chineseRomanizer } from '../romanizers/chineseRomanizer';
import { japaneseRomanizer } from '../romanizers/japaneseRomanizer';
import { koreanRomanizer } from '../romanizers/koreanRomanizer';
import type { ScriptSpan } from './languageSpanSplitter';

// 변환 불필요 언어나 미지원 스크립트는 그대로 반환
const transliterators: Record<string, (text: string) => Promise<string>> = {
  ko: async (text) => {
    console.log('[koreanRomanizer] 호출됨, text:', text);
    const result = koreanRomanizer(text);
    console.log('[koreanRomanizer] 결과:', result);
    return Promise.resolve(result);
  },
  ja: (text) => japaneseRomanizer(text),
  zh: (text) => chineseRomanizer(text), // 여기에 병음 변환 연결
  th: async (text) => Promise.resolve(text),
  ar: async (text) => Promise.resolve(text),
  he: async (text) => Promise.resolve(text),
  deva: async (text) => Promise.resolve(text),
  cyrl: async (text) => Promise.resolve(text),
  other: async (text) => Promise.resolve(text),
};

export async function transliterateSpans(spans: ScriptSpan[]): Promise<ScriptSpan[]> {
  console.log('[transliterateSpans] 시작, spans:', spans);

  return Promise.all(
    spans.map(async (span) => {
      const langKey = span.lang ?? 'other';
      console.log(`[transliterateSpans] 변환 시 langKey: ${langKey}, text: ${span.text}`);

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
  console.log('[mergeSpans] 변환된 spans:', spans);
  return spans.map((s) => s.text).join('');
}

export async function transliterateAndMerge(spans: ScriptSpan[]) {
  const converted = await transliterateSpans(spans);
  return mergeSpans(converted);
}
