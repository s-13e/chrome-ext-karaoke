/**
 * 가사 스타일 기본값 정의
 * Default lyrics style configurations
 *
 * 사용자 커스터마이징을 위한 기본값
 * - 전역 스타일: 모든 가사 타입에 공통 적용
 * - 개별 스타일: 특정 가사 타입에만 적용 (전역 스타일 오버라이드)
 */

import {
  GlobalLyricsStyleConfig,
  DualHighlightLyricsStyleConfig,
  FullLyricsStyleConfig,
  SingleLineLyricsStyleConfig,
} from '@lib/types/lyricsStyles';

/**
 * 전역 가사 스타일 기본값
 * 모든 가사 타입(dual, full, single)에 공통 적용
 */
export const DEFAULT_GLOBAL_LYRICS_STYLE: GlobalLyricsStyleConfig = {
  // 전역 가사 스타일
  lyrics: {
    // 기본 상태 (dual: 타임스탬프 전, full: 재생 중 아님)
    default: {
      // fontColor prop 사용
    },
    // 하이라이트 상태 (현재 재생 중)
    highlight: {
      color: 'blue',
    },
  },

  // 전역 발음 스타일 (기본적으로 효과 없음)
  pronunciation: {
    default: {
      // pronunciationColor prop 사용
    },
    highlight: {
      // pronunciationColor prop 사용 (기본적으로 하이라이트 효과 없음)
    },
  },

  // 발음이 메인을 대체할 때 스타일
  pronunciationAsMain: {
    default: {
      // fontColor prop 사용
    },
    highlight: {
      color: 'blue',
    },
  },
};

/**
 * DualHighlightLyrics 개별 스타일 기본값
 * 전역 스타일을 오버라이드하려면 여기에 정의
 */
export const DEFAULT_DUAL_HIGHLIGHT_STYLE: DualHighlightLyricsStyleConfig = {
  // 기본적으로 전역 스타일 사용
};

/**
 * FullLyrics 개별 스타일 기본값
 * full은 특별한 그라데이션 효과가 있음
 */
export const DEFAULT_FULL_LYRICS_STYLE: FullLyricsStyleConfig = {
  // 가사 스타일 (전역 스타일 오버라이드)
  lyrics: {
    default: {
      color: '#f3f3f3',
      fontWeight: 500,
      transition: 'color 0.15s, font-size 0.15s',
    },
    highlight: {
      color: '#fff',
      fontWeight: 700,
      background: 'linear-gradient(90deg, #357aff, #e91e63 80%)',
      backgroundClip: 'text',
      webkitBackgroundClip: 'text',
      webkitTextFillColor: 'transparent',
      transition: 'color 0.15s, font-size 0.15s',
    },
  },

  // 발음 스타일 (전역 스타일 오버라이드)
  pronunciation: {
    default: {
      opacity: 0.6,
    },
    highlight: {
      opacity: 0.85,
      fontWeight: 600,
      // 그라데이션 배경 제거
      webkitTextFillColor: 'initial',
      background: 'none',
    },
  },

  // 발음이 메인을 대체할 때 스타일
  pronunciationAsMain: {
    default: {
      color: '#f3f3f3',
      fontWeight: 500,
      transition: 'color 0.15s, font-size 0.15s',
      opacity: 0.6,
    },
    highlight: {
      color: '#fff',
      fontWeight: 700,
      background: 'linear-gradient(90deg, #357aff, #e91e63 80%)',
      backgroundClip: 'text',
      webkitBackgroundClip: 'text',
      webkitTextFillColor: 'transparent',
      transition: 'color 0.15s, font-size 0.15s',
      opacity: 0.85,
    },
  },
};

/**
 * SingleLineLyrics 개별 스타일 기본값
 * single은 기본/하이라이트 구분 없음
 */
export const DEFAULT_SINGLE_LINE_STYLE: SingleLineLyricsStyleConfig = {
  // 기본적으로 전역 스타일 사용
};

/**
 * 카운트다운 색상 기본값
 */
export const DEFAULT_COUNTDOWN_COLORS = {
  // 첫 가사 카운트다운 색상
  firstLyric: '#ffcc00',
  // 아카펠라 녹음 카운트다운 색상
  acapella: '#FFEB3B',
};
