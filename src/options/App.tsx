// Options/App.tsx
// 설치 직후 Welcome Page 표시 → 완료 후 "가이드 다시 보기" 링크

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLangLoader } from '@hooks/useLangLoader';
import { ErrorFallback } from '@components/common/ErrorFallback';
import { STORAGE_KEYS } from '@constants/storageKeys';
import { WelcomePage } from './components/WelcomePage';

export function App() {
  const { phase, error } = useLangLoader();
  const { t } = useTranslation();
  const [welcomeCompleted, setWelcomeCompleted] = useState<boolean | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get(STORAGE_KEYS.HAS_COMPLETED_WELCOME, (result) => {
      const completed = result[STORAGE_KEYS.HAS_COMPLETED_WELCOME] === true;
      setWelcomeCompleted(completed);
      // 첫 방문이면 자동으로 Welcome Page 표시
      if (!completed) setShowWelcome(true);
    });
  }, []);

  if (phase === 'error') return <ErrorFallback error={error!} resetErrorBoundary={() => window.location.reload()} />;
  if (phase !== 'ready' || welcomeCompleted === null) return null;

  // Welcome Page 표시
  if (showWelcome) return <WelcomePage />;

  // 이미 완료한 유저: "가이드 다시 보기" 링크
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>YouTube Karaoke</h1>
        <p style={styles.subtitle}>{t('extOptionsSubtitle')}</p>
      </header>

      <button type="button" onClick={() => setShowWelcome(true)} style={styles.guideBtn}>
        {t('extOptionsViewGuide')}
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: '#0f0f0f',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    gap: '24px',
  },
  header: {
    textAlign: 'center',
  },
  title: {
    fontSize: '28px',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.5)',
  },
  guideBtn: {
    padding: '12px 32px',
    borderRadius: '10px',
    border: '1px solid rgba(0, 212, 170, 0.3)',
    background: 'rgba(0, 212, 170, 0.08)',
    color: '#00d4aa',
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
};
