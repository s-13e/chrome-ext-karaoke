/**
 * Font size calculation utilities
 * CSS clamp() 값을 JavaScript로 계산
 */

/**
 * CSS clamp(min, preferred, max) 계산
 * @param min 최소값 (px)
 * @param preferredCalc preferred 계산식 (예: "calc(0.8vw + 0.8vh)")
 * @param max 최대값 (px)
 * @returns 현재 뷰포트 기준 계산된 px 값
 */
export function calculateClamp(min: number, preferredCalc: string, max: number): number {
  const vw = window.innerWidth / 100;
  const vh = window.innerHeight / 100;

  // "calc(0.8vw + 0.8vh)" 같은 형식 파싱
  const vwMatch = preferredCalc.match(/([\d.]+)vw/);
  const vhMatch = preferredCalc.match(/([\d.]+)vh/);

  const vwValue = vwMatch && vwMatch[1] ? parseFloat(vwMatch[1]) * vw : 0;
  const vhValue = vhMatch && vhMatch[1] ? parseFloat(vhMatch[1]) * vh : 0;

  const calculated = vwValue + vhValue;

  return Math.round(Math.max(min, Math.min(calculated, max)));
}

/**
 * Dual 가사 폰트 크기 계산
 */
export function calculateDualFontSizes() {
  // Dual은 CSS에서 rem 단위 사용하므로 실제 rem 값을 동적으로 가져와야 함
  // clamp(1rem, calc(1.2rem + 1vw), 2.2rem)

  // 실제 rem 값 계산 (일반적으로 16px이지만 사용자 설정에 따라 다를 수 있음)
  const remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);

  const min = remInPx; // 1rem
  const max = 2.2 * remInPx; // 2.2rem
  const vw = window.innerWidth / 100;
  const calculated = 1.2 * remInPx + vw; // 1.2rem + 1vw

  // Math.ceil로 올림 처리하여 정수로 만듦 (21.9917 -> 22)
  return Math.ceil(Math.max(min, Math.min(calculated, max)));
}

/**
 * Full 가사 폰트 크기 계산
 */
export function calculateFullFontSizes() {
  return {
    // 기본 가사: clamp(14px, calc(0.8vw + 0.8vh), 28px)
    lyricsDefault: calculateClamp(14, 'calc(0.8vw + 0.8vh)', 28),
    // 하이라이트 가사: clamp(18px, calc(1vw + 1vh), 32px)
    lyricsHighlight: calculateClamp(18, 'calc(1vw + 1vh)', 32),
    // 발음 기본: clamp(10px, calc(0.6vw + 0.6vh), 20px)
    pronunciationDefault: calculateClamp(10, 'calc(0.6vw + 0.6vh)', 20),
    // 발음 하이라이트: clamp(11px, calc(0.65vw + 0.65vh), 22px)
    pronunciationHighlight: calculateClamp(11, 'calc(0.65vw + 0.65vh)', 22),
  };
}

/**
 * Single 가사 폰트 크기 계산
 */
export function calculateSingleFontSizes() {
  // Single 가사는 2vw
  const vw = window.innerWidth / 100;
  return {
    lyrics: Math.round(2 * vw),
    // Single 발음은 common의 .pronunciation CSS 사용: clamp(17px, calc(0.6vw + 0.6vh), 28px)
    pronunciation: calculateClamp(17, 'calc(0.6vw + 0.6vh)', 28),
  };
}

/**
 * Common (Dual에서 사용되는 LyricLine) 폰트 크기 계산
 */
export function calculateCommonFontSizes() {
  return {
    // 발음 기본: clamp(17px, calc(0.6vw + 0.6vh), 28px)
    pronunciationDefault: calculateClamp(17, 'calc(0.6vw + 0.6vh)', 28),
    // 발음만 있는 경우: clamp(20px, calc(1vw + 1vh), 36px)
    pronunciationOnly: calculateClamp(20, 'calc(1vw + 1vh)', 36),
  };
}
