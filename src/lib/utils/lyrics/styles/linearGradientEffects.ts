/**
 * Linear Gradient 효과 유틸리티
 * Linear gradient effect utilities for lyrics text
 */

import { LinearGradientOptions } from '@lib/types/lyricsStyles';

/**
 * 방향을 degree로 변환
 */
function directionToDegree(direction: LinearGradientOptions['direction']): number {
  switch (direction) {
    case 'right':
      return 90; // 왼쪽 → 오른쪽
    case 'left':
      return 270; // 오른쪽 → 왼쪽
    case 'down':
      return 180; // 위 → 아래
    case 'up':
      return 0; // 아래 → 위
    default:
      return 90;
  }
}

/**
 * Linear Gradient 효과를 위한 CSS 속성 생성
 * Phase 1: 2색, 4방향, 위치 자동
 */
export function generateLinearGradientCSS(gradient: LinearGradientOptions): {
  backgroundImage: string;
  backgroundClip: string;
  WebkitBackgroundClip: string;
  WebkitTextFillColor: string;
  color: string;
} | null {
  if (!gradient.enabled) {
    return null;
  }

  const { color1, color2, direction } = gradient;
  const degree = directionToDegree(direction);

  // linear-gradient 생성 (위치 자동: 0%, 100%)
  const gradientCSS = `linear-gradient(${degree}deg, ${color1} 0%, ${color2} 100%)`;

  return {
    backgroundImage: gradientCSS, // background 대신 backgroundImage 사용 (React 경고 방지)
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text', // PascalCase로 변경 (React inline style 형식)
    WebkitTextFillColor: 'transparent', // PascalCase로 변경
    color: '#fff', // Full과 동일한 fallback
  };
}
