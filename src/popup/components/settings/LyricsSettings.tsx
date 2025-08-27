import React, { useState } from 'react';
import { useChromeStorage } from '@hooks/useChromeStorage';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.css';
import SplitText from '@components/react-bits/SplitText';

export const LyricsSettings: React.FC = () => {
  const { t } = useTranslation();

  // 스토리지에 저장된 설정 불러오기, 기본값 지정
  const [showRealtimeLyrics, setShowRealtimeLyrics] = useChromeStorage('realtimeLyrics', true);
  const [showPronunciationLyrics, setShowPronunciationLyrics] = useChromeStorage('announceLyrics', true);
  const [lyricsFontColorCurrent, setLyricsFontColorCurrent] = useChromeStorage('lyricsFontColorCurrent', '#FFFFFF');
  const [lyricsFontColorPronunciation, setLyricsFontColorPronunciation] = useChromeStorage(
    'lyricsFontColorPronunciation',
    '#AAAAAA',
  );
  const [lyricsMode, setLyricsMode] = useChromeStorage('lyricsMode', 'sync'); // 'sync' | 'full' | 'single'

  const [fontEffect, setFontEffect] = useState<string>(''); // 효과 타입 저장

  // 폰트 모드 옵션
  const modeOptions = [
    { label: t('extCurrentLyrics'), value: 'sync' },
    { label: t('extFullLyrics'), value: 'full' },
    { label: t('extSingleLyrics'), value: 'single' },
  ];
  const fontEffectOptions = [
    { label: 'SplitText', value: 'splitType' },
    { label: 'BlurText', value: 'blurType' },
    { label: 'TextText', value: 'textType' },
  ];

  const previewLyrics: { main: string; sub: string }[] =
    lyricsMode === 'single'
      ? [{ main: 'Set ’em on fire', sub: 'Set ’em on fire' }]
      : lyricsMode === 'sync'
        ? [
            { main: '스스로 밝혀', sub: 'Seuseuro Balkyeo' },
            { main: 'Set ’em on fire', sub: 'Set ’em on fire' },
          ]
        : [
            { main: "And I don't really care if you", sub: '앤드 아이 돈 리얼리 케어 이프 유' },
            { main: 'like me, like me', sub: '라이크 미, 라이크 미' },
            { main: "I don't really wanna", sub: '아이 돈 리얼리 워너' },
            { main: 'know if you like me', sub: '노우 이프 유 라이크 미' },
          ];

  // 자막 효과별 메인 텍스트 렌더링 처리 (확장용)
  const renderMainText = (text: string, idx: number) => {
    switch (fontEffect) {
      case 'splitType':
        return <SplitText key={idx} text={text} className="" />;
      // case 'blurType':
      //   return <BlurText key={idx} text={text} />;
      // case 'textType':
      //   return <TextText key={idx} text={text} />;
      default:
        return (
          <div key={idx} style={{ color: lyricsFontColorCurrent, fontWeight: 'bold' }}>
            {text}
          </div>
        );
    }
  };

  return (
    <div className={styles.menuSection}>
      <div className={styles.previewBox}>
        {previewLyrics.map((line, idx) => (
          <div
            key={idx}
            className={`${styles.previewLine} ${
              lyricsMode === 'single' ? styles.singleMode : lyricsMode === 'sync' ? styles.syncMode : styles.fullMode
            }`}
          >
            {showRealtimeLyrics && renderMainText(line.main, idx)}
            {showPronunciationLyrics && <div style={{ color: lyricsFontColorPronunciation }}>{line.sub}</div>}
          </div>
        ))}
      </div>
      <div className={styles.settingsScrollable}>
        <div className={styles.settingMenu}>
          <label className={styles.settingItem}>
            <input
              type="checkbox"
              checked={showRealtimeLyrics}
              onChange={(e) => setShowRealtimeLyrics(e.target.checked)}
            />
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
        </div>
        <div className={styles.settingMenu}>
          <label htmlFor="lyricsModeSelect" className={styles.settingLabel}>
            {t('extLyricsMode')}
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

        <div className={styles.settingMenu}>
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

        <div className={styles.settingMenu}>
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
        <div className={styles.settingMenu}>
          <label htmlFor="fontEffectSelect" className={styles.settingLabel}>
            자막 효과
          </label>
          <select
            id="fontEffectSelect"
            className={styles.settingSelect}
            value={fontEffect}
            onChange={(e) => setFontEffect(e.target.value)}
          >
            <option value="">기본 (효과 없음)</option>
            {fontEffectOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
