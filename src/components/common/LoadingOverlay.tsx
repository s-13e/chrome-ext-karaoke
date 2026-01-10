// src/components/common/LoadingOverlay.tsx
// 메모리 최적화: Emotion CSS-in-JS → CSS Modules
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './LoadingOverlay.module.css';

export const LoadingOverlay = React.memo(() => {
  const { t } = useTranslation();

  return (
    <div className={styles.container} role="alert" aria-live="polite">
      <div className={styles.spinner} />
      <span className="visually-hidden">{t('extChartLoading', 'Loading...')}</span>
    </div>
  );
});
LoadingOverlay.displayName = 'LoadingOverlay';
