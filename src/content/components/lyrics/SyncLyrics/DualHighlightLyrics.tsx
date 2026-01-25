import React, { useMemo, useState, useEffect, useCallback, memo } from 'react';
import { useCurrentTime } from '@hooks/useCurrentTime';
import { useFullscreenState } from '@hooks/useFullscreenState';
import { getDisplayLines } from '@lib/utils/lyrics/display/lyricsDisplay';
import { shiftFirstLyricEarlier } from '@lib/utils/lyrics/display/lyricsOffset';
import { usePronunciations } from '../common/usePronunciation';
import { Line } from '@lib/types/lyrics';
import { LyricLine } from '../common/LyricLine';
import { CountdownOverlay } from '../common/CountdownOverlay';
import { DualHighlightLyricsStyleConfig } from '@lib/types/lyricsStyles';
import { mergeDualHighlightStyles } from '@lib/utils/lyrics/styles/lyricsStyleMerger';
import { DEFAULT_COUNTDOWN_COLORS } from '@constants/lyricsStyles';
import { calculateDualFontSizes } from '@lib/utils/lyrics/styles/fontSizeCalculator';
import { DEFAULT_FONT_WEIGHT, DEFAULT_PRONUNCIATION_FONT_WEIGHT } from '@constants/fontWeights';
import styles from './styles.module.css';

