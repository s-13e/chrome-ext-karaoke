// src/components/lyrics/FullLyricsView/FullLyricsView.tsx
import React, { useRef, useEffect, useMemo, useCallback, memo } from 'react';
import styles from './styles.module.css';
import { Line } from '@lib/types/lyrics';
import { useCurrentTime } from '@hooks/useCurrentTime';
import { useFullscreenState } from '@hooks/useFullscreenState';
import { shiftFirstLyricEarlier } from '@lib/utils/lyrics/display/lyricsOffset';
import { usePronunciations } from '../common/usePronunciation';
import { FullLyricsStyleConfig, GeneralLyricsSettings } from '@lib/types/lyricsStyles';
import { mergeFullLyricsStyles } from '@lib/utils/lyrics/styles/lyricsStyleMerger';
import { DEFAULT_FONT_WEIGHT, DEFAULT_PRONUNCIATION_FONT_WEIGHT } from '@constants/fontWeights';
import { DEFAULT_GENERAL_SETTINGS } from '@constants/lyricsStyles';

interface FullLyricsProps {
  lyrics: Line[];
  offset?: number;
  scrollToCurrent?: boolean;
  fontColor?: string;
  pronunciationColor?: string;
  showRealtimeLyrics?: boolean;
  showPronunciationLyrics?: boolean;
  // 스타일 커스터마이징
  styleConfig?: Partial<FullLyricsStyleConfig>;
  // General 설정
  generalSettings?: Partial<GeneralLyricsSettings>;
}

