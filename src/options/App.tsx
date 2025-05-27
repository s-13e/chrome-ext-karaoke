// options/App.tsx
import React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Options.css';

export function App() {
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState('en');
  const [isLangLoaded, setIsLangLoaded] = useState(false);

  // 초기 언어 로드 (useLangLoader 대신 직접 구현)
  useEffect(() => {
    chrome.storage.sync.get('language', (result) => {
      const savedLang = result.language || 'en';
      i18n.changeLanguage(savedLang).then(() => {
        setCurrentLang(savedLang);
        setIsLangLoaded(true);
      });
    });
  }, [i18n]);

  // 언어 변경 핸들러
  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    await i18n.changeLanguage(newLang);
    setCurrentLang(newLang);
    chrome.storage.sync.set({ language: newLang });
  };

  if (!isLangLoaded) return null;

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
