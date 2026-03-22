// WelcomeSlide.tsx
// Slide 1: 확장 소개 + 기대치 설정 — "이 확장이 뭔지" 알려주는 첫 화면

import React from 'react';
import { useTranslation } from 'react-i18next';

interface WelcomeSlideProps {
  onNext: () => void;
}

export const WelcomeSlide: React.FC<WelcomeSlideProps> = ({ onNext }) => {
  const { t } = useTranslation();

  return (
    <div style={styles.container}>
      <div style={styles.iconArea}>
        <span style={styles.icon}>🎤</span>
      </div>

      <h1 style={styles.title}>{t('extWelcomeTitle')}</h1>
      <p style={styles.subtitle}>{t('extWelcomeSubtitle')}</p>

      <div style={styles.features}>
        <div style={styles.featureItem}>
          <span style={styles.featureIcon}>🎵</span>
          <span style={styles.featureText}>{t('extWelcomeFeature1')}</span>
        </div>
        <div style={styles.featureItem}>
          <span style={styles.featureIcon}>🌍</span>
          <span style={styles.featureText}>{t('extWelcomeFeature2')}</span>
        </div>
        <div style={styles.featureItem}>
          <span style={styles.featureIcon}>🎨</span>
          <span style={styles.featureText}>{t('extWelcomeFeature3')}</span>
        </div>
      </div>

      <button type="button" onClick={onNext} style={styles.nextBtn}>
        {t('extWelcomeNext')}
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    padding: '40px 24px',
  },
  iconArea: {
    marginBottom: '8px',
  },
  icon: {
    fontSize: '64px',
  },
  title: {
    fontSize: '28px',
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
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    maxWidth: '400px',
    marginTop: '8px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    minHeight: '56px',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '10px',
  },
  featureIcon: {
    fontSize: '20px',
    flexShrink: 0,
  },
  featureText: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.85)',
    lineHeight: '1.4',
  },
  nextBtn: {
    marginTop: '12px',
    padding: '12px 48px',
    borderRadius: '10px',
    border: 'none',
    background: '#00d4aa',
    color: '#0f0f0f',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
};
