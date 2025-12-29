import { useTranslation } from 'react-i18next';
import styles from './styles.module.css';

const GITHUB_ISSUES_URL = 'https://github.com/s-13e/chrome-ext-karaoke/issues';
const SUPPORT_EMAIL_ADDRESS = '13e.personal@gmail.com';

interface ContactProps {
  isDarkMode: boolean;
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
const createEmailTemplate = (lang: string): string => {
  const sysInfo = getSystemInfo();

  const templates = {
    ko: `문의 종류: [버그 리포트 / 기능 제안 / 개인정보 관련 / 기타]

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
- User Agent: ${sysInfo.userAgent}

---
YouTube Karaoke Extension`,

    en: `Issue Type: [Bug Report / Feature Request / Privacy Concern / Other]

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
- User Agent: ${sysInfo.userAgent}

---
YouTube Karaoke Extension`,

    ja: `お問い合わせ種類: [バグ報告 / 機能リクエスト / プライバシー関連 / その他]

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
- User Agent: ${sysInfo.userAgent}

---
YouTube Karaoke Extension`,

    zh: `咨询类型: [错误报告 / 功能建议 / 隐私相关 / 其他]

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
- User Agent: ${sysInfo.userAgent}

---
YouTube Karaoke Extension`,
  } as const;

  return templates[lang as keyof typeof templates] || templates.en;
};

export function Contact({ isDarkMode }: ContactProps) {
  const { t, i18n } = useTranslation();

  const handleGithubClick = () => {
    window.open(GITHUB_ISSUES_URL, '_blank', 'noopener,noreferrer');
  };

  const handleEmailClick = () => {
    const currentLang = (i18n.language || 'en').split('-')[0] as string; // 'ko-KR' -> 'ko', fallback to 'en'
    const emailTemplate = createEmailTemplate(currentLang);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${SUPPORT_EMAIL_ADDRESS}&su=YouTube%20Karaoke%20Extension%20-%20Contact&body=${encodeURIComponent(emailTemplate)}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
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
    </div>
  );
}
