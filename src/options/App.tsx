import React from 'react';
import { useLangLoader } from '@hooks/useLangLoader';
import { ErrorFallback } from '@components/common/ErrorFallback';
import { DebugSection } from './components/DebugSection';

export function App() {
  const { phase, error } = useLangLoader();

  // 상태별 UI 처리
  if (phase === 'error') return <ErrorFallback error={error!} resetErrorBoundary={() => window.location.reload()} />;
  if (phase !== 'ready') return null;

  return (
    <div className="options-container" style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>YouTube Karaoke</h1>
        <p style={styles.subtitle}>Advanced Settings & Debugging</p>
      </header>

      <DebugSection />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '32px',
    textAlign: 'center',
  },
  title: {
    fontSize: '28px',
    fontWeight: 600,
    color: '#333',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
  },
};
