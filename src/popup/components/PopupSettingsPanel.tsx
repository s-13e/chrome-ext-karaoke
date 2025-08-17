import React, { useState } from 'react';
import { BackButton } from '@components/common/BackButton';
import styles from './popupSettingsPanel.module.css';
import { FAQ } from './FAQ';
import { useTranslation } from 'react-i18next';
import { Contact } from './Contact';
import { LanguageSettings } from './LanguageSettings';
import { LyricsSettings } from './LyricsSettings';
import { LicenseInfo } from './LicenseInfo';

type ComponentKey = 'main' | 'faq' | 'contact' | 'license' | 'language' | 'lyricsSettings';
interface PopupSettingsPanelProps {
  onBack: () => void;
}
interface MainMenuProps {
  onNavigate: (key: ComponentKey) => void;
}

export const PopupSettingsPanel: React.FC<PopupSettingsPanelProps> = ({ onBack }) => {
  const { t } = useTranslation();

  const titles: Record<ComponentKey, string> = {
    main: t('extSetting'),
    faq: t('extFAQ'),
    contact: t('extContact'),
    license: t('extLicense'),
    language: t('extLanguage'),
    lyricsSettings: t('extLyrics'),
  };
  const [activeComponent, setActiveComponent] = useState<ComponentKey>('main');

  let ContentComponent;
  if (activeComponent === 'faq') ContentComponent = FAQ;
  else if (activeComponent === 'contact') ContentComponent = Contact;
  else if (activeComponent === 'language') ContentComponent = LanguageSettings;
  else if (activeComponent === 'lyricsSettings') ContentComponent = LyricsSettings;
  else if (activeComponent === 'license') ContentComponent = LicenseInfo;
  else ContentComponent = MainMenu; // 초기 메뉴

  // BackButton 클릭 핸들러 분리
  const handleBackButtonClick = () => {
    if (activeComponent === 'main') {
      // 현재 초기 메뉴면 부모(onBack) 콜백 호출 -> App.tsx 등 상위로 이동
      onBack();
    } else {
      // FAQ 등 상세화면이면 초기 메뉴로 변경
      setActiveComponent('main');
    }
  };

  return (
    <div className={styles.settingsPanel}>
      <div className={styles.settingsHeader}>
        <BackButton
          onClick={handleBackButtonClick}
          className={styles.popupBackButton}
          arrowColor="#000"
          transparentBackground
          style={{ marginLeft: 0 }}
        />
        <h2>{titles[activeComponent] || t('extSetting')}</h2>
      </div>
      <ContentComponent onNavigate={setActiveComponent} />
    </div>
  );
};
function MainMenu({ onNavigate }: MainMenuProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.settingsContent}>
      <div className={styles.sectionGroup}>
        <div className={styles.sectionLabel}>{t('extPersonalSettings')}</div>
        <button className={styles.settingsButton} onClick={() => onNavigate('lyricsSettings')}>
          {t('extLyrics')}
        </button>
        <button className={styles.settingsButton}>싱크 조절</button>
        <button className={styles.settingsButton}>스타일 변경</button>
        <button className={styles.settingsButton} onClick={() => onNavigate('language')}>
          {t('extLanguage')}
        </button>
      </div>

      <div className={styles.sectionGroup}>
        <div className={styles.sectionLabel}>{t('extGeneralSettings')}</div>
        <button className={styles.settingsButton}>캐시 초기화</button>
        <button className={styles.settingsButton} onClick={() => onNavigate('faq')}>
          {t('extFAQ')}
        </button>
        <button className={styles.settingsButton} onClick={() => onNavigate('contact')}>
          {t('extContact')}
        </button>
        <button className={styles.settingsButton}>{t('extLicense')}</button>
      </div>
    </div>
  );
}
