import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function App() {
  const { t, i18n } = useTranslation();

  // 컴포넌트 마운트 시 저장된 언어 불러오기
  useEffect(() => {
    chrome.storage.sync.get('language', (result) => {
      const savedLang = result.language || 'en';
      i18n.changeLanguage(savedLang);
    });
  }, [i18n]);

  return (
    <div>
      <h1>{t('language')}</h1>
    </div>
  );
}