const FullLyricsComponent: React.FC<FullLyricsProps> = ({
  lyrics,
  scrollToCurrent = true,
  fontColor = '#FFFFFF',
  pronunciationColor = '#AAAAAA',
  showRealtimeLyrics = true,
  showPronunciationLyrics = true,
  styleConfig,
  generalSettings,
}) => {
  // 스타일 병합
  const mergedStyles = useMemo(() => {
    return mergeFullLyricsStyles(styleConfig);
  }, [styleConfig]);

  // 발음이 메인 가사를 대체하는지 여부
  const pronunciationAsMain = !showRealtimeLyrics && showPronunciationLyrics;

  const shiftedLyrics = useMemo(() => shiftFirstLyricEarlier(lyrics, 3), [lyrics]);
  const currentTime = useCurrentTime();
  const containerRef = useRef<HTMLDivElement>(null);
  const isFullscreen = useFullscreenState();

  // 하이라이트는 원본 lyrics 기준으로 계산 (shift 없이)
  const activeLineIndex = lyrics.findIndex((line, i) => {
    const next = lyrics[i + 1];
    return currentTime >= line.time && (!next || currentTime < next.time);
  });

  const lyricTexts = useMemo(() => shiftedLyrics.map((line) => line.text), [shiftedLyrics]);
  const pronList = usePronunciations(lyricTexts);

  // 가상화: 보이는 범위 계산
  // 전체화면에서는 더 많은 줄 표시 (화면이 크므로)
  const visibleRange = useMemo(() => {
    const center = activeLineIndex >= 0 ? activeLineIndex : 0;
    // 전체화면: 15줄, 일반: 10줄 (시작 전/후 동일하게 유지)
    const buffer = isFullscreen ? 15 : 10;
    const start = Math.max(0, center - buffer);
    const end = Math.min(shiftedLyrics.length, center + buffer + 1);
    return { start, end };
  }, [activeLineIndex, shiftedLyrics.length, isFullscreen]);

  // 각 가사 줄의 대략적 높이 (px)
  const ITEM_HEIGHT = 60;

  // 현재 줄로 스크롤 (선택사항)
  useEffect(() => {
    if (!scrollToCurrent || activeLineIndex < 0) return;
    const el = containerRef.current?.querySelector(`[data-lyric-idx="${activeLineIndex}"]`);
    if (el && el instanceof HTMLElement) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [activeLineIndex, scrollToCurrent]);

  // 가사 색상 (발음이 메인을 대체할 때는 lyrics 스타일 사용)
  const getTextColor = (isActive: boolean) => {
    if (pronunciationAsMain) {
      // 발음이 메인을 대체: lyrics 스타일 사용
      const lyricsStyle =
        isActive && mergedStyles.pronunciationAsMainHighlight
          ? mergedStyles.lyrics.highlight
          : mergedStyles.lyrics.default;
      return lyricsStyle?.color || fontColor;
    } else {
      // 일반 가사
      const style = isActive ? mergedStyles.lyrics.highlight : mergedStyles.lyrics.default;
      return style?.color || fontColor;
    }
  };

  // 발음 색상
  const getPronunciationColor = (isActive: boolean) => {
    if (pronunciationAsMain) {
      // 발음이 메인을 대체: lyrics 스타일 색상 사용
      const lyricsStyle =
        isActive && mergedStyles.pronunciationAsMainHighlight
          ? mergedStyles.lyrics.highlight
          : mergedStyles.lyrics.default;
      return lyricsStyle?.color || fontColor;
    }
    return mergedStyles.pronunciation.default?.color || pronunciationColor;
  };

  // 인라인 스타일 생성 (CSS 모듈로 처리할 수 없는 동적 스타일)
  const getInlineStyle = useCallback(
    (isActive: boolean, isForPronunciation: boolean) => {
      let style;
      if (isForPronunciation && pronunciationAsMain) {
        // 발음이 메인을 대체하는 경우: 발음 텍스트에 lyrics 스타일 적용
        style =
          isActive && mergedStyles.pronunciationAsMainHighlight
            ? mergedStyles.lyrics.highlight
            : mergedStyles.lyrics.default;
      } else if (isForPronunciation) {
        // 일반 발음 스타일
        style = isActive ? mergedStyles.pronunciation.highlight : mergedStyles.pronunciation.default;
      } else {
        // 가사 텍스트 스타일
        style = isActive ? mergedStyles.lyrics.highlight : mergedStyles.lyrics.default;
      }
      if (!style) return {};

      const inlineStyle: React.CSSProperties = {};

      if (style.fontFamily) inlineStyle.fontFamily = style.fontFamily;
      inlineStyle.fontWeight =
        style.fontWeight ?? (isForPronunciation ? DEFAULT_PRONUNCIATION_FONT_WEIGHT : DEFAULT_FONT_WEIGHT);
      if (style.textShadow) inlineStyle.textShadow = style.textShadow;
      // fontSize: 전체화면에서 자동 배율 적용 (일반 모드 대비 약 1.5배)
      if (style.fontSize) {
        const baseFontSize = typeof style.fontSize === 'number' ? style.fontSize : parseInt(String(style.fontSize), 10);
        inlineStyle.fontSize = isFullscreen && !isNaN(baseFontSize) ? Math.round(baseFontSize * 1.5) : style.fontSize;
      }
      if (style.opacity !== undefined) inlineStyle.opacity = style.opacity;
      if (style.transition) inlineStyle.transition = style.transition;
      if (style.transform) inlineStyle.transform = style.transform;
      if (style.background) inlineStyle.background = style.background;
      if (style.backgroundImage) inlineStyle.backgroundImage = style.backgroundImage;
      if (style.backgroundClip) inlineStyle.backgroundClip = style.backgroundClip;
      if (style.WebkitBackgroundClip) inlineStyle.WebkitBackgroundClip = style.WebkitBackgroundClip;
      if (style.WebkitTextFillColor) inlineStyle.WebkitTextFillColor = style.WebkitTextFillColor;
      if (style.WebkitTextStroke) inlineStyle.WebkitTextStroke = style.WebkitTextStroke;
      if (style.filter) inlineStyle.filter = style.filter;

      // pronunciationAsMain일 때는 CSS의 기본 opacity 덮어쓰기
      if (isForPronunciation && pronunciationAsMain && style.opacity === undefined) {
        inlineStyle.opacity = 1;
      }

      return inlineStyle;
    },
    [isFullscreen, mergedStyles, pronunciationAsMain],
  );

  // General 설정에서 배경 투명도 추출
  const backgroundOpacity = generalSettings?.fullBackground?.opacity ?? DEFAULT_GENERAL_SETTINGS.fullBackground.opacity;

  return (
    <div
      className={styles.fullLyricsContainer}
      ref={containerRef}
      style={{ background: `rgba(24, 24, 24, ${backgroundOpacity})` }}
    >
      {/* 상단 스페이서: 렌더링하지 않는 위쪽 항목들의 높이만큼 공간 확보 */}
      <div style={{ height: `${visibleRange.start * ITEM_HEIGHT}px` }} />

      {/* 보이는 범위의 가사만 렌더링 */}
      {shiftedLyrics.slice(visibleRange.start, visibleRange.end).map((line, sliceIdx) => {
        const idx = visibleRange.start + sliceIdx;
        const pron = pronList[idx];
        const isActive = idx === activeLineIndex;

        // 현재/발음이 둘 다 OFF면 렌더 안 함
        if (!showRealtimeLyrics && !showPronunciationLyrics) return null;

        return (
          <div
            key={idx}
            data-lyric-idx={idx}
            className={`${styles.lyricItem} ${isActive ? styles.active : ''} ${pronunciationAsMain ? styles.pronunciationAsMain : ''}`}
          >
            {showRealtimeLyrics && (
              <div
                className={`${styles.lyricLine} ${isActive ? styles.active : ''}`}
                data-content={line.text}
                style={{
                  color: getTextColor(isActive),
                  ...getInlineStyle(isActive, false),
                }}
              >
                {line.text}
              </div>
            )}

            {showPronunciationLyrics && (
              <div
                className={`${styles.pronunciation} ${isActive ? styles.active : ''}`}
                data-content={pron && pron.trim() !== '' ? pron : ' '}
                style={{
                  color: getPronunciationColor(isActive),
                  ...getInlineStyle(isActive, true),
                }}
              >
                {pron && pron.trim() !== '' ? pron : ' '}
              </div>
            )}
          </div>
        );
      })}

      {/* 하단 스페이서: 렌더링하지 않는 아래쪽 항목들의 높이만큼 공간 확보 */}
      <div style={{ height: `${(shiftedLyrics.length - visibleRange.end) * ITEM_HEIGHT}px` }} />
    </div>
  );
};

export const FullLyrics = memo(FullLyricsComponent);
