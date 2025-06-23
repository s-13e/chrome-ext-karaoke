// src/services/i18n.ts
import i18next, { InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { I18nError, ResourceLoadError } from '@my_types/errors';
import {
  DEFAULT_LANGUAGE,
  I18N_NAMESPACE,
  INITIAL_DELAY,
  MAX_RETRIES,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
} from '@constants/languages';
import { STORAGE_KEYS } from '@constants/storageKeys';
import { MESSAGE_TYPES } from '@constants/messageTypes';
import enTranslations from '@locales/en.json';
import koTranslations from '@locales/ko.json';

const resources = {
  en: { [I18N_NAMESPACE]: enTranslations },
  ko: { [I18N_NAMESPACE]: koTranslations },
};

// 1. 싱글톤 인스턴스 생성
export const i18nInstance = i18next.createInstance();

// 1. 플러그인 설정 전용 함수
const setupPlugins = () => {
  i18nInstance.use(LanguageDetector).use(initReactI18next);
};

// 2. 인스턴스 구성 함수
const configureInstance = async (lang: SupportedLanguage | null) => {
  const config: InitOptions = {
    resources, // ✅ 정적 리소스 한 번에 로딩
    detection: {
      order: ['navigator', 'htmlTag'],
      caches: [],
    },
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: { escapeValue: false },
    supportedLngs: SUPPORTED_LANGUAGES,
    react: {
      bindI18n: 'languageChanged', // 언어 변경 시 리렌더링 트리거
      bindI18nStore: '', // 스토어 바인딩 비활성화
      useSuspense: false, // Suspense 미사용
      transSupportBasicHtmlNodes: true, // 기본 HTML 노드 지원
    },
  };
  // ✅ null이 아닐 때만 lng 설정
  if (lang) {
    config.lng = lang;
  }
  // initialLang이 null이면 LanguageDetector가 자동으로 언어 감지

  await i18nInstance.init(config);
};

// 3. 스토리지 리스너 분리
const setupStorageListeners = () => {
  chrome.storage.onChanged.addListener((changes) => {
    const newLang = changes?.[STORAGE_KEYS.LANGUAGE]?.newValue;
    if (newLang && SUPPORTED_LANGUAGES.includes(newLang)) {
      i18nInstance.changeLanguage(newLang);
    }
  });
};

// 4. 초기 리소스 로드

const detectBrowserLanguage = (): Promise<SupportedLanguage> => {
  return new Promise((resolve) => {
    chrome.i18n.getAcceptLanguages((languages) => {
      console.log('[i18n] Browser languages:', languages);

      // 지원 언어 중 첫 번째 일치 항목 찾기
      for (const lang of languages) {
        const langCode = lang.split('-')[0] as SupportedLanguage;
        if (SUPPORTED_LANGUAGES.includes(langCode)) {
          console.log(`[i18n] Detected valid language: ${langCode}`);
          resolve(langCode);
          return;
        }
      }

      // 일치 없을 시 기본값 반환
      console.log('[i18n] No valid browser language, using default');
      resolve(DEFAULT_LANGUAGE);
    });
  });
};
// services/i18n.ts
const getSavedLanguage = async (): Promise<SupportedLanguage | null> => {
  return new Promise<SupportedLanguage | null>((resolve) => {
    chrome.storage.sync.get(STORAGE_KEYS.LANGUAGE, (result) => {
      const lang = result[STORAGE_KEYS.LANGUAGE];
      const isValid = lang && SUPPORTED_LANGUAGES.includes(lang);
      resolve(isValid ? lang : null);
    });
  });
};

// 2. 초기화 함수
let initializationPromise: Promise<boolean> | null = null;

export const initializeI18n = (): Promise<boolean> => {
  if (!initializationPromise) {
    initializationPromise = retryWithBackoff(async () => {
      try {
        console.log('[i18n] Initialization started');
        setupPlugins();

        // ✅ 스토리지 언어 확인 (null 허용)
        const savedLang = await getSavedLanguage();

        // ✅ 브라우저 언어 감지 (스토리지 없을 때만)
        const browserLang = savedLang ? null : await detectBrowserLanguage();
        const finalLang = savedLang || browserLang || DEFAULT_LANGUAGE;
        console.log(`[i18n] Using language: ${finalLang}`);

        // ✅ null 처리된 configureInstance 호출
        await configureInstance(finalLang);

        // ✅ 스토리지 업데이트 (신규 감지 시)
        if (!savedLang && browserLang) {
          console.log(`[i18n] Saving detected language to storage: ${browserLang}`);
          await chrome.storage.sync.set({ [STORAGE_KEYS.LANGUAGE]: browserLang });
        }

        setupStorageListeners();
        console.log('[i18n] Initialization completed successfully');
        return true;
      } catch (error) {
        if (error instanceof ResourceLoadError) {
          throw new I18nError('PERMANENT', `리소스 누락: ${error.language}`); // ✅
        }
        throw new I18nError('TRANSIENT', `초기화 실패: ${error instanceof Error ? error.message : String(error)}`);
      }
    }, isTransientError);
  }
  return initializationPromise;
};
// 1. 지수 백오프 재시도 함수 구현
const retryWithBackoff = async <T>(fn: () => Promise<T>, isRetriableError: (error: unknown) => boolean): Promise<T> => {
  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (!isRetriableError(error) || attempt >= MAX_RETRIES) throw error;
      const delay = INITIAL_DELAY * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempt++;
    }
  }
};
// 2. 재시도 가능 에러 판별 함수
const isTransientError = (error: unknown): boolean => {
  return error instanceof I18nError && error.code === 'TRANSIENT';
};

// 7. 언어 변경 핸들러 (기존과 동일)
export const syncLanguage = async (newLang: SupportedLanguage) => {
  try {
    // Chrome API로 언어 변경 처리
    await chrome.storage.sync.set({ [STORAGE_KEYS.LANGUAGE]: newLang });
    document.documentElement.lang = newLang;
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.LANGUAGE_CHANGED,
      payload: newLang,
    });
  } catch (error) {
    console.error('Language sync failed:', error);
  }
};
