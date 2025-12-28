import React from 'react';
import styles from '@popup/components/settings/styles.module.css';
import licenseStyles from './styles.module.css';
import { ALL_LICENSES } from '@constants/generatedLicenses';

// Auto-generated from npm packages and README.md
// To update: npm run generate-licenses

interface OpenSourceLicenseListProps {
  isDarkMode: boolean;
}

export const OpenSourceLicenseList: React.FC<OpenSourceLicenseListProps> = ({ isDarkMode }) => {
  // Separate licenses by category
  const npmPackages = ALL_LICENSES.filter((lic) => lic.category === 'npm');
  const fonts = ALL_LICENSES.filter((lic) => lic.category === 'font');

  return (
    <div className={styles.settingsContent} style={{ color: isDarkMode ? '#ffffff' : '#000000', padding: '18px 15px' }}>
      {/* NPM Packages Section */}
      <h4 style={{ color: isDarkMode ? '#ffffff' : '#000000', marginTop: '0px', marginBottom: '5px' }}>
        Open Source Libraries
      </h4>
      <p style={{ fontSize: '0.9em', color: isDarkMode ? '#888888' : '#666666', marginBottom: '10px' }}>
        Auto-generated from package.json dependencies
      </p>
      <ul className={licenseStyles.libraryList}>
        {npmPackages.map((lib, idx) => (
          <li key={idx} className={licenseStyles.libraryItem}>
            <div>
              <strong style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>{lib.name}</strong>{' '}
              <span style={{ color: isDarkMode ? '#888888' : '#666666' }}>({lib.license} License)</span>
            </div>
            <div style={{ fontSize: '0.93em', color: isDarkMode ? '#cccccc' : '#333333' }}>
              Author: {lib.author} <br />
              {lib.link && (
                <a
                  href={lib.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: isDarkMode ? '#4a90e2' : '#2c5aa0' }}
                >
                  License / Project Link
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Fonts Section */}
      <div style={{ height: '40px' }} />
      <h4 style={{ color: isDarkMode ? '#ffffff' : '#000000', marginTop: '0px', marginBottom: '5px' }}>Fonts</h4>
      <p style={{ fontSize: '0.9em', color: isDarkMode ? '#888888' : '#666666', marginBottom: '10px' }}>
        All fonts from Google Fonts under SIL Open Font License or Apache License
      </p>
      <ul className={licenseStyles.libraryList}>
        {fonts.map((font, idx) => (
          <li key={idx} className={licenseStyles.libraryItem}>
            <div>
              <strong style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>{font.name}</strong>{' '}
              <span style={{ color: isDarkMode ? '#888888' : '#666666' }}>({font.license})</span>
            </div>
            <div style={{ fontSize: '0.93em', color: isDarkMode ? '#cccccc' : '#333333' }}>
              Designer: {font.author} <br />
              <a
                href={font.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: isDarkMode ? '#4a90e2' : '#2c5aa0' }}
              >
                View License
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
