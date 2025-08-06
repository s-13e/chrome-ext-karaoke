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

interface LyricsDisplayMenuProps {
  onBack: () => void;
}

export const LyricsDisplayMenu: React.FC<LyricsDisplayMenuProps> = ({ onBack }) => {
  // 기본 토글 상태 (false = off)
  const [isRealtimeLyricsOn, setIsRealtimeLyricsOn] = useState(true);
  const [isAnnounceLyricsOn, setIsAnnounceLyricsOn] = useState(true);
  const [skipFirstLyrics, setSkipFirstLyrics] = useState(false);

  // 마운트시 스토리지에서 상태 불러오기
  useEffect(() => {
    chrome.storage.sync.get(
      [STORAGE_KEYS.realtimeLyrics, STORAGE_KEYS.announceLyrics, STORAGE_KEYS.skipFirstLyrics],
      (items) => {
        if (items[STORAGE_KEYS.realtimeLyrics] !== undefined) setIsRealtimeLyricsOn(items[STORAGE_KEYS.realtimeLyrics]);
        if (items[STORAGE_KEYS.announceLyrics] !== undefined) setIsAnnounceLyricsOn(items[STORAGE_KEYS.announceLyrics]);
        if (items[STORAGE_KEYS.skipFirstLyrics] !== undefined) setSkipFirstLyrics(items[STORAGE_KEYS.skipFirstLyrics]);
      },
    );
  }, []);

  // 체크박스 토글 상태 변화 핸들러
  const handleToggleRealtimeLyrics = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsRealtimeLyricsOn(e.target.checked);
    chrome.storage.sync.set({ [STORAGE_KEYS.realtimeLyrics]: e.target.checked });
  };
  const handleToggleAnnounceLyrics = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsAnnounceLyricsOn(e.target.checked);
    chrome.storage.sync.set({ [STORAGE_KEYS.announceLyrics]: e.target.checked });
  };
  const skipFirstLyricsToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkipFirstLyrics(e.target.checked);
    chrome.storage.sync.set({ [STORAGE_KEYS.skipFirstLyrics]: e.target.checked });
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
            <select className={styles.settingSelect} defaultValue="현재 가사만 보기">
              <option>현재 가사만 보기</option>
              <option>전체 가사를 보기</option>
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
