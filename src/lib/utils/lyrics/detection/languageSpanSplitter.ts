export type ScriptSpan = {
  lang: string | null;
  text: string;
};

const isKorean = (c: string) => /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7A3]/.test(c); // 한글(초중종성, 호환, 완성)
const isJapaneseKana = (c: string) => /[\u3040-\u309F\u30A0-\u30FF]/.test(c); // 히라가나, 가타카나
const isKanji = (c: string) => /[\u4E00-\u9FFF]/.test(c);

function detectLanguage(char: string): string {
  if (isKorean(char)) return 'ko';
  if (isJapaneseKana(char)) return 'ja';
  if (isKanji(char)) return 'kanji'; // 한자는 컨텍스트에 따라 ja/zh 결정
  return 'other';
}

/**
 * 텍스트를 언어별로 스팬으로 분리 (가사 한 줄 단위로 일본어/중국어 판단)
 * @param text 분리 대상 문자열
 */ export function splitIntoLangGroups(text: string): ScriptSpan[] {
  if (!text) return [];

  // 전체 텍스트에서 일본어 가나 문자 존재 여부 미리 확인
  const hasJapaneseKanaInLine = [...text].some((char) => isJapaneseKana(char));

  const spans: ScriptSpan[] = [];
  let buffer = '';
  let currentLang: string | null = null;

  for (const char of text) {
    let lang = detectLanguage(char);

    // 한자 처리: 같은 줄에 일본어 가나가 있으면 일본어로 처리
    if (lang === 'kanji') {
      lang = hasJapaneseKanaInLine ? 'ja' : 'zh';
    }

    if (currentLang === null) {
      // 새 스팬 시작
      buffer = char;
      currentLang = lang;
    } else if (lang === currentLang) {
      // 같은 언어 스팬 계속 추가
      buffer += char;
    } else {
      // 언어가 바뀔 때 스팬 종료
      spans.push({ lang: currentLang, text: buffer });

      // 새 스팬 초기화
      buffer = char;
      currentLang = lang;
    }
  }

  // 마지막 스팬 처리
  if (buffer) {
    spans.push({ lang: currentLang, text: buffer });
  }

  return spans;
}
