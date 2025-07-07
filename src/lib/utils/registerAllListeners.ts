import { listenerManager } from './listenerManager';
import { STORAGE_KEYS } from '@constants/storageKeys';

// 필요한 핸들러 함수도 이 파일에서 선언하거나 import
export function registerAllListeners(setDetectionState: (enabled: boolean) => void) {
  // 1. chrome.storage.onChanged 리스너
  listenerManager.add(() => {
    const handler = (
      changes: { [key: string]: chrome.storage.StorageChange },
      // areaName?: 'sync' | 'local' | 'managed' | 'session'
    ) => {
      const contentEnabledChange = changes[STORAGE_KEYS.CONTENT_ENABLED];
      if (contentEnabledChange && typeof contentEnabledChange.newValue === 'boolean') {
        setDetectionState(contentEnabledChange.newValue);
      }
    };
    chrome.storage.onChanged.addListener(handler);
    return () => chrome.storage.onChanged.removeListener(handler);
  });

  // 2. window resize 리스너
  listenerManager.add(() => {
    const onResize = (/*event: UIEvent*/) => {
      // 예: 가사 UI 레이아웃 동기화 등
      // updateLyricsContainerLayout();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  });

  // 3. 필요한 다른 리스너도 이곳에 추가
}
