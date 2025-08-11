// src/components/lyrics/FullLyricsView/FullLyricsView.tsx
import React, { useRef, useEffect, useMemo } from 'react';
import styles from './styles.module.css';
import { Line } from '@lib/types/lyrics';
import { useCurrentTime } from '@hooks/useCurrentTime';
import { shiftFirstLyricEarlier } from '@lib/utils/lyrics/lyricsOffset';

interface FullLyricsProps {
  lyrics: Line[];
  offset?: number;
  scrollToCurrent?: boolean;
  fontColor?: string;
}

export const FullLyrics: React.FC<FullLyricsProps> = ({ lyrics, scrollToCurrent = true, fontColor = '#FFFFFF' }) => {
  const shiftedLyrics = useMemo(() => shiftFirstLyricEarlier(lyrics, 3), [lyrics]);

  const currentTime = useCurrentTime();
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineIndex = shiftedLyrics.findIndex((line, i) => {
    const next = shiftedLyrics[i + 1];
    return currentTime >= line.time && (!next || currentTime < next.time);
  });

  // 현재 줄로 스크롤 (선택사항)
  useEffect(() => {
    if (!scrollToCurrent || activeLineIndex < 0) return;
    const el = containerRef.current?.querySelector(`[data-lyric-idx="${activeLineIndex}"]`);
    if (el && el instanceof HTMLElement) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [activeLineIndex, scrollToCurrent]);

  return (
    <div className={styles.fullLyricsContainer} ref={containerRef}>
      {shiftedLyrics.map((line, idx) => (
        <div
          key={idx}
          className={idx === activeLineIndex ? `${styles.lyricLine} ${styles.active}` : styles.lyricLine}
          data-lyric-idx={idx}
          style={{ color: fontColor }}
        >
          {line.text}
        </div>
      ))}
    </div>
  );
};
