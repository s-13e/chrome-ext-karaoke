import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, SupportedLanguage } from '@constants/languages';

export function useLangLoader() {
  const { i18n } = useTranslation();
  const [isLangLoaded, setIsLangLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    chrome.storage.sync.get('language', (result) => {
      const savedLang = (SUPPORTED_LANGUAGES as readonly string[]).includes(result.language)
        ? (result.language as SupportedLanguage)
        : DEFAULT_LANGUAGE;
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
