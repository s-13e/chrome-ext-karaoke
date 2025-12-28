// popup/screens/MainScreen.tsx
import { ChangeEvent, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { IoSettingsOutline } from 'react-icons/io5';
import { AutoDisableState } from '@lib/types/autoDisable';
import { DiscoBall } from '../disco/DiscoBall';
import { useChromeStorage } from '@hooks/useChromeStorage';
import { STORAGE_KEYS } from '@constants/storageKeys';
import styles from './MainScreen.module.css';

interface Props {
  enabled: boolean;
  onToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  autoDisableState: AutoDisableState | null;
  onOpenSettings: () => void;
  isDarkMode: boolean;
}

export function MainScreen({ autoDisableState, onOpenSettings, isDarkMode }: Props) {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useChromeStorage(STORAGE_KEYS.CONTENT_ENABLED, false);

  const handleToggle = useCallback(() => {
    const next = !enabled;
    setEnabled(next);

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
        className={`${styles.discoSection} ${enabled ? styles.discoSectionOn : ''}`}
        style={{
          background: isDarkMode
            ? 'linear-gradient(135deg, #0a0a0f 0%, #0d0d15 50%, #050508 100%)'
            : 'linear-gradient(135deg, #f0f0f5 0%, #e8e8f0 50%, #f5f5fa 100%)',
        }}
      >
        {/* 디스코볼 빛 효과 - ON 상태일 때만 표시 */}
        {enabled && (
          <div className={styles.fireflies}>
            {Array.from({ length: 80 }).map((_, i) => (
              <div key={i} className={styles.firefly} style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}

        {/* 디스코볼 토글 */}
        <DiscoBall enabled={enabled} onToggle={handleToggle} />

        {/* 네온 사인 스타일 ON/OFF */}
        <div className={styles.neonSignContainer}>
          <div className={`${styles.neonSign} ${enabled ? styles.neonOn : styles.neonOff}`}>
            {enabled ? t('extPopupStatusOn') : t('extPopupStatusOff')}
          </div>
        </div>
      </div>

      {autoDisableState?.autoDisabled && autoDisableState.autoDisabledReason === 'consecutive_non_music' && (
        <div className="auto-disable-box">
          <div className="title">💤 {t('extAutoDisableTitle')}</div>
          <div>{t('extAutoDisableMessage', { count: autoDisableState.threshold })}</div>
          <div className="count">
            {t('extAutoDisableCount', {
              current: autoDisableState.consecutiveNonMusicCount,
              threshold: autoDisableState.threshold,
            })}
          </div>
        </div>
      )}
    </div>
  );
}
