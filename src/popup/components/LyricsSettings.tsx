import React from 'react';
import { useChromeStorage } from '@hooks/useChromeStorage';
import styles from './popupSettingsPanel.module.css';

export const LyricsSettings: React.FC = () => {
  // 스토리지에 저장된 설정 불러오기, 기본값 지정
  const [showRealtimeLyrics, setShowRealtimeLyrics] = useChromeStorage('realtimeLyrics', true);
  const [showPronunciationLyrics, setShowPronunciationLyrics] = useChromeStorage('announceLyrics', true);
  const [lyricsFontColorCurrent, setLyricsFontColorCurrent] = useChromeStorage('lyricsFontColorCurrent', '#FFFFFF');
  const [lyricsFontColorPronunciation, setLyricsFontColorPronunciation] = useChromeStorage(
    'lyricsFontColorPronunciation',
    '#AAAAAA',
  );
  const [lyricsMode, setLyricsMode] = useChromeStorage('lyricsMode', 'sync'); // 'sync' | 'full'

  // 폰트 모드 옵션
  const modeOptions = [
    { label: '기본(싱크)', value: 'sync' },
    { label: '전체가사', value: 'full' },
  ];

  return (
    <div className={styles.sectionGroup}>
      <div className={styles.sectionLabel}>가사 설정</div>

      <label className={styles.settingItem}>
        <input type="checkbox" checked={showRealtimeLyrics} onChange={(e) => setShowRealtimeLyrics(e.target.checked)} />
        현재 가사 표시
      </label>

      <label className={styles.settingItem}>
        <input
          type="checkbox"
          checked={showPronunciationLyrics}
          onChange={(e) => setShowPronunciationLyrics(e.target.checked)}
        />
        발음 가사 표시
      </label>

      <div className={styles.settingItem}>
        <label htmlFor="lyricsModeSelect" className={styles.settingLabel}>
          가사 모드
        </label>
        <select
          id="lyricsModeSelect"
          value={lyricsMode}
          onChange={(e) => setLyricsMode(e.target.value)}
          className={styles.settingSelect}
        >
          {modeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.settingItem}>
        <label htmlFor="fontColorCurrent" className={styles.settingLabel}>
          가사 글꼴 색상
        </label>
        <input
          id="fontColorCurrent"
          type="color"
          value={lyricsFontColorCurrent}
          onChange={(e) => setLyricsFontColorCurrent(e.target.value)}
          className={styles.colorPicker}
        />
        <label htmlFor="fontColorCurrent" className={styles.settingLabel}>
          가사 하이라이트 색상
        </label>
      </div>

      <div className={styles.settingItem}>
        <label htmlFor="fontColorPronunciation" className={styles.settingLabel}>
          발음 가사 색상
        </label>
        <input
          id="fontColorPronunciation"
          type="color"
          value={lyricsFontColorPronunciation}
          onChange={(e) => setLyricsFontColorPronunciation(e.target.value)}
          className={styles.colorPicker}
        />
      </div>
    </div>
  );
};
