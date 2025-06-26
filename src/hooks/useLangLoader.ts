// src/hooks/useLangLoader.ts
import { useEffect, useState } from 'react';
import { i18nInstance } from '@services/i18n';
import { I18nError } from '@lib/types/errors';

type I18nStatus = {
  phase: 'idle' | 'initializing' | 'ready' | 'error';
  error?: I18nError;
  retryCount: number;
};
export const useLangLoader = (): I18nStatus => {
  const [status, setStatus] = useState<I18nStatus>({
    phase: i18nInstance.isInitialized ? 'ready' : 'idle',
    retryCount: 0,
  });

  useEffect(() => {
    const handlers = {
      initialized: () => setStatus({ phase: 'ready', retryCount: 0 }),
      failed: (error: I18nError) =>
        setStatus((prev) => ({
          phase: 'error',
          error,
          retryCount: prev.retryCount + 1,
        })),
    };

    i18nInstance.on('initialized', handlers.initialized);
    i18nInstance.on('failed', handlers.failed);

    return () => {
      i18nInstance.off('initialized', handlers.initialized);
      i18nInstance.off('failed', handlers.failed);
    };
  }, []);

  return status;
};
