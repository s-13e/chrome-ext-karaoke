import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.css';
import { ROMANIZATION_LANGUAGE_OPTIONS } from '../onboarding/LanguagePreferenceOnboarding';

interface RomanizationSettingsProps {
  isDarkMode: boolean;
}

export function RomanizationSettings({ isDarkMode }: RomanizationSettingsProps) {
  const { t, i18n } = useTranslation();
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [loadedLibraries, setLoadedLibraries] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const currentLanguage = i18n.language || 'en';

  // 저장된 언어 설정 로드
  useEffect(() => {
    const loadSettings = async () => {
      const result = await chrome.storage.sync.get('preferredRomanizationLanguages');
      setSelectedLanguages(result.preferredRomanizationLanguages || []);
    };
    loadSettings();
  }, []);

  // 선택된 라이브러리 로드 상태 확인
  useEffect(() => {
    const checkLoadedLibraries = async () => {
      const result = await chrome.storage.local.get('loadedRomanizerLibraries');
      setLoadedLibraries(new Set(result.loadedRomanizerLibraries || []));
    };
    checkLoadedLibraries();
  }, []);

  const handleToggle = async (langCode: string) => {
    setIsLoading(true);
    try {
      const newSelection = selectedLanguages.includes(langCode)
        ? selectedLanguages.filter((code) => code !== langCode)
        : [...selectedLanguages, langCode];

      setSelectedLanguages(newSelection);
      await chrome.storage.sync.set({ preferredRomanizationLanguages: newSelection });

      // 선택 시 즉시 라이브러리 로드 (구현 예정)
      if (!selectedLanguages.includes(langCode)) {
        // TODO: 동적 라이브러리 로딩 구현 후 활성화
        // const { loadRomanizer } = await import('@lib/utils/lyrics/romanizers/dynamicRomanizerLoader');
        // await loadRomanizer(langCode);

        const newLoaded = new Set(loadedLibraries).add(langCode);
        setLoadedLibraries(newLoaded);
        await chrome.storage.local.set({ loadedRomanizerLibraries: Array.from(newLoaded) });
      }
    } catch (error) {
      console.error('Failed to update romanization settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalSize = ROMANIZATION_LANGUAGE_OPTIONS.filter((lang) => selectedLanguages.includes(lang.code)).reduce(
    (sum, lang) => sum + lang.size,
    0,
  );

  return (
    <div className={styles.menuSection} style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
      <h2 style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>{t('extRomanization', '로마자 변환')}</h2>
      <p className={styles.settingsDescription} style={{ color: isDarkMode ? '#aaaaaa' : '#666666' }}>
        {t(
          'extRomanizationDescription',
          '자주 듣는 언어를 선택하면 더 정확한 로마자 변환을 제공합니다. 선택하지 않은 언어도 기본 로마자 변환이 제공됩니다.',
        )}
      </p>

      <div className={styles.languageList}>
        {ROMANIZATION_LANGUAGE_OPTIONS.map((lang) => {
          const isSelected = selectedLanguages.includes(lang.code);
          const isLoaded = loadedLibraries.has(lang.code);

          return (
            <label key={lang.code} className={styles.languageItem}>
              <div className={styles.languageCheckbox}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggle(lang.code)}
                  disabled={isLoading}
                />
              </div>
              <div className={styles.languageInfo}>
                <span className={styles.languageFlag}>{lang.flag}</span>
                <span className={styles.languageName}>{currentLanguage === 'ko' ? lang.name : lang.nameEn}</span>
              </div>
              <div className={styles.languageMeta}>
                <span className={styles.languageSize}>+{lang.size}KB</span>
                {isLoaded && <span className={styles.languageBadge}>✓</span>}
              </div>
            </label>
          );
        })}
      </div>

      {selectedLanguages.length > 0 && (
        <div className={styles.settingsSummary} style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5' }}>
          <p style={{ color: isDarkMode ? '#aaaaaa' : '#666666' }}>
            {t('extRomanizationSelected', '선택된 언어')}:{' '}
            <strong style={{ color: isDarkMode ? '#4a90e2' : '#2c5aa0' }}>{selectedLanguages.length}</strong>
          </p>
          {totalSize > 0 && (
            <p style={{ color: isDarkMode ? '#aaaaaa' : '#666666' }}>
              {t('extRomanizationSize', '추가 크기')}:{' '}
              <strong style={{ color: isDarkMode ? '#4a90e2' : '#2c5aa0' }}>{totalSize} KB</strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
