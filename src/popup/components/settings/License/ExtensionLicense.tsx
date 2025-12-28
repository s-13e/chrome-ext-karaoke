import React from 'react';
import styles from './styles.module.css';

interface ExtensionLicenseProps {
  isDarkMode: boolean;
}

export const ExtensionLicense: React.FC<ExtensionLicenseProps> = ({ isDarkMode }) => {
  return (
    <div className={styles.openSourceList} style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
      <h2 style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>Extension licenses</h2>
      <p style={{ color: isDarkMode ? '#cccccc' : '#333333' }}></p>
    </div>
  );
};
