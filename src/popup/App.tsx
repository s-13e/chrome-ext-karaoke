// poup/App.tsx
import './popup.css';
import { useLangLoader } from '../i18n/useLangLoader'; // 또는 utils 폴더
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function App() {
  const { t } = useTranslation();
  const isLangLoaded = useLangLoader();
  const [enabled, setEnabled] = useState(false);

  if (!isLangLoaded) return null;

  // 설정 버튼 클릭 시 옵션 페이지 열기
  const handleOpenOptions = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      // 구버전 브라우저 호환
      window.open(chrome.runtime.getURL('options.html'));
    }
  };

  // 상태 변경 함수
  const toggleEnabled = () => setEnabled((prev) => !prev);

  return (
    <div>
      <div className="popup-header">
        <h1>{t('extName')}</h1>
        <button id="go-to-options" className="icon-button" onClick={handleOpenOptions}>
          <img src="../assets/icons/setting.png" alt="설정" width={24} height={24} />
        </button>
      </div>
      <div>
        <label className="switch">
          <input type="checkbox" checked={enabled} onChange={toggleEnabled} />
          <span className="slider"></span>
        </label>
      </div>
    </div>
  );
}
