import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.css';

interface ExtensionLicenseProps {
  isDarkMode: boolean;
}

export const ExtensionLicense: React.FC<ExtensionLicenseProps> = ({ isDarkMode }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.openSourceList} style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
      <h2 style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>{t('extExtensionLicense', 'Extension License')}</h2>
      <p style={{ color: isDarkMode ? '#cccccc' : '#333333' }}></p>
    </div>
  );
};
