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

// 저장된 언어 동기적으로 가져오기 (주의: chrome.storage는 비동기이므로 완벽하지 않음)
let savedLang = 'en';
chrome.storage.sync.get('language', (result) => {
  savedLang = result.language || 'en';
});

i18n.use(initReactI18next).init({
  resources,
  lng: savedLang, // 초기 언어를 저장된 값으로 설정
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  react: { useSuspense: false }, // 크롬 확장에서 중요!
});

export const i18nInstance = i18n;
