import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function useLangLoader() {
  const { i18n } = useTranslation();
  const [isLangLoaded, setIsLangLoaded] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get('language', (result) => {
      const savedLang = result.language || 'en';
      i18n.changeLanguage(savedLang).then(() => {
        setIsLangLoaded(true);
        document.body.setAttribute('data-lang-loaded', 'true');
      });
    });
  }, [i18n]);

  return isLangLoaded;
}
