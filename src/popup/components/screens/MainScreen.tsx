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
}

export function MainScreen({ autoDisableState, onOpenSettings }: Props) {
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
      <div className="popup-header">
        <h2>{t('extName')}</h2>
        <button className="icon-button" onClick={onOpenSettings}>
          <IoSettingsOutline size={16} />
        </button>
      </div>

      <div className={`${styles.discoSection} ${enabled ? styles.discoSectionOn : ''}`}>
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
