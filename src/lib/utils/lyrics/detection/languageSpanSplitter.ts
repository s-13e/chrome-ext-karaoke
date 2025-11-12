export type ScriptSpan = {
  lang: string | null;
  text: string;
};

// 기존 언어 (한국어, 일본어, 중국어)
const isKorean = (c: string) => /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7A3]/.test(c); // 한글(초중종성, 호환, 완성)
const isJapaneseKana = (c: string) => /[\u3040-\u309F\u30A0-\u30FF]/.test(c); // 히라가나, 가타카나
const isKanji = (c: string) => /[\u4E00-\u9FFF]/.test(c);

// 고유 문자 체계 사용 언어 (transliteration 라이브러리 지원)
const isGreek = (c: string) => /[\u0370-\u03FF]/.test(c); // 그리스 문자
const isGeorgian = (c: string) => /[\u10A0-\u10FF\u2D00-\u2D2F]/.test(c); // 조지아 문자
const isArmenian = (c: string) => /[\u0530-\u058F]/.test(c); // 아르메니아 문자
const isThai = (c: string) => /[\u0E00-\u0E7F]/.test(c); // 태국 문자
const isArabic = (c: string) => /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(c); // 아랍 문자
const isHebrew = (c: string) => /[\u0590-\u05FF]/.test(c); // 히브리 문자
const isDevanagari = (c: string) => /[\u0900-\u097F]/.test(c); // 데바나가리 문자 (힌디어, 산스크리트어 등)

function detectLanguage(char: string): string {
  // 기존 언어 (최우선 - 이미 전용 라이브러리 있음)
  if (isKorean(char)) return 'ko';
  if (isJapaneseKana(char)) return 'ja';
  if (isKanji(char)) return 'kanji'; // 한자는 컨텍스트에 따라 ja/zh 결정

  // 고유 문자 체계 언어 (transliteration 라이브러리 지원)
  if (isGreek(char)) return 'el'; // 그리스어
  if (isGeorgian(char)) return 'ka'; // 조지아어
  if (isArmenian(char)) return 'hy'; // 아르메니아어
  if (isThai(char)) return 'th'; // 태국어
  if (isArabic(char)) return 'ar'; // 아랍어
  if (isHebrew(char)) return 'he'; // 히브리어
  if (isDevanagari(char)) return 'hi'; // 힌디어 (데바나가리)

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
