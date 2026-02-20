// src/components/song-info/SongInfoOverlay.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.css';

interface SongInfoOverlayProps {
  title: string;
  artist: string;
  composer?: string;
  lyricist?: string;
  key?: string;
  lyricsSource?: string;
  lyricsMode?: 'sync' | 'single' | 'full';
}

export const SongInfoOverlay: React.FC<SongInfoOverlayProps> = ({
  title,
  artist,
  lyricsSource = 'LRCLIB',
  lyricsMode: initialLyricsMode = 'sync',
}) => {
  const { t } = useTranslation();
  const [currentLyricsMode, setCurrentLyricsMode] = useState(initialLyricsMode);

  // Chrome storage 변경 구독하여 lyricsMode 실시간 업데이트
  useEffect(() => {
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'sync' && changes.lyricsMode) {
        setCurrentLyricsMode(changes.lyricsMode.newValue as 'sync' | 'single' | 'full');
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  // props 변경 시에도 반영
  useEffect(() => {
    setCurrentLyricsMode(initialLyricsMode);
  }, [initialLyricsMode]);

  const isFullMode = currentLyricsMode === 'full';

  return (
    <div className={`${styles.overlayContainer} ${isFullMode ? styles.fullModeCompact : ''}`}>
      <h1 className={styles.title}>{title}</h1>

      {artist && (
        <h2 className={styles.artist}>
          {t('extArtist')} {artist}
        </h2>
      )}

      <div className={styles.source}>
        {t('extLyricsSourceLabel')} {lyricsSource || t('extUnknownSourceText')}
      </div>

      <div className={styles.copyrightNotice}>
        <div>{t('extSongCopyrightWarning1')}</div>
        <div>{t('extSongCopyrightWarning2')}</div>
      </div>
    </div>
  );
};
