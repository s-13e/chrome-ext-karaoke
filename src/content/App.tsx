// src/content/App.tsx
import { useEffect, useState } from 'react';
import { i18nInstance } from '@services/i18n';
import { isToggleContentMessage } from '@lib/utils/common/typeGuards';
import { ContentScriptMessage } from '@lib/types/message';
import { STORAGE_KEYS } from '@constants/storageKeys';
import { useChromeStorage } from '@hooks/useChromeStorage';
import { MusicNoteButton } from './components/karaoke-player-settings/MusicNoteButton';
import { MainMenu } from './components/karaoke-player-settings/MainMenu';
import { RiMusicAiLine } from 'react-icons/ri';
// import { LyricsContainer } from './components/LyricsContainer';
import musicNoteStyles from './components/karaoke-player-settings/styles.module.css';

export function App() {
  // 버튼 클릭 핸들러(토글)
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
      console.log(enabled ? '콘텐츠 활성화' : '콘텐츠 비활성화');
    };
    // 언어 변경 감지 리스너
    const handleLanguageChange = () => {
      console.log('Language changed to:', i18nInstance.language);
    };

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

  const [offset, setOffset] = useState(0);
  const [contentEnabled] = useChromeStorage('contentEnabled', true);

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const handleMusicNoteClick = () => {
    const btn = document.querySelector('.ytp-music-note-button');
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setMenuPosition({
        left: rect.left + rect.width / 2 + window.scrollX,
        top: rect.bottom + window.scrollY - 60,
      });

      setMenuVisible((v) => !v);
    }
  };

  return (
    <>
      {contentEnabled && (
        <MusicNoteButton
          icon={<RiMusicAiLine className={musicNoteStyles.icon} size={24} color="white" />}
          contentEnabled={contentEnabled}
          menuVisible={menuVisible}
          onClick={handleMusicNoteClick}
        />
      )}
      {menuVisible && (
        <MainMenu
          position={menuPosition}
          visible={true}
          onClose={() => setMenuVisible(false)}
          offset={offset}
          setOffset={setOffset}
        />
      )}
    </>
  );
}
