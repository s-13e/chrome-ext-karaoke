// src/components/song-info/SongInfoOverlay.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.css';

interface SongInfoOverlayProps {
  title: string;
  artist: string;
  composer?: string;
  lyricist?: string;
  key?: string;
  lyricsSource: string;
}

export const SongInfoOverlay: React.FC<SongInfoOverlayProps> = ({
  title,
  artist,
  composer,
  lyricist,
  key,
  lyricsSource = 'LRCLIB',
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.overlayContainer}>
      <h1 className={styles.title}>{title}</h1>

      {artist && (
        <h2 className={styles.artist}>
          {t('extArtist')}
          {artist}
        </h2>
      )}

      <div className={styles.infoBlock}>
        {lyricist && (
          <div className={styles.lyricist}>
            {t('extLyricist')} {lyricist}
          </div>
        )}
        {composer && (
          <div className={styles.composer}>
            {t('extComposer')} {composer}
          </div>
        )}
        {key && <div className={styles.key}>키_ {key}</div>}
      </div>

      <div className={styles.source}>
        {t('extLyricsSourceLabel')}
        {lyricsSource || t('extUnknownSourceText')}
      </div>

      <div className={styles.copyrightNotice}>{t('extSongCopyrightWarning')}</div>
    </div>
  );
};
