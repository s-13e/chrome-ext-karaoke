/**
 * 범용 로마자 변환기
 * 여러 언어를 자동 감지하여 로마자로 변환
 *
 * 현재 지원 언어:
 * - 그리스어 (Greek)
 * - 히브리어 (Hebrew)
 * - 조지아어 (Georgian)
 * - 아르메니아어 (Armenian)
 */

import { greekRomanizer } from './greekRomanizer';
import { hebrewRomanizer } from './hebrewRomanizer';
import { georgianRomanizer } from './georgianRomanizer';
import { armenianRomanizer } from './armenianRomanizer';

/**
 * 텍스트의 언어를 자동 감지하여 로마자로 변환
 *
 * @param text - 변환할 텍스트
 * @returns 로마자로 변환된 텍스트
 *
 * @example
 * universalRomanizer('Γεια σου') // 'Geia sou' (Greek)
 * universalRomanizer('שלום') // 'shlm' (Hebrew)
 * universalRomanizer('გამარჯობა') // "gamarjoba" (Georgian)
 * universalRomanizer('Բարև') // 'Barev' (Armenian)
 * universalRomanizer('Hello World') // 'Hello World' (no change)
 */
export function universalRomanizer(text: string): string {
  if (!text) return '';

  let result = '';

  for (const char of text) {
    // 그리스어 감지 (U+0370-U+03FF)
    if (/[\u0370-\u03FF]/.test(char)) {
      result += greekRomanizer(char);
    }
    // 히브리어 감지 (U+0590-U+05FF)
    else if (/[\u0590-\u05FF]/.test(char)) {
      result += hebrewRomanizer(char);
    }
    // 조지아어 감지 (U+10A0-U+10FF)
    else if (/[\u10A0-\u10FF]/.test(char)) {
      result += georgianRomanizer(char);
    }
    // 아르메니아어 감지 (U+0530-U+058F)
    else if (/[\u0530-\u058F]/.test(char)) {
      result += armenianRomanizer(char);
    }
    // 그 외는 그대로 유지
    else {
      result += char;
    }
  }

  return result;
}

// 개별 언어 romanizer 재export (편의성)
export { greekRomanizer } from './greekRomanizer';
export { hebrewRomanizer } from './hebrewRomanizer';
export { georgianRomanizer } from './georgianRomanizer';
export { armenianRomanizer } from './armenianRomanizer';
