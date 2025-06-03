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
