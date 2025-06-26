import React, { useEffect, useState } from 'react';
import { SyncSubtitle } from './SyncSubtitle';
import { createRoot } from 'react-dom/client';

export const LyricsContainer: React.FC<{ lyrics: string }> = ({ lyrics }) => {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const video = document.querySelector('video');
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    video.addEventListener('timeupdate', updateTime);

    return () => video.removeEventListener('timeupdate', updateTime);
  }, []);

  return (
    <div className="lyrics-container">
      <SyncSubtitle lyrics={lyrics} currentTime={currentTime} />
    </div>
  );
};

// DOM에 컨테이너 초기화
export const initLyricsContainer = (data: { lyrics: string }) => {
  let container = document.getElementById('lyrics-root');
  if (!container) {
    container = document.createElement('div');
    container.id = 'lyrics-root';
    document.body.appendChild(container);
  }

  const root = createRoot(container);
  root.render(<LyricsContainer lyrics={data.lyrics} />);
};
