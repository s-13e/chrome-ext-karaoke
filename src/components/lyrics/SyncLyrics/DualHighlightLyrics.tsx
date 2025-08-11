import React, { useEffect, useMemo } from 'react';
import { useCurrentTime } from '@hooks/useCurrentTime';
import { getDisplayLines } from '@lib/utils/lyrics/lyricsDisplay';
import { Line } from '@lib/types/lyrics';
import styles from './styles.module.css';
import { shiftFirstLyricEarlier } from '@lib/utils/lyrics/lyricsOffset';

interface DualHighlightLyricsProps {
  lyrics: Line[];
  offset?: number;
  fontColor?: string;
}

export const DualHighlightLyrics: React.FC<DualHighlightLyricsProps> = ({ lyrics, offset, fontColor = '#FFFFFF' }) => {
  const shiftedLyrics = useMemo(() => shiftFirstLyricEarlier(lyrics, 3), [lyrics]);

  const currentTime = useCurrentTime();
  const adjustedTime = currentTime - (offset ?? 0); // offset 사용!
  const { top, bottom, highlightTop, highlightBottom } = getDisplayLines(shiftedLyrics, adjustedTime);
  useEffect(() => {
    console.log('[DualHighlightLyrics] fontColor prop 변경:', fontColor);
    const el = document.getElementById('some-lyrics-elem-id');
    if (el) console.log('[DualHighlightLyrics] 실제 DOM color:', getComputedStyle(el).color);
  }, [fontColor]);

  return (
    <div className={styles.dualHighlightSubtitle} style={{ color: fontColor }}>
      <div className={highlightTop ? styles.highlight : ''}>{top}</div>
      <div className={highlightBottom ? styles.highlight : ''}>{bottom}</div>
    </div>
  );
};
