// src/App.tsx
//import { useTranslation } from 'react-i18next';
import { useLangLoader } from './hooks/useLangLoader';

export function App() {
  const isLangLoaded = useLangLoader();

  if (!isLangLoaded) return null;

  return null;
}
