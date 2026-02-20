// src/components/song-info/SongInfoOverlay.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.css';

type FeedbackType = 'wrong_lyrics' | 'sync_mismatch';

interface SongInfoOverlayProps {
  title: string;
  artist: string;
  composer?: string;
  lyricist?: string;
  key?: string;
  lyricsSource?: string;
  lyricsMode?: 'sync' | 'single' | 'full';
  onFeedback?: (type: FeedbackType) => void;
}

export const SongInfoOverlay: React.FC<SongInfoOverlayProps> = ({
  title,
  artist,
  lyricsSource = 'LRCLIB',
  lyricsMode: initialLyricsMode = 'sync',
  onFeedback,
}) => {
  const { t } = useTranslation();
  const [currentLyricsMode, setCurrentLyricsMode] = useState(initialLyricsMode);
  const [showFeedbackOptions, setShowFeedbackOptions] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

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

  const handleFeedbackClick = useCallback(
    (type: FeedbackType) => {
      if (onFeedback) {
        onFeedback(type);
      }
      setShowFeedbackOptions(false);
      setFeedbackSent(true);
      // 2초 후 감사 메시지 숨김
      setTimeout(() => setFeedbackSent(false), 2000);
    },
    [onFeedback],
  );

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

      {onFeedback && (
        <div className={styles.feedbackSection}>
          {feedbackSent ? (
            <div className={styles.feedbackSent}>{t('extFeedbackSentMessage')}</div>
          ) : showFeedbackOptions ? (
            <div className={styles.feedbackOptions}>
              <button className={styles.feedbackOptionButton} onClick={() => handleFeedbackClick('wrong_lyrics')}>
                {t('extFeedbackWrongLyrics')}
              </button>
              <button className={styles.feedbackOptionButton} onClick={() => handleFeedbackClick('sync_mismatch')}>
                {t('extFeedbackSyncMismatch')}
              </button>
            </div>
          ) : (
            <button className={styles.feedbackButton} onClick={() => setShowFeedbackOptions(true)}>
              {t('extFeedbackReportIssue')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
