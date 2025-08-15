import React, { useMemo } from 'react';
import { useCurrentTime } from '@hooks/useCurrentTime';
import { getDisplayLines } from '@lib/utils/lyrics/display/lyricsDisplay';
import { shiftFirstLyricEarlier } from '@lib/utils/lyrics/display/lyricsOffset';
import { usePronunciations } from '../PronunciationLyrics/usePronunciation';
import { Line } from '@lib/types/lyrics';

import styles from './styles.module.css';

interface DualHighlightLyricsProps {
  lyrics: Line[];
  offset?: number;
  fontColor?: string;
  pronunciationColor?: string;
  showRealtimeLyrics: boolean;
  showPronunciationLyrics: boolean;
}

const LyricLine: React.FC<{
  text?: string;
  pron?: string;
  showText: boolean;
  showPron: boolean;
  fontColor?: string;
  pronunciationColor?: string;
}> = ({ text, pron, showText, showPron, fontColor, pronunciationColor }) => {
  if (!showText && !showPron) return null;

  return (
    <div className={styles.lyricItem}>
      {showText && text && (
        <div className={styles.lyricLine} style={{ color: fontColor }}>
          {text}
        </div>
      )}
      {showPron && pron && (
        <div className={styles.pronunciation} style={{ color: pronunciationColor }}>
          {pron}
        </div>
      )}
    </div>
  );
};

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

  return (
    <div className={styles.dualHighlightSubtitle} style={{ color: fontColor }}>
      <LyricLine
        text={top}
        pron={topPron}
        showText={showRealtimeLyrics}
        showPron={showPronunciationLyrics}
        fontColor={fontColor}
        pronunciationColor={pronunciationColor}
      />
      <LyricLine
        text={bottom}
        pron={bottomPron}
        showText={showRealtimeLyrics}
        showPron={showPronunciationLyrics}
        fontColor={fontColor}
        pronunciationColor={pronunciationColor}
      />
    </div>
  );
};
