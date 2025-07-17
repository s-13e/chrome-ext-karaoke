import React from 'react';
// import { parseLyrics } from '@lib/utils/lyricsParser';
import { useCurrentTime } from '@hooks/useCurrentTime';
import { getDisplayLines } from '@lib/utils/lyricsDisplay';
import styles from './styles.module.css';
import { Line } from '@lib/types/lyrics';

interface DualHighlightSubtitleProps {
  lyrics: Line[];
  offset?: number;
}

export const DualHighlightSubtitle: React.FC<DualHighlightSubtitleProps> = ({ lyrics, offset }) => {
  const currentTime = useCurrentTime();
  const adjustedTime = currentTime - (offset ?? 0); // offset 사용!
  const { top, bottom, highlightTop, highlightBottom } = getDisplayLines(lyrics, adjustedTime);

  //const lines = useMemo(() => parseLyrics(lyrics) ?? [], [lyrics]);
  //const { top, bottom, highlightTop, highlightBottom } = getDisplayLines(lines, currentTime);

  return (
    <div className={styles.dualHighlightSubtitle}>
      <div className={highlightTop ? styles.highlight : ''}>{top}</div>
      <div className={highlightBottom ? styles.highlight : ''}>{bottom}</div>
    </div>
  );
};
