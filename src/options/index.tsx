import { createRoot } from 'react-dom/client';
import { App } from './App';
import { I18nextProvider } from 'react-i18next';
import { i18nInstance } from '@services/i18n';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@components/common/ErrorFallback';
import 'normalize.css';
// import { GlobalStyle } from '@styles/GlobalStyle';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <I18nextProvider i18n={i18nInstance}>
        <App />
      </I18nextProvider>
    </ErrorBoundary>,
  );
} else {
  console.error('Root element not found');
}
