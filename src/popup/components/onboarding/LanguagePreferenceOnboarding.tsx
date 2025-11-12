import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './LanguagePreferenceOnboarding.module.css';

export interface LanguageOption {
  code: string;
  name: string;
  nameEn: string;
  flag: string;
  libraryName: string;
  size: number; // KB
  category: 'A' | 'B'; // A: 기본 포함, B: 선택 다운로드
}

// 언어 옵션 정의
export const ROMANIZATION_LANGUAGE_OPTIONS: LanguageOption[] = [
  // Category B: 전용 라이브러리 필요 (선택 다운로드)
  {
    code: 'yue',
    name: '중국어 (광둥어)',
    nameEn: 'Chinese (Cantonese)',
    flag: '🇭🇰',
    libraryName: 'canton',
    size: 45,
    category: 'B',
  },
  {
    code: 'th',
    name: '태국어',
    nameEn: 'Thai',
    flag: '🇹🇭',
    libraryName: 'thai-romanization',
    size: 30,
    category: 'B',
  },
  {
    code: 'ar',
    name: '아랍어',
    nameEn: 'Arabic',
    flag: '🇸🇦',
    libraryName: 'arabic-romanization',
    size: 40,
    category: 'B',
  },
  {
    code: 'he',
    name: '히브리어',
    nameEn: 'Hebrew',
    flag: '🇮🇱',
    libraryName: 'hebrew-transliteration',
    size: 25,
    category: 'B',
  },
  {
    code: 'hi',
    name: '힌디어 및 인도 언어',
    nameEn: 'Hindi & Indian languages',
    flag: '🇮🇳',
    libraryName: '@indic-transliteration/sanscript',
    size: 50,
    category: 'B',
  },
  {
    code: 'fa',
    name: '페르시아어',
    nameEn: 'Persian',
    flag: '🇮🇷',
    libraryName: 'persian-romanization',
    size: 35,
    category: 'B',
  },
];

// Category A 언어 (항상 포함되는 언어들)
const INCLUDED_LANGUAGES = [
  { flag: '🇰🇷', name: '한국어', nameEn: 'Korean' },
  { flag: '🇯🇵', name: '일본어', nameEn: 'Japanese' },
  { flag: '🇨🇳', name: '중국어 (만다린)', nameEn: 'Chinese (Mandarin)' },
  { flag: '🇷🇺', name: '러시아어', nameEn: 'Russian' },
  { flag: '🇬🇷', name: '그리스어', nameEn: 'Greek' },
  { flag: '🇺🇦', name: '우크라이나어', nameEn: 'Ukrainian' },
  { flag: '🇷🇸', name: '세르비아어', nameEn: 'Serbian' },
  { flag: '🇧🇬', name: '불가리아어', nameEn: 'Bulgarian' },
  { flag: '🇬🇪', name: '조지아어', nameEn: 'Georgian' },
  { flag: '🇦🇲', name: '아르메니아어', nameEn: 'Armenian' },
  { flag: '🇲🇳', name: '몽골어', nameEn: 'Mongolian' },
  { flag: '🇲🇰', name: '마케도니아어', nameEn: 'Macedonian' },
];

interface LanguagePreferenceOnboardingProps {
  onComplete: () => void;
}

export function LanguagePreferenceOnboarding({ onComplete }: LanguagePreferenceOnboardingProps) {
  const { t, i18n } = useTranslation();
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const currentLanguage = i18n.language || 'en';

  const toggleLanguage = (langCode: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(langCode) ? prev.filter((code) => code !== langCode) : [...prev, langCode],
    );
  };

  const handleContinue = async () => {
    // 선택된 언어를 storage에 저장
    await chrome.storage.sync.set({
      preferredRomanizationLanguages: selectedLanguages,
      hasCompletedLanguageOnboarding: true,
    });

    onComplete();
  };

  const handleSkip = async () => {
    // 기본 설정으로 완료 표시만
    await chrome.storage.sync.set({
      preferredRomanizationLanguages: [],
      hasCompletedLanguageOnboarding: true,
    });

    onComplete();
  };

  const totalSize = ROMANIZATION_LANGUAGE_OPTIONS.filter((lang) => selectedLanguages.includes(lang.code)).reduce(
    (sum, lang) => sum + lang.size,
    0,
  );

  return (
    <div className={styles.onboardingContainer}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>🎵 {t('extName')}</h1>
          <p className={styles.subtitle}>{t('onboardingWelcome', '자주 듣는 음악 영상의 언어를 선택해주세요')}</p>
        </div>

        {/* Category A: 기본 포함 언어 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>✅ {t('onboardingIncludedLanguages', '기본으로 포함된 언어')}</h3>
          <div className={styles.chipContainer}>
            {INCLUDED_LANGUAGES.map((lang) => (
              <span key={lang.nameEn} className={styles.chipDisabled}>
                {lang.flag} {currentLanguage === 'ko' ? lang.name : lang.nameEn}
              </span>
            ))}
          </div>
          <p className={styles.hint}>
            {t('onboardingIncludedHint', '위 언어들은 이미 포함되어 있어 추가 다운로드가 필요하지 않습니다.')}
          </p>
        </div>

        {/* Category B: 선택 다운로드 언어 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            ⬇️ {t('onboardingOptionalLanguages', '고정확도 로마자 변환을 위한 추가 라이브러리')}
          </h3>
          <div className={styles.chipContainer}>
            {ROMANIZATION_LANGUAGE_OPTIONS.map((lang) => (
              <label key={lang.code} className={styles.chipSelectable}>
                <input
                  type="checkbox"
                  checked={selectedLanguages.includes(lang.code)}
                  onChange={() => toggleLanguage(lang.code)}
                  className={styles.checkbox}
                />
                <span className={`${styles.chip} ${selectedLanguages.includes(lang.code) ? styles.chipSelected : ''}`}>
                  {lang.flag} {currentLanguage === 'ko' ? lang.name : lang.nameEn} (+{lang.size}KB)
                </span>
              </label>
            ))}
          </div>
          <p className={styles.hint}>
            {t('onboardingOptionalHint', '선택하지 않은 언어도 기본 로마자 변환이 제공됩니다. (정확도는 낮을 수 있음)')}
          </p>
        </div>

        {/* 요약 정보 */}
        <div className={styles.summary}>
          <p>
            {t('onboardingSelectedCount', '선택된 언어')}: <strong>{selectedLanguages.length}</strong>
          </p>
          {totalSize > 0 && (
            <p>
              {t('onboardingDownloadSize', '추가 다운로드 크기')}: <strong>{totalSize} KB</strong>
            </p>
          )}
        </div>

        {/* 버튼 */}
        <div className={styles.buttonContainer}>
          <button onClick={handleContinue} className={styles.primaryButton}>
            {t('onboardingContinue', '계속')}
          </button>
          <button onClick={handleSkip} className={styles.secondaryButton}>
            {t('onboardingSkip', '건너뛰기 (기본 로마자 변환 사용)')}
          </button>
        </div>
      </div>
    </div>
  );
}
