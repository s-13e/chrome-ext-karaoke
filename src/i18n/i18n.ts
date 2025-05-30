import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
//import LanguageDetector from 'i18next-browser-languagedetector';

import enRaw from '../../_locales/en/messages.json';
import koRaw from '../../_locales/ko/messages.json';

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

// ✅ 저장된 언어를 먼저 읽고 초기화
export const initializeI18n = async () => {
  return new Promise((resolve) => {
    chrome.storage.sync.get('language', (result) => {
      const savedLang = result.language || 'en';
      i18n
        .use(initReactI18next)
        .init({
          resources,
          lng: savedLang, // 저장된 언어로 초기화
          fallbackLng: 'en',
          interpolation: { escapeValue: false },
          react: { useSuspense: false },
        })
        .then(resolve);
    });
  });
};
export const i18nInstance = i18n;
