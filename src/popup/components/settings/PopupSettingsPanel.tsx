import React, { useState } from 'react';
import { BackButton } from '@components/common/BackButton';
import styles from './styles.module.css';
import { FAQ } from './FAQ';
import { useTranslation } from 'react-i18next';
import { Contact } from './Contact';
import { LanguageSettings } from './LanguageSettings';
import { LicenseInfo } from './License/LicenseInfo';
import { OpenSourceLicenseList } from './License/OpenSourceLicenseList';
import { ExtensionLicense } from './License/ExtensionLicense';

export type ComponentKey = 'main' | 'faq' | 'contact' | 'license' | 'openSourceList' | 'extensionLicense' | 'language';

interface PopupSettingsPanelProps {
  onBack: () => void;
  isDarkMode: boolean;
}
interface MainMenuProps {
  onNavigate: (key: ComponentKey) => void;
  isDarkMode: boolean;
}

export const PopupSettingsPanel: React.FC<PopupSettingsPanelProps> = ({ onBack, isDarkMode }) => {
  const { t } = useTranslation();
  const [history, setHistory] = useState<ComponentKey[]>(['main']);
  const activeComponent = history[history.length - 1] as ComponentKey;

  const handleNavigate = (key: ComponentKey) => {
    setHistory((prev) => [...prev, key]);
  };

  const titles: Record<ComponentKey, string> = {
    main: t('extSetting'),
    faq: t('extFAQ'),
    contact: t('extContact'),
    license: t('extLicense'),
    language: t('extLanguage'),
    openSourceList: t('extOpenSourceList'),
    extensionLicense: t(''),
  };

  const renderContent = () => {
    if (activeComponent === 'faq') return <FAQ isDarkMode={isDarkMode} />;
    if (activeComponent === 'contact') return <Contact isDarkMode={isDarkMode} />;
    if (activeComponent === 'language') return <LanguageSettings isDarkMode={isDarkMode} />;
    if (activeComponent === 'license') return <LicenseInfo onNavigate={handleNavigate} isDarkMode={isDarkMode} />;
    if (activeComponent === 'openSourceList') return <OpenSourceLicenseList isDarkMode={isDarkMode} />;
    if (activeComponent === 'extensionLicense') return <ExtensionLicense isDarkMode={isDarkMode} />;
    return <MainMenu onNavigate={handleNavigate} isDarkMode={isDarkMode} />;
  };

  // BackButton 클릭 핸들러 분리
  const handleBackButtonClick = () => {
    if (history.length <= 1) {
      onBack(); // 최상위 화면에서 상위 콜백 호출
    } else {
      setHistory((prev) => prev.slice(0, prev.length - 1));
    }
  };

  return (
    <div className={styles.settingsPanel} style={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff' }}>
      <div
        className={styles.settingsHeader}
        style={{
          backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
          borderBottom: isDarkMode ? '1px solid #333333' : '1px solid #e0e0e0',
        }}
      >
        <BackButton
          onClick={handleBackButtonClick}
          className={styles.popupBackButton}
          arrowColor={isDarkMode ? '#ffffff' : '#000000'}
          transparentBackground
          style={{ marginLeft: 0 }}
        />
        <h2 style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>{titles[activeComponent] || t('extSetting')}</h2>
      </div>
      <style>
        {`
          .${styles.settingsContent}::-webkit-scrollbar-track {
            background: ${isDarkMode ? '#0a0a0a' : '#f0f0f0'};
          }
          .${styles.settingsContent}::-webkit-scrollbar-thumb {
            background: ${isDarkMode ? '#3a3a3a' : '#c0c0c0'};
          }
          .${styles.settingsContent}::-webkit-scrollbar-thumb:hover {
            background: ${isDarkMode ? '#4a4a4a' : '#a0a0a0'};
          }
        `}
      </style>
      {renderContent()}
    </div>
  );
};

function MainMenu({ onNavigate, isDarkMode }: MainMenuProps) {
  const { t } = useTranslation();

  const handleDarkModeToggle = async () => {
    const newDarkMode = !isDarkMode;
    await chrome.storage.sync.set({ darkMode: newDarkMode });
  };

  return (
    <div className={styles.settingsContent}>
      <div className={styles.sectionGroup}>
        <div className={styles.sectionLabel} style={{ color: isDarkMode ? '#888888' : '#666666' }}>
          {t('extPersonalSettings')}
        </div>
        <div
          className={styles.toggleButtonRow}
          style={{
            backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
            borderBottom: isDarkMode ? '1px solid #333333' : '1px solid #e0e0e0',
          }}
        >
          <span className={styles.toggleLabel} style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
            {t('extDarkMode', '다크 모드')}
          </span>
          <label className={styles.switch}>
            <input type="checkbox" checked={isDarkMode} onChange={handleDarkModeToggle} />
            <span className={styles.slider} style={{ backgroundColor: isDarkMode ? '#4a4a4a' : '#cccccc' }}></span>
          </label>
        </div>
        <button
          className={styles.settingsButton}
          onClick={() => onNavigate('language')}
          style={{
            backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
            color: isDarkMode ? '#ffffff' : '#000000',
            borderBottom: isDarkMode ? '1px solid #333333' : '1px solid #e0e0e0',
          }}
        >
          {t('extLanguage')}
        </button>
      </div>

      <div className={styles.sectionGroup}>
        <div className={styles.sectionLabel} style={{ color: isDarkMode ? '#888888' : '#666666' }}>
          {t('extGeneralSettings')}
        </div>
        <button
          className={styles.settingsButton}
          onClick={() => onNavigate('faq')}
          style={{
            backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
            color: isDarkMode ? '#ffffff' : '#000000',
            borderBottom: isDarkMode ? '1px solid #333333' : '1px solid #e0e0e0',
          }}
        >
          {t('extFAQ')}
        </button>
        <button
          className={styles.settingsButton}
          onClick={() => onNavigate('contact')}
          style={{
            backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
            color: isDarkMode ? '#ffffff' : '#000000',
            borderBottom: isDarkMode ? '1px solid #333333' : '1px solid #e0e0e0',
          }}
        >
          {t('extContact')}
        </button>
        <button
          className={styles.settingsButton}
          onClick={() => onNavigate('license')}
          style={{
            backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
            color: isDarkMode ? '#ffffff' : '#000000',
            borderBottom: isDarkMode ? '1px solid #333333' : '1px solid #e0e0e0',
          }}
        >
          {t('extLicense')}
        </button>
      </div>
    </div>
  );
}
