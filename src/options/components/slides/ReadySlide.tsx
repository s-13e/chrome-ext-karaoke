// ReadySlide.tsx
// Slide 3 (확장 ON) / 상태 안내 (확장 OFF) — 확장 활성화 상태에 따라 헤딩·CTA 분기

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { STORAGE_KEYS } from '@constants/storageKeys';
import { useChromeStorage } from '@hooks/useChromeStorage';

interface ReadySlideProps {
  onBack: () => void;
}

export const ReadySlide: React.FC<ReadySlideProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useChromeStorage(STORAGE_KEYS.CONTENT_ENABLED, false);

  // 확장 켜기 — popup을 열어 사용자가 직접 토글하게 유도 (인지 강화).
  // openPopup이 실패할 수 있는 환경(브라우저 버전·정책)에서는 storage 직접 갱신으로 fallback
  const handleEnableExtension = useCallback(async () => {
    try {
      await chrome.action.openPopup();
    } catch (err) {
      console.warn('[ReadySlide] openPopup 실패, fallback으로 직접 켜기:', err);
      setEnabled(true);
      chrome.tabs.query({ url: '*://www.youtube.com/*' }, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_CONTENT', enabled: true });
          }
        });
      });
    }
  }, [setEnabled]);

  const handleGoToYouTube = () => {
    chrome.storage.sync.set({ [STORAGE_KEYS.HAS_COMPLETED_WELCOME]: true });
    chrome.tabs.create({ url: 'https://www.youtube.com' });
  };

  // 헤딩 자체가 상태 표현 — 별도 status box 제거
  const iconChar = enabled ? '🎉' : '⚠️';
  const titleKey = enabled ? 'extWelcomeReadyTitle' : 'extWelcomeReadyStatusOff';
  const subtitleKey = enabled ? 'extWelcomeReadySubtitle' : 'extWelcomeReadySubtitleOff';

  return (
    <div style={styles.container}>
      <div style={styles.iconArea}>
        <span style={styles.icon}>{iconChar}</span>
      </div>

      <h2 style={enabled ? styles.title : styles.titleWarning}>{t(titleKey)}</h2>
      <p style={styles.subtitle}>{t(subtitleKey)}</p>

      {/* Primary CTA 한 개만 노출 — 상태에 따라 다른 버튼 */}
      {enabled ? (
        <button type="button" onClick={handleGoToYouTube} style={styles.ctaBtn}>
          {t('extWelcomeReadyCta')}
        </button>
      ) : (
        <button type="button" onClick={handleEnableExtension} style={styles.ctaBtn}>
          {t('extWelcomeReadyEnableCta')}
        </button>
      )}

      <p style={styles.hint}>{t('extWelcomeReadyHint')}</p>

      <button type="button" onClick={onBack} style={styles.backBtn}>
        {t('extWelcomeBack')}
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    padding: '48px 24px',
  },
  iconArea: {
    marginBottom: '8px',
  },
  icon: {
    fontSize: '64px',
  },
  title: {
    fontSize: '26px',
    fontWeight: 700,
    color: '#fff',
    margin: 0,
    textAlign: 'center',
  },
  titleWarning: {
    fontSize: '26px',
    fontWeight: 700,
    color: '#ffc107',
    margin: 0,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
    textAlign: 'center',
    maxWidth: '360px',
    lineHeight: '1.5',
  },
  ctaBtn: {
    marginTop: '8px',
    padding: '14px 48px',
    borderRadius: '12px',
    border: 'none',
    background: '#00d4aa',
    color: '#0f0f0f',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
  hint: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.35)',
    margin: 0,
    textAlign: 'center',
    maxWidth: '320px',
    lineHeight: '1.5',
  },
  backBtn: {
    marginTop: '4px',
    padding: '8px 20px',
    borderRadius: '6px',
    border: 'none',
    background: 'transparent',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '13px',
    cursor: 'pointer',
  },
};
