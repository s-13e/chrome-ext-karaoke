import React, { useMemo, useState, useEffect } from 'react';
import { useCurrentTime } from '@hooks/useCurrentTime';
import { getDisplayLines } from '@lib/utils/lyrics/display/lyricsDisplay';
import { shiftFirstLyricEarlier } from '@lib/utils/lyrics/display/lyricsOffset';
import { usePronunciations } from '../common/usePronunciation';
import { Line } from '@lib/types/lyrics';
import { LyricLine } from '../common/LyricLine';
import { CountdownOverlay } from '../common/CountdownOverlay';
import { GlobalLyricsStyleConfig, DualHighlightLyricsStyleConfig } from '@lib/types/lyricsStyles';
import { mergeDualHighlightStyles } from '@lib/utils/lyrics/styles/lyricsStyleMerger';
import { DEFAULT_COUNTDOWN_COLORS } from '@constants/lyricsStyles';
import styles from './styles.module.css';

interface DualHighlightLyricsProps {
  lyrics: Line[];
  offset?: number;
  fontColor?: string;
  pronunciationColor?: string;
  showRealtimeLyrics: boolean;
  showPronunciationLyrics: boolean;
  // 스타일 커스터마이징
  globalStyleConfig?: Partial<GlobalLyricsStyleConfig>;
  styleConfig?: Partial<DualHighlightLyricsStyleConfig>;
}
export const DualHighlightLyrics: React.FC<DualHighlightLyricsProps> = ({
  lyrics,
  offset,
  fontColor,
  pronunciationColor,
  showRealtimeLyrics,
  showPronunciationLyrics,
  globalStyleConfig,
  styleConfig,
}) => {
  // 스타일 병합
  const mergedStyles = useMemo(() => {
    return mergeDualHighlightStyles(globalStyleConfig, styleConfig);
  }, [globalStyleConfig, styleConfig]);

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

  // 가사/발음 색상 및 스타일 계산
  const getTextStyle = (isHighlight: boolean, isForPronunciation: boolean) => {
    if (isForPronunciation) {
      // 발음 스타일
      if (pronunciationAsMain) {
        // 발음이 메인을 대체
        return isHighlight ? mergedStyles.pronunciationAsMain.highlight : mergedStyles.pronunciationAsMain.default;
      } else {
        // 일반 발음
        return isHighlight ? mergedStyles.pronunciation.highlight : mergedStyles.pronunciation.default;
      }
    } else {
      // 메인 가사 스타일
      return isHighlight ? mergedStyles.lyrics.highlight : mergedStyles.lyrics.default;
    }
  };

  // 가사 색상 (스타일과 prop 병합)
  const getTextColor = (isHighlight: boolean) => {
    const style = getTextStyle(isHighlight, false);
    return style?.color || fontColor;
  };

  // 발음 색상 (스타일과 prop 병합)
  const getPronunciationColor = (isHighlight: boolean) => {
    const style = getTextStyle(isHighlight, true);
    return style?.color || pronunciationColor;
  };

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
      />
    </div>
  );
};
