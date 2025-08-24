import React from 'react';
import styles from './styles.module.css';

export const LyricLine: React.FC<{
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
