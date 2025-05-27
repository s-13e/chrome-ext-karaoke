// src/content/index.tsx
import { createRoot } from 'react-dom/client';
import { App } from './App';
import '../i18n/i18n';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<App />);
}
