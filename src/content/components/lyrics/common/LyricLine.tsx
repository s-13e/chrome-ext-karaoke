import React from 'react';
import styles from './styles.module.css';

export const LyricLine: React.FC<{
  text?: string;
  pron?: string;
  showText: boolean;
  showPron: boolean;
  fontColor?: string;
  pronunciationColor?: string;
  textStyle?: React.CSSProperties;
  pronStyle?: React.CSSProperties;
  pronunciationAsMain?: boolean;
}> = ({ text, pron, showText, showPron, fontColor, pronunciationColor, textStyle, pronStyle, pronunciationAsMain }) => {
  if (!showText && !showPron) return null;

  return (
    <div className={`${styles.lyricItem} ${pronunciationAsMain ? styles.pronunciationAsMain : ''}`}>
      {showText && text && (
        <div
          className={styles.lyricLine}
          style={{
            ...textStyle,
            // gradient가 없을 때만 fontColor 적용 (gradient는 WebkitTextFillColor로 색상 처리)
            ...(textStyle?.WebkitTextFillColor ? {} : { color: fontColor }),
          }}
        >
          {text}
        </div>
      )}
      {showPron && pron && (
        <div
          className={styles.pronunciation}
          style={{
            ...pronStyle,
            ...(pronStyle?.WebkitTextFillColor ? {} : { color: pronunciationColor }),
          }}
        >
          {pron}
        </div>
      )}
    </div>
  );
};
