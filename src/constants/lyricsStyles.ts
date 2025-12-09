/**
 * 가사 스타일 기본값 정의
 * Default lyrics style configurations
 *
 * 사용자 커스터마이징을 위한 기본값
 * - 개별 스타일: 특정 가사 타입에만 적용
 */

import {
  DualHighlightLyricsStyleConfig,
  FullLyricsStyleConfig,
  SingleLineLyricsStyleConfig,
} from '@lib/types/lyricsStyles';

/**
 * 색상 상수 (모달 및 기본값에서 사용)
 */
export const DEFAULT_LYRICS_COLOR = '#ffffff';
export const DEFAULT_HIGHLIGHT_COLOR = '#357aff';
export const DEFAULT_PRONUNCIATION_COLOR = '#F5F5F5';

/**
 * DualHighlightLyrics 개별 스타일 기본값
 * 전역 스타일을 오버라이드하려면 여기에 정의
 */
export const DEFAULT_DUAL_HIGHLIGHT_STYLE: DualHighlightLyricsStyleConfig = {
  // 가사 스타일 (파란색 하이라이트)
  lyrics: {
    default: {
      color: DEFAULT_LYRICS_COLOR,
    },
    highlight: {
      color: DEFAULT_HIGHLIGHT_COLOR,
      fontWeight: 700,
    },
  },

  // 발음 스타일
  pronunciation: {
    default: {
      color: DEFAULT_PRONUNCIATION_COLOR,
      opacity: 1,
    },
    highlight: {
      color: DEFAULT_PRONUNCIATION_COLOR,
      opacity: 1,
    },
  },
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
      color: DEFAULT_PRONUNCIATION_COLOR,
      opacity: 1,
    },
    highlight: {
      color: DEFAULT_PRONUNCIATION_COLOR,
      opacity: 1,
      // 그라데이션 배경 제거
      webkitTextFillColor: 'initial',
      background: 'none',
    },
  },
};

/**
 * SingleLineLyrics 개별 스타일 기본값
 * single은 기본/하이라이트 구분 없음
 */
export const DEFAULT_SINGLE_LINE_STYLE: SingleLineLyricsStyleConfig = {
  // Single은 항상 흰색 기본값
  lyrics: {
    color: DEFAULT_LYRICS_COLOR,
  },
  pronunciation: {
    color: DEFAULT_PRONUNCIATION_COLOR,
  },
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
