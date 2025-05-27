// src/App.tsx
import { useTranslation } from 'react-i18next';
import { useLangLoader } from './i18n/useLangLoader';

export function App() {
  const { t } = useTranslation();
  const isLangLoaded = useLangLoader();

  if (!isLangLoaded) return null; // 로딩 중에는 아무것도 렌더링하지 않음

  return (
    <div>
      <h2>{t('language')}</h2>
    </div>
  );
}
