This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose

This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format

The content is organized as follows:

1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
   a. A header with the file path (## File: path/to/file)
   b. The full contents of the file in a code block

## Usage Guidelines

- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes

- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure

```
App.tsx
background/background.ts
content/App.tsx
content/index.tsx
hooks/useChromeStorage.ts
hooks/useLangLoader.ts
index.tsx
options/App.tsx
options/index.tsx
options/Options.css
options/options.html
payment/pay.txt
popup/App.tsx
popup/index.tsx
popup/popup.css
popup/popup.html
services/i18n.ts
types/message.ts
```

# Files

## File: App.tsx

```typescript
// src/App.tsx
//import { useTranslation } from 'react-i18next';
import { useLangLoader } from './hooks/useLangLoader';

export function App() {
  const isLangLoaded = useLangLoader();

  if (!isLangLoaded) return null;

  return null;
}
```

## File: background/background.ts

```typescript
// 예시: 백그라운드 스크립트
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed!');
});

// background.js
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'TOGGLE_CONTENT') {
    console.log('Toggle received:', message.enabled);
    return true; // 비동기 처리 활성화
  }
});

// 특정 페이지에서만 툴바의 아이콘(버튼)이 보이도록 하려함
```

## File: content/App.tsx

```typescript
// src/content/App.tsx
import { useEffect } from 'react';
import type { ContentScriptMessage } from '../types/message';

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
```

## File: content/index.tsx

```typescript
// src/content/index.tsx
// import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const root = document.createElement('div');
root.id = 'chrome-extension-root';
document.body.appendChild(root);

createRoot(root).render(<App />);
```

## File: hooks/useChromeStorage.ts

```typescript
// src/hooks/useChromeStorage.ts
import { useState, useEffect } from 'react';

export function useChromeStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  // 저장된 값 불러오기
  useEffect(() => {
    chrome.storage.sync.get([key], (result) => {
      const storedValue = result[key] ?? defaultValue;
      setValue(storedValue);
      setIsLoading(false);
    });
  }, [key, defaultValue]);

  // 값 저장하기
  const setStoredValue = (newValue: T) => {
    setValue(newValue);
    chrome.storage.sync.set({ [key]: newValue });
  };

  return [value, setStoredValue, isLoading] as const;
}
```

## File: hooks/useLangLoader.ts

```typescript
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function useLangLoader() {
  const { i18n } = useTranslation();
  const [isLangLoaded, setIsLangLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    chrome.storage.sync.get('language', (result) => {
      const savedLang = result.language || 'en';
      i18n
        .changeLanguage(savedLang)
        .then(() => {
          setIsLangLoaded(true);
          document.body.setAttribute('data-lang-loaded', 'true');
        })
        .catch((err) => {
          setError(err); // 에러 발생 시 상태 업데이트
        })
        .finally(() => {
          setLoading(false); // 로딩 완료 (성공/실패 무관)
        });
    });
  }, [i18n]);

  return { isLangLoaded, loading, error }; // 객체로 상태 반환
}
```

## File: index.tsx

```typescript
//import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './services/i18n';

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
```

## File: options/App.tsx

```typescript
// options/App.tsx
import React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Options.css';

export function App() {
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
    }
  }, [i18n]);

  // 언어 변경 핸들러
  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    await i18n.changeLanguage(newLang);
    setCurrentLang(newLang);
    chrome.storage.sync.set({ language: newLang });
  };

  if (!isLangLoaded) return null;

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
```

## File: options/index.tsx

```typescript
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { I18nextProvider } from 'react-i18next';
import { i18nInstance } from '../services/i18n';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <I18nextProvider i18n={i18nInstance}>
      <App />
    </I18nextProvider>,
  );
}
```

## File: options/Options.css

```css
.custom-select {
  border: none;
  background: transparent;
  font-size: 1rem;
  padding: 4px 8px;
  outline: none;
  /* 필요하다면 width, color 등도 추가 */
}
css
/* 팝업, 옵션 공통 CSS */
body:not([data-lang-loaded]) {
  opacity: 0;
}

body[data-lang-loaded] {
  opacity: 1;
  transition: opacity 0.3s;
}
```

## File: options/options.html

```html
<!-- options.html -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Options</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

## File: payment/pay.txt

```
나중에 하셈.
ExtensionPay 로 구현할 예정
추후 사용자 모이면 그때 구현 시도해보기
```

## File: popup/App.tsx

```typescript
// poup/App.tsx
import React from 'react';
import './popup.css';
import { useLangLoader } from '../hooks/useLangLoader';
// import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useChromeStorage } from '../hooks/useChromeStorage';

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
        type: 'TOGGLE_CONTENT',
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
```

## File: popup/index.tsx

```typescript
// src/content/index.tsx
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { initializeI18n } from '../services/i18n';
import React from 'react';

// ✅ i18n 초기화 후에만 앱 렌더링
initializeI18n().then(() => {
  const root = createRoot(document.getElementById('root')!);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
```

## File: popup/popup.css

```css
body {
  width: 300px;
  height: 500px;
  margin: 0;
  padding: 10px;
}
.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 또는 button에 margin-left: auto */
}
.icon-button {
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer; /* 마우스 오버 시 포인터 */
  outline: none; /* 포커스 테두리 제거 (접근성 필요시 조정) */
  display: inline-flex; /* 아이콘 정렬에 유리 */
  align-items: center;
  justify-content: center;
}
/* switch button */
.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
}
.switch input {
  display: none;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  border-radius: 22px;
  transition: 0.4s;
}
.slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  border-radius: 50%;
  transition: 0.4s;
}
input:checked + .slider {
  background-color: #2196f3;
}
input:checked + .slider:before {
  transform: translateX(18px);
}
```

## File: popup/popup.html

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

## File: services/i18n.ts

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
//import LanguageDetector from 'i18next-browser-languagedetector';

import enRaw from '../../_locales/en/messages.json';
import koRaw from '../../_locales/ko/messages.json';

function convertMessages(raw: Record<string, { message?: string }>) {
  const result: Record<string, string> = {};
  Object.keys(raw).forEach((key) => {
    result[key] = raw[key]?.message || '';
  });
  return result;
}

const resources = {
  en: { translation: convertMessages(enRaw) },
  ko: { translation: convertMessages(koRaw) },
};

// ✅ 저장된 언어를 먼저 읽고 초기화
export const initializeI18n = async () => {
  return new Promise((resolve) => {
    chrome.storage.sync.get('language', (result) => {
      const savedLang = result.language || 'en';
      i18n
        .use(initReactI18next)
        .init({
          resources,
          lng: savedLang, // 저장된 언어로 초기화
          fallbackLng: 'en',
          interpolation: { escapeValue: false },
          react: { useSuspense: false },
        })
        .then(() => {
          document.documentElement.lang = savedLang;
          resolve(true);
        })
        .catch((err) => {
          console.error('i18n init failed:', err);
          resolve(false);
        });
    });
  });
};
export const i18nInstance = i18n;
```

## File: types/message.ts

```typescript
// types/message.ts
export interface ToggleContentMessage {
  type: 'TOGGLE_CONTENT';
  enabled: boolean;
}

// 향후 메시지가 늘어날 경우 유니온 타입으로 관리 가능
export type ContentScriptMessage = ToggleContentMessage; // | OtherMessageType ...
```
