/**
 * 가사 스타일 병합 유틸리티
 * Lyrics style merging utilities
 *
 * 전역 스타일과 개별 컴포넌트 스타일을 병합하는 로직
 */

import {
  TextStyleOptions,
  LyricsTextState,
  GlobalLyricsStyleConfig,
  DualHighlightLyricsStyleConfig,
  FullLyricsStyleConfig,
  SingleLineLyricsStyleConfig,
} from '@lib/types/lyricsStyles';
import {
  DEFAULT_GLOBAL_LYRICS_STYLE,
  DEFAULT_DUAL_HIGHLIGHT_STYLE,
  DEFAULT_FULL_LYRICS_STYLE,
  DEFAULT_SINGLE_LINE_STYLE,
} from '@constants/lyricsStyles';

/**
 * TextStyleOptions 병합
 */
function mergeTextStyle(...styles: (TextStyleOptions | undefined)[]): TextStyleOptions {
  return styles.reduce((acc, style) => {
    if (!style) return acc;
    return { ...acc, ...style };
  }, {} as TextStyleOptions);
}

/**
 * LyricsTextState 병합
 */
function mergeLyricsTextState(...states: (LyricsTextState | undefined)[]): LyricsTextState {
  const defaultStyles = states.map((state) => state?.default).filter(Boolean);
  const highlightStyles = states.map((state) => state?.highlight).filter(Boolean);

  return {
    default: defaultStyles.length > 0 ? mergeTextStyle(...defaultStyles) : undefined,
    highlight: highlightStyles.length > 0 ? mergeTextStyle(...highlightStyles) : undefined,
  };
}

/**
 * DualHighlightLyrics 스타일 병합
 * 우선순위: 사용자 개별 스타일 > 개별 기본값 > 사용자 전역 스타일 > 전역 기본값
 */
export function mergeDualHighlightStyles(
  globalStyle?: Partial<GlobalLyricsStyleConfig>,
  componentStyle?: Partial<DualHighlightLyricsStyleConfig>,
): {
  lyrics: LyricsTextState;
  pronunciation: LyricsTextState;
  pronunciationAsMain: LyricsTextState;
} {
  return {
    lyrics: mergeLyricsTextState(
      DEFAULT_GLOBAL_LYRICS_STYLE.lyrics,
      globalStyle?.lyrics,
      DEFAULT_DUAL_HIGHLIGHT_STYLE.lyrics,
      componentStyle?.lyrics,
    ),
    pronunciation: mergeLyricsTextState(
      DEFAULT_GLOBAL_LYRICS_STYLE.pronunciation,
      globalStyle?.pronunciation,
      DEFAULT_DUAL_HIGHLIGHT_STYLE.pronunciation,
      componentStyle?.pronunciation,
    ),
    pronunciationAsMain: mergeLyricsTextState(
      DEFAULT_GLOBAL_LYRICS_STYLE.pronunciationAsMain,
      globalStyle?.pronunciationAsMain,
      DEFAULT_DUAL_HIGHLIGHT_STYLE.pronunciationAsMain,
      componentStyle?.pronunciationAsMain,
    ),
  };
}

/**
 * FullLyrics 스타일 병합
 * 우선순위: 사용자 개별 스타일 > 개별 기본값 > 사용자 전역 스타일 > 전역 기본값
 */
export function mergeFullLyricsStyles(
  globalStyle?: Partial<GlobalLyricsStyleConfig>,
  componentStyle?: Partial<FullLyricsStyleConfig>,
): {
  lyrics: LyricsTextState;
  pronunciation: LyricsTextState;
  pronunciationAsMain: LyricsTextState;
} {
  return {
    lyrics: mergeLyricsTextState(
      DEFAULT_GLOBAL_LYRICS_STYLE.lyrics,
      globalStyle?.lyrics,
      DEFAULT_FULL_LYRICS_STYLE.lyrics,
      componentStyle?.lyrics,
    ),
    pronunciation: mergeLyricsTextState(
      DEFAULT_GLOBAL_LYRICS_STYLE.pronunciation,
      globalStyle?.pronunciation,
      DEFAULT_FULL_LYRICS_STYLE.pronunciation,
      componentStyle?.pronunciation,
    ),
    pronunciationAsMain: mergeLyricsTextState(
      DEFAULT_GLOBAL_LYRICS_STYLE.pronunciationAsMain,
      globalStyle?.pronunciationAsMain,
      DEFAULT_FULL_LYRICS_STYLE.pronunciationAsMain,
      componentStyle?.pronunciationAsMain,
    ),
  };
}

/**
 * SingleLineLyrics 스타일 병합
 * single은 기본/하이라이트 구분 없음
 * 우선순위: 사용자 개별 스타일 > 개별 기본값 > 사용자 전역 스타일 하이라이트 > 전역 기본값 하이라이트
 */
export function mergeSingleLineStyles(
  globalStyle?: Partial<GlobalLyricsStyleConfig>,
  componentStyle?: Partial<SingleLineLyricsStyleConfig>,
): {
  lyrics: TextStyleOptions;
  pronunciation: TextStyleOptions;
  pronunciationAsMain: TextStyleOptions;
} {
  return {
    lyrics: mergeTextStyle(
      DEFAULT_GLOBAL_LYRICS_STYLE.lyrics?.highlight,
      globalStyle?.lyrics?.highlight,
      DEFAULT_SINGLE_LINE_STYLE.lyrics,
      componentStyle?.lyrics,
    ),
    pronunciation: mergeTextStyle(
      DEFAULT_GLOBAL_LYRICS_STYLE.pronunciation?.highlight,
      globalStyle?.pronunciation?.highlight,
      DEFAULT_SINGLE_LINE_STYLE.pronunciation,
      componentStyle?.pronunciation,
    ),
    pronunciationAsMain: mergeTextStyle(
      DEFAULT_GLOBAL_LYRICS_STYLE.pronunciationAsMain?.highlight,
      globalStyle?.pronunciationAsMain?.highlight,
      DEFAULT_SINGLE_LINE_STYLE.pronunciationAsMain,
      componentStyle?.pronunciationAsMain,
    ),
  };
}
