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
  if (isKanji(char)) return 'kanji';
  // 여기에 다른 문자 감지 함수 추가 가능
  return 'other';
}

/**
 * 텍스트를 언어별로 스팬으로 분리(일본어와 중국어는 한자 구분을 위해 별도 처리)
 * @param text 분리 대상 문자열
 */ export function splitIntoLangGroups(text: string): ScriptSpan[] {
  if (!text) return [];

  const spans: ScriptSpan[] = [];
  let buffer = '';
  let currentLang: string | null = null;

  // 한자 포함 스팬에선 일본어와 중국어 구분을 나중에 할 예정
  // 스팬 내에서 한자 포함 여부 검사용
  let hasJapaneseKanaInSpan = false;

  for (const char of text) {
    const lang = detectLanguage(char);

    if (currentLang === null) {
      // 새 스팬 시작
      buffer = char;
      currentLang = lang;

      hasJapaneseKanaInSpan = lang === 'ja';
    } else if (lang === currentLang) {
      // 같은 언어 스팬 계속 추가
      buffer += char;

      if (lang === 'ja') hasJapaneseKanaInSpan = true;
    } else {
      // 스팬 종료 전 일본어/중국어 구간 분리 처리
      if (currentLang === 'ja' || currentLang === 'kanji') {
        // 한자 포함 여부에 따라 스팬 언어 결정
        const effectiveLang = hasJapaneseKanaInSpan ? 'ja' : 'zh'; // 'zh'는 한자만 있을 때
        spans.push({ lang: effectiveLang, text: buffer });
      } else {
        spans.push({ lang: currentLang, text: buffer });
      }

      // 새 스팬 초기화
      buffer = char;
      currentLang = lang;
      hasJapaneseKanaInSpan = lang === 'ja';
    }
  }

  // 마지막 스팬 처리
  if (buffer) {
    if (currentLang === 'ja' || currentLang === 'kanji') {
      const effectiveLang = hasJapaneseKanaInSpan ? 'ja' : 'zh';
      spans.push({ lang: effectiveLang, text: buffer });
    } else {
      spans.push({ lang: currentLang, text: buffer });
    }
  }

  return spans;
}