interface DualHighlightLyricsProps {
  lyrics: Line[];
  offset?: number;
  fontColor?: string;
  pronunciationColor?: string;
  showRealtimeLyrics: boolean;
  showPronunciationLyrics: boolean;
  // 스타일 커스터마이징
  styleConfig?: Partial<DualHighlightLyricsStyleConfig>;
}
const DualHighlightLyricsComponent: React.FC<DualHighlightLyricsProps> = ({
  lyrics,
  offset,
  fontColor,
  pronunciationColor,
  showRealtimeLyrics,
  showPronunciationLyrics,
  styleConfig,
}) => {
  // 전체화면 상태 감지 (상태 변경 시 리렌더링 트리거)
  const isFullscreen = useFullscreenState();

  // 스타일 병합
  const mergedStyles = useMemo(() => {
    const merged = mergeDualHighlightStyles(styleConfig);
    console.log('[DualHighlightLyrics] mergedStyles 재계산:', {
      styleConfig,
      merged,
    });
    return merged;
  }, [styleConfig]);

  // 발음이 메인 가사를 대체하는지 여부
  const pronunciationAsMain = !showRealtimeLyrics && showPronunciationLyrics;

  // 오프셋 보정 적용
  const shiftedLyrics = useMemo(() => shiftFirstLyricEarlier(lyrics, 3), [lyrics]);
  const currentTime = useCurrentTime();
  const adjustedTime = currentTime - (offset ?? 0);

  // 아카펠라 녹음 카운트다운 상태
  const [acapellaCountdownStart, setAcapellaCountdownStart] = useState<number | null>(null);

  // 아카펠라 녹음 카운트다운 이벤트 수신
  useEffect(() => {
    const handleCountdownStart = (event: Event) => {
      const customEvent = event as CustomEvent<{ startTime: number; currentTime: number }>;
      console.log('[DualHighlightLyrics] 아카펠라 카운트다운 시작:', customEvent.detail);
      setAcapellaCountdownStart(customEvent.detail.startTime);
    };

    const handleCountdownEnd = () => {
      console.log('[DualHighlightLyrics] 아카펠라 카운트다운 종료');
      setAcapellaCountdownStart(null);
    };

    window.addEventListener('acapella-countdown-start', handleCountdownStart);
    window.addEventListener('acapella-countdown-end', handleCountdownEnd);

    return () => {
      window.removeEventListener('acapella-countdown-start', handleCountdownStart);
      window.removeEventListener('acapella-countdown-end', handleCountdownEnd);
    };
  }, []);

  const { top, bottom, topIndex, bottomIndex } = getDisplayLines(shiftedLyrics, adjustedTime);

  // 발음 변환
  const lyricTexts = useMemo(() => shiftedLyrics.map((line) => line.text), [shiftedLyrics]);
  const pronList = usePronunciations(lyricTexts);

  const topPron = topIndex >= 0 ? pronList[topIndex] : '';
  const bottomPron = bottomIndex >= 0 ? pronList[bottomIndex] : '';

  // 원본 lyrics에서 top/bottom의 실제 인덱스 찾기 (텍스트 + 시간으로 매칭)
  const topIndexInOriginal = useMemo(() => {
    if (topIndex < 0) return -1;
    const shiftedLine = shiftedLyrics[topIndex];
    if (!shiftedLine) return -1;
    // 같은 텍스트가 여러 개 있을 수 있으므로 시간도 비교 (shift 고려)
    return lyrics.findIndex((l) => l.text === shiftedLine.text && Math.abs(l.time - shiftedLine.time) < 4);
  }, [topIndex, shiftedLyrics, lyrics]);

  const bottomIndexInOriginal = useMemo(() => {
    if (bottomIndex < 0) return -1;
    const shiftedLine = shiftedLyrics[bottomIndex];
    if (!shiftedLine) return -1;
    return lyrics.findIndex((l) => l.text === shiftedLine.text && Math.abs(l.time - shiftedLine.time) < 4);
  }, [bottomIndex, shiftedLyrics, lyrics]);

  // 원본 타임 라인 기준 (하이라이트는 shift 안 된 원본 타이밍 사용)
  const highlightIndex = useMemo(() => {
    return lyrics.findLastIndex((line) => adjustedTime >= line.time);
  }, [lyrics, adjustedTime]);

  // 첫 가사 시작 시간 (카운트다운 표시용)
  const firstLyricTime = useMemo(() => {
    return lyrics.length > 0 && lyrics[0] ? lyrics[0].time : null;
  }, [lyrics]);

  // 가사 색상 (발음이 메인을 대체할 때는 lyrics 스타일 사용)
  const getTextColor = (isHighlight: boolean) => {
    if (pronunciationAsMain) {
      // 발음이 메인을 대체: lyrics 스타일 사용
      const lyricsStyle =
        isHighlight && mergedStyles.pronunciationAsMainHighlight
          ? mergedStyles.lyrics.highlight
          : mergedStyles.lyrics.default;
      return lyricsStyle?.color || fontColor;
    } else {
      // 일반 가사
      const style = isHighlight ? mergedStyles.lyrics.highlight : mergedStyles.lyrics.default;
      return style?.color || fontColor;
    }
  };

  // 발음 색상
  const getPronunciationColor = (isHighlight: boolean) => {
    if (pronunciationAsMain) {
      // 발음이 메인을 대체: lyrics 스타일 색상 사용
      const lyricsStyle =
        isHighlight && mergedStyles.pronunciationAsMainHighlight
          ? mergedStyles.lyrics.highlight
          : mergedStyles.lyrics.default;
      return lyricsStyle?.color || fontColor;
    }
    return mergedStyles.pronunciation.default?.color || pronunciationColor;
  };

  // 인라인 스타일 생성 (CSS 모듈로 처리할 수 없는 동적 스타일)
  // useCallback으로 감싸서 isFullscreen 상태 변경 시 새로운 스타일 반환
  const getInlineStyle = useCallback(
    (isHighlight: boolean, isForPronunciation: boolean) => {
      let style;
      if (isForPronunciation && pronunciationAsMain) {
        // 발음이 메인을 대체하는 경우: 발음 텍스트에 lyrics 스타일 적용
        style =
          isHighlight && mergedStyles.pronunciationAsMainHighlight
            ? mergedStyles.lyrics.highlight
            : mergedStyles.lyrics.default;
      } else if (isForPronunciation) {
        // 일반 발음 스타일
        style = isHighlight ? mergedStyles.pronunciation.highlight : mergedStyles.pronunciation.default;
      } else {
        // 가사 텍스트 스타일
        style = isHighlight ? mergedStyles.lyrics.highlight : mergedStyles.lyrics.default;
      }
      if (!style) return {};

      const inlineStyle: React.CSSProperties = {};

      if (style.fontFamily) inlineStyle.fontFamily = style.fontFamily;
      inlineStyle.fontWeight =
        style.fontWeight ?? (isForPronunciation ? DEFAULT_PRONUNCIATION_FONT_WEIGHT : DEFAULT_FONT_WEIGHT);
      if (style.textShadow) inlineStyle.textShadow = style.textShadow;
      // fontSize: 전체화면에서 자동 배율 적용 (isFullscreen은 useFullscreenState에서 관리)
      if (style.fontSize) {
        const baseFontSize = typeof style.fontSize === 'number' ? style.fontSize : parseInt(String(style.fontSize), 10);
        // Dual은 fullscreen에서 약 2배 배율 (1rem → 2rem 기준)
        inlineStyle.fontSize = isFullscreen && !isNaN(baseFontSize) ? Math.round(baseFontSize * 2) : style.fontSize;
      } else if (!isForPronunciation) {
        // 가사는 항상 계산된 fontSize 적용 (CSS clamp 대신)
        inlineStyle.fontSize = calculateDualFontSizes();
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

  return (
    <div className={styles.dualHighlightSubtitle} style={{ color: fontColor }}>
      {/* 카운트다운 오버레이 (첫 가사 또는 아카펠라 녹음) */}
      {firstLyricTime !== null && !acapellaCountdownStart && (
        <CountdownOverlay
          startTime={firstLyricTime}
          currentTime={adjustedTime}
          fontColor={DEFAULT_COUNTDOWN_COLORS.firstLyric}
        />
      )}
      {acapellaCountdownStart !== null && (
        <CountdownOverlay
          startTime={acapellaCountdownStart}
          currentTime={currentTime}
          fontColor={DEFAULT_COUNTDOWN_COLORS.acapella}
        />
      )}

      <LyricLine
        text={top}
        pron={topPron}
        showText={showRealtimeLyrics}
        showPron={showPronunciationLyrics}
        fontColor={getTextColor(topIndexInOriginal >= 0 && topIndexInOriginal <= highlightIndex)}
        pronunciationColor={getPronunciationColor(topIndexInOriginal >= 0 && topIndexInOriginal <= highlightIndex)}
        textStyle={getInlineStyle(topIndexInOriginal >= 0 && topIndexInOriginal <= highlightIndex, false)}
        pronStyle={getInlineStyle(topIndexInOriginal >= 0 && topIndexInOriginal <= highlightIndex, true)}
        pronunciationAsMain={pronunciationAsMain}
      />
      <LyricLine
        text={bottom}
        pron={bottomPron}
        showText={showRealtimeLyrics}
        showPron={showPronunciationLyrics}
        fontColor={getTextColor(bottomIndexInOriginal >= 0 && bottomIndexInOriginal <= highlightIndex)}
        pronunciationColor={getPronunciationColor(
          bottomIndexInOriginal >= 0 && bottomIndexInOriginal <= highlightIndex,
        )}
        textStyle={getInlineStyle(bottomIndexInOriginal >= 0 && bottomIndexInOriginal <= highlightIndex, false)}
        pronStyle={getInlineStyle(bottomIndexInOriginal >= 0 && bottomIndexInOriginal <= highlightIndex, true)}
        pronunciationAsMain={pronunciationAsMain}
      />
    </div>
  );
};

export const DualHighlightLyrics = memo(DualHighlightLyricsComponent);
