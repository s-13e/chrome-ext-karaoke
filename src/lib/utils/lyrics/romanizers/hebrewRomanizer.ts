/**
 * 히브리어 로마자 변환기
 * ISO 259 표준 기반
 */

// 히브리어 → 로마자 매핑 테이블
const hebrewToRomanMap: Record<string, string> = {
  // 자음 (22개 기본 문자)
  א: 'a', // Alef
  ב: 'b', // Bet
  ג: 'g', // Gimel
  ד: 'd', // Dalet
  ה: 'h', // He
  ו: 'v', // Vav
  ז: 'z', // Zayin
  ח: 'h', // Het
  ט: 't', // Tet
  י: 'y', // Yod
  כ: 'k', // Kaf
  ך: 'k', // Kaf final
  ל: 'l', // Lamed
  מ: 'm', // Mem
  ם: 'm', // Mem final
  נ: 'n', // Nun
  ן: 'n', // Nun final
  ס: 's', // Samekh
  ע: 'a', // Ayin
  פ: 'p', // Pe
  ף: 'p', // Pe final
  צ: 'ts', // Tsadi
  ץ: 'ts', // Tsadi final
  ק: 'k', // Qof
  ר: 'r', // Resh
  ש: 'sh', // Shin
  ת: 't', // Tav

  // 모음 기호 (니쿠드 - Nikud)
  'ָ': 'a', // Kamatz
  'ַ': 'a', // Patah
  'ֶ': 'e', // Segol
  'ֵ': 'e', // Tsere
  'ִ': 'i', // Hiriq
  'ֹ': 'o', // Holam
  'ֻ': 'u', // Kubutz
  'ּ': '', // Dagesh (무시)
  'ְ': '', // Shva (무시)
  'ֱ': 'e', // Hataf Segol
  'ֲ': 'a', // Hataf Patah
  'ֳ': 'o', // Hataf Kamatz
  'ֽ': '', // Meteg (무시)
  'ֿ': '', // Rafe (무시)
};

/**
 * 히브리어 텍스트를 로마자로 변환
 *
 * @param text - 히브리어 텍스트
 * @returns 로마자 변환된 텍스트
 *
 * @example
 * hebrewRomanizer('שלום') // 'shlm'
 * hebrewRomanizer('תודה') // 'tvdh'
 */
export function hebrewRomanizer(text: string): string {
  if (!text) return '';

  let result = '';
  for (const char of text) {
    const mapped = hebrewToRomanMap[char];
    if (mapped !== undefined) {
      result += mapped;
    } else {
      result += char;
    }
  }

  return result;
}
