import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

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

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // 기본 언어
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: { useSuspense: false }, // 크롬 확장에서 중요!
  });

export const i18nInstance = i18n;
