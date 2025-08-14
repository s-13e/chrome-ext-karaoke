import { useEffect, useState } from 'react';
import { splitByScript } from '@lib/utils/lyrics/detection/languageSpanSplitter';
import { transliterateAndMerge } from '@lib/utils/lyrics/detection/languageTransliterator';

// 여러 줄의 가사를 한 번에 변환
export function usePronunciations(lines: string[]) {
  const [list, setList] = useState<string[]>(() => Array(lines.length).fill(''));

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const results: string[] = [];
      for (const text of lines) {
        if (!text) {
          results.push('');
          continue;
        }
        try {
          const spans = splitByScript(text);
          const converted = await transliterateAndMerge(spans);
          results.push(converted);
        } catch (err) {
          console.error('[usePronunciations] 변환 오류:', err);
          results.push('');
        }
      }
      if (!cancelled) {
        setList(results);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lines]);

  return list;
}
