// src/content/App.tsx
import { useEffect } from 'react';
// import { MESSAGE_TYPES } from '@constants/messageTypes';
import { i18nInstance } from '@services/i18n';
import { isToggleContentMessage } from '@utils/typeGuards';
import { ContentScriptMessage } from '@my_types/message';
import { STORAGE_KEYS } from '@constants/storageKeys';

export function App() {
  useEffect(() => {
    console.log('[Content] Setting up storage listener');

    const handleStorageChange = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes[STORAGE_KEYS.LANGUAGE]?.newValue) {
        const newLang = changes[STORAGE_KEYS.LANGUAGE]?.newValue;
        console.log(`[Content] Storage change detected: ${newLang}`);

        // ✅ 실제 언어 변경 적용
        if (i18nInstance.language !== newLang) {
          console.log(`[Content] Changing language: ${i18nInstance.language} -> ${newLang}`);
          i18nInstance.changeLanguage(newLang);
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  useEffect(() => {
    // 콘텐츠 제어 함수
    const updateContent = (enabled: boolean) => {
      if (enabled) {
        document.body.style.border = '5px solid red';
        console.log('콘텐츠 활성화');
      } else {
        document.body.style.border = '';
        console.log('콘텐츠 비활성화');
      }
    };
    // 언어 변경 감지 리스너
    const handleLanguageChange = () => {
      console.log('Language changed to:', i18nInstance.language);
    };

    // 1. 초기 상태 불러오기
    chrome.storage.sync.get('contentEnabled', (result) => {
      updateContent(result.contentEnabled ?? false);
    });

    // 2. 메시지 리스너 등록
    const messageListener = (request: ContentScriptMessage) => {
      if (isToggleContentMessage(request)) {
        updateContent(request.enabled); // ✅ 정확한 타입 추론
      }
    };

    i18nInstance.on('languageChanged', handleLanguageChange);
    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      i18nInstance.off('languageChanged', handleLanguageChange);
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  return null;
}
