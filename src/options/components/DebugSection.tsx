/**
 * Debug section component for Options page
 * Allows users to export and clear error logs for bug reporting
 * Note: Uses English only as this is primarily for developers and bug reporting
 */

import React from 'react';
import { ErrorTracker } from '@lib/utils/monitoring';
import type { ErrorLog } from '@lib/utils/monitoring';

export function DebugSection() {
  const [logCount, setLogCount] = React.useState<number>(0);
  const [isExporting, setIsExporting] = React.useState(false);
  const [isClearing, setIsClearing] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load log count on mount
  React.useEffect(() => {
    loadLogCount();
  }, []);

  const loadLogCount = async () => {
    const count = await ErrorTracker.getLogCount();
    setLogCount(count);
  };

  const handleExportLogs = async () => {
    setIsExporting(true);
    setMessage(null);

    try {
      const logs = await ErrorTracker.exportLogs();

      // Copy to clipboard
      await navigator.clipboard.writeText(logs);

      // Also download as file
      const blob = new Blob([logs], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `youtube-karaoke-debug-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Logs exported to clipboard and downloaded as file!' });
    } catch (error) {
      console.error('Failed to export logs:', error);
      setMessage({ type: 'error', text: 'Failed to export logs. Please try again.' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all error logs?')) {
      return;
    }

    setIsClearing(true);
    setMessage(null);

    try {
      await ErrorTracker.clearLogs();
      await loadLogCount();
      setMessage({ type: 'success', text: 'All logs have been cleared.' });
    } catch (error) {
      console.error('Failed to clear logs:', error);
      setMessage({ type: 'error', text: 'Failed to clear logs. Please try again.' });
    } finally {
      setIsClearing(false);
    }
  };

  const handleViewLogs = async () => {
    try {
      const logs = await ErrorTracker.getAllLogs();
      console.group('📋 Debug Logs');
      console.table(
        logs.map((log: ErrorLog) => ({
          time: new Date(log.timestamp).toLocaleString(),
          level: log.level,
          context: log.context,
          message: log.message,
          error: log.error.message,
        })),
      );
      logs.forEach((log: ErrorLog, index: number) => {
        console.group(`Log ${index + 1}`);
        console.log('Full details:', log);
        console.groupEnd();
      });
      console.groupEnd();
      setMessage({ type: 'success', text: 'Logs displayed in developer console. Press F12 to view.' });
    } catch (error) {
      console.error('Failed to view logs:', error);
      setMessage({ type: 'error', text: 'Failed to view logs. Please try again.' });
    }
  };

  return (
    <div className="debug-section" style={styles.container}>
      <h2 style={styles.title}>Debug & Bug Reporting</h2>
      <p style={styles.description}>
        Export error logs to help us fix bugs. Logs are stored locally and only shared when you manually export them.
      </p>

      <div style={styles.stats}>
        <span style={styles.statsLabel}>Stored Error Logs:</span>
        <span style={styles.statsValue}>{logCount}</span>
      </div>

      <div style={styles.buttons}>
        <button
          onClick={handleViewLogs}
          disabled={logCount === 0}
          style={{
            ...styles.button,
            ...styles.buttonSecondary,
            ...(logCount === 0 ? styles.buttonDisabled : {}),
          }}
        >
          View in Console
        </button>

        <button
          onClick={handleExportLogs}
          disabled={isExporting || logCount === 0}
          style={{
            ...styles.button,
            ...styles.buttonPrimary,
            ...(isExporting || logCount === 0 ? styles.buttonDisabled : {}),
          }}
        >
          {isExporting ? 'Exporting...' : 'Export Logs'}
        </button>

        <button
          onClick={handleClearLogs}
          disabled={isClearing || logCount === 0}
          style={{
            ...styles.button,
            ...styles.buttonDanger,
            ...(isClearing || logCount === 0 ? styles.buttonDisabled : {}),
          }}
        >
          {isClearing ? 'Clearing...' : 'Clear Logs'}
        </button>
      </div>

      {message && (
        <div
          style={{
            ...styles.message,
            ...(message.type === 'success' ? styles.messageSuccess : styles.messageError),
          }}
        >
          {message.text}
        </div>
      )}

      <div style={styles.note}>
        <strong>Note:</strong> Error logs contain: stack traces, extension version, browser version, and error context.
        Personal data like video URLs or user settings are NOT included.
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginTop: '32px',
    padding: '24px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
  },
  title: {
    marginTop: 0,
    marginBottom: '12px',
    fontSize: '20px',
    fontWeight: 600,
    color: '#333',
  },
  description: {
    marginBottom: '16px',
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.5',
  },
  stats: {
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#fff',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statsLabel: {
    fontSize: '14px',
    color: '#666',
  },
  statsValue: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#333',
  },
  buttons: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  button: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  buttonPrimary: {
    backgroundColor: '#1976d2',
    color: '#fff',
  },
  buttonSecondary: {
    backgroundColor: '#757575',
    color: '#fff',
  },
  buttonDanger: {
    backgroundColor: '#d32f2f',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  message: {
    marginTop: '16px',
    padding: '12px',
    borderRadius: '4px',
    fontSize: '14px',
  },
  messageSuccess: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    border: '1px solid #a5d6a7',
  },
  messageError: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    border: '1px solid #ef9a9a',
  },
  note: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#fff3e0',
    border: '1px solid #ffb74d',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#e65100',
    lineHeight: '1.5',
  },
};
