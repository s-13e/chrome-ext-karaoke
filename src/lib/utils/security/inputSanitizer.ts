/**
 * Input Sanitization Utility
 * - XSS 공격 방지
 * - Injection 공격 방지
 * - 입력 길이 제한
 */

/**
 * 사용자 입력값 정제
 * @param input 사용자 입력 문자열
 * @param maxLength 최대 길이 (기본값: 100)
 * @returns 정제된 문자열
 */
export const sanitizeInput = (input: string, maxLength: number = 100): string => {
  if (!input) return '';

  // XSS 방지: HTML 특수문자 제거
  let sanitized = input.trim().replace(/[<>"'`]/g, '');

  // 제어문자 제거 (ASCII 0-31, 127)
  sanitized = sanitized
    .split('')
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join('');

  // 최대 길이 제한
  return sanitized.substring(0, maxLength);
};

/**
 * 가사 텍스트 검증
 * @param lyrics 가사 문자열
 * @returns 유효성 여부
 */
export const validateLyricsText = (lyrics: string): boolean => {
  if (!lyrics) return false;

  // 최대 길이 체크 (50KB)
  if (lyrics.length > 50000) return false;

  // 명백한 스크립트 공격 패턴 체크
  const dangerousPatterns = [/<script/i, /javascript:/i, /onerror=/i, /onclick=/i, /onload=/i, /<iframe/i];

  return !dangerousPatterns.some((pattern) => pattern.test(lyrics));
};

/**
 * Rate Limiting 헬퍼
 */
export class RateLimiter {
  private lastCallTime: number = 0;
  private minInterval: number;

  constructor(minIntervalMs: number = 1000) {
    this.minInterval = minIntervalMs;
  }

  /**
   * API 호출 가능 여부 확인
   * @returns 호출 가능하면 true, 아니면 false
   */
  canCall(): boolean {
    const now = Date.now();
    if (now - this.lastCallTime < this.minInterval) {
      return false;
    }
    this.lastCallTime = now;
    return true;
  }

  /**
   * 다음 호출까지 남은 시간 (밀리초)
   */
  getTimeUntilNextCall(): number {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;
    return Math.max(0, this.minInterval - timeSinceLastCall);
  }
}
