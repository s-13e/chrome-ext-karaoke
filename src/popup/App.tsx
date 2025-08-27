// poup/App.tsx
import { useEffect, useState } from 'react';
import { useLangLoader } from '@hooks/useLangLoader';
import { useTranslation } from 'react-i18next';
// import { useChromeStorage } from '@hooks/useChromeStorage';
import { MESSAGE_TYPES } from '@constants/messageTypes';
import { ErrorFallback } from '@components/common/ErrorFallback';
import { LoadingOverlay } from '@components/common/LoadingOverlay';
import { STORAGE_KEYS } from '@constants/storageKeys';
import { PopupSettingsPanel } from './components/settings/PopupSettingsPanel';
import './popup.css';
import { Timer } from './components/timer/Timer';
import { History } from './components/history/History';
interface LanguageChangeMessage {
  type: typeof MESSAGE_TYPES.LANGUAGE_CHANGED;
  language: string;
}
export function App() {
  const { t, i18n } = useTranslation();
  const { phase } = useLangLoader();

  // const [enabled, setEnabled] = useChromeStorage(STORAGE_KEYS.CONTENT_ENABLED, false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'timer' | 'history'>('timer');

  useEffect(() => {
    console.log('[Popup] Setting up language listeners');

    // ✅ 스토리지 변경과 메시지 둘 다 처리
    const handleStorageChange = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes[STORAGE_KEYS.LANGUAGE]?.newValue) {
        const newLang = changes[STORAGE_KEYS.LANGUAGE]?.newValue;
        console.log(`[Popup] Storage change detected: ${newLang}`);

        if (i18n.language !== newLang) {
          console.log(`[Popup] Changing language: ${i18n.language} -> ${newLang}`);
          i18n.changeLanguage(newLang);
        }
      }
    };

    const handleMessage = (message: LanguageChangeMessage) => {
      console.log('[Popup] Received message:', message);
      if (message.type === MESSAGE_TYPES.LANGUAGE_CHANGED && message.language) {
        console.log(`[Popup] Language change message: ${message.language}`);
        if (i18n.language !== message.language) {
          i18n.changeLanguage(message.language);
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [i18n]);
  if (phase === 'error')
    return (
      <ErrorFallback
        error={undefined}
        resetErrorBoundary={function (): void {
          throw new Error('Function not implemented.');
        }}
      />
    );

  if (phase !== 'ready') return <LoadingOverlay />;

  // 스위치 상태 변경 핸들러
  // const handleToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const newValue = e.target.checked;
  //   // setEnabled(newValue);

  //   // 현재 활성 탭에 메시지 전송
  //   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  //     if (tabs[0]?.id)
  //       chrome.tabs.sendMessage(tabs[0].id, {
  //         type: MESSAGE_TYPES.TOGGLE_CONTENT,
  //         enabled: newValue,
  //       });
  //   });
  // };

  if (showSettings) {
    return <PopupSettingsPanel onBack={() => setShowSettings(false)} />;
  }

  return (
    <div>
      <div className="popup-header">
        <h2>{t('extName')}</h2>
        <button id="go-to-options" className="icon-button" onClick={() => setShowSettings(true)}>
          <img src="../assets/icons/setting.png" alt="설정" width={24} height={24} />
        </button>
      </div>
      <div className="popup-wrapper">
        <div className="popup-tabs">
          <div className="slider" style={{ transform: activeTab === 'timer' ? 'translateX(0)' : 'translateX(100%)' }} />
          <button
            className={`tab ${activeTab === 'timer' ? 'active' : ''}`}
            onClick={() => setActiveTab('timer')}
            type="button"
          >
            타이머 설정
          </button>
          <button
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
            type="button"
          >
            히스토리
          </button>
        </div>
        <div>{activeTab === 'timer' ? <Timer /> : <History />}</div>
      </div>
    </div>
  );
}
