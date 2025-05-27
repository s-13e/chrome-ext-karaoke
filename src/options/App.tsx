import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Options.css';

export function App() {
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  // 언어 변경 핸들러
  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    await i18n.changeLanguage(newLang);
    setCurrentLang(newLang);

    chrome.storage.sync.set({ language: newLang });
  };

  // i18n 언어 변경 감지
  useEffect(() => {
    chrome.storage.sync.get('language', (result) => {
      const savedLang = result.language || 'en';
      i18n.changeLanguage(savedLang);
      setCurrentLang(savedLang);
    });
  }, [i18n]);

  return (
    <div>
      <h1>{t('language')}</h1>
      <select onChange={handleChange} value={currentLang} className="custom-select">
        <option value="ko">한국어</option>
        <option value="en">English</option>
      </select>
      <div></div>
    </div>
  );
}
