import React, { useMemo } from 'react';
import { useCurrentTime } from '@hooks/useCurrentTime';
import { getDisplayLines } from '@lib/utils/lyrics/display/lyricsDisplay';
import { shiftFirstLyricEarlier } from '@lib/utils/lyrics/display/lyricsOffset';
import { usePronunciations } from '../common/usePronunciation';
import { Line } from '@lib/types/lyrics';
import { LyricLine } from '../common/LyricLine';
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

  const { top, bottom } = getDisplayLines(shiftedLyrics, adjustedTime);

  // 발음 변환
  const lyricTexts = useMemo(() => shiftedLyrics.map((line) => line.text), [shiftedLyrics]);
  const pronList = usePronunciations(lyricTexts);

  const topPron = top ? pronList[shiftedLyrics.findIndex((l) => l.text === top)] : '';
  const bottomPron = bottom ? pronList[shiftedLyrics.findIndex((l) => l.text === bottom)] : '';

  // ✅ 추가: 색상 변경은 원본 타임 라인 기준
  const highlightIndex = useMemo(() => {
    return shiftedLyrics.findLastIndex((line) => adjustedTime >= line.time);
  }, [lyrics, adjustedTime]);

  return (
    <div className={styles.dualHighlightSubtitle} style={{ color: fontColor }}>
      <LyricLine
        text={top}
        pron={topPron}
        showText={showRealtimeLyrics}
        showPron={showPronunciationLyrics}
        fontColor={
          lyrics.findIndex((l) => l.text === top) <= highlightIndex
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
        fontColor={lyrics.findIndex((l) => l.text === bottom) <= highlightIndex ? 'blue' : fontColor}
        pronunciationColor={pronunciationColor}
      />
    </div>
  );
};
