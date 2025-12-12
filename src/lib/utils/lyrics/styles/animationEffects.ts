/**
 * 가사 하이라이트 애니메이션 효과 유틸리티
 * Lyrics highlight animation effects utilities
 */
import React from 'react';

/**
 * 애니메이션 효과 적용
 * @param animation - 애니메이션 타입 ('none' | 'fade' | 'scale' | 'glow')
 * @param isHighlight - 하이라이트 상태인지 여부
 * @returns 적용할 스타일 객체
 */
export function getAnimationStyles(animation: string | undefined, isHighlight: boolean): React.CSSProperties {
  if (!isHighlight || !animation || animation === 'none') {
    return {};
  }

  switch (animation) {
    case 'fade':
      return {
        opacity: 1,
        transition: 'opacity 0.3s ease-in-out',
      };

    case 'scale':
      return {
        transform: 'scale(1.05)',
        transition: 'transform 0.3s ease-in-out',
      };

    case 'glow':
      return {
        textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
        transition: 'text-shadow 0.3s ease-in-out',
      };

    default:
      return {};
  }
}

/**
 * 기본 상태(non-highlight) 스타일 적용
 * @param animation - 애니메이션 타입
 * @returns 적용할 스타일 객체
 */
export function getDefaultAnimationStyles(animation: string | undefined): React.CSSProperties {
  if (!animation || animation === 'none') {
    return {};
  }

  switch (animation) {
    case 'fade':
      return {
        opacity: 0.5,
        transition: 'opacity 0.3s ease-in-out',
      };

    case 'scale':
      return {
        transform: 'scale(1)',
        transition: 'transform 0.3s ease-in-out',
      };

    case 'glow':
      return {
        transition: 'text-shadow 0.3s ease-in-out',
      };

    default:
      return {};
  }
}
