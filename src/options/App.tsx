import React from 'react';
import { useLangLoader } from '@hooks/useLangLoader';
import { ErrorFallback } from '@components/common/ErrorFallback';

export function App() {
  const { phase, error } = useLangLoader();

  // 상태별 UI 처리
  if (phase === 'error') return <ErrorFallback error={error!} resetErrorBoundary={() => window.location.reload()} />;
  if (phase !== 'ready') return null;

  return (
    <div className="options-container" style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>YouTube Karaoke</h1>
        <p style={styles.subtitle}>Advanced Settings</p>
      </header>

      <div style={styles.notice}>
        <p style={styles.noticeText}>🔍 Debug tools have been moved to the popup settings menu (Contact section).</p>
        <p style={styles.noticeSubtext}>
          Click the extension icon and navigate to Settings → Contact to access error logs and debugging features.
        </p>
      </div>
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
  notice: {
    backgroundColor: '#f0f7ff',
    border: '1px solid #90caf9',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
  },
  noticeText: {
    fontSize: '16px',
    fontWeight: 500,
    color: '#1976d2',
    marginBottom: '8px',
  },
  noticeSubtext: {
    fontSize: '14px',
    color: '#555',
    margin: 0,
  },
};
