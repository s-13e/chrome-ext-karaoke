import React, { useState } from 'react';
import { BackButton } from '@components/common/BackButton';
import styles from './styles.module.css';
import { FAQ } from './FAQ';
import { useTranslation } from 'react-i18next';
import { Contact } from './Contact';
import { LanguageSettings } from './LanguageSettings';
import { LyricsSettings } from './LyricsSettings';
import { RomanizationSettings } from './RomanizationSettings';
import { LicenseInfo } from './License/LicenseInfo';
import { OpenSourceLicenseList } from './License/OpenSourceLicenseList';
import { ExtensionLicense } from './License/ExtensionLicense';

export type ComponentKey =
  | 'main'
  | 'faq'
  | 'contact'
  | 'license'
  | 'openSourceList'
  | 'extensionLicense'
  | 'language'
  | 'lyricsSettings'
  | 'romanization';

interface PopupSettingsPanelProps {
  onBack: () => void;
}
interface MainMenuProps {
  onNavigate: (key: ComponentKey) => void;
}

export const PopupSettingsPanel: React.FC<PopupSettingsPanelProps> = ({ onBack }) => {
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
    lyricsSettings: t('extLyrics'),
    romanization: t('extRomanization', '로마자 변환'),
    openSourceList: t('extOpenSourceList'),
    extensionLicense: t(''),
  };

  let ContentComponent;
  if (activeComponent === 'faq') ContentComponent = FAQ;
  else if (activeComponent === 'contact') ContentComponent = Contact;
  else if (activeComponent === 'language') ContentComponent = LanguageSettings;
  else if (activeComponent === 'lyricsSettings') ContentComponent = LyricsSettings;
  else if (activeComponent === 'romanization') ContentComponent = RomanizationSettings;
  else if (activeComponent === 'license') ContentComponent = LicenseInfo;
  else if (activeComponent === 'openSourceList') ContentComponent = OpenSourceLicenseList;
  else if (activeComponent === 'extensionLicense') ContentComponent = ExtensionLicense;
  else ContentComponent = MainMenu; // 초기 메뉴

  // BackButton 클릭 핸들러 분리
  const handleBackButtonClick = () => {
    if (history.length <= 1) {
      onBack(); // 최상위 화면에서 상위 콜백 호출
    } else {
      setHistory((prev) => prev.slice(0, prev.length - 1));
    }
  };

  return (
    <div className={styles.settingsPanel}>
      <div className={styles.settingsHeader}>
        <BackButton
          onClick={handleBackButtonClick}
          className={styles.popupBackButton}
          arrowColor="#ffffff"
          transparentBackground
          style={{ marginLeft: 0 }}
        />
        <h2>{titles[activeComponent] || t('extSetting')}</h2>
      </div>
      <ContentComponent onNavigate={handleNavigate} />
    </div>
  );
};

function MainMenu({ onNavigate }: MainMenuProps) {
  const { t } = useTranslation();

  const handleResetOnboarding = async () => {
    await chrome.storage.sync.remove('hasCompletedLanguageOnboarding');
    alert('온보딩이 초기화되었습니다. Popup을 닫고 다시 열어주세요.');
  };

  return (
    <div className={styles.settingsContent}>
      <div className={styles.sectionGroup}>
        <div className={styles.sectionLabel}>{t('extPersonalSettings')}</div>
        <button className={styles.settingsButton} onClick={() => onNavigate('lyricsSettings')}>
          {t('extLyrics')}
        </button>
        <button className={styles.settingsButton} onClick={() => onNavigate('romanization')}>
          {t('extRomanization', '로마자 변환')}
        </button>
        <button className={styles.settingsButton} onClick={() => onNavigate('language')}>
          {t('extLanguage')}
        </button>
      </div>

      <div className={styles.sectionGroup}>
        <div className={styles.sectionLabel}>{t('extGeneralSettings')}</div>
        <button className={styles.settingsButton}>캐시 초기화</button>
        <button className={styles.settingsButton} onClick={handleResetOnboarding}>
          🔧 온보딩 초기화 (테스트용)
        </button>
        <button className={styles.settingsButton} onClick={() => onNavigate('faq')}>
          {t('extFAQ')}
        </button>
        <button className={styles.settingsButton} onClick={() => onNavigate('contact')}>
          {t('extContact')}
        </button>
        <button className={styles.settingsButton} onClick={() => onNavigate('license')}>
          {t('extLicense')}
        </button>
      </div>
    </div>
  );
}
