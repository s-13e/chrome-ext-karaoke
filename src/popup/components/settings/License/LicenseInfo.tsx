import React from 'react';
import styles from '@popup/components/settings/styles.module.css';
import { ComponentKey } from '../PopupSettingsPanel';

// LicenseInfo.tsx props
interface LicenseInfoProps {
  onNavigate: (key: ComponentKey) => void;
}

export const LicenseInfo: React.FC<LicenseInfoProps> = ({ onNavigate }) => {
  const handleOpenSourceList = () => onNavigate('openSourceList');
  const handleShowExtensionLicense = () => onNavigate('extensionLicense');
  return (
    <div className={styles.menuSection}>
      <div className={styles.sectionLabel}>라이선스 정보</div>
      <div>
        <button onClick={handleShowExtensionLicense}>크롬 확장 라이선스</button>
        <button onClick={handleOpenSourceList}>오픈소스 라이선스</button>
      </div>
    </div>
  );
};
