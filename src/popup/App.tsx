// poup/App.tsx
import React from 'react';
import './popup.css';
import { useLangLoader } from '@hooks/useLangLoader';
// import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useChromeStorage } from '@hooks/useChromeStorage';
import { MESSAGE_TYPES } from '@constants/messageTypes';

export function App() {
  const { t } = useTranslation();
  const { isLangLoaded, loading, error } = useLangLoader(); // 구조 분해 할당
  //const [enabled, setEnabled, isEnabledLoading] = useChromeStorage<boolean>('switchState', false);
  const [enabled, setEnabled, isEnabledLoading] = useChromeStorage('contentEnabled', false);

  // 설정 버튼 클릭 시 옵션 페이지 열기
  const handleOpenOptions = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      // 구버전 브라우저 호환
      window.open(chrome.runtime.getURL('options.html'));
    }
  };
  // 스위치 상태 변경 핸들러
  const handleToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setEnabled(newValue);

    // 현재 활성 탭에 메시지 전송
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) {
        console.error('No active tab found');
        return;
      }
      chrome.tabs.sendMessage(tabs[0].id, {
        type: MESSAGE_TYPES.TOGGLE_CONTENT,
        enabled: newValue,
      });
    });
  };

  if (loading || isEnabledLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!isLangLoaded) return <div>Language not loaded</div>;

  return (
    <div>
      <div className="popup-header">
        <h2>{t('extName')}</h2>
        <button id="go-to-options" className="icon-button" onClick={handleOpenOptions}>
          <img src="../assets/icons/setting.png" alt="설정" width={24} height={24} />
        </button>
      </div>
      <div>
        <label className="switch">
          <input type="checkbox" checked={enabled} onChange={handleToggle} />
          <span className="slider"></span>
        </label>
      </div>
    </div>
  );
}
