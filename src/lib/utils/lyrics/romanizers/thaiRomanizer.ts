/**
 * 태국어 로마자 변환기
 * RTGS (Royal Thai General System of Transcription) 기반
 *
 * 사용 라이브러리: @dehoist/romanize-thai
 * 라이선스: MPL-2.0
 */

import romanize from '@dehoist/romanize-thai';

/**
 * 태국어 텍스트를 RTGS 표준에 따라 로마자로 변환
 *
 * @param text - 태국어 텍스트
 * @returns 로마자 변환된 텍스트
 *
 * @example
 * thaiRomanizer('สวัสดี') // 'swasdi'
 * thaiRomanizer('ขอบคุณ') // 'khopkhun'
 */
export function thaiRomanizer(text: string): string {
  if (!text) return '';

  try {
    return romanize(text);
  } catch (error) {
    console.error('[thaiRomanizer] 변환 실패:', error);
    return text;
  }
}
