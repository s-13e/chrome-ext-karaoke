// options/App.tsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Options.css';

console.log('App 함수 실행전');

export function App() {
  console.log('App 실행');
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState('en');
  const [isLangLoaded, setIsLangLoaded] = useState(false);

  // 초기 언어 로드 (useLangLoader 대신 직접 구현)
  useEffect(() => {
    try {
      chrome.storage.sync.get('language', (result) => {
        const savedLang = result.language || 'en';
        i18n
          .changeLanguage(savedLang)
          .then(() => {
            setCurrentLang(savedLang);
            console.log('App.tsx의 then 실행?');
            setIsLangLoaded(true);
          })
          .catch((err) => {
            console.error('i18n error:', err);
            setIsLangLoaded(true); // 에러여도 화면은 띄움
          });
      });
    } catch (e) {
      console.error('chrome.storage error:', e);
      setIsLangLoaded(true);
    } finally {
      console.warn('chrome.storage finally');
      setIsLangLoaded(true); // 무조건 실행
    }
  }, [i18n]);

  // 언어 변경 핸들러
  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    await i18n.changeLanguage(newLang);
    setCurrentLang(newLang);
    chrome.storage.sync.set({ language: newLang });
  };

  if (!isLangLoaded) {
    console.log('isLangLoaded is not exist');
    return null;
  }
  console.log('App.tsx return 직전');

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
