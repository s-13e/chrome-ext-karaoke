// popup/App.tsx
import { useEffect, useState } from 'react';
import { useLangLoader } from '@hooks/useLangLoader';
import { useTranslation } from 'react-i18next';
import { MESSAGE_TYPES } from '@constants/messageTypes';
import { ErrorFallback } from '@components/common/ErrorFallback';
import { LoadingOverlay } from '@components/common/LoadingOverlay';
import { STORAGE_KEYS } from '@constants/storageKeys';
import { PopupSettingsPanel } from './components/settings/PopupSettingsPanel';
import './popup.css';
import { getAutoDisableState } from '@lib/utils/storage/autoDisableStorage';
import { AutoDisableState } from '@lib/types/autoDisable';
import { MainScreen } from './components/screens/MainScreen';
import { ModeOnboarding } from './components/onboarding/ModeOnboarding';

interface LanguageChangeMessage {
  type: typeof MESSAGE_TYPES.LANGUAGE_CHANGED;
  language: string;
}

export function App() {
  const { i18n } = useTranslation();
  const { phase } = useLangLoader();

  const [showSettings, setShowSettings] = useState(false);
  const [showModeOnboarding, setShowModeOnboarding] = useState<boolean | null>(null);

  // 온보딩 완료 여부를 storage에서 확인
  // CONTENT_ENABLED가 이미 설정된 기존 유저는 온보딩 스킵
  useEffect(() => {
    chrome.storage.sync.get([STORAGE_KEYS.HAS_COMPLETED_MODE_ONBOARDING, STORAGE_KEYS.CONTENT_ENABLED], (result) => {
      const onboardingCompleted = result[STORAGE_KEYS.HAS_COMPLETED_MODE_ONBOARDING] === true;
      const isExistingUser = result[STORAGE_KEYS.CONTENT_ENABLED] !== undefined;

      if (!onboardingCompleted && isExistingUser) {
        chrome.storage.sync.set({ [STORAGE_KEYS.HAS_COMPLETED_MODE_ONBOARDING]: true });
      }

      setShowModeOnboarding(!onboardingCompleted && !isExistingUser);
    });
  }, []);
  const [autoDisableState, setAutoDisableState] = useState<AutoDisableState | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isDarkModeLoaded, setIsDarkModeLoaded] = useState<boolean>(false);

  // 다크모드 상태 로드 및 감지
  useEffect(() => {
    const loadDarkMode = async () => {
      const result = await chrome.storage.sync.get(['darkMode']);
      setIsDarkMode((result.darkMode as boolean | undefined) ?? false);
      setIsDarkModeLoaded(true);
    };
    loadDarkMode();

    const handleDarkModeChange = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes.darkMode) {
        setIsDarkMode((changes.darkMode.newValue as boolean | undefined) ?? false);
      }
    };

    chrome.storage.onChanged.addListener(handleDarkModeChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleDarkModeChange);
    };
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
        setAutoDisableState(changes.autoDisableState.newValue as AutoDisableState);
      }
    };

    chrome.storage.local.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.local.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  useEffect(() => {
    console.log('[Popup] Setting up language listeners');

    // 스토리지 변경과 메시지 둘 다 처리
    const handleStorageChange = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes[STORAGE_KEYS.LANGUAGE]?.newValue) {
        const newLang = changes[STORAGE_KEYS.LANGUAGE]?.newValue as string | undefined;
        console.log(`[Popup] Storage change detected: ${newLang}`);

        if (newLang && i18n.language !== newLang) {
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

  if (phase !== 'ready' || !isDarkModeLoaded || showModeOnboarding === null) return <LoadingOverlay />;

  if (showModeOnboarding) {
    return (
      <div className="popup-wrapper">
        <ModeOnboarding onComplete={() => setShowModeOnboarding(false)} />
      </div>
    );
  }

  if (showSettings) {
    return <PopupSettingsPanel onBack={() => setShowSettings(false)} isDarkMode={isDarkMode} />;
  }

  const IS_DEV = process.env.DEV_MODE === 'true';

  return (
    <div className="popup-wrapper">
      <MainScreen
        autoDisableState={autoDisableState}
        onOpenSettings={() => setShowSettings(true)}
        isDarkMode={isDarkMode}
      />
      {IS_DEV && (
        <button
          type="button"
          onClick={() => setShowModeOnboarding(true)}
          style={{
            position: 'fixed',
            bottom: '4px',
            right: '4px',
            fontSize: '10px',
            padding: '2px 6px',
            background: '#ff6b6b',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            opacity: 0.7,
            zIndex: 9999,
          }}
        >
          DEV: 온보딩
        </button>
      )}
    </div>
  );
}
