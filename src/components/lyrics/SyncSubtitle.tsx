import React from 'react';
import { parseLyrics } from '@lib/utils/lyricsParser';
import { useCurrentTime } from '@hooks/useCurrentTime';

export const SyncSubtitle: React.FC<{ lyrics: string }> = ({ lyrics }) => {
  const currentTime = useCurrentTime();
  const lines = parseLyrics(lyrics);

  if (!lyrics || lyrics.trim() === '') {
    console.warn('[SyncSubtitle] lyrics prop이 비어 있음');
  }
  if (!lines.length) {
    console.warn('[SyncSubtitle] 파싱된 가사 라인이 없음');
  }

  const idx = lines.findIndex((l, i) => {
    const next = lines[i + 1];
    return currentTime >= l.time && (next === undefined || currentTime < next.time);
  });

  if (idx === -1 && lines.length > 0) {
    console.log('[SyncSubtitle] 현재 시간에 맞는 가사 라인 없음', currentTime);
  }

  return <div className="lyrics-cc-subtitle">{idx >= 0 && lines[idx] && <span>{lines[idx].text}</span>}</div>;
};
