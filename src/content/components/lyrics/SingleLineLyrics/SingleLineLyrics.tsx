import React, { useMemo } from 'react';
import { Line } from '@lib/types/lyrics';
import { useCurrentTime } from '@hooks/useCurrentTime';
import { usePronunciations } from '../common/usePronunciation';
import { LyricLine } from '../common/LyricLine';
import { CountdownOverlay } from '../common/CountdownOverlay';
import { shiftFirstLyricEarlier } from '@lib/utils/lyrics/display/lyricsOffset';
import styles from './styles.module.css';

interface SingleLineLyricsProps {
  lyrics: Line[];
  offset?: number;
  fontColor?: string;
  className?: string;
  pronunciationColor?: string;
  showRealtimeLyrics?: boolean;
  showPronunciationLyrics?: boolean;
  currentTime?: number; // 외부에서 시간을 주입할 수 있도록 (싱크셋 미리보기용)
}

/**
 * 싱글 라인 가사 컴포넌트 - 현재 가사만 표시
 * - currentTime을 props로 받으면 해당 시간 사용 (싱크셋 미리보기)
 * - currentTime이 없으면 useCurrentTime 훅 사용 (일반 재생)
 */
export const SingleLineLyrics: React.FC<SingleLineLyricsProps> = ({
  lyrics,
  offset = 0,
  fontColor = '#fff',
  pronunciationColor,
  showRealtimeLyrics = true,
  showPronunciationLyrics = true,
  currentTime: externalCurrentTime,
}) => {
  // 오프셋 보정 적용
  const shiftedLyrics = useMemo(() => shiftFirstLyricEarlier(lyrics, 3), [lyrics]);
  const internalCurrentTime = useCurrentTime();
  // 외부에서 currentTime을 주입하면 사용, 없으면 훅 사용
  const currentTime = externalCurrentTime !== undefined ? externalCurrentTime : internalCurrentTime;
  const adjustedTime = currentTime - offset;

  // 현재 가사 인덱스 찾기
  const currentIndex = useMemo(() => {
    return shiftedLyrics.findLastIndex((line) => adjustedTime >= line.time);
  }, [shiftedLyrics, adjustedTime]);

  const currentLine = currentIndex >= 0 ? shiftedLyrics[currentIndex] : null;
  const currentText = currentLine ? currentLine.text : '';

  // 발음 변환
  const lyricTexts = useMemo(() => shiftedLyrics.map((line) => line.text), [shiftedLyrics]);
  const pronList = usePronunciations(lyricTexts);
  const currentPron = currentIndex >= 0 ? pronList[currentIndex] : '';

  // 원본 lyrics에서 현재 라인의 실제 인덱스 찾기
  const currentIndexInOriginal = useMemo(() => {
    if (currentIndex < 0 || !currentLine) return -1;
    return lyrics.findIndex((l) => l.text === currentLine.text && Math.abs(l.time - currentLine.time) < 4);
  }, [currentIndex, currentLine, lyrics]);

  // 원본 타임 라인 기준 하이라이트 인덱스
  const highlightIndex = useMemo(() => {
    return lyrics.findLastIndex((line) => adjustedTime >= line.time);
  }, [lyrics, adjustedTime]);

  // 첫 가사 시작 시간 (카운트다운 표시용)
  const firstLyricTime = useMemo(() => {
    return lyrics.length > 0 && lyrics[0] ? lyrics[0].time : null;
  }, [lyrics]);

  return (
    <div className={styles.singleLineSubtitle} style={{ color: fontColor }}>
      {/* 카운트다운 오버레이 (첫 가사에만 표시) */}
      {firstLyricTime !== null && (
        <CountdownOverlay startTime={firstLyricTime} currentTime={adjustedTime} fontColor="#ffcc00" />
      )}

      <LyricLine
        text={currentText}
        pron={currentPron}
        showText={showRealtimeLyrics}
        showPron={showPronunciationLyrics}
        fontColor={currentIndexInOriginal >= 0 && currentIndexInOriginal <= highlightIndex ? 'blue' : fontColor}
        pronunciationColor={pronunciationColor}
      />
    </div>
  );
};
