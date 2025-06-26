import React from 'react';
import { parseTimeToSeconds } from '@lib/utils/time';

// 가사 파싱 인터페이스
interface LyricLine {
  time: number;
  text: string;
}

export const SyncSubtitle: React.FC<{
  lyrics: string;
  currentTime: number;
}> = ({ lyrics, currentTime }) => {
  // 가사 파싱
  const parsedLyrics: LyricLine[] = lyrics.split('\n').reduce<LyricLine[]>((acc, line) => {
    const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
    if (!match) return acc;

    const [, min, sec, text] = match;
    // text가 undefined일 경우 빈 문자열로 대체
    const safeText = (text ?? '').trim();
    if (safeText === '') return acc; // 빈 줄은 제외

    const time = parseTimeToSeconds(`${min}:${sec}`);
    acc.push({ time, text: safeText });
    return acc;
  }, []);

  // 현재 시간에 해당하는 가사 찾기
  const currentLineIndex = parsedLyrics.findIndex((line, index) => {
    const nextLine = parsedLyrics[index + 1];
    return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
  });

  return (
    <div className="subtitle-display">
      {currentLineIndex >= 0 && parsedLyrics[currentLineIndex] && (
        <div className="current-line">{parsedLyrics[currentLineIndex].text}</div>
      )}
    </div>
  );
};
