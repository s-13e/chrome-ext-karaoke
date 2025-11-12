/**
 * 아랍어 로마자 변환기
 * IJMES (International Journal of Middle East Studies) 표준 기반
 *
 * 사용 라이브러리: arabic-transliterate
 * 라이선스: ISC
 */

import arabictransliterate from 'arabic-transliterate';

/**
 * 아랍어 텍스트를 IJMES 표준에 따라 로마자로 변환
 *
 * @param text - 아랍어 텍스트
 * @returns 로마자 변환된 텍스트
 *
 * @example
 * arabicRomanizer('مرحبا') // 'marḥabā'
 * arabicRomanizer('شكرا') // 'shukran'
 */
export function arabicRomanizer(text: string): string {
  if (!text) return '';

  try {
    // 'arabic2latin' 방향으로 변환, 언어는 'Arabic'
    return arabictransliterate(text, 'arabic2latin', 'Arabic');
  } catch (error) {
    console.error('[arabicRomanizer] 변환 실패:', error);
    return text;
  }
}
