/**
 * 가사 스타일 병합 유틸리티
 * Lyrics style merging utilities
 *
 * 전역 스타일과 개별 컴포넌트 스타일을 병합하는 로직
 */

import {
  TextStyleOptions,
  LyricsTextState,
  DualHighlightLyricsStyleConfig,
  FullLyricsStyleConfig,
  SingleLineLyricsStyleConfig,
} from '@lib/types/lyricsStyles';
import {
  DEFAULT_DUAL_HIGHLIGHT_STYLE,
  DEFAULT_FULL_LYRICS_STYLE,
  DEFAULT_SINGLE_LINE_STYLE,
} from '@constants/lyricsStyles';

/**
 * TextStyleOptions 병합
 */
function mergeTextStyle(...styles: (TextStyleOptions | undefined)[]): TextStyleOptions {
  const filtered = styles.filter((s): s is TextStyleOptions => !!s);
  return filtered.reduce((acc, style) => ({ ...acc, ...style }), {} as TextStyleOptions);
}

/**
 * LyricsTextState 병합
 */
function mergeLyricsTextState(...states: (LyricsTextState | undefined)[]): LyricsTextState {
  const defaultStyles = states.map((state) => state?.default).filter(Boolean);
  const highlightStyles = states.map((state) => state?.highlight).filter(Boolean);

  // LyricsTextState expects TextStyleOptions for both `default` and `highlight`.
  // Ensure we always return an object (possibly empty) to satisfy the type.
  return {
    default: defaultStyles.length > 0 ? mergeTextStyle(...defaultStyles) : ({} as TextStyleOptions),
    highlight: highlightStyles.length > 0 ? mergeTextStyle(...highlightStyles) : ({} as TextStyleOptions),
  };
}

/**
 * DualHighlightLyrics 스타일 병합
 * 우선순위: 사용자 개별 스타일 > 개별 기본값
 */
export function mergeDualHighlightStyles(componentStyle?: Partial<DualHighlightLyricsStyleConfig>): {
  lyrics: LyricsTextState;
  pronunciation: LyricsTextState;
  pronunciationAsMainHighlight: boolean;
} {
  return {
    lyrics: mergeLyricsTextState(DEFAULT_DUAL_HIGHLIGHT_STYLE.lyrics, componentStyle?.lyrics),
    pronunciation: mergeLyricsTextState(DEFAULT_DUAL_HIGHLIGHT_STYLE.pronunciation, componentStyle?.pronunciation),
    pronunciationAsMainHighlight: componentStyle?.pronunciationAsMainHighlight ?? false,
  };
}

/**
 * FullLyrics 스타일 병합
 * 우선순위: 사용자 개별 스타일 > 개별 기본값
 */
export function mergeFullLyricsStyles(componentStyle?: Partial<FullLyricsStyleConfig>): {
  lyrics: LyricsTextState;
  pronunciation: LyricsTextState;
  pronunciationAsMainHighlight: boolean;
} {
  return {
    lyrics: mergeLyricsTextState(DEFAULT_FULL_LYRICS_STYLE.lyrics, componentStyle?.lyrics),
    pronunciation: mergeLyricsTextState(DEFAULT_FULL_LYRICS_STYLE.pronunciation, componentStyle?.pronunciation),
    pronunciationAsMainHighlight: componentStyle?.pronunciationAsMainHighlight ?? false,
  };
}

/**
 * SingleLineLyrics 스타일 병합
 * single은 기본/하이라이트 구분 없음
 * 우선순위: 사용자 개별 스타일 > 개별 기본값
 */
export function mergeSingleLineStyles(componentStyle?: Partial<SingleLineLyricsStyleConfig>): {
  lyrics: TextStyleOptions;
  pronunciation: TextStyleOptions;
} {
  return {
    lyrics: mergeTextStyle(DEFAULT_SINGLE_LINE_STYLE.lyrics, componentStyle?.lyrics),
    pronunciation: mergeTextStyle(DEFAULT_SINGLE_LINE_STYLE.pronunciation, componentStyle?.pronunciation),
  };
}
