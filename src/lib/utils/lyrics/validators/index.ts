/**
 * 가사 유효성 검증 모듈
 * LRC 가사의 다양한 문제를 감지하고 정제하는 유틸리티 모음
 */

// 개별 검증기 export
export { isRomanizedLyrics, testRomanizationDetector } from './romanizationDetector';
export { hasEnhancedTimestamps, removeEnhancedTimestamps } from './duplicateTimestampDetector';
export { hasMixedTranslation, removeTranslation } from './mixedTranslationDetector';

/**
 * 가사 문제 유형
 */
export type LyricsIssueType = 'romanized' | 'enhanced_timestamps' | 'mixed_translation' | 'none';

/**
 * 가사 검증 결과
 */
export interface LyricsValidationResult {
  /** 유효한 가사인지 여부 */
  valid: boolean;
  /** 감지된 문제 유형 */
  issues: LyricsIssueType[];
  /** 정제 가능 여부 */
  cleanable: boolean;
}

/**
 * 가사 종합 검증
 * 모든 검증기를 실행하여 문제를 감지
 *
 * @param lyrics - LRC 형식 가사 문자열
 * @returns 검증 결과 (문제 유형, 정제 가능 여부 포함)
 */
export function validateLyrics(lyrics: string): LyricsValidationResult {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { isRomanizedLyrics } = require('./romanizationDetector');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { hasEnhancedTimestamps } = require('./duplicateTimestampDetector');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { hasMixedTranslation } = require('./mixedTranslationDetector');

  const issues: LyricsIssueType[] = [];

  // 1. 로마자 가사 체크
  if (isRomanizedLyrics(lyrics)) {
    issues.push('romanized');
  }

  // 2. Enhanced LRC (단어별 타임스탬프) 체크
  if (hasEnhancedTimestamps(lyrics)) {
    issues.push('enhanced_timestamps');
  }

  // 3. 원문+번역 혼합 체크
  if (hasMixedTranslation(lyrics)) {
    issues.push('mixed_translation');
  }

  // 정제 가능 여부 판단
  // - 로마자: 정제 불가 (다른 가사 필요)
  // - Enhanced LRC: 정제 가능
  // - 혼합 번역: 정제 가능
  const cleanable = !issues.includes('romanized') && issues.length > 0;

  return {
    valid: issues.length === 0,
    issues: issues.length > 0 ? issues : ['none'],
    cleanable,
  };
}

/**
 * 가사 정제
 * 감지된 문제를 정제하여 사용 가능한 가사로 변환
 *
 * @param lyrics - LRC 형식 가사 문자열
 * @param issues - 감지된 문제 유형 배열
 * @returns 정제된 가사 문자열
 *
 * 주의: 로마자 가사는 정제 불가 (원본 반환)
 */
export function cleanLyrics(lyrics: string, issues: LyricsIssueType[]): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { removeEnhancedTimestamps } = require('./duplicateTimestampDetector');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { removeTranslation } = require('./mixedTranslationDetector');

  let cleaned = lyrics;

  // Enhanced LRC 정제
  if (issues.includes('enhanced_timestamps')) {
    cleaned = removeEnhancedTimestamps(cleaned);
  }

  // 혼합 번역 정제
  if (issues.includes('mixed_translation')) {
    cleaned = removeTranslation(cleaned);
  }

  return cleaned;
}
