// ReadySlide.tsx
// Slide 3: 준비 완료 — YouTube 이동 CTA + 튜토리얼 재방문 안내

import React from 'react';
import { useTranslation } from 'react-i18next';
import { STORAGE_KEYS } from '@constants/storageKeys';

interface ReadySlideProps {
  onBack: () => void;
}

export const ReadySlide: React.FC<ReadySlideProps> = ({ onBack }) => {
  const { t } = useTranslation();

  const handleGoToYouTube = () => {
    chrome.storage.sync.set({ [STORAGE_KEYS.HAS_COMPLETED_WELCOME]: true });
    chrome.tabs.create({ url: 'https://www.youtube.com' });
  };

  return (
    <div style={styles.container}>
      <div style={styles.iconArea}>
        <span style={styles.icon}>🎉</span>
      </div>

      <h2 style={styles.title}>{t('extWelcomeReadyTitle')}</h2>
      <p style={styles.subtitle}>{t('extWelcomeReadySubtitle')}</p>

      <button type="button" onClick={handleGoToYouTube} style={styles.ctaBtn}>
        {t('extWelcomeReadyCta')}
      </button>

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
