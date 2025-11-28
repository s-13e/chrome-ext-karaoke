import React, { useMemo, useState, useEffect } from 'react';
import { useCurrentTime } from '@hooks/useCurrentTime';
import { getDisplayLines } from '@lib/utils/lyrics/display/lyricsDisplay';
import { shiftFirstLyricEarlier } from '@lib/utils/lyrics/display/lyricsOffset';
import { usePronunciations } from '../common/usePronunciation';
import { Line } from '@lib/types/lyrics';
import { LyricLine } from '../common/LyricLine';
import { CountdownOverlay } from '../common/CountdownOverlay';
import styles from './styles.module.css';

interface DualHighlightLyricsProps {
  lyrics: Line[];
  offset?: number;
  fontColor?: string;
  pronunciationColor?: string;
  showRealtimeLyrics: boolean;
  showPronunciationLyrics: boolean;
}
export const DualHighlightLyrics: React.FC<DualHighlightLyricsProps> = ({
  lyrics,
  offset,
  fontColor,
  pronunciationColor,
  showRealtimeLyrics,
  showPronunciationLyrics,
}) => {
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

  return (
    <div className={styles.dualHighlightSubtitle} style={{ color: fontColor }}>
      {/* 카운트다운 오버레이 (첫 가사 또는 아카펠라 녹음) */}
      {firstLyricTime !== null && !acapellaCountdownStart && (
        <CountdownOverlay startTime={firstLyricTime} currentTime={adjustedTime} fontColor="#ffcc00" />
      )}
      {acapellaCountdownStart !== null && (
        <CountdownOverlay startTime={acapellaCountdownStart} currentTime={currentTime} fontColor="#FFEB3B" />
      )}

      <LyricLine
        text={top}
        pron={topPron}
        showText={showRealtimeLyrics}
        showPron={showPronunciationLyrics}
        fontColor={
          topIndexInOriginal >= 0 && topIndexInOriginal <= highlightIndex
            ? 'blue' // 하이라이트 색상
            : fontColor
        }
        pronunciationColor={pronunciationColor}
      />
      <LyricLine
        text={bottom}
        pron={bottomPron}
        showText={showRealtimeLyrics}
        showPron={showPronunciationLyrics}
        fontColor={bottomIndexInOriginal >= 0 && bottomIndexInOriginal <= highlightIndex ? 'blue' : fontColor}
        pronunciationColor={pronunciationColor}
      />
    </div>
  );
};
