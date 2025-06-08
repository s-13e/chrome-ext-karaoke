import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
//import LanguageDetector from 'i18next-browser-languagedetector';
import enRaw from '@_locales/en/messages.json';
import koRaw from '@_locales/ko/messages.json';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, SupportedLanguage } from '@constants/languages';
import { STORAGE_KEYS } from '@constants/storageKeys';

function convertMessages(raw: Record<string, { message?: string }>) {
  const result: Record<string, string> = {};
  Object.keys(raw).forEach((key) => {
    result[key] = raw[key]?.message || '';
  });
  return result;
}

const resources = {
  en: { translation: convertMessages(enRaw) },
  ko: { translation: convertMessages(koRaw) },
};

const isInitialized = false;

// ✅ 저장된 언어를 먼저 읽고 초기화
export const initializeI18n = async () => {
  if (isInitialized) return;

  return new Promise((resolve) => {
    chrome.storage.sync.get(STORAGE_KEYS.LANGUAGE, (result) => {
      const savedLang = (SUPPORTED_LANGUAGES as readonly string[]).includes(result.language)
        ? (result.language as SupportedLanguage)
        : DEFAULT_LANGUAGE;
      i18n
        .use(initReactI18next)
        .init({
          resources,
          lng: savedLang,
          fallbackLng: DEFAULT_LANGUAGE,
          interpolation: { escapeValue: false },
          react: { useSuspense: false },
        })
        .then(() => {
          document.documentElement.lang = savedLang;
          resolve(true);
        })
        .catch((err) => {
          console.error('i18n init failed:', err);
          resolve(false);
        });
    });
  });
};
export const i18nInstance = i18n;

// ✅ 언어 변경시 storage와 i18n 동기화 함수 추가
export const syncLanguage = (newLang: SupportedLanguage) => {
  chrome.storage.sync.set({ [STORAGE_KEYS.LANGUAGE]: newLang });
  i18n.changeLanguage(newLang);
};
