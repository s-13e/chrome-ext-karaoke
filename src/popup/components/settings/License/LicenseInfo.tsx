import React from 'react';
import styles from '@popup/components/settings/styles.module.css';
import { ComponentKey } from '../PopupSettingsPanel';

// LicenseInfo.tsx props
interface LicenseInfoProps {
  onNavigate: (key: ComponentKey) => void;
  isDarkMode: boolean;
}

export const LicenseInfo: React.FC<LicenseInfoProps> = ({ onNavigate, isDarkMode }) => {
  const handleOpenSourceList = () => onNavigate('openSourceList');
  const handleShowExtensionLicense = () => onNavigate('extensionLicense');
  return (
    <div className={styles.settingsContent}>
      <div className={styles.sectionLabel} style={{ color: isDarkMode ? '#888888' : '#666666', marginLeft: '15px' }}>
        라이선스 정보
      </div>
      <div>
        <button
          onClick={handleShowExtensionLicense}
          className={styles.settingsButton}
          style={{
            backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
            color: isDarkMode ? '#ffffff' : '#000000',
            borderBottom: isDarkMode ? '1px solid #333333' : '1px solid #e0e0e0',
          }}
        >
          크롬 확장 라이선스
        </button>
        <button
          onClick={handleOpenSourceList}
          className={styles.settingsButton}
          style={{
            backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
            color: isDarkMode ? '#ffffff' : '#000000',
            borderBottom: isDarkMode ? '1px solid #333333' : '1px solid #e0e0e0',
          }}
        >
          오픈소스 라이선스
        </button>
      </div>
    </div>
  );
};
