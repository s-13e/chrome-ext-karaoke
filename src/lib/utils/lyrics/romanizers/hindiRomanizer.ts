/**
 * 힌디어 로마자 변환기
 * Devanagari 스크립트를 로마자로 변환
 *
 * 사용 라이브러리: @indic-transliteration/sanscript
 * 라이선스: MIT
 */

import Sanscript from '@indic-transliteration/sanscript';

/**
 * 힌디어(데바나가리) 텍스트를 로마자로 변환
 *
 * @param text - 힌디어 텍스트
 * @returns 로마자 변환된 텍스트 (IAST 표준)
 *
 * @example
 * hindiRomanizer('नमस्ते') // 'namaste'
 * hindiRomanizer('धन्यवाद') // 'dhanyavaad'
 */
export function hindiRomanizer(text: string): string {
  if (!text) return '';

  try {
    // Devanagari를 IAST (International Alphabet of Sanskrit Transliteration)로 변환
    return Sanscript.t(text, 'devanagari', 'iast');
  } catch (error) {
    console.error('[hindiRomanizer] 변환 실패:', error);
    return text;
  }
}
