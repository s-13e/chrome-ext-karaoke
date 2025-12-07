// src/components/lyrics/FullLyricsView/FullLyricsView.tsx
import React, { useRef, useEffect, useMemo } from 'react';
import styles from './styles.module.css';
import { Line } from '@lib/types/lyrics';
import { useCurrentTime } from '@hooks/useCurrentTime';
import { shiftFirstLyricEarlier } from '@lib/utils/lyrics/display/lyricsOffset';
import { usePronunciations } from '../common/usePronunciation';
import { GlobalLyricsStyleConfig, FullLyricsStyleConfig } from '@lib/types/lyricsStyles';
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
  globalStyleConfig?: Partial<GlobalLyricsStyleConfig>;
  styleConfig?: Partial<FullLyricsStyleConfig>;
}

export const FullLyrics: React.FC<FullLyricsProps> = ({
  lyrics,
  scrollToCurrent = true,
  fontColor = '#FFFFFF',
  pronunciationColor = '#AAAAAA',
  showRealtimeLyrics = true,
  showPronunciationLyrics = true,
  globalStyleConfig,
  styleConfig,
}) => {
  // 스타일 병합
  const mergedStyles = useMemo(() => {
    return mergeFullLyricsStyles(globalStyleConfig, styleConfig);
  }, [globalStyleConfig, styleConfig]);

  // 발음이 메인 가사를 대체하는지 여부
  const pronunciationAsMain = !showRealtimeLyrics && showPronunciationLyrics;

  const shiftedLyrics = useMemo(() => shiftFirstLyricEarlier(lyrics, 3), [lyrics]);
  const currentTime = useCurrentTime();
  const containerRef = useRef<HTMLDivElement>(null);

  const activeLineIndex = shiftedLyrics.findIndex((line, i) => {
    const next = shiftedLyrics[i + 1];
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

  // 가사/발음 스타일 계산
  const getTextStyle = (isActive: boolean, isForPronunciation: boolean) => {
    if (isForPronunciation) {
      // 발음 스타일
      if (pronunciationAsMain) {
        // 발음이 메인을 대체
        return isActive ? mergedStyles.pronunciationAsMain.highlight : mergedStyles.pronunciationAsMain.default;
      } else {
        // 일반 발음
        return isActive ? mergedStyles.pronunciation.highlight : mergedStyles.pronunciation.default;
      }
    } else {
      // 메인 가사 스타일
      return isActive ? mergedStyles.lyrics.highlight : mergedStyles.lyrics.default;
    }
  };

  // 가사 색상과 스타일 (CSS 모듈과 인라인 스타일 병합)
  const getTextColor = (isActive: boolean) => {
    const style = getTextStyle(isActive, false);
    return style?.color || fontColor;
  };

  // 발음 색상과 스타일
  const getPronunciationColor = (isActive: boolean) => {
    const style = getTextStyle(isActive, true);
    return style?.color || pronunciationColor;
  };

  // 인라인 스타일 생성 (CSS 모듈로 처리할 수 없는 동적 스타일)
  const getInlineStyle = (isActive: boolean, isForPronunciation: boolean) => {
    const style = getTextStyle(isActive, isForPronunciation);
    if (!style) return {};

    const inlineStyle: React.CSSProperties = {};

    if (style.fontWeight) inlineStyle.fontWeight = style.fontWeight;
    if (style.textShadow) inlineStyle.textShadow = style.textShadow;
    if (style.fontSize) inlineStyle.fontSize = style.fontSize;
    if (style.opacity !== undefined) inlineStyle.opacity = style.opacity;
    if (style.transition) inlineStyle.transition = style.transition;
    if (style.transform) inlineStyle.transform = style.transform;
    if (style.background) inlineStyle.background = style.background;
    if (style.backgroundClip) inlineStyle.backgroundClip = style.backgroundClip;
    if (style.webkitBackgroundClip) inlineStyle.WebkitBackgroundClip = style.webkitBackgroundClip;
    if (style.webkitTextFillColor) inlineStyle.WebkitTextFillColor = style.webkitTextFillColor;

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
          <div key={idx} data-lyric-idx={idx} className={`${styles.lyricItem} ${isActive ? styles.active : ''}`}>
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
