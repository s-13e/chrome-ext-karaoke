export type ScriptSpan = {
  lang: string | null;
  text: string;
};

// 한자를 포함하여 “일본어 문자 집합” 판단 함수
const isJapaneseKana = (c: string) => /[\u3040-\u309F\u30A0-\u30FF]/.test(c); // 히라가나, 가타카나
const isKanji = (c: string) => /[\u4E00-\u9FFF]/.test(c);

// 문자열을 일본어/비일본어 구간으로 분리
export function splitIntoLangGroups(text: string): ScriptSpan[] {
  const spans: ScriptSpan[] = [];
  let buffer = '';
  let currentIsJaCandidate: boolean | null = null; // ‘일본어(히라가나/가타카나/한자)’ 후보
  const hasKanaInSpan = (span: string) => [...span].some(isJapaneseKana);

  for (const char of text) {
    const isJaChar = isJapaneseKana(char) || isKanji(char);

    if (currentIsJaCandidate === null) {
      buffer = char;
      currentIsJaCandidate = isJaChar;
    } else if (isJaChar === currentIsJaCandidate) {
      buffer += char;
    } else {
      // 스팬 종료: lang 결정
      const lang = currentIsJaCandidate
        ? hasKanaInSpan(buffer)
          ? 'ja' // 히라가나/가타카나가 있으면 일본어
          : 'zh' // 한자만 있으면 중국어
        : 'other';

      spans.push({ lang, text: buffer });
      buffer = char;
      currentIsJaCandidate = isJaChar;
    }
  }

  if (buffer) {
    const lang = currentIsJaCandidate ? (hasKanaInSpan(buffer) ? 'ja' : 'zh') : 'other';
    spans.push({ lang, text: buffer });
  }
  return spans;
}
