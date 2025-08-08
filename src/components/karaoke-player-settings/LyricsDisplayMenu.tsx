// 가사 디스플레이 상세 메뉴
// src/components/karaoke-player-settings/LyricsDisplayMenu.tsx
import React, { useEffect, useState } from 'react';
import { BackButton } from '@components/common/BackButton';
import styles from './MainMenu.module.css';
import { ToggleSwitch } from '@components/common/ToggleSwitch';

const STORAGE_KEYS = {
  realtimeLyrics: 'realtimeLyrics',
  announceLyrics: 'announceLyrics',
  skipFirstLyrics: 'skipFirstLyrics',
};

const LYRICS_MODE_KEY = 'lyricsMode';
const LYRICS_MODE = {
  SYNC: 'sync',
  FULL: 'full',
};
const labelToMode = {
  기본: LYRICS_MODE.SYNC,
  전체: LYRICS_MODE.FULL,
} as const;

type LyricsMode = (typeof LYRICS_MODE)[keyof typeof LYRICS_MODE];

interface LyricsDisplayMenuProps {
  onBack: () => void;
}

export const LyricsDisplayMenu: React.FC<LyricsDisplayMenuProps> = ({ onBack }) => {
  // 기본 토글 상태 (false = off)
  const [isRealtimeLyricsOn, setIsRealtimeLyricsOn] = useState(true);
  const [isAnnounceLyricsOn, setIsAnnounceLyricsOn] = useState(true);
  const [skipFirstLyrics, setSkipFirstLyrics] = useState(false);

  // 가사 모드
  const [lyricsMode, setLyricsMode] = useState<LyricsMode>('sync');

  // 마운트시 스토리지에서 상태 불러오기
  useEffect(() => {
    chrome.storage.sync.get(
      [STORAGE_KEYS.realtimeLyrics, STORAGE_KEYS.announceLyrics, STORAGE_KEYS.skipFirstLyrics, LYRICS_MODE_KEY],
      (items) => {
        if (items[STORAGE_KEYS.realtimeLyrics] !== undefined) setIsRealtimeLyricsOn(items[STORAGE_KEYS.realtimeLyrics]);
        if (items[STORAGE_KEYS.announceLyrics] !== undefined) setIsAnnounceLyricsOn(items[STORAGE_KEYS.announceLyrics]);
        if (items[STORAGE_KEYS.skipFirstLyrics] !== undefined) setSkipFirstLyrics(items[STORAGE_KEYS.skipFirstLyrics]);
        if (items[LYRICS_MODE_KEY]) setLyricsMode(items[LYRICS_MODE_KEY]);
      },
    );
  }, []);

  // 체크박스 토글 상태 변화 핸들러
  const handleToggleRealtimeLyrics = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsRealtimeLyricsOn(checked);
    chrome.storage.sync.set({ realtimeLyrics: checked });
  };

  const handleToggleAnnounceLyrics = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsAnnounceLyricsOn(e.target.checked);
    chrome.storage.sync.set({ [STORAGE_KEYS.announceLyrics]: e.target.checked });
  };
  const skipFirstLyricsToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkipFirstLyrics(e.target.checked);
    chrome.storage.sync.set({ [STORAGE_KEYS.skipFirstLyrics]: e.target.checked });
  };

  // select value 변경 핸들러
  const handleLyricsModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = labelToMode[e.target.value as keyof typeof labelToMode];
    setLyricsMode(value);
    chrome.storage.sync.set({ [LYRICS_MODE_KEY]: value });
  };

  return (
    <>
      <div className={styles.horizontalHeader}>
        <BackButton onClick={onBack} />
        <h2 className={styles.menuTitle}>가사 디스플레이</h2>
      </div>

      <hr className={styles.divider} />

      <div className={styles.subSectionScrollable}>
        <div className={styles.subSection}>
          <div className={styles.lyricsMenuItem}>
            <span>현재 가사</span>
            <ToggleSwitch checked={isRealtimeLyricsOn} onChange={handleToggleRealtimeLyrics} />
          </div>

          <div className={styles.lyricsMenuItem}>
            <span>발음 표시</span>
            <ToggleSwitch checked={isAnnounceLyricsOn} onChange={handleToggleAnnounceLyrics} />
          </div>

          <div className={styles.lyricsMenuItem}>
            <span>가사 방식</span>
            <select
              className={styles.settingSelect}
              value={lyricsMode === 'full' ? '전체' : '기본'}
              onChange={handleLyricsModeChange}
            >
              <option>기본</option>
              <option>전체</option>
            </select>
          </div>

          <div className={styles.lyricsMenuItem}>
            <span>전주 자동 건너뛰기</span>
            <ToggleSwitch checked={skipFirstLyrics} onChange={skipFirstLyricsToggle} />
          </div>
        </div>
      </div>
    </>
  );
};
