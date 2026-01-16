// popup/screens/MainScreen.tsx
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { IoSettingsOutline } from 'react-icons/io5';
import { AutoDisableState } from '@lib/types/autoDisable';
import { useChromeStorage } from '@hooks/useChromeStorage';
import { STORAGE_KEYS } from '@constants/storageKeys';
import { enableAutoDisable, disableAutoDisable } from '@lib/utils/storage/autoDisableStorage';
import styles from './MainScreen.module.css';

interface Props {
  autoDisableState: AutoDisableState | null;
  onOpenSettings: () => void;
  isDarkMode: boolean;
}

export function MainScreen({ autoDisableState, onOpenSettings, isDarkMode }: Props) {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useChromeStorage(STORAGE_KEYS.CONTENT_ENABLED, false);

  const handleToggle = useCallback(async () => {
    const next = !enabled;
    setEnabled(next);

    // 자동 비활성화 상태 업데이트
    if (!next) {
      await enableAutoDisable('manual');
    } else {
      await disableAutoDisable();
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'TOGGLE_CONTENT',
          enabled: next,
        });
      }
    });
  }, [enabled, setEnabled]);

  return (
    <div className={styles.mainScreenContainer}>
      <div className="popup-header" style={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }}>
        <h2 style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>{t('extName')}</h2>
        <button className="icon-button" onClick={onOpenSettings} style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
          <IoSettingsOutline size={16} />
        </button>
      </div>

      <div
        className={styles.mainContent}
        style={{
          background: isDarkMode
            ? 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)'
            : 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
        }}
      >
        {/* 토글 버튼 */}
        <button
          className={`${styles.toggleButton} ${enabled ? styles.toggleOn : styles.toggleOff}`}
          onClick={handleToggle}
          style={{
            background: enabled
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : isDarkMode
                ? 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)'
                : 'linear-gradient(135deg, #cbd5e0 0%, #a0aec0 100%)',
          }}
        >
          <span className={styles.toggleText}>{enabled ? t('extPopupStatusOn') : t('extPopupStatusOff')}</span>
        </button>

        {/* Auto Pause 알림 */}
        {autoDisableState?.autoDisabled && autoDisableState.autoDisabledReason === 'consecutive_non_music' && (
          <div
            className={styles.autoPauseBox}
            style={{
              backgroundColor: isDarkMode ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.05)',
              color: isDarkMode ? '#e0e0e0' : '#333333',
            }}
          >
            <div className={styles.autoPauseTitle} style={{ color: isDarkMode ? '#ffc107' : '#8b5cf6' }}>
              💤 {t('extAutoDisableTitle')}
            </div>
            <div>{t('extAutoDisableMessage', { count: autoDisableState.threshold })}</div>
            <div className={styles.autoPauseCount} style={{ color: isDarkMode ? '#888888' : '#666666' }}>
              {t('extAutoDisableCount', {
                current: autoDisableState.consecutiveNonMusicCount,
                threshold: autoDisableState.threshold,
              })}
            </div>
          </div>
        )}

        {/* Version Info */}
        <div
          className={styles.versionInfo}
          style={{
            color: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)',
          }}
        >
          v{chrome.runtime.getManifest().version}
        </div>
      </div>
    </div>
  );
}
