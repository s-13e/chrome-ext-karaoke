import React, { useMemo } from 'react';
import { parseLyrics } from '@lib/utils/lyricsParser';
import { useCurrentTime } from '@hooks/useCurrentTime';
import { getDisplayLines } from '@lib/utils/lyricsDisplay';
import styles from './styles.module.css';

export const DualHighlightSubtitle: React.FC<{ lyrics: string }> = ({ lyrics }) => {
  const currentTime = useCurrentTime();
  const lines = useMemo(() => parseLyrics(lyrics) ?? [], [lyrics]);
  const { top, bottom, highlightTop, highlightBottom } = getDisplayLines(lines, currentTime);

  return (
    <div className={styles.dualHighlightSubtitle}>
      <div className={highlightTop ? styles.highlight : ''}>{top}</div>
      <div className={highlightBottom ? styles.highlight : ''}>{bottom}</div>
    </div>
  );
};
