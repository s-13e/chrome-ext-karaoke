// popup/App.tsx
import { ChangeEvent, useEffect, useState } from 'react';
import { useLangLoader } from '@hooks/useLangLoader';
import { useTranslation } from 'react-i18next';
import { useChromeStorage } from '@hooks/useChromeStorage';
import { MESSAGE_TYPES } from '@constants/messageTypes';
import { ErrorFallback } from '@components/common/ErrorFallback';
import { LoadingOverlay } from '@components/common/LoadingOverlay';
import { STORAGE_KEYS } from '@constants/storageKeys';
import { PopupSettingsPanel } from './components/settings/PopupSettingsPanel';
import { LanguagePreferenceOnboarding } from './components/onboarding/LanguagePreferenceOnboarding';
import './popup.css';
import { getAutoDisableState, disableAutoDisable, enableAutoDisable } from '@lib/utils/storage/autoDisableStorage';
import { AutoDisableState } from '@lib/types/autoDisable';
import { MainScreen } from './components/screens/MainScreen';

interface LanguageChangeMessage {
  type: typeof MESSAGE_TYPES.LANGUAGE_CHANGED;
  language: string;
}

export function App() {
  const { i18n } = useTranslation();
  const { phase } = useLangLoader();

  const [enabled, setEnabled] = useChromeStorage(STORAGE_KEYS.CONTENT_ENABLED, false);
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [autoDisableState, setAutoDisableState] = useState<AutoDisableState | null>(null);

  // 온보딩 완료 여부 확인
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const result = await chrome.storage.sync.get('hasCompletedLanguageOnboarding');
      const hasCompleted = result.hasCompletedLanguageOnboarding || false;
      setShowOnboarding(!hasCompleted);
    };
    checkOnboardingStatus();
  }, []);

  // 자동 비활성화 상태 로드
  useEffect(() => {
    const loadAutoDisableState = async () => {
      const state = await getAutoDisableState();
      setAutoDisableState(state);
    };
    loadAutoDisableState();

    // Storage 변경 감지
    const handleStorageChange = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes.autoDisableState) {
        setAutoDisableState(changes.autoDisableState.newValue);
      }
    };

    chrome.storage.local.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.local.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  // 스위치 상태 변경 핸들러
  const handleToggle = async (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setEnabled(newValue);

    // 사용자가 수동으로 끈 경우 자동 비활성화 사유 업데이트
    if (!newValue) {
      await enableAutoDisable('manual');
    } else {
      // 사용자가 수동으로 켠 경우 자동 비활성화 해제
      await disableAutoDisable();
    }

    // 현재 활성 탭에 메시지 전송 (content script가 없을 수 있으므로 에러 무시)
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            type: MESSAGE_TYPES.TOGGLE_CONTENT,
            enabled: newValue,
          },
          () => {
            // chrome.runtime.lastError 체크하여 에러 무시
            if (chrome.runtime.lastError) {
              console.log('[Popup] Content script not ready:', chrome.runtime.lastError.message);
            }
          },
        );
      }
    });
  };

  useEffect(() => {
    console.log('[Popup] Setting up language listeners');

    // 스토리지 변경과 메시지 둘 다 처리
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

  if (phase === 'error') {
    return (
      <ErrorFallback
        error={undefined}
        resetErrorBoundary={function (): void {
          throw new Error('Function not implemented.');
        }}
      />
    );
  }

  if (phase !== 'ready') return <LoadingOverlay />;

  // 온보딩 화면 표시
  if (showOnboarding) {
    return <LanguagePreferenceOnboarding onComplete={() => setShowOnboarding(false)} />;
  }

  if (showSettings) {
    return <PopupSettingsPanel onBack={() => setShowSettings(false)} />;
  }

  return (
    <div>
      <MainScreen
        enabled={enabled}
        onToggle={handleToggle}
        autoDisableState={autoDisableState}
        onOpenSettings={() => setShowSettings(true)}
      />
    </div>
  );
}
