// src/content/App.tsx
import { useEffect } from 'react';
import type { ContentScriptMessage } from '@my_types/message';

export function App() {
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

    // 1. 초기 상태 불러오기
    chrome.storage.sync.get('contentEnabled', (result) => {
      const enabled = result.contentEnabled ?? false;
      updateContent(enabled);
    });

    // 2. 메시지 리스너 등록
    const messageListener = (request: ContentScriptMessage) => {
      if (request.type === 'TOGGLE_CONTENT') {
        updateContent(request.enabled);
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  return null;
}
