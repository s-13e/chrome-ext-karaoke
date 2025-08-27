import React, { useMemo } from 'react';
import { Line } from '@lib/types/lyrics';
import styles from './styles.module.css';

interface SingleLineLyricsProps {
  lyrics: Line[];
  offset?: number; // 가사 전체 시간 보정(offset), default 0
  fontColor?: string;
  className?: string;
}

/**
 * 현재 재생 시간(currentTime)은 내부에서 useCurrentTime 훅처럼 별도로 다룰 수도 있지만,
 * 이 컴포넌트는 오로지 props 기반으로 현재 보여줄 가사를 계산해 렌더링합니다.
 *
 * (외부에서 currentTime을 변수로 넘기거나, 필요시 useCurrentTime 훅으로 별도 캡슐화 가능)
 */
export const SingleLineLyrics: React.FC<SingleLineLyricsProps & { currentTime: number }> = ({
  lyrics,
  currentTime,
  offset = 0,
  fontColor = '#fff',
  className = '',
}) => {
  // 현재 오프셋 적용된 시간
  const adjustedTime = currentTime - offset;

  // 현재 가사 한 줄 계산: adjustedTime에 맞춰 현재 표시할 줄 찾기
  // lyrics 배열은 time 오름차순 정렬되어 있다고 가정
  const currentLine = useMemo(() => {
    if (!lyrics.length) return null;
    for (let i = lyrics.length - 1; i >= 0; i--) {
      const line = lyrics[i];
      if (line && line.time !== undefined && adjustedTime >= line.time) {
        return lyrics[i];
      }
    }
    return null;
  }, [lyrics, adjustedTime]);

  if (!currentLine) return null;

  return (
    <div
      className={`${styles.singleLineSubtitle} ${className}`}
      style={{ color: fontColor }}
      aria-live="assertive"
      role="textbox"
    >
      {currentLine.text}
    </div>
  );
};
