import React from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorTracker } from '@lib/utils/monitoring';
import styles from './styles.module.css';

const GITHUB_ISSUES_URL = 'https://github.com/s-13e/chrome-ext-karaoke/issues';
const SUPPORT_EMAIL_ADDRESS = '13e.personal@gmail.com';
const BUY_ME_A_COFFEE_URL = 'https://buymeacoffee.com/s.13e';
const TOSS_DONATION_URL = ''; // TODO: Add Toss donation link when ready

interface ContactProps {
  isDarkMode: boolean;
}

interface ConfirmModalProps {
  message: string;
  onConfirm?: () => void;
  onCancel: () => void;
  isDarkMode: boolean;
  confirmText?: string;
  cancelText: string;
}

// Confirmation modal component
function ConfirmModal({ message, onConfirm, onCancel, isDarkMode, confirmText, cancelText }: ConfirmModalProps) {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    // Trigger animation
    setShow(true);
  }, []);

  const handleConfirm = () => {
    setShow(false);
    if (onConfirm) {
      setTimeout(onConfirm, 150);
    } else {
      setTimeout(onCancel, 150);
    }
  };

  const handleCancel = () => {
    setShow(false);
    setTimeout(onCancel, 150);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 999999,
        padding: '0 20px',
        opacity: show ? 1 : 0,
        transition: 'opacity 0.15s ease-in-out',
      }}
      onClick={handleCancel}
    >
      <div
        style={{
          backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#000000',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          width: '100%',
          maxWidth: '300px',
          border: isDarkMode ? '1px solid #444' : '1px solid #ddd',
          transform: show ? 'scale(1)' : 'scale(0.95)',
          transition: 'all 0.15s ease-in-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: '20px', marginBottom: '8px', textAlign: 'center' }}>✅</div>
        <div
          style={{
            fontSize: '14px',
            lineHeight: '1.5',
            marginBottom: onConfirm ? '20px' : '12px',
            whiteSpace: 'pre-line',
            textAlign: 'center',
          }}
        >
          {message}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {onConfirm ? (
            <>
              <button
                onClick={handleCancel}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: 500,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: isDarkMode ? '#3a3a3a' : '#e0e0e0',
                  color: isDarkMode ? '#ffffff' : '#000000',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDarkMode ? '#4a4a4a' : '#d0d0d0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isDarkMode ? '#3a3a3a' : '#e0e0e0';
                }}
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: 500,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: '#1976d2',
                  color: '#ffffff',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1565c0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1976d2';
                }}
              >
                {confirmText}
              </button>
            </>
          ) : (
            <button
              onClick={handleConfirm}
              style={{
                width: '100%',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: 500,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: '#1976d2',
                color: '#ffffff',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1565c0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1976d2';
              }}
            >
              {cancelText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// 시스템 정보 수집 함수
const getSystemInfo = () => {
  const manifest = chrome.runtime.getManifest();
  const userAgent = navigator.userAgent;

  // 브라우저 감지
  let browser = 'Unknown';
  if (userAgent.includes('Edg/')) {
    browser = 'Edge';
  } else if (userAgent.includes('Chrome/')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Firefox/')) {
    browser = 'Firefox';
  }

  // 브라우저 버전 추출
  const browserVersionMatch = userAgent.match(/(Chrome|Edg|Firefox)\/(\d+\.\d+\.\d+)/);
  const browserVersion = browserVersionMatch ? browserVersionMatch[2] : 'Unknown';

  // OS 감지
  let os = 'Unknown';
  if (userAgent.includes('Windows')) {
    os = 'Windows';
  } else if (userAgent.includes('Mac')) {
    os = 'macOS';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
  }

  return {
    extensionVersion: manifest.version,
    browser,
    browserVersion,
    os,
    userAgent,
  };
};

// 이메일 템플릿 생성 함수
const createEmailTemplate = (lang: string, debugLogsSummary?: string): string => {
  const sysInfo = getSystemInfo();

  const debugLogsSection = debugLogsSummary
    ? `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${lang === 'ko' ? '📋 Debug 로그 요약' : lang === 'ja' ? '📋 デバッグログ概要' : lang === 'zh' ? '📋 调试日志摘要' : '📋 Debug Logs Summary'}
${lang === 'ko' ? '※ 전체 상세 로그는 클립보드에 복사되었습니다. 아래에 붙여넣어주세요.' : lang === 'ja' ? '※ 詳細ログはクリップボードにコピーされました。下に貼り付けてください。' : lang === 'zh' ? '※ 详细日志已复制到剪贴板。请粘贴在下方。' : '※ Full detailed logs copied to clipboard. Please paste below.'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${debugLogsSummary}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${lang === 'ko' ? '👇 전체 상세 로그를 여기에 붙여넣어주세요' : lang === 'ja' ? '👇 詳細ログをここに貼り付けてください' : lang === 'zh' ? '👇 请在此粘贴详细日志' : '👇 Please paste full detailed logs here'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


`
    : '';

  const templates = {
    ko: `문의 종류: [버그 리포트 / 기능 제안 / 개인정보 관련 / 번역 문제 / 기타]

문의 내용:
(자세히 작성해주세요)


재현 방법 (버그인 경우):
1.
2.
3.

기대 동작:


실제 동작:


스크린샷/영상 (선택사항):


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
아래 정보는 자동으로 수집되었습니다 (수정 불필요)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

시스템 환경:
- 확장 버전: ${sysInfo.extensionVersion}
- 브라우저: ${sysInfo.browser} ${sysInfo.browserVersion}
- OS: ${sysInfo.os}
- User Agent: ${sysInfo.userAgent}${debugLogsSection}

---
YouTube Karaoke Extension`,

    en: `Issue Type: [Bug Report / Feature Request / Privacy Concern / Translation Issue / Other]

Issue Description:
(Please describe in detail)


Steps to Reproduce (for bugs):
1.
2.
3.

Expected Behavior:


Actual Behavior:


Screenshots/Videos (optional):


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Auto-collected Information (no edit needed)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

System Environment:
- Extension Version: ${sysInfo.extensionVersion}
- Browser: ${sysInfo.browser} ${sysInfo.browserVersion}
- OS: ${sysInfo.os}
- User Agent: ${sysInfo.userAgent}${debugLogsSection}

---
YouTube Karaoke Extension`,

    ja: `お問い合わせ種類: [バグ報告 / 機能リクエスト / プライバシー関連 / 翻訳の問題 / その他]

お問い合わせ内容:
(詳しくご記入ください)


再現手順 (バグの場合):
1.
2.
3.

期待される動作:


実際の動作:


スクリーンショット/動画 (任意):


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
自動収集された情報 (編集不要)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

システム環境:
- 拡張機能バージョン: ${sysInfo.extensionVersion}
- ブラウザ: ${sysInfo.browser} ${sysInfo.browserVersion}
- OS: ${sysInfo.os}
- User Agent: ${sysInfo.userAgent}${debugLogsSection}

---
YouTube Karaoke Extension`,

    zh: `咨询类型: [错误报告 / 功能建议 / 隐私相关 / 翻译问题 / 其他]

咨询内容:
(请详细描述)


复现步骤 (如果是错误):
1.
2.
3.

预期行为:


实际行为:


截图/视频 (可选):


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
自动收集的信息 (无需编辑)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

系统环境:
- 扩展版本: ${sysInfo.extensionVersion}
- 浏览器: ${sysInfo.browser} ${sysInfo.browserVersion}
- 操作系统: ${sysInfo.os}
- User Agent: ${sysInfo.userAgent}${debugLogsSection}

---
YouTube Karaoke Extension`,
  } as const;

  return templates[lang as keyof typeof templates] || templates.en;
};

export function Contact({ isDarkMode }: ContactProps) {
  const { t, i18n } = useTranslation();
  const [includeDebugLogs, setIncludeDebugLogs] = React.useState<boolean>(true);
  const [logCount, setLogCount] = React.useState<number>(0);
  const [showModal, setShowModal] = React.useState(false);
  const [modalMessage, setModalMessage] = React.useState('');
  const [pendingGmailUrl, setPendingGmailUrl] = React.useState<string | null>(null);
  const [showDebugTools, setShowDebugTools] = React.useState(false);
  const [modalAction, setModalAction] = React.useState<(() => void) | undefined>(undefined);

  // Load log count on mount
  React.useEffect(() => {
    const loadLogCount = async () => {
      const count = await ErrorTracker.getLogCount();
      setLogCount(count);
    };
    loadLogCount();
  }, []);

  const handleGithubClick = () => {
    window.open(GITHUB_ISSUES_URL, '_blank', 'noopener,noreferrer');
  };

  const handleEmailClick = async () => {
    const currentLang = (i18n.language || 'en').split('-')[0] as string; // 'ko-KR' -> 'ko', fallback to 'en'

    let debugLogsSummary: string | undefined;
    if (includeDebugLogs && logCount > 0) {
      console.log('[Contact] Including debug logs, count:', logCount);

      // Copy full logs to clipboard in readable format
      const fullLogs = await ErrorTracker.exportLogsReadable();
      await navigator.clipboard.writeText(fullLogs);
      console.log('[Contact] Logs copied to clipboard');

      // Create summary for email (to avoid URL length limit)
      const logs = await ErrorTracker.getAllLogs();
      const totalErrors = logs.length;

      // Group errors by type for summary
      const errorGroups = new Map<string, number>();
      logs.forEach((log) => {
        const key = `${log.error.name}: ${log.error.message}`;
        errorGroups.set(key, (errorGroups.get(key) || 0) + 1);
      });

      // Create compact summary
      debugLogsSummary = `Total: ${totalErrors} error(s)\n\n`;
      let idx = 1;
      errorGroups.forEach((count, errorKey) => {
        debugLogsSummary += `${idx}. ${errorKey}\n   Occurrences: ${count}x\n\n`;
        idx++;
      });

      // Show modal notification
      const messages = {
        ko: '전체 디버그 로그가 클립보드에 복사되었습니다.\n이메일 본문에 붙여넣어주세요.',
        ja: '完全なデバッグログがクリップボードにコピーされました。\nメール本文に貼り付けてください。',
        zh: '完整的调试日志已复制到剪贴板。\n请粘贴到邮件正文中。',
        en: 'Full debug logs copied to clipboard.\nPlease paste into email body.',
      };
      const msg = messages[currentLang as keyof typeof messages] || messages.en;
      console.log('[Contact] Showing modal:', msg);

      // Prepare email URL and show confirmation modal
      const emailTemplate = createEmailTemplate(currentLang, debugLogsSummary);
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${SUPPORT_EMAIL_ADDRESS}&su=YouTube%20Karaoke%20Extension%20-%20Contact&body=${encodeURIComponent(emailTemplate)}`;

      setModalMessage(msg);
      setPendingGmailUrl(gmailUrl);
      setShowModal(true);
    } else {
      console.log('[Contact] Skipping debug logs - includeDebugLogs:', includeDebugLogs, 'logCount:', logCount);

      // No debug logs, open email directly
      const emailTemplate = createEmailTemplate(currentLang, debugLogsSummary);
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${SUPPORT_EMAIL_ADDRESS}&su=YouTube%20Karaoke%20Extension%20-%20Contact&body=${encodeURIComponent(emailTemplate)}`;
      window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleModalConfirm = () => {
    if (pendingGmailUrl) {
      window.open(pendingGmailUrl, '_blank', 'noopener,noreferrer');
    } else if (modalAction) {
      modalAction();
    }
    setShowModal(false);
    setPendingGmailUrl(null);
    setModalAction(undefined);
  };

  const handleModalCancel = () => {
    setShowModal(false);
    setPendingGmailUrl(null);
    setModalAction(undefined);
  };

  const handleViewLogs = async () => {
    if (logCount === 0) {
      setModalMessage(t('extNoLogsToView', 'No logs to view.'));
      setModalAction(undefined);
      setShowModal(true);
      return;
    }

    const logs = await ErrorTracker.getAllLogs();

    // Format logs as readable text
    let logsText = '📋 Debug Logs\n\n';
    logs.forEach((log, index) => {
      logsText += `${index + 1}. [${new Date(log.timestamp).toLocaleString()}]\n`;
      logsText += `   Level: ${log.level}\n`;
      logsText += `   Context: ${log.context}\n`;
      logsText += `   Message: ${log.message}\n`;
      logsText += `   Error: ${log.error.name} - ${log.error.message}\n`;
      if (log.error.stack) {
        logsText += `   Stack: ${log.error.stack.split('\n')[0]}\n`;
      }
      logsText += '\n';
    });

    // Copy to clipboard
    await navigator.clipboard.writeText(logsText);

    setModalMessage(t('extLogsViewedSuccess', 'Logs copied to clipboard!'));
    setModalAction(undefined);
    setShowModal(true);
  };

  const handleExportLogs = async () => {
    if (logCount === 0) {
      setModalMessage(t('extNoLogsToView', 'No logs to view.'));
      setModalAction(undefined);
      setShowModal(true);
      return;
    }

    const logs = await ErrorTracker.exportLogs();
    await navigator.clipboard.writeText(logs);

    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `youtube-karaoke-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setModalMessage(t('extLogsExportedSuccess', 'Logs exported to clipboard and downloaded as file!'));
    setModalAction(undefined);
    setShowModal(true);
  };

  const handleClearLogs = async () => {
    if (logCount === 0) {
      setModalMessage(t('extNoLogsToView', 'No logs to view.'));
      setModalAction(undefined);
      setShowModal(true);
      return;
    }

    // Show confirmation modal
    setModalMessage(t('extClearLogsConfirm', 'Are you sure you want to clear all error logs?'));
    setModalAction(() => async () => {
      await ErrorTracker.clearLogs();
      const count = await ErrorTracker.getLogCount();
      setLogCount(count);

      // Show success message
      setModalMessage(t('extLogsClearedSuccess', 'All logs have been cleared.'));
      setModalAction(undefined);
      setShowModal(true);
    });
    setShowModal(true);
  };

  return (
    <div className={styles.settingsContent} style={{ color: isDarkMode ? '#ffffff' : '#000000', padding: '18px 15px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ color: isDarkMode ? '#ffffff' : '#000000', marginTop: '0px', marginBottom: '8px' }}>
          {t('extEmail', 'Email')}
        </h4>
        <p style={{ fontSize: '0.9em', color: isDarkMode ? '#888888' : '#666666', marginBottom: '12px' }}>
          {t('extEmailDesc', 'Feel free to contact us via email if you have any questions.')}
        </p>

        {/* Debug logs checkbox */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
            cursor: 'pointer',
            fontSize: '0.9em',
            color: isDarkMode ? '#cccccc' : '#444444',
          }}
        >
          <input
            type="checkbox"
            checked={includeDebugLogs}
            onChange={(e) => setIncludeDebugLogs(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <span>
            {t('extIncludeDebugLogs', 'Include debug logs')}
            {logCount > 0 && (
              <span style={{ color: isDarkMode ? '#888888' : '#666666', marginLeft: '4px' }}>
                ({logCount} {logCount === 1 ? 'error' : 'errors'})
              </span>
            )}
          </span>
        </label>

        <button
          className={styles.settingsButton}
          type="button"
          onClick={handleEmailClick}
          style={{
            backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
            color: isDarkMode ? '#ffffff' : '#000000',
            borderBottom: isDarkMode ? '1px solid #333333' : '1px solid #e0e0e0',
          }}
        >
          {t('extSendEmail', '📧 Send Email')}
        </button>

        {/* Debug Tools Section - Collapsible, only shown if logs exist */}
        {logCount > 0 && (
          <div
            style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: isDarkMode ? '1px solid #333333' : '1px solid #e0e0e0',
            }}
          >
            <button
              onClick={() => setShowDebugTools(!showDebugTools)}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '0.9em',
                fontWeight: 500,
                backgroundColor: 'transparent',
                color: isDarkMode ? '#cccccc' : '#444444',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>
                🔍 {t('extDebugTools', 'Debug Tools')} ({logCount})
              </span>
              <span style={{ fontSize: '0.8em' }}>{showDebugTools ? '▼' : '▶'}</span>
            </button>

            {showDebugTools && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  className={styles.settingsButton}
                  type="button"
                  onClick={handleViewLogs}
                  style={{
                    backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
                    color: isDarkMode ? '#ffffff' : '#000000',
                    borderBottom: isDarkMode ? '1px solid #333333' : '1px solid #e0e0e0',
                  }}
                >
                  📋 {t('extViewLogs', 'View Logs')}
                </button>

                <button
                  className={styles.settingsButton}
                  type="button"
                  onClick={handleExportLogs}
                  style={{
                    backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
                    color: isDarkMode ? '#ffffff' : '#000000',
                    borderBottom: isDarkMode ? '1px solid #333333' : '1px solid #e0e0e0',
                  }}
                >
                  💾 {t('extExportLogs', 'Export Logs')}
                </button>

                <button
                  className={styles.settingsButton}
                  type="button"
                  onClick={handleClearLogs}
                  style={{
                    backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
                    color: isDarkMode ? '#d32f2f' : '#c62828',
                    borderBottom: isDarkMode ? '1px solid #333333' : '1px solid #e0e0e0',
                  }}
                >
                  🗑️ {t('extClearLogs', 'Clear Logs')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <h4 style={{ color: isDarkMode ? '#ffffff' : '#000000', marginTop: '0px', marginBottom: '8px' }}>
          {t('extGithubIssues', 'GitHub Issues')}
        </h4>
        <p style={{ fontSize: '0.9em', color: isDarkMode ? '#888888' : '#666666', marginBottom: '12px' }}>
          {t('extGithubIssuesDesc', 'For developers or if you prefer public discussion, please use GitHub Issues.')}
        </p>
        <button
          className={styles.settingsButton}
          type="button"
          onClick={handleGithubClick}
          style={{
            backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
            color: isDarkMode ? '#ffffff' : '#000000',
            borderBottom: isDarkMode ? '1px solid #333333' : '1px solid #e0e0e0',
          }}
        >
          {t('extOpenGithubIssues', '🐛 Open GitHub Issues')}
        </button>
      </div>

      {/* Support This Project Section */}
      <div
        style={{
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: isDarkMode ? '1px solid #333333' : '1px solid #e0e0e0',
        }}
      >
        <h4 style={{ color: isDarkMode ? '#ffffff' : '#000000', marginTop: '0px', marginBottom: '8px' }}>
          {t('extSupportProject', 'Support This Project')}
        </h4>
        <p style={{ fontSize: '0.9em', color: isDarkMode ? '#888888' : '#666666', marginBottom: '12px' }}>
          {t('extSupportProjectDesc', 'If you enjoy this extension, consider supporting my work!')}
        </p>

        {/* Buy Me a Coffee Button - Official Widget */}
        <a
          href={BUY_ME_A_COFFEE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            textDecoration: 'none',
            marginBottom: TOSS_DONATION_URL ? '12px' : '0',
          }}
        >
          <img
            src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
            alt="Buy Me A Coffee"
            style={{
              height: '40px',
              width: 'auto',
              borderRadius: '6px',
            }}
          />
        </a>

        {/* Toss Button (only show if URL is set) */}
        {TOSS_DONATION_URL && (
          <button
            className={styles.settingsButton}
            type="button"
            onClick={() => window.open(TOSS_DONATION_URL, '_blank', 'noopener,noreferrer')}
            style={{
              backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
              color: isDarkMode ? '#ffffff' : '#000000',
              borderBottom: isDarkMode ? '1px solid #333333' : '1px solid #e0e0e0',
            }}
          >
            {t('extDonateWithToss', '🇰🇷 토스로 후원하기')}
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <ConfirmModal
          message={modalMessage}
          onConfirm={pendingGmailUrl || modalAction ? handleModalConfirm : undefined}
          onCancel={handleModalCancel}
          isDarkMode={isDarkMode}
          confirmText={t('extConfirm', 'Confirm')}
          cancelText={pendingGmailUrl || modalAction ? t('extCancel', 'Cancel') : t('extConfirm', 'Confirm')}
        />
      )}
    </div>
  );
}
