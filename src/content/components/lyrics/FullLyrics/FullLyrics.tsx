// src/components/lyrics/FullLyricsView/FullLyricsView.tsx
import React, { useRef, useEffect, useMemo } from 'react';
import styles from './styles.module.css';
import { Line } from '@lib/types/lyrics';
import { useCurrentTime } from '@hooks/useCurrentTime';
import { shiftFirstLyricEarlier } from '@lib/utils/lyrics/display/lyricsOffset';
import { usePronunciations } from '../common/usePronunciation';
import { FullLyricsStyleConfig } from '@lib/types/lyricsStyles';
import { mergeFullLyricsStyles } from '@lib/utils/lyrics/styles/lyricsStyleMerger';

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
}

export const FullLyrics: React.FC<FullLyricsProps> = ({
  lyrics,
  scrollToCurrent = true,
  fontColor = '#FFFFFF',
  pronunciationColor = '#AAAAAA',
  showRealtimeLyrics = true,
  showPronunciationLyrics = true,
  styleConfig,
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

  // 하이라이트는 원본 lyrics 기준으로 계산 (shift 없이)
  const activeLineIndex = lyrics.findIndex((line, i) => {
    const next = lyrics[i + 1];
    return currentTime >= line.time && (!next || currentTime < next.time);
  });

  const lyricTexts = useMemo(() => shiftedLyrics.map((line) => line.text), [shiftedLyrics]);
  const pronList = usePronunciations(lyricTexts);

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
  const getInlineStyle = (isActive: boolean, isForPronunciation: boolean) => {
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
    if (style.fontWeight) inlineStyle.fontWeight = style.fontWeight;
    if (style.textShadow) inlineStyle.textShadow = style.textShadow;
    if (style.fontSize) inlineStyle.fontSize = style.fontSize;
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
  };

  return (
    <div className={styles.fullLyricsContainer} ref={containerRef}>
      {shiftedLyrics.map((line, idx) => {
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
    </div>
  );
};
