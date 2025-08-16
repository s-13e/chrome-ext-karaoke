import { useEffect, useState } from 'react';
import { splitIntoLangGroups } from '@lib/utils/lyrics/detection/languageSpanSplitter';
import { transliterateAndMerge } from '@lib/utils/lyrics/detection/languageTransliterator';

// 여러 줄의 가사를 한 번에 변환
export function usePronunciations(lines: string[]) {
  const [list, setList] = useState<string[]>(() => Array(lines.length).fill(''));

  useEffect(() => {
    let cancelled = false;

    async function processInBatches(batchSize = 10) {
      const results: string[] = Array(lines.length).fill('');

      for (let start = 0; start < lines.length; start += batchSize) {
        const end = Math.min(start + batchSize, lines.length);
        const batch = lines.slice(start, end);

        // batch 변환 병렬 처리
        const batchResults = await Promise.all(
          batch.map(async (text) => {
            if (!text) return '';
            try {
              const spans = splitIntoLangGroups(text);
              return await transliterateAndMerge(spans);
            } catch (err) {
              console.error('[usePronunciations] 변환 오류:', err);
              return '';
            }
          }),
        );

        // 결과 갱신
        for (let i = 0; i < batchResults.length; i++) {
          results[start + i] = batchResults[i] ?? '';
        }

        // 이미 변환된 일부 리스트를 UI에 반영해서 "점진적"으로 표시
        if (!cancelled) {
          setList((prev) => {
            // 🔹 변환된 부분이 달라진 경우에만 반영
            const updated = [...prev];
            let changed = false;
            for (let i = start; i < end; i++) {
              if (updated[i] !== results[i]) {
                updated[i] = results[i] ?? '';
                changed = true;
              }
            }
            return changed ? updated : prev;
          });
        }

        // 브라우저 쉬게 하기 — 다음 batch로 넘어가기 전에 이벤트 루프를 비움
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    processInBatches();

    return () => {
      cancelled = true;
    };
  }, [lines]);

  return list;
}
