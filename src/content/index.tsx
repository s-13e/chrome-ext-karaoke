// src/content/index.tsx
import { createRoot } from 'react-dom/client';
import { App } from './App';
import 'normalize.css';
import { i18nInstance, initializeI18n } from '@services/i18n';
import { ErrorFallback } from '@components/common/ErrorFallback';
import { I18nextProvider } from 'react-i18next';
import { ErrorBoundary } from 'react-error-boundary';

let root = document.getElementById('chrome-extension-root');
if (!root) {
  root = document.createElement('div');
  root.id = 'chrome-extension-root';
  document.body.appendChild(root);
}
const handleReset = () => {
  window.location.reload(); // 페이지 새로고침으로 초기화
};
initializeI18n()
  .then(() => {
    createRoot(root).render(
      <ErrorBoundary FallbackComponent={ErrorFallback} onReset={handleReset}>
        <I18nextProvider i18n={i18nInstance}>
          <App />
        </I18nextProvider>
      </ErrorBoundary>,
    );
  })
  .catch((error) => {
    createRoot(root).render(
      <ErrorFallback
        error={error}
        resetErrorBoundary={handleReset} // 리셋 함수 전달
      />,
    );
  });
